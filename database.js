const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });
const dbPath = path.join(dbDir, 'agency.db');

let db;

function prepare(sql) {
  return db.prepare(sql);
}

// 兼容 better-sqlite3 风格的简单封装
const compat = {
  prepare(sql) {
    const stmt = db.prepare(sql);
    return {
      get(...params) {
        if (params.length > 0) { stmt.bind(params); }
        const ok = stmt.step();
        if (!ok) { stmt.free(); return undefined; }
        const row = stmt.getAsObject();
        stmt.free();
        return row;
      },
      all(...params) {
        if (params.length > 0) { stmt.bind(params); }
        const rows = [];
        while (stmt.step()) rows.push(stmt.getAsObject());
        stmt.free();
        return rows;
      },
      run(...params) {
        if (params.length > 0) { stmt.bind(params); }
        stmt.step();
        stmt.free();
        const lastInsertRowid = db.exec("SELECT last_insert_rowid()")[0]?.values[0][0];
        const changes = db.getRowsModified();
        saveDb();
        return { lastInsertRowid, changes };
      }
    };
  },
  exec(sql) {
    const result = db.exec(sql);
    saveDb();
    return result;
  }
};

function saveDb() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(dbPath, buffer);
}

async function initDatabase() {
  const SQL = await initSqlJs();
  try {
    const buffer = fs.readFileSync(dbPath);
    db = new SQL.Database(buffer);
  } catch {
    db = new SQL.Database();
  }

  db.run("PRAGMA foreign_keys = ON");

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      password TEXT,
      wx_openid TEXT UNIQUE,
      nickname TEXT DEFAULT '',
      avatar TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      created_at DATETIME DEFAULT (datetime('now','+8 hours'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      type TEXT NOT NULL,
      price REAL NOT NULL,
      original_price REAL,
      specs TEXT,
      features TEXT,
      delivery_days INTEGER DEFAULT 15,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT (datetime('now','+8 hours'))
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_no TEXT UNIQUE NOT NULL,
      user_id INTEGER NOT NULL,
      package_id INTEGER,
      package_name TEXT,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'pending_payment',
      requirement TEXT DEFAULT '',
      contact_name TEXT DEFAULT '',
      contact_phone TEXT DEFAULT '',
      contact_wechat TEXT DEFAULT '',
      progress_note TEXT DEFAULT '',
      pay_time DATETIME,
      created_at DATETIME DEFAULT (datetime('now','+8 hours')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
  db.run(`
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      payment_no TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      method TEXT DEFAULT 'wechat',
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT (datetime('now','+8 hours')),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    )
  `);

  // 初始化套餐数据
  const count = compat.prepare('SELECT COUNT(*) as c FROM packages').get();
  if (count.c === 0) {
    const items = [
      ['基础版·企业官网', 'website', 'standard', 2999, 4999,
        '5页内自适应页面, 1年基础维护, 域名备案协助, 源码交付',
        '["响应式设计适配PC+手机","联系表单+在线留言","公司简介/产品展示/新闻模块","基础SEO优化","后台内容管理"]',
        10, 1],
      ['专业版·企业官网', 'website', 'professional', 6999, 9999,
        '10页内精美设计, 2年维护, 独立后台, 数据库支持',
        '["全屏动效设计","在线咨询客服系统","会员注册登录系统","产品/案例管理后台","数据统计看板","多语言支持"]',
        15, 2],
      ['旗舰版·企业官网', 'website', 'premium', 12999, 18999,
        '20页内定制设计, 3年维护, 全功能后台, 优先技术支持',
        '["定制UI/UX设计","在线支付集成","预约/报名系统","邮件/短信通知","API数据接口","VIP专属技术支持群","每年1次改版"]',
        20, 3],
      ['基础版·小程序', 'miniapp', 'standard', 3999, 5999,
        '单店版, 5个功能模块, 1年维护',
        '["展示型小程序","图文内容发布","在线客服","基础数据分析","微信支付接入"]',
        10, 4],
      ['专业版·小程序', 'miniapp', 'professional', 8999, 12999,
        '多店版, 10个功能模块, 2年维护, 管理后台',
        '["电商/预约系统","会员卡/积分系统","优惠券/营销工具","订单管理系统","数据统计大屏","分销裂变功能"]',
        15, 5],
      ['旗舰版·小程序', 'miniapp', 'premium', 16999, 24999,
        '定制开发, 不限模块, 3年维护, SaaS架构',
        '["多商户平台","直播带货功能","社区/论坛系统","AI智能推荐","多端同步(小程序+H5)","专属服务器部署","性能压测优化"]',
        25, 6],
      ['基础版·系统开发', 'system', 'standard', 9999, 14999,
        '单模块系统, 后台管理, 1个月售后',
        '["用户权限管理","数据CRUD操作","简单报表导出","接口API文档"]',
        20, 7],
      ['专业版·系统开发', 'system', 'professional', 24999, 36999,
        '多模块系统, 完整前后端, 3个月售后+培训',
        '["完整RBAC权限体系","工作流审批引擎","数据可视化大屏","文件/附件管理","消息通知系统","操作日志审计"]',
        30, 8],
      ['定制版·系统开发', 'system', 'premium', 49999, 69999,
        '全栈定制开发, 1年售后, 源码交付, 专属团队',
        '["需求分析+架构设计","高性能数据库设计","分布式部署方案","负载均衡+容灾","自动化CI/CD","安全渗透测试","运维监控告警","专属PM全程跟进"]',
        45, 9]
    ];
    const stmt = db.prepare('INSERT INTO packages (name,category,type,price,original_price,specs,features,delivery_days,sort_order) VALUES (?,?,?,?,?,?,?,?,?)');
    for (const row of items) {
      stmt.bind(row);
      stmt.step();
      stmt.reset();
    }
    saveDb();
    console.log('[DB] 套餐数据已初始化');
  }

  saveDb();
  console.log('[DB] 数据库已就绪');
}

// 导出兼容对象
module.exports = compat;
module.exports.init = initDatabase;

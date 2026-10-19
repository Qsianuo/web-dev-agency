// ========== 路由 & 应用主逻辑 ==========
let currentPage = '';
let currentUser = null;
let selectedPackage = null;
let adminAuthed = false;

// 页面配置
const PAGE_TITLES = {
  home: '首页 - 星辰科技',
  login: '登录 - 星辰科技',
  packages: '服务套餐 - 星辰科技',
  order: '在线下单 - 星辰科技',
  member: '会员中心 - 星辰科技',
  admin: '管理后台 - 星辰科技'
};

// ========== 路由 ==========
function getRoute() {
  const hash = location.hash.slice(1) || '/';
  if (hash === '/') return { page: 'home' };
  const parts = hash.split('/');
  return { page: parts[1], params: parts.slice(2) };
}

function navigate(page, params) {
  let hash = '#/' + page;
  if (params && params.length) hash += '/' + params.join('/');
  location.hash = hash;
}

// ========== 页面渲染 ==========
function renderPage(page) {
  // 更新导航高亮
  document.querySelectorAll('.nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.page === page);
  });
  // 更新标题
  document.title = PAGE_TITLES[page] || '星辰科技';

  const main = document.getElementById('mainContent');
  main.innerHTML = '<div class="loading-page"><div class="spinner"></div><p>加载中...</p></div>';

  // 检测登录状态
  checkLogin().then(() => {
    switch (page) {
      case 'home': renderHome(main); break;
      case 'login': renderLogin(main); break;
      case 'packages': renderPackages(main); break;
      case 'order': renderOrder(main); break;
      case 'member': renderMember(main); break;
      case 'admin': renderAdmin(main); break;
      default: renderHome(main);
    }
  });
}

// ========== 登录检测 ==========
async function checkLogin() {
  const res = await API.getMe();
  if (res.code === 0 && res.data.user) {
    currentUser = res.data.user;
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('memberBtn').style.display = 'inline-flex';
    document.getElementById('memberBtn').textContent = currentUser.nickname || '会员中心';
  } else {
    currentUser = null;
    document.getElementById('loginBtn').style.display = 'inline-flex';
    document.getElementById('memberBtn').style.display = 'none';
  }
}

// ========== 首页 ==========
function renderHome(main) {
  main.innerHTML = `
    <section class="hero">
      <div class="container hero-content">
        <h1 class="slide-up">专业网站定制开发服务</h1>
        <p>从企业官网到小程序，从管理系统到电商平台，我们为您打造高品质数字化产品</p>
        <div class="hero-buttons">
          <a href="#/packages" class="btn btn-primary btn-lg">查看服务套餐</a>
          <a href="#/order" class="btn btn-outline btn-lg">立即下单</a>
        </div>
        <div class="hero-stats">
          <div class="hero-stat"><div class="hero-stat-num">500+</div><div class="hero-stat-label">服务客户</div></div>
          <div class="hero-stat"><div class="hero-stat-num">99%</div><div class="hero-stat-label">客户好评</div></div>
          <div class="hero-stat"><div class="hero-stat-num">7×24</div><div class="hero-stat-label">技术支持</div></div>
        </div>
      </div>
    </section>

    <section class="section bg-white">
      <div class="container">
        <div class="section-title">
          <h2>我们的服务</h2>
          <p>提供全方位的互联网产品开发服务，助力企业数字化转型</p>
        </div>
        <div class="service-grid">
          <div class="service-card fade-in">
            <div class="service-icon" style="background:#eef1ff;color:#4f6ef7;">🌐</div>
            <h3>网站定制开发</h3>
            <p>企业官网、品牌展示站、营销落地页，响应式设计适配PC和移动端</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon" style="background:#f0fdf4;color:#2ed573;">📱</div>
            <h3>小程序开发</h3>
            <p>微信小程序、电商小程序、预约小程序，助力商家私域流量运营</p>
          </div>
          <div class="service-card fade-in">
            <div class="service-icon" style="background:#fef3e2;color:#ffa502;">⚙️</div>
            <h3>系统开发</h3>
            <p>CRM系统、OA系统、数据管理后台，全栈定制满足企业复杂需求</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>合作流程</h2>
          <p>简单四步，开启您的项目</p>
        </div>
        <div class="process-steps">
          <div class="process-step">
            <div class="step-num">1</div>
            <h4>需求沟通</h4>
            <p>了解您的需求，提供专业建议和方案</p>
          </div>
          <div class="process-step">
            <div class="step-num alt">2</div>
            <h4>选择套餐</h4>
            <p>根据需求选择合适的服务套餐并下单</p>
          </div>
          <div class="process-step">
            <div class="step-num">3</div>
            <h4>开发交付</h4>
            <p>专业团队开发，按时交付高质量产品</p>
          </div>
          <div class="process-step">
            <div class="step-num alt">4</div>
            <h4>售后维护</h4>
            <p>完善的售后保障，持续的技术支持</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section bg-white">
      <div class="container" style="text-align:center;">
        <div class="section-title">
          <h2>立即开始您的项目</h2>
          <p>填写需求表单，获取专属方案和报价</p>
        </div>
        <a href="#/order" class="btn btn-primary btn-lg">立即下单</a>
        <p style="margin-top:12px;color:var(--text-muted);font-size:14px;">已服务超过500家企业，好评率99%</p>
      </div>
    </section>
  `;
}

// ========== 登录页 ==========
function renderLogin(main) {
  if (currentUser) {
    main.innerHTML = `
      <section class="auth-section">
        <div class="auth-card" style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">👋</div>
          <h2>已登录</h2>
          <p style="color:var(--text-light);margin-bottom:24px;">欢迎回来，${currentUser.nickname || currentUser.username}</p>
          <a href="#/member" class="btn btn-primary">进入会员中心</a>
          <button class="btn btn-secondary" style="margin-left:8px;" onclick="handleLogout()">退出登录</button>
        </div>
      </section>
    `;
    return;
  }

  main.innerHTML = `
    <section class="auth-section">
      <div class="auth-card">
        <h2>登录 / 注册</h2>
        <p class="auth-subtitle">登录后即可下单和管理订单</p>

        <div class="wx-qr-section">
          <div class="wx-qr-box" id="wxQrBox">
            <div class="qr-icon">📱</div>
            <div class="qr-text">点击模拟微信扫码登录</div>
          </div>
          <div class="wx-status" id="wxStatus">点击上方二维码，演示扫码登录</div>
          <button class="btn btn-outline btn-sm" style="margin-top:12px;" onclick="simulateWechatLogin()">模拟微信扫码登录</button>
        </div>

        <div class="auth-divider">或使用账号登录</div>

        <form id="loginForm" onsubmit="return handleLogin(event)">
          <div class="form-group">
            <label>账号</label>
            <input type="text" class="form-control" id="loginUsername" placeholder="请输入账号（将自动注册）" required>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input type="password" class="form-control" id="loginPassword" placeholder="请输入密码" required>
          </div>
          <button type="submit" class="btn btn-primary btn-block btn-lg">登录 / 注册</button>
        </form>
        <p style="text-align:center;margin-top:16px;font-size:13px;color:var(--text-muted);">新账号将自动注册，请牢记账号密码</p>
      </div>
    </section>
  `;
}

// 模拟微信登录
async function simulateWechatLogin() {
  const qrBox = document.getElementById('wxQrBox');
  const status = document.getElementById('wxStatus');
  if (qrBox) qrBox.innerHTML = '<div class="spinner"></div>';
  if (status) { status.textContent = '正在扫码...'; status.className = 'wx-status'; }
  await new Promise(r => setTimeout(r, 1000));
  const res = await API.wxLogin();
  if (res.code === 0) {
    if (status) { status.textContent = '✅ 微信扫码成功，正在登录...'; status.className = 'wx-status success'; }
    showSuccess('微信登录成功');
    setTimeout(() => navigate('member'), 800);
  } else {
    if (status) status.textContent = '❌ 登录失败，请重试';
    if (qrBox) { qrBox.innerHTML = '<div class="qr-icon">📱</div><div class="qr-text">点击模拟微信扫码登录</div>'; }
  }
}

// 账号登录
async function handleLogin(e) {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value.trim();
  if (!username || !password) { showError('请填写账号和密码'); return false; }
  const res = await API.login(username, password);
  if (res.code === 0) {
    currentUser = res.data.user;
    showSuccess('登录成功');
    navigate('member');
  } else {
    showError(res.msg);
  }
  return false;
}

// 退出登录
async function handleLogout() {
  await API.logout();
  currentUser = null;
  showSuccess('已退出登录');
  navigate('home');
}

// ========== 套餐页 ==========
let currentCategory = 'website';

async function renderPackages(main) {
  main.innerHTML = `
    <section class="section">
      <div class="container">
        <div class="section-title">
          <h2>服务套餐</h2>
          <p>选择适合您的套餐，开启数字化之旅</p>
        </div>
        <div class="tab-bar">
          <div class="tab-item ${currentCategory === 'website' ? 'active' : ''}" onclick="switchCategory('website')">企业官网</div>
          <div class="tab-item ${currentCategory === 'miniapp' ? 'active' : ''}" onclick="switchCategory('miniapp')">小程序</div>
          <div class="tab-item ${currentCategory === 'system' ? 'active' : ''}" onclick="switchCategory('system')">系统开发</div>
        </div>
        <div id="packageList" style="min-height:200px;">
          <div class="loading-page"><div class="spinner"></div><p>加载套餐中...</p></div>
        </div>
      </div>
    </section>
  `;
  await loadPackages(currentCategory);
}

async function switchCategory(cat) {
  currentCategory = cat;
  document.querySelectorAll('.tab-item').forEach(el => {
    el.classList.toggle('active', el.textContent.includes(
      cat === 'website' ? '企业官网' : cat === 'miniapp' ? '小程序' : '系统开发'
    ));
  });
  document.getElementById('packageList').innerHTML = '<div class="loading-page"><div class="spinner"></div><p>加载中...</p></div>';
  await loadPackages(cat);
}

async function loadPackages(category) {
  const res = await API.getPackages(category);
  const container = document.getElementById('packageList');
  if (res.code !== 0 || !res.data.packages.length) {
    container.innerHTML = '<div class="empty-state"><p>暂无套餐数据</p></div>';
    return;
  }
  const CAT_NAMES = { website: '企业官网', miniapp: '小程序', system: '系统开发' };
  const list = res.data.packages;
  container.innerHTML = `<div class="package-grid">${list.map((pkg, i) => renderPackageCard(pkg, i === 1)).join('')}</div>`;
}

function renderPackageCard(pkg, popular) {
  const features = Array.isArray(pkg.features) ? pkg.features : [];
  return `
    <div class="package-card ${popular ? 'popular' : ''}">
      ${popular ? '<div class="package-badge">🔥 最受欢迎</div>' : ''}
      <div class="package-header">
        <div class="package-name">${pkg.name}</div>
        <div class="package-price">¥${pkg.price}${pkg.original_price ? `<span>¥${pkg.original_price}</span>` : ''}</div>
        <div class="package-specs">${pkg.specs || ''}</div>
      </div>
      <div class="package-body">
        <ul class="package-features">
          ${features.map(f => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div class="package-footer">
        <button class="btn btn-primary btn-block" onclick="selectPackage(${pkg.id})">选择套餐</button>
      </div>
    </div>
  `;
}

function selectPackage(id) {
  selectedPackage = id;
  if (!currentUser) {
    showWarning('请先登录后再下单');
    navigate('login');
    return;
  }
  navigate('order');
}

// ========== 下单页 ==========
async function renderOrder(main) {
  if (!currentUser) {
    main.innerHTML = `
      <section class="auth-section">
        <div class="auth-card" style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🔒</div>
          <h2>请先登录</h2>
          <p style="color:var(--text-light);margin:16px 0;">下单前需要登录您的账号</p>
          <a href="#/login" class="btn btn-primary">去登录</a>
        </div>
      </section>
    `;
    return;
  }

  const res = await API.getPackages();
  const packages = res.code === 0 ? res.data.packages : [];

  main.innerHTML = `
    <section class="order-section">
      <div class="container">
        <div class="section-title" style="margin-bottom:32px;">
          <h2>在线下单</h2>
          <p>选择套餐并提交您的需求</p>
        </div>
        <div class="order-layout">
          <div class="order-form-area">
            <div class="card">
              <div class="card-body">
                <form id="orderForm" onsubmit="return handleCreateOrder(event)">
                  <div class="form-group">
                    <label>选择套餐</label>
                    <select class="form-control" id="orderPackage" onchange="updateOrderSummary()">
                      <option value="">—— 请选择套餐 ——</option>
                      ${packages.map(p => `<option value="${p.id}" ${selectedPackage == p.id ? 'selected' : ''}>${p.name} - ¥${p.price}</option>`).join('')}
                    </select>
                  </div>
                  <div class="form-group">
                    <label>联系人姓名</label>
                    <input type="text" class="form-control" id="orderName" placeholder="请输入联系人姓名" required>
                  </div>
                  <div class="form-group">
                    <label>联系电话</label>
                    <input type="tel" class="form-control" id="orderPhone" placeholder="请输入手机号" required>
                  </div>
                  <div class="form-group">
                    <label>联系微信</label>
                    <input type="text" class="form-control" id="orderWechat" placeholder="微信号（选填）">
                  </div>
                  <div class="form-group">
                    <label>需求描述</label>
                    <textarea class="form-control" id="orderRequirement" placeholder="请详细描述您的项目需求，包括功能要求、设计风格、预算范围等"></textarea>
                    <div class="form-tip">详细的需求描述有助于我们为您提供更准确的方案</div>
                  </div>
                  <button type="submit" class="btn btn-primary btn-block btn-lg">提交订单并支付</button>
                </form>
              </div>
            </div>
          </div>
          <div>
            <div class="order-summary-card" id="orderSummary">
              <h3>订单摘要</h3>
              <div id="summaryContent">
                <p style="color:var(--text-muted);font-size:14px;">请先选择套餐</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  `;
  updateOrderSummary();
}

async function updateOrderSummary() {
  const sel = document.getElementById('orderPackage');
  const id = sel.value;
  if (!id) {
    document.getElementById('summaryContent').innerHTML = '<p style="color:var(--text-muted);font-size:14px;">请先选择套餐</p>';
    return;
  }
  const res = await API.getPackage(id);
  if (res.code !== 0) return;
  const pkg = res.data.package;
  document.getElementById('summaryContent').innerHTML = `
    <div class="order-summary-item"><span>套餐</span><span>${pkg.name}</span></div>
    <div class="order-summary-item"><span>交付周期</span><span>${pkg.delivery_days || 15}个工作日</span></div>
    <div class="order-summary-item"><span>规格</span><span style="text-align:right;max-width:200px;">${pkg.specs || ''}</span></div>
    <div class="order-total"><span>总计</span><span class="amount">¥${pkg.price}</span></div>
  `;
}

async function handleCreateOrder(e) {
  e.preventDefault();
  const packageId = document.getElementById('orderPackage').value;
  if (!packageId) { showError('请选择套餐'); return false; }

  const data = {
    package_id: parseInt(packageId),
    contact_name: document.getElementById('orderName').value.trim(),
    contact_phone: document.getElementById('orderPhone').value.trim(),
    contact_wechat: document.getElementById('orderWechat').value.trim(),
    requirement: document.getElementById('orderRequirement').value.trim()
  };
  if (!data.contact_name || !data.contact_phone) { showError('请填写联系信息'); return false; }

  // 创建订单
  const orderRes = await API.createOrder(data);
  if (orderRes.code !== 0) { showError(orderRes.msg); return false; }

  const order = orderRes.data.order;

  // 模拟支付
  const payRes = await API.payOrder({ order_id: order.id, method: 'wechat' });
  if (payRes.code !== 0) { showError(payRes.msg); return false; }

  showSuccess('🎉 下单并支付成功！');
  selectedPackage = null;
  setTimeout(() => navigate('member'), 1200);
  return false;
}

// ========== 会员中心 ==========
async function renderMember(main) {
  if (!currentUser) {
    main.innerHTML = `
      <section class="auth-section">
        <div class="auth-card" style="text-align:center;">
          <div style="font-size:48px;margin-bottom:16px;">🔒</div>
          <h2>请先登录</h2>
          <p style="color:var(--text-light);margin:16px 0;">登录后即可查看订单和会员信息</p>
          <a href="#/login" class="btn btn-primary">去登录</a>
        </div>
      </section>
    `;
    return;
  }

  const orderRes = await API.getMyOrders();
  const orders = orderRes.code === 0 ? orderRes.data.orders : [];

  main.innerHTML = `
    <section class="member-section">
      <div class="container">
        <div class="member-layout">
          <div class="member-sidebar">
            <div class="member-avatar">${(currentUser.nickname || 'U')[0]}</div>
            <div class="member-name">${currentUser.nickname || currentUser.username}</div>
            <div class="member-role">${currentUser.wx_openid ? '微信用户' : '注册用户'}</div>
            <hr style="border:none;border-top:1px solid var(--border);margin:16px 0;">
            <div class="member-nav">
              <div class="member-nav-item active" onclick="switchMemberTab('orders')">📋 我的订单</div>
              <div class="member-nav-item" onclick="switchMemberTab('profile')">👤 个人资料</div>
              <div class="member-nav-item" onclick="handleLogout()">🚪 退出登录</div>
            </div>
          </div>
          <div class="member-content" id="memberContent">
            ${renderOrdersList(orders)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function switchMemberTab(tab) {
  document.querySelectorAll('.member-nav-item').forEach(el => el.classList.toggle('active', el.textContent.includes(tab === 'orders' ? '订单' : '资料')));
  if (tab === 'orders') {
    renderMemberOrders();
  } else {
    renderMemberProfile();
  }
}

async function renderMemberOrders() {
  const container = document.getElementById('memberContent');
  const res = await API.getMyOrders();
  const orders = res.code === 0 ? res.data.orders : [];
  container.innerHTML = renderOrdersList(orders);
}

function renderOrdersList(orders) {
  if (!orders.length) {
    return `
      <h3 style="margin-bottom:16px;">我的订单</h3>
      <div class="empty-state">
        <div style="font-size:48px;margin-bottom:16px;">📦</div>
        <p>暂无订单</p>
        <a href="#/packages" class="btn btn-primary" style="margin-top:16px;">去选购套餐</a>
      </div>
    `;
  }
  const STATUS_MAP = {
    pending_payment: '<span class="badge badge-pending">待支付</span>',
    paid: '<span class="badge badge-paid">已支付</span>',
    processing: '<span class="badge badge-processing">制作中</span>',
    completed: '<span class="badge badge-completed">已完成</span>',
    cancelled: '<span class="badge badge-cancelled">已取消</span>'
  };
  return `
    <h3 style="margin-bottom:16px;">我的订单 (${orders.length})</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>套餐</th>
            <th>金额</th>
            <th>状态</th>
            <th>进度</th>
            <th>下单时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td style="font-family:monospace;font-size:12px;">${o.order_no}</td>
              <td>${o.package_name}</td>
              <td>¥${o.amount}</td>
              <td>${STATUS_MAP[o.status] || '<span class="badge badge-pending">' + o.status + '</span>'}</td>
              <td style="max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${o.progress_note || ''}">${o.progress_note || '-'}</td>
              <td style="font-size:12px;color:var(--text-light);">${o.created_at || ''}</td>
              <td><button class="btn btn-sm btn-secondary" onclick="viewOrderDetail(${o.id})">详情</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function viewOrderDetail(id) {
  const res = await API.getOrder(id);
  if (res.code !== 0) { showError(res.msg); return; }
  const o = res.data.order;
  const STATUS_MAP = {
    pending_payment: '待支付', paid: '已支付', processing: '制作中',
    completed: '已完成', cancelled: '已取消'
  };
  openModal('订单详情', `
    <div style="display:grid;gap:12px;font-size:14px;">
      <div><strong>订单号：</strong><span style="font-family:monospace;">${o.order_no}</span></div>
      <div><strong>套餐：</strong>${o.package_name}</div>
      <div><strong>金额：</strong>¥${o.amount}</div>
      <div><strong>状态：</strong>${STATUS_MAP[o.status] || o.status}</div>
      <div><strong>联系人：</strong>${o.contact_name || '-'}</div>
      <div><strong>联系电话：</strong>${o.contact_phone || '-'}</div>
      <div><strong>联系微信：</strong>${o.contact_wechat || '-'}</div>
      <div><strong>需求描述：</strong>${o.requirement || '未提交'}</div>
      <div><strong>进度跟进：</strong>${o.progress_note || '暂无'}</div>
      <div><strong>下单时间：</strong>${o.created_at || '-'}</div>
      ${o.pay_time ? `<div><strong>支付时间：</strong>${o.pay_time}</div>` : ''}
    </div>
  `);
}

function renderMemberProfile() {
  const container = document.getElementById('memberContent');
  container.innerHTML = `
    <h3 style="margin-bottom:16px;">个人资料</h3>
    <form onsubmit="return handleUpdateProfile(event)" style="max-width:400px;">
      <div class="form-group">
        <label>昵称</label>
        <input type="text" class="form-control" id="profileNickname" value="${currentUser.nickname || ''}" placeholder="设置昵称">
      </div>
      <div class="form-group">
        <label>手机号</label>
        <input type="tel" class="form-control" id="profilePhone" value="${currentUser.phone || ''}" placeholder="手机号">
      </div>
      <div class="form-group">
        <label>账号</label>
        <input type="text" class="form-control" value="${currentUser.username || ''}" disabled style="opacity:0.6;">
      </div>
      ${currentUser.wx_openid ? `<div class="form-group"><label>已绑定微信</label><div style="padding:8px 0;color:var(--success);">✅ 微信已绑定</div></div>` : ''}
      <button type="submit" class="btn btn-primary">保存修改</button>
    </form>
  `;
}

async function handleUpdateProfile(e) {
  e.preventDefault();
  const nickname = document.getElementById('profileNickname').value.trim();
  const phone = document.getElementById('profilePhone').value.trim();
  const res = await API.updateProfile({ nickname, phone });
  if (res.code === 0) {
    currentUser.nickname = nickname;
    showSuccess('保存成功');
  } else {
    showError(res.msg);
  }
  return false;
}

// ========== 管理后台 ==========
async function renderAdmin(main) {
  // 先检测后台登录状态
  const checkRes = await API.adminCheck();
  adminAuthed = checkRes.code === 0 && checkRes.data.loggedIn;

  if (!adminAuthed) {
    main.innerHTML = `
      <section class="auth-section">
        <div class="auth-card">
          <h2>管理后台</h2>
          <p class="auth-subtitle">管理员登录</p>
          <form onsubmit="return handleAdminLogin(event)">
            <div class="form-group">
              <label>管理员账号</label>
              <input type="text" class="form-control" id="adminUsername" placeholder="admin" required>
            </div>
            <div class="form-group">
              <label>密码</label>
              <input type="password" class="form-control" id="adminPassword" placeholder="admin123" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg">登录后台</button>
          </form>
        </div>
      </section>
    `;
    return;
  }

  renderAdminDashboard(main);
}

async function handleAdminLogin(e) {
  e.preventDefault();
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value.trim();
  const res = await API.adminLogin(username, password);
  if (res.code === 0) {
    adminAuthed = true;
    showSuccess('登录成功');
    navigate('admin');
  } else {
    showError(res.msg);
  }
  return false;
}

async function renderAdminDashboard(main) {
  const statsRes = await API.getAdminStats();
  const stats = statsRes.code === 0 ? statsRes.data : {};

  main.innerHTML = `
    <section class="admin-section">
      <div class="container">
        <div class="admin-layout">
          <div class="admin-sidebar">
            <h4>管理后台</h4>
            <div class="member-nav">
              <div class="member-nav-item active" onclick="switchAdminTab('dashboard')">📊 数据概览</div>
              <div class="member-nav-item" onclick="switchAdminTab('orders')">📋 订单管理</div>
              <div class="member-nav-item" onclick="switchAdminTab('users')">👥 用户管理</div>
              <div class="member-nav-item" onclick="handleAdminLogout()">🚪 退出管理</div>
            </div>
          </div>
          <div class="admin-content" id="adminContent">
            ${renderAdminStats(stats)}
          </div>
        </div>
      </div>
    </section>
  `;
}

function renderAdminStats(stats) {
  return `
    <h3 style="margin-bottom:24px;">数据概览</h3>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">${stats.totalOrders || 0}</div><div class="stat-label">总订单</div></div>
      <div class="stat-card"><div class="stat-number">¥${stats.totalRevenue || 0}</div><div class="stat-label">总收入</div></div>
      <div class="stat-card"><div class="stat-number">${stats.pendingOrders || 0}</div><div class="stat-label">待支付</div></div>
      <div class="stat-card"><div class="stat-number">${stats.completed || 0}</div><div class="stat-label">已完成</div></div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-number">${stats.inProgress || 0}</div><div class="stat-label">制作中</div></div>
      <div class="stat-card"><div class="stat-number">${stats.totalUsers || 0}</div><div class="stat-label">注册用户</div></div>
    </div>
  `;
}

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-sidebar .member-nav-item').forEach(el => {
    el.classList.toggle('active', el.textContent.includes(
      tab === 'dashboard' ? '概览' : tab === 'orders' ? '订单' : '用户'
    ));
  });
  if (tab === 'dashboard') {
    renderAdminDashboardData();
  } else if (tab === 'orders') {
    renderAdminOrders();
  } else {
    renderAdminUsers();
  }
}

async function renderAdminDashboardData() {
  const container = document.getElementById('adminContent');
  const res = await API.getAdminStats();
  container.innerHTML = renderAdminStats(res.code === 0 ? res.data : {});
}

async function renderAdminOrders() {
  const container = document.getElementById('adminContent');
  const filterHtml = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:8px;">
      <h3>订单管理</h3>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <select class="form-control" id="orderFilter" onchange="loadAdminOrders()" style="width:auto;">
          <option value="all">全部订单</option>
          <option value="pending_payment">待支付</option>
          <option value="paid">已支付</option>
          <option value="processing">制作中</option>
          <option value="completed">已完成</option>
        </select>
      </div>
    </div>
    <div id="adminOrderList"><div class="loading-page"><div class="spinner"></div></div></div>
  `;
  container.innerHTML = filterHtml;
  await loadAdminOrders();
}

async function loadAdminOrders() {
  const sel = document.getElementById('orderFilter');
  const status = sel ? sel.value : 'all';
  const res = await API.getAdminOrders(status);
  const list = document.getElementById('adminOrderList');
  if (res.code !== 0) { list.innerHTML = '<p>加载失败</p>'; return; }

  const orders = res.data.orders;
  if (!orders.length) {
    list.innerHTML = '<div class="empty-state"><p>暂无订单</p></div>';
    return;
  }

  const STATUS_MAP = {
    pending_payment: '<span class="badge badge-pending">待支付</span>',
    paid: '<span class="badge badge-paid">已支付</span>',
    processing: '<span class="badge badge-processing">制作中</span>',
    completed: '<span class="badge badge-completed">已完成</span>',
    cancelled: '<span class="badge badge-cancelled">已取消</span>'
  };

  list.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>客户</th>
            <th>套餐</th>
            <th>金额</th>
            <th>状态</th>
            <th>联系人</th>
            <th>时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(o => `
            <tr>
              <td style="font-family:monospace;font-size:12px;">${o.order_no}</td>
              <td>${o.user_name || '-'}</td>
              <td>${o.package_name}</td>
              <td>¥${o.amount}</td>
              <td>${STATUS_MAP[o.status] || o.status}</td>
              <td>${o.contact_name || '-'}</td>
              <td style="font-size:12px;">${o.created_at || ''}</td>
              <td><button class="btn btn-sm btn-primary" onclick="showAdminOrderEdit(${o.id})">处理</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function showAdminOrderEdit(id) {
  const res = await API.getAdminOrders('all');
  const order = res.code === 0 ? res.data.orders.find(o => o.id === id) : null;
  if (!order) { showError('订单不存在'); return; }

  const STATUS_OPTS = ['pending_payment', 'paid', 'processing', 'completed', 'cancelled'];
  const STATUS_NAMES = { pending_payment: '待支付', paid: '已支付', processing: '制作中', completed: '已完成', cancelled: '已取消' };

  openModal('处理订单 #' + order.order_no, `
    <div style="display:grid;gap:16px;">
      <div class="form-group">
        <label>当前状态：${STATUS_NAMES[order.status] || order.status}</label>
        <select class="form-control" id="editOrderStatus">
          ${STATUS_OPTS.map(s => `<option value="${s}" ${s === order.status ? 'selected' : ''}>${STATUS_NAMES[s]}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>进度备注</label>
        <textarea class="form-control" id="editOrderProgress" rows="4">${order.progress_note || ''}</textarea>
      </div>
      <div class="form-group">
        <label>客户需求</label>
        <div style="padding:10px 14px;background:var(--bg);border-radius:var(--radius-sm);font-size:14px;min-height:40px;">${order.requirement || '未提交'}</div>
      </div>
      <div class="form-group">
        <label>联系方式</label>
        <div style="font-size:14px;">${order.contact_name || '-'} / ${order.contact_phone || '-'} / ${order.contact_wechat || '-'}</div>
      </div>
      <button class="btn btn-primary btn-block" onclick="submitOrderEdit(${order.id})">保存修改</button>
    </div>
  `);
}

async function submitOrderEdit(id) {
  const status = document.getElementById('editOrderStatus').value;
  const progress = document.getElementById('editOrderProgress').value.trim();
  const res = await API.updateAdminOrder(id, { status, progress_note: progress });
  if (res.code === 0) {
    showSuccess('更新成功');
    closeModal();
    loadAdminOrders();
  } else {
    showError(res.msg);
  }
}

async function renderAdminUsers() {
  const container = document.getElementById('adminContent');
  const res = await API.getAdminUsers();
  const users = res.code === 0 ? res.data.users : [];
  container.innerHTML = `
    <h3 style="margin-bottom:16px;">用户管理 (${users.length})</h3>
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>账号</th>
            <th>昵称</th>
            <th>手机</th>
            <th>注册时间</th>
          </tr>
        </thead>
        <tbody>
          ${users.map(u => `
            <tr>
              <td>${u.id}</td>
              <td>${u.username || '-'}</td>
              <td>${u.nickname || '-'}</td>
              <td>${u.phone || '-'}</td>
              <td style="font-size:12px;">${u.created_at || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function handleAdminLogout() {
  await API.adminLogout();
  adminAuthed = false;
  showSuccess('已退出管理后台');
  navigate('home');
}

// ========== 路由初始化 ==========
function initRouter() {
  const handleRoute = () => {
    const route = getRoute();
    if (route.page !== currentPage) {
      currentPage = route.page;
      renderPage(route.page);
    }
  };
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

// 导航切换（移动端）
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('navToggle').addEventListener('click', () => {
    document.getElementById('navMenu').classList.toggle('show');
  });
  // 点击导航链接关闭菜单
  document.querySelectorAll('.nav-link').forEach(el => {
    el.addEventListener('click', () => {
      document.getElementById('navMenu').classList.remove('show');
    });
  });
  initRouter();
});

const express = require('express');
const router = express.Router();
const db = require('../database');

// 管理员登录（无需认证）
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'admin123') {
    req.session.adminAuth = { username, role: 'admin' };
    return res.json({ code: 0, msg: '登录成功' });
  }
  res.json({ code: 1, msg: '账号或密码错误' });
});

router.post('/logout', (req, res) => {
  delete req.session.adminAuth;
  res.json({ code: 0, msg: '已退出' });
});

router.get('/check', (req, res) => {
  res.json({ code: 0, data: { loggedIn: !!req.session.adminAuth } });
});

// 以下路由需要管理员认证
router.use((req, res, next) => {
  const auth = req.session.adminAuth;
  if (!auth) return res.json({ code: 1, msg: '请先登录管理后台' });
  next();
});

// 订单列表（所有）
router.get('/orders', (req, res) => {
  const { status } = req.query;
  let list;
  if (status && status !== 'all') {
    list = db.prepare(`SELECT o.*, u.nickname as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.status = ? ORDER BY o.created_at DESC`).all(status);
  } else {
    list = db.prepare(`SELECT o.*, u.nickname as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`).all();
  }
  res.json({ code: 0, data: { orders: list } });
});

// 更新订单状态/进度
router.put('/orders/:id', (req, res) => {
  const { status, progress_note } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
  if (!order) return res.json({ code: 1, msg: '订单不存在' });

  if (status) {
    db.prepare('UPDATE orders SET status=? WHERE id=?').run(status, req.params.id);
  }
  if (progress_note !== undefined) {
    db.prepare('UPDATE orders SET progress_note=? WHERE id=?').run(progress_note, req.params.id);
  }
  const updated = db.prepare('SELECT o.*, u.nickname as user_name FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE o.id = ?').get(req.params.id);
  res.json({ code: 0, data: { order: updated }, msg: '更新成功' });
});

// 数据统计概览
router.get('/stats', (req, res) => {
  const totalOrders = db.prepare('SELECT COUNT(*) as c FROM orders').get().c;
  const totalRevenue = db.prepare("SELECT IFNULL(SUM(amount),0) as s FROM orders WHERE status != 'pending_payment'").get().s;
  const pendingOrders = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'pending_payment'").get().c;
  const inProgress = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status IN ('paid','processing')").get().c;
  const completed = db.prepare("SELECT COUNT(*) as c FROM orders WHERE status = 'completed'").get().c;
  const totalUsers = db.prepare('SELECT COUNT(*) as c FROM users').get().c;
  res.json({
    code: 0, data: {
      totalOrders, totalRevenue: totalRevenue.toFixed(2),
      pendingOrders, inProgress, completed, totalUsers
    }
  });
});

// 用户列表
router.get('/users', (req, res) => {
  const list = db.prepare('SELECT id,username,nickname,phone,created_at FROM users ORDER BY created_at DESC').all();
  res.json({ code: 0, data: { users: list } });
});

module.exports = router;

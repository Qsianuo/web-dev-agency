const express = require('express');
const router = express.Router();
const db = require('../database');
const uuid = require('uuid');

// 创建订单
router.post('/create', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '请先登录' });
  const { package_id, contact_name, contact_phone, contact_wechat, requirement } = req.body;
  if (!package_id) return res.json({ code: 1, msg: '请选择套餐' });

  const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(package_id);
  if (!pkg) return res.json({ code: 1, msg: '套餐不存在' });

  const orderNo = 'ORD' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 6).toUpperCase();
  const info = db.prepare(
    'INSERT INTO orders (order_no,user_id,package_id,package_name,amount,contact_name,contact_phone,contact_wechat,requirement) VALUES (?,?,?,?,?,?,?,?,?)'
  ).run(orderNo, req.session.userId, package_id, pkg.name, pkg.price,
    contact_name || '', contact_phone || '', contact_wechat || '', requirement || '');

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(info.lastInsertRowid);
  res.json({ code: 0, data: { order }, msg: '订单创建成功' });
});

// 创建支付（模拟）
router.post('/pay', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '请先登录' });
  const { order_id, method } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.session.userId);
  if (!order) return res.json({ code: 1, msg: '订单不存在' });
  if (order.status !== 'pending_payment') return res.json({ code: 1, msg: '订单状态不允许支付' });

  const paymentNo = 'PAY' + Date.now().toString(36).toUpperCase() + uuid.v4().slice(0, 6).toUpperCase();
  db.prepare('INSERT INTO payments (order_id,payment_no,amount,method,status) VALUES (?,?,?,?,?)')
    .run(order_id, paymentNo, order.amount, method || 'wechat', 'success');
  db.prepare("UPDATE orders SET status='paid', pay_time=datetime('now','+8 hours') WHERE id=?")
    .run(order_id);

  const updated = db.prepare('SELECT * FROM orders WHERE id = ?').get(order_id);
  res.json({ code: 0, data: { order: updated, payment_no: paymentNo }, msg: '支付成功' });
});

// 获取我的订单列表
router.get('/my', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '请先登录' });
  const list = db.prepare('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC').all(req.session.userId);
  res.json({ code: 0, data: { orders: list } });
});

// 获取订单详情
router.get('/:id', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '请先登录' });
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(req.params.id, req.session.userId);
  if (!order) return res.json({ code: 1, msg: '订单不存在' });
  const payment = db.prepare('SELECT * FROM payments WHERE order_id = ?').all(order.id);
  res.json({ code: 0, data: { order, payments: payment } });
});

// 提交/更新需求
router.put('/requirement', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '请先登录' });
  const { order_id, requirement } = req.body;
  const order = db.prepare('SELECT * FROM orders WHERE id = ? AND user_id = ?').get(order_id, req.session.userId);
  if (!order) return res.json({ code: 1, msg: '订单不存在' });
  db.prepare('UPDATE orders SET requirement=? WHERE id=?').run(requirement || '', order_id);
  res.json({ code: 0, msg: '需求已提交' });
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../database');
const uuid = require('uuid');

// 微信扫码登录 - 获取二维码
router.get('/wx/qrcode', (req, res) => {
  const token = uuid.v4().slice(0, 8);
  req.session.wx_state = token;
  res.json({
    code: 0,
    data: {
      qrcode_id: token,
      qrcode_url: '/api/auth/wx/qrcode_img',
      tips: '请使用微信扫描二维码登录（演示模式）'
    },
    msg: 'ok'
  });
});

// 模拟微信扫码回调（演示用：扫码即登录）
router.post('/wx/callback', (req, res) => {
  const { state, openid } = req.body;
  const mockOpenid = openid || 'wx_' + uuid.v4().slice(0, 12);
  let user = db.prepare('SELECT * FROM users WHERE wx_openid = ?').get(mockOpenid);
  if (!user) {
    const info = db.prepare('INSERT INTO users (wx_openid,nickname,avatar) VALUES (?,?,?)')
      .run(mockOpenid, '微信用户_' + mockOpenid.slice(-4), '');
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  }
  req.session.userId = user.id;
  req.session.user = { id: user.id, username: user.username, nickname: user.nickname, wx_openid: user.wx_openid };
  res.json({ code: 0, data: { user: req.session.user }, msg: '登录成功' });
});

// 模拟微信扫码状态轮询（演示用：返回已扫码）
router.get('/wx/check/:state', (req, res) => {
  const mockOpenid = 'wx_' + uuid.v4().slice(0, 12);
  let user = db.prepare('SELECT * FROM users WHERE wx_openid = ?').get(mockOpenid);
  if (!user) {
    db.prepare('INSERT INTO users (wx_openid) VALUES (?)').run(mockOpenid);
    user = db.prepare('SELECT * FROM users WHERE wx_openid = ?').get(mockOpenid);
  }
  req.session.userId = user.id;
  req.session.user = { id: user.id, username: user.username, nickname: user.nickname, wx_openid: user.wx_openid };
  res.json({
    code: 0,
    data: { scanned: true, user: { id: user.id, nickname: '用户' + user.id } },
    msg: '扫码成功'
  });
});

// 账号密码登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.json({ code: 1, msg: '请输入账号和密码' });
  }
  let user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    const info = db.prepare('INSERT INTO users (username,password,nickname) VALUES (?,?,?)')
      .run(username, password, '用户_' + username);
    user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  } else if (user.password !== password) {
    return res.json({ code: 1, msg: '密码错误' });
  }
  req.session.userId = user.id;
  req.session.user = { id: user.id, username: user.username, nickname: user.nickname };
  res.json({ code: 0, data: { user: req.session.user }, msg: '登录成功' });
});

// 注册
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.json({ code: 1, msg: '请填写完整信息' });
  const exists = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (exists) return res.json({ code: 1, msg: '账号已存在' });
  const info = db.prepare('INSERT INTO users (username,password,nickname) VALUES (?,?,?)')
    .run(username, password, '用户_' + username);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  req.session.userId = user.id;
  req.session.user = { id: user.id, username: user.username, nickname: user.nickname };
  res.json({ code: 0, data: { user: req.session.user }, msg: '注册成功' });
});

// 退出登录
router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ code: 0, msg: '已退出' });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '未登录' });
  const user = db.prepare('SELECT id,username,nickname,avatar,phone,wx_openid,created_at FROM users WHERE id = ?').get(req.session.userId);
  res.json({ code: 0, data: { user } });
});

// 更新个人资料
router.put('/profile', (req, res) => {
  if (!req.session.userId) return res.json({ code: 1, msg: '未登录' });
  const { nickname, phone } = req.body;
  db.prepare('UPDATE users SET nickname=?, phone=? WHERE id=?')
    .run(nickname || '', phone || '', req.session.userId);
  res.json({ code: 0, msg: '更新成功' });
});

module.exports = router;

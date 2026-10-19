const express = require('express');
const router = express.Router();
const db = require('../database');

// 获取所有套餐
router.get('/', (req, res) => {
  const { category } = req.query;
  let list;
  if (category) {
    list = db.prepare('SELECT * FROM packages WHERE category = ? ORDER BY sort_order').all(category);
  } else {
    list = db.prepare('SELECT * FROM packages ORDER BY sort_order').all();
  }
  list.forEach(p => {
    if (typeof p.features === 'string') {
      try { p.features = JSON.parse(p.features); } catch(e) { p.features = []; }
    }
  });
  res.json({ code: 0, data: { packages: list } });
});

// 获取单个套餐详情
router.get('/:id', (req, res) => {
  const pkg = db.prepare('SELECT * FROM packages WHERE id = ?').get(req.params.id);
  if (!pkg) return res.json({ code: 1, msg: '套餐不存在' });
  if (typeof pkg.features === 'string') {
    try { pkg.features = JSON.parse(pkg.features); } catch(e) { pkg.features = []; }
  }
  res.json({ code: 0, data: { package: pkg } });
});

module.exports = router;

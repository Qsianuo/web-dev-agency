// ========== API 通信层 ==========
const API = {
  base: '/api',

  async request(method, path, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (data && method !== 'GET') opts.body = JSON.stringify(data);
    try {
      const res = await fetch(this.base + path, opts);
      return await res.json();
    } catch (err) {
      console.error('[API]', method, path, err);
      return { code: 1, msg: '网络请求失败，请检查网络连接' };
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, data) { return this.request('POST', path, data); },
  put(path, data) { return this.request('PUT', path, data); },

  // 认证
  login(username, password) { return this.post('/auth/login', { username, password }); },
  register(username, password) { return this.post('/auth/register', { username, password }); },
  logout() { return this.post('/auth/logout'); },
  getMe() { return this.get('/auth/me'); },
  updateProfile(data) { return this.put('/auth/profile', data); },
  wxCheck(state) { return this.get('/auth/wx/check/' + state); },
  wxLogin(openid) { return this.post('/auth/wx/callback', { openid }); },

  // 套餐
  getPackages(category) {
    const q = category ? '?category=' + category : '';
    return this.get('/packages' + q);
  },
  getPackage(id) { return this.get('/packages/' + id); },

  // 订单
  createOrder(data) { return this.post('/orders/create', data); },
  payOrder(data) { return this.post('/orders/pay', data); },
  getMyOrders() { return this.get('/orders/my'); },
  getOrder(id) { return this.get('/orders/' + id); },
  submitRequirement(data) { return this.put('/orders/requirement', data); },

  // 管理后台
  adminLogin(username, password) { return this.post('/admin/login', { username, password }); },
  adminLogout() { return this.post('/admin/logout'); },
  adminCheck() { return this.get('/admin/check'); },
  getAdminOrders(status) {
    const q = status ? '?status=' + status : '';
    return this.get('/admin/orders' + q);
  },
  updateAdminOrder(id, data) { return this.put('/admin/orders/' + id, data); },
  getAdminStats() { return this.get('/admin/stats'); },
  getAdminUsers() { return this.get('/admin/users'); }
};

// ========== Toast 提示 ==========
function showToast(msg, type) {
  const container = document.getElementById('toastContainer');
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity 0.3s'; setTimeout(() => el.remove(), 300); }, 3000);
}

function showSuccess(msg) { showToast(msg || '操作成功', 'success'); }
function showError(msg) { showToast(msg || '操作失败', 'error'); }
function showWarning(msg) { showToast(msg, 'warning'); }

// ========== Modal ==========
function openModal(title, bodyHtml) {
  document.getElementById('modalTitle').textContent = title || '提示';
  document.getElementById('modalBody').innerHTML = bodyHtml || '';
  document.getElementById('modalOverlay').style.display = 'flex';
}
function closeModal() {
  document.getElementById('modalOverlay').style.display = 'none';
}
// 点击遮罩关闭
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('modalOverlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
});

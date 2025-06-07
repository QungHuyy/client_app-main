/**
 * CartEventManager.js
 * 
 * File này chứa các hàm và event listener liên quan đến giỏ hàng
 * để đảm bảo đồng bộ giữa các component và trang
 */

// Khởi tạo event listener để theo dõi thay đổi trong localStorage
const initCartEventListeners = () => {
  // Theo dõi thay đổi từ các tab khác
  window.addEventListener('storage', function(e) {
    if (e.key === 'carts') {
      console.log('Giỏ hàng đã được cập nhật từ tab khác');
      // Kích hoạt sự kiện tùy chỉnh
      window.dispatchEvent(new CustomEvent('cart-updated', { 
        detail: { carts: JSON.parse(e.newValue || '[]') } 
      }));
    }
  });

  // Thêm một phương thức vào window để cho phép các component khác
  // kích hoạt sự kiện cập nhật giỏ hàng
  window.notifyCartUpdated = (carts) => {
    console.log('Thông báo cập nhật giỏ hàng');
    window.dispatchEvent(new CustomEvent('cart-updated', { 
      detail: { carts: carts || JSON.parse(localStorage.getItem('carts') || '[]') } 
    }));
  };

  console.log('Đã khởi tạo CartEventManager');
};

// Đăng ký người nghe cho sự kiện cập nhật giỏ hàng
const subscribeToCartUpdates = (callback) => {
  const handler = (e) => callback(e.detail.carts);
  window.addEventListener('cart-updated', handler);
  
  // Trả về một hàm để hủy đăng ký
  return () => window.removeEventListener('cart-updated', handler);
};

// Xóa giỏ hàng và thông báo
const clearCartAndNotify = () => {
  localStorage.setItem('carts', JSON.stringify([]));
  if (window.notifyCartUpdated) {
    window.notifyCartUpdated([]);
  }
};

// Xuất các hàm
export {
  initCartEventListeners,
  subscribeToCartUpdates,
  clearCartAndNotify
}; 
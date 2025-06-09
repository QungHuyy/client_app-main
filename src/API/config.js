/**
 * Cấu hình API chung cho web client
 * File này tương thích với cấu hình của mobile app (shop/config/api.ts)
 */

// Cấu hình server
export const SERVER_IP = 'localhost'; // Mặc định cho web development
export const SERVER_PORT = 8000;

// URLs cơ sở
export const API_BASE_URL = `http://${SERVER_IP}:${SERVER_PORT}`;
export const API_URL = `${API_BASE_URL}/api`;

// Các endpoint cụ thể - giống với mobile app
export const USER_API = `${API_URL}/User`;
export const PRODUCT_API = `${API_URL}/Product`;
export const CART_API = `${API_URL}/Cart`;
export const FAVORITE_API = `${API_URL}/Favorite`;
export const COMMENT_API = `${API_URL}/Comment`;
export const COUPON_API = `${API_URL}/admin/coupon`;
export const ORDER_API = `${API_URL}/Payment/order`;
export const DETAIL_ORDER_API = `${API_URL}/DetailOrder`;
export const NOTE_API = `${API_URL}/Note`;
export const SALE_API = `${API_URL}/admin/sale`;
export const CHATBOT_API = `${API_URL}/Chatbot`;

// Function để lấy URL phù hợp với môi trường
export const getEnvironmentUrl = () => {
  // Kiểm tra nếu đang ở môi trường production
  if (process.env.NODE_ENV === 'production') {
    return 'https://server-app-bv0n.onrender.com';
  }
  
  // Fallback URLs để thử kết nối nếu localhost không hoạt động
  const fallbackUrls = [
    `http://${SERVER_IP}:${SERVER_PORT}`,
    'http://192.168.1.82:8000',
    'http://127.0.0.1:8000'
  ];
  
  // Ở môi trường development, sử dụng localhost
  return fallbackUrls[0];
};

// Export tất cả như một đối tượng để dễ import
export default {
  SERVER_IP,
  SERVER_PORT,
  API_BASE_URL,
  API_URL,
  USER_API,
  PRODUCT_API,
  CART_API,
  FAVORITE_API,
  COMMENT_API,
  COUPON_API,
  ORDER_API,
  DETAIL_ORDER_API,
  NOTE_API,
  SALE_API,
  CHATBOT_API,
  getEnvironmentUrl
}; 
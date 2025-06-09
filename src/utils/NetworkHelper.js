/**
 * Các tiện ích xử lý mạng cho web app
 * Mô phỏng theo NetworkHelper của mobile app
 */
import axios from 'axios';
import { API_BASE_URL, SERVER_IP, SERVER_PORT } from '../API/config';

/**
 * Utility giúp xử lý các vấn đề về kết nối mạng
 */
const NetworkHelper = {
  /**
   * Kiểm tra kết nối tới server
   * @param url URL server cần kiểm tra
   * @returns Kết quả kiểm tra
   */
  testServerConnection: async (url) => {
    try {
      const response = await axios.get(url, { timeout: 5000 });
      return {
        success: true,
        status: response.status,
        message: `Kết nối thành công (${response.status})`
      };
    } catch (error) {
      // Nếu server tồn tại nhưng trả về lỗi (404, 500, etc.)
      if (error.response) {
        return {
          success: true, // Vẫn coi là thành công vì server tồn tại
          status: error.response.status,
          message: `Server tồn tại nhưng trả về status ${error.response.status}`
        };
      }
      
      // Lỗi không kết nối được
      return {
        success: false,
        status: 0,
        message: error.message || 'Không thể kết nối đến server'
      };
    }
  },

  /**
   * Tạo một request có timeout
   * @param apiCall Promise của API call
   * @param timeout Thời gian timeout (ms)
   * @returns Promise với timeout
   */
  withTimeout: (apiCall, timeout = 5000) => {
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('API request timeout')), timeout)
    );
    
    return Promise.race([apiCall, timeoutPromise]);
  },

  /**
   * Kiểm tra xem backend có hoạt động không
   * @returns Trạng thái hoạt động của backend
   */
  isBackendAlive: async () => {
    try {
      const result = await NetworkHelper.testServerConnection(
        `http://${SERVER_IP}:${SERVER_PORT}/api/Product`
      );
      return result.success;
    } catch (error) {
      console.error('❌ Error checking backend:', error);
      return false;
    }
  },

  /**
   * Lấy thông tin mạng hiện tại của thiết bị
   * @returns Thông tin mạng
   */
  getNetworkInfo: () => {
    return {
      online: navigator.onLine,
      type: navigator.connection ? navigator.connection.effectiveType : 'unknown'
    };
  },

  /**
   * Kiểm tra trạng thái online
   * @returns Boolean trạng thái online
   */
  isOnline: () => {
    return navigator.onLine;
  },

  /**
   * Tạo một API request với retry tự động nếu thất bại
   * @param apiCall Hàm gọi API
   * @param retryCount Số lần retry
   * @param retryDelay Thời gian chờ giữa các lần retry (ms)
   * @returns Kết quả API hoặc lỗi sau khi đã retry
   */
  withRetry: async (
    apiCall,
    retryCount = 3,
    retryDelay = 1000
  ) => {
    let lastError;
    
    for (let attempt = 0; attempt < retryCount; attempt++) {
      try {
        return await apiCall();
      } catch (error) {
        console.log(`Retry attempt ${attempt + 1}/${retryCount} failed`);
        lastError = error;
        
        // Chờ trước khi retry
        if (attempt < retryCount - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    throw lastError;
  },

  /**
   * Hook để theo dõi trạng thái mạng
   * @param callback Hàm được gọi khi trạng thái mạng thay đổi
   */
  useNetworkMonitor: (callback) => {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => callback(true));
      window.addEventListener('offline', () => callback(false));
      
      return () => {
        window.removeEventListener('online', () => callback(true));
        window.removeEventListener('offline', () => callback(false));
      };
    }
    return () => {};
  }
};

export default NetworkHelper; 
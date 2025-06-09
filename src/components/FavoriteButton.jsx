import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import FavoriteAPI from '../API/FavoriteAPI';

/**
 * Component nút yêu thích sản phẩm
 * @param {Object} props
 * @param {string} props.productId - ID của sản phẩm
 * @param {string} props.className - Class CSS bổ sung (optional)
 * @param {Function} props.onToggle - Callback khi toggle trạng thái (optional)
 */
function FavoriteButton({ productId, className = '', onToggle }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Lấy ID người dùng từ Redux store hoặc sessionStorage
  const id_user = useSelector(state => state.Session.idUser) || sessionStorage.getItem('id_user');

  // Kiểm tra trạng thái yêu thích khi component mount
  useEffect(() => {
    if (id_user && productId) {
      checkFavoriteStatus();
    }
  }, [id_user, productId]);

  // Kiểm tra sản phẩm có trong danh sách yêu thích không
  const checkFavoriteStatus = async () => {
    try {
      if (!id_user) return;
      
      const response = await FavoriteAPI.checkFavorite(id_user, productId);
      setIsFavorite(response.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  // Xử lý khi click vào nút yêu thích
  const handleToggleFavorite = async (e) => {
    e.preventDefault(); // Ngăn chặn hành vi mặc định của thẻ a
    
    if (!id_user) {
      alert('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
      return;
    }

    try {
      setLoading(true);
      
      const result = await FavoriteAPI.toggleFavorite(id_user, productId);
      
      if (result.success) {
        setIsFavorite(result.isFavorite);
        
        // Gọi callback nếu có
        if (onToggle) {
          onToggle(result.isFavorite);
        }
        
        // Hiển thị thông báo
        if (result.isFavorite) {
          alert('Đã thêm vào danh sách yêu thích');
        } else {
          alert('Đã xóa khỏi danh sách yêu thích');
        }
      } else {
        alert(result.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      alert('Không thể thay đổi trạng thái yêu thích');
    } finally {
      setLoading(false);
    }
  };

  return (
    <a
      href="#"
      className={`wishlist-btn ${className} ${isFavorite ? 'active' : ''}`}
      onClick={handleToggleFavorite}
      disabled={loading}
      aria-label={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
    >
      <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i>
    </a>
  );
}

export default FavoriteButton; 
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { changeCount } from '../Redux/Action/ActionCount';
import CartsLocal from '../Share/CartsLocal';
import Swal from 'sweetalert2';
import './Search.css';

const SearchByAI = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const results = useSelector(state => state.searchResults);
  const id_user = useSelector(state => state.Session.idUser) || sessionStorage.getItem('id_user');
  const count_change = useSelector(state => state.Count.isLoad);
  
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(sessionStorage.getItem('uploadedImageUrl') || null);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Filter products with similarity score >= 30%
  useEffect(() => {
    setLoading(true);
    if (results && results.matched_products && results.matched_products.length > 0) {
      const filtered = results.matched_products.filter(product => 
        product.similarity_score >= 0.3
      );
      setFilteredProducts(filtered);
    }
    setLoading(false);
  }, [results]);

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!id_user) {
      Swal.fire({
        title: 'Thông báo',
        text: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!',
        icon: 'warning',
        confirmButtonText: 'Đóng',
        confirmButtonColor: '#3085d6',
      });
      return;
    }
    
    try {
      // Show size selection dialog
      const { value: size } = await Swal.fire({
        title: 'Chọn kích thước',
        html: `
          <div class="size-selection-dialog">
            <p>Vui lòng chọn kích thước phù hợp:</p>
            <div class="size-options">
              ${['S', 'M', 'L', 'XL'].map(size => 
                `<div class="size-option" data-size="${size}" onclick="document.querySelectorAll('.size-option').forEach(el => el.classList.remove('active')); this.classList.add('active');">${size}</div>`
              ).join('')}
            </div>
          </div>
          <style>
            .size-selection-dialog {
              margin: 20px 0;
              text-align: center;
            }
            .size-options {
              display: flex;
              justify-content: center;
              gap: 10px;
              margin-top: 15px;
            }
            .size-option {
              width: 40px;
              height: 40px;
              border: 1px solid #ddd;
              border-radius: 4px;
              display: flex;
              align-items: center;
              justify-content: center;
              cursor: pointer;
              transition: all 0.2s;
              font-weight: 500;
            }
            .size-option:hover {
              border-color: #fed700;
              background-color: #fffdf0;
            }
            .size-option.active {
              border-color: #fed700;
              background-color: #fed700;
              color: #333;
              font-weight: bold;
            }
          </style>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Thêm vào giỏ hàng',
        cancelButtonText: 'Hủy',
        preConfirm: () => {
          const activeSize = document.querySelector('.size-option.active');
          if (!activeSize) {
            Swal.showValidationMessage('Vui lòng chọn kích thước');
            return false;
          }
          return activeSize.dataset.size;
        }
      });
      
      if (!size) return; // User cancelled
      
      const data = {
        id_cart: Math.random().toString(),
        id_product: product._id,
        name_product: product.name_product,
        price_product: product.price_product,
        count: 1,
        image: product.image,
        size: size,
      };
      
      // Add to cart
      await CartsLocal.addProduct(data);
      
      // Update UI
      const action_count_change = changeCount(count_change);
      dispatch(action_count_change);
      
      // Success notification
      Swal.fire({
        title: 'Thành công!',
        text: `Đã thêm ${product.name_product} (Size ${size}) vào giỏ hàng`,
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error adding product to cart:", error);
      
      Swal.fire({
        title: 'Lỗi',
        text: 'Không thể thêm sản phẩm vào giỏ hàng.',
        icon: 'error',
        confirmButtonText: 'Đóng',
      });
    }
  };

  if (loading) {
    return (
      <div className="search-loading-container">
        <div className="spinner-container">
          <div className="spinner-border text-warning" role="status">
            <span className="sr-only">Đang tải...</span>
          </div>
          <p className="loading-text">Đang tải kết quả tìm kiếm...</p>
        </div>
      </div>
    );
  }

  if (!results || !results.matched_products || filteredProducts.length === 0) {
    return (
      <div className="no-results-container">
        <div className="no-results-content">
          <div className="no-results-icon">🔍</div>
          <h2>Không tìm thấy sản phẩm phù hợp</h2>
          <p>Không có sản phẩm nào có độ tương đồng trên 30%</p>
          <Link to="/" className="back-home-btn">
            <i className="fa fa-home mr-2"></i>Trở về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results-container pt-60 pb-60">
      <div className="container">
        <div className="search-header">
          <h2 className="search-title">Kết quả tìm kiếm bằng hình ảnh</h2>
          <p className="search-summary">
            Tìm thấy {filteredProducts.length} sản phẩm có độ tương đồng từ 30% trở lên
          </p>
        </div>

        {/* Hiển thị ảnh đã tải lên */}
        {uploadedImage && (
          <div className="uploaded-image-container">
            <h3 className="uploaded-image-title">
              <i className="fa fa-camera"></i>
              Ảnh bạn đã tải lên để tìm kiếm:
            </h3>
            <div className="uploaded-image-content">
              <div className="uploaded-image-wrapper">
                <img 
                  src={uploadedImage} 
                  alt="Ảnh tìm kiếm" 
                  className="uploaded-image"
                />
              </div>
              <div className="uploaded-image-info">
                <p>Dưới đây là các sản phẩm có độ tương đồng từ 30% trở lên với ảnh của bạn.</p>
                <div className="ai-info">
                  <i className="fa fa-info-circle mr-1"></i>
                  Độ tương đồng được tính dựa trên AI phân tích hình ảnh
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="search-filter-bar">
          <div className="result-count">
            {filteredProducts.length} kết quả
          </div>
          <div className="sort-options">
            <i className="fa fa-sort mr-1"></i> Sắp xếp theo độ tương đồng
          </div>
        </div>

        <div className="row search-products-grid">
          {filteredProducts.map(product => (
            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={product._id}>
              <div className="search-product-card">
                <div className="product-image-container">
                  <Link to={`/detail/${product._id}`}>
                    <img 
                      src={product.image} 
                      alt={product.name_product} 
                      className="product-image"
                    />
                  </Link>
                  
                  {/* Similarity Badge */}
                  <div className="similarity-badge">
                    <span>{(product.similarity_score * 100).toFixed(0)}% trùng khớp</span>
                  </div>
                  
                  {/* Quick action buttons */}
                  <div className="product-actions">
                    <button 
                      className="action-btn cart-btn"
                      onClick={(e) => handleAddToCart(e, product)}
                      title="Thêm vào giỏ hàng"
                    >
                      <i className="fa fa-shopping-cart"></i>
                    </button>
                    <Link 
                      to={`/detail/${product._id}`} 
                      className="action-btn view-btn"
                      title="Xem chi tiết"
                    >
                      <i className="fa fa-external-link"></i>
                    </Link>
                  </div>
                </div>
                
                <div className="product-info">
                  {/* Product name */}
                  <h3 className="product-title">
                    <Link to={`/detail/${product._id}`}>
                      {product.name_product}
                    </Link>
                  </h3>
                  
                  {/* Category & Gender */}
                  <div className="product-meta">
                    <span className="product-category">{product.id_category}</span>
                    <span className="product-gender">{product.gender}</span>
                  </div>
                  
                  {/* Price */}
                  <div className="product-price">
                    <span className="price-regular">
                      {formatPrice(product.price_product)}
                    </span>
                  </div>
                  
                  {/* Mobile buy button */}
                  <button 
                    className="mobile-buy-btn"
                    onClick={(e) => handleAddToCart(e, product)}
                  >
                    <i className="fa fa-shopping-cart"></i> Thêm vào giỏ
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchByAI;

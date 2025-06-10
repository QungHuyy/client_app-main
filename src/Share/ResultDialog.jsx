import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { changeCount } from '../Redux/Action/ActionCount';
import CartsLocal from './CartsLocal';
import Swal from 'sweetalert2';

function ResultDialog({ open, onClose, products, uploadedImage }) {
  const dispatch = useDispatch();
  const history = useHistory();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filter products with similarity score >= 30%
  useEffect(() => {
    if (products && products.length > 0) {
      const filtered = products.filter(prod => prod.similarity_score >= 0.3);
      setFilteredProducts(filtered);
    }
    setLoading(false);
  }, [products]);

  // Format price to VND
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  // Handle add to cart
  const handleAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!sessionStorage.getItem('id_user')) {
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
          <div class="size-selection">
            <div class="size-options">
              ${['S', 'M', 'L', 'XL'].map(s => 
                `<div class="size-option" data-size="${s}" onclick="document.querySelectorAll('.size-option').forEach(el => el.classList.remove('selected')); this.classList.add('selected');">${s}</div>`
              ).join('')}
            </div>
          </div>
          <style>
            .size-selection { margin: 20px 0; }
            .size-options { display: flex; justify-content: center; gap: 10px; }
            .size-option {
              width: 40px; height: 40px;
              border: 1px solid #ddd; border-radius: 4px;
              display: flex; align-items: center; justify-content: center;
              cursor: pointer; transition: all 0.2s;
            }
            .size-option:hover { border-color: #fed700; background-color: #fffdf0; }
            .size-option.selected { border-color: #fed700; background-color: #fed700; font-weight: bold; }
          </style>
        `,
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: 'Thêm vào giỏ hàng',
        confirmButtonColor: '#fed700',
        cancelButtonText: 'Hủy',
        cancelButtonColor: '#d33',
        preConfirm: () => {
          const selected = document.querySelector('.size-option.selected');
          if (!selected) {
            Swal.showValidationMessage('Vui lòng chọn kích thước');
            return false;
          }
          return selected.dataset.size;
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
      
      await CartsLocal.addProduct(data);
      
      const count_change = Math.random();
      const action_count_change = changeCount(count_change);
      dispatch(action_count_change);
      
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

  const handleProductClick = (productId) => {
    history.push(`/detail/${productId}`);
    onClose();
  };

  if (!open) return null;

  return (
    <div
      className="image-search-modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
        backdropFilter: 'blur(3px)',
      }}
      onClick={onClose}
    >
      <div
        className="image-search-modal"
        style={{
          backgroundColor: 'white',
          borderRadius: 8,
          maxWidth: 900,
          width: '90%',
          maxHeight: '85vh',
          overflowY: 'auto',
          boxShadow: '0 5px 20px rgba(0,0,0,0.2)',
          padding: 0,
          fontFamily: 'Montserrat, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header" style={{
          padding: '20px 25px',
          borderBottom: '1px solid #eee',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: '#333' }}>
            Kết quả tìm kiếm bằng hình ảnh
          </h2>
          <button 
            onClick={onClose} 
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#999',
            }}
          >
            &times;
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px 25px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px 0' }}>
              <div className="spinner-border text-primary" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
              <p style={{ marginTop: 15 }}>Đang phân tích hình ảnh...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ fontSize: '60px', marginBottom: '20px' }}>😕</div>
              <h3 style={{ color: '#555', marginBottom: '10px' }}>Không tìm thấy sản phẩm phù hợp</h3>
              <p style={{ color: '#777' }}>Không có sản phẩm nào có độ tương đồng trên 30%</p>
            </div>
          ) : (
            <>
              {/* Hiển thị ảnh đã tải lên */}
              {uploadedImage && (
                <div className="uploaded-image-container" style={{
                  marginBottom: '30px', 
                  padding: '15px',
                  backgroundColor: '#f9f9f9',
                  borderRadius: '8px',
                  border: '1px dashed #ddd'
                }}>
                  <h3 style={{ 
                    fontSize: '16px', 
                    fontWeight: 600, 
                    marginBottom: '15px',
                    color: '#555',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <i className="fa fa-camera" style={{ color: '#666' }}></i>
                    Ảnh bạn đã tải lên để tìm kiếm:
                  </h3>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px'
                  }}>
                    <div style={{
                      width: '120px',
                      height: '120px',
                      borderRadius: '4px',
                      overflow: 'hidden',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                      border: '1px solid #eee'
                    }}>
                      <img 
                        src={uploadedImage} 
                        alt="Uploaded" 
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                    <div style={{ flex: '1' }}>
                      <p style={{ color: '#666', margin: '0 0 10px' }}>
                        Dưới đây là các sản phẩm có độ tương đồng từ 30% trở lên với ảnh của bạn.
                      </p>
                      <div style={{ color: '#999', fontSize: '13px' }}>
                        <i className="fa fa-info-circle mr-1"></i>
                        Độ tương đồng được tính dựa trên AI phân tích hình ảnh
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <p style={{ color: '#666', margin: 0 }}>
                  Tìm thấy {filteredProducts.length} sản phẩm có độ tương đồng từ 30% trở lên
                </p>
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  padding: '5px 10px', 
                  borderRadius: '4px', 
                  backgroundColor: '#f0f0f0',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <i className="fa fa-sort mr-1"></i> Sắp xếp theo độ tương đồng
                </div>
              </div>
              
              <div className="product-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '20px',
              }}>
                {filteredProducts.map((product) => (
                  <div 
                    key={product._id} 
                    className="product-card" 
                    style={{
                      border: '1px solid #eee',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      cursor: 'pointer',
                      position: 'relative',
                      backgroundColor: 'white',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    }}
                    onClick={() => handleProductClick(product._id)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 5px rgba(0,0,0,0.05)';
                    }}
                  >
                    <div className="product-image" style={{ position: 'relative', paddingTop: '100%' }}>
                      <img
                        src={product.image}
                        alt={product.name_product}
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <div className="similarity-badge" style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        backgroundColor: '#fed700',
                        color: '#333',
                        padding: '5px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                      }}>
                        {(product.similarity_score * 100).toFixed(0)}% trùng khớp
                      </div>
                    </div>
                    
                    <div className="product-info" style={{ padding: '15px' }}>
                      <h3 style={{ 
                        margin: '0 0 8px', 
                        fontSize: '16px', 
                        fontWeight: '600',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {product.name_product}
                      </h3>
                      
                      <div className="product-price" style={{ 
                        fontWeight: 'bold', 
                        fontSize: '16px',
                        color: '#e80f0f',
                        marginBottom: '10px',
                      }}>
                        {formatPrice(product.price_product)}
                      </div>
                      
                      <button 
                        className="add-to-cart-btn" 
                        style={{
                          width: '100%',
                          padding: '8px 0',
                          backgroundColor: '#fed700',
                          border: 'none',
                          borderRadius: '4px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'background-color 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '5px',
                        }}
                        onClick={(e) => handleAddToCart(e, product)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e6c300'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fed700'}
                      >
                        <i className="fa fa-shopping-cart"></i> Thêm vào giỏ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultDialog;

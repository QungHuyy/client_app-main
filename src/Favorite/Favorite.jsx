import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import FavoriteAPI from '../API/FavoriteAPI';
import CartAPI from '../API/CartAPI';
import User from '../API/User';

function Favorite() {
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    
    // State cho thông báo
    const [showNotification, setShowNotification] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationProduct, setNotificationProduct] = useState(null);
    
    // Lấy ID người dùng từ Redux store hoặc sessionStorage
    const id_user = useSelector(state => state.Session.idUser) || sessionStorage.getItem('id_user');

    // Lấy thông tin người dùng khi component mount
    useEffect(() => {
        const fetchUserData = async () => {
            if (id_user) {
                try {
                    const userData = await User.Get_User(id_user);
                    setUser(userData);
                    loadFavorites(id_user);
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id_user]);

    // Hàm lấy danh sách sản phẩm yêu thích
    const loadFavorites = async (userId) => {
        try {
            setLoading(true);
            const response = await FavoriteAPI.getFavorites(userId);
            
            if (response.success && response.data) {
                setFavorites(response.data);
            } else {
                setFavorites([]);
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
            showNotificationMessage('Không thể tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    // Hiển thị thông báo
    const showNotificationMessage = (message, product = null) => {
        setNotificationMessage(message);
        setNotificationProduct(product);
        setShowNotification(true);
        
        setTimeout(() => {
            setShowNotification(false);
        }, 3000);
    };

    // Xóa sản phẩm khỏi yêu thích
    const handleRemoveFavorite = async (productId, productName) => {
        if (!id_user) return;
        
        try {
            const result = await FavoriteAPI.removeFavorite({
                id_user: id_user,
                id_product: productId
            });
            
            if (result.success) {
                // Cập nhật danh sách local
                const removedProduct = favorites.find(item => item.id_product._id === productId);
                setFavorites(prev => prev.filter(item => item.id_product._id !== productId));
                
                // Hiển thị thông báo
                showNotificationMessage('Đã xóa khỏi danh sách yêu thích', removedProduct?.id_product);
                
                // Cập nhật số lượng yêu thích trong Header
                try {
                    const favoriteResponse = await fetch(`http://localhost:8000/api/Favorite/${id_user}`);
                    const favoriteData = await favoriteResponse.json();
                    if (favoriteData.success && favoriteData.data) {
                        // Cập nhật count_favorite trong Header
                        if (window.updateFavoriteCount) {
                            window.updateFavoriteCount(favoriteData.data.length);
                        }
                    }
                } catch (error) {
                    console.error('Error updating favorite count:', error);
                }
            } else {
                showNotificationMessage(result.message || 'Không thể xóa sản phẩm');
            }
        } catch (error) {
            console.error('Error removing favorite:', error);
            showNotificationMessage('Không thể xóa sản phẩm khỏi yêu thích');
        }
    };

    // Thêm sản phẩm vào giỏ hàng
    const handleAddToCart = async (product) => {
        if (!id_user) {
            showNotificationMessage('Vui lòng đăng nhập để thêm vào giỏ hàng');
            return;
        }

        try {
            const cartData = {
                id_user: id_user,
                id_product: product._id,
                count: 1
            };

            const response = await CartAPI.addToCart(cartData);
            
            if (response === "Sản Phẩm Đã Có Trong Giỏ Hàng") {
                showNotificationMessage('Sản phẩm đã có trong giỏ hàng', product);
            } else {
                showNotificationMessage('Đã thêm sản phẩm vào giỏ hàng', product);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            showNotificationMessage('Không thể thêm sản phẩm vào giỏ hàng');
        }
    };

    // Định dạng giá tiền
    const formatPrice = (price) => {
        return parseInt(price).toLocaleString('vi-VN') + 'đ';
    };

    // Kiểm tra trạng thái còn hàng
    const checkStockStatus = (product) => {
        // Giả sử nếu số lượng > 0 thì còn hàng
        return product.quantity > 0;
    };

    // Tối ưu URL hình ảnh Cloudinary
    const optimizeCloudinaryImage = (url, width = 300) => {
        if (url && url.includes('cloudinary.com')) {
            // Thêm transformation vào URL Cloudinary
            return url.replace('/upload/', `/upload/w_${width},c_scale/`);
        }
        return url;
    };

    // Hiển thị trạng thái đăng nhập
    if (!id_user) {
        return (
            <div>
                <div className="wishlist-area pt-60 pb-60">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 text-center">
                                <div className="empty-wishlist" style={{ padding: '40px 0' }}>
                                    <i className="fa fa-heart-o fa-4x mb-3" style={{ color: '#fed700' }}></i>
                                    <h3 style={{ marginTop: '20px', fontWeight: 'bold' }}>Vui lòng đăng nhập để xem sản phẩm yêu thích</h3>
                                    <Link to="/signin" className="btn mt-3" style={{ 
                                        backgroundColor: '#fed700', 
                                        color: '#333', 
                                        fontWeight: 'bold',
                                        padding: '10px 30px',
                                        borderRadius: '5px',
                                        marginTop: '20px'
                                    }}>
                                        Đăng nhập ngay
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Hiển thị trạng thái loading
    if (loading) {
    return (
        <div>
                <div className="wishlist-area pt-60 pb-60">
                    <div className="container">
                        <div className="row">
                            <div className="col-12 text-center">
                                <div className="loading" style={{ padding: '40px 0' }}>
                                    <i className="fa fa-spinner fa-spin fa-3x" style={{ color: '#fed700' }}></i>
                                    <h3 style={{ marginTop: '20px' }}>Đang tải...</h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <div className="wishlist-area pt-60 pb-60">
                <div className="container">
                    {/* Header text */}
                    <div className="row mb-4">
                        <div className="col-12 text-center">
                            <h2 style={{ fontWeight: 'bold', marginBottom: '15px' }}>Danh sách sản phẩm yêu thích</h2>
                            <p>Bạn có thể dễ dàng theo dõi sản phẩm yêu thích của mình tại đây</p>
                        </div>
                    </div>
                    
                    <div className="row">
                        <div className="col-12">
                            {favorites.length === 0 ? (
                                <div className="text-center empty-wishlist" style={{ padding: '40px 0' }}>
                                    <i className="fa fa-heart-o fa-4x mb-3" style={{ color: '#fed700' }}></i>
                                    <h3 style={{ marginTop: '20px', fontWeight: 'bold' }}>Bạn chưa có sản phẩm yêu thích nào</h3>
                                    <p>Thêm sản phẩm vào danh sách yêu thích để dễ dàng tìm lại sau này</p>
                                    <Link to="/shop" className="btn mt-3" style={{ 
                                        backgroundColor: '#fed700', 
                                        color: '#333', 
                                        fontWeight: 'bold',
                                        padding: '10px 30px',
                                        borderRadius: '5px',
                                        marginTop: '20px'
                                    }}>
                                        Khám phá sản phẩm
                                    </Link>
                                </div>
                            ) : (
                                <div className="table-content table-responsive">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th className="li-product-remove">Xóa</th>
                                                <th className="li-product-thumbnail">Hình ảnh</th>
                                                <th className="cart-product-name">Sản phẩm</th>
                                                <th className="li-product-price">Giá</th>
                                                <th className="li-product-add-cart">Thao tác</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {favorites.map((favorite) => (
                                                <tr key={favorite._id}>
                                                    <td className="li-product-remove">
                                                        <button 
                                                            onClick={() => handleRemoveFavorite(favorite.id_product._id, favorite.id_product.name_product)}
                                                            style={{
                                                                border: 'none',
                                                                background: 'none',
                                                                cursor: 'pointer',
                                                                color: '#888'
                                                            }}
                                                        >
                                                            <i className="fa fa-times"></i>
                                                        </button>
                                                    </td>
                                                    <td className="li-product-thumbnail">
                                                        <Link to={`/detail/${favorite.id_product._id}`}>
                                                            <img 
                                                                src={optimizeCloudinaryImage(favorite.id_product.image)} 
                                                                alt={favorite.id_product.name_product} 
                                                                style={{width: '100px', height: '100px', objectFit: 'cover'}}
                                                            />
                                                        </Link>
                                                    </td>
                                                    <td className="li-product-name">
                                                        <Link to={`/detail/${favorite.id_product._id}`} style={{ color: '#333', fontWeight: '500' }}>
                                                            {favorite.id_product.name_product}
                                                        </Link>
                                                    </td>
                                                    <td className="li-product-price">
                                                        {favorite.id_product.promotion > 0 ? (
                                                            <div>
                                                                <span className="amount" style={{ color: '#e80f0f', fontWeight: 'bold' }}>
                                                                    {formatPrice(favorite.id_product.price_product - (favorite.id_product.price_product * favorite.id_product.promotion / 100))}
                                                                </span>
                                                                <br />
                                                                <del style={{ color: '#999', fontSize: '13px' }}>
                                                                    {formatPrice(favorite.id_product.price_product)}
                                                                </del>
                                                            </div>
                                                        ) : (
                                                            <span className="amount" style={{ color: '#e80f0f', fontWeight: 'bold' }}>
                                                                {formatPrice(favorite.id_product.price_product)}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="li-product-add-cart">
                                                        <Link 
                                                            to={`/detail/${favorite.id_product._id}`}
                                                            className="btn"
                                                            style={{
                                                                backgroundColor: '#fed700',
                                                                color: '#333',
                                                                fontWeight: 'bold',
                                                                padding: '8px 15px',
                                                                borderRadius: '5px',
                                                                border: 'none',
                                                                display: 'inline-block',
                                                                textDecoration: 'none'
                                                            }}
                                                        >
                                                            <i className="fa fa-eye mr-1"></i> Xem chi tiết
                                                        </Link>
                                                    </td>
                                            </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Thông báo */}
            {showNotification && (
                <div className="notification-modal error-modal" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '15px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '250px',
                    fontSize: '14px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa fa-exclamation-circle" style={{ marginRight: '10px', fontSize: '18px' }}></i>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>{notificationMessage}</div>
                            {notificationProduct && (
                                <div style={{ fontSize: '12px' }}>{notificationProduct.name_product}</div>
                            )}
                        </div>
                    </div>
                    <button 
                        className="btn btn-sm" 
                        style={{ 
                            fontSize: '10px', 
                            padding: '3px 8px',
                            marginLeft: '8px',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderColor: 'transparent',
                            color: 'white'
                        }}
                        onClick={() => setShowNotification(false)}
                    >
                        Đóng
                    </button>
                </div>
            )}
        </div>
    );
}

export default Favorite;
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Product from '../../API/Product';
import queryString from 'query-string'
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useSelector, useDispatch } from 'react-redux';
import FavoriteAPI from '../../API/FavoriteAPI';
import '../css/product.css'; // Thêm file CSS cho sản phẩm
import CartsLocal from '../../Share/CartsLocal';
import { changeCount } from '../../Redux/Action/ActionCount';
import Swal from 'sweetalert2';

Home_Product.propTypes = {
    gender: PropTypes.string,
    category: PropTypes.string,
    GET_id_modal: PropTypes.func,
    products: PropTypes.array,
    slider: PropTypes.bool,
    autoScroll: PropTypes.bool
};

Home_Product.defaultProps = {
    gender: '',
    category: '',
    GET_id_modal: null,
    products: null,
    slider: false,
    autoScroll: false
}

function Home_Product(props) {

    const { gender, category, GET_id_modal, products: initialProducts, slider, autoScroll } = props
    const dispatch = useDispatch();

    // Lấy ID người dùng từ Redux store hoặc sessionStorage
    const id_user = useSelector(state => state.Session.idUser) || sessionStorage.getItem('id_user');
    const count_change = useSelector(state => state.Count.isLoad);

    // Thiết lập tùy chỉnh cho slider
    const sliderSettings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3000,
        pauseOnHover: true,
        speed: 800,
        initialSlide: 0,
        arrows: true,
        cssEase: "ease-in-out",
        responsive: [
            {
                breakpoint: 1024,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 600,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };

    // Thiết lập cho slider ngang có nhiều item hơn
    const horizontalSliderSettings = {
        dots: false,
        infinite: true,
        slidesToShow: 5, // Hiển thị nhiều sản phẩm hơn trong slide ngang
        slidesToScroll: 1,
        autoplay: true, 
        autoplaySpeed: 2500,
        pauseOnHover: true,
        speed: 800,
        arrows: true,
        cssEase: "ease-in-out",
        responsive: [
            {
                breakpoint: 1200,
                settings: {
                    slidesToShow: 4,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 992,
                settings: {
                    slidesToShow: 3,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 768,
                settings: {
                    slidesToShow: 2,
                    slidesToScroll: 1,
                }
            },
            {
                breakpoint: 480,
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1
                }
            }
        ]
    };


    const [products, set_products] = useState([])
    const [loading, setLoading] = useState(true)
    const [productStats, setProductStats] = useState({})
    const [allProducts, setAllProducts] = useState([])
    const [favoriteProducts, setFavoriteProducts] = useState({}) // Lưu trạng thái yêu thích của các sản phẩm
    const [favoriteLoading, setFavoriteLoading] = useState(false) // Trạng thái loading chung
    const [addingToCart, setAddingToCart] = useState({}) // Trạng thái thêm vào giỏ hàng
    
    // Thêm state cho thông báo
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState(''); // 'success' hoặc 'error'
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationProduct, setNotificationProduct] = useState(null);

    // Lấy danh sách sản phẩm yêu thích khi component mount
    useEffect(() => {
        const loadFavoriteStatus = async () => {
            if (!id_user) return;
            
            try {
                // Nếu có sản phẩm, kiểm tra trạng thái yêu thích cho từng sản phẩm
                const productList = initialProducts || products;
                if (!productList || productList.length === 0) return;
                
                const favoriteStatus = {};
                
                // Kiểm tra từng sản phẩm
                for (const product of productList) {
                    try {
                        const response = await FavoriteAPI.checkFavorite(id_user, product._id);
                        favoriteStatus[product._id] = response.isFavorite;
                    } catch (error) {
                        console.error(`Error checking favorite status for product ${product._id}:`, error);
                        favoriteStatus[product._id] = false;
                    }
                }
                
                setFavoriteProducts(favoriteStatus);
            } catch (error) {
                console.error('Error loading favorite status:', error);
            }
        };
        
        loadFavoriteStatus();
    }, [id_user, initialProducts, products]);

    // Xử lý khi click vào nút yêu thích
    const handleToggleFavorite = async (e, productId, productName) => {
        e.preventDefault();
        e.stopPropagation();
        
        if (!id_user) {
            // Hiển thị thông báo yêu cầu đăng nhập
            setNotificationType('error');
            setNotificationMessage('Vui lòng đăng nhập để thêm sản phẩm vào yêu thích');
            setShowNotification(true);
            
            // Tự động ẩn thông báo sau 3 giây
            setTimeout(() => {
                setShowNotification(false);
            }, 3000);
            return;
        }
        
        try {
            setFavoriteLoading(true);
            
            const result = await FavoriteAPI.toggleFavorite(id_user, productId);
            
            if (result.success) {
                // Cập nhật trạng thái yêu thích của sản phẩm
                setFavoriteProducts(prev => ({
                    ...prev,
                    [productId]: result.isFavorite
                }));
                
                // Tìm thông tin sản phẩm để hiển thị trong thông báo
                const product = products.find(p => p._id === productId) || 
                               (initialProducts && initialProducts.find(p => p._id === productId));
                
                setNotificationProduct(product);
                
                // Hiển thị thông báo
                if (result.isFavorite) {
                    setNotificationType('success');
                    setNotificationMessage('Đã thêm vào danh sách yêu thích');
                } else {
                    setNotificationType('info');
                    setNotificationMessage('Đã xóa khỏi danh sách yêu thích');
                }
                
                setShowNotification(true);
                
                // Tự động ẩn thông báo sau 3 giây
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
                
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
                setNotificationType('error');
                setNotificationMessage(result.message || 'Có lỗi xảy ra');
                setShowNotification(true);
                
                setTimeout(() => {
                    setShowNotification(false);
                }, 3000);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setNotificationType('error');
            setNotificationMessage('Không thể thay đổi trạng thái yêu thích');
            setShowNotification(true);
            
            setTimeout(() => {
                setShowNotification(false);
            }, 3000);
        } finally {
            setFavoriteLoading(false);
        }
    };

    // Hàm này dùng gọi API trả lại dữ liệu product category
    useEffect(() => {
        // Nếu có sẵn danh sách sản phẩm được truyền vào thì sử dụng nó
        if (initialProducts) {
            set_products(initialProducts)
            setLoading(false)
            
            // Lấy thống kê sản phẩm (đánh giá, số lượng bán)
            initialProducts.forEach(product => {
                fetchProductStats(product._id);
            });
            return
        }

        // Lấy tất cả sản phẩm để có thể lọc trên client nếu cần
        const fetchAllProducts = async () => {
            try {
                const response = await Product.Get_All_Product();
                setAllProducts(response);
                return response;
            } catch (error) {
                console.error("Error fetching all products:", error);
                return [];
            }
        };

        // Ngược lại thì gọi API để lấy sản phẩm theo giới tính và danh mục
        const fetchData = async () => {
            try {
                setLoading(true);
                
                // Lấy tất cả sản phẩm trước để có thể lọc trên client
                const allProductsData = await fetchAllProducts();
                
                // Nếu có gender thì lọc theo gender
                if (gender && gender !== '') {
                    console.log("Filtering products by gender:", gender);
                    
                    // Thực hiện lọc sản phẩm theo gender
                    let filteredProducts = [];
                    
                    // Lọc trên client để đảm bảo chính xác
                    if (allProductsData && allProductsData.length > 0) {
                        filteredProducts = allProductsData.filter(product => {
                            // Kiểm tra xem gender có khớp không (chuyển về lowercase để so sánh)
                            if (!product.gender) return false;
                            
                            const productGender = product.gender.toLowerCase();
                            const targetGender = gender.toLowerCase();
                            
                            return productGender === targetGender;
                        });
                        
                        console.log(`Found ${filteredProducts.length} products with gender ${gender}`);
                    }
                    
                    // Nếu không tìm thấy, thử gọi API
                    if (filteredProducts.length === 0) {
                        console.log("Trying API call for gender:", gender);
                        const params = { gender: gender.toLowerCase() };
                        if (category && category !== 'all') {
                            params.id_category = category;
                        }
                        
                        const query = '?' + queryString.stringify(params);
                        const response = await Product.Get_Category_Product(query);
                        
                        if (response && response.length > 0) {
                            filteredProducts = response;
                            console.log(`API returned ${filteredProducts.length} products`);
                        }
                    }
                    
                    // Lấy tối đa 12 sản phẩm cho slider ngang
                    const limitedProducts = filteredProducts.slice(0, 12);
                    set_products(limitedProducts);
                    
                    // Lấy thống kê sản phẩm
                    limitedProducts.forEach(product => {
                        fetchProductStats(product._id);
                    });
                    
                    if (limitedProducts.length === 0) {
                        console.log(`No products found for gender: ${gender}`);
                    }
                } 
                // Nếu không có gender nhưng có category
                else if (category && category !== 'all') {
            const params = {
                id_category: category
            }
            const query = '?' + queryString.stringify(params)
            const response = await Product.Get_Category_Product(query)

                    if (response && response.length > 0) {
                        set_products(response.slice(0, 8))
                        
                        // Lấy thống kê sản phẩm
                        response.slice(0, 8).forEach(product => {
                            fetchProductStats(product._id);
                        });
                    } else {
                        console.log(`No products found for category: ${category}`)
                        set_products([])
                    }
                }
                // Nếu không có cả hai thì lấy tất cả sản phẩm
                else {
                    if (allProductsData && allProductsData.length > 0) {
                        set_products(allProductsData.slice(0, 8));
                        
                        // Lấy thống kê sản phẩm
                        allProductsData.slice(0, 8).forEach(product => {
                            fetchProductStats(product._id);
                        });
                    } else {
                        console.log('No products found');
                        set_products([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching products:", error)
                set_products([])
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [initialProducts, category, gender])

    // Hàm lấy thống kê sản phẩm (đánh giá, số lượng bán)
    const fetchProductStats = async (productId) => {
        try {
            const response = await Product.Get_Product_Stats(productId);
            if (response) {
                setProductStats(prevStats => ({
                    ...prevStats,
                    [productId]: response
                }));
            }
        } catch (error) {
            console.error("Error fetching product stats:", error);
        }
    };

    // Hàm hiển thị đánh giá sao
    const renderStars = (rating) => {
        const stars = [];
        const fullStars = Math.floor(rating);
        const halfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
        
        // Thêm sao đầy
        for (let i = 0; i < fullStars; i++) {
            stars.push(<i key={`full-${i}`} className="fa fa-star" style={{color: '#ffc107'}}></i>);
        }
        
        // Thêm nửa sao nếu có
        if (halfStar) {
            stars.push(<i key="half" className="fa fa-star-half-o" style={{color: '#ffc107'}}></i>);
        }
        
        // Thêm sao rỗng
        for (let i = 0; i < emptyStars; i++) {
            stars.push(<i key={`empty-${i}`} className="fa fa-star-o" style={{color: '#ddd'}}></i>);
        }
        
        return stars;
    };

    // Hàm tối ưu URL Cloudinary
    const optimizeCloudinaryImage = (url, width = 300) => {
        if (url && url.includes('cloudinary.com')) {
            // Thêm transformation vào URL Cloudinary với kích thước cố định và crop để đảm bảo đồng đều
            return url.replace('/upload/', `/upload/w_${width},h_${width},c_fill,q_auto/`);
        }
        return url;
    };

    // Hàm cắt mô tả sản phẩm nếu dài hơn 100 ký tự
    const truncateDescription = (text) => {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    // Kiểm tra xem sản phẩm có phải là mới không (< 14 ngày)
    const isNewProduct = (createdAt) => {
        if (!createdAt) return false;
        const productDate = new Date(createdAt);
        const now = new Date();
        const diffTime = Math.abs(now - productDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 14; // Nếu sản phẩm được tạo trong vòng 14 ngày thì là sản phẩm mới
    };

    // Hàm thêm sản phẩm vào giỏ hàng trực tiếp từ trang chủ
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
        
        // Đánh dấu đang thêm vào giỏ hàng
        setAddingToCart(prev => ({...prev, [product._id]: true}));
        
        try {
            const data = {
                id_cart: Math.random().toString(),
                id_product: product._id,
                name_product: product.name_product,
                price_product: product.price_product,
                count: 1,
                image: product.image,
                size: 'S', // Size mặc định
            };
            
            // Thêm vào giỏ hàng
            await CartsLocal.addProduct(data);
            
            // Cập nhật UI
            const action_count_change = changeCount(count_change);
            dispatch(action_count_change);
            
            // Hiển thị thông báo thành công
            Swal.fire({
                title: 'Thành công!',
                text: `Đã thêm ${product.name_product} vào giỏ hàng`,
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
        } finally {
            // Bỏ đánh dấu đang thêm vào giỏ hàng
            setAddingToCart(prev => ({...prev, [product._id]: false}));
        }
    };

    // Tạo component sản phẩm theo thiết kế cải tiến
    const renderProductItem = (value) => {
        // Kiểm tra xem value có tồn tại không
        if (!value) return null;
        
        // Lấy thông tin thống kê sản phẩm
        const stats = productStats[value._id] || { averageRating: 0, totalSold: 0 };
        
        // Lấy trạng thái yêu thích của sản phẩm
        const isFavorite = favoriteProducts[value._id] || false;
        
        // Kiểm tra sản phẩm mới
        const isNew = isNewProduct(value.createdAt);
        
        // Kiểm tra bestseller (bán nhiều hơn 10 sản phẩm)
        const isBestSeller = stats.totalSold >= 10;

        return (
            <div className="product-card-wrapper" key={value._id}>
                <div className="product-card">
                    <div className="product-image-container">
                        <Link to={`/detail/${value._id}`} className="product-link">
                            <img 
                                src={optimizeCloudinaryImage(value.image)} 
                                alt={value.name_product} 
                                className="product-image"
                            />
                        </Link>
                        
                        {/* Badges */}
                        <div className="product-badges">
                            {value.promotion > 0 && (
                                <span className="badge badge-sale">-{value.promotion}%</span>
                            )}
                            {isNew && (
                                <span className="badge badge-new">New</span>
                            )}
                            {isBestSeller && (
                                <span className="badge badge-bestseller">Best Seller</span>
                            )}
                        </div>
                        
                        {/* Quick action buttons */}
                        <div className="product-actions">
                            <button 
                                className="action-btn view-btn"
                                data-toggle="modal"
                                data-target={`#${value._id}`}
                                onClick={() => GET_id_modal(`${value._id}`)}
                                title="Xem nhanh"
                            >
                                <i className="fa fa-eye"></i>
                            </button>
                            <button 
                                className={`action-btn favorite-btn ${isFavorite ? 'active' : ''}`}
                                onClick={(e) => handleToggleFavorite(e, value._id, value.name_product)}
                                disabled={favoriteLoading}
                                title={isFavorite ? "Đã yêu thích" : "Thêm vào yêu thích"}
                            >
                                <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`}></i>
                            </button>
                            <button 
                                className="action-btn cart-btn"
                                onClick={(e) => handleAddToCart(e, value)}
                                disabled={addingToCart[value._id]}
                                title="Thêm vào giỏ hàng"
                            >
                                <i className="fa fa-shopping-cart"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div className="product-info">
                        {/* Xếp hạng sao */}
                        <div className="product-rating">
                            {renderStars(stats.averageRating)}
                            <span className="sold-count">Đã bán: {stats.totalSold || 0}</span>
                        </div>
                        
                        {/* Tên sản phẩm */}
                        <h3 className="product-title">
                            <Link to={`/detail/${value._id}`}>
                                {value.name_product}
                            </Link>
                        </h3>
                        
                        {/* Mô tả ngắn */}
                        <p className="product-description">
                            {truncateDescription(value.describe)}
                        </p>
                        
                        {/* Giá */}
                        <div className="product-price">
                            {value.promotion > 0 ? (
                                <>
                                    <span className="price-sale">
                                        {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product - (value.price_product * value.promotion / 100))} VNĐ
                                    </span>
                                    <span className="price-original">
                                        {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product)} VNĐ
                                    </span>
                                </>
                            ) : (
                                <span className="price-regular">
                                    {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product)} VNĐ
                                </span>
                            )}
                        </div>
                        
                        {/* Nút mua ngay trên mobile */}
                        <button 
                            className="mobile-buy-btn"
                            onClick={(e) => handleAddToCart(e, value)}
                            disabled={addingToCart[value._id]}
                        >
                            <i className="fa fa-shopping-cart"></i> Thêm vào giỏ
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="alert alert-info text-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                Không tìm thấy sản phẩm
            </div>
        );
    }

    // Tất cả các gender-specific sections và Sản Phẩm Mới Nhất đều sử dụng slider
    if (slider) {
        // Sử dụng cùng một thiết lập slider cho tất cả các section, bất kể có phải là gender hay không
        // Bỏ điều kiện phân biệt giữa gender và non-gender sliders
        const finalSettings = {
            ...sliderSettings, // Luôn sử dụng cài đặt của sliderSettings cho tất cả các section
            autoplay: true,
            swipeToSlide: true,
            touchMove: true
        };
        
        return (
            <div className="product-slider-container">
                <Slider {...finalSettings} className="product-slider">
                    {products && products.map(value => renderProductItem(value))}
                </Slider>
                
                {/* Thông báo thêm vào yêu thích thành công */}
                {showNotification && (
                    <div className={`notification-modal ${notificationType}`}>
                        <div className="notification-content">
                            <i className={`notification-icon fa ${notificationType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                            <p className="notification-message">{notificationMessage}</p>
                            {notificationProduct && notificationType === 'success' && (
                                <div className="notification-product">
                                    <img src={optimizeCloudinaryImage(notificationProduct.image, 50)} alt={notificationProduct.name_product} />
                                    <span>{notificationProduct.name_product}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Normal grid for non-slider sections
    return (
        <div className="product-grid">
            <div className="row">
                {products && products.map(value => (
                    <div key={value._id} className="col-lg-3 col-md-4 col-sm-6 col-12">
                        {renderProductItem(value)}
                    </div>
                ))}
            </div>
            
            {/* Thông báo thêm vào yêu thích thành công */}
            {showNotification && (
                <div className={`notification-modal ${notificationType}`}>
                    <div className="notification-content">
                        <i className={`notification-icon fa ${notificationType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        <p className="notification-message">{notificationMessage}</p>
                        {notificationProduct && notificationType === 'success' && (
                            <div className="notification-product">
                                <img src={optimizeCloudinaryImage(notificationProduct.image, 50)} alt={notificationProduct.name_product} />
                                <span>{notificationProduct.name_product}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home_Product;
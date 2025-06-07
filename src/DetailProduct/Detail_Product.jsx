import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useHistory } from 'react-router-dom';
import Product from '../API/Product';
import { useDispatch, useSelector } from 'react-redux';
import { addCart } from '../Redux/Action/ActionCart';
import { changeCount } from '../Redux/Action/ActionCount';
import { Link } from 'react-router-dom';
import CartsLocal from '../Share/CartsLocal';
import SaleAPI from '../API/SaleAPI';
import CommentAPI from '../API/CommentAPI';
import { Modal } from 'react-bootstrap';
import SimilarProducts from './SimilarProducts';
import './zoom.css'; // Thêm CSS cho hiệu ứng zoom

function Detail_Product(props) {
    const { id } = useParams();
    const history = useHistory();
    const dispatch = useDispatch();
    const [product, set_product] = useState({});
    const [sale, set_sale] = useState(null);
    const count_change = useSelector(state => state.Count.isLoad);
    const [count, set_count] = useState(1);
    const [show_success, set_show_success] = useState(false);
    const [show_error, set_show_error] = useState(false);
    const [error_message, set_error_message] = useState('');
    const [size, set_size] = useState('S');
    const [availableQuantity, setAvailableQuantity] = useState(0);
    const [inventoryS, setInventoryS] = useState('0');
    const [inventoryM, setInventoryM] = useState('0');
    const [inventoryL, setInventoryL] = useState('0');
    const [isFavorite, setIsFavorite] = useState(false);
    
    // Thêm state cho hiệu ứng zoom
    const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
    const [showZoom, setShowZoom] = useState(false);
    
    // Thêm state cho phần review
    const [canReview, setCanReview] = useState(false);
    const [reviewMessage, setReviewMessage] = useState('');
    const [list_comment, set_list_comment] = useState([]);
    const [averageRating, setAverageRating] = useState(0);
    const [modal, set_modal] = useState(false);
    const [star, set_star] = useState(5);
    const [comment, set_comment] = useState('');
    const [validation_comment, set_validation_comment] = useState(false);
    const [totalVariants, setTotalVariants] = useState([]);
    const [show, setShow] = useState(true);
    const [category, setCategory] = useState('');

    // Hàm tính giá sau khi giảm giá
    const calculateDiscountedPrice = (originalPrice, promotionPercentage) => {
        if (!originalPrice || !promotionPercentage) return originalPrice;
        return parseInt(originalPrice) - ((parseInt(originalPrice) * parseInt(promotionPercentage)) / 100);
    };

    // Hàm này dùng để thêm vào giỏ hàng
    const handler_addcart = (e) => {
        e.preventDefault();
        
        // Kiểm tra nếu Product hết hàng theo size đã chọn
        if (availableQuantity <= 0) {
            set_error_message(`Size ${size} đã hết hàng!`);
            set_show_error(true);
            
            setTimeout(() => {
                set_show_error(false);
            }, 3000);
            return;
        }
        
        // Kiểm tra giỏ hàng hiện tại
        const currentCart = CartsLocal.getProduct();
        const existingItem = currentCart.find(item => 
            item.id_product === id && item.size === size
        );
        const existingQuantity = existingItem ? existingItem.count : 0;
        const totalQuantity = existingQuantity + count;
        
        // Kiểm tra nếu tổng số lượng vượt quá tồn kho
        if (totalQuantity > availableQuantity) {
            set_error_message(`Chỉ còn ${availableQuantity} sản phẩm size ${size} trong kho. Bạn đã có ${existingQuantity} trong giỏ hàng. Chỉ có thể thêm tối đa ${availableQuantity - existingQuantity} sản phẩm nữa.`);
            set_show_error(true);
            set_count(Math.min(count, availableQuantity - existingQuantity));
            
            setTimeout(() => {
                set_show_error(false);
            }, 3000);
            return;
        }

        const data = {
            id_cart: Math.random().toString(),
            id_product: id,
            name_product: product.name_product,
            price_product: sale ? calculateDiscountedPrice(product.price_product, sale.promotion) : product.price_product,
            count: count,
            image: product.image,
            size: size,
        };

        CartsLocal.addProduct(data);
        const action_count_change = changeCount(count_change);
        dispatch(action_count_change);
        set_show_success(true);

        setTimeout(() => {
            set_show_success(false);
        }, 3000); // Tăng thời gian hiển thị
    };

    // Hàm này dùng để giảm số lượng
    const downCount = () => {
        if (count === 1) {
            return;
        }
        set_count(count - 1);
    };

    // Hàm này dùng để tăng số lượng
    const upCount = () => {
        // Chỉ cho phép tăng số lượng nếu còn hàng
        if (count < availableQuantity) {
            set_count(count + 1);
        } else {
            set_error_message(`Chỉ còn ${availableQuantity} sản phẩm size ${size} trong kho!`);
            set_show_error(true);
            
            setTimeout(() => {
                set_show_error(false);
            }, 3000);
        }
    };

    // Hàm này dùng để cập nhật số lượng có sẵn khi size thay đổi
    const updateAvailableQuantity = (selectedSize) => {
        if (product && product.inventory) {
            setAvailableQuantity(product.inventory[selectedSize] || 0);
        } else if (product && product.number) {
            // Tương thích ngược với sản phẩm cũ
            setAvailableQuantity(product.number);
        } else {
            setAvailableQuantity(0);
        }
    };

    // Hàm xử lý khi người dùng thay đổi size
    const handleSizeChange = (e) => {
        const selectedSize = e.target.value;
        set_size(selectedSize);
        updateAvailableQuantity(selectedSize);
        
        // Reset số lượng về 1 khi đổi size
        set_count(1);
    };

    // Hàm xử lý gửi comment
    const handler_Comment = async () => {
        if (!comment) {
            set_validation_comment(true);
            return;
        }

        const data = {
            id_product: id,
            id_user: sessionStorage.getItem('id_user'),
            content: comment,
            star: star
        };

        await CommentAPI.post_comment(data,id);
        set_modal(false);
        set_comment('');
        
        // Cập nhật lại danh sách comment
        const fetchComments = async () => {
            const response = await CommentAPI.get_comment(id);
            console.log("Dữ liệu bình luận:", response);
            set_list_comment(response);
        };
        
        fetchComments();
    };
    
    // Hàm xử lý hiệu ứng zoom ảnh
    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        
        setZoomPosition({ x, y });
    };
    
    // Thêm hàm xử lý di chuột vào/ra ảnh
    const handleMouseEnter = () => {
        setShowZoom(true);
    };
    
    const handleMouseLeave = () => {
        setShowZoom(false);
    };

    // Hàm render số sao dựa trên đánh giá trung bình
    const renderStarRating = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating * 2) / 2; // Làm tròn đến 0.5
        
        for (let i = 1; i <= 5; i++) {
            if (i <= roundedRating) {
                // Sao đầy đủ
                stars.push(
                    <i key={i} className="fa fa-star" style={{ color: '#ffc107', marginRight: '2px' }}></i>
                );
            } else if (i - 0.5 === roundedRating) {
                // Nửa sao
                stars.push(
                    <i key={i} className="fa fa-star-half-o" style={{ color: '#ffc107', marginRight: '2px' }}></i>
                );
            } else {
                // Không có sao
                stars.push(
                    <i key={i} className="fa fa-star-o" style={{ color: '#ffc107', marginRight: '2px' }}></i>
                );
            }
        }
        
        return stars;
    };

    // Hàm định dạng ngày giờ
    const formatDate = (dateString) => {
        try {
            // Kiểm tra nếu dateString là chuỗi rỗng hoặc không tồn tại
            if (!dateString) {
                return 'Không có thông tin';
            }
            
            // Nếu là đối tượng Date, sử dụng trực tiếp
            const date = dateString instanceof Date ? dateString : new Date(dateString);
            
            // Kiểm tra nếu ngày không hợp lệ
            if (isNaN(date.getTime())) {
                console.log("Ngày không hợp lệ:", dateString);
                return 'Ngày không hợp lệ';
            }
            
            // Định dạng ngày giờ theo tiếng Việt với giờ:phút ngày/tháng/năm
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            const day = date.getDate().toString().padStart(2, '0');
            const month = (date.getMonth() + 1).toString().padStart(2, '0');
            const year = date.getFullYear();
            
            return `${hours}:${minutes} ${day}/${month}/${year}`;
        } catch (error) {
            console.error("Lỗi khi định dạng ngày:", error, "với dữ liệu:", dateString);
            return 'Ngày không hợp lệ';
        }
    };

    useEffect(() => {
        // Cuộn trang lên đầu khi component được tải
        window.scrollTo(0, 0);
        
        const fetchData = async () => {
            const response = await Product.Get_Detail_Product(id);
            set_product(response);
            
            // Lấy thông tin loại sản phẩm
            if (response.id_category && response.id_category.category) {
                setCategory(response.id_category.category);
            } else if (response.category) {
                setCategory(response.category);
            } else {
                setCategory("Chưa phân loại");
            }
            
            // Cập nhật số lượng có sẵn cho size mặc định (S)
            if (response.inventory) {
                setAvailableQuantity(response.inventory.S || 0);
            } else if (response.number) {
                // Tương thích ngược với sản phẩm cũ
                setAvailableQuantity(response.number);
            }

            // Kiểm tra khuyến mãi
            try {
                const response_sale = await SaleAPI.checkSale(id);
                console.log("Thông tin khuyến mãi:", response_sale);
                
                // Kiểm tra cấu trúc dữ liệu trả về
                if (response_sale && response_sale.msg === "Thanh Cong" && response_sale.sale) {
                    // Kiểm tra xem khuyến mãi có đang active không
                    const saleData = response_sale.sale;
                    const currentDate = new Date();
                    const startDate = new Date(saleData.start);
                    const endDate = new Date(saleData.end);
                    console.log("Ngày hiện tại:", currentDate);
                    console.log("Ngày bắt đầu:", startDate);
                    console.log("Ngày kết thúc:", endDate);
                    if (saleData.status && currentDate >= startDate && currentDate <= endDate) {
                        set_sale(saleData);
                        console.log("Áp dụng khuyến mãi:", saleData.promotion + "%");
                    } else {
                        console.log("Khuyến mãi không còn hiệu lực hoặc chưa bắt đầu");
                        set_sale(null);
                    }
                } else {
                    console.log("Không có khuyến mãi cho sản phẩm này");
                    set_sale(null);
                }
            } catch (error) {
                console.error("Lỗi khi kiểm tra khuyến mãi:", error);
                set_sale(null);
            }
            
            // Lấy danh sách comment
            const response_comment = await CommentAPI.get_comment(id);
            console.log("Dữ liệu bình luận từ API:", response_comment);
            set_list_comment(response_comment);
            
            // Tính điểm đánh giá trung bình
            if (response_comment && response_comment.length > 0) {
                const totalStars = response_comment.reduce((total, comment) => total + comment.star, 0);
                const avgRating = totalStars / response_comment.length;
                setAverageRating(avgRating);
            } else {
                setAverageRating(0);
            }
            
            // Kiểm tra xem người dùng có thể review không
            if (sessionStorage.getItem('id_user')) {
                try {
                    const reviewCheck = await CommentAPI.check_can_review(id, sessionStorage.getItem('id_user'));
                    setCanReview(reviewCheck.canReview);
                    setReviewMessage(reviewCheck.message);
                } catch (error) {
                    console.error("Error checking review permission:", error);
                    setCanReview(false);
                    setReviewMessage("Không thể kiểm tra quyền đánh giá");
                }
            } else {
                setCanReview(false);
                setReviewMessage("Vui lòng đăng nhập để đánh giá sản phẩm");
            }
        };

        fetchData();
    }, [id]);

    return (
        <div className="wrapper">
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                backgroundColor: '#fff',
                padding: '10px 15px',
                display: 'flex',
                alignItems: 'center',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                zIndex: 100
            }}>
                <div className="back-button" onClick={() => history.goBack()} style={{
                    cursor: 'pointer',
                    padding: '8px'
                }}>
                    <i className="fa fa-arrow-left" style={{
                        fontSize: '18px',
                        color: '#333'
                    }}></i>
                </div>
                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px',
                    marginBottom: 0
                }}>
                    Chi tiết sản phẩm
                </div>
                <div className="cart-button" onClick={() => history.push('/cart')} style={{
                    cursor: 'pointer',
                    padding: '8px',
                    marginLeft: 'auto'
                }}>
                    <i className="fa fa-shopping-cart" style={{
                        fontSize: '18px',
                        color: '#333'
                    }}></i>
                </div>
            </div>

            <div style={{ marginTop: '56px' }}></div>

            <div className="content-wraper">
                <div className="container">
                    <div className="row single-product-area">
                        <div className="col-lg-5 col-md-6">
                            <div className="product-details-left" style={{
                                position: 'relative',
                                marginBottom: '30px'
                            }}>
                                {/* Ảnh sản phẩm với hiệu ứng zoom */}
                                <div 
                                    className="product-image-zoom"
                                    onMouseMove={handleMouseMove}
                                    onMouseEnter={handleMouseEnter}
                                    onMouseLeave={handleMouseLeave}
                                >
                                    <img 
                                        src={product.image} 
                                        className="img-fluid" 
                                        alt={product.name_product}
                                    />
                                    {showZoom && (
                                        <div 
                                            className="zoom-overlay"
                                            style={{
                                                backgroundImage: `url(${product.image})`,
                                                backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`
                                            }}
                                        ></div>
                                    )}
                                </div>
                                
                                {sale && (
                                    <div className="product-sale-badge" style={{
                                        position: 'absolute',
                                        top: '10px',
                                        right: '10px',
                                        backgroundColor: '#ff3535',
                                        color: 'white',
                                        padding: '4px 12px',
                                        borderRadius: '20px',
                                        fontWeight: 'bold',
                                        fontSize: '14px',
                                        zIndex: 1
                                    }}>
                                        -{sale.promotion}%
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-lg-7 col-md-6">
                            <div className="product-details-view-content pt-30" style={{
                                backgroundColor: '#fff',
                                padding: '20px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}>
                                <div className="product-info">
                                    <h2 style={{
                                        fontSize: '24px',
                                        fontWeight: 'bold',
                                        marginBottom: '15px',
                                        color: '#333'
                                    }}>{product.name_product}</h2>
                                    
                                    {/* Hiển thị đánh giá sản phẩm */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        marginBottom: '15px',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center'
                                        }}>
                                            <div style={{ display: 'flex', marginRight: '10px' }}>
                                                {renderStarRating(averageRating)}
                                            </div>
                                            <span style={{ color: '#666', fontSize: '14px' }}>
                                                ({list_comment.length} đánh giá)
                                            </span>
                                        </div>
                                        
                                        {sessionStorage.getItem('id_user') && canReview && (
                                            <button 
                                                style={{
                                                    backgroundColor: 'transparent',
                                                    border: '1px solid #fed700',
                                                    color: '#333',
                                                    padding: '5px 10px',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                                onClick={() => set_modal(true)}
                                            >
                                                Viết đánh giá
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="price-box pt-20" style={{
                                        marginBottom: '20px',
                                        padding: '15px',
                                        backgroundColor: '#f9f9f9',
                                        borderRadius: '8px'
                                    }}>
                                        {sale ? (
                                            <>
                                                <span className="new-price" style={{ 
                                                    fontSize: '24px',
                                                    fontWeight: 'bold',
                                                    color: '#e80f0f',
                                                    display: 'block',
                                                    marginBottom: '5px'
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(calculateDiscountedPrice(product.price_product, sale.promotion)) + ' VNĐ'}
                                                </span>
                                                <del style={{ 
                                                    color: '#999',
                                                    fontSize: '16px',
                                                    textDecoration: 'line-through' 
                                                }}>
                                                    {new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product.price_product) + ' VNĐ'}
                                                </del>
                                                <span style={{
                                                    marginLeft: '10px',
                                                    backgroundColor: '#e80f0f',
                                                    color: 'white',
                                                    padding: '2px 5px',
                                                    borderRadius: '3px',
                                                    fontSize: '12px'
                                                }}>
                                                    Tiết kiệm {sale.promotion}%
                                                </span>
                                            </>
                                        ) : (
                                            <span className="new-price" style={{ 
                                                fontSize: '24px',
                                                fontWeight: 'bold',
                                                color: '#e80f0f' 
                                            }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'decimal', decimal: 'VND' }).format(product.price_product) + ' VNĐ'}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="product-desc" style={{
                                        backgroundColor: '#fff',
                                        padding: '0 0 15px 0',
                                        borderBottom: '1px solid #eee',
                                        marginBottom: '20px'
                                    }}>
                                        <h4 style={{
                                            fontSize: '16px',
                                            fontWeight: 'bold',
                                            marginBottom: '10px'
                                        }}>Mô tả sản phẩm:</h4>
                                        <p style={{
                                            color: '#666',
                                            fontSize: '14px',
                                            lineHeight: '1.6'
                                        }}>
                                            <span>{product.describe || "Chưa có mô tả cho sản phẩm này."}</span>
                                        </p>
                                    </div>
                                    <div className="product-variants">
                                        <div className="produt-variants-size">
                                            <h4 style={{
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                marginBottom: '15px'
                                            }}>Chọn size:</h4>
                                            
                                            <div style={{
                                                display: 'flex',
                                                gap: '10px',
                                                marginBottom: '20px'
                                            }}>
                                                {['S', 'M', 'L'].map((sizeOption) => {
                                                    const inventory = product.inventory ? (product.inventory[sizeOption] || 0) : 0;
                                                    const isAvailable = inventory > 0;
                                                    const isSelected = size === sizeOption;
                                                    
                                                    return (
                                                        <button
                                                            key={sizeOption}
                                                            style={{
                                                                width: '80px',
                                                                padding: '10px',
                                                                borderRadius: '8px',
                                                                border: isSelected ? '2px solid #fed700' : '1px solid #ddd',
                                                                backgroundColor: isSelected ? '#fed700' : '#fff',
                                                                color: isSelected ? '#333' : '#666',
                                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                                cursor: isAvailable ? 'pointer' : 'not-allowed',
                                                                opacity: isAvailable ? 1 : 0.5,
                                                                transition: 'all 0.3s',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center'
                                                            }}
                                                            onClick={() => {
                                                                if (isAvailable) {
                                                                    handleSizeChange({ target: { value: sizeOption } });
                                                                }
                                                            }}
                                                            disabled={!isAvailable}
                                                        >
                                                            <span style={{ fontSize: '16px', marginBottom: '5px' }}>{sizeOption}</span>
                                                            <span style={{ 
                                                                fontSize: '12px', 
                                                                color: isAvailable ? '#666' : '#ff4757'
                                                            }}>
                                                                {isAvailable ? `(${inventory})` : '(Hết hàng)'}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="single-add-to-cart">
                                        <form action="#" className="cart-quantity">
                                            <div style={{ marginBottom: '20px' }}>
                                                <h4 style={{ 
                                                    fontSize: '16px', 
                                                    fontWeight: 'bold',
                                                    marginBottom: '15px'
                                                }}>Số lượng:</h4>
                                                
                                                <div style={{
                                                    marginBottom: '15px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        marginBottom: '8px'
                                                    }}>
                                                        <span style={{
                                                            fontSize: '14px',
                                                            color: '#666'
                                                        }}>
                                                            Còn lại: <strong>{availableQuantity}</strong> sản phẩm (Size {size})
                                                        </span>
                                                    </div>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center'
                                                    }}>
                                                        <div style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            overflow: 'hidden',
                                                            width: '120px',
                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                                        }}>
                                                            <button 
                                                                onClick={downCount}
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    border: 'none',
                                                                    cursor: count > 1 ? 'pointer' : 'not-allowed',
                                                                    opacity: count > 1 ? 1 : 0.5,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (count > 1) {
                                                                        e.currentTarget.style.backgroundColor = '#e9e9e9';
                                                                    }
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                }}
                                                                disabled={count <= 1}
                                                            >
                                                                <i className="fa fa-minus" style={{ fontSize: '12px', color: '#555' }}></i>
                                                            </button>
                                                            <input 
                                                                type="text" 
                                                                value={count} 
                                                                onChange={(e) => {
                                                                    const value = parseInt(e.target.value);
                                                                    if (!isNaN(value) && value >= 1 && value <= availableQuantity) {
                                                                        set_count(value);
                                                                    }
                                                                }}
                                                                style={{
                                                                    width: '48px',
                                                                    height: '36px',
                                                                    border: 'none',
                                                                    borderLeft: '1px solid #ddd',
                                                                    borderRight: '1px solid #ddd',
                                                                    textAlign: 'center',
                                                                    fontSize: '14px',
                                                                    fontWeight: '500',
                                                                    color: '#333',
                                                                    backgroundColor: '#fff'
                                                                }}
                                                            />
                                                            <button 
                                                                onClick={upCount}
                                                                style={{
                                                                    width: '36px',
                                                                    height: '36px',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    backgroundColor: '#f5f5f5',
                                                                    border: 'none',
                                                                    cursor: count < availableQuantity ? 'pointer' : 'not-allowed',
                                                                    opacity: count < availableQuantity ? 1 : 0.5,
                                                                    transition: 'all 0.2s'
                                                                }}
                                                                onMouseOver={(e) => {
                                                                    if (count < availableQuantity) {
                                                                        e.currentTarget.style.backgroundColor = '#e9e9e9';
                                                                    }
                                                                }}
                                                                onMouseOut={(e) => {
                                                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                                                }}
                                                                disabled={count >= availableQuantity}
                                                            >
                                                                <i className="fa fa-plus" style={{ fontSize: '12px', color: '#555' }}></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {availableQuantity > 0 ? (
                                                    <div>
                                                        <button 
                                                            className="add-to-cart-button" 
                                                            type="button" 
                                                            onClick={handler_addcart}
                                                            style={{
                                                                backgroundColor: '#fed700',
                                                                border: 'none',
                                                                color: '#333',
                                                                fontWeight: 'bold',
                                                                fontSize: '16px',
                                                                padding: '12px 30px',
                                                                borderRadius: '8px',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s',
                                                                width: '100%',
                                                                marginTop: '10px'
                                                            }}
                                                        >
                                                            <i className="fa fa-shopping-cart" style={{ marginRight: '10px' }}></i>
                                                            Thêm vào giỏ hàng
                                                        </button>
                                                        
                                                        {/* Thêm nút Thêm vào yêu thích */}
                                                        <button 
                                                            className="add-to-wishlist" 
                                                            onClick={() => setIsFavorite(!isFavorite)}
                                                            style={{
                                                                marginTop: '15px',
                                                                width: '100%',
                                                                padding: '10px 15px',
                                                                border: '1px solid #333',
                                                                borderRadius: '4px',
                                                                backgroundColor: 'white',
                                                                color: '#333',
                                                                fontSize: '14px',
                                                                fontWeight: 'bold',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                transition: 'all 0.3s'
                                                            }}
                                                            onMouseOver={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#fed700';
                                                                e.currentTarget.style.borderColor = '#fed700';
                                                            }}
                                                            onMouseOut={(e) => {
                                                                e.currentTarget.style.backgroundColor = 'white';
                                                                e.currentTarget.style.borderColor = '#333';
                                                            }}
                                                        >
                                                            <i className={`fa ${isFavorite ? 'fa-heart' : 'fa-heart-o'}`} style={{ marginRight: '8px' }}></i>
                                                            {isFavorite ? 'Đã thêm vào yêu thích' : 'Thêm vào yêu thích'}
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <button 
                                                        className="out-of-stock-button" 
                                                        type="button" 
                                                        disabled
                                                        style={{
                                                            backgroundColor: '#f5f5f5',
                                                            border: '1px solid #ddd',
                                                            color: '#999',
                                                            fontWeight: 'bold',
                                                            fontSize: '16px',
                                                            padding: '12px 30px',
                                                            borderRadius: '8px',
                                                            width: '100%',
                                                            marginTop: '10px'
                                                        }}
                                                    >
                                                        <i className="fa fa-ban" style={{ marginRight: '10px' }}></i>
                                                        Hết hàng
                                                    </button>
                                                )}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="product-area pt-35">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="li-product-tab">
                                <ul className="nav li-product-menu" style={{
                                    display: 'flex',
                                    justifyContent: 'flex-start',
                                    listStyle: 'none',
                                    padding: '0',
                                    margin: '0 0 30px 0',
                                    borderBottom: '2px solid #e5e5e5'
                                }}>
                                    <li style={{ marginRight: '30px' }}>
                                        <a 
                                            className="active" 
                                            data-toggle="tab" 
                                            href="#description"
                                            style={{
                                                display: 'block',
                                                padding: '10px 5px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: '#333',
                                                position: 'relative',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span>Mô tả</span>
                                            <span style={{
                                                position: 'absolute',
                                                bottom: '-2px',
                                                left: '0',
                                                width: '100%',
                                                height: '2px',
                                                backgroundColor: '#fed700',
                                                display: 'block'
                                            }}></span>
                                        </a>
                                    </li>
                                    <li>
                                        <a 
                                            data-toggle="tab" 
                                            href="#reviews"
                                            style={{
                                                display: 'block',
                                                padding: '10px 5px',
                                                fontSize: '16px',
                                                fontWeight: 'bold',
                                                color: '#666',
                                                position: 'relative',
                                                textDecoration: 'none'
                                            }}
                                        >
                                            <span>Đánh giá</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div className="tab-content">
                        <div id="description" className="tab-pane active show" role="tabpanel">
                            <div className="product-description" style={{
                                backgroundColor: '#fff',
                                padding: '25px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                marginBottom: '30px'
                            }}>
                                <h3 style={{
                                    fontSize: '18px',
                                    fontWeight: 'bold',
                                    marginBottom: '20px',
                                    color: '#333',
                                    borderBottom: '1px solid #eee',
                                    paddingBottom: '10px'
                                }}>Chi tiết sản phẩm</h3>
                                <div style={{
                                    fontSize: '14px',
                                    lineHeight: '1.7',
                                    color: '#666'
                                }}>
                                    <p dangerouslySetInnerHTML={{ __html: product.describe }}></p>
                                </div>
                                
                                <div style={{ 
                                    marginTop: '20px',
                                    padding: '15px',
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: '5px'
                                }}>
                                    <h4 style={{
                                        fontSize: '16px',
                                        fontWeight: 'bold',
                                        marginBottom: '10px',
                                        color: '#333'
                                    }}>Thông tin thêm</h4>
                                    <ul style={{
                                        listStyle: 'none',
                                        padding: 0,
                                        margin: 0
                                    }}>
                                        <li style={{ margin: '8px 0', display: 'flex' }}>
                                            <span style={{ fontWeight: '600', minWidth: '120px' }}>Loại sản phẩm:</span>
                                            <span>{category}</span>
                                        </li>
                                        <li style={{ margin: '8px 0', display: 'flex' }}>
                                            <span style={{ fontWeight: '600', minWidth: '120px' }}>Giới tính:</span>
                                            <span>{product.gender || "Unisex"}</span>
                                        </li>
                                        <li style={{ margin: '8px 0', display: 'flex' }}>
                                            <span style={{ fontWeight: '600', minWidth: '120px' }}>Mã sản phẩm:</span>
                                            <span>{id}</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                        <div id="reviews" className="tab-pane" role="tabpanel">
                            <div className="product-reviews" style={{
                                backgroundColor: '#fff',
                                padding: '25px',
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}>
                                <div className="product-details-comment-block">
                                    <h3 style={{
                                        fontSize: '18px',
                                        fontWeight: 'bold',
                                        marginBottom: '20px',
                                        borderBottom: '1px solid #eee',
                                        paddingBottom: '10px',
                                        color: '#333'
                                    }}>Đánh giá từ khách hàng ({list_comment.length})</h3>
                                    
                                    {/* Thống kê đánh giá */}
                                    <div style={{ 
                                        marginBottom: '25px',
                                        backgroundColor: '#f9f9f9',
                                        padding: '20px',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        <div style={{ 
                                            fontSize: '48px', 
                                            fontWeight: 'bold',
                                            color: '#333',
                                            marginBottom: '10px'
                                        }}>
                                            {list_comment.length > 0 
                                                ? (list_comment.reduce((total, comment) => total + comment.star, 0) / list_comment.length).toFixed(1) 
                                                : '0.0'}
                                        </div>
                                        <div style={{ marginBottom: '10px' }}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <i 
                                                    key={star}
                                                    className={`fa fa-star${list_comment.length > 0 && star <= Math.round(list_comment.reduce((total, comment) => total + comment.star, 0) / list_comment.length) ? '' : '-o'}`} 
                                                    style={{ color: '#ffc107', marginRight: '2px', fontSize: '16px' }}
                                                ></i>
                                            ))}
                                        </div>
                                        <div style={{ color: '#666', fontSize: '14px' }}>
                                            {list_comment.length} đánh giá
                                        </div>
                                    </div>
                                    
                                    {/* Danh sách đánh giá */}
                                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                        {list_comment.length === 0 ? (
                                            <div style={{ 
                                                textAlign: 'center', 
                                                padding: '20px',
                                                color: '#666',
                                                backgroundColor: '#f9f9f9',
                                                borderRadius: '5px'
                                            }}>
                                                <i className="fa fa-comment-o" style={{ fontSize: '32px', marginBottom: '10px', display: 'block' }}></i>
                                                <p>Chưa có đánh giá nào cho sản phẩm này</p>
                                            </div>
                                        ) : (
                                            list_comment.map(value => (
                                                <div className="comment-author-infos pt-25" key={value._id} style={{
                                                    borderBottom: '1px solid #eee',
                                                    paddingBottom: '20px',
                                                    marginBottom: '20px'
                                                }}>
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginBottom: '10px'
                                                    }}>
                                                        <div style={{
                                                            width: '40px',
                                                            height: '40px',
                                                            borderRadius: '50%',
                                                            backgroundColor: '#f0f0f0',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            marginRight: '10px',
                                                            color: '#666',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            {value.id_user && value.id_user.fullname ? value.id_user.fullname.charAt(0).toUpperCase() : ''}
                                                        </div>
                                                        <div>
                                                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{value.id_user && value.id_user.fullname ? value.id_user.fullname : value.id_user ? value.id_user.username : 'Khách'}</span>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginBottom: '8px' }}>
                                                        {[1, 2, 3, 4, 5].map(star => (
                                                            <i 
                                                                key={star}
                                                                className={`fa fa-star${star <= value.star ? '' : '-o'}`} 
                                                                style={{ color: '#ffc107', marginRight: '2px' }}
                                                            ></i>
                                                        ))}
                                                    </div>
                                                    <p style={{ 
                                                        margin: '0px 0 0',
                                                        fontSize: '14px',
                                                        lineHeight: '1.5',
                                                        color: '#333'
                                                    }}>{value.content}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    
                                    {/* Nút đánh giá */}
                                    <div className="review-btn" style={{ 
                                        marginTop: '20px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center'
                                    }}>
                                        {
                                            !sessionStorage.getItem('id_user') ? (
                                                <div style={{ textAlign: 'center', color: '#666' }}>
                                                    <p>Vui lòng <Link to="/login" style={{ color: '#007bff' }}>đăng nhập</Link> để viết đánh giá</p>
                                                </div>
                                            ) : !canReview ? (
                                                <div style={{ 
                                                    padding: '15px', 
                                                    backgroundColor: '#f8f9fa', 
                                                    borderRadius: '5px', 
                                                    marginBottom: '15px',
                                                    color: '#6c757d',
                                                    width: '100%',
                                                    textAlign: 'center'
                                                }}>
                                                    <i className="fa fa-info-circle" style={{ marginRight: '8px' }}></i>
                                                    {reviewMessage || "Bạn cần mua sản phẩm này để đánh giá"}
                                                </div>
                                            ) : (
                                                <button 
                                                    className="nut-danh-gia" 
                                                    style={{
                                                        borderRadius: '4px',
                                                        padding: '10px 20px',
                                                        backgroundColor: '#fed700',
                                                        border: 'none',
                                                        color: '#333',
                                                        fontWeight: 'bold',
                                                        transition: 'all 0.3s',
                                                        cursor: 'pointer'
                                                    }}
                                                    onClick={() => set_modal(true)}
                                                >
                                                    <i className="fa fa-edit" style={{ marginRight: '5px' }}></i>
                                                    Viết đánh giá
                                                </button>
                                            )
                                        }
                                    </div>
                                    
                                    <Modal onHide={() => set_modal(false)} show={modal} className="modal fade modal-wrapper">
                                        <div className="modal-dialog modal-dialog-centered" role="document">
                                            <div className="modal-content" style={{ borderRadius: '10px' }}>
                                                <div className="modal-header" style={{ 
                                                    borderBottom: '1px solid #eee', 
                                                    padding: '15px 20px',
                                                    backgroundColor: '#f8f9fa'
                                                }}>
                                                    <h3 style={{ 
                                                        margin: 0, 
                                                        fontSize: '18px', 
                                                        fontWeight: 'bold',
                                                        color: '#333'
                                                    }}>Đánh giá sản phẩm</h3>
                                                    <button 
                                                        type="button" 
                                                        className="nut-dong" 
                                                        onClick={() => set_modal(false)} 
                                                        style={{ 
                                                            background: 'none', 
                                                            border: 'none', 
                                                            fontSize: '24px',
                                                            cursor: 'pointer'
                                                        }}
                                                    >&times;</button>
                                                </div>
                                                <div className="modal-body" style={{ padding: '20px' }}>
                                                    <div className="product-info" style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center',
                                                        marginBottom: '20px',
                                                        padding: '15px',
                                                        backgroundColor: '#f9f9f9',
                                                        borderRadius: '8px',
                                                        border: '1px solid #eee'
                                                    }}>
                                                        <img src={product.image} alt={product.name_product} style={{ 
                                                            width: '80px', 
                                                            height: '80px', 
                                                            objectFit: 'cover',
                                                            borderRadius: '4px',
                                                            marginRight: '15px',
                                                            border: '1px solid #eee'
                                                        }} />
                                                        <div>
                                                            <h4 style={{ 
                                                                margin: '0 0 8px',
                                                                fontSize: '16px',
                                                                fontWeight: 'bold'
                                                            }}>{product.name_product}</h4>
                                                            <p style={{ 
                                                                margin: 0,
                                                                fontSize: '14px',
                                                                color: '#888'
                                                            }}>
                                                                <span style={{ marginRight: '15px' }}>
                                                                    <i className="fa fa-tag" style={{ marginRight: '5px' }}></i>
                                                                    {category}
                                                                </span>
                                                                <span>
                                                                    <i className="fa fa-tshirt" style={{ marginRight: '5px' }}></i>
                                                                    Size: {size}
                                                                </span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    
                                                    <h5 style={{ 
                                                        marginBottom: '15px',
                                                        fontSize: '16px',
                                                        fontWeight: 'bold',
                                                        color: '#333',
                                                        textAlign: 'center'
                                                    }}>Đánh giá của bạn</h5>
                                                    
                                                    <div className="stars-rating" style={{ 
                                                        display: 'flex',
                                                        justifyContent: 'center',
                                                        marginBottom: '20px',
                                                        backgroundColor: '#f9f9f9',
                                                        padding: '15px',
                                                        borderRadius: '8px'
                                                    }}>
                                                        <div style={{ textAlign: 'center' }}>
                                                            <div style={{ marginBottom: '10px', fontSize: '14px', color: '#666' }}>
                                                                Chọn số sao (1-5)
                                                            </div>
                                                            <div>
                                                                {[1, 2, 3, 4, 5].map(value => (
                                                                    <i 
                                                                        key={value}
                                                                        className={`fa fa-star${value <= star ? '' : '-o'}`}
                                                                        style={{ 
                                                                            fontSize: '32px',
                                                                            color: value <= star ? '#ffc107' : '#ccc',
                                                                            margin: '0 8px',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s'
                                                                        }}
                                                                        onClick={() => set_star(value)}
                                                                        onMouseOver={(e) => {
                                                                            if (value > star) {
                                                                                e.currentTarget.className = 'fa fa-star';
                                                                                e.currentTarget.style.color = '#ffc107';
                                                                            }
                                                                        }}
                                                                        onMouseOut={(e) => {
                                                                            if (value > star) {
                                                                                e.currentTarget.className = 'fa fa-star-o';
                                                                                e.currentTarget.style.color = '#ccc';
                                                                            }
                                                                        }}
                                                                    ></i>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ marginBottom: '20px' }}>
                                                        <label style={{ 
                                                            display: 'block', 
                                                            marginBottom: '8px',
                                                            fontSize: '14px',
                                                            fontWeight: '500'
                                                        }}>
                                                            Nội dung đánh giá:
                                                        </label>
                                                        <textarea 
                                                            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..." 
                                                            className="form-control" 
                                                            rows="5"
                                                            style={{ 
                                                                border: validation_comment ? '1px solid #dc3545' : '1px solid #ddd',
                                                                borderRadius: '8px',
                                                                padding: '12px',
                                                                fontSize: '14px',
                                                                width: '100%',
                                                                resize: 'vertical'
                                                            }}
                                                            onChange={(e) => {
                                                                set_comment(e.target.value);
                                                                if(e.target.value) set_validation_comment(false);
                                                            }}
                                                            value={comment}
                                                        ></textarea>
                                                        {validation_comment && 
                                                            <p style={{ 
                                                                color: '#dc3545', 
                                                                fontSize: '13px', 
                                                                marginTop: '5px',
                                                                display: 'flex',
                                                                alignItems: 'center'
                                                            }}>
                                                                <i className="fa fa-exclamation-circle" style={{ marginRight: '5px' }}></i>
                                                                Vui lòng nhập nội dung đánh giá
                                                            </p>
                                                        }
                                                    </div>
                                                </div>
                                                <div className="modal-footer" style={{ 
                                                    borderTop: '1px solid #eee',
                                                    padding: '15px 20px',
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    backgroundColor: '#f8f9fa'
                                                }}>
                                                    <button 
                                                        type="button" 
                                                        className="nut-huy"
                                                        style={{
                                                            backgroundColor: '#f8f9fa',
                                                            border: '1px solid #ddd',
                                                            borderRadius: '4px',
                                                            padding: '8px 15px',
                                                            color: '#333',
                                                            fontWeight: '500',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={() => set_modal(false)}
                                                    >
                                                        Hủy
                                                    </button>
                                                    <button 
                                                        type="button" 
                                                        className="nut-gui-danh-gia"
                                                        style={{
                                                            backgroundColor: '#fed700',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            padding: '8px 20px',
                                                            color: '#333',
                                                            fontWeight: 'bold',
                                                            cursor: 'pointer'
                                                        }}
                                                        onClick={handler_Comment}
                                                    >
                                                        Gửi đánh giá
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Modal>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Sản phẩm tương tự */}
            <SimilarProducts id={id} />
            
            {/* Thông báo thêm vào giỏ hàng thành công */}
            {show_success && (
                <div className="success-notification" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '300px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa fa-check-circle" style={{ marginRight: '10px', fontSize: '20px' }}></i>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Đã thêm vào giỏ hàng</div>
                            <div style={{ fontSize: '14px' }}>{product.name_product} (Size: {size})</div>
                        </div>
                    </div>
                    <button 
                        className="btn btn-warning" 
                        style={{ 
                            fontSize: '12px', 
                            padding: '5px 10px',
                            marginLeft: '10px',
                            whitespace: 'nowrap',
                            backgroundColor: '#ffc107',
                            borderColor: '#ffc107'
                        }}
                        onClick={() => history.push('/cart')}
                    >
                        Xem giỏ hàng
                    </button>
                </div>
            )}
            
            {/* Thông báo lỗi khi thêm sản phẩm quá số lượng */}
            {show_error && (
                <div className="error-notification" style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    padding: '15px 20px',
                    borderRadius: '4px',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    width: '330px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <i className="fa fa-exclamation-circle" style={{ marginRight: '10px', fontSize: '20px' }}></i>
                        <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Không thể thêm vào giỏ hàng</div>
                            <div style={{ fontSize: '14px' }}>{error_message}</div>
                        </div>
                    </div>
                    <button 
                        className="btn btn-light" 
                        style={{ 
                            fontSize: '12px', 
                            padding: '5px 10px',
                            marginLeft: '10px',
                            whitespace: 'nowrap',
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderColor: 'transparent',
                            color: 'white'
                        }}
                        onClick={() => set_show_error(false)}
                    >
                        Đóng
                    </button>
                </div>
            )}
        </div>
    );
}

export default Detail_Product;

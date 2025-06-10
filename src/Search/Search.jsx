import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import InfiniteScroll from 'react-infinite-scroll-component';
import queryString from 'query-string'
import Product from '../API/Product';
import './Search.css'
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector, useDispatch } from 'react-redux';
import { changeCount } from '../Redux/Action/ActionCount';
import CartsLocal from '../Share/CartsLocal';

Search.propTypes = {

};

function Search(props) {
    const dispatch = useDispatch();
    const id_user = useSelector(state => state.Session.idUser) || sessionStorage.getItem('id_user');
    const count_change = useSelector(state => state.Count.isLoad);

    const [products, set_products] = useState([])
    const [page, set_page] = useState(1)
    const [show_load, set_show_load] = useState(true)
    const [loading, setLoading] = useState(true)
    const [selectedSize, setSelectedSize] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        setSearchTerm(sessionStorage.getItem('search') || '')
        
        setTimeout(() => {
            const fetchData = async () => {
                const params = {
                    page: page,
                    count: '8', // Increased count for better grid layout
                    search: sessionStorage.getItem('search')
                }

                const query = '?' + queryString.stringify(params)

                const response = await Product.get_search_list(query)

                if (response.length < 1) {
                    set_show_load(false)
                }

                set_products(prev => [...prev, ...response])
                setLoading(false)
            }

            fetchData()
        }, 1500) // Reduced loading time for better UX
    }, [page])

    // Handle add to cart with size selection
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
            // Get product details to check inventory
            const productDetail = await Product.Get_Detail_Product(product._id);
            const inventory = productDetail.inventory || { S: 10, M: 10, L: 10 }; // Fallback
            
            // Create available sizes list
            const availableSizes = Object.entries(inventory)
                .filter(([_, quantity]) => quantity > 0)
                .map(([size]) => size);
            
            if (availableSizes.length === 0) {
                Swal.fire({
                    title: 'Thông báo',
                    text: 'Sản phẩm này hiện đã hết hàng!',
                    icon: 'info',
                    confirmButtonText: 'Đóng',
                });
                return;
            }
            
            // Show size selection dialog
            const { value: size } = await Swal.fire({
                title: 'Chọn kích thước',
                html: `
                    <div class="size-selection-dialog">
                        <p>Vui lòng chọn kích thước phù hợp:</p>
                        <div class="size-options">
                            ${availableSizes.map(size => 
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

    const viewQuickDetail = (productId) => {
        // Reset selected size when opening modal
        setSelectedSize(null);
    };

    // Format price with VND
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="search-results-container pt-60 pb-60">
            <div className="container">
                <div className="row">
                    <div className="col-lg-12">
                        <div className="search-header">
                            <h2 className="search-title">Kết quả tìm kiếm</h2>
                            <p className="search-summary">
                                {loading ? 'Đang tìm kiếm...' : 
                                  products.length > 0 ? 
                                    `Tìm thấy ${products.length} sản phẩm cho "${searchTerm}"` : 
                                    `Không tìm thấy sản phẩm nào cho "${searchTerm}"`
                                }
                            </p>
                        </div>

                        {loading ? (
                            <div className="search-loading">
                                <div className="spinner-container">
                                    <div className="spinner-border" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="search-results">
                                <InfiniteScroll
                                    dataLength={products.length}
                                    next={() => set_page(page + 1)}
                                    hasMore={show_load}
                                    loader={
                                        <div className="loading-more">
                                            <div className="spinner-border spinner-border-sm" role="status">
                                                <span className="sr-only">Đang tải thêm...</span>
                                            </div>
                                            <span>Đang tải thêm sản phẩm...</span>
                                        </div>
                                    }
                                    endMessage={
                                        <p className="end-message">
                                            {products.length > 0 ? "Đã hiển thị tất cả sản phẩm" : "Không tìm thấy sản phẩm nào"}
                                        </p>
                                    }
                                >
                                    <div className="row search-products-grid">
                                        {products.map(product => (
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
                                                        
                                                        {/* Badges */}
                                                        <div className="product-badges">
                                                            {product.promotion > 0 && (
                                                                <span className="badge badge-sale">-{product.promotion}%</span>
                                                            )}
                                                            {new Date(product.createdAt) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) && (
                                                                <span className="badge badge-new">New</span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Quick action buttons */}
                                                        <div className="product-actions">
                                                            <button 
                                                                className="action-btn view-btn"
                                                                data-toggle="modal"
                                                                data-target={`#modal-${product._id}`}
                                                                onClick={() => viewQuickDetail(product._id)}
                                                                title="Xem nhanh"
                                                            >
                                                                <i className="fa fa-eye"></i>
                                                            </button>
                                                            <button 
                                                                className="action-btn cart-btn"
                                                                onClick={(e) => handleAddToCart(e, product)}
                                                                title="Thêm vào giỏ hàng"
                                                            >
                                                                <i className="fa fa-shopping-cart"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="product-info">
                                                        {/* Product name */}
                                                        <h3 className="product-title">
                                                            <Link to={`/detail/${product._id}`}>
                                                                {product.name_product}
                                                            </Link>
                                                        </h3>
                                                        
                                                        {/* Description */}
                                                        <p className="product-description">
                                                            {product.describe && product.describe.length > 100 
                                                                ? product.describe.substring(0, 100) + '...' 
                                                                : product.describe}
                                                        </p>
                                                        
                                                        {/* Price */}
                                                        <div className="product-price">
                                                            {product.promotion > 0 ? (
                                                                <>
                                                                    <span className="price-sale">
                                                                        {formatPrice(product.price_product - (product.price_product * product.promotion / 100))}
                                                                    </span>
                                                                    <span className="price-original">
                                                                        {formatPrice(product.price_product)}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="price-regular">
                                                                    {formatPrice(product.price_product)}
                                                                </span>
                                                            )}
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
                                </InfiniteScroll>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal chi tiết sản phẩm */}
            {products.map(product => (
                <div className="modal fade modal-wrapper" key={`modal-${product._id}`} id={`modal-${product._id}`}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
                        <div className="modal-content">
                            <div className="modal-body">
                                <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </button>
                                <div className="modal-inner-area row">
                                    <div className="col-lg-5 col-md-6 col-sm-12">
                                        <div className="product-details-left">
                                            <div className="product-details-images">
                                                <div className="lg-image-container">
                                                    <img 
                                                        src={product.image} 
                                                        alt={product.name_product} 
                                                        className="img-fluid product-preview-image" 
                                                    />
                                                    {product.promotion > 0 && (
                                                        <span className="product-discount-badge">-{product.promotion}%</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-lg-7 col-md-6 col-sm-12">
                                        <div className="product-details-view-content">
                                            <div className="product-info">
                                                <h2 className="product-name">{product.name_product}</h2>
                                                
                                                <div className="product-details-rating mt-3 mb-2">
                                                    <div className="rating-stars">
                                                        <i className="fa fa-star"></i>
                                                        <i className="fa fa-star"></i>
                                                        <i className="fa fa-star"></i>
                                                        <i className="fa fa-star-half-o"></i>
                                                        <i className="fa fa-star-o"></i>
                                                    </div>
                                                    <span className="rating-count">(4 đánh giá)</span>
                                                </div>
                                                
                                                <div className="price-box">
                                                    {product.promotion > 0 ? (
                                                        <>
                                                            <span className="new-price" style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '24px'}}>
                                                                {formatPrice(product.price_product - (product.price_product * product.promotion / 100))}
                                                            </span>
                                                            <span className="old-price" style={{textDecoration: 'line-through', color: '#999', marginLeft: '10px'}}>
                                                                {formatPrice(product.price_product)}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="current-price" style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '24px'}}>
                                                            {formatPrice(product.price_product)}
                                                        </span>
                                                    )}
                                                </div>
                                                
                                                <div className="product-description mt-3">
                                                    <h5>Mô tả sản phẩm:</h5>
                                                    <p>{product.describe}</p>
                                                </div>
                                                
                                                <div className="size-selection mt-4">
                                                    <h5>Kích thước:</h5>
                                                    <div className="size-options">
                                                        <div className="size-option-container">
                                                            {product.inventory && Object.entries(product.inventory).map(([size, quantity]) => (
                                                                quantity > 0 && (
                                                                    <div 
                                                                        key={size}
                                                                        className={`size-option ${selectedSize === size ? 'active' : ''}`} 
                                                                        onClick={() => setSelectedSize(size)}
                                                                    >
                                                                        {size}
                                                                    </div>
                                                                )
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="action-buttons mt-4">
                                                    <button 
                                                        className="add-to-cart-btn" 
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                    >
                                                        <i className="fa fa-shopping-cart mr-2"></i>
                                                        Thêm vào giỏ hàng
                                                    </button>
                                                    <Link to={`/detail/${product._id}`} className="view-details-btn">
                                                        <i className="fa fa-external-link mr-2"></i>
                                                        Xem chi tiết
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Search;
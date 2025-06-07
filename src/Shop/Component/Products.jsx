import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Product from '../../API/Product';
import SaleAPI from '../../API/SaleAPI';

Products.propTypes = {
    products: PropTypes.array,
    sort: PropTypes.string
};

Products.defaultProps = {
    products: [],
    sort: ''
}

function Products(props) {
    const { products, sort } = props
    const [productStats, setProductStats] = useState({});
    const [productSales, setProductSales] = useState({});

    // Lấy thông tin khuyến mãi cho tất cả sản phẩm
    useEffect(() => {
        const fetchSaleData = async () => {
            if (products && products.length > 0) {
                try {
                    // Lấy danh sách tất cả khuyến mãi
                    const allSales = await SaleAPI.getList();
                    const salesMap = {};
                    
                    // Lọc và áp dụng khuyến mãi cho từng sản phẩm
                    if (allSales && allSales.length > 0) {
                        allSales.forEach(sale => {
                            // Kiểm tra xem khuyến mãi có đang active không
                            const currentDate = new Date();
                            const startDate = new Date(sale.start);
                            const endDate = new Date(sale.end);
                            
                            if (sale.status && currentDate >= startDate && currentDate <= endDate) {
                                // Lưu thông tin khuyến mãi theo id sản phẩm
                                if (sale.id_product && sale.id_product._id) {
                                    salesMap[sale.id_product._id] = sale;
                                }
                            }
                        });
                    }
                    
                    setProductSales(salesMap);
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu khuyến mãi:", error);
                }
            }
        };
        
        fetchSaleData();
    }, [products]);

    // Lấy thống kê sản phẩm (đánh giá, số lượng bán)
    useEffect(() => {
        const fetchProductStats = async () => {
            if (products && products.length > 0) {
                const statsPromises = products.map(product => 
                    Product.Get_Product_Stats(product._id)
                        .then(response => ({ id: product._id, stats: response }))
                        .catch(error => ({ id: product._id, stats: { averageRating: 0, totalSold: 0 } }))
                );
                
                const results = await Promise.all(statsPromises);
                const statsMap = {};
                
                results.forEach(result => {
                    statsMap[result.id] = result.stats;
                });
                
                setProductStats(statsMap);
            }
        };
        
        fetchProductStats();
    }, [products]);

    // Hàm tính giá sau khi giảm giá
    const calculateDiscountedPrice = (originalPrice, promotionPercentage) => {
        if (!originalPrice || !promotionPercentage) return originalPrice;
        return parseInt(originalPrice) - ((parseInt(originalPrice) * parseInt(promotionPercentage)) / 100);
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

    // Hàm cắt mô tả sản phẩm nếu dài hơn 100 ký tự
    const truncateDescription = (text) => {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    if (sort === 'DownToUp') {
        products.sort((a, b) => {
            return a.price_product - b.price_product
        });
    }
    else if (sort === 'UpToDown') {
        products.sort((a, b) => {
            return b.price_product - a.price_product
        });
    }

    return (
        <div className="row">
            {
                products && products.map(value => {
                    const stats = productStats[value._id] || { averageRating: 0, totalSold: 0 };
                    const sale = productSales[value._id];
                    const hasPromotion = sale && sale.promotion > 0;
                    const discountedPrice = hasPromotion ? calculateDiscountedPrice(value.price_product, sale.promotion) : value.price_product;
                    const promotionPercent = hasPromotion ? sale.promotion : (value.promotion > 0 ? value.promotion : 0);
                    
                    return (
                        <div className="col-lg-4 col-md-4 col-sm-6 mb-4" key={value._id}>
                            <div className="product-item" style={{
                                border: '1px solid #e5e5e5',
                                borderRadius: '8px',
                                overflow: 'hidden',
                                backgroundColor: '#fff',
                                position: 'relative',
                                height: '410px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s',
                                fontFamily: 'Montserrat, sans-serif',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'translateY(-5px)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
                                e.currentTarget.style.transform = 'translateY(0)';
                            }}>
                                <div style={{position: 'relative', height: '200px', overflow: 'hidden'}}>
                                    <Link to={`/detail/${value._id}`}>
                                        <img src={value.image} style={{
                                            width: "100%", 
                                            height: "200px", 
                                            objectFit: "cover",
                                            display: "block"
                                        }} alt={value.name_product} />
                                    </Link>
                                    {promotionPercent > 0 && (
                                        <span style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            backgroundColor: '#ff3535',
                                            color: 'white',
                                            padding: '2px 8px',
                                            borderRadius: '20px',
                                            fontSize: '12px',
                                            fontWeight: 'bold'
                                        }}>-{promotionPercent}%</span>
                                    )}
                                </div>
                                
                                <div style={{padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                                    <div style={{marginBottom: '8px'}}>
                                        <span style={{color: '#ddd', fontSize: '12px'}}>
                                            {renderStars(stats.averageRating)}
                                        </span>
                                    </div>
                                    
                                    <h3 style={{
                                        fontSize: '15px',
                                        fontWeight: '500',
                                        lineHeight: '1.4',
                                        marginBottom: '8px',
                                        height: '42px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '2',
                                        WebkitBoxOrient: 'vertical',
                                        fontFamily: 'Montserrat, sans-serif',
                                    }}>
                                        <Link to={`/detail/${value._id}`} style={{color: '#333', textDecoration: 'none'}}>
                                            {value.name_product}
                                </Link>
                                    </h3>
                                    
                                    <div style={{
                                        fontSize: '13px',
                                        color: '#666',
                                        marginBottom: '10px',
                                        height: '60px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        display: '-webkit-box',
                                        WebkitLineClamp: '3',
                                        WebkitBoxOrient: 'vertical',
                                        fontFamily: 'Montserrat, sans-serif',
                                    }}>
                                        {truncateDescription(value.describe)}
                                    </div>
                                    
                                    <div style={{marginTop: 'auto'}}>
                                        {promotionPercent > 0 ? (
                                            <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                                <div style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Montserrat, sans-serif'}}>
                                                    {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(discountedPrice) + ' VND'}
                                                </div>
                                                <del style={{color: '#999', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Montserrat, sans-serif'}}>
                                                    {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product) + ' VND'}
                                                </del>
                            </div>
                                        ) : (
                                            <div style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Montserrat, sans-serif'}}>
                                                {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product) + ' VND'}
                                        </div>
                                        )}
                                    </div>
                                    
                                    <div style={{
                                        fontSize: '12px', 
                                        color: '#666', 
                                        marginTop: '5px',
                                        fontFamily: 'Montserrat, sans-serif'
                                    }}>
                                        Đã bán: {stats.totalSold || 0}
                                    </div>
                                </div>
                                
                                <div className="product-actions" style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    right: '10px',
                                    display: 'none',
                                    transition: 'all 0.3s',
                                    gap: '5px'
                                }}>
                                    <Link to={`/detail/${value._id}`} className="btn btn-sm btn-light mr-2"
                                        style={{width: '30px', height: '30px', padding: '0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                    >
                                        <i className="fa fa-eye"></i>
                                    </Link>
                                    <button 
                                        className="btn btn-sm btn-light"
                                        style={{width: '30px', height: '30px', padding: '0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}
                                    >
                                        <i className="fa fa-heart-o"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}

export default Products;
import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import Product from '../API/Product';

function SimilarProducts({ id }) {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const history = useHistory();

    useEffect(() => {
        const fetchSimilarProducts = async () => {
            try {
                setLoading(true);
                const data = await Product.Get_Similar_Products(id);
                setProducts(data);
            } catch (error) {
                console.error('Error loading similar products:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSimilarProducts();
    }, [id]);

    // Hàm tính giá sau khi giảm giá
    const calculateDiscountedPrice = (originalPrice, promotionPercentage) => {
        if (!originalPrice || !promotionPercentage) return originalPrice;
        return parseInt(originalPrice) - ((parseInt(originalPrice) * parseInt(promotionPercentage)) / 100);
    };

    // Hàm format giá tiền
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'decimal' }).format(price) + ' VNĐ';
    };
    
    // Hàm điều hướng và cuộn lên đầu trang
    const handleProductClick = (productId) => {
        history.push(`/detail/${productId}`);
        window.scrollTo(0, 0);
    };

    if (loading) {
        return (
            <div className="similar-products-section" style={{ marginTop: '30px', marginBottom: '50px' }}>
                <div className="container">
                    <div className="li-section-title" style={{ marginBottom: '30px' }}>
                        <h2 style={{ 
                            fontSize: '24px', 
                            fontWeight: 'bold', 
                            position: 'relative',
                            paddingBottom: '10px'
                        }}>
                            <span style={{ position: 'relative', zIndex: 1 }}>Sản phẩm tương tự</span>
                            <span style={{ 
                                position: 'absolute', 
                                bottom: 0, 
                                left: 0, 
                                width: '50px', 
                                height: '3px', 
                                backgroundColor: '#fed700'
                            }}></span>
                        </h2>
                    </div>
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{ 
                                textAlign: 'center', 
                                padding: '40px 0',
                                color: '#666'
                            }}>
                                <i className="fa fa-refresh fa-spin" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                                <p>Đang tải sản phẩm tương tự...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <div className="similar-products-section" style={{ marginTop: '30px', marginBottom: '50px' }}>
            <div className="container">
                <div className="li-section-title" style={{ marginBottom: '30px' }}>
                    <h2 style={{ 
                        fontSize: '24px', 
                        fontWeight: 'bold', 
                        position: 'relative',
                        paddingBottom: '10px'
                    }}>
                        <span style={{ position: 'relative', zIndex: 1 }}>Sản phẩm tương tự</span>
                        <span style={{ 
                            position: 'absolute', 
                            bottom: 0, 
                            left: 0, 
                            width: '50px', 
                            height: '3px', 
                            backgroundColor: '#fed700'
                        }}></span>
                    </h2>
                </div>
                <div className="row">
                    {products.map(product => (
                        <div className="col-lg-3 col-md-4 col-sm-6" key={product._id}>
                            <div className="product-item" 
                                onClick={() => handleProductClick(product._id)}
                                style={{
                                    border: '1px solid #e5e5e5', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden', 
                                    backgroundColor: '#fff', 
                                    position: 'relative', 
                                    height: '360px', 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    transition: 'all 0.3s', 
                                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)', 
                                    marginBottom: '20px',
                                    cursor: 'pointer'
                                }}
                            >
                                <div style={{ position: 'relative', height: '200px', overflow: 'hidden' }}>
                                    <img 
                                        src={product.image} 
                                        style={{ 
                                            width: '100%', 
                                            height: '200px', 
                                            objectFit: 'cover', 
                                            display: 'block' 
                                        }} 
                                        alt={product.name_product} 
                                    />
                                    {product.promotion > 0 && (
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
                                        }}>
                                            -{product.promotion}%
                                        </span>
                                    )}
                                </div>
                                <div style={{ 
                                    padding: '15px', 
                                    flexGrow: 1, 
                                    display: 'flex', 
                                    flexDirection: 'column' 
                                }}>
                                    <h3 style={{ 
                                        fontSize: '15px', 
                                        fontWeight: '500', 
                                        lineHeight: '1.4', 
                                        marginBottom: '8px', 
                                        height: '42px', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        display: '-webkit-box', 
                                        WebkitLineClamp: 2, 
                                        WebkitBoxOrient: 'vertical' 
                                    }}>
                                        {product.name_product}
                                    </h3>
                                    <div style={{ marginTop: 'auto' }}>
                                        {product.promotion > 0 ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ color: '#e80f0f', fontWeight: 'bold', fontSize: '15px' }}>
                                                    {formatPrice(calculateDiscountedPrice(product.price_product, product.promotion))}
                                                </div>
                                                <del style={{ color: '#999', fontSize: '13px', fontStyle: 'italic' }}>
                                                    {formatPrice(product.price_product)}
                                                </del>
                                            </div>
                                        ) : (
                                            <div style={{ color: '#e80f0f', fontWeight: 'bold', fontSize: '15px' }}>
                                                {formatPrice(product.price_product)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default SimilarProducts; 
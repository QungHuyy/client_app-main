import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Product from '../../API/Product';
import queryString from 'query-string'
import { Link } from 'react-router-dom';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
            // Thêm transformation vào URL Cloudinary
            return url.replace('/upload/', `/upload/w_${width},h_${width},c_fill/`);
        }
        return url;
    };

    // Hàm cắt mô tả sản phẩm nếu dài hơn 100 ký tự
    const truncateDescription = (text) => {
        if (!text) return '';
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    };

    // Tạo component sản phẩm theo thiết kế mẫu Sản Phẩm Giảm Giá
    const renderProductItem = (value) => {
                                    // Kiểm tra xem value có tồn tại không
                                    if (!value) return null;
        
        // Lấy thông tin thống kê sản phẩm
        const stats = productStats[value._id] || { averageRating: 0, totalSold: 0 };

                                    return (
            <div key={value._id} style={{padding: '10px'}}>
                <div className="product-item" style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '0',
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    position: 'relative',
                    marginBottom: '20px',
                    height: '410px', // Tăng chiều cao để chứa thêm thông tin số lượng đã bán
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s',
                    fontFamily: 'Montserrat, sans-serif',
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
                    const actions = e.currentTarget.querySelector('.product-actions');
                    if (actions) actions.style.display = 'flex';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    const actions = e.currentTarget.querySelector('.product-actions');
                    if (actions) actions.style.display = 'none';
                }}>
                    <div style={{position: 'relative', height: '200px', width: '200px', overflow: 'hidden', margin: '0 auto'}}>
                                                <Link to={`/detail/${value._id}`}>
                            <img src={optimizeCloudinaryImage(value.image)} alt={value.name_product} 
                                style={{
                                    width: "200px", 
                                    height: "200px", 
                                    objectFit: "cover",
                                    display: "block"
                                }} 
                            />
                        </Link>
                        {value.promotion > 0 && (
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
                            }}>-{value.promotion}%</span>
                        )}
                    </div>
                    
                    <div style={{padding: '10px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                        <div className="rating" style={{marginBottom: '8px'}}>
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
                            {value.promotion > 0 ? (
                                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                                    <div style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '15px', fontFamily: 'Montserrat, sans-serif'}}>
                                        {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(value.price_product - (value.price_product * value.promotion / 100)) + ' VND'}
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
                        <button 
                            className="btn btn-sm btn-light mr-2"
                                                            data-toggle="modal"
                                                            data-target={`#${value._id}`}
                            onClick={() => GET_id_modal(`${value._id}`)}
                            style={{width: '30px', height: '30px', padding: '0', borderRadius: '50%'}}
                        >
                            <i className="fa fa-eye"></i>
                        </button>
                        <button 
                            className="btn btn-sm btn-light"
                            style={{width: '30px', height: '30px', padding: '0', borderRadius: '50%'}}
                        >
                            <i className="fa fa-heart-o"></i>
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
        // Sử dụng cài đặt slider phù hợp dựa vào có phải là slider cho gender hay không
        const currentSliderSettings = gender ? horizontalSliderSettings : sliderSettings;
        
        // Đảm bảo autoplay được bật, bất kể prop autoScroll là gì
        const finalSettings = {
            ...currentSliderSettings,
            autoplay: true,
            swipeToSlide: true,
            touchMove: true
        };
        
        return (
            <div className="product-slider-container" style={{position: 'relative', margin: '0 -10px'}}>
                <Slider {...finalSettings} className="product-slider">
                    {products && products.map(value => renderProductItem(value))}
                        </Slider>
                    </div>
        );
    }

    // Grid layout (fallback)
    return (
        <div className="row">
            {products && products.map(value => (
                <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={value._id} style={{padding: '0 15px'}}>
                    {renderProductItem(value)}
                </div>
            ))}
            </div>
    );
}

export default Home_Product;
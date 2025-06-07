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
    slider: PropTypes.bool
};

Home_Product.defaultProps = {
    gender: '',
    category: '',
    GET_id_modal: null,
    products: null,
    slider: false
}

function Home_Product(props) {

    const { gender, category, GET_id_modal, products: initialProducts, slider } = props

    var settings = {
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 2000,
        pauseOnHover: true,
        initialSlide: 0,
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
                    slidesToScroll: 2,
                    initialSlide: 2
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

    // Hàm này dùng gọi API trả lại dữ liệu product category
    useEffect(() => {
        // Nếu có sẵn danh sách sản phẩm được truyền vào thì sử dụng nó
        if (initialProducts) {
            set_products(initialProducts)
            return
        }

        // Ngược lại thì gọi API để lấy sản phẩm theo giới tính và danh mục
        const fetchData = async () => {
            try {
                // Nếu có gender thì gọi API lấy sản phẩm theo gender
                if (gender && gender !== '') {
                    // Chuẩn bị tham số cho API call
                    const params = {
                        gender: gender.toLowerCase()
                    }
                    
                    // Nếu có category và khác 'all' thì thêm vào params
                    if (category && category !== 'all') {
                        params.id_category = category
                    }
                    
                    const query = '?' + queryString.stringify(params)
                    const response = await Product.Get_Category_Product(query)
                    set_products(response.slice(0, 8))
                } 
                // Nếu không có gender nhưng có category
                else if (category && category !== 'all') {
                    const params = {
                        id_category: category
                    }
                    const query = '?' + queryString.stringify(params)
                    const response = await Product.Get_Category_Product(query)
                    set_products(response.slice(0, 8))
                }
                // Nếu không có cả hai thì lấy tất cả sản phẩm
                else {
                    const response = await Product.Get_All_Product()
                    set_products(response.slice(0, 8))
                }
            } catch (error) {
                console.error("Error fetching products:", error)
                set_products([])
            }
        }

        fetchData()
    }, [initialProducts, category, gender])

    // Hàm tối ưu URL Cloudinary
    const optimizeCloudinaryImage = (url, width = 300) => {
        if (url && url.includes('cloudinary.com')) {
            // Thêm transformation vào URL Cloudinary
            return url.replace('/upload/', `/upload/w_${width},c_scale/`);
        }
        return url;
    };

    // Tạo component sản phẩm theo thiết kế yêu cầu
    const renderProductItem = (value) => {
        // Kiểm tra xem value có tồn tại không
        if (!value) return null;

        return (
            <div className="col-lg-3 col-md-4 col-sm-6 mb-4" key={value._id}>
                <div className="product-card" style={{
                    border: '1px solid #e5e5e5',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    height: '100%',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s',
                    backgroundColor: '#fff',
                    position: 'relative'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                }}>
                    <div style={{position: 'relative'}}>
                        <Link to={`/detail/${value._id}`}>
                            <img src={optimizeCloudinaryImage(value.image)} alt={value.name_product} 
                                style={{
                                    width:"100%", 
                                    height:"280px", 
                                    objectFit:"cover",
                                    borderTopLeftRadius: '8px',
                                    borderTopRightRadius: '8px'
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
                                padding: '2px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>-{value.promotion}%</span>
                        )}
                        {!value.promotion && (
                            <span style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                backgroundColor: '#0070dc',
                                color: 'white',
                                padding: '2px 10px',
                                borderRadius: '20px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                            }}>New</span>
                        )}
                    </div>
                    <div style={{padding: '15px', borderTop: '1px solid #f5f5f5', backgroundColor: 'white'}}>
                        <div className="text-center">
                            <div className="rating-box mb-2">
                                <ul className="rating d-flex justify-content-center">
                                    <li style={{display: 'inline'}}><i className="fa fa-star-o"></i></li>
                                    <li style={{display: 'inline'}}><i className="fa fa-star-o"></i></li>
                                    <li style={{display: 'inline'}}><i className="fa fa-star-o"></i></li>
                                    <li style={{display: 'inline'}} className="no-star"><i className="fa fa-star-o"></i></li>
                                    <li style={{display: 'inline'}} className="no-star"><i className="fa fa-star-o"></i></li>
                                </ul>
                            </div>
                            <h5 style={{
                                fontSize: '16px', 
                                fontWeight: 'bold',
                                height: '44px',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: '2',
                                WebkitBoxOrient: 'vertical',
                                marginBottom: '10px'
                            }}>
                                <Link to={`/detail/${value._id}`} style={{color: '#333'}}>{value.name_product}</Link>
                            </h5>
                            <div className="price-box mb-2">
                                {value.promotion > 0 ? (
                                    <>
                                        <del style={{color: '#999', fontSize: '14px', display: 'block'}}>
                                            {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}
                                        </del>
                                        <span style={{color: '#e80f0f', fontWeight: 'bold', fontSize: '16px'}}>
                                            {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product - (value.price_product * value.promotion / 100))+ ' VNĐ'}
                                        </span>
                                    </>
                                ) : (
                                    <span style={{fontWeight: 'bold', fontSize: '16px'}}>
                                        {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}
                                    </span>
                                )}
                            </div>
                            <div style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                                <button 
                                    className="btn btn-sm btn-outline-secondary"
                                    data-toggle="modal"
                                    data-target={`#${value._id}`}
                                    onClick={() => GET_id_modal(`${value._id}`)}
                                    style={{marginRight: '5px'}}
                                >
                                    <i className="fa fa-eye"></i>
                                </button>
                                <button className="btn btn-sm btn-outline-danger">
                                    <i className="fa fa-heart-o"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (slider) {
        return (
            <Slider {...settings}>
                {products && products.map(value => renderProductItem(value))}
            </Slider>
        );
    }

    return (
        <div className="row">
            {products && products.map(value => renderProductItem(value))}
        </div>
    );
}

export default Home_Product;
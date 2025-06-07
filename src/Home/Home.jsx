import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Link, useHistory } from 'react-router-dom';
import Home_Category from './Component/Home_Category';
import Home_Product from './Component/Home_Product';
import Product from '../API/Product';
import { changeCount } from '../Redux/Action/ActionCount';
import { useDispatch, useSelector } from 'react-redux';
import CartsLocal from '../Share/CartsLocal';
import SaleAPI from '../API/SaleAPI';
import User from '../API/User';
import { addSearch } from '../Redux/Action/ActionSearch';
import { deleteSession } from '../Redux/Action/ActionSession';

Home.propTypes = {

};

function Home(props) {

    // state dùng để thay đổi và hiển thị modal
    const [id_modal, set_id_modal] = useState('')
    const [product_detail, set_product_detail] = useState([])
    const dispatch = useDispatch()
    const [priceSale, setPriceSale] = useState(0)
    const [newProducts, setNewProducts] = useState([])
    const [bestSellers, setBestSellers] = useState([])
    const [saleProducts, setSaleProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('bestseller')
    const [keyword_search, set_keyword_search] = useState('')
    const [user, set_user] = useState({})
    const [active_user, set_active_user] = useState(false)
    const history = useHistory()
    const [products, set_products] = useState([])

    // Tải tất cả sản phẩm để tìm kiếm
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await Product.Get_All_Product()
                set_products(response)
            } catch (error) {
                console.error("Error fetching all products:", error)
            }
        }
        fetchData()
    }, [])

    // Tạo kết quả tìm kiếm từ keyword
    const search_results = useMemo(() => {
        if (!keyword_search.trim()) return [];
        
        return products.filter(value => 
            value.name_product.toLowerCase().includes(keyword_search.toLowerCase())
        ).slice(0, 5); // Giới hạn 5 kết quả
    }, [keyword_search, products]);

    // Tải sản phẩm mới và bán chạy
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                
                // Lấy sản phẩm mới nhất
                const newProductsResponse = await Product.Get_New_Products(8)
                setNewProducts(newProductsResponse)
                
                // Lấy sản phẩm bán chạy
                const bestSellersResponse = await Product.Get_Best_Selling(8)
                setBestSellers(bestSellersResponse)
                
                // Lấy sản phẩm đang giảm giá
                const saleResponse = await SaleAPI.getList()
                const productsWithSale = []
                
                // Xử lý dữ liệu sản phẩm sale
                for (const sale of saleResponse) {
                    if (sale && sale.id_product && sale.id_product._id) {
                        productsWithSale.push({
                            ...sale.id_product,
                            promotion: sale.promotion,
                            saleId: sale._id,
                            salePrice: parseInt(sale.id_product.price_product) - 
                                    (parseInt(sale.id_product.price_product) * parseInt(sale.promotion) / 100)
                        });
                    }
                }
                
                setSaleProducts(productsWithSale)
            } catch (error) {
                console.error("Error fetching products:", error)
            } finally {
                setLoading(false)
            }
        }
        
        fetchData()
    }, [])

    const GET_id_modal = (value, price) => {
        set_id_modal(value)
        setPriceSale(price)
    }

    useEffect(() => {
        if (id_modal !== '') {
            const fetchData = async () => {
                const response = await Product.Get_Detail_Product(id_modal)
                set_product_detail(response)
            }
            fetchData()
        }
    }, [id_modal])

    // Xử lý user đăng nhập
    const id_user = useSelector(state => state.Session.idUser)

    useEffect(() => {
        if (!id_user) {
            set_active_user(false)
        } else {
            const fetchData = async () => {
                const response = await User.Get_User(sessionStorage.getItem('id_user'))
                set_user(response)
            }
            fetchData()
            set_active_user(true)
        }
    }, [id_user])

    // Hàm logout
    const handler_logout = () => {
        const action = deleteSession('')
        dispatch(action)
        sessionStorage.clear()
    }

    // Get count từ redux khi user chưa đăng nhập
    const count_change = useSelector(state => state.Count.isLoad)

    // Hàm này dùng để thêm vào giỏ hàng
    const handler_addcart = (e) => {
        e.preventDefault()

        const data = {
            id_cart: Math.random().toString(),
            id_product: id_modal,
            name_product: product_detail.name_product,
            price_product: product_detail.price_product,
            count: 1,
            image: product_detail.image,
            size: 'S',
        }

        CartsLocal.addProduct(data)

        const action_count_change = changeCount(count_change)
        dispatch(action_count_change)
    }

    // Hàm xử lý tìm kiếm
    const handler_search = (e) => {
        e.preventDefault()

        // Đưa vào redux để qua bên trang search lấy query tìm kiếm
        const action = addSearch(keyword_search)
        dispatch(action)

        // set cho nó cái session
        sessionStorage.setItem('search', keyword_search)

        history.push('/search')
    }

    // Hàm xử lý khi click vào kết quả tìm kiếm
    const handleSearchItemClick = (id) => {
        history.push(`/detail/${id}`)
        set_keyword_search('') // Clear search input
    }

    return (
        <div className="container-fluid px-0">
            {/* Banner với slider tự động */}
            <div className="slider-with-banner mb-4">
                <div className="row m-0">
                    <div className="col-lg-12 col-md-12 p-0">
                        <div id="mainBannerCarousel" className="carousel slide" data-ride="carousel">
                            <ol className="carousel-indicators">
                                <li data-target="#mainBannerCarousel" data-slide-to="0" className="active"></li>
                                <li data-target="#mainBannerCarousel" data-slide-to="1"></li>
                                <li data-target="#mainBannerCarousel" data-slide-to="2"></li>
                            </ol>
                            <div className="carousel-inner">
                                <div className="carousel-item active">
                                    <div className="single-slide align-center-left animation-style-01"
                                        style={{ 
                                            backgroundImage: `url(https://static.vecteezy.com/system/resources/previews/044/637/679/non_2x/summer-sale-poster-or-banner-template-featuring-a-tropical-beach-scene-with-sun-and-party-elements-product-display-tropical-summer-scene-perfect-for-promoting-your-summer-products-on-blue-background-vector.jpg)`,
                                            height: '500px',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}>
                                        <div className="slider-progress"></div>
                                        <div className="slider-content">
                                            <h2 className="helvetica-font" style={{color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>Xu hướng mới</h2>
                                            <h3 className="helvetica-font" style={{color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>Bộ sưu tập <span>Hè 2023</span></h3>
                                            <a href="/shop" className="slider-btn">Khám phá ngay</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <div className="single-slide align-center-left animation-style-02"
                                        style={{ 
                                            backgroundImage: `url(https://img.freepik.com/free-vector/gradient-sale-background_23-2149050986.jpg)`,
                                            height: '500px',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}>
                                        <div className="slider-progress"></div>
                                        <div className="slider-content">
                                            <h2 className="helvetica-font" style={{color: '#000', textShadow: '1px 1px 3px rgba(255,255,255,0.6)'}}>Hàng mới về</h2>
                                            <h3 className="helvetica-font" style={{color: '#000', textShadow: '1px 1px 3px rgba(255,255,255,0.6)'}}>Bộ sưu tập <span>Đặc biệt</span></h3>
                                            <a href="/shop" className="slider-btn">Mua sắm ngay</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="carousel-item">
                                    <div className="single-slide align-center-left animation-style-01"
                                        style={{ 
                                            backgroundImage: `url(https://img.freepik.com/premium-vector/fashion-sale-banner-template-with-colorful-background_23-2148622444.jpg)`,
                                            height: '500px',
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}>
                                        <div className="slider-progress"></div>
                                        <div className="slider-content">
                                            <h2 className="helvetica-font" style={{color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>Ưu đãi đặc biệt</h2>
                                            <h3 className="helvetica-font" style={{color: '#fff', textShadow: '1px 1px 3px rgba(0,0,0,0.6)'}}>Giảm đến <span>30%</span></h3>
                                            <a href="/shop" className="slider-btn">Mua sắm ngay</a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <a className="carousel-control-prev" href="#mainBannerCarousel" role="button" data-slide="prev">
                                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                <span className="sr-only">Previous</span>
                            </a>
                            <a className="carousel-control-next" href="#mainBannerCarousel" role="button" data-slide="next">
                                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                <span className="sr-only">Next</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container">
                {/* Phần danh mục sản phẩm */}
                <Home_Category GET_id_modal={GET_id_modal} />

                {/* Phần sản phẩm mới */}
                <section className="product-area pt-60 pb-45" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="li-section-title">
                                <h2>
                                    <span className="helvetica-font">Sản Phẩm Mới Nhất</span>
                                </h2>
                            </div>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="product-slider-wrapper" style={{margin: '0 -10px'}}>
                                    <Home_Product products={newProducts} GET_id_modal={GET_id_modal} slider={true} autoScroll={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Phần sản phẩm bán chạy và giảm giá (tab) */}
                <section className="product-area pt-60 pb-45" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="li-section-title d-flex">
                                <h2 className="mb-4 position-relative">
                                    <div className="product-tab">
                                        <button 
                                            className={`tab-btn ${activeTab === 'bestseller' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('bestseller')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                marginRight: '20px',
                                                cursor: 'pointer',
                                                padding: '5px 15px',
                                                borderBottom: activeTab === 'bestseller' ? '2px solid #0066c0' : 'none',
                                                color: activeTab === 'bestseller' ? '#0066c0' : '#555',
                                                fontFamily: 'Montserrat, sans-serif'
                                            }}>
                                            Bán chạy nhất
                                        </button>
                                        <button 
                                            className={`tab-btn ${activeTab === 'sale' ? 'active' : ''}`}
                                            onClick={() => setActiveTab('sale')}
                                            style={{
                                                border: 'none',
                                                background: 'none',
                                                fontSize: '20px',
                                                fontWeight: 'bold',
                                                cursor: 'pointer',
                                                padding: '5px 15px',
                                                borderBottom: activeTab === 'sale' ? '2px solid #e80f0f' : 'none',
                                                color: activeTab === 'sale' ? '#e80f0f' : '#555',
                                                fontFamily: 'Montserrat, sans-serif'
                                            }}>
                                            Giảm giá nhiều nhất
                                        </button>
                                    </div>
                                </h2>
                            </div>
                            
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-danger" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="tab-content">
                                    <div className={`tab-pane ${activeTab === 'bestseller' ? 'active' : 'fade'}`}>
                                        <div className="product-grid-container" style={{margin: '0 -10px'}}>
                                            <Home_Product products={bestSellers} GET_id_modal={GET_id_modal} />
                                        </div>
                                    </div>
                                    <div className={`tab-pane ${activeTab === 'sale' ? 'active' : 'fade'}`}>
                                        <div className="product-grid-container" style={{margin: '0 -10px'}}>
                                            <Home_Product products={saleProducts} GET_id_modal={GET_id_modal} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Banner quảng cáo giữa trang */}
                <div className="li-static-banner mt-4 mb-4" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-lg-4 col-md-4 text-center">
                            <div className="single-banner" style={{
                                overflow: 'hidden', 
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '15px'
                            }}>
                                <a href="/shop" style={{width: '100%', height: '100%'}}>
                                    <img 
                                        src="https://media.istockphoto.com/id/1307516287/vector/free-shipping-promotional-web-banner-concept-delivery-truck-in-front-of-stacks-shipping-box.jpg?s=612x612&w=0&k=20&c=Tq1biqL6bz8U988bwsBPYYgA_LL-RIlLJ0U-hQcYvW4=" 
                                        alt="Free Shipping Promo Banner" 
                                        style={{
                                            transition: 'transform 0.5s', 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }} 
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner" style={{
                                overflow: 'hidden', 
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '15px'
                            }}>
                                <a href="/shop" style={{width: '100%', height: '100%'}}>
                                    <img 
                                        src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1748128289/promo-2_bk7tta.jpg" 
                                        alt="Promo Banner" 
                                        style={{
                                            transition: 'transform 0.5s', 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }} 
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner" style={{
                                overflow: 'hidden', 
                                borderRadius: '8px',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '15px'
                            }}>
                                <a href="/shop" style={{width: '100%', height: '100%'}}>
                                    <img 
                                        src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1748128289/promo-3_z2nk8t.jpg" 
                                        alt="Promo Banner" 
                                        style={{
                                            transition: 'transform 0.5s', 
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover'
                                        }} 
                                        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} 
                                    />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các section phân loại theo giới tính */}
                <section className="product-area pt-60 pb-45" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title d-flex justify-content-between align-items-center">
                                <h2>
                                    <span className="helvetica-font">Sản Phẩm Unisex</span>
                                </h2>
                                <Link to="/shop/unisex" className="btn-view-all" style={{
                                    color: '#333',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    padding: '5px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#fed700';
                                    e.currentTarget.style.borderColor = '#fed700';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#ddd';
                                }}
                                >
                                    Xem tất cả <i className="fa fa-angle-right ml-1"></i>
                                </Link>
                            </div>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="product-slider-wrapper" style={{margin: '0 -10px'}}>
                                    <Home_Product gender={`unisex`} GET_id_modal={GET_id_modal} slider={true} autoScroll={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="product-area pt-60 pb-45" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title d-flex justify-content-between align-items-center">
                                <h2>
                                    <span className="helvetica-font">Thời Trang Nam</span>
                                </h2>
                                <Link to="/shop/male" className="btn-view-all" style={{
                                    color: '#333',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    padding: '5px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#fed700';
                                    e.currentTarget.style.borderColor = '#fed700';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#ddd';
                                }}
                                >
                                    Xem tất cả <i className="fa fa-angle-right ml-1"></i>
                                </Link>
                            </div>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="product-slider-wrapper" style={{margin: '0 -10px'}}>
                                    <Home_Product gender={`male`} GET_id_modal={GET_id_modal} slider={true} autoScroll={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section className="product-area pt-60 pb-45" style={{fontFamily: 'Montserrat, sans-serif'}}>
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title d-flex justify-content-between align-items-center">
                                <h2>
                                    <span className="helvetica-font">Thời Trang Nữ</span>
                                </h2>
                                <Link to="/shop/female" className="btn-view-all" style={{
                                    color: '#333',
                                    fontWeight: '500',
                                    fontSize: '14px',
                                    textDecoration: 'none',
                                    padding: '5px 15px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    transition: 'all 0.3s'
                                }}
                                onMouseOver={e => {
                                    e.currentTarget.style.backgroundColor = '#fed700';
                                    e.currentTarget.style.borderColor = '#fed700';
                                }}
                                onMouseOut={e => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.borderColor = '#ddd';
                                }}
                                >
                                    Xem tất cả <i className="fa fa-angle-right ml-1"></i>
                                </Link>
                            </div>
                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="product-slider-wrapper" style={{margin: '0 -10px'}}>
                                    <Home_Product gender={`female`} GET_id_modal={GET_id_modal} slider={true} autoScroll={true} />
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal chi tiết sản phẩm */}
            <div className="modal fade modal-wrapper" id={id_modal} style={{fontFamily: 'Montserrat, sans-serif'}}>
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-body">
                            <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                            <div className="modal-inner-area row">
                                <div className="col-lg-5 col-md-6 col-sm-6">
                                    <div className="product-details-left">
                                        <div className="product-details-images slider-navigation-1">
                                            <div className="lg-image">
                                                <img src={product_detail.image} alt="product image" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-lg-7 col-md-6 col-sm-6">
                                    <div className="product-details-view-content pt-60">
                                        <div className="product-info">
                                            <h2>{product_detail.name_product}</h2>
                                            <div className="rating-box pt-20">
                                                <ul className="rating rating-with-review-item">
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li><i className="fa fa-star-o"></i></li>
                                                    <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                    <li className="no-star"><i className="fa fa-star-o"></i></li>
                                                </ul>
                                            </div>
                                            <div className="price-box pt-20">
                                            {
                                                priceSale ? (<del className="new-price new-price-2" style={{ color: '#525252'}}>{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(product_detail.price_product)+ ' VNĐ'}</del>) :
                                                <span className="new-price new-price-2" style={{color: '#e80f0f'}}>{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(product_detail.price_product)+ ' VNĐ'}</span>
                                            }
                                            <br />
                                            {
                                               priceSale && <span className="new-price new-price-2" style={{color: '#e80f0f'}}>{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(priceSale) + ' VNĐ'}</span>
                                            }
                                            </div>
                                            <div className="product-desc">
                                                <p>
                                                    <span>
                                                        {product_detail.describe}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="single-add-to-cart">
                                                <form onSubmit={handler_addcart} className="cart-quantity">
                                                    <button className="add-to-cart" type="submit">Thêm vào giỏ hàng</button>
                                                </form>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;

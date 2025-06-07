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
            {/* Header phần đầu */}
            <div className="header" style={{backgroundColor: '#fed700', borderBottom: '1px solid #e5e5e5', position: 'sticky', top: 0, zIndex: 1000}}>
                {/* Top header */}
                <div className="header-top py-2" style={{backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0'}}>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-md-6">
                                <span style={{fontSize: '13px', color: '#666'}}>
                                    <i className="fa fa-phone mr-1"></i> Hotline: 0123 456 789
                                </span>
                                <span style={{fontSize: '13px', color: '#666', marginLeft: '15px'}}>
                                    <i className="fa fa-envelope mr-1"></i> Email: support@fashionshop.com
                                </span>
                            </div>
                            <div className="col-md-6 text-right">
                                <span style={{fontSize: '13px', color: '#666', marginLeft: '15px'}}>
                                    <i className="fa fa-truck mr-1"></i> Miễn phí vận chuyển với đơn hàng trên 500K
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Main header */}
                <div className="container py-2">
                    <div className="row align-items-center">
                        {/* Logo */}
                        <div className="col-md-2">
                            <Link to="/" style={{textDecoration: 'none'}}>
                                <img src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1749057780/logoapp_uus1zk.png" alt="Logo" style={{maxWidth: '75px'}} />
                            </Link>
                        </div>
                        
                        {/* Search bar */}
                        <div className="col-md-7 position-relative">
                            <form className="hm-searchbox" onSubmit={handler_search}>
                                <input 
                                    type="text" 
                                    placeholder="Enter your search key ..." 
                                    value={keyword_search} 
                                    onChange={(e) => set_keyword_search(e.target.value)} 
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '20px 0 0 20px',
                                        padding: '0 20px'
                                    }}
                                />
                                <button 
                                    type="submit" 
                                    style={{
                                        position: 'absolute',
                                        right: '0',
                                        top: '0',
                                        height: '40px',
                                        width: '50px',
                                        backgroundColor: '#333',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0 20px 20px 0'
                                    }}
                                >
                                    <i className="fa fa-search"></i>
                                </button>
                            </form>
                            
                            {/* Kết quả tìm kiếm realtime */}
                            {keyword_search && search_results.length > 0 && (
                                <div className="search-results" style={{
                                    position: 'absolute',
                                    top: '45px',
                                    left: '0',
                                    width: '100%',
                                    backgroundColor: 'white',
                                    boxShadow: '0 3px 10px rgba(0,0,0,0.1)',
                                    borderRadius: '5px',
                                    zIndex: 10,
                                    maxHeight: '350px',
                                    overflowY: 'auto'
                                }}>
                                    {search_results.map(product => (
                                        <div 
                                            key={product._id} 
                                            className="search-item d-flex align-items-center p-2 border-bottom"
                                            onClick={() => handleSearchItemClick(product._id)}
                                            style={{cursor: 'pointer'}}
                                        >
                                            <div className="search-image mr-3" style={{width: '50px', height: '50px'}}>
                                                <img 
                                                    src={product.image} 
                                                    alt={product.name_product} 
                                                    style={{width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px'}} 
                                                />
                                            </div>
                                            <div className="search-info">
                                                <div className="search-name" style={{fontWeight: 'bold', fontSize: '14px'}}>{product.name_product}</div>
                                                <div className="search-price" style={{color: '#e80f0f', fontSize: '13px'}}>
                                                    {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(product.price_product)+ ' VNĐ'}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Icons */}
                        <div className="col-md-3 text-right">
                            <div className="d-flex justify-content-end align-items-center">
                                <a href="/wishlist" className="mr-3" style={{color: '#333', fontSize: '22px'}}>
                                    <i className="fa fa-heart-o"></i>
                                </a>
                                <a href="/cart" className="position-relative mr-3" style={{color: '#333', fontSize: '22px'}}>
                                    <i className="fa fa-shopping-cart"></i>
                                    <span className="badge badge-danger rounded-circle" style={{position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px', padding: '3px 6px'}}>
                                        {count_change}
                                    </span>
                                </a>
                                {active_user ? (
                                    <div className="dropdown">
                                        <span className="dropdown-toggle" style={{color: '#333', fontSize: '22px', cursor: 'pointer'}} id="userDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i className="fa fa-user-o"></i>
                                        </span>
                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                                            <div className="dropdown-item-text font-weight-bold pb-2 border-bottom">
                                                Xin chào, {user.fullname}
                                            </div>
                                            <Link className="dropdown-item" to={`/profile/${sessionStorage.getItem("id_user")}`}>
                                                <i className="fa fa-user-circle mr-2"></i> Profile
                                            </Link>
                                            <Link className="dropdown-item" to="/history">
                                                <i className="fa fa-history mr-2"></i> Order Status
                                            </Link>
                                            <div className="dropdown-divider"></div>
                                            <a className="dropdown-item" href="#" onClick={handler_logout}>
                                                <i className="fa fa-sign-out mr-2"></i> Log Out
                                            </a>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="dropdown">
                                        <span className="dropdown-toggle" style={{color: '#333', fontSize: '22px', cursor: 'pointer'}} id="userDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <i className="fa fa-user-o"></i>
                                        </span>
                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown">
                                            <Link className="dropdown-item" to="/signin">
                                                <i className="fa fa-sign-in mr-2"></i> Đăng nhập
                                            </Link>
                                            <Link className="dropdown-item" to="/register">
                                                <i className="fa fa-user-plus mr-2"></i> Đăng ký
                                            </Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Navigation menu */}
                <div className="navigation-menu" style={{backgroundColor: '#fed700', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                    <div className="container">
                        <ul className="nav justify-content-center">
                            <li className="nav-item">
                                <a className="nav-link" href="/" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Home</a>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="menuDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>
                                    Menu
                                </a>
                                <div className="dropdown-menu" aria-labelledby="menuDropdown">
                                    <a className="dropdown-item" href="/shop/male">Nam</a>
                                    <a className="dropdown-item" href="/shop/female">Nữ</a>
                                    <a className="dropdown-item" href="/shop/unisex">Unisex</a>
                                </div>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/events" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Event</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/contact" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Contact</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" href="/chatbot" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Chatbot</a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

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
                <section className="product-area pt-60 pb-45">
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
                                <Home_Product products={newProducts} GET_id_modal={GET_id_modal} slider={true} />
                            )}
                        </div>
                    </div>
                </section>

                {/* Phần sản phẩm bán chạy và giảm giá (tab) */}
                <section className="product-area pt-60 pb-45">
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
                                                color: activeTab === 'bestseller' ? '#0066c0' : '#555'
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
                                                color: activeTab === 'sale' ? '#e80f0f' : '#555'
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
                                        <Home_Product products={bestSellers} GET_id_modal={GET_id_modal} />
                                    </div>
                                    <div className={`tab-pane ${activeTab === 'sale' ? 'active' : 'fade'}`}>
                                        <Home_Product products={saleProducts} GET_id_modal={GET_id_modal} />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Banner quảng cáo giữa trang */}
                <div className="li-static-banner mt-4 mb-4">
                    <div className="row">
                        <div className="col-lg-4 col-md-4 text-center">
                            <div className="single-banner" style={{overflow: 'hidden', borderRadius: '8px'}}>
                                <a href="/shop">
                                    <img src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1748128289/promo-1_adq5tf.jpg" alt="Promo Banner" style={{transition: 'transform 0.5s', width: '100%'}} 
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner" style={{overflow: 'hidden', borderRadius: '8px'}}>
                                <a href="/shop">
                                    <img src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1748128289/promo-2_bk7tta.jpg" alt="Promo Banner" style={{transition: 'transform 0.5s', width: '100%'}} 
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 text-center pt-xs-30">
                            <div className="single-banner" style={{overflow: 'hidden', borderRadius: '8px'}}>
                                <a href="/shop">
                                    <img src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1748128289/promo-3_z2nk8t.jpg" alt="Promo Banner" style={{transition: 'transform 0.5s', width: '100%'}} 
                                    onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
                                    onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'} />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Các section phân loại theo giới tính */}
                <section className="product-area pt-60 pb-45">
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title">
                                <h2>
                                    <span className="helvetica-font">Sản Phẩm Unisex</span>
                                </h2>
                            </div>
                            <Home_Product gender={`unisex`} GET_id_modal={GET_id_modal} />
                        </div>
                    </div>
                </section>

                <section className="product-area pt-60 pb-45">
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title">
                                <h2>
                                    <span className="helvetica-font">Thời Trang Nam</span>
                                </h2>
                            </div>
                            <Home_Product gender={`male`} GET_id_modal={GET_id_modal} />
                        </div>
                    </div>
                </section>

                <section className="product-area pt-60 pb-45">
                    <div className="row">
                        <div className="col-12">
                            <div className="li-section-title">
                                <h2>
                                    <span className="helvetica-font">Thời Trang Nữ</span>
                                </h2>
                            </div>
                            <Home_Product gender={`female`} GET_id_modal={GET_id_modal} />
                        </div>
                    </div>
                </section>
            </div>

            {/* Modal chi tiết sản phẩm */}
            <div className="modal fade modal-wrapper" id={id_modal} >
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
                                                <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(product_detail.price_product)+ ' VNĐ'}</span>
                                            }
                                            <br />
                                            {
                                               priceSale && <span className="new-price new-price-2">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(priceSale) + ' VNĐ'}</span>
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
                                                    <button className="add-to-cart" type="submit">Add to cart</button>
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

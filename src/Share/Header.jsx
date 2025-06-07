import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect, useHistory } from 'react-router-dom';
import Cart from '../API/CartAPI';
import User from '../API/User';
import { addUser, deleteCart } from '../Redux/Action/ActionCart';
import { changeCount } from '../Redux/Action/ActionCount';
import { addSession, deleteSession } from '../Redux/Action/ActionSession';
import queryString from 'query-string'
import Product from '../API/Product';
import { addSearch } from '../Redux/Action/ActionSearch';
import CartsLocal from './CartsLocal';
import ResultDialog from './ResultDialog';
import { subscribeToCartUpdates } from './CartEventManager';

function Header(props) {

    // State count of cart
    const [count_cart, set_count_cart] = useState(0)
    const [matchedProducts, setMatchedProducts] = React.useState([]);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const [total_price, set_total_price] = useState(0)
    
    const [carts_mini, set_carts_mini] = useState([])
    const history = useHistory()

    // Hàm này để khởi tạo localStorage dùng để lưu trữ giỏ hàng
    // Và nó sẽ chạy lần đầu
    useEffect(() => {

        if (localStorage.getItem('carts') !== null) {
            set_carts_mini(JSON.parse(localStorage.getItem('carts')));
        } else {
            localStorage.setItem('carts', JSON.stringify([]))
        }

    }, [])

    // Xử lý header ghim khi cuộn trang
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const dispatch = useDispatch()
    if (sessionStorage.getItem('id_user')) {
        const action = addSession(sessionStorage.getItem('id_user'))
        dispatch(action)
    }

    //Get IdUser từ redux khi user đã đăng nhập
    var id_user = useSelector(state => state.Session.idUser)

    const [active_user, set_active_user] = useState(false)

    const [user, set_user] = useState({})

    // Hàm này dùng để hiện thị
    useEffect(() => {

        if (!id_user) { // user chưa đăng nhâp

            set_active_user(false)

        } else { // user đã đăng nhâp

            const fetchData = async () => {

                const response = await User.Get_User(sessionStorage.getItem('id_user'))
                set_user(response)

            }

            fetchData()

            set_active_user(true)

        }

    }, [id_user])


    // Hàm này dùng để xử lý phần log out
    const handler_logout = () => {
        console.log("Đăng xuất người dùng");
        
        // Xóa phiên người dùng trong Redux
        const action = deleteSession('')
        dispatch(action)
        
        // Xóa toàn bộ giỏ hàng khi đăng xuất
        CartsLocal.clearCartOnLogout();
        
        // Xóa thông tin người dùng khỏi sessionStorage
        sessionStorage.clear()
        
        // Cập nhật UI
        const action_change_count = changeCount(count)
        dispatch(action_change_count)
        
        console.log("Đã đăng xuất và xóa giỏ hàng");
    }


    // Get trạng thái từ redux khi user chưa đăng nhập
    const count = useSelector(state => state.Count.isLoad)

    // Hàm này dùng để load lại dữ liệu giỏ hàng ở phần header khi có bất kì thay đổi nào
    // Phụ thuộc vào thằng redux count
    useEffect(() => {
        const loadCartData = async () => {
            try {
                if (count) {
                    // Lấy giỏ hàng (sẽ tự động lấy từ server nếu đã đăng nhập)
                    const carts = await CartsLocal.getProduct();
                    showData(carts, 0, 0);

                    const action = changeCount(count);
                    dispatch(action);
                }
            } catch (error) {
                console.error("Error loading cart data:", error);
                // Fallback to localStorage if server request fails
                const localCarts = JSON.parse(localStorage.getItem('carts') || '[]');
                showData(localCarts, 0, 0);
            }
        };

        loadCartData();
    }, [count])

    // Hàm này là hàm con chia ra để xử lý
    function showData(carts, sum, price) {

        carts.map(value => {
            sum += value.count
            price += parseInt(value.price_product) * parseInt(value.count)
        })

        set_count_cart(sum)

        set_total_price(price)

        set_carts_mini(carts)

    }


    // Hàm này dùng để Delete carts_mini
    const handler_delete_mini = async (id_cart) => {
        try {
            await CartsLocal.deleteProduct(id_cart)
            const action_change_count = changeCount(count)
            dispatch(action_change_count)
        } catch (error) {
            console.error("Error deleting product from cart:", error)
        }
    }

    
    const [male, set_male] = useState([])
    const [female, set_female] = useState([])

    // Gọi API theo phương thức GET để load category
    useEffect(() => {

        const fetchData = async () => {

            // gender = male
            const params_male = {
                gender: 'male'
            }

            const query_male = '?' + queryString.stringify(params_male)

            const response_male = await Product.Get_Category_Gender(query_male)

            set_male(response_male)

            // gender = female
            const params_female = {
                gender: 'female'
            }

            const query_female = '?' + queryString.stringify(params_female)

            const response_female = await Product.Get_Category_Gender(query_female)

            set_female(response_female)

        }

        fetchData()

    }, [])


    // state keyword search
    const [keyword_search, set_keyword_search] = useState('')

    const [products, set_products] = useState([])

    useEffect(() => {

        const fetchData = async () => {

            const response = await Product.Get_All_Product()

            set_products(response)

        }

        fetchData()

    }, [])

    const handleImageSearch = async (event) => {
      const file = event.target.files[0];
      if (!file) {
        console.log('No file selected');
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      try {
        const response = await fetch('https://search-by-ai.onrender.com/search-by-image', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Response not ok:', errorText);
          throw new Error('Image search failed');
        }

        const results = await response.json();
        console.log('Received results:', results);

        // Lưu data matched_products vào state
        setMatchedProducts(results.matched_products || []);
        setIsDialogOpen(true); // Mở dialog hiển thị kết quả

      } catch (error) {
        console.error('Error searching by image:', error);
        alert('Tìm kiếm theo hình ảnh thất bại, vui lòng thử lại.');
      }
    };


    const search_header = useMemo(() => {

        const new_data = products.filter(value => {
            return value.name_product.toUpperCase().indexOf(keyword_search.toUpperCase()) !== -1
        })

        return new_data

    }, [keyword_search, products])

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

    // Sử dụng CartEventManager để lắng nghe sự kiện cập nhật giỏ hàng
    useEffect(() => {
        // Hàm xử lý cập nhật hiển thị giỏ hàng
        const updateCartDisplay = (cartItems) => {
            let sum = 0;
            let price = 0;
            
            // Tính toán lại tổng và giá
            cartItems.forEach(item => {
                sum += parseInt(item.count);
                price += parseInt(item.price_product) * parseInt(item.count);
            });
            
            // Cập nhật state
            set_count_cart(sum);
            set_total_price(price);
            set_carts_mini(cartItems);
            
            console.log("Header đã cập nhật giỏ hàng thông qua CartEventManager:", sum, "sản phẩm");
        };
        
        // Cập nhật ban đầu
        const initialCartItems = JSON.parse(localStorage.getItem('carts') || '[]');
        updateCartDisplay(initialCartItems);
        
        // Đăng ký lắng nghe sự kiện cập nhật giỏ hàng
        const unsubscribe = subscribeToCartUpdates(updateCartDisplay);
        
        // Cleanup function
        return () => {
            unsubscribe();
        };
    }, []);

    return (
        <div className="header-area">
            {/* Header với màu chủ đạo #fed700 */}
            <div className="header" style={{
                backgroundColor: '#fed700', 
                borderBottom: '1px solid #e5e5e5', 
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1000,
                fontFamily: 'Montserrat, sans-serif',
                transition: 'all 0.3s ease',
                boxShadow: isScrolled ? '0 2px 10px rgba(0,0,0,0.1)' : 'none'
            }}>
                {/* Top header với Telephone Enquiry */}
                <div className="pre-header py-2" style={{
                    backgroundColor: '#f5f5f5', 
                    borderBottom: '1px solid #e0e0e0',
                    display: isScrolled ? 'none' : 'block'
                }}>
                    <div className="container">
                        <div className="row">
                            <div className="col-md-6">
                                <span style={{fontSize: '14px', color: '#666'}}>
                                    Telephone Enquiry: (+123) 123 321 345
                                </span>
                            </div>
                            <div className="col-md-6 text-right">
                                <span style={{fontSize: '14px', color: '#666', marginLeft: '15px'}}>
                                    <i className="fa fa-truck mr-1"></i> Miễn phí vận chuyển với đơn hàng trên 500K
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Middle header với logo và search */}
                <div className="container py-3">
                    <div className="row align-items-center">
                        {/* Logo H&A SHOP - chỉ để ảnh không có text */}
                        <div className="col-md-3 text-center">
                            <Link to="/" className="d-inline-block">
                                <img src="https://res.cloudinary.com/dwmsfixy5/image/upload/v1749057780/logoapp_uus1zk.png" alt="Logo" style={{maxWidth: isScrolled ? '60px' : '80px', transition: 'all 0.3s ease'}} />
                            </Link>
                        </div>
                        
                        {/* Search bar */}
                        <div className="col-md-6 position-relative">
                            <form className="hm-searchbox" onSubmit={handler_search} style={{position: 'relative'}}>
                                <input 
                                    type="text" 
                                    placeholder="Nhập từ khóa tìm kiếm..." 
                                    value={keyword_search} 
                                    onChange={(e) => set_keyword_search(e.target.value)} 
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        border: '1px solid #e5e5e5',
                                        borderRadius: '20px 0 0 20px',
                                        padding: '0 20px',
                                        fontFamily: 'Montserrat, sans-serif'
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
                            {keyword_search && search_header.length > 0 && (
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
                                    overflowY: 'auto',
                                    fontFamily: 'Montserrat, sans-serif'
                                }}>
                                    {search_header.slice(0, 5).map(product => (
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
                            
                            {/* Image search button */}
                            <label htmlFor="image-upload" style={{
                                position: 'absolute',
                                right: '55px',
                                top: '8px',
                                cursor: 'pointer',
                                color: '#666'
                            }}>
                                <i className="fa fa-camera"></i>
                                <input 
                                    id="image-upload" 
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageSearch}
                                    style={{display: 'none'}}
                                />
                            </label>
                        </div>
                        
                        {/* Icons: Wishlist, Cart, User */}
                        <div className="col-md-3 text-right">
                            <div className="d-flex justify-content-end align-items-center">
                                {/* Wishlist icon */}
                                <a href="/wishlist" className="mr-4" style={{color: '#333', fontSize: '22px'}}>
                                    <i className="fa fa-heart-o"></i>
                                </a>
                                
                                {/* Cart icon - chỉ hiển thị số lượng */}
                                <a href="/cart" className="position-relative mr-4" style={{color: '#333', fontSize: '22px'}}>
                                    <i className="fa fa-shopping-cart"></i>
                                    <span className="badge badge-danger rounded-circle" style={{position: 'absolute', top: '-8px', right: '-8px', fontSize: '10px', padding: '3px 6px'}}>
                                        {count_cart}
                                    </span>
                                </a>
                                
                                {/* User icon có dropdown */}
                                <div className="position-relative">
                                    <div className="dropdown">
                                        <span className="dropdown-toggle" 
                                            style={{color: '#333', fontSize: '22px', cursor: 'pointer'}} 
                                            id="userDropdown" 
                                            data-toggle="dropdown" 
                                            aria-haspopup="true" 
                                            aria-expanded="false">
                                            <i className="fa fa-user-o"></i>
                                        </span>
                                        <div className="dropdown-menu dropdown-menu-right" aria-labelledby="userDropdown" style={{fontFamily: 'Montserrat, sans-serif'}}>
                                            {active_user ? (
                                                <>
                                                    <div className="dropdown-item-text font-weight-bold pb-2 border-bottom">
                                                        Xin chào, {user.fullname}
                                                    </div>
                                                    <Link className="dropdown-item" to={`/profile/${sessionStorage.getItem("id_user")}`}>
                                                        <i className="fa fa-user-circle mr-2"></i> Tài khoản
                                                    </Link>
                                                    <Link className="dropdown-item" to="/history">
                                                        <i className="fa fa-history mr-2"></i> Đơn hàng
                                                    </Link>
                                                    <div className="dropdown-divider"></div>
                                                    <a className="dropdown-item" href="#" onClick={handler_logout}>
                                                        <i className="fa fa-sign-out mr-2"></i> Đăng xuất
                                                    </a>
                                                </>
                                            ) : (
                                                <>
                                                    <Link className="dropdown-item" to="/signin">
                                                        <i className="fa fa-sign-in mr-2"></i> Đăng Nhập
                                                    </Link>
                                                    <Link className="dropdown-item" to="/register">
                                                        <i className="fa fa-user-plus mr-2"></i> Đăng Ký
                                                    </Link>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Navigation menu - Tiếng Việt */}
                <div className="navigation-menu" style={{backgroundColor: '#fed700', boxShadow: '0 2px 5px rgba(0,0,0,0.1)'}}>
                    <div className="container">
                        <ul className="nav justify-content-center" style={{fontFamily: 'Montserrat, sans-serif'}}>
                            <li className="nav-item">
                                <Link className="nav-link" to="/" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Trang chủ</Link>
                            </li>
                            <li className="nav-item dropdown">
                                <a className="nav-link dropdown-toggle" href="#" id="menuDropdown" role="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>
                                    Danh mục
                                </a>
                                <div className="dropdown-menu" aria-labelledby="menuDropdown">
                                    <Link className="dropdown-item" to="/shop/male">Nam</Link>
                                    <Link className="dropdown-item" to="/shop/female">Nữ</Link>
                                    <Link className="dropdown-item" to="/shop/unisex">Unisex</Link>
                                </div>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/event" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Sự kiện</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/contact" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Liên hệ</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/chatbot" style={{color: '#333', fontWeight: 'bold', padding: '12px 20px'}}>Chatbot</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            
            {/* Thêm div để tạo không gian cho header cố định */}
            <div style={{
                height: isScrolled ? '128px' : '176px', 
                transition: 'height 0.3s ease'
            }}></div>
            
            {/* Dialog hiển thị kết quả tìm kiếm bằng hình ảnh */}
            {isDialogOpen && (
                <ResultDialog 
                    open={isDialogOpen} 
                    onClose={() => setIsDialogOpen(false)} 
                    products={matchedProducts} 
                />
            )}
        </div>
    );
}

export default Header;

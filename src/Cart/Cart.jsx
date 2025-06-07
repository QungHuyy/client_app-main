import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import { deleteCart, updateCart } from '../Redux/Action/ActionCart';
import { changeCount } from '../Redux/Action/ActionCount';
import CartAPI from '../API/CartAPI'
import queryString from 'query-string'
import CartsLocal from '../Share/CartsLocal';
import CouponAPI from '../API/CouponAPI';
import Product from '../API/Product';
import './Cart.css';

Cart.propTypes = {

};

function Cart(props) {

    const dispatch = useDispatch()

    const [list_carts, set_list_carts] = useState([])

    // state get from redux
    const count_change = useSelector(state => state.Count.isLoad)

    const [total_price, set_total_price] = useState(0)

    const [productInventory, setProductInventory] = useState({})

    // Hàm này dùng để hiện thị danh sách Product đã thêm vào giỏ hàng
    // và tính tổng tiền
    useEffect(() => {
        set_list_carts(JSON.parse(localStorage.getItem('carts')) || [])
        Sum_Price(JSON.parse(localStorage.getItem('carts')) || [], 0)

        // Lấy thông tin tồn kho của tất cả sản phẩm trong giỏ hàng
        const fetchProductInventory = async () => {
            const carts = JSON.parse(localStorage.getItem('carts')) || []
            const inventory = {}

            for (const item of carts) {
                const product = await Product.Get_Detail_Product(item.id_product)
                inventory[item.id_product] = product.inventory || { S: product.number || 0, M: 0, L: 0 }
            }

            setProductInventory(inventory)
        }

        fetchProductInventory()
    }, [count_change])



    // Hàm này dùng để tính tổng tiền
    function Sum_Price(carts, sum_price) {
        if (!carts || carts.length === 0) return

        carts.map(value => {
            return sum_price += parseInt(value.count) * parseInt(value.price_product)
        })

        set_total_price(sum_price)
    }

    // Hàm này dùng để tăng số lượng
    const upCount = (count, id_cart, id_product, size) => {
        // Kiểm tra số lượng tồn kho của sản phẩm theo size
        const availableQuantity = productInventory[id_product] ?
            (productInventory[id_product][size] || 0) : 0

        if (parseInt(count) >= availableQuantity) {
            setShowErrorStock(true)
            setErrorMessage(`Chỉ còn ${availableQuantity} sản phẩm size ${size} trong kho!`)
            setTimeout(() => {
                setShowErrorStock(false)
            }, 2000)
            return
        }

        const data = {
            id_cart: id_cart,
            count: parseInt(count) + 1
        }

        CartsLocal.updateProduct(data)

        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)
    }

    // Hàm này dùng để giảm số lượng
    const downCount = (count, id_cart) => {
        if (parseInt(count) === 1) {
            return
        }

        const data = {
            id_cart: id_cart,
            count: parseInt(count) - 1
        }

        CartsLocal.updateProduct(data)

        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)
    }

    // Hàm này dùng để xóa sản phẩm khỏi giỏ hàng
    const deleteProduct = (id_cart) => {
        CartsLocal.deleteProduct(id_cart)

        const action_change_count = changeCount(count_change)
        dispatch(action_change_count)
    }


    // Hàm này này dùng để kiểm tra đăng nhập checkout
    const [show_error, set_show_error] = useState(false)
    const [show_null_cart, set_show_null_cart] = useState(false)
    const [showErrorStock, setShowErrorStock] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const handler_checkout = () => {

        if (sessionStorage.getItem('id_user')) {
            if (list_carts.length < 1) {
                set_show_null_cart(true)
            } else {
                window.location.replace('/checkout')
            }
        } else {
            set_show_error(true)
        }

        setTimeout(() => {
            set_show_error(false)
            set_show_null_cart(false)
        }, 1500)
    }


    // Hàm này dùng để kiểm tra coupon
    const [coupon, set_coupon] = useState('')
    const [discount, setDiscount] = useState(0)
    const [new_price, set_new_price] = useState(0)
    const [show_success, set_show_success] = useState(false)
    const [errorCode, setErrorCode] = useState(false)
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState(null)

    // Kiểm tra xem đã áp dụng mã giảm giá chưa khi tải trang
    useEffect(() => {
        const savedCoupon = localStorage.getItem('coupon')
        if (savedCoupon) {
            try {
                const couponData = JSON.parse(savedCoupon)
                setAppliedCoupon(couponData)
                set_coupon(couponData.code)
                const discountAmount = (total_price * couponData.promotion) / 100
                setDiscount(discountAmount)
                set_new_price(total_price - discountAmount)
            } catch (error) {
                console.error("Error parsing saved coupon:", error)
                // Xóa coupon không hợp lệ
                localStorage.removeItem('id_coupon')
                localStorage.removeItem('coupon')
            }
        }
    }, [total_price])

    // Kiểm tra nếu có mã giảm giá tạm thời từ trang Event
    useEffect(() => {
        const tempCoupon = localStorage.getItem('temp_coupon')
        if (tempCoupon && !appliedCoupon) {
            set_coupon(tempCoupon)
            // Xóa mã tạm thời sau khi đã áp dụng
            localStorage.removeItem('temp_coupon')
            
            // Tự động áp dụng mã giảm giá nếu người dùng đã đăng nhập
            if (sessionStorage.getItem('id_user')) {
                const applyTempCoupon = async () => {
                    const params = {
                        id_user: sessionStorage.getItem('id_user'),
                        code: tempCoupon
                    }
                    const query = '?' + queryString.stringify(params)
                    
                    try {
                        setIsApplyingCoupon(true)
                        const response = await CouponAPI.checkCoupon(query)
                        
                        if (response && response.msg === 'Thành công' && response.coupon) {
                            localStorage.setItem('id_coupon', response.coupon._id)
                            localStorage.setItem('coupon', JSON.stringify(response.coupon))
                            setAppliedCoupon(response.coupon)
                            
                            const discountAmount = (total_price * response.coupon.promotion) / 100
                            setDiscount(discountAmount)
                            
                            const newTotal = total_price - discountAmount
                            set_new_price(newTotal)
                            set_show_success(true)
                            setErrorMessage(`Đã áp dụng mã giảm giá: giảm ${response.coupon.promotion}%`)
                            
                            setTimeout(() => {
                                set_show_success(false)
                            }, 2000)
                        }
                    } catch (error) {
                        console.error("Error applying temp coupon:", error)
                    } finally {
                        setIsApplyingCoupon(false)
                    }
                }
                
                applyTempCoupon()
            }
        }
    }, [appliedCoupon, total_price])

    const removeCoupon = () => {
        // Xóa mã giảm giá đã áp dụng
        localStorage.removeItem('id_coupon')
        localStorage.removeItem('coupon')
        setAppliedCoupon(null)
        setDiscount(0)
        set_new_price(0)
        set_coupon('')

        // Hiển thị thông báo
        setErrorCode(false)
        set_show_success(true)
        setErrorMessage('Đã xóa mã giảm giá')
        setTimeout(() => {
            set_show_success(false)
        }, 1500)
    }

    const handlerCoupon = async (e) => {
        e.preventDefault()

        try {
            if (!sessionStorage.getItem('id_user')){
                setErrorMessage('Vui lòng đăng nhập để sử dụng mã giảm giá')
                set_show_error(true)
                return
            }

            if (!coupon || coupon.trim() === '') {
                setErrorMessage('Vui lòng nhập mã giảm giá')
                setErrorCode(true)
                return
            }

            // Nếu đã áp dụng mã giảm giá, không cho phép áp dụng lại
            if (appliedCoupon && appliedCoupon.code === coupon) {
                setErrorMessage('Mã giảm giá đã được áp dụng')
                setErrorCode(true)
                return
            }

            setIsApplyingCoupon(true)

            const params = {
                id_user: sessionStorage.getItem('id_user'),
                code: coupon
            }

            const query = '?' + queryString.stringify(params)

            const response = await CouponAPI.checkCoupon(query)

            if (!response) {
                setErrorMessage('Đã xảy ra lỗi khi kiểm tra mã giảm giá')
                setErrorCode(true)
                return
            }

            if (response.msg === 'Không tìm thấy') {
                setErrorMessage('Mã giảm giá không tồn tại')
                setErrorCode(true)
            } else if (response.msg === 'Bạn đã sử dụng mã này rồi') {
                setErrorMessage('Bạn đã sử dụng mã giảm giá này rồi')
                setErrorCode(true)
            } else if (response.msg === 'Bạn đã sử dụng mã này trong một đơn hàng đang xử lý') {
                setErrorMessage('Mã giảm giá đang được sử dụng trong đơn hàng khác')
                setErrorCode(true)
            } else if (response.msg === 'Mã giảm giá đã hết lượt sử dụng') {
                setErrorMessage('Mã giảm giá đã hết lượt sử dụng')
                setErrorCode(true)
            } else if (response.msg === 'Thành công' && response.coupon) {
                localStorage.setItem('id_coupon', response.coupon._id)
                localStorage.setItem('coupon', JSON.stringify(response.coupon))
                setAppliedCoupon(response.coupon)

                const discountAmount = (total_price * response.coupon.promotion) / 100
                setDiscount(discountAmount)

                const newTotal = total_price - discountAmount
                set_new_price(newTotal)
                set_show_success(true)
                setErrorMessage(`Đã áp dụng mã giảm giá: giảm ${response.coupon.promotion}%`)
            } else {
                // Trường hợp không xác định
                setErrorMessage('Không thể áp dụng mã giảm giá')
                setErrorCode(true)
            }
        } catch (error) {
            console.error("Error checking coupon:", error)
            setErrorMessage('Đã xảy ra lỗi khi kiểm tra mã giảm giá')
            setErrorCode(true)
        } finally {
            setIsApplyingCoupon(false)
        }

        setTimeout(() => {
            set_show_error(false)
            set_show_null_cart(false)
            set_show_success(false)
            setErrorCode(false)
        }, 2000)
    }

    return (
        <div className="cart-page-container">
            {/* Thông báo lỗi kho hàng */}
            {showErrorStock && (
                <div className="notification-modal error-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-exclamation-circle"></i>
                        </div>
                        <div className="notification-message">{errorMessage}</div>
                        <button className="close-button" onClick={() => setShowErrorStock(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {/* Các thông báo khác */}
            {errorCode && (
                <div className="notification-modal error-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-exclamation-circle"></i>
                        </div>
                        <div className="notification-message">{errorMessage}</div>
                        <button className="close-button" onClick={() => setErrorCode(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {show_success && (
                <div className="notification-modal success-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-check-circle"></i>
                        </div>
                        <div className="notification-message">{errorMessage || 'Áp dụng mã giảm giá thành công!'}</div>
                        <button className="close-button" onClick={() => set_show_success(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {show_error && (
                <div className="notification-modal error-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-exclamation-circle"></i>
                        </div>
                        <div className="notification-message">Vui lòng đăng nhập để tiếp tục!</div>
                        <button className="close-button" onClick={() => set_show_error(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            )}
            
            {show_null_cart && (
                <div className="notification-modal error-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-exclamation-circle"></i>
                        </div>
                        <div className="notification-message">Giỏ hàng của bạn đang trống!</div>
                        <button className="close-button" onClick={() => set_show_null_cart(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                    </div>
                </div>
            )}

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Giỏ hàng</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="shopping-cart-area pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            {list_carts && list_carts.length > 0 ? (
                                <div className="cart-content">
                                    <h2 className="cart-title">Giỏ hàng của bạn</h2>
                                    <div className="table-content table-responsive">
                                        <table className="table cart-table">
                                            <thead>
                                                <tr>
                                                    <th className="li-product-remove">Xóa</th>
                                                    <th className="li-product-thumbnail">Hình ảnh</th>
                                                    <th className="cart-product-name">Sản phẩm</th>
                                                    <th className="li-product-price">Đơn giá</th>
                                                    <th className="li-product-price">Size</th>
                                                    <th className="li-product-quantity">Số lượng</th>
                                                    <th className="li-product-subtotal">Thành tiền</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {list_carts && list_carts.map((value, index) => {
                                                    const availableQuantity = productInventory[value.id_product] ?
                                                        (productInventory[value.id_product][value.size] || 0) : 0

                                                    return (
                                                        <tr key={index} className="cart-item">
                                                            <td className="li-product-remove">
                                                                <button className="remove-btn" onClick={() => deleteProduct(value.id_cart)}>
                                                                    <i className="fa fa-trash"></i>
                                                                </button>
                                                            </td>
                                                            <td className="li-product-thumbnail">
                                                                <Link to={`/detail/${value.id_product}`} className="product-image">
                                                                    <img src={value.image} alt={value.name_product} />
                                                                </Link>
                                                            </td>
                                                            <td className="li-product-name">
                                                                <Link to={`/detail/${value.id_product}`} className="product-name">
                                                                    {value.name_product}
                                                                </Link>
                                                            </td>
                                                            <td className="li-product-price">
                                                                <span className="amount">
                                                                    {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(value.price_product)+ ' VNĐ'}
                                                                </span>
                                                            </td>
                                                            <td className="li-product-size">
                                                                <span className="size">{value.size}</span>
                                                                {availableQuantity < value.count && (
                                                                    <div className="stock-warning">
                                                                        <small>Chỉ còn {availableQuantity} sản phẩm</small>
                                                                    </div>
                                                                )}
                                                            </td>
                                                            <td className="quantity">
                                                                <div className="quantity-control">
                                                                    <button 
                                                                        className="quantity-btn dec" 
                                                                        onClick={() => downCount(value.count, value.id_cart)}
                                                                        disabled={parseInt(value.count) === 1}
                                                                    >
                                                                        <i className="fa fa-minus"></i>
                                                                    </button>
                                                                    <input 
                                                                        className="quantity-input" 
                                                                        value={value.count} 
                                                                        type="text" 
                                                                        readOnly 
                                                                    />
                                                                    <button 
                                                                        className="quantity-btn inc" 
                                                                        onClick={() => upCount(value.count, value.id_cart, value.id_product, value.size)}
                                                                    >
                                                                        <i className="fa fa-plus"></i>
                                                                    </button>
                                                                </div>
                                                            </td>
                                                            <td className="product-subtotal">
                                                                <span className="amount">
                                                                    {new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(parseInt(value.price_product) * parseInt(value.count))+ ' VNĐ'}
                                                                </span>
                                                            </td>
                                                        </tr>
                                                    )
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    
                                    <div className="cart-bottom-area">
                                        <div className="row">
                                            <div className="col-lg-7 col-md-6">
                                                <div className="coupon-area">
                                                    <div className="coupon-form">
                                                        <input 
                                                            type="text" 
                                                            className="coupon-input" 
                                                            onChange={(e) => set_coupon(e.target.value)} 
                                                            value={coupon} 
                                                            placeholder="Nhập mã giảm giá" 
                                                            disabled={isApplyingCoupon}
                                                        />
                                                        {appliedCoupon ? (
                                                            <button 
                                                                className="coupon-btn remove" 
                                                                onClick={removeCoupon}
                                                                disabled={isApplyingCoupon}
                                                            >
                                                                <i className="fa fa-times"></i> Xóa
                                                            </button>
                                                        ) : (
                                                            <button 
                                                                className="coupon-btn" 
                                                                onClick={handlerCoupon}
                                                                disabled={isApplyingCoupon}
                                                            >
                                                                {isApplyingCoupon ? (
                                                                    <>
                                                                        <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                                        Đang xử lý...
                                                                    </>
                                                                ) : 'Áp dụng'}
                                                            </button>
                                                        )}
                                                    </div>
                                                    {appliedCoupon && (
                                                        <div className="coupon-applied">
                                                            <span>Mã giảm giá: <strong>{appliedCoupon.code}</strong> - Giảm {appliedCoupon.promotion}%</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="col-lg-5 col-md-6">
                                                <div className="cart-summary">
                                                    <h3 className="summary-title">Tổng giỏ hàng</h3>
                                                    <div className="summary-content">
                                                        <div className="summary-item">
                                                            <span className="summary-label">Tạm tính:</span>
                                                            <span className="summary-value">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(total_price) + ' VNĐ'}</span>
                                                        </div>
                                                        <div className="summary-item">
                                                            <span className="summary-label">Giảm giá:</span>
                                                            <span className="summary-value discount">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(discount) + ' VNĐ'}</span>
                                                        </div>
                                                        <div className="summary-item total">
                                                            <span className="summary-label">Tổng cộng:</span>
                                                            <span className="summary-value">{new Intl.NumberFormat('vi-VN',{style: 'decimal',decimal: 'VND'}).format(discount > 0 ? new_price : total_price) + ' VNĐ'}</span>
                                                        </div>
                                                    </div>
                                                    <button 
                                                        className="checkout-btn" 
                                                        onClick={handler_checkout}
                                                    >
                                                        Tiến hành thanh toán
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-cart">
                                    <div className="empty-cart-icon">
                                        <i className="fa fa-shopping-cart"></i>
                                    </div>
                                    <h3>Giỏ hàng của bạn đang trống</h3>
                                    <p>Hãy thêm sản phẩm vào giỏ hàng để tiếp tục mua sắm</p>
                                    <Link to="/" className="continue-shopping-btn">
                                        Tiếp tục mua sắm
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Cart;

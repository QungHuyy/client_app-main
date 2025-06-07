import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, Redirect } from 'react-router-dom';
import queryString from 'query-string'
import User from '../API/User';
import { useDispatch, useSelector } from 'react-redux';
import { addSession } from '../Redux/Action/ActionSession';
import CartAPI from '../API/CartAPI';
import CartsLocal from '../Share/CartsLocal';
import { changeCount } from '../Redux/Action/ActionCount';
import './Auth.css';

SignIn.propTypes = {
    
};

function SignIn(props) {

    const dispatch = useDispatch()

    const [username, set_username] = useState('')
    const [password, set_password] = useState('')

    const [error_username, set_error_username] = useState(false)
    const [error_password, set_error_password] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const [redirect, set_redirect] = useState(false)

    // Get carts từ redux khi user chưa đăng nhập
    const carts = useSelector(state => state.Cart.listCart)

    // Get isLoad từ redux để load lại phần header
    const count_change = useSelector(state => state.Count.isLoad)

    const handler_signin = (e) => {
        e.preventDefault()

        if (!username.trim()) {
            set_error_username(true)
            return
        }

        if (!password.trim()) {
            set_error_password(true)
            return
        }

        setIsLoading(true)

        const fetchData = async () => {
            try {
                const params = {
                    username,
                    password
                }

                const query = '?' + queryString.stringify(params)
                const response = await User.Get_Detail_User(query)

                if (response === "Khong Tìm Thấy User") {
                    set_error_username(true)
                    set_error_password(false)
                } else if (response === "Sai Mat Khau") {
                    set_error_username(false)
                    set_error_password(true)
                } else {
                    console.log("Đăng nhập thành công:", response)
                    
                    // Xử lý đăng nhập thành công
                    const action = addSession(response._id)
                    dispatch(action)
                    
                    // Lưu ID người dùng vào sessionStorage
                    sessionStorage.setItem('id_user', response._id)
                    
                    // Đồng bộ giỏ hàng từ localStorage lên server
                    try {
                        console.log("Bắt đầu đồng bộ giỏ hàng khi đăng nhập")
                        const syncResult = await CartsLocal.syncCartToServer(response._id)
                        console.log("Kết quả đồng bộ giỏ hàng:", syncResult ? "Thành công" : "Thất bại")
                    } catch (error) {
                        console.error("Lỗi khi đồng bộ giỏ hàng:", error)
                    }
                    
                    // Cập nhật UI header với giỏ hàng mới
                    const action_count_change = changeCount(count_change)
                    dispatch(action_count_change)
                    set_redirect(true)
                }
            } catch (error) {
                console.error("Đăng nhập thất bại:", error)
                set_error_username(true)
            } finally {
                setIsLoading(false)
            }
        }

        fetchData()
    }

    return (
        <div className="auth-container">
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Đăng nhập</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="auth-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-6 col-md-8">
                            <div className="auth-form-container">
                                <div className="auth-header">
                                    <h2>Đăng nhập</h2>
                                    <p>Đăng nhập để mua hàng và theo dõi đơn hàng của bạn</p>
                                </div>
                                <form className="auth-form" onSubmit={handler_signin}>
                                    <div className="form-group">
                                        <label htmlFor="username">Tên đăng nhập <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-icon">
                                                <i className="fa fa-user"></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                id="username"
                                                className={`form-control ${error_username ? 'is-invalid' : ''}`}
                                                placeholder="Nhập tên đăng nhập" 
                                                value={username} 
                                                onChange={(e) => {
                                                    set_username(e.target.value)
                                                    set_error_username(false)
                                                }} 
                                            />
                                        </div>
                                        {error_username && 
                                            <div className="invalid-feedback">
                                                Tên đăng nhập không chính xác
                                            </div>
                                        }
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-icon">
                                                <i className="fa fa-lock"></i>
                                            </div>
                                            <input 
                                                type="password" 
                                                id="password"
                                                className={`form-control ${error_password ? 'is-invalid' : ''}`} 
                                                placeholder="Nhập mật khẩu" 
                                                value={password} 
                                                onChange={(e) => {
                                                    set_password(e.target.value)
                                                    set_error_password(false)
                                                }} 
                                            />
                                        </div>
                                        {error_password && 
                                            <div className="invalid-feedback">
                                                Mật khẩu không chính xác
                                            </div>
                                        }
                                    </div>

                                    <div className="form-group">
                                        <button 
                                            type="submit" 
                                            className="auth-button"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                                                    Đang đăng nhập...
                                                </>
                                            ) : 'Đăng nhập'}
                                        </button>
                                    </div>

                                </form>
                                <div className="auth-footer">
                                    <p>Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                                </div>
                                {redirect && <Redirect to="/" />}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignIn;

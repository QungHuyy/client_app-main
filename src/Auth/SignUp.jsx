import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import User from '../API/User';
import { useForm } from "react-hook-form";
import './Auth.css';

SignUp.propTypes = {

};

function SignUp(props) {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const onSubmit = data => console.log(data);

    const [fullname, set_fullname] = useState('')
    const [username, set_username] = useState('')
    const [password, set_password] = useState('')
    const [confirm, set_confirm] = useState('')
    const [email, set_email] = useState('')
    const [phone, set_phone] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [show_success, set_show_success] = useState(false)

    const [errorEmail, setEmailError] = useState(false)
    const [errorPhone, setPhoneError] = useState(false)
    const [errorFullname, setFullnameError] = useState(false)
    const [errorUsername, setUsernameError] = useState(false)
    const [errorPassword, setPasswordError] = useState(false)
    const [errorConfirm, setConfirmError] = useState(false)
    const [errorCheckPass, setCheckPass] = useState(false)

    const [username_exist, set_username_exist] = useState(false)

    const resetErrors = () => {
        setEmailError(false)
        setPhoneError(false)
        setFullnameError(false)
        setUsernameError(false)
        setPasswordError(false)
        setConfirmError(false)
        setCheckPass(false)
        set_username_exist(false)
    }

    const handler_signup = (e) => {
        e.preventDefault()
        resetErrors()

        const phoneRegex = /^(?:\+84|0)(?:3[2-9]|7[0-9]|8[1-9]|9[0-9])[0-9]{7}$/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email || !emailRegex.test(email)) {
            setEmailError(true);
            return;
        }

        if (!phone || !phoneRegex.test(phone)) {
            setPhoneError(true);
            return;
        }

        if (!fullname) {
            setFullnameError(true)
            return
        }

        if (!username) {
                setUsernameError(true)
                return
        }

        if (!password) {
                    setPasswordError(true)
                    return
        }

        if (!confirm) {
                        setConfirmError(true)
                        return
        }

        if (password !== confirm) {
                            setCheckPass(true)
                            return
        }

        setIsLoading(true)
                            
                            const fetchData = async () => {
                                try {
                                    const data = {
                                        email: email,
                    phone: phone,
                                        username: username,
                                        password: password,
                                        fullname: fullname,
                                        id_permission: '6087dcb5f269113b3460fce4'
                                    }

                                    const response = await User.Post_User(data)
                                    console.log(response)

                                    if (response === 'User Da Ton Tai') {
                                        set_username_exist(true)
                                    } else {
                                        set_show_success(true)
                    clearForm()
                                    }
                                } catch (error) {
                                    console.error("Đăng ký thất bại:", error)
            } finally {
                setIsLoading(false)
                                }
                            }

                            fetchData()
        
        setTimeout(() => {
            set_show_success(false)
        }, 3000)
    }

    const clearForm = () => {
        set_fullname('')
        set_username('')
        set_password('')
        set_confirm('')
        set_email('')
        set_phone('')
    }

    return (
        <div className="auth-container">
            {show_success && 
                <div className="notification-modal success-modal">
                    <div className="notification-content">
                        <div className="notification-icon">
                            <i className="fa fa-check-circle"></i>
                            </div>
                        <div className="notification-message">Bạn đã đăng ký thành công!</div>
                        <button className="close-button" onClick={() => set_show_success(false)}>
                            <i className="fa fa-times"></i>
                        </button>
                        </div>
                    </div>
            }

            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Đăng ký</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="auth-section">
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8 col-md-10">
                            <div className="auth-form-container">
                                <div className="auth-header">
                                    <h2>Đăng ký tài khoản</h2>
                                    <p>Tạo tài khoản để mua hàng và theo dõi đơn hàng của bạn</p>
                                </div>
                                <form className="auth-form" onSubmit={handler_signup}>
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="email">Email <span className="required">*</span></label>
                                                <div className="input-group">
                                                    <div className="input-icon">
                                                        <i className="fa fa-envelope"></i>
                                                    </div>
                                                    <input 
                                                        type="email" 
                                                        id="email"
                                                        className={`form-control ${errorEmail ? 'is-invalid' : ''}`}
                                                        placeholder="Nhập địa chỉ email" 
                                                        value={email} 
                                                        onChange={(e) => {
                                                            set_email(e.target.value)
                                                            setEmailError(false)
                                                        }} 
                                                    />
                                                </div>
                                                {errorEmail && 
                                                    <div className="invalid-feedback">
                                                        Email không hợp lệ
                                                    </div>
                                            }  
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="phone">Số điện thoại <span className="required">*</span></label>
                                                <div className="input-group">
                                                    <div className="input-icon">
                                                        <i className="fa fa-phone"></i>
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        id="phone"
                                                        className={`form-control ${errorPhone ? 'is-invalid' : ''}`}
                                                        placeholder="Nhập số điện thoại" 
                                                        value={phone} 
                                                        onChange={(e) => {
                                                            set_phone(e.target.value)
                                                            setPhoneError(false)
                                                        }} 
                                                    />
                                                </div>
                                                {errorPhone && 
                                                    <div className="invalid-feedback">
                                                        Số điện thoại không hợp lệ
                                                    </div>
                                            }  
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="fullname">Họ tên đầy đủ <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-icon">
                                                <i className="fa fa-user"></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                id="fullname"
                                                className={`form-control ${errorFullname ? 'is-invalid' : ''}`}
                                                placeholder="Nhập họ và tên" 
                                                value={fullname} 
                                                onChange={(e) => {
                                                    set_fullname(e.target.value)
                                                    setFullnameError(false)
                                                }} 
                                            />
                                        </div>
                                        {errorFullname && 
                                            <div className="invalid-feedback">
                                                Vui lòng nhập họ tên
                                            </div>
                                            }
                                        </div>
                                    
                                    <div className="form-group">
                                        <label htmlFor="username">Tên đăng nhập <span className="required">*</span></label>
                                        <div className="input-group">
                                            <div className="input-icon">
                                                <i className="fa fa-user-circle"></i>
                                            </div>
                                            <input 
                                                type="text" 
                                                id="username"
                                                className={`form-control ${errorUsername || username_exist ? 'is-invalid' : ''}`}
                                                placeholder="Nhập tên đăng nhập" 
                                                value={username} 
                                                onChange={(e) => {
                                                    set_username(e.target.value)
                                                    setUsernameError(false)
                                                    set_username_exist(false)
                                                }} 
                                            />
                                        </div>
                                        {errorUsername && 
                                            <div className="invalid-feedback">
                                                Vui lòng nhập tên đăng nhập
                                            </div>
                                        }
                                        {username_exist && 
                                            <div className="invalid-feedback">
                                                Tên đăng nhập đã tồn tại
                                            </div>
                                            }
                                        </div>
                                    
                                    <div className="row">
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="password">Mật khẩu <span className="required">*</span></label>
                                                <div className="input-group">
                                                    <div className="input-icon">
                                                        <i className="fa fa-lock"></i>
                                                    </div>
                                                    <input 
                                                        type="password" 
                                                        id="password"
                                                        className={`form-control ${errorPassword ? 'is-invalid' : ''}`}
                                                        placeholder="Nhập mật khẩu" 
                                                        value={password} 
                                                        onChange={(e) => {
                                                            set_password(e.target.value)
                                                            setPasswordError(false)
                                                            setCheckPass(false)
                                                        }} 
                                                    />
                                                </div>
                                                {errorPassword && 
                                                    <div className="invalid-feedback">
                                                        Vui lòng nhập mật khẩu
                                                    </div>
                                                }
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="form-group">
                                                <label htmlFor="confirm">Xác nhận mật khẩu <span className="required">*</span></label>
                                                <div className="input-group">
                                                    <div className="input-icon">
                                                        <i className="fa fa-lock"></i>
                                                    </div>
                                                    <input 
                                                        type="password" 
                                                        id="confirm"
                                                        className={`form-control ${errorConfirm || errorCheckPass ? 'is-invalid' : ''}`}
                                                        placeholder="Xác nhận mật khẩu" 
                                                        value={confirm} 
                                                        onChange={(e) => {
                                                            set_confirm(e.target.value)
                                                            setConfirmError(false)
                                                            setCheckPass(false)
                                                        }} 
                                                    />
                                                </div>
                                                {errorConfirm && 
                                                    <div className="invalid-feedback">
                                                        Vui lòng xác nhận mật khẩu
                                                    </div>
                                                }
                                                {errorCheckPass && 
                                                    <div className="invalid-feedback">
                                                        Mật khẩu xác nhận không khớp
                                                    </div>
                                                }
                                            </div>
                                        </div>
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
                                                    Đang xử lý...
                                                </>
                                            ) : 'Đăng ký'}
                                        </button>
                                    </div>
                                </form>
                                <div className="auth-footer">
                                    <p>Bạn đã có tài khoản? <Link to="/signin">Đăng nhập ngay</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignUp;

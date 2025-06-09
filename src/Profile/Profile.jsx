import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Profile.css';
import User from '../API/User';
import { useDispatch } from 'react-redux';

function Profile(props) {
    const [activeTab, setActiveTab] = useState('edit_profile');
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    
    // Form fields
    const [fullname, setFullname] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    
    // Password fields
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    // Error states
    const [passwordError, setPasswordError] = useState('');
    const [formErrors, setFormErrors] = useState({});
    
    // Success message
    const [successMessage, setSuccessMessage] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            setLoading(true);
            try {
                const userId = sessionStorage.getItem('id_user');
                if (!userId) {
                    window.location.href = '/login';
                    return;
                }
                
                const response = await User.Get_User(userId);
                setUser(response);
                
                // Populate form fields
                setFullname(response.fullname || '');
                setUsername(response.username || '');
                setEmail(response.email || '');
                setPhone(response.phone || '');
                
                // Reset password fields for security
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert('Không thể tải thông tin người dùng. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    // Clear messages when switching tabs
    useEffect(() => {
        setSuccessMessage('');
        setPasswordError('');
        setFormErrors({});
    }, [activeTab]);

    const validateProfileForm = () => {
        const errors = {};
        
        if (!fullname.trim()) {
            errors.fullname = 'Vui lòng nhập họ tên';
        }
        
        if (!email.trim()) {
            errors.email = 'Vui lòng nhập email';
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            errors.email = 'Email không hợp lệ';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const validatePasswordForm = () => {
        // Reset previous errors
        setPasswordError('');
        
        if (!currentPassword) {
            setPasswordError('Vui lòng nhập mật khẩu hiện tại');
            return false;
        }
        
        if (!newPassword) {
            setPasswordError('Vui lòng nhập mật khẩu mới');
            return false;
        }
        
        if (newPassword.length < 6) {
            setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự');
            return false;
        }
        
        if (newPassword !== confirmPassword) {
            setPasswordError('Mật khẩu xác nhận không khớp');
            return false;
        }
        
        // Kiểm tra mật khẩu hiện tại khác mật khẩu mới
        if (currentPassword === newPassword) {
            setPasswordError('Mật khẩu mới phải khác mật khẩu hiện tại');
            return false;
        }
        
        return true;
    };

    const handleUpdateProfile = async () => {
        // Clear previous messages
        setSuccessMessage('');
        setFormErrors({});
        
        if (!validateProfileForm()) {
            return;
        }
        
        setUpdating(true);
        
        try {
            const data = {
                _id: sessionStorage.getItem('id_user'),
                fullname,
                email,
                phone
            };

            const response = await User.Put_User(data);
            
            // Backend trả về chuỗi văn bản thay vì JSON
            console.log("Server response:", response);
            
            // Xử lý các trường hợp lỗi cụ thể mà backend trả về
            if (response === "Email Da Ton Tai") {
                setFormErrors({...formErrors, email: 'Email này đã được sử dụng bởi tài khoản khác'});
                setUpdating(false);
                return;
            }
            
            if (response === "Phone Da Ton Tai") {
                setFormErrors({...formErrors, phone: 'Số điện thoại này đã được sử dụng bởi tài khoản khác'});
                setUpdating(false);
                return;
            }
            
            if (response === "Khong Co Thay Doi" || response === "Thanh Cong") {
                // Cập nhật thành công hoặc không có thay đổi
                setSuccessMessage('Cập nhật thông tin thành công!');
                
                // Cập nhật thông tin user trong state
                setUser({...user, fullname, email, phone});
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                // Các lỗi khác
                alert('Cập nhật thất bại: ' + response);
            }
        } catch (error) {
            console.error('Cập nhật thất bại:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại sau.');
        } finally {
            setUpdating(false);
        }
    };
    
    const handleChangePassword = async () => {
        // Clear previous messages
        setSuccessMessage('');
        setPasswordError('');
        
        if (!validatePasswordForm()) {
            return;
        }
        
        setUpdating(true);
        
        try {
            // API endpoint /api/User/change-password yêu cầu userId, oldPassword, newPassword
            const data = {
                userId: sessionStorage.getItem('id_user'),
                oldPassword: currentPassword,
                newPassword: newPassword
            };

            // Sử dụng API method thay vì fetch trực tiếp
            const response = await User.Change_Password(data);
            
            console.log("Change password response:", response);
            
            if (response.success) {
                // Reset password fields
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                
                setSuccessMessage('Đổi mật khẩu thành công!');
                
                // Scroll to top to show success message
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setPasswordError(response.message || 'Đổi mật khẩu thất bại');
            }
        } catch (error) {
            console.error('Đổi mật khẩu thất bại:', error);
            
            // Xử lý phản hồi lỗi từ server
            if (error.response && error.response.data) {
                setPasswordError(error.response.data.message || 'Mật khẩu hiện tại không chính xác');
            } else {
                setPasswordError('Đổi mật khẩu thất bại. Vui lòng thử lại sau.');
            }
        } finally {
            setUpdating(false);
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Thông tin tài khoản</h1>
                <p>Quản lý thông tin để bảo mật tài khoản</p>
            </div>

            {successMessage && (
                <div className="success-message">
                    <i className="fa fa-check-circle"></i>
                    <span>{successMessage}</span>
                </div>
            )}

            <div className="profile-content">
                <div className="profile-tabs">
                    <div 
                        className={`profile-tab ${activeTab === 'edit_profile' ? 'active' : ''}`}
                        onClick={() => setActiveTab('edit_profile')}
                    >
                        <i className="fa fa-user"></i>
                        <span>Thông tin cá nhân</span>
                    </div>
                    <div 
                        className={`profile-tab ${activeTab === 'change_password' ? 'active' : ''}`}
                        onClick={() => setActiveTab('change_password')}
                    >
                        <i className="fa fa-lock"></i>
                        <span>Đổi mật khẩu</span>
                    </div>
                </div>

                <div className="profile-tab-content">
                    {loading ? (
                        <div className="profile-loading">
                            <div className="spinner"></div>
                            <p>Đang tải thông tin...</p>
                        </div>
                    ) : activeTab === 'edit_profile' ? (
                        <div className="profile-form">
                            <div className="avatar-section">
                                <div className="avatar-circle">
                                    <span className="initials">
                                        {fullname ? fullname.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                </div>
                                <h3 className="username-display">{fullname || 'Người dùng'}</h3>
                            </div>

                            <div className="form-group">
                                <label>
                                    <i className="fa fa-user-circle"></i> Họ và tên
                                </label>
                                <input 
                                    type="text" 
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Nhập họ và tên"
                                    className={formErrors.fullname ? 'error' : ''}
                                />
                                {formErrors.fullname && <div className="error-message">{formErrors.fullname}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-id-card"></i> Tên đăng nhập
                                </label>
                                <input 
                                    type="text" 
                                    value={username}
                                    disabled
                                    className="disabled"
                                />
                                <small>Tên đăng nhập không thể thay đổi</small>
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-envelope"></i> Email
                                </label>
                                <input 
                                    type="email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Nhập email"
                                    className={formErrors.email ? 'error' : ''}
                                />
                                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-phone"></i> Số điện thoại
                                </label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                    className={formErrors.phone ? 'error' : ''}
                                />
                                {formErrors.phone && <div className="error-message">{formErrors.phone}</div>}
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    className={`btn-update ${updating ? 'loading' : ''}`}
                                    onClick={handleUpdateProfile}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <div className="btn-spinner"></div> Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-save"></i> Cập nhật thông tin
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="profile-form">
                            {passwordError && (
                                <div className="error-alert">
                                    <i className="fa fa-exclamation-circle"></i>
                                    <span>{passwordError}</span>
                                </div>
                            )}
                            
                            <div className="avatar-section">
                                <div className="avatar-circle">
                                    <i className="fa fa-lock" style={{ fontSize: '48px', color: 'white' }}></i>
                                </div>
                                <h3 className="username-display">Bảo mật tài khoản</h3>
                                <p className="account-info">Đổi mật khẩu thường xuyên để bảo vệ tài khoản</p>
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-key"></i> Mật khẩu hiện tại
                                </label>
                                <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-lock"></i> Mật khẩu mới
                                </label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                                <small>Mật khẩu phải có ít nhất 6 ký tự</small>
                            </div>
                            
                            <div className="form-group">
                                <label>
                                    <i className="fa fa-check-circle"></i> Xác nhận mật khẩu
                                </label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    className={`btn-update ${updating ? 'loading' : ''}`}
                                    onClick={handleChangePassword}
                                    disabled={updating}
                                >
                                    {updating ? (
                                        <>
                                            <div className="btn-spinner"></div> Đang cập nhật...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fa fa-refresh"></i> Đổi mật khẩu
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Profile;

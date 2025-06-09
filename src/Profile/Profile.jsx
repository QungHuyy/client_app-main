import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './Profile.css';
import User from '../API/User';
import { useDispatch } from 'react-redux';

function Profile(props) {
    const [activeTab, setActiveTab] = useState('edit_profile');
    const [user, setUser] = useState({});
    const [loading, setLoading] = useState(true);
    
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

    const validateProfileForm = () => {
        const errors = {};
        
        if (!fullname.trim()) {
            errors.fullname = 'Vui lòng nhập họ tên';
        }
        
        if (!username.trim()) {
            errors.username = 'Vui lòng nhập tên đăng nhập';
        } else if (username.length < 4) {
            errors.username = 'Tên đăng nhập phải có ít nhất 4 ký tự';
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
        
        return true;
    };

    const handleUpdateProfile = async () => {
        if (!validateProfileForm()) {
            return;
        }
        
        try {
            const data = {
                _id: sessionStorage.getItem('id_user'),
                fullname,
                username,
                phone
            };

            await User.Put_User(data);
            alert('Cập nhật thông tin thành công!');
        } catch (error) {
            console.error('Cập nhật thất bại:', error);
            alert('Cập nhật thất bại. Vui lòng thử lại sau.');
        }
    };

    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            return;
        }
        
        try {
            // Here you would usually check if current password matches before allowing change
            // For simplicity, we'll just update the password
            const data = {
                _id: sessionStorage.getItem('id_user'),
                password: newPassword
            };

            await User.Put_User(data);
            
            // Reset password fields
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            
            alert('Đổi mật khẩu thành công!');
        } catch (error) {
            console.error('Đổi mật khẩu thất bại:', error);
            alert('Đổi mật khẩu thất bại. Vui lòng thử lại sau.');
        }
    };

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>Thông tin tài khoản</h1>
                <p>Quản lý thông tin để bảo mật tài khoản</p>
            </div>

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
                            <div className="form-group">
                                <label>Họ và tên</label>
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
                                <label>Tên đăng nhập</label>
                                <input 
                                    type="text" 
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    className={formErrors.username ? 'error' : ''}
                                />
                                {formErrors.username && <div className="error-message">{formErrors.username}</div>}
                            </div>
                            
                            <div className="form-group">
                                <label>Email</label>
                                <input 
                                    type="email" 
                                    value={email}
                                    disabled
                                    className="disabled"
                                />
                                <small>Email không thể thay đổi</small>
                            </div>
                            
                            <div className="form-group">
                                <label>Số điện thoại</label>
                                <input 
                                    type="tel" 
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="Nhập số điện thoại"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    className="btn-update" 
                                    onClick={handleUpdateProfile}
                                >
                                    Cập nhật thông tin
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
                            
                            <div className="form-group">
                                <label>Mật khẩu hiện tại</label>
                                <input 
                                    type="password" 
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu hiện tại"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Mật khẩu mới</label>
                                <input 
                                    type="password" 
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu mới"
                                />
                                <small>Mật khẩu phải có ít nhất 6 ký tự</small>
                            </div>
                            
                            <div className="form-group">
                                <label>Xác nhận mật khẩu</label>
                                <input 
                                    type="password" 
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Nhập lại mật khẩu mới"
                                />
                            </div>
                            
                            <div className="form-actions">
                                <button 
                                    className="btn-update" 
                                    onClick={handleChangePassword}
                                >
                                    Đổi mật khẩu
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

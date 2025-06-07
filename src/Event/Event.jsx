import React, { useEffect, useState } from 'react';
import './Event.css'
import queryString from 'query-string'
import CouponAPI from '../API/CouponAPI';
import Pagination from '../Shop/Component/Pagination';
import { Link } from 'react-router-dom';

function Event(props) {

    const [pagination, setPagination] = useState({
        page: '1',
        limit: '6',
        search: ''
    })

    const [coupons, setCoupons] = useState([])
    const [totalPage, setTotalPage] = useState()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [usedCoupons, setUsedCoupons] = useState([]) // Mã giảm giá đã sử dụng
    const [activeTab, setActiveTab] = useState('available') // Tab hiện tại: 'available' hoặc 'used'

        useEffect(() => {
        const query = '?' + queryString.stringify(pagination)
        setLoading(true)

        const fetchAllData = async () => {
            try {
                const response = await CouponAPI.getCoupons(query)
                console.log("Loaded coupons:", response.coupons);
                setCoupons(response.coupons)
                setTotalPage(response.totalPage)
                
                // Kiểm tra mã giảm giá nào đã được sử dụng bởi người dùng hiện tại
                if (sessionStorage.getItem('id_user')) {
                    checkUserCoupons()
                }
            } catch (err) {
                console.error("Error fetching coupons:", err)
                setError("Không thể tải danh sách mã giảm giá")
            } finally {
                setLoading(false)
            }
        }
        
        fetchAllData()
    }, [pagination])
    
    // Chạy checkUserCoupons sau khi lấy được danh sách coupon
    useEffect(() => {
        if (sessionStorage.getItem('id_user') && coupons.length > 0) {
            checkUserCoupons()
        }
    }, [coupons])

    const checkUserCoupons = async () => {
        try {
            // Mã giảm giá có thể có 3 trạng thái:
            // 1. Có thể sử dụng
            // 2. Đã sử dụng (người dùng đã sử dụng trong đơn hàng hoàn thành)
            // 3. Hết hạn (count <= 0)
            
            // Trong trang danh sách coupon, chúng ta cần xác định các mã đã sử dụng
            const userId = sessionStorage.getItem('id_user')
            if (!userId) {
                console.log("User not logged in, cannot check coupon status")
                return
            }
            
            // Lấy danh sách tất cả các mã giảm giá
            const couponsWithStatus = []
            const tempUsedCouponIds = []
            
            // Kiểm tra trạng thái cho từng mã giảm giá
            for (const coupon of coupons) {
                try {
                    // Kiểm tra từng mã với API server
                    const response = await CouponAPI.checkCouponStatus(coupon.code, userId)
                    
                    console.log(`Coupon ${coupon.code} status:`, response)
                    
                    // Nếu mã đã được sử dụng hoặc đang xử lý
                    if (response.msg === "Bạn đã sử dụng mã này rồi" || 
                        response.msg === "Bạn đã sử dụng mã này trong một đơn hàng đang xử lý") {
                        tempUsedCouponIds.push(coupon._id)
                        tempUsedCouponIds.push(coupon.code)
                    }
                    
                    // Nếu mã hết lượt sử dụng
                    if (response.msg === "Mã giảm giá đã hết lượt sử dụng" || coupon.count <= 0) {
                        tempUsedCouponIds.push(coupon._id)
                        tempUsedCouponIds.push(coupon.code)
                    }
                    
                } catch (error) {
                    console.error(`Error checking status for coupon ${coupon.code}:`, error)
                }
            }
            
            console.log("Used or expired coupons:", tempUsedCouponIds)
            setUsedCoupons(tempUsedCouponIds)
            
        } catch (err) {
            console.error("Error checking user coupons:", err)
        }
    }

    const handlerChangePage = (value) => {
        setPagination({
            ...pagination,
            page: value
        })
    }

    // Kiểm tra trạng thái của mã giảm giá
    const getCouponStatus = (coupon) => {
        // Ghi log để debug
        console.log(`Checking coupon status: ${coupon.code}, count: ${coupon.count}`);
        
        // Nếu số lượng mã giảm giá còn lại là 0 hoặc âm
        if (coupon.count <= 0) {
            console.log(`Coupon ${coupon.code} is expired (count: ${coupon.count})`);
            return {
                status: 'expired',
                text: 'Đã hết lượt sử dụng'
            }
        }
        
        // Kiểm tra nếu mã giảm giá đã được sử dụng 
        // dựa trên danh sách đã kiểm tra từ server
        if (sessionStorage.getItem('id_user') && 
            (usedCoupons.includes(coupon._id) || usedCoupons.includes(coupon.code))) {
            console.log(`Coupon ${coupon.code} has been used or expired`);
            return {
                status: 'used',
                text: 'Đã sử dụng'
            }
        }
        
        // Mã giảm giá có thể sử dụng
        console.log(`Coupon ${coupon.code} is available (count: ${coupon.count})`);
        return {
            status: 'available',
            text: `Còn ${coupon.count} lượt sử dụng`
        }
    }

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border" role="status">
                    <span className="sr-only">Đang tải...</span>
                </div>
                <p className="mt-2">Đang tải mã giảm giá...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="alert alert-danger text-center my-5" role="alert">
                {error}
            </div>
        )
    }

    return (
        <div>
            <div className="breadcrumb-area">
                <div className="container">
                    <div className="breadcrumb-content">
                        <ul>
                            <li><Link to="/">Trang chủ</Link></li>
                            <li className="active">Khuyến mãi</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div className="container event-container">
                <div className="event-header">
                    <h2 className="event-title">Mã giảm giá & Khuyến mãi</h2>
                    <p className="event-subtitle">Sử dụng mã giảm giá để tiết kiệm khi mua sắm tại Thời trang H&A</p>
                </div>
                
                {!sessionStorage.getItem('id_user') && (
                    <div className="alert alert-info">
                        <i className="fa fa-info-circle mr-2"></i>
                        <span>Vui lòng <Link to="/signin" className="alert-link">đăng nhập</Link> để sử dụng mã giảm giá</span>
                    </div>
                )}
                
                <div className="event-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'available' ? 'active' : ''}`}
                        onClick={() => setActiveTab('available')}
                    >
                        <i className="fa fa-check-circle mr-1"></i> Có thể sử dụng
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'used' ? 'active' : ''}`}
                        onClick={() => setActiveTab('used')}
                    >
                        <i className="fa fa-times-circle mr-1"></i> Đã sử dụng/Hết hạn
                    </button>
                </div>
                
                <div className="coupon-grid">
                    {coupons && coupons.length > 0 ? (
                        coupons
                            .filter(coupon => {
                                // Xác định trạng thái mã giảm giá và lưu lại để tránh gọi hàm nhiều lần
                                coupon._status = getCouponStatus(coupon);
                                
                                // Lọc theo tab đang chọn
                                if (activeTab === 'available') {
                                    return coupon._status.status === 'available';
                                } else {
                                    return coupon._status.status === 'used' || coupon._status.status === 'expired';
                                }
                            })
                            .map(coupon => {
                                // Sử dụng trạng thái đã lưu trước đó
                                const couponStatus = coupon._status
                                
                                return (
                                    <div className={`coupon-card ${couponStatus.status}`} key={coupon._id}>
                                        <div className="coupon-header">
                                            <div className="coupon-label">Mã giảm giá</div>
                                            <div className={`coupon-status ${couponStatus.status}`}>
                                                {couponStatus.status === 'available' ? (
                                                    <i className="fa fa-check-circle"></i>
                                                ) : couponStatus.status === 'used' ? (
                                                    <i className="fa fa-check"></i>
                                                ) : (
                                                    <i className="fa fa-times-circle"></i>
                                                )}
                                                <span>{couponStatus.text}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="coupon-body">
                                            <h3 className="coupon-title">{coupon.describe}</h3>
                                            <div className="coupon-discount">
                                                <span className="discount-value">{coupon.promotion}%</span>
                                                <span className="discount-label">Giảm giá</span>
                                            </div>
                                            
                                            <div className="coupon-code-container">
                                                <div className="coupon-code">
                                                    <span>{coupon.code}</span>
                                                </div>
                                                {couponStatus.status === 'available' && (
                                                    <button 
                                                        className="copy-code-btn" 
                                                        onClick={() => {
                                                            navigator.clipboard.writeText(coupon.code)
                                                            alert(`Đã sao chép mã: ${coupon.code}`)
                                                        }}
                                                    >
                                                        <i className="fa fa-copy"></i>
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="coupon-description">
                                                <p>Giảm {coupon.promotion}% cho đơn hàng của bạn tại Thời trang H&A.</p>
                                                <p>Mỗi mã chỉ sử dụng được một lần.</p>
                                            </div>
                                        </div>
                                        
                                        <div className="coupon-footer">
                                            {couponStatus.status === 'available' && (
                                                <Link 
                                                    to="/cart" 
                                                    className="use-coupon-btn full-width"
                                                    onClick={() => {
                                                        localStorage.setItem('temp_coupon', coupon.code)
                                                    }}
                                                >
                                                    Sử dụng ngay
                                                </Link>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                    ) : (
                        <div className="no-coupons">
                            <i className="fa fa-ticket"></i>
                            <p>Hiện tại không có mã giảm giá nào.</p>
                        </div>
                    )}
                    
                    {/* Hiển thị thông báo khi không có mã giảm giá nào trong tab hiện tại */}
                    {coupons && coupons.length > 0 && coupons.filter(coupon => {
                        // Sử dụng trạng thái đã lưu hoặc tính toán nếu chưa có
                        const status = coupon._status ? coupon._status : getCouponStatus(coupon);
                        if (activeTab === 'available') {
                            return status.status === 'available';
                        } else {
                            return status.status === 'used' || status.status === 'expired';
                        }
                    }).length === 0 && (
                        <div className="no-coupons">
                            <i className="fa fa-ticket"></i>
                            <p>{activeTab === 'available' ? 'Không có mã giảm giá nào có thể sử dụng.' : 'Không có mã giảm giá nào đã sử dụng hoặc hết hạn.'}</p>
                        </div>
                    )}
                </div>
                
                {coupons && coupons.length > 0 && (
                    <div className="pagination-container">
                        <Pagination 
                            pagination={pagination} 
                            handlerChangePage={handlerChangePage} 
                            totalPage={totalPage} 
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Event;
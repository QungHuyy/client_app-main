import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import queryString from 'query-string';
import OrderAPI from '../../API/OrderAPI';
import Detail_OrderAPI from '../../API/Detail_OrderAPI';
import './History.css';

MainHistory.propTypes = {};

function MainHistory(props) {
    const [history, setHistory] = useState([]);
    const [isLoad, setIsLoad] = useState(true);
    const [showError, setShowError] = useState(false);
    const [loading, setLoading] = useState(true);
    const [orderDetails, setOrderDetails] = useState({});

    // Hàm sắp xếp đơn hàng theo thời gian
    const sortOrdersByDate = (orders) => {
        return [...orders].sort((a, b) => {
            // Kiểm tra các trường thời gian có thể có
            const dateA = a.createdAt || a.create_time;
            const dateB = b.createdAt || b.create_time;
            
            if (!dateA) return 1;
            if (!dateB) return -1;
            
            // Nếu là định dạng DD/MM/YYYY
            if (typeof dateA === 'string' && dateA.includes('/')) {
                const [dayA, monthA, yearA] = dateA.split('/').map(Number);
                const [dayB, monthB, yearB] = dateB.split('/').map(Number);
                return new Date(yearB, monthB - 1, dayB) - new Date(yearA, monthA - 1, dayA);
            }
            
            // Nếu là định dạng timestamp hoặc ISO date
            return new Date(dateB) - new Date(dateA);
        });
    };
    
    // Lấy chi tiết sản phẩm cho mỗi đơn hàng
    const fetchOrderDetails = async (orders) => {
        const details = {};
        
        for (const order of orders) {
            try {
                const response = await Detail_OrderAPI.get_detail_order(order._id);
                details[order._id] = response;
            } catch (error) {
                console.error(`Error fetching details for order ${order._id}:`, error);
                details[order._id] = [];
            }
        }
        
        setOrderDetails(details);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await OrderAPI.get_order(sessionStorage.getItem('id_user'));
                
                // Sắp xếp đơn hàng theo thời gian từ gần nhất đến xa nhất
                const sortedOrders = sortOrdersByDate(response);
                console.log("Sorted orders:", sortedOrders);
                setHistory(sortedOrders);
                
                // Lấy chi tiết sản phẩm cho mỗi đơn hàng
                fetchOrderDetails(sortedOrders);
            } catch (error) {
                console.error("Error fetching order history:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isLoad]);

    const deleteOrder = async (id, pay) => {
        if (pay === true) {
            setShowError(true);
            setTimeout(() => {
                setShowError(false);
            }, 2000);
            return;
        }

        if (!showError) {
            const params = {
                id: id
            };
    
            const query = '?' + queryString.stringify(params);
    
            try {
                const response = await OrderAPI.cancel_order(query);
                console.log(response);
                setIsLoad(!isLoad);
            } catch (error) {
                console.error("Error cancelling order:", error);
            }
        }
    };

    const getStatusClass = (status) => {
        switch(status) {
            case '1': return 'status-processing';
            case '2': return 'status-confirmed';
            case '3': return 'status-shipping';
            case '4': return 'status-finished';
            default: return 'status-canceled';
        }
    };

    const getStatusText = (status) => {
        switch(status) {
            case '1': return 'Đang xử lý';
            case '2': return 'Đã xác nhận';
            case '3': return 'Đang giao';
            case '4': return 'Hoàn thành';
            default: return 'Đã hủy';
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return dateString;
    };

    return (
        <div className="order-history-container">
            {showError && (
                <div className="modal_error">
                    <div className="error-notification">
                        <div className="error-icon">
                            <i className="fa fa-exclamation-circle"></i>
                        </div>
                        <h4>Không Thể Hủy Vì Đơn Hàng Đã Được Thanh Toán!</h4>
                    </div>
                </div>
            )}
            
            <div className="order-history-area pt-60 pb-60">
                <div className="container">
                    <div className="row">
                        <div className="col-12">
                            <div className="section-title text-center mb-30">
                                <h2>Lịch sử đơn hàng của bạn</h2>
                                <p>Theo dõi trạng thái đơn hàng và quản lý các đơn hàng đã đặt</p>
                            </div>
                            
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-warning" role="status">
                                        <span className="sr-only">Đang tải...</span>
                                    </div>
                                </div>
                            ) : history.length === 0 ? (
                                <div className="empty-order-history text-center py-5">
                                    <i className="fa fa-shopping-bag empty-icon"></i>
                                    <h3>Bạn chưa có đơn hàng nào</h3>
                                    <p>Hãy khám phá các sản phẩm của chúng tôi và đặt hàng ngay!</p>
                                    <Link to="/shop" className="btn-shop-now">Mua sắm ngay</Link>
                                </div>
                            ) : (
                                <div className="order-history-wrapper">
                                    {history.map(order => (
                                        <div className="order-card" key={order._id}>
                                            <div className="order-header">
                                                <div className="order-id">
                                                    <span>Mã đơn hàng:</span>
                                                    <Link to={`/history/${order._id}`} className="view-detail">
                                                        {order._id.substring(0, 8)}...
                                                    </Link>
                                                </div>
                                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                                    {getStatusText(order.status)}
                                                </div>
                                            </div>
                                            
                                            <div className="order-body">
                                                <div className="order-info">
                                                    <div className="info-item">
                                                        <i className="fa fa-user"></i>
                                                        <span>{order.id_note?.fullname || 'N/A'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <i className="fa fa-phone"></i>
                                                        <span>{order.id_note?.phone || 'N/A'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <i className="fa fa-map-marker"></i>
                                                        <span>{order.address || 'N/A'}</span>
                                                    </div>
                                                    <div className="info-item">
                                                        <i className="fa fa-calendar"></i>
                                                        <span>{formatDate(order.create_time)}</span>
                                                    </div>
                                                </div>
                                                
                                                <div className="order-details">
                                                    <div className="detail-item">
                                                        <span className="label">Tổng tiền:</span>
                                                        <span className="value price">
                                                            {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(order.total)} VNĐ
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Phí vận chuyển:</span>
                                                        <span className="value">
                                                            {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(order.feeship || 0)} VNĐ
                                                        </span>
                                                    </div>
                                                    <div className="detail-item">
                                                        <span className="label">Thanh toán:</span>
                                                        <span className={`value payment-status ${order.pay ? 'paid' : 'unpaid'}`}>
                                                            {order.pay ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="order-footer">
                                                <Link to={`/history/${order._id}`} className="btn-view-detail">
                                                    <i className="fa fa-eye"></i> Xem chi tiết
                                                </Link>
                                                
                                                {(order.status === '1' || order.status === '2') && (
                                                    <button 
                                                        onClick={() => deleteOrder(order._id, order.pay)} 
                                                        className="btn-cancel-order"
                                                        disabled={order.pay}
                                                    >
                                                        <i className="fa fa-times"></i> Hủy đơn hàng
                                                    </button>
                                                )}
                                                
                                                {order.status === '0' && (
                                                    <div className="canceled-notice">
                                                        <i className="fa fa-ban"></i> Đã hủy
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MainHistory;
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
// import HistoryAPI from '../../API/HistoryAPI';
import './History.css'
import OrderAPI from '../../API/OrderAPI';
import Detail_OrderAPI from '../../API/Detail_OrderAPI';
import NoteAPI from '../../API/NoteAPI';


function DetailHistory(props) {
    const { id } = useParams();
    const [order, setOrder] = useState({});
    const [detailOrder, setDetailOrder] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await OrderAPI.get_detail(id);
                console.log(response);
                setOrder(response);

                const responseDetailOrder = await Detail_OrderAPI.get_detail_order(id);
                setDetailOrder(responseDetailOrder);
            } catch (error) {
                console.error("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

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

    // Kiểm tra xem đơn hàng có bị hủy không - đảm bảo so sánh đúng
    const isOrderCanceled = order.status === '0';
    
    // Log để kiểm tra
    console.log('Order status:', order.status);
    console.log('Is order canceled:', isOrderCanceled);

    // Kiểm tra trạng thái của từng bước
    const isProcessingActive = !isOrderCanceled && parseInt(order.status) >= 1;
    const isConfirmedActive = !isOrderCanceled && parseInt(order.status) >= 2;
    const isShippingActive = !isOrderCanceled && parseInt(order.status) >= 3;
    const isCompletedActive = !isOrderCanceled && parseInt(order.status) >= 4;

    // Tính tổng số sản phẩm
    const totalItems = detailOrder.reduce((sum, item) => sum + item.count, 0);

    return (
        <div className="order-detail-container">
            <div className="order-detail-area pt-60 pb-60">
                <div className="container">
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-warning" role="status">
                                <span className="sr-only">Đang tải...</span>
                            </div>
                        </div>
                    ) : (
                        <div className="order-detail-card">
                            {/* Tiêu đề và trạng thái */}
                            <div className="order-detail-header">
                                <div>
                                    <h2>Chi tiết đơn hàng</h2>
                                    <p className="order-id">Mã đơn hàng: {order._id}</p>
                                    <p className="order-date">Ngày đặt: {formatDate(order.create_time)}</p>
                                </div>
                                <div className={`order-status ${getStatusClass(order.status)}`}>
                                    {getStatusText(order.status)}
                                </div>
                            </div>

                            {/* Tiến trình đơn hàng */}
                            <div className="order-progress-simple">
                                <div className={`progress-track ${isOrderCanceled ? 'canceled' : ''}`}>
                                    <div className={`step ${isProcessingActive ? 'active' : ''}`}>
                                        <div className="step-icon" style={isOrderCanceled ? {backgroundColor: '#aaaaaa', borderColor: '#aaaaaa', color: '#fff'} : {}}>
                                            <i className="fa fa-file-text-o"></i>
                                        </div>
                                        <div className="step-text">Đang xử lý</div>
                                    </div>
                                    <div className={`step ${isConfirmedActive ? 'active' : ''}`}>
                                        <div className="step-icon" style={isOrderCanceled ? {backgroundColor: '#aaaaaa', borderColor: '#aaaaaa', color: '#fff'} : {}}>
                                            <i className="fa fa-check"></i>
                                        </div>
                                        <div className="step-text">Đã xác nhận</div>
                                    </div>
                                    <div className={`step ${isShippingActive ? 'active' : ''}`}>
                                        <div className="step-icon" style={isOrderCanceled ? {backgroundColor: '#aaaaaa', borderColor: '#aaaaaa', color: '#fff'} : {}}>
                                            <i className="fa fa-truck"></i>
                                        </div>
                                        <div className="step-text">Đang giao</div>
                                    </div>
                                    <div className={`step ${isCompletedActive ? 'active' : ''}`}>
                                        <div className="step-icon" style={isOrderCanceled ? {backgroundColor: '#aaaaaa', borderColor: '#aaaaaa', color: '#fff'} : {}}>
                                            <i className="fa fa-gift"></i>
                                        </div>
                                        <div className="step-text">Hoàn thành</div>
                                    </div>
                                </div>
                            </div>

                            <div className="order-detail-divider"></div>

                            {/* Thông tin người nhận */}
                            <div className="order-section">
                                <h3 className="section-title">Thông tin người nhận</h3>
                                <div className="section-content">
                                    <p><span>Họ tên:</span> {order.id_note?.fullname || 'N/A'}</p>
                                    <p><span>Số điện thoại:</span> {order.id_note?.phone || 'N/A'}</p>
                                    <p><span>Địa chỉ:</span> {order.address || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="order-detail-divider"></div>

                            {/* Danh sách sản phẩm */}
                            <div className="order-section">
                                <h3 className="section-title">Sản phẩm đã đặt</h3>
                                <div className="product-list-simple">
                                    {detailOrder && detailOrder.map(item => (
                                        <div className="product-item-simple" key={item._id}>
                                            <div className="product-image-simple">
                                                <img src={item.id_product?.image} alt={item.name_product} />
                                            </div>
                                            <div className="product-info-simple">
                                                <h4 className="product-name-simple">{item.name_product}</h4>
                                                <div className="product-meta-simple">
                                                    <span>Size: {item.size}</span>
                                                    <span>x{item.count}</span>
                                                </div>
                                                <div className="product-price-simple">
                                                    {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(item.price_product)} VNĐ
                                                </div>
                                            </div>
                                            <div className="product-total-simple">
                                                {new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(item.price_product * item.count)} VNĐ
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-detail-divider"></div>

                            {/* Tổng tiền */}
                            <div className="order-summary-simple">
                                <div className="summary-row">
                                    <span>Tổng tiền hàng:</span>
                                    <span>{new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(order.total - (order.feeship || 0))} VNĐ</span>
                                </div>
                                <div className="summary-row">
                                    <span>Phí vận chuyển:</span>
                                    <span>{new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(order.feeship || 0)} VNĐ</span>
                                </div>
                                <div className="summary-row total">
                                    <span>Tổng thanh toán:</span>
                                    <span>{new Intl.NumberFormat('vi-VN', {style: 'decimal', decimal: 'VND'}).format(order.total)} VNĐ</span>
                                </div>
                            </div>

                            {/* Nút quay lại */}
                            <div className="order-actions-simple">
                                <Link to="/history" className="btn-back-simple">
                                    <i className="fa fa-arrow-left"></i> Quay lại danh sách đơn hàng
                                </Link>
                                {order.status === '4' && (
                                    <button className="btn-reorder-simple">
                                        <i className="fa fa-refresh"></i> Đặt lại đơn hàng
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default DetailHistory;
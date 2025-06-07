import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import '../assets/css/checkout.css';
import { useDispatch, useSelector } from 'react-redux';
import { changeCount } from '../Redux/Action/ActionCount';
import CartsLocal from '../Share/CartsLocal';
import { clearCartAndNotify } from '../Share/CartEventManager';

OrderSuccess.propTypes = {

};

function OrderSuccess(props) {
    const dispatch = useDispatch();
    const count_change = useSelector(state => state.Count.isLoad);
    
    // Đảm bảo giỏ hàng được xóa khi trang thành công được hiển thị
    useEffect(() => {
        const clearCartOnSuccess = async () => {
            console.log("OrderSuccess: Bắt đầu xóa giỏ hàng và cập nhật UI");
            
            // Xóa dữ liệu đơn hàng
            localStorage.removeItem("information");
            localStorage.removeItem("total_price");
            localStorage.removeItem("price");
            localStorage.removeItem("id_coupon");
            localStorage.removeItem("coupon");
            
            // Sử dụng clearCartAndNotify để xóa giỏ hàng và thông báo tất cả các component
            clearCartAndNotify();
            
            // Đảm bảo UI được cập nhật ngay lập tức qua Redux
            dispatch(changeCount(!count_change));
            
            // Sau đó mới gọi API để xóa trên server
            try {
                await CartsLocal.clearCart();
                console.log("OrderSuccess: Đã xóa giỏ hàng thành công từ trang Order Success");
                
                // Cập nhật Redux một lần nữa để đảm bảo
                setTimeout(() => {
                    dispatch(changeCount(!count_change));
                }, 500);
            } catch (error) {
                console.error("OrderSuccess: Lỗi khi xóa giỏ hàng:", error);
            }
        };
        
        // Gọi hàm xóa giỏ hàng ngay khi component mount
        clearCartOnSuccess();
        
        // Thêm một timeout để đảm bảo UI được cập nhật sau một khoảng thời gian ngắn
        const timeoutId = setTimeout(() => {
            console.log("OrderSuccess: Đảm bảo cập nhật UI sau 1 giây");
            
            // Đảm bảo giỏ hàng vẫn trống và thông báo cho các component khác
            clearCartAndNotify();
            
            // Cập nhật Redux một lần nữa
            dispatch(changeCount(!count_change));
        }, 1000);
        
        // Clean up
        return () => {
            clearTimeout(timeoutId);
        };
    }, []);

    return (
        <div className="order-success-page">
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8">
                        <div className="success-card">
                            <div className="success-icon">
                                <div className="circle-border">
                                    <i className="fa fa-check"></i>
                                </div>
                            </div>
                            
                            <h1>Đặt hàng thành công!</h1>
                            
                            <p className="lead">
                                Cảm ơn bạn đã mua sắm tại Thời trang H&A. Đơn hàng của bạn đã được xác nhận và sẽ được giao trong thời gian sớm nhất.
                            </p>
                            
                            <p>
                                Một email xác nhận đơn hàng đã được gửi tới địa chỉ email của bạn với đầy đủ thông tin chi tiết. 
                                Vui lòng kiểm tra hộp thư đến của bạn.
                            </p>
                            
                            <div className="order-actions">
                                <Link to="/history" className="btn btn-success" style={{ backgroundColor: '#28a745', borderColor: '#28a745', color: '#fff' }}>
                                    <i className="fa fa-list-alt mr-2"></i>Xem đơn hàng
                                </Link>
                                <Link to="/" className="btn btn-primary" style={{ backgroundColor: '#fed700', borderColor: '#fed700', color: '#000' }}>
                                    <i className="fa fa-home mr-2"></i>Tiếp tục mua sắm
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderSuccess;
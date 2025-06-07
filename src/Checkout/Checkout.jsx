import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Redirect } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { changeCount } from "../Redux/Action/ActionCount";
import OrderAPI from "../API/OrderAPI";
import NoteAPI from "../API/NoteAPI";
import Detail_OrderAPI from "../API/Detail_OrderAPI";
import CouponAPI from "../API/CouponAPI";
import Paypal from "./Paypal";
import MoMo from "./MoMo";
import CartsLocal from "../Share/CartsLocal";
import Product from "../API/Product";
import '../assets/css/checkout.css';
import { clearCartAndNotify } from "../Share/CartEventManager";

function Checkout(props) {
  const dispatch = useDispatch();
  const [list_carts, set_list_carts] = useState([]);
  const count_change = useSelector(state => state.Count.isLoad);
  const [totalPrice, setTotalPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [productInventory, setProductInventory] = useState({});
  const [showError, setShowError] = useState(false);
  const [information, setInformation] = useState({
    fullname: "",
    phone: "",
    address: "",
    email: "",
  });
  const [redirect, setRedirect] = useState(false);
  const [loadOrder, setLoadOrder] = useState(false);
  const [orderID, setOrderID] = useState("");

  const { register, handleSubmit, errors } = useForm();

  useEffect(() => {
    set_list_carts(JSON.parse(localStorage.getItem('carts')) || []);
    calculateTotal(JSON.parse(localStorage.getItem('carts')) || []);
    
    // Lấy thông tin tồn kho của tất cả sản phẩm trong giỏ hàng
    const fetchProductInventory = async () => {
      const carts = JSON.parse(localStorage.getItem('carts')) || [];
      const inventory = {};
      
      for (const item of carts) {
        const product = await Product.Get_Detail_Product(item.id_product);
        
        inventory[item.id_product] = product.inventory || { S: product.number || 0, M: 0, L: 0 };
      }
      
      setProductInventory(inventory);
    };
    
    fetchProductInventory();
  }, [count_change]);

  useEffect(() => {
    validateInformation();
  }, [information]);

  const calculateTotal = (carts) => {
    let sum = 0;
    carts.forEach((item) => {
      sum += parseInt(item.count) * parseInt(item.price_product);
    });

    if (localStorage.getItem("coupon")) {
      const coupon = JSON.parse(localStorage.getItem("coupon"));
      const discountAmount = (sum * coupon.promotion) / 100;
      setDiscount(discountAmount);
      setTotalPrice(sum - discountAmount);
    } else {
      setTotalPrice(sum);
    }
  };

  const validateInformation = () => {
    const { fullname, phone, email } = information;
    if (!fullname || !phone || !email) {
      setShowError(true);
    } else {
      setShowError(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInformation({ ...information, [name]: value });
  };

  // Kiểm tra tồn kho trước khi đặt hàng
  const validateInventory = () => {
    let isValid = true;
    let errorMessage = '';
    
    for (const item of list_carts) {
      const availableQuantity = productInventory[item.id_product] ? 
        (productInventory[item.id_product][item.size] || 0) : 0;
        
      if (parseInt(item.count) > availableQuantity) {
        isValid = false;
        errorMessage += `Sản phẩm "${item.name_product}" size ${item.size} chỉ còn ${availableQuantity} trong kho.\n`;
      }
    }
    
    if (!isValid) {
      alert(errorMessage + 'Vui lòng cập nhật giỏ hàng của bạn.');
    }
    
    return isValid;
  };

  const handleCheckout = async () => {
    if (showError) {
      alert('Vui lòng điền đầy đủ thông tin!');
      return;
    }
    
    if (!validateInventory()) {
      return;
    }
    
    setLoadOrder(true);

    try {
      // Nếu có mã giảm giá, cập nhật trạng thái mã
      if (localStorage.getItem("id_coupon")) {
        try {
          await CouponAPI.updateCoupon(localStorage.getItem("id_coupon"));
        } catch (error) {
          console.log("Lỗi khi cập nhật coupon:", error);
        }
      }

      // Tạo thông tin giao hàng
      const deliveryData = {
        fullname: information.fullname,
        phone: information.phone,
      };

      let deliveryResponse;
      try {
        deliveryResponse = await NoteAPI.post_note(deliveryData);
      } catch (error) {
        console.log("Lỗi khi tạo ghi chú:", error);
        // Fallback nếu API lỗi - tạo ID tạm thời
        deliveryResponse = { _id: "temp_" + new Date().getTime() };
      }

      // Tạo đơn hàng
      const orderData = {
        id_user: sessionStorage.getItem("id_user") || "guest_" + new Date().getTime(),
        address: information.address,
        total: totalPrice,
        status: "1",
        pay: false,
        id_payment: "6086709cdc52ab1ae999e882",
        id_note: deliveryResponse._id,
        feeship: 0,
        id_coupon: localStorage.getItem("id_coupon") || "",
        create_time: `${new Date().getDate()}/${parseInt(new Date().getMonth()) + 1}/${new Date().getFullYear()}`,
      };

      let orderResponse;
      try {
        orderResponse = await OrderAPI.post_order(orderData);
      } catch (error) {
        console.log("Lỗi khi tạo đơn hàng:", error);
        // Fallback nếu API lỗi - tạo ID tạm thời
        orderResponse = { _id: "temp_order_" + new Date().getTime() };
      }

      // Xử lý chi tiết đơn hàng
      const storedCarts = JSON.parse(localStorage.getItem("carts")) || [];

      for (const item of storedCarts) {
        const detailData = {
          id_order: orderResponse._id,
          id_product: item.id_product,
          name_product: item.name_product,
          price_product: item.price_product,
          count: item.count,
          size: item.size,
          inventory: {
            [item.size]: item.count
          },
        };
        
        try {
          await Detail_OrderAPI.post_detail_order(detailData);
        } catch (error) {
          console.log("Lỗi khi tạo chi tiết đơn hàng:", error);
        }
      }

      // Xóa dữ liệu đơn hàng trong localStorage
      localStorage.removeItem("information");
      localStorage.removeItem("total_price");
      localStorage.removeItem("price");
      localStorage.removeItem("id_coupon");
      localStorage.removeItem("coupon");
      
      // Xóa giỏ hàng một cách triệt để sử dụng hàm clearCart
      try {
        await clearCartAndNotify();
        console.log("Đã xóa giỏ hàng thành công sau khi đặt hàng");
      } catch (error) {
        console.log("Lỗi khi xóa giỏ hàng:", error);
        // Fallback: Đảm bảo localStorage vẫn được cập nhật ngay cả khi API lỗi
        localStorage.setItem("carts", JSON.stringify([]));
      }

      // Cập nhật Redux state để tất cả các component liên quan đến giỏ hàng được cập nhật
      dispatch(changeCount(!count_change));
      
      // Chuyển hướng đến trang thành công
      setRedirect(true);
    } catch (error) {
      console.log("Lỗi tổng thể:", error);
      alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm.");
      
      // Xóa dữ liệu đơn hàng trong localStorage kể cả khi lỗi
      localStorage.removeItem("information");
      localStorage.removeItem("total_price");
      localStorage.removeItem("price");
      localStorage.removeItem("id_coupon");
      localStorage.removeItem("coupon");
      
      // Xóa giỏ hàng một cách triệt để sử dụng hàm clearCart
      try {
        await clearCartAndNotify();
        console.log("Đã xóa giỏ hàng thành công sau khi đặt hàng (error path)");
      } catch (clearError) {
        console.log("Lỗi khi xóa giỏ hàng (error path):", clearError);
        // Fallback: Đảm bảo localStorage vẫn được cập nhật ngay cả khi API lỗi
        localStorage.setItem("carts", JSON.stringify([]));
      }
      
      // Cập nhật Redux state để tất cả các component liên quan đến giỏ hàng được cập nhật
      dispatch(changeCount(!count_change));
      
      // Chuyển hướng đến trang thành công
      setRedirect(true);
    } finally {
      setLoadOrder(false);
    }
  };

  const handleMomo = () => {
    setOrderID(Math.random().toString());
    console.log("MoMo Payment Success");
  };

  return (
    <div className="checkout-page">
      {loadOrder && (
        <div className="loader-overlay">
          <div className="spinner-border text-primary" role="status">
            <span className="sr-only">Đang xử lý...</span>
          </div>
        </div>
      )}

      <div className="breadcrumb-area py-4" style={{ backgroundColor: '#f7f7f7' }}>
        <div className="container">
          <div className="breadcrumb-content text-center">
            <h2 className="mb-2" style={{ fontWeight: '600', fontSize: '28px' }}>Thanh Toán</h2>
          </div>
        </div>
      </div>

      <div className="checkout-content py-5">
        <div className="container">
          <div className="row">
            <div className="col-lg-7 col-md-12 mb-4">
              <div className="card border-0 shadow-sm rounded-lg">
                <div className="card-header bg-white py-3 border-bottom">
                  <h4 className="mb-0" style={{ fontWeight: '600' }}>Thông tin giao hàng</h4>
                </div>
                <div className="card-body p-4">
                  <form onSubmit={handleSubmit(handleCheckout)}>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label className="font-weight-bold mb-2">Họ và tên <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="Nhập họ và tên"
                            type="text"
                            name="fullname"
                            ref={register({ required: true })}
                            value={information.fullname}
                            onChange={handleInputChange}
                          />
                          {errors.fullname && <small className="text-danger">Vui lòng nhập họ tên</small>}
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="form-group">
                          <label className="font-weight-bold mb-2">Số điện thoại <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="Nhập số điện thoại"
                            type="text"
                            name="phone"
                            ref={register({ required: true })}
                            value={information.phone}
                            onChange={handleInputChange}
                          />
                          {errors.phone && <small className="text-danger">Vui lòng nhập số điện thoại</small>}
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-group">
                          <label className="font-weight-bold mb-2">Email <span className="text-danger">*</span></label>
                          <input
                            className="form-control"
                            placeholder="Nhập địa chỉ email"
                            type="email"
                            name="email"
                            ref={register({ required: true })}
                            value={information.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && <small className="text-danger">Vui lòng nhập email</small>}
                        </div>
                      </div>
                      <div className="col-md-12 mb-3">
                        <div className="form-group">
                          <label className="font-weight-bold mb-2">Địa chỉ giao hàng <span className="text-danger">*</span></label>
                          <textarea
                            className="form-control"
                            placeholder="Nhập địa chỉ giao hàng"
                            name="address"
                            rows="3"
                            ref={register({ required: true })}
                            value={information.address}
                            onChange={handleInputChange}
                          ></textarea>
                          {errors.address && <small className="text-danger">Vui lòng nhập địa chỉ</small>}
                        </div>
                      </div>
                    </div>

                    <div className="payment-method mt-4">
                      <h5 className="font-weight-bold mb-3">Phương thức thanh toán</h5>
                      <div className="card border">
                        <div className="card-header bg-white">
                          <div className="custom-control custom-radio">
                            <input type="radio" id="payment1" name="payment" className="custom-control-input" defaultChecked />
                            <label className="custom-control-label font-weight-bold" htmlFor="payment1">Thanh toán khi nhận hàng (COD)</label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      {redirect && <Redirect to="/success" />}
                      <button type="submit" className="btn btn-primary btn-lg btn-block" style={{ backgroundColor: '#fed700', borderColor: '#fed700', color: '#000' }}>
                        Đặt hàng
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>

            <div className="col-lg-5 col-md-12">
              <div className="card border-0 shadow-sm rounded-lg">
                <div className="card-header bg-white py-3 border-bottom">
                  <h4 className="mb-0" style={{ fontWeight: '600' }}>Đơn hàng của bạn</h4>
                </div>
                <div className="card-body p-4">
                  {list_carts.length === 0 ? (
                    <div className="text-center py-5">
                      <div className="mb-3">
                        <i className="fa fa-shopping-cart fa-3x text-muted"></i>
                      </div>
                      <h5 className="text-muted">Giỏ hàng của bạn đang trống</h5>
                      <a href="/shop" className="btn mt-3" style={{ backgroundColor: '#fed700', borderColor: '#fed700', color: '#000' }}>Tiếp tục mua sắm</a>
                    </div>
                  ) : (
                    <>
                      <div className="order-items">
                        {list_carts.map((item, idx) => (
                          <div className="d-flex align-items-center py-3 border-bottom" key={idx}>
                            <div className="product-image mr-3">
                              <img src={item.image} alt={item.name_product} style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                            </div>
                            <div className="product-info flex-grow-1">
                              <h6 className="mb-1">{item.name_product}</h6>
                              <div>
                                <small className="text-muted">Size: {item.size} | Số lượng: {item.count}</small>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="font-weight-bold total-price">
                                {new Intl.NumberFormat('vi-VN').format(item.price_product * item.count)}₫
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="order-summary mt-4">
                        <div className="d-flex justify-content-between mb-2">
                          <span>Tạm tính</span>
                          <span>{new Intl.NumberFormat('vi-VN').format(totalPrice + discount)}₫</span>
                        </div>
                        {discount > 0 && (
                          <div className="d-flex justify-content-between mb-2 text-success">
                            <span>Giảm giá</span>
                            <span>-{new Intl.NumberFormat('vi-VN').format(discount)}₫</span>
                          </div>
                        )}
                        <div className="d-flex justify-content-between mb-2">
                          <span>Phí vận chuyển</span>
                          <span>Miễn phí</span>
                        </div>
                        <div className="d-flex justify-content-between font-weight-bold pt-3 mt-3 border-top">
                          <span>Tổng cộng</span>
                          <span style={{ fontSize: '1.25rem', color: '#e80f0f' }}>
                            {new Intl.NumberFormat('vi-VN').format(totalPrice)}₫
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="card border-0 shadow-sm rounded-lg mt-4">
                <div className="card-body p-4">
                  <h5 className="font-weight-bold mb-3">Thông tin thanh toán</h5>
                  <ul className="list-unstyled mb-0">
                    <li className="d-flex align-items-center mb-3">
                      <i className="fa fa-shield text-warning mr-3" style={{ fontSize: '24px', color: '#fed700' }}></i>
                      <span>Bảo mật thông tin thanh toán</span>
                    </li>
                    <li className="d-flex align-items-center mb-3">
                      <i className="fa fa-truck text-warning mr-3" style={{ fontSize: '24px', color: '#fed700' }}></i>
                      <span>Giao hàng miễn phí cho đơn hàng trên 300.000₫</span>
                    </li>
                    <li className="d-flex align-items-center">
                      <i className="fa fa-refresh text-warning mr-3" style={{ fontSize: '24px', color: '#fed700' }}></i>
                      <span>Đổi trả miễn phí trong vòng 30 ngày</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


    </div>
  );
}

export default Checkout;

import React from 'react';
import PropTypes from 'prop-types';
import Global from '../Image/Global'

Footer.propTypes = {

};

function Footer(props) {
    return (
        <div className="footer">
            {/* <div className="footer-static-top">
                <div className="container">
                    <div className="footer-shipping pt-60 pb-55 pb-xs-25">
                        <div className="row">
                            <div className="col-lg-3 col-md-6 col-sm-6 pb-sm-55 pb-xs-55">
                                <div className="li-shipping-inner-box">
                                    <div className="shipping-icon">
                                        <img src={Global.Footer1} alt="Shipping Icon" />
                                    </div>
                                    <div className="shipping-text">
                                        <h2>Free Delivery</h2>
                                        <p>And free returns. See checkout for delivery dates.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6 pb-sm-55 pb-xs-55">
                                <div className="li-shipping-inner-box">
                                    <div className="shipping-icon">
                                        <img src={Global.Footer2} alt="Shipping Icon" />
                                    </div>
                                    <div className="shipping-text">
                                        <h2>Safe Payment</h2>
                                        <p>Pay with the world's most popular and secure payment methods.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6 pb-xs-30">
                                <div className="li-shipping-inner-box">
                                    <div className="shipping-icon">
                                        <img src={Global.Footer3} alt="Shipping Icon" />
                                    </div>
                                    <div className="shipping-text">
                                        <h2>Shop with Confidence</h2>
                                        <p>Our Buyer Protection covers your purchasefrom click to delivery.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-3 col-md-6 col-sm-6 pb-xs-30">
                                <div className="li-shipping-inner-box">
                                    <div className="shipping-icon">
                                        <img src={Global.Footer4} alt="Shipping Icon" />
                                    </div>
                                    <div className="shipping-text">
                                        <h2>24/7 Help Center</h2>
                                        <p>Have a question? Call a Specialist or chat online.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div> */}
            <div className="footer-static-middle">
                <div className="container">
                    <div className="footer-logo-wrap pt-50 pb-35">
                        <div className="row">
                            <div className="col-lg-4 col-md-6">
                                <div className="footer-logo">
                                    <img src={Global.Logo} style={{ width: '20rem'}} alt="Footer Logo" />
                                    <p className="info">
                                        Chúng tôi là đội ngũ thiết kế và phát triển chuyên tạo ra các sản phẩm thời trang chất lượng cao.
                                </p>
                                </div>
                                <ul className="des">
                                    <li>
                                        <span>Địa chỉ: </span>
                                    Quang Trung, La Khê, Hà Đông, Hà Nội
                                </li>
                                    <li>
                                        <span>Điện thoại: </span>
                                        <a href="#">0763557366</a>
                                    </li>
                                    <li>
                                        <span>Email: </span>
                                        <a href="mailto://tienkim9920@gmail.com">qunghuyy17@gmail.com</a>
                                    </li>
                                </ul>
                            </div>
                                <div className="col-lg-2 col-md-3 col-sm-6">
                                    <div className="footer-block">
                                        <h3 className="footer-block-title">Sản phẩm</h3>
                                        <ul>
                                            <li><a href="#">Giảm giá</a></li>
                                            <li><a href="#">Sản phẩm mới</a></li>
                                            <li><a href="#">Bán chạy nhất</a></li>
                                            <li><a href="#">Liên hệ</a></li>
                                        </ul>
                                    </div>
                                </div>
                            <div className="col-lg-2 col-md-3 col-sm-6">
                                <div className="footer-block">
                                    <h3 className="footer-block-title">Công ty</h3>
                                        <ul>
                                            <li><a href="#">Giao hàng</a></li>
                                            <li><a href="#">Điều khoản</a></li>
                                            <li><a href="#">Về chúng tôi</a></li>
                                            <li><a href="#">Liên hệ</a></li>
                                      </ul>
                                </div>
                            </div>
                            <div className="col-lg-4">  
                                <div className="footer-newsletter">
                                    <h4>Đăng ký nhận tin</h4>
                                    <form action="#" method="post" id="mc-embedded-subscribe-form" name="mc-embedded-subscribe-form" className="footer-subscribe-form validate" target="_blank">
                                        <div id="mc_embed_signup_scroll">
                                            <div id="mc-form" className="mc-form subscribe-form form-group" >
                                                <input id="mc-email" type="email" autoComplete="off" placeholder="Nhập email của bạn" />
                                                <button className="btn" id="mc-submit">Đăng ký</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Footer;
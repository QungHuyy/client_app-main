import "./CSS/animate.css";
import "./CSS/helper.css";
import "./CSS/magnific-popup.css";
import "./CSS/material-design-iconic-font.min.css";
import "./CSS/meanmenu.css";
import "./CSS/nice-select.css";
import "./CSS/slick.css";
import "./CSS/venobox.css";
import "./CSS/style.css";
import "./App.css";
import Chatbot from "./Chatbot/Chatbot";
import CartsLocal from "./Share/CartsLocal";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import Header from "./Share/Header";
import Footer from "./Share/Footer";
import SearchByAI from "./Search/SearchByAI";
import Checkout from "./Checkout/Checkout";
import OrderSuccess from "./Order/OrderSuccess";
import OrderFail from "./Order/OrderFail";
import { lazy, Suspense } from "react";
import OrderMomo from "./Order/OrderMomo";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import $ from 'jquery';
import Popper from 'popper.js';

// Các import được comment
// import Home from "./Home/Home";
// import Shop from "./Shop/Shop";
// import Detail_Product from "./DetailProduct/Detail_Product";
// import Cart from "./Cart/Cart";
// import Favorite from "./Favorite/Favorite";
// import About from "./About/About";
// import Contact from "./Contact/Contact";
// import SignIn from "./Auth/SignIn";
// import SignUp from "./Auth/SignUp";
// import History from "./History/History";
// import Profile from "./Profile/Profile";
// import Search from "./Search/Search";
// import DetailEvent from "./About/DetailEvent";

const Home = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Home/Home")), 2000);
  });
});

const Shop = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Shop/Shop")), 2000);
  });
});

const Detail_Product = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./DetailProduct/Detail_Product")), 2000);
  });
});

const Cart = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Cart/Cart")), 2000);
  });
});

// const Checkout = lazy(() => {
//   return new Promise((resolve) => {
//     setTimeout(() => resolve(import("./Checkout/Checkout")), 2000);
//   });
// });

const Favorite = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Favorite/Favorite")), 2000);
  });
});

const Event = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Event/Event")), 2000);
  });
});

// Đã loại bỏ import DetailEvent

const Contact = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Contact/Contact")), 2000);
  });
});

const SignIn = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Auth/SignIn")), 2000);
  });
});

const SignUp = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Auth/SignUp")), 2000);
  });
});

const History = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./History/History")), 2000);
  });
});

const Profile = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Profile/Profile")), 2000);
  });
});

const Search = lazy(() => {
  return new Promise((resolve) => {
    setTimeout(() => resolve(import("./Search/Search")), 2000);
  });
});

// Khởi tạo giỏ hàng ngay khi app load
CartsLocal.initCart();

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Header />
        <Suspense
          fallback={
            <div className="sk-cube-grid">
              <div className="sk-cube sk-cube1"></div>
              <div className="sk-cube sk-cube2"></div>
              <div className="sk-cube sk-cube3"></div>
              <div className="sk-cube sk-cube4"></div>
              <div className="sk-cube sk-cube5"></div>
              <div className="sk-cube sk-cube6"></div>
              <div className="sk-cube sk-cube7"></div>
              <div className="sk-cube sk-cube8"></div>
              <div className="sk-cube sk-cube9"></div>
            </div>
          }
        >
          <Switch>
            <Route exact path="/" component={Home} />
            <Route path="/shop/:id" component={Shop} />
            <Route path="/detail/:id" component={Detail_Product} />
            <Route path="/cart" component={Cart} />
            <Route path="/checkout" component={Checkout} />
            <Route path="/favorite" component={Favorite} />

            <Route exact path="/event" component={Event} />
            {/* Đã loại bỏ trang chi tiết mã giảm giá */}


            <Route path="/contact" component={Contact} />
            <Route path="/signin" component={SignIn} />
            <Route path="/register" component={SignUp} />
            <Route path="/success" render={() => {
              // Force page reload to ensure clean state and proper cart clearing
              return <OrderSuccess key={Date.now()} />;
            }} />
            <Route path="/fail" component={OrderFail} />
            <Route path="/momo" component={OrderMomo} />
            <Route path="/history" component={History} />
            <Route path="/profile/:id" component={Profile} />
            <Route path="/search" component={Search} />
            <Route path="/chatbot" component={Chatbot} />
            <Route path="/search-by-ai" component={SearchByAI} />

          </Switch>
        </Suspense>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;

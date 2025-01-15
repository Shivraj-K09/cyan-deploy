import { useEffect, useRef, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { Toaster } from "./components/ui/sonner";
import AuthCallback from "./pages/authentication/AuthCallback";
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";
import BottomNav from "./pages/BottomNav";
import CredentialsResult from "./pages/find-credent/CredentialsResult";
import FindCredentials from "./pages/find-credent/FindCredentials";
import FindPassword from "./pages/find-password/FindPassword";
import ResetPassword from "./pages/find-password/ResetPassword";
import CreatePost from "./pages/fish-catch-record/CreatePost";
import FilterPost from "./pages/fish-catch-record/FilterPost";
import FishCatchRecord from "./pages/fish-catch-record/FishCatchRecord";
import MainPage from "./pages/main-page/MainPage";
import MyMap from "./pages/my-map/MyMap";
import Payment from "./pages/payment/Payment";
import ProductReviews from "./pages/ProductReviews/ProductReviews";
import ProductReviewWrite from "./pages/ProductReviews/ProductReviewWrite";
import Comments from "./pages/profile/comments";
import CustomerService from "./pages/profile/CustomerService";
import DeliveryAddress from "./pages/profile/DeliveryAddress";
import Guide from "./pages/profile/guide";
import MobilePoints from "./pages/profile/MobilePoints";
import MyBest from "./pages/profile/MyBest";
import Notices from "./pages/profile/notices";
import OrderDetails from "./pages/profile/order-details";
import Orders from "./pages/profile/orders";
import PasswordChanage from "./pages/profile/PasswordChange";
import PhoneVerification from "./pages/profile/PhoneVerification";
import PostalCodeSearch from "./pages/profile/PostalCodeSearch";
import Profile from "./pages/profile/Profile";
import ProfileSettings from "./pages/profile/ProfileSettings";
import Records from "./pages/profile/Records";
import Subscribe from "./pages/profile/subscribe";
import ProductDetail from "./pages/shopping/ProductDetail";
import ProductReview from "./pages/shopping/ProductReview";
import ShoppingCart from "./pages/shopping/ShoppingCart";
import ShoppingEcommerce from "./pages/shopping/ShoppingEcommerce";
import TopNav from "./pages/TopNav";
import Admin from "./pages/admin/Admin";
import StatusRecord from "./pages/admin/Status-Record";

function App() {
  const location = useLocation();
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showTopNav, setShowTopNav] = useState(false);
  const bottomNavRef = useRef(null);

  const hideBottomNavPaths = [
    "/login",
    "/signup",
    "/find-credentials",
    "/find-credentials/result",
    "/find-password",
    "/find-password/reset",
    "/product-detail",
    "/mobile-points",
    "/my-best",
    "/records",
    "/comments",
    "/subscribe",
    "/orders",
    "/order-details",
    "/notices",
    "/guide",
    "/customer-service",
    "/product-reviews",
    "/product-reviews/write",
    "/profile-settings",
    "/password-change",
    "/phone-verification",
    "/delivery-address",
    "/postal-code-search",
    "/product-review",
    "/payment",
    "/auth/callback",
    "/fish-catch-record/create-post",
    "/fish-catch-record/filter-post",
  ];

  const showTopNavPaths = [
    "/",
    "/my-map",
    "/fish-catch-record",
    "/shopping",
    "/admin",
    "/admin/status-record",
  ];

  useEffect(() => {
    const shouldShowBottom = !hideBottomNavPaths.includes(location.pathname);
    setShowBottomNav(shouldShowBottom);

    const shouldShowTop = showTopNavPaths.includes(location.pathname);
    setShowTopNav(shouldShowTop);
  }, [location.pathname]);

  return (
    <>
      {showTopNav && <TopNav />}
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/find-credentials" element={<FindCredentials />} />
        <Route
          path="/find-credentials/result"
          element={<CredentialsResult />}
        />
        <Route path="/find-password" element={<FindPassword />} />
        <Route path="/find-password/reset" element={<ResetPassword />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/shopping-cart" element={<ShoppingCart />} />
        <Route path="/shopping" element={<ShoppingEcommerce />} />
        <Route path="/product-detail" element={<ProductDetail />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/mobile-points" element={<MobilePoints />} />
        <Route path="/my-best" element={<MyBest />} />
        <Route path="/records" element={<Records />} />
        <Route path="/comments" element={<Comments />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/order-details" element={<OrderDetails />} />
        <Route path="/notices" element={<Notices />} />
        <Route path="/guide" element={<Guide />} />
        <Route path="/customer-service" element={<CustomerService />} />
        <Route path="/product-reviews" element={<ProductReviews />} />
        <Route path="/product-reviews/write" element={<ProductReviewWrite />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/password-change" element={<PasswordChanage />} />
        <Route path="/phone-verification" element={<PhoneVerification />} />
        <Route path="/delivery-address" element={<DeliveryAddress />} />
        <Route path="/postal-code-search" element={<PostalCodeSearch />} />
        <Route path="/product-review" element={<ProductReview />} />
        <Route path="/fish-catch-record">
          <Route index element={<FishCatchRecord />} />
          <Route path="filter-post" element={<FilterPost />} />
          <Route path="create-post" element={<CreatePost />} />
        </Route>
        <Route path="/my-map" element={<MyMap />} />
        {/* Admin Routes Here */}
        {/* <Route path="/admin" element={<Admin />} /> */}
        <Route path="/admin/status-record" element={<StatusRecord />} />
      </Routes>
      {showBottomNav && (
        <div
          ref={bottomNavRef}
          className="fixed bottom-0 left-0 right-0 border-t bg-white z-50"
        >
          <BottomNav loc={location.pathname} />
        </div>
      )}
      <Toaster richColors />
    </>
  );
}

export default App;

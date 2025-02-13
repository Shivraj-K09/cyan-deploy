import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { AddProduct } from "./components/AdminDashboard/AddProduct";
import { AdvertisementDetails } from "./components/AdminDashboard/AdvertisementDetails";
import { CreateAdvertisement } from "./components/AdminDashboard/CreatAdvertisement";
import { CreateEvent } from "./components/AdminDashboard/CreateEvent";
import { CreateNotice } from "./components/AdminDashboard/CreateNotice";
import { CreateUserGuide } from "./components/AdminDashboard/CreateUserGuide";
import { EventsDetails } from "./components/AdminDashboard/EventsDetails";
import { InquiryDetails } from "./components/AdminDashboard/InquiryDetails";
import { NoticeDetails } from "./components/AdminDashboard/NoticeDetails";
import ProductList from "./components/AdminDashboard/ProductList";
import { UserGuideById } from "./components/AdminDashboard/UserGuideById";
import { BlockedUserCheck } from "./components/BlockedUserCheck";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "./components/ui/sonner";
import AdminPage from "./pages/admin/AdminPage";
import Advertisement from "./pages/admin/AdminPages/Advertisement";
import CustomerCenter from "./pages/admin/AdminPages/CustomerCenter";
import Dashboard from "./pages/admin/AdminPages/dashboard";
import { Event } from "./pages/admin/AdminPages/Event";
import MemberManagement from "./pages/admin/AdminPages/MemberManagement";
import Notice from "./pages/admin/AdminPages/Notice";
import { Shopping } from "./pages/admin/AdminPages/Shopping";
import UserGuide from "./pages/admin/AdminPages/UserGuide";
import AuthCallback from "./pages/authentication/AuthCallback";
import Login from "./pages/authentication/Login";
import Signup from "./pages/authentication/Signup";
import { BlockedPage } from "./pages/BlockedPage";
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
import { CustomerServiceInquiry } from "./pages/profile/CustomerServiceInquiry";
import DeliveryAddress from "./pages/profile/DeliveryAddress";
import Guide from "./pages/profile/guide";
import { Inbox } from "./pages/profile/inbox";
import MobilePoints from "./pages/profile/MobilePoints";
import MyBest from "./pages/profile/MyBest";
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
import { checkAuth } from "./store/authSlice";
import { UserEvents } from "./pages/profile/User-Event";
import { UserEventDetails } from "./pages/profile/UserEventDetails";
import UserNotices from "./pages/profile/notices";
import { UserNoticeDetails } from "./pages/profile/UserNoticeDetails";
import { GuideDetails } from "./pages/profile/GuideDetails";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, initialCheckDone } = useSelector(
    (state) => state.auth
  );

  if (!initialCheckDone) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.role !== "admin" && user.role !== "super_admin") {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const [showBottomNav, setShowBottomNav] = useState(true);
  const [showTopNav, setShowTopNav] = useState(false);
  const bottomNavRef = useRef(null);
  const { initialCheckDone } = useSelector((state) => state.auth);

  const hideBottomNavPaths = [
    "/login",
    "/signup",
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
    "/block-page-404",
    "/find-credentials",
  ];

  const showTopNavPaths = [
    "/",
    "/my-map",
    "/fish-catch-record",
    "/shopping",

    "/admin",
  ];

  const noScrollTopNavPaths = ["/shopping/:id"];

  useEffect(() => {
    const shouldShowBottom = !hideBottomNavPaths.includes(location.pathname);
    setShowBottomNav(shouldShowBottom);

    const shouldShowTop = showTopNavPaths.includes(location.pathname);
    setShowTopNav(shouldShowTop);
  }, [location.pathname]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(checkAuth());
    }, 60000); // Check every minute

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        dispatch(checkAuth());
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dispatch]);

  useEffect(() => {
    const handleScroll = () => {
      // Check if we're on a product detail page (/shopping/{id})
      const isProductDetail = /^\/shopping\/[^/]+$/.test(location.pathname);

      if (
        window.scrollY > 0 &&
        !noScrollTopNavPaths.some((path) =>
          location.pathname.startsWith(path)
        ) &&
        !isProductDetail
      ) {
        setShowTopNav(true);
      } else {
        setShowTopNav(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setShowBottomNav(false);
      } else {
        setShowBottomNav(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!initialCheckDone) {
      dispatch(checkAuth());
    }
  }, [dispatch, initialCheckDone]);

  if (!initialCheckDone) {
    return <LoadingSpinner />;
  }

  return (
    <BlockedUserCheck>
      {showTopNav && <TopNav />}
      <Routes>
        {/* Public routes */}
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

        {/* Protected routes */}
        <Route
          path="/payment"
          element={
            <ProtectedRoute>
              <Payment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping-cart"
          element={
            <ProtectedRoute>
              <ShoppingCart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shopping"
          element={
            <ProtectedRoute>
              <ShoppingEcommerce />
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopping/:id"
          element={
            <ProtectedRoute>
              <ProductDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/mobile-points"
          element={
            <ProtectedRoute>
              <MobilePoints />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-best"
          element={
            <ProtectedRoute>
              <MyBest />
            </ProtectedRoute>
          }
        />
        <Route
          path="/records"
          element={
            <ProtectedRoute>
              <Records />
            </ProtectedRoute>
          }
        />
        <Route
          path="/comments"
          element={
            <ProtectedRoute>
              <Comments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/subscribe"
          element={
            <ProtectedRoute>
              <Subscribe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/orders"
          element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/order-details"
          element={
            <ProtectedRoute>
              <OrderDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/notices"
          element={
            <ProtectedRoute>
              <UserNotices />
            </ProtectedRoute>
          }
        />

        <Route
          path="/notices/:id"
          element={
            <ProtectedRoute>
              <UserNoticeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guide"
          element={
            <ProtectedRoute>
              <Guide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/guide/:id"
          element={
            <ProtectedRoute>
              <GuideDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/customer-service"
          element={
            <ProtectedRoute>
              <CustomerService />
            </ProtectedRoute>
          }
        />
        <Route
          path="/customer-service/:id"
          element={
            <ProtectedRoute>
              <CustomerServiceInquiry />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-reviews"
          element={
            <ProtectedRoute>
              <ProductReviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-reviews/write"
          element={
            <ProtectedRoute>
              <ProductReviewWrite />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile-settings"
          element={
            <ProtectedRoute>
              <ProfileSettings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inbox"
          element={
            <ProtectedRoute>
              <Inbox />
            </ProtectedRoute>
          }
        />
        <Route
          path="/password-change"
          element={
            <ProtectedRoute>
              <PasswordChanage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/phone-verification"
          element={
            <ProtectedRoute>
              <PhoneVerification />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery-address"
          element={
            <ProtectedRoute>
              <DeliveryAddress />
            </ProtectedRoute>
          }
        />
        <Route
          path="/postal-code-search"
          element={
            <ProtectedRoute>
              <PostalCodeSearch />
            </ProtectedRoute>
          }
        />
        <Route
          path="/product-review"
          element={
            <ProtectedRoute>
              <ProductReview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fish-catch-record"
          element={
            <ProtectedRoute>
              <FishCatchRecord />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fish-catch-record/filter-post"
          element={
            <ProtectedRoute>
              <FilterPost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/fish-catch-record/create-post"
          element={
            <ProtectedRoute>
              <CreatePost />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-map"
          element={
            <ProtectedRoute>
              <MyMap />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events"
          element={
            <ProtectedRoute>
              <UserEvents />
            </ProtectedRoute>
          }
        />

        <Route
          path="/events/:id"
          element={
            <ProtectedRoute>
              <UserEventDetails />
            </ProtectedRoute>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute adminOnly>
              <Routes>
                <Route index element={<AdminPage />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route
                  path="member-management"
                  element={<MemberManagement />}
                />
                <Route path="advertisement" element={<Advertisement />} />
                <Route
                  path="advertisement/create"
                  element={<CreateAdvertisement />}
                />
                <Route
                  path="advertisement/:id"
                  element={<AdvertisementDetails />}
                />
                <Route path="customer-center" element={<CustomerCenter />} />
                <Route
                  path="customer-center/inquiry/:id"
                  element={<InquiryDetails />}
                />
                <Route path="user-guide" element={<UserGuide />} />
                <Route path="user-guide/create" element={<CreateUserGuide />} />
                <Route path="user-guide/:id" element={<UserGuideById />} />
                <Route path="notice" element={<Notice />} />
                <Route path="notice/create" element={<CreateNotice />} />
                <Route path="notice/:id" element={<NoticeDetails />} />
                <Route path="events" element={<Event />} />
                <Route path="event/create" element={<CreateEvent />} />
                <Route path="events/:id" element={<EventsDetails />} />
                <Route path="shopping" element={<Shopping />} />
                <Route path="shopping/add-product" element={<AddProduct />} />
                <Route path="shopping/product-list" element={<ProductList />} />
              </Routes>
            </ProtectedRoute>
          }
        />

        {/* Blocked user route */}
        <Route path="/block-page-404" element={<BlockedPage />} />
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
    </BlockedUserCheck>
  );
}

export default App;

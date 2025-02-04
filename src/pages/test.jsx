import { useEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import "./App.css";
import { CreateAdvertisement } from "./components/AdminDashboard/CreatAdvertisement";
import { CreateUserGuide } from "./components/AdminDashboard/CreateUserGuide";
import { InquiryDetails } from "./components/AdminDashboard/InquiryDetails";
import { UserGuideById } from "./components/AdminDashboard/UserGuideById";
import LoadingSpinner from "./components/LoadingSpinner";
import { Toaster } from "./components/ui/sonner";
import { supabase } from "./lib/supabaseClient";
import Admin from "./pages/admin/Admin";
import AdminPage from "./pages/admin/AdminPage";
import Advertisement from "./pages/admin/AdminPages/Advertisement";
import CustomerCenter from "./pages/admin/AdminPages/CustomerCenter";
import Dashboard from "./pages/admin/AdminPages/dashboard";
import MemberManagement from "./pages/admin/AdminPages/MemberManagement";
import Notice from "./pages/admin/AdminPages/Notice";
import UserGuide from "./pages/admin/AdminPages/UserGuide";
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
import { Inbox } from "./pages/profile/inbox";
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
import { CreateNotice } from "./components/AdminDashboard/CreateNotice";
import { NoticeDetails } from "./components/AdminDashboard/NoticeDetails";
import { Event } from "./pages/admin/AdminPages/Event";
import { CreateEvent } from "./components/AdminDashboard/CreateEvent";
import { EventsDetails } from "./components/AdminDashboard/EventsDetails";
import { Shopping } from "./pages/admin/AdminPages/Shopping";
import { AdvertisementDetails } from "./components/AdminDashboard/AdvertisementDetails";
import { AddProduct } from "./components/AdminDashboard/AddProduct";
import ProductList from "./components/AdminDashboard/ProductList";
import { CustomerServiceInquiry } from "./pages/profile/CustomerServiceInquiry";

const ProtectedRoute = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select("role")
          .eq("id", user.id)
          .single();

        if (data && (data.role === "admin" || data.role === "super_admin")) {
          setIsAdmin(true);
        }
      }
      setIsLoading(false);
    };

    checkAdminStatus();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return isAdmin ? children : <Navigate to="/" replace />;
};

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
    // "/admin/status-record",
    // "/admin/dashboard",
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
        <Route
          path="/customer-service/:id"
          element={<CustomerServiceInquiry />}
        />
        <Route path="/product-reviews" element={<ProductReviews />} />
        <Route path="/product-reviews/write" element={<ProductReviewWrite />} />
        <Route path="/profile-settings" element={<ProfileSettings />} />
        <Route path="/inbox" element={<Inbox />} />
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
        {/* Test Admin Routes Here */}
        <Route path="/test-admin" element={<Admin />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/member-management"
          element={
            <ProtectedRoute>
              <MemberManagement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/advertisement"
          element={
            <ProtectedRoute>
              <Advertisement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/advertisement/create"
          element={
            <ProtectedRoute>
              <CreateAdvertisement />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/advertisement/:id"
          element={
            <ProtectedRoute>
              <AdvertisementDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customer-center"
          element={
            <ProtectedRoute>
              <CustomerCenter />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/customer-center/inquiry/:id"
          element={
            <ProtectedRoute>
              <InquiryDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/user-guide"
          element={
            <ProtectedRoute>
              <UserGuide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/user-guide/create"
          element={
            <ProtectedRoute>
              <CreateUserGuide />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/user-guide/:id"
          element={
            <ProtectedRoute>
              <UserGuideById />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notice"
          element={
            <ProtectedRoute>
              <Notice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notice/create"
          element={
            <ProtectedRoute>
              <CreateNotice />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/notice/:id"
          element={
            <ProtectedRoute>
              <NoticeDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events"
          element={
            <ProtectedRoute>
              <Event />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/event/create"
          element={
            <ProtectedRoute>
              <CreateEvent />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/events/:id"
          element={
            <ProtectedRoute>
              <EventsDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shopping"
          element={
            <ProtectedRoute>
              <Shopping />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shopping/add-product"
          element={
            <ProtectedRoute>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/shopping/product-list"
          element={
            <ProtectedRoute>
              <ProductList />
            </ProtectedRoute>
          }
        />
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

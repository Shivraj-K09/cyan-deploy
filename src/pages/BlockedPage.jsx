import { BanIcon } from "@/components/BanIcon";
import { Button } from "@/components/ui/button";
import { checkAuth, signOut } from "@/store/authSlice";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const textVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delay: 1,
      duration: 0.5,
    },
  },
};

export function BlockedPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isBlocked, loading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/login");
      } else if (!isBlocked) {
        navigate("/");
      }
    }
  }, [user, isBlocked, loading, navigate]);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut());
      navigate("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !user || !isBlocked) {
    return null;
  }

  const supportEmail = "support@example.com";

  const handleEmailClick = (e) => {
    e.preventDefault();
    window.location.href = `https://mail.google.com/mail/?view=cm&fs=1&to=${supportEmail}`;
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center max-w-md px-4">
        <div className="mb-8 mx-auto w-fit text-destructive">
          <BanIcon />
        </div>
        <motion.div initial="hidden" animate="visible" variants={textVariants}>
          <h1 className="text-3xl font-semibold mb-4 text-destructive">
            Access Blocked
          </h1>
          <p className="mb-8 text-black w-[400px] px-4">
            Your account has been blocked due to a violation of our terms of
            service. If you believe this is a mistake, please contact our
            support team.
          </p>
          <div className="flex flex-col items-center gap-4">
            <Button variant="destructive" href="/" onClick={handleSignOut}>
              Sign Out
            </Button>
            <a
              href="#0"
              // href={`mailto:${supportEmail}`}
              // onClick={handleEmailClick}
              className="inline-flex items-center text-sm text-black hover:text-black/80 transition-colors"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

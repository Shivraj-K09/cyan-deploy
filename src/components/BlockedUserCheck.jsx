import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { checkAuth } from "../store/authSlice";

export const BlockedUserCheck = ({ children }) => {
  const { user, isBlocked, loading, initialCheckDone } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!initialCheckDone) {
      dispatch(checkAuth());
    }
  }, [dispatch, initialCheckDone]);

  useEffect(() => {
    if (
      initialCheckDone &&
      isBlocked &&
      location.pathname !== "/block-page-404"
    ) {
      navigate("/block-page-404", { replace: true });
    }
  }, [initialCheckDone, isBlocked, navigate, location.pathname]);

  if (!initialCheckDone) {
    return <div>Loading...</div>; // Or your loading component
  }

  return children;
};

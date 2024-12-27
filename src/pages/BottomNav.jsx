import React, { useState, useEffect } from "react";
import { FaFlag, FaAnchor, FaShoppingBag, FaUser } from "react-icons/fa";
import { GrMap } from "react-icons/gr";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { UserIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState(location.pathname);
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("users")
          .select("avatar_url, name")
          .eq("id", user.id)
          .single();
        if (data && !error) {
          setAvatarUrl(data.avatar_url);
          setUserName(data.name);
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, []);

  const navItems = [
    { id: 0, label: "지도", icon: <GrMap />, to: "/" },
    {
      id: 1,
      label: "나의 지도",
      icon: <FaFlag />,
      to: "/my-map",
    },
    { id: 2, label: "조황기록", icon: <FaAnchor />, to: "/fish-catch-record" },
    { id: 3, label: "쇼핑", icon: <FaShoppingBag />, to: "/shopping" },
    {
      id: 4,
      label: "내정보",
      icon: isLoading ? (
        <Skeleton className="h-6 w-6 rounded-full" />
      ) : user ? (
        <Avatar className="h-7 w-7">
          {avatarUrl ? (
            <AvatarImage src={avatarUrl} alt={`${userName}'s avatar`} />
          ) : (
            <AvatarFallback>
              <UserIcon className="h-4 w-4" />
            </AvatarFallback>
          )}
          {avatarUrl && (
            <AvatarFallback className="text-sm">
              {userName.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
      ) : (
        <FaUser />
      ),
      to: "/profile",
    },
  ];

  return (
    <div className="flex items-center justify-around w-full py-4 border-t bg-white">
      {navItems.map((item) => (
        <Link
          to={item.to}
          key={item.id}
          onClick={() => setActiveNav(item.to)}
          className={`flex flex-col items-center justify-center w-full gap-1 ${
            location.pathname === item.to ? "text-green-600" : "text-gray-400"
          }`}
        >
          <div
            className={`text-2xl flex justify-center ${
              location.pathname === item.to ? "text-green-600" : "text-gray-400"
            }`}
          >
            {item.icon}
          </div>
          <span
            className={`text-xs ${
              location.pathname === item.to
                ? "text-green-600 font-bold"
                : "text-gray-400"
            }`}
          >
            {item.label}
          </span>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;

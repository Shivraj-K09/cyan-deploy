import { ChevronRight, ChevronsLeft, PencilLineIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Skeleton } from "../../components/ui/skeleton";
import { supabase } from "../../lib/supabaseClient";

const ProfileSettings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          setUser(data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const maskPhoneNumber = (phone) => {
    if (!phone) return "";
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  };

  const handleProfileUpdate = async (updatedData) => {
    try {
      const { data, error } = await supabase
        .from("users")
        .update(updatedData)
        .eq("id", user.id);

      if (error) throw error;

      // Clear the cache to ensure fresh data is fetched next time
      localStorage.removeItem("userData");

      // Update local state
      setUser({ ...user, ...updatedData });
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate("/profile")} className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          프로필 설정
        </h1>
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center mt-8 mb-12 relative">
        <div className="relative">
          <Avatar className="w-[120px] h-[120px]">
            <AvatarImage src={user?.avatar_url} alt={user?.name} />
            <AvatarFallback>
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-white border-4 border-white shadow-md flex items-center justify-center">
            <PencilLineIcon className="w-5 h-5 text-gray-600" />
          </div>
        </div>
      </div>

      <div className="px-6">
        <div className="my-4">
          <h2 className="text-base font-bold mb-2">이메일</h2>
          {loading ? (
            <Skeleton className="h-5 w-3/4" />
          ) : (
            <p className="text-sm">{user?.email}</p>
          )}
        </div>
        <div className="border-t border-gray-100" />

        <div className="my-4">
          <h2 className="text-base font-bold mb-2">이름</h2>
          {loading ? (
            <Skeleton className="h-5 w-1/2" />
          ) : (
            <p className="text-sm">{user?.name}</p>
          )}
        </div>
        <div className="border-t border-gray-100" />

        <div className="my-4">
          <h2 className="text-base font-bold mb-2">닉네임</h2>
          {loading ? (
            <Skeleton className="h-5 w-1/3" />
          ) : (
            <p className="text-sm">{user?.username || "설정되지 않음"}</p>
          )}
        </div>
        <div className="border-t border-gray-100" />

        <div className="my-4">
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => navigate("/password-change")}
          >
            <h2 className="text-base font-bold">비밀번호</h2>
            <ChevronRight className="w-5 h-5 text-black" />
          </div>
          <p className="text-sm tracking-widest">●●●●●●●●</p>
        </div>
        <div className="border-t border-gray-100" />

        <div className="my-4">
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => navigate("/phone-verification")}
          >
            <h2 className="text-base font-bold">휴대폰 번호</h2>
            <ChevronRight className="w-5 h-5 text-black" />
          </div>
          {loading ? (
            <Skeleton className="h-5 w-2/3" />
          ) : (
            <p className="text-sm">
              {maskPhoneNumber(user?.phone_number) || "설정되지 않음"}
            </p>
          )}
        </div>
        <div className="border-t border-gray-100" />

        <div className="my-4">
          <div
            className="flex justify-between items-center mb-2 cursor-pointer"
            onClick={() => navigate("/delivery-address")}
          >
            <h2 className="text-base font-bold">배송지</h2>
            <ChevronRight className="w-5 h-5 text-black" />
          </div>
          {loading ? (
            <Skeleton className="h-5 w-full" />
          ) : (
            <p className="text-sm">{user?.address || "설정되지 않음"}</p>
          )}
        </div>
        <div className="border-t border-gray-100" />
      </div>
    </div>
  );
};

export default ProfileSettings;

import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { RiKakaoTalkFill } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { FaGoogle } from "react-icons/fa";

const CredentialsResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    if (location.state && location.state.userData) {
      setUserData(location.state.userData);
    } else {
      navigate("/find-credentials");
      s;
    }
  }, [location, navigate]);

  const maskEmail = (email) => {
    const [username, domain] = email.split("@");
    const maskedUsername =
      username.slice(0, 4) + "*".repeat(username.length - 4);
    return `${maskedUsername}@${domain}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-5 pt-[38px]">
      {/* Header */}
      <div className="relative mb-8 flex items-center justify-center">
        <button
          onClick={() => navigate("/find-credentials")}
          className="absolute left-0 flex h-6 w-6 items-center justify-center text-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold">아이디 찾기</h1>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col items-center px-5">
        <p className="mb-6 text-center text-base">
          휴대전화번호 정보와 일치하는 아이디입니다.
        </p>

        {/* ID Info Box */}
        <div className="w-full rounded-2xl border border-[#008000] p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-base font-normal">아이디:</span>
            <div className="flex items-center gap-2">
              {userData.provider === "kakao" ? (
                <RiKakaoTalkFill className="h-5 w-5 text-[#381E1F]" />
              ) : userData.provider === "google" ? (
                <FaGoogle className="h-5 w-5 text-[#4285F4]" />
              ) : null}
              <span className="text-base">{maskEmail(userData.email)}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-normal">가입일:</span>
            <span className="text-base">{formatDate(userData.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Buttons */}
      <div className="fixed bottom-8 left-5 right-5 space-y-4">
        <Button
          onClick={() => navigate("/login")}
          className="h-14 text-white w-full rounded-full bg-[#008000] text-base font-medium hover:bg-[#006700]"
        >
          로그인
        </Button>
        <Button
          onClick={() => navigate("/find-password")}
          className="h-14 text-white w-full rounded-full bg-[#333333] text-base font-medium hover:bg-[#1a1a1a]"
        >
          비밀번호 찾기
        </Button>
      </div>
    </div>
  );
};

export default CredentialsResult;

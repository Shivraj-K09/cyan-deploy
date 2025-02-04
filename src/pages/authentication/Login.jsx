import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { FaGoogle } from "react-icons/fa";
import { RiKakaoTalkFill } from "react-icons/ri";
import { LogoIcon } from "../../components/icons/logo-icon";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { FaAnglesLeft } from "react-icons/fa6";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log("Starting login process...");

      // Query the public users table to get email
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("email")
        .eq("name", username)
        .single();

      if (userError) {
        console.error("Error fetching user data:", userError);
        throw userError;
      }

      if (!userData) {
        console.log("No user found with username:", username);
        toast.error("Invalid username or password");
        setIsLoading(false);
        return;
      }

      console.log("Found user data:", userData);

      // Attempt login with Supabase using the found email
      const { data: authData, error: authError } =
        await supabase.auth.signInWithPassword({
          email: userData.email,
          password: password,
        });

      if (authError) {
        console.error("Auth error:", authError);
        throw authError;
      }

      console.log("Login successful!", authData);

      // Check if the user is blocked
      const { data: userStatus, error: statusError } = await supabase
        .from("users")
        .select("is_blocked")
        .eq("email", userData.email)
        .single();

      if (statusError) {
        console.error("Error fetching user status:", statusError);
        throw statusError;
      }

      if (userStatus.is_blocked) {
        console.log("User is blocked");
        toast.error("You are blocked from accessing this page", {
          position: "top-center",
        });
        navigate("/block-page-404");
      } else {
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Login failed", {
        description: error.message || "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes:
            provider === "kakao"
              ? "profile_nickname profile_image account_email"
              : "",
        },
      });
      if (error) throw error;
      if (data) {
        console.log("OAuth login initiated:", data);
      }
    } catch (error) {
      console.error(`${provider} Login Failed:`, error);
      toast.error(`${provider} Login Failed`, {
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-5 pt-[38px]">
      <div className="text-left w-full">
        <Link to="/" className="absolute pl-2">
          <FaAnglesLeft className="w-5 h-5" />
        </Link>
      </div>
      {/* Logo Section */}
      <div className="mb-16 flex items-center gap-2">
        <LogoIcon className="h-12 w-12" />
        <span className="text-2xl font-bold text-[#128100]">붕어야</span>
      </div>

      {/* Login Form */}
      <div className="w-full max-w-md space-y-6">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-bold">
              아이디
            </Label>
            <Input
              id="username"
              type="text"
              placeholder="abc1234"
              className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-bold">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 rounded-xl border-[#008000] px-4 text-lg placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
              >
                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
              </button>
            </div>
          </div>

          <div className="text-right">
            <a
              href="/find-credentials"
              className="text-sm font-bold text-[#008000]"
            >
              아이디 · 비밀번호 찾기
            </a>
          </div>

          <Button
            type="submit"
            className="h-14 !mt-10 w-full text-white rounded-full bg-[#008000] text-base font-semibold hover:bg-[#006700]"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8E8]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-base font-semibold">or</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <Button
            variant="outline"
            type="button"
            className="h-14 w-full rounded-full border-[#E8E8E8] text-base font-normal hover:bg-gray-50"
            onClick={() => handleOAuthLogin("google")}
          >
            <FaGoogle className="!size-5 fill-[#381E1F]" />
            구글 계정으로 로그인
          </Button>

          <Button
            type="button"
            className="h-14 w-full rounded-full bg-[#FFCD00] text-base font-normal text-[#381E1F] hover:bg-[#FFD428]"
            onClick={() => handleOAuthLogin("kakao")}
          >
            <RiKakaoTalkFill className="!size-6 fill-[#381E1F]" />
            카카오톡으로 로그인
          </Button>

          <div className="text-center">
            <span className="text-sm text-black font-semibold">
              아직 계정이 없으신가요?{" "}
            </span>
            <Link to="/signup" className="text-sm text-[#008000] ml-1">
              회원가입 하기
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;

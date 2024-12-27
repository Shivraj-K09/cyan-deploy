import { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FaGoogle } from "react-icons/fa";
import { FaAnglesLeft } from "react-icons/fa6";
import { RiKakaoTalkFill } from "react-icons/ri";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import bcrypt from "bcryptjs";
import { LogoIcon } from "../../components/icons/logo-icon";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { supabase } from "../../lib/supabaseClient";
import { sendVerificationCode, verifyCode } from "../../services/twilioVerify";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    verificationCode: "",
  });
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneError, setPhoneError] = useState("");
  const [lastSentTime, setLastSentTime] = useState(0);
  const COOLDOWN_PERIOD = 60000; // 60 seconds cooldown

  useEffect(() => {
    const isValid =
      formData.username &&
      formData.email &&
      formData.password &&
      formData.confirmPassword &&
      formData.phone &&
      isVerified;
    setIsFormValid(isValid);
  }, [
    formData.username,
    formData.email,
    formData.password,
    formData.confirmPassword,
    formData.phone,
    isVerified,
  ]);

  useEffect(() => {
    return () => {
      setIsVerificationSent(false);
      setIsVerified(false);
      setIsSendingCode(false);
      setIsVerifying(false);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "phone") {
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(value.replace(/\s+/g, ""))) {
        setPhoneError("올바른 국제 전화번호 형식을 입력해주세요");
      } else {
        setPhoneError("");
      }
    }
  };

  const handleSendVerificationCode = async () => {
    const currentTime = Date.now();
    if (currentTime - lastSentTime < COOLDOWN_PERIOD) {
      toast.error(
        `Please wait ${Math.ceil(
          (COOLDOWN_PERIOD - (currentTime - lastSentTime)) / 1000
        )} seconds before requesting a new code.`
      );
      return;
    }

    if (
      formData.phone &&
      !phoneError &&
      !isVerificationSent &&
      !isSendingCode
    ) {
      setIsSendingCode(true);
      const success = await sendVerificationCode(formData.phone);
      setIsSendingCode(false);
      if (success) {
        setIsVerificationSent(true);
        setLastSentTime(currentTime);
        toast.success("인증 코드가 전송되었습니다!");
      }
    } else if (phoneError) {
      toast.error("올바른 전화번호를 입력해주세요");
    } else if (!formData.phone) {
      toast.error("전화번호를 입력해주세요");
    }
  };

  const handleVerifyCode = async () => {
    if (formData.verificationCode && !isVerifying) {
      setIsVerifying(true);
      const isValid = await verifyCode(
        formData.phone,
        formData.verificationCode
      );
      setIsVerifying(false);
      if (isValid) {
        setIsVerified(true);
        toast.success("Phone number verified!");
      } else {
        setIsVerified(false);
        toast.error("Invalid verification code");
      }
    } else if (!formData.verificationCode) {
      toast.error("Please enter the verification code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (!isVerified) {
      toast.error("Please verify your phone number");
      return;
    }

    try {
      console.log("Starting signup process...");

      // Hash the password for storage in the custom table
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(formData.password, salt);
      console.log("Password hashed successfully");

      // Sign up with Supabase Auth
      console.log("Attempting to sign up with Supabase Auth...");
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.username,
            phone: formData.phone, // Add phone number to user metadata
          },
        },
      });

      if (authError) {
        console.error("Supabase Auth signup error:", authError);
        throw authError;
      }

      if (!authData.user) {
        console.error("User creation failed: No user data returned");
        throw new Error("User creation failed");
      }

      console.log(
        "Supabase Auth signup successful. User ID:",
        authData.user.id
      );

      // Insert user data into the public users table
      console.log("Inserting user data into public users table...");
      const { error: insertError } = await supabase.from("users").insert({
        id: authData.user.id,
        name: formData.username,
        email: formData.email,
        phone: formData.phone,
        password_hash: hashedPassword,
        membership_level: "Free",
        avatar_url: null,
        provider: "email",
      });

      if (insertError) {
        console.error("Error inserting user data:", insertError);
        throw insertError;
      }

      console.log("User data inserted successfully");

      // After successful registration
      setIsVerificationSent(false);
      setIsVerified(false);

      toast.success("Registration successful!");
      navigate("/login");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed", {
        description: error.message,
      });
    }
  };

  const handleOAuthSignup = async (provider) => {
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

      // If successful, insert additional data into public users table
      if (data?.user) {
        const { error: insertError } = await supabase.from("users").insert({
          id: data.user.id,
          name: data.user.user_metadata.full_name || data.user.email,
          email: data.user.email,
          avatar_url: data.user.user_metadata.avatar_url,
          provider: provider,
          membership_level: "Free",
        });

        if (insertError) {
          console.error("Error inserting OAuth user data:", insertError);
          toast.error(
            "Failed to complete user profile. Please update your profile later."
          );
        }
      }
    } catch (error) {
      toast.error(`${provider} Signup Failed`, {
        description: error.message,
      });
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-5 pt-[38px]">
      <div className="text-left w-full">
        <Link to="/login" className="absolute pl-2">
          <FaAnglesLeft className="w-5 h-5" />
        </Link>
      </div>
      {/* Logo Section */}
      <div className="mb-16 flex items-center gap-2">
        <LogoIcon className="h-12 w-12" />
        <span className="text-2xl font-bold text-[#128100]">붕어야</span>
      </div>

      {/* Registration Form */}
      <div className="w-full max-w-md space-y-6">
        <form className="space-y-6 pb-8" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-normal">
              아이디
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              placeholder="abcb1234"
              className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-base font-normal">
              이메일 주소
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="abcb1234@dasoft.co.kr"
              className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-base font-normal">
              비밀번호
            </Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-normal">
              비밀번호 확인
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-normal">
              전화번호 (국가 코드 포함)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="+91 98765 43210"
                className="h-14 flex-grow rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={formData.phone}
                onChange={handleInputChange}
                required
              />
              <Button
                type="button"
                className="h-14 rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
                onClick={handleSendVerificationCode}
                disabled={isVerificationSent || isSendingCode}
              >
                {isSendingCode
                  ? "전송 중..."
                  : isVerificationSent
                  ? "전송됨"
                  : "전송"}
              </Button>
            </div>
            {phoneError && <p className="text-sm text-red-500">{phoneError}</p>}
            <p className="text-sm text-gray-500">
              예: +91 98765 43210 (인도), +1 234 567 8900 (미국)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode" className="text-base font-normal">
              인증번호
            </Label>
            <div className="flex space-x-2">
              <div className="relative w-full">
                <Input
                  id="verificationCode"
                  name="verificationCode"
                  type="text"
                  placeholder="34322"
                  className="h-14 w-full rounded-xl border-[#008000] pr-[100px] pl-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                  value={formData.verificationCode}
                  onChange={handleInputChange}
                  disabled={!isVerificationSent || isVerified}
                  required
                />
                <Button
                  type="button"
                  className="absolute right-[3px] top-1/2 -translate-y-1/2 h-[46px] rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
                  onClick={handleVerifyCode}
                  disabled={!isVerificationSent || isVerified || isVerifying}
                >
                  {isVerifying
                    ? "확인 중..."
                    : isVerified
                    ? "인증됨"
                    : "인증하기"}
                </Button>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            className="h-14 w-full rounded-full text-white bg-[#008000] text-base font-medium hover:bg-[#006700] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!isFormValid}
          >
            회원가입
          </Button>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E8E8E8]"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-[#999]">or</span>
            </div>
          </div>

          {/* Social Registration Buttons */}
          <Button
            variant="outline"
            type="button"
            className="h-14 w-full rounded-full border-[#E8E8E8] text-base font-normal hover:bg-gray-50"
            onClick={() => handleOAuthSignup("google")}
          >
            <FaGoogle className="!size-5 fill-[#381E1F]" />
            구글 계정으로 회원가입
          </Button>

          <Button
            type="button"
            className="h-14 w-full rounded-full bg-[#FFCD00] text-base font-normal text-[#381E1F] hover:bg-[#FFD428]"
            onClick={() => handleOAuthSignup("kakao")}
          >
            <RiKakaoTalkFill className="!size-6 fill-[#381E1F]" />
            카카오톡으로 회원가입
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Signup;

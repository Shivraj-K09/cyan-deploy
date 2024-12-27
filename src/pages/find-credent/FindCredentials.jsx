import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import { sendVerificationCode, verifyCode } from "../../services/twilioVerify";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const FindCredentials = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerificationSent, setIsVerficationSent] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendVerificationCode = async () => {
    if (phone) {
      setIsLoading(true);
      const success = await sendVerificationCode(phone);
      setIsLoading(false);

      if (success) {
        setIsVerficationSent(true);
        toast.success(
          "인증 코드가 전송되었습니다!, verificationCode sent successfully to " +
            phone
        );
      } else {
        toast.error(
          "인증 코드 전송에 실패했습니다. 다시 시도해주세요. Failed to send verification code"
        );
      }
    } else {
      toast.error("전화번호를 입력해주세요. Please enter a phone number");
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode) {
      setIsLoading(true);
      const isValid = await verifyCode(phone, verificationCode);
      setIsLoading(false);

      if (isValid) {
        setIsVerified(true);
        toast.success(
          "전화번호가 인증되었습니다!. Phone number verified successfully!"
        );
      } else {
        toast.error(
          "전화번호 인증에 실패했습니다. 다시 시도해주세요. Failed to verify code"
        );
      }
    } else {
      toast.error("인증 코드를 입력해주세요. Please enter a verification code");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isVerified) {
      toast.error(
        "인증되지 않은 전화번호입니다. Please verify your phone number"
      );
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("name, email, provider, created_at")
        .eq("name", name)
        .eq("phone", phone)
        .single();

      if (error) throw error;

      if (data) {
        navigate("/find-credentials/result", { state: { userData: data } });
      } else {
        toast.error(
          "일치하는 사용자를 찾을 수 없습니다. No user found with the given name and phone number"
        );
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error(
        "사용자 검색 중 오류가 발생했습니다. An error occurred while finding the user"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white px-5 pt-[38px]">
      {/* Header */}
      <div className="relative mb-8 flex items-center justify-center">
        <a
          href="/login"
          className="absolute left-0 flex h-6 w-6 items-center justify-center text-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </a>
        <h1 className="text-xl font-bold">아이디 찾기</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-md space-y-6 mx-auto">
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-normal">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              className="h-14 rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-base font-normal">
              전화번호 인증
            </Label>
            <div className="relative">
              <Input
                id="phone"
                type="tel"
                placeholder="010-1234-5678"
                className="h-14 w-full rounded-xl border-[#008000] pr-[100px] pl-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              <Button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-[44px] rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
                onClick={handleSendVerificationCode}
                disabled={isLoading || isVerificationSent}
              >
                {isLoading
                  ? "전송 중..."
                  : isVerificationSent
                  ? "전송됨"
                  : "인증번호"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="verificationCode" className="text-base font-normal">
              인증번호
            </Label>
            <div className="relative">
              <Input
                id="verificationCode"
                type="text"
                placeholder="34322"
                className="h-14 w-2/3 rounded-xl border-[#008000] pr-[100px] pl-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                disabled={!isVerificationSent || isVerified}
                required
              />
              <Button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-[44px] rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
                style={{ right: "calc(33.33% + 4px)" }}
                onClick={handleVerifyCode}
                disabled={isLoading || !isVerificationSent || isVerified}
              >
                {isLoading ? "확인 중..." : isVerified ? "인증됨" : "인증하기"}
              </Button>
            </div>
          </div>

          <div className="fixed bottom-8 left-5 right-5 space-y-4">
            <Button
              type="submit"
              className="h-14 w-full text-white rounded-full bg-[#008000] text-base font-medium hover:bg-[#006700]"
              disabled={isLoading || !isVerified}
            >
              아이디 찾기
            </Button>
            <Button
              type="button"
              className="h-14 w-full text-white rounded-full bg-[#333333] text-base font-medium hover:bg-[#1a1a1a]"
              onClick={() => navigate("/find-password")}
            >
              비밀번호 찾기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindCredentials;

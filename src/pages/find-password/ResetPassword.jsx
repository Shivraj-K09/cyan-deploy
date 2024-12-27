import { useState } from "react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const ResetPassword = () => {
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-white px-5 pt-[38px]">
      {/* Header */}
      <div className="relative mb-8 flex items-center justify-center">
        <a
          href="/find-password"
          className="absolute left-0 flex h-6 w-6 items-center justify-center text-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </a>
        <h1 className="text-xl font-bold">비밀번호 찾기</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-md space-y-6 mx-auto">
        <form className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword" className="text-base font-normal">
              새 비밀번호 입력
            </Label>
            <div className="relative">
              <Input
                id="newPassword"
                type={showNewPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 w-full rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999]"
              >
                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-base font-normal">
              비밀번호 다시 입력
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-14 w-full rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
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

          <div className="fixed bottom-8 left-5 right-5">
            <Button
              type="submit"
              className="h-14 w-full rounded-full bg-[#008000] text-base font-medium hover:bg-[#006700]"
            >
              로그인
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;

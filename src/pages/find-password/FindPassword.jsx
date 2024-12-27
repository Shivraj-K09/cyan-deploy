import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";

const FindPassword = () => {
  return (
    <div className="flex min-h-screen flex-col bg-white px-5 pt-[38px]">
      {/* Header */}
      <div className="relative mb-8 flex items-center justify-center">
        <a
          href="/find-credentials"
          className="absolute left-0 flex h-6 w-6 items-center justify-center text-black"
        >
          <ChevronLeft className="h-6 w-6" />
        </a>
        <h1 className="text-xl font-bold">비밀번호 찾기</h1>
      </div>

      {/* Form */}
      <div className="w-full max-w-md space-y-6 mx-auto">
        <form className="space-y-6" action="/find-password/reset">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-base font-normal">
              아이디
            </Label>
            <div className="relative">
              <Input
                id="username"
                type="text"
                placeholder="abcd1234"
                className="h-14 w-full rounded-xl border-[#008000] px-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              />
            </div>
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
                className="h-14 w-full rounded-xl border-[#008000] pr-[116px] pl-4 text-base placeholder:text-[#999] focus:ring-1 focus:ring-[#008000] focus:border-[#008000] focus:outline-none"
              />
              <Button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-[44px] rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
              >
                인증번호
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
              />
              <Button
                type="button"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-[44px] rounded-xl bg-[#008000] px-4 text-sm font-medium text-white hover:bg-[#006700]"
                style={{ right: "calc(33.33% + 4px)" }}
              >
                인증하기
              </Button>
            </div>
          </div>

          <div className="fixed bottom-8 left-5 right-5">
            <Button
              type="submit"
              className="h-14 text-white w-full rounded-full bg-[#008000] text-base font-medium hover:bg-[#006700]"
            >
              다음
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;

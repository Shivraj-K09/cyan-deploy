import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";

const PhoneVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/profile-settings" className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          휴대폰 번호
        </h1>
      </div>

      <div className="px-6">
        {/* Description */}
        <div className="mt-8 mb-12">
          <h2 className="text-2xl font-bold mb-2">본인 확인을 위해</h2>
          <h2 className="text-2xl font-bold">휴대폰 번호를 인증해주세요</h2>
        </div>

        {/* Phone Number Verification */}
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold mb-2">전화번호 인증</h3>
            <div className="relative">
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="010-1234-5678"
                className="w-full h-12 pr-24 border-gray-300 focus-visible:ring-0 focus-visible:border-[#008C1F]"
              />
              <Button className="absolute right-0 top-0 h-full w-24 bg-[#008C1F] hover:bg-[#007819] text-white">
                인증번호
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold mb-2">인증번호</h3>
            <div className="flex gap-3">
              <div className="relative w-2/3">
                <Input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="34322"
                  className="w-full h-12 pr-24 border-gray-300 focus-visible:ring-0 focus-visible:border-[#008C1F] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <Button className="absolute right-0 top-0 h-full w-24 bg-[#008C1F] hover:bg-[#007819] text-white">
                  인증하기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneVerification;

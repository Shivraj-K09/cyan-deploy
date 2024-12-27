import { ChevronsLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

const DeliveryAddress = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/profile-settings" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          배송지 설정
        </h1>
      </div>

      <div className="px-6">
        {/* Recipient */}
        <div className="mt-6 py-1">
          <h2 className="text-base font-bold mb-2">받는 분</h2>
          <p className="text-sm">홍길동</p>
        </div>
        <hr className="my-4 border-gray-200" />

        {/* Postal Code */}
        <div className="py-1">
          <h2 className="text-base font-bold mb-2">우편번호</h2>
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center justify-between">
              <p className="text-sm">01111</p>
            </div>
            <Button
              variant="outline"
              className={`h-10 px-4 xl border-[#008C1F] text-[#008C1F] hover:bg-[#008C1F] hover:text-white`}
              onClick={() => (window.location.href = "/postal-code-search")}
            >
              우편번호 검색
            </Button>
          </div>
        </div>
        <hr className="my-4 border-gray-200" />

        {/* Address */}
        <div className="py-1">
          <h2 className="text-base font-bold mb-2">주소</h2>
          <p className="text-sm">서울 강남구 선릉로 99</p>
        </div>
        <hr className="my-4 border-gray-200" />

        {/* Detailed Address */}
        <div className="py-1">
          <h2 className="text-base font-bold mb-2">상세주소</h2>
          <p className="text-sm">강남타운 201호</p>
        </div>
        <hr className="my-4 border-gray-200" />

        {/* Contact */}
        <div className="py-1">
          <h2 className="text-base font-bold mb-2">연락처</h2>
          <p className="text-sm">010-1234-5678</p>
        </div>
        <hr className="my-4 border-gray-200" />
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
        <Button className="w-full h-14 bg-[#008C1F] hover:bg-[#007819] text-white text-base font-medium rounded-xl">
          변경완료
        </Button>
      </div>
    </div>
  );
};

export default DeliveryAddress;

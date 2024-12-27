import { ChevronsLeft } from "lucide-react";

const OrderDetails = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/orders" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          주문상세
        </h1>
      </div>

      {/* Order Number and Date */}
      <div className="px-4 py-5">
        <div className="text-lg font-medium mb-1">주문번호 123884568431</div>
        <div className="text-sm text-gray-600">
          결제 날짜 : 2024.08.19 · 오후 06:21
        </div>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Order Items */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-medium mb-4">낚시상점 배송상품 1개</h2>

        <div className="mb-4">
          <div className="text-red-500 mb-4">
            결제완료 - 08/23(목) 배송 완료
          </div>

          <div className="flex gap-4">
            <div className="w-[100px] h-[100px] aspect-square bg-gray-200 rounded-md flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">[낚시상점]</div>
              <div className="font-medium mb-1">어떤 것이든 다 낚는 낚시대</div>
              <div className="text-sm text-gray-600 mb-1">
                이 낚시대는 어떤 것이든 다 낚아드립니다.
              </div>
              <div className="text-[#008C1F] font-medium">170,000원</div>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Customer Info */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-medium mb-4">주문자 정보</h2>
        <div className="flex items-center">
          <div className="text-gray-600">홍길동 | 010-1234-5678</div>
        </div>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Payment Info */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-medium mb-4">결제 정보</h2>
        <div className="text-lg font-medium">170,000원</div>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Delivery Info */}
      <div className="px-4 py-5">
        <h2 className="text-lg font-medium mb-4">배송지 정보</h2>
        <div className="text-gray-600">홍길동 | 서울 강남구 선릉로 99</div>
      </div>
    </div>
  );
};

export default OrderDetails;

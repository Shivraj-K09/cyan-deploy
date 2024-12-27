import React, { useState } from "react";
import { ChevronDown, ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const PaymentForm = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedInstruction, setSelectedInstruction] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [points, setPoints] = useState(0);
  const [receiptType, setReceiptType] = useState("");
  const [personalChecked, setPersonalChecked] = useState(false);
  const [businessChecked, setBusinessChecked] = useState(false);


  const deliveryInstructions = [
    { id: 1, text: "문 앞에 놓아주세요" },
    { id: 2, text: "경비실에 맡겨주세요" },
    { id: 3, text: "직접 받겠습니다" },
    { id: 4, text: "배송 전 연락주세요" },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Payment submitted:", {
      deliveryInstruction: selectedInstruction,
      paymentMethod: selectedPayment,
      points,
      receiptType,
    });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="flex items-center p-4 border-b">
        <Link to='/shopping-cart' type="button" className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <h1 className="flex-1 text-center text-lg font-bold">주문/결제</h1>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Delivery Section */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold">배송지</h2>
            <button type="button" className="text-blue-500 text-sm">
              변경하기
            </button>
          </div>

          <div className="py-2">
            <p className="font-bold">홍길동</p>
            <p className="text-sm text-gray-700">010-1234-5678</p>
            <p className="text-sm text-gray-700">서울 마포구 신촌로 001</p>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full p-3 text-left border rounded-xl border-gray-400 text-gray-600 flex justify-between items-center"
            >
              {selectedInstruction || "배송 시 요청사항을 선택해주세요"}
              <ChevronDown className="w-5 h-5" />
            </button>

            {isDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg">
                {deliveryInstructions.map((instruction) => (
                  <button
                    key={instruction.id}
                    type="button"
                    className="w-full p-3 text-left hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => {
                      setSelectedInstruction(instruction.text);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {instruction.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="w-full h-[1px] bg-gray-200" />

        {/* Payment Methods */}
        <section className="space-y-4">
          <h2 className="text-lg">결제수단</h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {[
              { id: "simple", text: "간편결제" },
              { id: "card", text: "카드" },
              { id: "phone", text: "휴대폰" },
              { id: "account", text: "계좌이체" },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                onClick={() => setSelectedPayment(method.id)}
                className={`px-4 py-2 rounded-xl border whitespace-nowrap ${
                  selectedPayment === method.id
                    ? "border-green-600 text-green-600"
                    : "border-gray-400 text-gray-400"
                }`}
              >
                {method.text}
              </button>
            ))}
          </div>

          {selectedPayment === "simple" && (
            <div
              className={`flex justify-between items-center space-x-2`}
              style={{
                pointerEvents: selectedPayment === "simple" ? "auto" : "none",
              }}
            >
              <div className="flex-1">
                <img
                  src="/pay1.png"
                  className="h-full w-full object-contain"
                  alt="Payment Method 1"
                />
              </div>
              <div className="flex-1">
                <img
                  src="/pay2.png"
                  className="h-full w-full object-contain"
                  alt="Payment Method 2"
                />
              </div>
              <div className="flex-1">
                <img
                  src="/pay3.png"
                  className="h-full w-full object-contain"
                  alt="Payment Method 3"
                />
              </div>
            </div>
          )}
          {selectedPayment === "phone" && (
            <div>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiptType"
                  value=""
                  checked={true}
                  className="w-4 h-4 accent-[#FF2424]"
                />
                <p className="">무통장입금</p>
              </label>
            </div>
          )}
        </section>

        <div className="w-full h-[1px] bg-gray-200" />

        {/* Points Section */}
        <section className="space-y-3">
          <h2 className="text-lg font-medium">할인 혜택</h2>
          <div className="flex justify-between items-center ">
            {/* Points Display */}
            <div className="flex-1 flex justify-between items-center border border-gray-300 rounded-xl p-3">
              <span className="text-sm text-gray-600">포인트</span>
              <span className="text-sm font-medium">
                {points.toLocaleString()}원
              </span>
            </div>
            {/* Use All Button */}
            <button
              type="button"
              onClick={() => setPoints(24000)}
              className="ml-3 p-3  border border-gray-300 rounded-xl text-sm font-medium text-gray-700"
            >
              모두 사용
            </button>
          </div>
          <p className="text-sm text-gray-500 text-right">
            <span className="text-black">사용 가능: 24,000원 |</span> 보유
            포인트: 24,000원
          </p>
        </section>

        <div className="w-full h-[1px] bg-gray-200" />

        {/* Receipt Type */}
        <section className="space-y-3">
          <h2 className="text-lg">결제 영수증</h2>
          <div className="space-y-2 flex justify-between">
            {[
              { id: "personal", text: "개인소득공제" },
              { id: "business", text: "사업자증빙" },
              { id: "none", text: "미신청" },
            ].map((type) => (
              <label key={type.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="receiptType"
                  value={type.id}
                  checked={receiptType === type.id}
                  onChange={(e) => setReceiptType(e.target.value)}
                  className="w-4 h-4 accent-[#FF2424]"
                />
                <p
                  className={`${
                    receiptType === type.id ? "text-[#FF2424]" : "text-gray-800"
                  }`}
                >
                  {type.text}
                </p>
              </label>
            ))}
          </div>

          {receiptType === "personal" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="전화번호를 입력해주세요"
                  className="border-gray-400 border rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#128100] w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={personalChecked}
                  onChange={() => setPersonalChecked(!personalChecked)}
                  className="w-5 h-5 accent-[#128100]"
                />
                <span className="text-sm text-gray-700">
                  다음에도 사용할게요
                </span>
              </div>
            </div>
          )}

          {receiptType === "business" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="사업자번호를 입력해주세요"
                  className="border-gray-400 border rounded-xl px-4 py-2 focus:outline-none focus:ring-1 focus:ring-[#128100] w-full"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={businessChecked}
                  onChange={() => setBusinessChecked(!businessChecked)}
                  className="w-5 h-5 accent-[#128100]"
                />
                <span className="text-sm text-gray-700">
                  다음에도 사용할게요
                </span>
              </div>
            </div>
          )}
        </section>

        <div className="w-full h-[1px] bg-gray-200" />

        {/* Total Amount */}
        <section className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-lg">총 결제 금액</h2>
            <p className="text-xl font-bold">173,000원</p>
          </div>
          <p className="text-sm text-gray-500 text-right">
            적립 예정 포인트: 17,300원
          </p>
        </section>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full p-4 bg-gray-400 text-white rounded-lg font-medium mt-4"
        >
          결제하기
        </button>
      </form>
    </div>
  );
};

export default PaymentForm;

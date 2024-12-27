import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { ChevronsLeft, ImageIcon } from "lucide-react";
import { useState } from "react";

const ProductReviewWrite = () => {
  const [selectedRating, setSelectedRating] = useState(null);

  const ratings = [
    { value: "unsatisfied", label: "불만" },
    { value: "neutral", label: "보통" },
    { value: "satisfied", label: "만족" },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/product-reviews" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          리뷰 작성
        </h1>
      </div>

      {/* Product Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="w-[100px] h-[100px] bg-gray-200 rounded-md flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-1">[낚시상점]</p>
            <h2 className="font-bold mb-1">어떤 것이든 다 낚는 낚시대</h2>
            <p className="text-sm text-gray-600 mb-1">
              이 낚시대는 어떤 것이든 다 낚아드립니다.
            </p>
            <p className="text-green-600 font-bold">170,000원</p>
          </div>
        </div>
      </div>

      {/* Rating Buttons */}
      <div className="p-4 flex justify-between gap-2">
        {ratings.map((rating) => (
          <button
            key={rating.value}
            onClick={() => setSelectedRating(rating.value)}
            className={`flex-1 py-3 text-sm font-medium border rounded-lg ${
              selectedRating === rating.value
                ? "bg-green-600 text-white border-green-600"
                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
            }`}
          >
            {rating.label}
          </button>
        ))}
      </div>

      {/* Review Form */}
      <div className="p-4 space-y-8">
        {/* Photo Upload */}
        <div>
          <h3 className="text-base font-bold mb-4">사진첨부</h3>
          <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        {/* Content */}
        <div>
          <h3 className="text-base font-bold mb-4">내용</h3>
          <Textarea
            placeholder="내용을 입력해주세요."
            className="min-h-[200px] border rounded-xl p-4 resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
        <Button className="w-48 h-14 bg-green-600 hover:bg-green-700 text-white rounded-lg text-base font-medium">
          작성 완료
        </Button>
      </div>
    </div>
  );
};

export default ProductReviewWrite;

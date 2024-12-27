import { ChevronLeft, Search } from "lucide-react";
import { Input } from "../../components/ui/input";
import { useState } from "react";

const PostalCodeSearch = () => {
  const [searchQuery, setSearchQuery] = useState("서울 강남구");
  const [showResults, setShowResults] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    setShowResults(true);
  };

  const handleAddressSelect = () => {
    // Here you would typically handle the selected address
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/delivery-address" className="mr-4">
          <ChevronLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          우편번호 검색
        </h1>
      </div>

      {/* Search Input */}
      <div className="px-4 py-4 bg-gray-100">
        <form onSubmit={handleSearch}>
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="예) 판교역로 166, 분당 주공, 백현동 532"
              className="pr-10 pl-4 py-2 w-full bg-white rounded-md"
            />
            <button type="submit">
              <Search
                className="absolute right-3 top-[35%] transform -translate-y-1/2 text-gray-400"
                size={20}
              />
            </button>
          </div>
        </form>
      </div>

      {showResults ? (
        <div>
          {/* Region Title */}
          <h2 className="text-xl font-medium px-4 py-6">서울 강남구</h2>

          {/* Results List */}
          <div className="divide-y">
            {[...Array(7)].map((_, index) => (
              <div
                key={index}
                className="px-4 py-4 cursor-pointer hover:bg-gray-50"
                onClick={() =>
                  handleAddressSelect({
                    postalCode: "06035",
                    roadAddress: "서울 강남구 가로수길 5",
                    lotAddress: "서울 강남구 신사동 537-5",
                  })
                }
              >
                <div className="text-red-500 font-medium mb-2">06035</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs text-blue-500 border border-blue-500 rounded-md">
                      도로명
                    </span>
                    <span>서울 강남구 가로수길 5</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs text-blue-500 border border-blue-500 rounded-md">
                      지번
                    </span>
                    <span>서울 강남구 신사동 537-5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="px-4 py-6">
          <h2 className="font-medium mb-4">tip</h2>
          <p className="text-gray-600 text-sm mb-6">
            아래와 같은 조합으로 검색을 하시면 더욱 정확한 결과가 검색됩니다.
          </p>

          <div className="space-y-6">
            <div>
              <h3 className="text-gray-600 text-sm mb-1">도로명 + 건물번호</h3>
              <p className="text-blue-500 text-sm">
                예) 판교역로 166, 제주 첨단로 242
              </p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm mb-1">
                지역명(동/리) + 번지
              </h3>
              <p className="text-blue-500 text-sm">
                예) 백현동 532, 제주 영평동 2181
              </p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm mb-1">
                지역명(동/리) + 건물명(아파트명)
              </h3>
              <p className="text-blue-500 text-sm">
                예) 분당 주공, 연수동 주공3차
              </p>
            </div>

            <div>
              <h3 className="text-gray-600 text-sm mb-1">사서함명 + 번호</h3>
              <p className="text-blue-500 text-sm">
                예) 분당우체국사서함 1~100
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostalCodeSearch;

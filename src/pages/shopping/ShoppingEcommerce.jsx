import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiChevronDown } from "react-icons/fi";

const ShoppingEcommerce = () => {
  const [activeTab, setActiveTab] = useState("낚시용품");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState("추천순");

  const options = ["추천순", "최신순", "가격순"];

  const handleOptionClick = (option) => {
    setSelected(option);
    setIsOpen(false);
  };

  const navigate = useNavigate();

  const productCategories = {
    낚시용품: [
      {
        id: 1,
        head: "[낚시상점]",
        title: "어떤 것이든 다 나는 낚시대",
        desc: "이 낚시대는 어떤 것이든 다 낚아드립니다.",
        price: "170,000원",
        image: "https://via.placeholder.com/150",
      },
    ],
    캠핑용품: [
      {
        id: 2,
        head: "[캠핑상점]",
        title: "초경량 텐트",
        desc: "가볍고 설치가 쉬운 2인용 텐트",
        price: "250,000원",
        image: "https://via.placeholder.com/150",
      },
    ],
    미끼류: [
      {
        id: 3,
        head: "[미끼상점]",
        title: "고급 인조 미끼 세트",
        desc: "다양한 종류의 인조 미끼 10종 세트",
        price: "35,000원",
        image: "https://via.placeholder.com/150",
      },
    ],
  };

  // Fill each category with 9 products for demonstration
  Object.keys(productCategories).forEach((category) => {
    while (productCategories[category].length < 9) {
      productCategories[category].push({
        ...productCategories[category][0],
        id: productCategories[category].length + 1,
      });
    }
  });

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="p-4 border-b">
        {/* <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <span className="text-sm font-medium">
              봉어업자 | 내 포인트 : 24,000P
            </span>
          </div>
          <button className="ml-auto px-3 py-1 text-lg border font-bold rounded-xl border-gray-300 text-green-600">
            로그아웃
          </button>
        </div> */}

        <div className="relative flex items-center border border-green-600 rounded-xl">
          <input
            type="text"
            placeholder="쇼핑 물품 검색"
            className="w-full pl-3 pr-9 py-2 text-green-600 border-none rounded-xl focus:outline-none"
          />
          <FiSearch className="absolute right-3 h-5 w-5 text-green-600" />
        </div>
        <div className="flex items-center justify-between px-10 py-2 space-x-4 text-sm font-medium text-gray-500">
          {Object.keys(productCategories).map((category, index) => (
            <React.Fragment key={category}>
              <button
                className={`${
                  activeTab === category ? "text-black font-bold" : ""
                }`}
                onClick={() => setActiveTab(category)}
              >
                {category}
              </button>
              {index < Object.keys(productCategories).length - 1 && (
                <span className="text-gray-300">|</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Dropdown */}
      <div className="relative inline-block p-2">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between px-3 py-1 font-bold border border-green-600 rounded-full text-green-600 focus:outline-none"
        >
          {selected}
          <FiChevronDown className="ml-1" />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionClick(option)}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-green-50"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-3 gap-2 p-2">
        {productCategories[activeTab].map((product, index) => (
          <div
            key={index}
            className="space-y-1"
            onClick={() =>
              navigate("/product-detail", {
                state: { product },
              })
            }
          >
            <div className="aspect-square bg-gray-100 rounded-lg" />
            <div>
              <p className="text-[8px] text-wrap font-medium truncate">
                {product.head}
              </p>
              <p className="text-xs font-medium truncate">{product.title}</p>
              <p className="text-[8px] text-wrap font-medium truncate">
                {product.desc}
              </p>
              <p className="text-xs text-green-600">{product.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShoppingEcommerce;

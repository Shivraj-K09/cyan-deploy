import React from 'react';
import { FaAnglesLeft } from "react-icons/fa6";
import { Link } from 'react-router-dom';


const ProductReview = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
          <Link to="/product-detail" className=" pl-2">
            <FaAnglesLeft />
          </Link>
          <p className="text-lg ml-2 w-full font-bold text-center">상품 리뷰</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-14 px-4">
        {/* Profile Section */}
        <div className="flex items-center py-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
            <img
              src="/placeholder.svg?height=48&width=48"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="ml-3">
            <h2 className="font-medium">낚시박사</h2>
            <p className=" text-sm font-bold">민족</p>
          </div>
        </div>

        {/* Image Grid */}
        <div className="w-full h-[2px] bg-gray-300" />
        <div className="grid grid-cols-4 gap-1 my-4">
          {[1, 2, 3, 4].map((index) => (
            <div key={index} className="aspect-square bg-gray-200">
              <img
                src={`/placeholder.svg?height=200&width=200`}
                alt={`Review image ${index}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="w-full h-[2px] my-2 bg-gray-300" />

        {/* Review Text */}
        <div className=" pb-8 text-sm">
          <p className="font-bold py-3">내트대샷 후기~</p>
          <p className="text-gray-800 leading-relaxed">
            이번에 구매한 낚시대는 정말 만족스러웠습니다.
          </p>
          <p className="text-gray-800 leading-relaxed">
            가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도
            피로감이 적어요.{" "}
          </p>
          <p className="text-gray-800 leading-relaxed py-4">
            장시간 낚시에도 문제 없습니다. 정말 좋아서 만족해요~
          </p>
          <p className="text-gray-800 leading-relaxed">
            가격대비 너무 졸고 특특하고, 안정적이여서 너무너무 좋아요~
          </p>
        </div>
      </main>
    </div>
  );
};

export default ProductReview;


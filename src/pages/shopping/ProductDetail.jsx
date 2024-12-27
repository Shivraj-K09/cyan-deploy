import React, { useState } from "react";
import {
  FaArrowLeft,
  FaArrowRight,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { FiShare2 } from "react-icons/fi";
import { Link } from "react-router-dom";

const ProductDetail = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 4; // Adjust this based on the number of images you have

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const feedbackSections = [
    {
      key: 1,
      id: "1",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
    {
      key: 2,
      id: "2",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
    {
      key: 3,
      id: "3",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
  ];

  const [openSectionId, setOpenSectionId] = useState(null);

  const toggleSection = (id) => {
    setOpenSectionId(openSectionId === id ? null : id);
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center p-4 border-b">
        <Link to="/shopping" className="text-gray-600">
          <FaArrowLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-semibold">뒤로</h1>
        <button className="text-gray-600">
          <FiShare2 className="h-6 w-6" />
        </button>
      </div>

      {/* Carousel */}
      <div className="relative mt-4 mx-4">
        <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-500">
            Image {currentSlide + 1}
          </div>
        </div>

        {/* Carousel Controls */}
        <button
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
          onClick={prevSlide}
          aria-label="Previous Slide"
        >
          <FaArrowLeft className="h-6 w-6" />
        </button>
        <button
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow-md"
          onClick={nextSlide}
          aria-label="Next Slide"
        >
          <FaArrowRight className="h-6 w-6" />
        </button>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {[...Array(totalSlides)].map((_, index) => (
            <button
              key={index}
              className={`w-2 h-2 rounded-full ${
                currentSlide === index ? "bg-gray-800" : "bg-gray-400"
              }`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-lg p-6">
        <p className="text-xl font-bold">어떤 것이든 다 낚는 낚시대</p>
        <div className="w-full h-[1px] bg-gray-300 my-2" />
        <p className="text-3xl font-semibold py-3">170,000원</p>

        <div className="flex text-sm gap-5">
          <div className=" flex flex-col gap-2">
            <p>[제품설명]</p>
            <p>[배송비]</p>
            <p>[브랜드]</p>
            <p>[제조사]</p>
          </div>
          <div className="flex flex-col gap-2">
            <p>이 낚시대는 어떤 것이든 다 낚아드립니다. </p>
            <p>3,000원</p>
            <p>낚시상점</p>
            <p>FISH SHOP</p>
          </div>
        </div>
      </div>

      <div className=" bg-gray-300 w-full h-1 my-4" />

      {/* Feedback Sections */}
      <p className="ml-4 text-xl font-bold">상품 리뷰</p>
      <div className="p-4 space-y-4">
        {feedbackSections.map((section) => (
          <div>
            <Link to="/product-review">
              <div className="w-full h-[0.6px] bg-gray-300 my-1" />
              <div key={section.id} className=" rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="py-2">
                    <p className="text-[10px]">{section.miniTitle}</p>
                    <p className="font-semibold text-xl text-left">
                      {section.title}
                    </p>
                    <p className="text-l text-left">{section.subtitle}</p>
                  </div>
                  <FaChevronRight className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-32 h-20 bg-gray-200" />
                  <div className=" text-wrap text-[10.5px] text-[#424242]">
                    <p className=" ">{section.content1}</p>
                    <p className=" ">{section.content2}</p>
                    <p className="mt-2">{section.content3}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
        <div className="py-8 w-full flex items-center justify-center">
          <Link
            to="/payment"
            className=" bg-[#128100] text-white p-3 px-6 text-lg font-bold  rounded-xl"
          >
            결제하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

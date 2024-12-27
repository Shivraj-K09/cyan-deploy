import { LogoIcon } from "../../components/icons/logo-icon";
import { ChevronsLeft } from "lucide-react";

const Subscribe = () => {
  return (
    <div className="min-h-screen bg-background pt-6">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <a href="/profile" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          유료 구독하기
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Content */}
      <div className="flex flex-col items-center px-6 mt-20">
        {/* App Icon and Name */}
        <div className="flex items-center gap-2 mb-12">
          <LogoIcon className="w-16 h-16" />
          <span className="text-2xl font-semibold text-[#008C1F]">봉어야</span>
        </div>

        {/* Main Text */}
        <h2 className="text-center text-2xl font-bold leading-relaxed mb-4">
          <span className="text-[#008C1F]">붕어야</span>와 함께 더 깊이 있는
          <br />
          낚시 세계로 떠나보세요!
        </h2>

        {/* Subtitle */}
        <p className="text-center text-gray-600 mb-16">
          구독자에게 더 많은 포인트 혜택과
          <br />
          할인 쿠폰을 받아보세요
        </p>

        {/* Price */}
        <div className="text-[#008C1F] text-3xl font-bold mb-8">월 5,000원</div>

        {/* Subscribe Button */}
        <button className="w-full max-w-md h-14 bg-[#008C1F] text-white rounded-full text-lg font-medium">
          구독하기
        </button>
      </div>
    </div>
  );
};

export default Subscribe;

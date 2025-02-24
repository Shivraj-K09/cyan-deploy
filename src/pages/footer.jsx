import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-gray-50 py-4 px-4 text-center text-sm text-gray-600 border-t">
      <div className="space-y-1">
        <div className="flex space-x-4">
          <p className="text-xs">
            <span className="text-black mr-1">대표자:</span>
            김선
          </p>
          <p className="text-xs">
            <span className="text-black mr-1">상호명:</span>
            대물낚시 붕어야
          </p>
        </div>

        <div className="flex space-x-4">
          <p className="text-xs">
            <span className="text-black mr-1">사업자번호:</span>
            528-08-02462
          </p>
        </div>

        <div className="flex space-x-4">
          <p className="text-xs">
            <span className="text-black mr-1">주소:</span>
            서울특별시 강북구 삼양로 123길 32-33, 604호(수유동,프라비아)
          </p>
        </div>

        <div className="flex space-x-3.5">
          <p className="text-xs">
            <span className="text-black mr-1">대표전화번호:</span>
            010-2046-9772⁠
          </p>
          <p className="text-xs">
            <span className="text-black mr-1">E-mail:</span>
            gdistudio23@gmail.com
          </p>
        </div>
      </div>
    </footer>
  );
};

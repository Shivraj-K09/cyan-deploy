import { MemberManagementPage } from "@/components/AdminDashboard/MemberManagementPage";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function MemberManagement() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/admin");
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button onClick={handleBack} className="flex items-center">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            회원관리
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto pb-32">
        <MemberManagementPage />
      </div>
    </div>
  );
}

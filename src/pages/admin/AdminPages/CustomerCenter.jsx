import { CustomerCenterPage } from "@/components/AdminDashboard/CustomerCenterPage";
import { ChevronLeftIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CustomerCenter() {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button onClick={handleBack} className="flex items-center">
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            Customer Center
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <CustomerCenterPage />
      </div>
    </div>
  );
}

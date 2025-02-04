import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ChevronLeftIcon, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";

export function CustomerServiceInquiry() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const { data, error } = await supabase
          .from("customer_inquiries")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setInquiry(data);
      } catch (error) {
        console.error("Error fetching inquiry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">New</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-[#FFA500] text-black shadow-none">
            In Progress
          </Badge>
        );
      case "Resolved":
        return (
          <Badge className="bg-[#6a6a6a] text-white border border-black/10 shadow-none">
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading || !inquiry) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-screen ">
      <header className="sticky top-0 z-10 shadow-none border px-4 h-16 flex items-center">
        <button
          onClick={() => navigate("/customer-service")}
          className="flex items-center text-gray-700 hover:text-gray-900 transition-colors"
        >
          <ChevronLeftIcon className="h-6 w-6" />
          <h3 className="text-base font-semibold ml-2">Inquiry Details</h3>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-32">
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-none border">
          <div className="border-b mb-5 px-6 py-4">
            <div className="mb-1 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-800">
                {inquiry.title}
              </h2>
              {getStatusIcon(inquiry.status)}
            </div>

            <div className="text-[0.8rem] mb-2 text-gray-500 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(inquiry.created_at).toLocaleString()}
            </div>
          </div>

          <div className="space-y-6 px-4 pb-10">
            {/* User's inquiry */}
            <div className="flex flex-col items-end">
              <div className="bg-blue-100 border border-blue-200 text-blue-800 p-3 rounded-xl rounded-tr-none max-w-[80%]">
                <p className="text-sm leading-relaxed">{inquiry.content}</p>
              </div>
              {/* Inquiry image if exists */}
              {inquiry.image_url && (
                <div className="flex justify-end mt-2">
                  <img
                    src={inquiry.image_url || "/placeholder.svg"}
                    alt="Inquiry attachment"
                    className="max-w-[80%] h-auto rounded-xl shadow-md"
                  />
                </div>
              )}
              <span className="text-xs text-gray-500 mt-2">You</span>
            </div>

            {/* Admin's response */}
            {inquiry.admin_response && (
              <div className="flex flex-col items-start">
                <div className="bg-gray-100 border border-gray-200 text-gray-800 p-3 rounded-xl rounded-tl-none max-w-[70%]">
                  <p className="text-sm leading-relaxed">
                    {inquiry.admin_response}
                  </p>
                </div>
                <span className="text-xs text-gray-500 mt-2">Admin</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

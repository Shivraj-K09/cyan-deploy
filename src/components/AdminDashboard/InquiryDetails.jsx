import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeftIcon, SendIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Textarea } from "../ui/textarea";
import { Skeleton } from "../ui/skeleton";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { supabase } from "@/lib/supabaseClient";

export function InquiryDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [inquiry, setInquiry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const responseRef = useRef(null);

  useEffect(() => {
    const fetchInquiry = async () => {
      try {
        const { data, error } = await supabase
          .from("customer_inquiries")
          .select(
            `
            *,
            users (
              id,
              name
            )
          `
          )
          .eq("id", id)
          .single();

        if (error) throw error;
        if (!data) throw new Error("문의가 없습니다.");
        setInquiry(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [id]);

  const handleSubmitResponse = async () => {
    if (!response.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("customer_inquiries")
        .update({
          admin_response: response,
          status: "Resolved",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select();

      if (error) throw error;

      setInquiry(data[0]);
      setResponse("");
      responseRef.current?.focus();
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 h-14 flex items-center">
          <button
            onClick={() => navigate("/admin/customer-center")}
            className="flex items-center text-gray-600"
          >
            <ChevronLeftIcon className="h-6 w-6" />
            <span className="ml-2 text-base font-medium">
              고객 문의 세부 사항
            </span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pb-32 overflow-y-auto">
        {loading ? (
          <InquirySkeleton />
        ) : error ? (
          <div className="p-4 text-red-600">{error}</div>
        ) : inquiry ? (
          <div className="px-4">
            {/* Title Section */}
            <div className="flex items-center justify-between mt-4 mb-3">
              <h1 className="text-xl font-bold text-gray-900">
                {inquiry.title}
              </h1>
              <Badge className="bg-[#128100] text-white font-medium">
                {inquiry.status}
              </Badge>
            </div>

            {/* User Info */}
            <div className="flex items-center mb-6 text-sm text-gray-500">
              <Avatar className="h-8 w-8 mr-2">
                <AvatarFallback className="bg-[#FF4E4E] text-white">
                  {inquiry.users?.name
                    ? inquiry.users.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                    : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <span className="font-medium text-gray-900">
                  {inquiry.users?.name || "Unknown User"}
                </span>
                <span className="mx-2"></span>
                <span>
                  {new Date(inquiry.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "numeric",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                  })}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="space-y-4">
              <p className="text-gray-700 whitespace-pre-wrap text-sm">
                {inquiry.content}
              </p>
              {inquiry.image_url && (
                <div className="mt-4 rounded-lg overflow-hidden">
                  <img
                    src={inquiry.image_url || "/placeholder.svg"}
                    alt="Inquiry attachment"
                    className="w-full h-auto"
                  />
                </div>
              )}
            </div>

            {/* Admin Response */}
            {inquiry.admin_response && (
              <div className="mt-8 p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800 mb-2 text-sm">
                  관리자 응답
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap text-sm">
                  {inquiry.admin_response}
                </p>
              </div>
            )}

            {/* Response Form */}
            {inquiry.status !== "Resolved" && (
              <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">Respond to Inquiry</h3>
                <Textarea
                  ref={responseRef}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="min-h-[120px] mb-4 w-full border-gray-200 rounded-lg resize-none"
                />
                <Button
                  onClick={handleSubmitResponse}
                  disabled={submitting || !response.trim()}
                  className="w-full bg-[#128100] hover:bg-[#128100]/90 text-white h-12 rounded-lg flex items-center justify-center"
                >
                  <span>응답 제출</span>
                  <SendIcon className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">문의가 없습니다.</div>
        )}
      </main>
    </div>
  );
}

function InquirySkeleton() {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-16" />
      </div>
      <div className="flex items-center">
        <Skeleton className="h-8 w-8 rounded-full mr-2" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
      <div className="space-y-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

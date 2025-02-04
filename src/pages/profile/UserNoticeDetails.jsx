import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { CalendarIcon, ChevronLeftIcon, TagIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function UserNoticeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("notices")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        setNotice(data);
      } catch (error) {
        console.error("Error fetching notice details:", error);
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNoticeDetails();
  }, [id]);

  // Function to format description with proper paragraphs
  const formatDescription = (text) => {
    if (!text) return null;
    return text.split("\n").map(
      (paragraph, index) =>
        paragraph.trim() && (
          <p key={index} className="mb-4 last:mb-0">
            {paragraph}
          </p>
        )
    );
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">New</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-orange-500/80 text-white shadow-none whitespace-nowrap">
            In Progress
          </Badge>
        );
      case "Done":
        return (
          <Badge className="bg-[#6a6a6a] text-white shadow-none">Done</Badge>
        );
      default:
        return null;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <Card className="shadow-none bg-[#ebebeb] overflow-hidden relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return <div className="p-4 text-red-500">{error}</div>;
    }

    if (!notice) {
      return <div className="p-4">Notice not found.</div>;
    }

    return (
      <Card className="shadow-none bg-[#ebebeb] overflow-hidden relative">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-[#2f2f2f] flex items-center">
              {notice.title}
            </CardTitle>
            <span className="ml-2">{getStatusBadge(notice.status)}</span>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center text-[#6a6a6a] text-sm">
            <CalendarIcon className="w-4 h-4 mr-1" />
            <span>{new Date(notice.notice_date).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center text-[#6a6a6a] text-sm">
            <TagIcon className="w-4 h-4 mr-1" />
            <span>{notice.category}</span>
          </div>

          <div className="text-[#2f2f2f] text-sm pt-5">
            {formatDescription(notice.description)}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate("/notices")}
          className="flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            Announcement Details
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">{renderContent()}</div>
    </div>
  );
}

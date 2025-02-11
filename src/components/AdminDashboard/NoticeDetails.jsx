import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { CalendarIcon, ChevronLeftIcon, TagIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { supabase } from "@/lib/supabaseClient";

export function NoticeDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticeDetails = async () => {
      setIsLoading(true);
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError) throw authError;

        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("role")
          .eq("id", authData.user.id)
          .single();

        if (userError) throw userError;
        if (!["admin", "super_admin"].includes(userData.role)) {
          throw new Error(
            "User does not have permission to view notice details"
          );
        }

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

  const handleStatusChange = async (newStatus) => {
    try {
      const { data, error } = await supabase
        .from("notices")
        .update({ status: newStatus })
        .eq("id", id)
        .select();

      if (error) throw error;

      setNotice(data[0]);
    } catch (error) {
      console.error("Error updating notice status:", error);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">새로운</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-orange-500/80 text-white shadow-none whitespace-nowrap">
            진행 중
          </Badge>
        );
      case "Done":
        return (
          <Badge className="bg-[#6a6a6a] text-white shadow-none">완료</Badge>
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
            <div className="flex justify-end space-x-2 mt-4">
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
              <Skeleton className="h-10 w-20" />
            </div>
          </CardContent>
        </Card>
      );
    }

    if (error) {
      return <div className="p-4 text-red-500">{error}</div>;
    }

    if (!notice) {
      return <div className="p-4">공지사항을 찾을 수 없습니다.</div>;
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

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              onClick={() => handleStatusChange("New")}
              variant={notice.status === "New" ? "default" : "outline"}
              className={
                notice.status === "New" ? "bg-[#128100] text-white" : ""
              }
            >
              새로운
            </Button>
            <Button
              onClick={() => handleStatusChange("In Progress")}
              variant={notice.status === "In Progress" ? "default" : "outline"}
              className={
                notice.status === "In Progress" ? "bg-[#FFA500] text-white" : ""
              }
            >
              진행 중
            </Button>
            <Button
              onClick={() => handleStatusChange("Done")}
              variant={notice.status === "Done" ? "default" : "outline"}
              className={
                notice.status === "Done" ? "bg-[#6a6a6a] text-white" : ""
              }
            >
              완료
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="bg-white h-screen p-4">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-[#2f2f2f] hover:text-[#000000]"
      >
        <ChevronLeftIcon className="mr-1 h-4 w-4" /> 뒤로 가기
      </Button>

      {renderContent()}
    </div>
  );
}

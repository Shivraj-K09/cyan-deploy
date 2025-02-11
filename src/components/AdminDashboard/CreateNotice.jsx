import { CalendarIcon, ChevronLeftIcon } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { supabase } from "@/lib/supabaseClient";

export function CreateNotice() {
  const navigate = useNavigate();
  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeDescription, setNoticeDescription] = useState("");
  const [noticeDate, setNoticeDate] = useState();
  const [noticeCategory, setNoticeCategory] = useState("");
  const [noticeStatus, setNoticeStatus] = useState("New");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateNotice = async () => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("No authenticated user found");

      // Fetch the user data from the public.users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;
      if (!userData) throw new Error("User not found in public.users table");

      // Check if the user has the required role to create a notice
      if (!["admin", "super_admin"].includes(userData.role)) {
        throw new Error("User does not have permission to create notices");
      }

      const { data, error } = await supabase
        .from("notices")
        .insert([
          {
            title: noticeTitle,
            description: noticeDescription,
            notice_date: noticeDate?.toISOString().split("T")[0],
            category: noticeCategory,
            status: noticeStatus,
            created_by: userData.id, // Use the id from public.users table
          },
        ])
        .select();

      if (error) throw error;

      console.log("Notice created successfully:", data);
      navigate("/admin/notice");
    } catch (error) {
      console.error("Error creating notice:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
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

      <Card className="max-w-2xl mx-auto shadow-none">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#2f2f2f]">
            공지 만들기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label
              htmlFor="notice-title"
              className="block text-sm font-medium text-[#2f2f2f]"
            >
              공지 제목
            </Label>
            <Input
              id="notice-title"
              value={noticeTitle}
              placeholder="공지 제목 입력"
              onChange={(e) => setNoticeTitle(e.target.value)}
              className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none text-sm h-10"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notice-description"
              className="block text-sm font-medium text-[#2f2f2f]"
            >
              공지 설명
            </Label>
            <Textarea
              id="notice-description"
              rows={4}
              value={noticeDescription}
              placeholder="공지 설명 입력"
              onChange={(e) => setNoticeDescription(e.target.value)}
              className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none text-sm min-h-[60px] whitespace-pre-wrap"
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notice-date"
              className="block text-sm font-medium text-[#2f2f2f]"
            >
              공지 날짜
            </Label>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal shadow-none h-10",
                    !noticeDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {noticeDate ? (
                    format(noticeDate, "PPP")
                  ) : (
                    <span>날짜를 정하세요</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  className="shadow-none w-[330px] px-14"
                  mode="single"
                  selected={noticeDate}
                  onSelect={setNoticeDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notice-category"
              className="block text-sm font-medium text-[#2f2f2f]"
            >
              공지 카테고리
            </Label>
            <Select value={noticeCategory} onValueChange={setNoticeCategory}>
              <SelectTrigger className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none">
                <SelectValue placeholder="카테고리 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maintainance">유지보수</SelectItem>
                <SelectItem value="Update">업데이트</SelectItem>
                <SelectItem value="Announcement">공지</SelectItem>
                <SelectItem value="Security">보안</SelectItem>
                <SelectItem value="Legal">법률</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="notice-status"
              className="block text-sm font-medium text-[#2f2f2f]"
            >
              공지 상태
            </Label>
            <Select value={noticeStatus} onValueChange={setNoticeStatus}>
              <SelectTrigger className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">새로운</SelectItem>
                <SelectItem value="In Progress">진행 중</SelectItem>
                <SelectItem value="Done">완료</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleCreateNotice}
            className="w-full bg-[#128100] hover:bg-[#128100]/90 text-white h-10 shadow-none"
            disabled={isLoading}
          >
            {isLoading ? "공지 작성 중..." : "공지 만들기"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

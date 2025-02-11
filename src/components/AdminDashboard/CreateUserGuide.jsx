import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Textarea } from "../ui/textarea";
import { supabase } from "@/lib/supabaseClient";

export function CreateUserGuide() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateGuide = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!title || !category || !description) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, role")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;
      if (!["admin", "super_admin"].includes(userData.role)) {
        throw new Error("You don't have permission to create user guides");
      }

      const { data, error } = await supabase
        .from("user_guides")
        .insert([
          {
            title,
            description,
            category,
            created_by: userData.id,
          },
        ])
        .select();

      if (error) throw error;

      console.log("User guide created successfully:", data);
      navigate("/admin/user-guide");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white h-screen">
      <Button
        variant="ghost"
        className="text-[#2f2f2f] hover:text-black"
        onClick={() => navigate(-1)}
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        사용자 가이드로 돌아가기
      </Button>

      <Card className="max-w-2xl mx-auto shadow-none mt-5">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-[#2f2f2f]">
            새 사용자 가이드 만들기
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreateGuide} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="category"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                카테고리
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none">
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Onboarding">온보딩</SelectItem>
                  <SelectItem value="Features">특징</SelectItem>
                  <SelectItem value="Support">지원</SelectItem>
                  <SelectItem value="Security">보안</SelectItem>
                  <SelectItem value="Personalization">개인화</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                가이드 제목
              </Label>

              <Input
                id="title"
                value={title}
                placeholder="가이드 제목"
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] h-10 text-sm focus:ring-1 focus:ring-[#128100] shadow-none"
                required
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="description"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                가이드 설명
              </Label>

              <Textarea
                id="description"
                value={description}
                placeholder="가이드 설명"
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] h-60 text-sm focus:ring-1 focus:ring-[#128100] shadow-none whitespace-pre-wrap"
                required
              />
            </div>

            {error && <p className="text-[#FF0000] text-sm">{error}</p>}
            <Button
              type="submit"
              className="h-10 text-sm shadow-none w-full bg-[#128100] hover:bg-[#128100]/90 text-white"
              disabled={isLoading}
            >
              {isLoading ? "가이드 생성 중..." : "가이드 만들기"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

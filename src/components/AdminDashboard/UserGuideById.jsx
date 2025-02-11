import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, Calendar, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export function UserGuideById() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
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
          throw new Error("You don't have permission to view this guide");
        }

        const { data, error } = await supabase
          .from("user_guides")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;

        if (!data) {
          throw new Error("Guide not found");
        }

        setGuide(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load guide. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchGuide();
  }, [id]);

  // Function to convert text with line breaks to paragraphs
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

  if (loading) {
    return <div className="p-4 text-center">로딩 중...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!guide) {
    return <div className="p-4 text-center">가이드를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="p-4 bg-[#ffffff] min-h-screen">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-[#2f2f2f] hover:text-[#000000]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> 사용자 가이드로 돌아가기
      </Button>
      <Card className="max-w-3xl mx-auto shadow-none">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2f2f2f]">
            {guide.title}
          </CardTitle>
          <div className="flex items-center text-[#6a6a6a] text-sm mt-2">
            <Calendar className="mr-2 h-4 w-4" />
            <span className="mr-4">
              {new Date(guide.created_at).toLocaleDateString()}
            </span>
            <BookOpen className="mr-2 h-4 w-4" />
            <span>{guide.category}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose max-w-none text-[#2f2f2f] text-sm">
            {formatDescription(guide.description)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

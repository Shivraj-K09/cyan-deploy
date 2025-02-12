import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";
import { BookOpenIcon, CalendarIcon, ChevronLeftIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export function GuideDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [guide, setGuide] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGuide = async () => {
      setLoading(true);
      try {
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

  // Function to format date as yyyy.mm.dd
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  if (loading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!guide) {
    return <div className="p-4 text-center">Guide not found.</div>;
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate("/guide")}
          className="flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            User Guide Details
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="p-4 bg-[#ffffff] min-h-screen">
          <Card className="max-w-3xl mx-auto shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-[#2f2f2f]">
                {guide.title}
              </CardTitle>
              <div className="flex items-center text-[#6a6a6a] text-sm mt-2">
                <div className="flex items-center text-[#6a6a6a] text-sm">
                  <CalendarIcon className="mr-1 h-4 w-4" />
                  <span className="mr-4 text-xs">
                    {formatDate(guide.created_at)}
                  </span>
                </div>

                <div className="flex items-center text-[#6a6a6a] text-sm">
                  <BookOpenIcon className="mr-2 h-4 w-4" />
                  <span>{guide.category}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-[#2f2f2f] text-sm">
                {formatDescription(guide.description)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

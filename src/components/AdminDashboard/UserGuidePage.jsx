import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronRightIcon,
  PlusIcon,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/lib/supabaseClient";
import LoadingSpinner from "../LoadingSpinner";

const ITEMS_PER_PAGE = 9;

export function UserGuidePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [guides, setGuides] = useState([]);
  const [displayedGuides, setDisplayedGuides] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { ref, inView } = useInView();

  const loadMoreGuides = useCallback(() => {
    const nextGuides = guides.slice(
      (page - 1) * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE
    );
    setDisplayedGuides((prev) => [...prev, ...nextGuides]);
    setPage((prev) => prev + 1);
  }, [guides, page]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadMoreGuides();
    }
  }, [inView, loadMoreGuides, isLoading]);

  useEffect(() => {
    setDisplayedGuides(guides.slice(0, ITEMS_PER_PAGE));
    setPage(2);
  }, [guides]);

  useEffect(() => {
    const fetchGuides = async () => {
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
          throw new Error("You don't have permission to view user guides");
        }

        const { data, error } = await supabase
          .from("user_guides")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGuides(data);
      } catch (error) {
        setError(error instanceof Error ? error : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  const filteredGuides = displayedGuides.filter((guide) =>
    guide && guide.title && guide.category
      ? guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  const handleCreateGuide = () => {
    navigate("/admin/user-guide/create");
  };

  if (error) {
    return (
      <div className="p-4 bg-white h-screen">
        <h3 className="text-xl font-bold text-[#ff0000]">Error</h3>
        <p className="text-[#2f2f2f]">{error.message}</p>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="pt-4 bg-white h-full">
      <div className="flex items-center gap-2 mb-6">
        <Input
          type="search"
          placeholder="가이드 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
        />
        <Button
          className="bg-[#128100] hover:bg-[#128100]/90 text-white px-3 py-1 h-10 text-sm"
          onClick={handleCreateGuide}
        >
          <PlusIcon className="w-5 h-5" />
          가이드 만들기
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-28">
        {filteredGuides.map((guide) => (
          <Card
            key={guide.id}
            className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden shadow-none"
            onClick={() => navigate(`/admin/user-guide/${guide.id}`)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2f2f2f] flex items-center justify-between w-full">
                {guide.title}
                <ChevronRightIcon className="h-4 w-4 text-[#6a6a6a]" />
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-[#6a6a6a] text-xs mb-1">
                <CalendarIcon className="w-4 h-4 mr-1" />
                <span>{new Date(guide.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center text-[#6a6a6a] text-xs">
                <BookOpenIcon className="w-4 h-4 mr-1" />
                <span>{guide.category}</span>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredGuides.length < guides.length && (
          <div ref={ref} className="flex justify-center mt-8">
            <Button
              variant="outline"
              className="text-[#128100] border-[#128100]"
            >
              더 불러오기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

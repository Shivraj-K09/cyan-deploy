import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import {
  BookOpenIcon,
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";

const ITEMS_PER_PAGE = 9;

const Guide = () => {
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
    const fetchGuides = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_guides")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setGuides(data || []);
        setDisplayedGuides(data?.slice(0, ITEMS_PER_PAGE) || []);
        setPage(2);
      } catch (error) {
        setError(
          error instanceof Error ? error : new Error("An error occurred")
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchGuides();
  }, []);

  useEffect(() => {
    if (inView && !isLoading && guides.length > displayedGuides.length) {
      loadMoreGuides();
    }
  }, [
    inView,
    isLoading,
    loadMoreGuides,
    guides.length,
    displayedGuides.length,
  ]);

  const filteredGuides = displayedGuides.filter((guide) =>
    guide && guide.title && guide.category
      ? guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.category.toLowerCase().includes(searchTerm.toLowerCase())
      : false
  );

  // Function to format date as yyyy.mm.dd
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  if (error) {
    return (
      <div className="p-4 bg-white h-screen">
        <h3 className="text-xl font-bold text-[#ff0000]">Error</h3>
        <p className="text-[#2f2f2f]">{error.message}</p>
      </div>
    );
  }

  if (isLoading && guides.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            User Guides
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4">
        <div className="bg-white h-full">
          <div className="flex items-center gap-2 py-3">
            <Input
              type="search"
              placeholder="Search Guides..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
            />
          </div>

          <div className="grid gap-2 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-28">
            {filteredGuides.map((guide) => (
              <Card
                key={guide.id}
                className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden shadow-none"
                onClick={() => navigate(`/guide/${guide.id}`)}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#2f2f2f] flex items-center justify-between w-full">
                    {guide.title}
                    <ChevronRightIcon className="h-4 w-4 text-[#6a6a6a]" />
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2">
                  <div className="flex items-center text-[#6a6a6a] text-xs mb-1">
                    <CalendarIcon className="w-4 h-4 mr-1" />
                    <span>{formatDate(guide.created_at)}</span>
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
                {isLoading ? (
                  <LoadingSpinner />
                ) : (
                  <Button
                    variant="outline"
                    className="text-[#128100] border-[#128100]"
                    onClick={loadMoreGuides}
                  >
                    Load More
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Guide;

import { CalendarIcon, ChevronLeftIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabaseClient";

const ITEMS_PER_PAGE = 9;

const UserNotices = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const { ref, inView } = useInView();

  const fetchNotices = useCallback(async () => {
    if (!hasMore) return;

    setIsLoading(true);
    try {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError) throw authError;

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;

      const { data, error } = await supabase
        .from("notices")
        .select("*")
        .order("created_at", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      if (error) throw error;

      setNotices((prevNotices) => [...prevNotices, ...data]);
      setHasMore(data.length === ITEMS_PER_PAGE);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error fetching notices:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, hasMore]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">New</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-[#FFA500] text-white shadow-none">
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

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button
          onClick={() => navigate("/profile")}
          className="flex items-center"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            Announcements
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 h-full">
          <div className="flex items-center gap-2 mb-6">
            <Input
              type="search"
              placeholder="Search Notice..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none text-sm h-10"
            />
          </div>

          {isLoading && notices.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>Loading Announcements...</p>
            </div>
          ) : filteredNotices.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <p>No Announcements found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
              {filteredNotices.map((notice) => (
                <Card
                  key={notice.id}
                  className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden relative shadow-none"
                  onClick={() => navigate(`/notices/${notice.id}`)}
                >
                  <CardHeader className="flex flex-row justify-between space-y-0 pb-2 items-center">
                    <CardTitle className="text-sm font-medium text-[#2f2f2f] flex justify-between w-full">
                      {notice.title}
                      <span className="ml-2">
                        {getStatusBadge(notice.status)}
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent>
                    <div className="flex items-center text-[#6a6a6a] text-xs mb-1">
                      <CalendarIcon className="w-3 h-3 mr-1" />
                      <span>
                        {new Date(notice.notice_date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-[#6a6a6a]">{notice.category}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && hasMore && <div ref={ref} className="h-10" />}

          {isLoading && notices.length > 0 && (
            <div className="flex justify-center mt-4">
              <p>Loading Announcements...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserNotices;

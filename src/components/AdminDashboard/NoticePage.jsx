import { CalendarIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { supabase } from "@/lib/supabaseClient";

const ITEMS_PER_PAGE = 9;

export function NoticePage() {
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
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (userError) throw userError;
      if (!["admin", "super_admin"].includes(userData.role)) {
        throw new Error("User does not have permission to view notices");
      }

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

  useEffect(() => {
    if (inView && !isLoading) {
      fetchNotices();
    }
  }, [inView, isLoading, fetchNotices]);

  const filteredNotices = notices.filter(
    (notice) =>
      notice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notice.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateNotice = () => {
    navigate("/admin/notice/create");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">새로운</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-[#FFA500] text-white shadow-none">진행 중</Badge>
        );
      case "Done":
        return (
          <Badge className="bg-[#6a6a6a] text-white shadow-none">완료</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-white h-full">
      <div className="flex items-center gap-2 mb-6">
        <Input
          type="search"
          placeholder="검색 공지..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none text-sm h-10"
        />
        <Button
          onClick={handleCreateNotice}
          className="bg-[#128100] hover:bg-[#128100]/90 text-white px-3 py-1 h-10 text-sm"
        >
          <PlusIcon className="w-4 h-4 mr-2" /> 공지 만들기
        </Button>
      </div>

      {isLoading && notices.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>공지사항을 로드하는 중...</p>
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>공지사항이 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-24">
          {filteredNotices.map((notice) => (
            <Card
              key={notice.id}
              className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden relative shadow-none"
              onClick={() => navigate(`/admin/notice/${notice.id}`)}
            >
              <CardHeader className="flex flex-row justify-between space-y-0 pb-2 items-center">
                <CardTitle className="text-sm font-medium text-[#2f2f2f] flex justify-between w-full">
                  {notice.title}
                  <span className="ml-2">{getStatusBadge(notice.status)}</span>
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
          <p>더 많은 공지를 불러오는 중...</p>
        </div>
      )}
    </div>
  );
}

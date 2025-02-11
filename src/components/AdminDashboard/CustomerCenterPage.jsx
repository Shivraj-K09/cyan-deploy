import { Badge } from "@/components/ui/badge";
import { CalendarIcon, MessageCircleIcon, UserIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useInView } from "react-intersection-observer";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

const ITEMS_PER_PAGE = 9;

export function CustomerCenterPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [inquiries, setInquiries] = useState([]);
  const [displayedInquiries, setDisplayedInquiries] = useState([]);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { ref, inView } = useInView();

  const fetchInquiries = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data: userRoleData, error: roleError } = await supabase
        .from("users")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (roleError) throw roleError;

      let query = supabase
        .from("customer_inquiries")
        .select(
          `
          id,
          title,
          content,
          status,
          created_at,
          users (
            id,
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (!["admin", "super_admin"].includes(userRoleData.role)) {
        query = query.eq("user_id", userData.user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      setInquiries(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInquiries();
  }, [fetchInquiries]);

  const getFilteredInquiries = useCallback((displayedInquiries, searchTerm) => {
    return displayedInquiries.filter(
      (inquiry) =>
        inquiry.users.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, []);

  const filteredInquiries = useMemo(
    () => getFilteredInquiries(displayedInquiries, searchTerm),
    [displayedInquiries, searchTerm, getFilteredInquiries]
  );

  const loadMoreInquiries = useCallback(() => {
    setDisplayedInquiries((prevDisplayed) => {
      const nextInquiries = inquiries.slice(
        prevDisplayed.length,
        prevDisplayed.length + ITEMS_PER_PAGE
      );

      return [...prevDisplayed, ...nextInquiries];
    });

    setPage((prevPage) => prevPage + 1);
  }, [inquiries]);

  useEffect(() => {
    if (inView && !isLoading) {
      loadMoreInquiries();
    }
  }, [inView, isLoading, loadMoreInquiries]);

  useEffect(() => {
    setDisplayedInquiries(inquiries.slice(0, ITEMS_PER_PAGE));
    setPage(2);
  }, [inquiries]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "New":
        return (
          <Badge className="bg-[#128100] text-white shadow-none">새로운</Badge>
        );
      case "In Progress":
        return (
          <Badge className="bg-[#FFA500] text-black shadow-none">진행 중</Badge>
        );
      case "Resolved":
        return (
          <Badge className="bg-[#6a6a6a] text-white border border-black/10 shadow-none">
            해결됨
          </Badge>
        );
      default:
        return null;
    }
  };

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="pt-4 bg-white h-full">
      <div className="flex items-center gap-2 mb-6">
        <Input
          type="search"
          placeholder="검색 문의..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-10 flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm shadow-none"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 grid-cols-1 pb-28">
        {filteredInquiries.map((inquiry) => (
          <Card
            key={inquiry.id}
            className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors shadow-none cursor-pointer overflow-hidden relative"
            onClick={() =>
              navigate(`/admin/customer-center/inquiry/${inquiry.id}`)
            }
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-[#2f2f2f] flex items-center justify-between w-full">
                <div className="flex items-center">
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>{inquiry.users.name}</span>
                </div>
                {getStatusBadge(inquiry.status)}
              </CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex items-center text-[#6a6a6a] text-xs mb-2">
                <CalendarIcon className="mr-2 h-3 w-3" />
                <span>{new Date(inquiry.created_at).toLocaleDateString()}</span>
              </div>

              <div className="flex items-start text-[#2f2f2f] text-sm">
                <MessageCircleIcon className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                <p className="line-clamp-2">{inquiry.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {!isLoading && filteredInquiries.length < inquiries.length && (
        <div ref={ref} className="flex justify-center mt-8">
          <Button
            onClick={loadMoreInquiries}
            variant="outline"
            className="text-[#128100] border-[#128100]"
          >
            더 불러오기
          </Button>
        </div>
      )}
    </div>
  );
}

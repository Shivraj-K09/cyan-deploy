import { supabase } from "@/lib/supabaseClient";
import { LinkIcon, PlusIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../LoadingSpinner";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";

const ITEMS_PER_PAGE = 7;

export function AdvertisementPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ads, setAds] = useState([]);
  const [displayedAds, setDisplayedAds] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { ref, inView } = useInView();

  const fetchAds = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAds(data);
      console.log(data);
    } catch (error) {
      console.error("Error fetching advertisements:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAds();
  }, [fetchAds]);

  const loadMoreAds = useCallback(() => {
    const filtered = ads.filter((ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const nextAds = filtered.slice(
      page * ITEMS_PER_PAGE,
      (page + 1) * ITEMS_PER_PAGE
    );
    setDisplayedAds((prev) => [...prev, ...nextAds]);
    setPage((prev) => prev + 1);
  }, [ads, page, searchTerm]);

  useEffect(() => {
    if (inView && !loading) {
      loadMoreAds();
    }
  }, [inView, loadMoreAds, loading]);

  useEffect(() => {
    setDisplayedAds(ads.slice(0, ITEMS_PER_PAGE));
    setPage(2);
  }, [ads]);

  useEffect(() => {
    const filtered = ads.filter((ad) =>
      ad.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayedAds(filtered.slice(0, ITEMS_PER_PAGE));
    setPage(2);
  }, [searchTerm, ads]);

  const handleCreateAd = () => {
    navigate("/admin/advertisement/create");
  };

  const handleAdClick = (adId) => {
    navigate(`/admin/advertisement/${adId}`);
  };

  if (loading) return <LoadingSpinner />;
  if (error)
    return <div className="p-4 text-center text-destructive">{error}</div>;

  return (
    <div className="p-4 bg-white h-screen">
      <div className="flex items-center gap-2 mb-6">
        <Input
          type="search"
          placeholder="광고 검색..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 text-sm shadow-none"
        />

        <Button
          onClick={handleCreateAd}
          className="bg-[#128100] hover:bg-[#128100]/90 text-white px-3 py-1 h-10 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          광고 만들기
        </Button>
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 pb-32">
        {displayedAds.map((ad) => (
          <Card
            key={ad.id}
            className="bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden relative shadow-none"
            onClick={() => handleAdClick(ad.id)}
          >
            <Badge
              className={`absolute top-2 right-2 z-10 ${
                ad.is_active ? "bg-[#128100]" : "bg-[#FF0000]"
              } text-white`}
            >
              {ad.is_active ? "활성" : "제거됨"}
            </Badge>

            <div className="relative w-full pt-[50%]">
              <img
                src={ad.image_url}
                alt={ad.title}
                className="absolute top-0 left-0 w-full h-full object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="tex-lg font-medium text-[#2f2f2f]">
                {ad.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-[#6a6a6a] text-sm flex justify-between w-full mb-5">
                <p>시작 날짜: {ad.start_date}</p>
                <p>종료 날짜: {ad.end_date}</p>
              </div>

              <div className="flex items-center text-[#6a6a6a] text-sm">
                <LinkIcon className="h-4 w-4 mr-1" />
                <a
                  href={ad.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  {ad.link}
                </a>
              </div>
            </CardContent>
          </Card>
        ))}
        {displayedAds.length <
          ads.filter((ad) =>
            ad.title.toLowerCase().includes(searchTerm.toLowerCase())
          ).length && (
          <div ref={ref} className="flex justify-center mt-8">
            <Button
              onClick={loadMoreAds}
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

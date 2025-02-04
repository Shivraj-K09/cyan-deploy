import {
  CalendarIcon,
  ChevronLeftIcon,
  LinkIcon,
  PlusIcon,
  XIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { supabase } from "@/lib/supabaseClient";
import LoadingSpinner from "../LoadingSpinner";
import { toast } from "sonner";

export function AdvertisementDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAd = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("advertisements")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setAd(data);
        console.log(data);
      } catch (error) {
        console.error("Error fetching advertisement:", error);
        setError("Error fetching advertisement. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id]);

  const handleAdStatusChange = async (newStatus) => {
    if (ad) {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("advertisements")
          .update({ is_active: newStatus })
          .eq("id", ad.id)
          .single();

        if (error) throw error;
        setAd({ ...ad, is_active: newStatus });
        toast.success("Advertisement status updated successfully", {
          position: "top-center",
        });
        console.log(data);
        navigate(`/admin/advertisement`);
      } catch (error) {
        console.error("Error updating advertisement:", error);
        setError("Error updating advertisement. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) return <LoadingSpinner />;

  if (error) {
    return <div className="p-4 text-center text-destructive">{error}</div>;
  }

  if (!ad) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  return (
    <div className="p-4 bg-white h-screen">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-[#2f2f2f] hover:text-[#000]"
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Go Back
      </Button>

      <Card className="bg-[#ebebeb] overflow-hidden relative shadow-none">
        <div className="relative w-full pt-[50%]">
          <img
            src={ad.image_url}
            alt={ad.title}
            className="w-full h-full object-cover absolute top-0 left-0"
          />
        </div>

        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-xl font-semibold text-[#2f2f2f]">
              {ad.title}
            </CardTitle>
            <Badge
              variant={ad.is_active ? "default" : "destructive"}
              className={`${
                ad.is_active ? "bg-[#128100]" : "bg-[#ff0000]"
              } text-white transition-colors duration-200 ease-in-out`}
            >
              {ad.is_active ? "Active" : "Removed"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          <div className="flex items-center text-[#6a6a6a] text-sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>
              {ad.start_date} - {ad.end_date}
            </span>
          </div>

          <div className="flex items-center text-[#128100] text-sm">
            <LinkIcon className="mr-2 h-4 w-4" />
            <a
              href={ad.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#128100] text-sm"
            >
              {ad.link}
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">
            <Button
              onClick={() => handleAdStatusChange(false)}
              className={`w-full ${
                ad.is_active
                  ? "bg-[#ff0000] hover:bg-[#ff0000]/90 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-colors duration-300 ease-in-out font-semibold rounded-lg text-sm shadow-md hover:shadow-lg h-10`}
              disabled={!ad.is_active || loading}
            >
              <span className="flex items-center justify-center">
                <XIcon className="h-4 w-4 mr-2" />
                Remove Ad
              </span>
            </Button>
            <Button
              onClick={() => handleAdStatusChange(true)}
              className={`w-full ${
                !ad.is_active
                  ? "bg-[#128100] hover:bg-[#128100]/90 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition-colors duration-300 ease-in-out font-semibold rounded-lg text-sm shadow-md hover:shadow-lg h-10`}
              disabled={ad.is_active || loading}
            >
              <span className="flex items-center justify-center">
                <PlusIcon className="h-4 w-4 mr-2" />
                Activate Ad
              </span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

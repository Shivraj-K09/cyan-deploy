import {
  CalendarIcon,
  ChevronLeftIcon,
  ClockIcon,
  LinkIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import LoadingSpinner from "../LoadingSpinner";

export function EventsDetails() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setEvent(data);
        console.log("Event details fetched:", data);
      } catch (error) {
        console.error("Error fetching event details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

  const isExpired = event ? new Date(event.event_date) < new Date() : false;

  if (isLoading) return <LoadingSpinner />;

  if (error) {
    return <div className="p-4 text-destructive">{error}</div>;
  }

  if (!event) {
    return <div className="p-4 text-destructive">Event not found</div>;
  }

  return (
    <div className="p-4 bg-white h-screen">
      <Button
        variant="ghost"
        className="mb-4 text-[#2f2f2f] hover:text-black"
        onClick={() => navigate("/admin/events")}
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        뒤로 가기
      </Button>

      <Card className="bg-[#ebebb] overflow-hidden relative shadow-none">
        {isExpired && (
          <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-10">
            <Badge
              variant="destructive"
              className="bg-[#ff0000] text-white text-xs absolute top-5 left-[-40px] transform -rotate-45 w-[140px] text-center flex justify-center items-center"
            >
              만료됨
            </Badge>
          </div>
        )}

        <div className="relative w-full h-[200px] md:h-[300px]">
          <img
            src={event.image_url}
            alt={event.title}
            className="w-full h-full object-cover absolute inset-0"
          />
        </div>

        <CardHeader>
          <CardTitle className="text-xl font-semibold text-[#2f2f2f]">
            {event.title}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center text-[#6a6a6a] text-sm">
            <CalendarIcon className="mr-2 h-4 w-4" />
            <span>{event.event_date}</span>
          </div>

          <div className="flex items-center text-[#6a6a6a] text-sm">
            <ClockIcon className="mr-2 h-4 w-4" />
            <span>
              {event.start_time} - {event.end_time}
            </span>
          </div>

          <p className="text-[#2f2f2f] text-sm">{event.description}</p>

          {event.event_link && (
            <div className="flex items-center">
              <LinkIcon className="mr-2 h-4 w-4 text-[#128100]" />
              <a
                href={event.event_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#128100] text-sm"
              >
                이벤트 웹사이트 링크
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

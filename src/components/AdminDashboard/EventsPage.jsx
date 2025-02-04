import {
  CalendarIcon,
  ChevronRightIcon,
  MapPinIcon,
  PlusIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import { useNavigate } from "react-router-dom";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { supabase } from "@/lib/supabaseClient";

const ITEMS_PER_PAGE = 6;

export function EventsPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0); // Start at 0 for initial load
  const { ref, inView } = useInView();

  // Initial fetch on component mount
  useEffect(() => {
    const fetchInitialEvents = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true })
          .range(0, ITEMS_PER_PAGE - 1);

        if (error) {
          throw error;
        }

        console.log("Initial events fetched:", data); // Debug log
        setEvents(data || []);
        setHasMore(data?.length === ITEMS_PER_PAGE);
        setPage(1); // Set to 1 after initial load
      } catch (error) {
        console.error("Error fetching initial events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialEvents();
  }, []);

  // Fetch more events when scrolling
  useEffect(() => {
    const fetchMoreEvents = async () => {
      if (!hasMore || page === 0) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("events")
          .select("*")
          .order("event_date", { ascending: true })
          .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

        if (error) {
          throw error;
        }

        console.log("More events fetched:", data); // Debug log
        if (data) {
          setEvents((prev) => [...prev, ...data]);
          setHasMore(data.length === ITEMS_PER_PAGE);
        }
      } catch (error) {
        console.error("Error fetching more events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (inView && !isLoading && page > 0) {
      fetchMoreEvents();
      setPage((prev) => prev + 1);
    }
  }, [inView, isLoading, hasMore, page]);

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateEvent = () => {
    navigate("/admin/event/create");
  };

  const isExpired = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate < today;
  };

  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2">
        <Input
          type="search"
          placeholder="Search Events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
        />
        <Button
          className="bg-[#128100] hover:bg-[#128100]/90 text-white px-3 py-1 h-10 text-sm"
          onClick={handleCreateEvent}
        >
          <PlusIcon className="size-4" />
          Create Event
        </Button>
      </div>

      {isLoading && events.length === 0 ? (
        <div className="flex justify-center mt-5">
          <p>Loading events...</p>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="flex justify-center mt-5">
          <p>No events found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 pb-28 mt-5">
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="shadow-none bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden relative"
              onClick={() => navigate(`/admin/events/${event.id}`)}
            >
              {isExpired(event.event_date) && (
                <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20">
                  <Badge
                    variant="destructive"
                    className="bg-[#ff0000] text-white text-xs absolute top-5 left-[-30px] transform -rotate-45 w-[140px] text-center flex items-center justify-center"
                  >
                    Expired
                  </Badge>
                </div>
              )}

              <div className="relative w-full h-[150px]">
                <img
                  src={event.image_url || "/placeholder.svg"}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>

              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#2f2f2f]">
                  {event.title}
                </CardTitle>
                <ChevronRightIcon className="h-4 w-4 text-[#6a6a6a]" />
              </CardHeader>

              <CardContent>
                <div className="flex justify-between ic w-full gap-2 mt-2">
                  <div className="flex items-center text-[#2f2f2f] text-xs mb-1">
                    <CalendarIcon className="mr-1 h-4 w-4" />
                    <span>
                      {new Date(event.event_date).toLocaleDateString()}
                    </span>
                  </div>

                  {/* <div className="flex items-center text-[#2f2f2f] text-xs">
                    <MapPinIcon className="mr-1 h-4 w-4" />
                    <span className="text-[#6a6a6a]">
                      {event.location || "N/A"}
                    </span>
                  </div> */}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && hasMore && <div ref={ref} className="h-10" />}

      {isLoading && events.length > 0 && (
        <div className="flex justify-center mt-5">
          <p>Loading more events...</p>
        </div>
      )}
    </div>
  );
}

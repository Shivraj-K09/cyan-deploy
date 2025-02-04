"use client";

import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 6;

export function UserEvents() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
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
        setPage(1);
      } catch (error) {
        console.error("Error fetching initial events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialEvents();
  }, [supabase]);

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
  }, [inView, isLoading, hasMore, page, supabase]);

  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  console.log("Filtered events:", filteredEvents); // Debug log

  const isExpired = (date) => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate < today;
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
            Events
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 h-full">
          <div className="flex items-center gap-2">
            <Input
              type="search"
              placeholder="Search Events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-grow bg-white border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
            />
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-28 mt-2">
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  className="shadow-none bg-[#ebebeb] hover:bg-[#d9d9d9] transition-colors cursor-pointer overflow-hidden relative"
                  onClick={() => navigate(`/events/${event.id}`)}
                >
                  {isExpired(event.event_date) && (
                    <div className="absolute top-0 left-0 w-24 h-24 overflow-hidden z-20">
                      <Badge
                        variant="destructive"
                        className="bg-red-500 text-white text-xs absolute top-5 left-[-30px] transform -rotate-45 w-[140px] text-center flex items-center justify-center"
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
                    <CardTitle className="text-sm font-medium text-gray-900">
                      {event.title}
                    </CardTitle>
                    <ChevronRightIcon className="h-4 w-4 text-gray-500" />
                  </CardHeader>

                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="flex justify-between items-center w-full gap-2 mt-2">
                      <div className="flex items-center text-gray-700 text-xs">
                        <CalendarIcon className="mr-1 h-4 w-4" />
                        <span>
                          {new Date(event.event_date).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-700 text-xs">
                        <span>
                          {event.start_time} - {event.end_time}
                        </span>
                      </div>
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
      </div>
    </div>
  );
}

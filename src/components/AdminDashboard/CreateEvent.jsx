import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { CalendarIcon, ChevronLeftIcon, UploadIcon, XIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { supabase } from "@/lib/supabaseClient";

export function CreateEvent() {
  const navigate = useNavigate();
  const [eventImage, setEventImage] = useState(null);
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventLink, setEventLink] = useState("");
  const [eventDate, setEventDate] = useState();
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isHovering, setIsHovering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEventImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateEvent = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error("No authenticated user found");

      let imageUrl = null;

      if (eventImage) {
        const filePath = `${user.id}/${Date.now()}_${eventImage.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("events")
          .upload(filePath, eventImage);

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("events").getPublicUrl(filePath);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from("events")
        .insert([
          {
            title: eventTitle,
            description: eventDescription,
            event_date: eventDate,
            start_time: startTime,
            end_time: endTime,
            event_link: eventLink,
            image_url: imageUrl,
            created_by: user.id, // Use user.id here
          },
        ])
        .select();

      if (error) throw error;

      console.log("Event created successfully:", data);
      navigate("/admin/events");
    } catch (error) {
      console.error("Error creating event:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let i = 0; i < 24; i++) {
      for (let j = 0; j < 60; j += 30) {
        const hour = i % 12 || 12;
        const period = i < 12 ? "AM" : "PM";
        const minute = j.toString().padStart(2, "0");
        options.push(`${hour}:${minute} ${period}`);
      }
    }
    return options;
  };

  return (
    <div className="p-4 bg-white h-screen">
      <Button
        variant="ghost"
        className="mb-4 text-[#2f2f2f] hover:text-black"
        onClick={() => navigate(-1)}
      >
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Go Back
      </Button>

      <div className="pb-28">
        <Card className="max-w-2xl mx-auto shadow-none">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#2f2f2f]">
              Create New Event
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label className="block text-sm font-medium text-[#2f2f2f]">
                Event Image
              </Label>

              <div
                className="relative w-full pt-[56.25%] bg-[#f0f0f0] rounded-lg overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Input
                  type="file"
                  id="event-image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                {eventImage ? (
                  <img
                    src={URL.createObjectURL(eventImage) || "/placeholder.svg"}
                    alt={eventTitle}
                    className="w-full h-full absolute inset-0 object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center absolute inset-0">
                    <UploadIcon className="h-12 w-12 text-[#6a6a6a]" />
                  </div>
                )}

                {eventImage && (
                  <div
                    className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md cursor-pointer z-20 transition-opacity duration-300 ease-in-out border border-gray-300"
                    style={{ opacity: isHovering ? 1 : 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setEventImage(null);
                    }}
                  >
                    <XIcon className="h-4 w-4 text-[#FF0000]" />
                  </div>
                )}
              </div>
              <p className="text-xs text-[#6a6a6a] text-center mt-2">
                Click or drag and drop to upload a banner image
              </p>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="event-title"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Event Title
              </Label>
              <Input
                id="event-title"
                type="text"
                placeholder="Event Title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="event-date"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Event Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal h-10 shadow-none",
                      !eventDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="h-4 w-4" />
                    {eventDate ? (
                      format(eventDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={eventDate}
                    onSelect={setEventDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="start-time"
                  className="block text-sm font-medium text-[#2f2f2f]"
                >
                  Start Time
                </Label>

                <Select onValueChange={(value) => setStartTime(value)}>
                  <SelectTrigger className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm">
                    <SelectValue placeholder="Select a start time" />
                  </SelectTrigger>

                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="end-time"
                  className="block text-sm font-medium text-[#2f2f2f]"
                >
                  End Time
                </Label>

                <Select onValueChange={(value) => setEndTime(value)}>
                  <SelectTrigger className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm">
                    <SelectValue placeholder="Select an end time" />
                  </SelectTrigger>

                  <SelectContent>
                    {generateTimeOptions().map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="event-description"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Event Description
              </Label>
              <Textarea
                id="event-description"
                placeholder="Event Description"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none h-32 text-sm"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="event-link"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Event Link
              </Label>

              <Input
                id="event-link"
                type="url"
                placeholder="Event Link"
                value={eventLink}
                onChange={(e) => setEventLink(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] h-10 shadow-none text-sm"
              />
            </div>

            <Button
              onClick={handleCreateEvent}
              className="w-full bg-[#128100] hover:bg-[#128100]/90 text-white h-10 text-sm"
              disabled={isLoading}
            >
              {isLoading ? "Creating Event..." : "Create Event"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

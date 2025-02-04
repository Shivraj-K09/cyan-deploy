import { supabase } from "@/lib/supabaseClient";
import { ChevronLeft, FolderUpIcon, Upload, X } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export function CreateAdvertisement() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isHovering, setIsHovering] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data: imageData, error: imageError } = await supabase.storage
        .from("advertisements")
        .upload(`${Date.now()}_${image.name}`, image);

      if (imageError) throw imageError;

      const imageUrl = supabase.storage
        .from("advertisements")
        .getPublicUrl(imageData.path).data.publicUrl;

      const { data, error } = await supabase.from("advertisements").insert({
        title,
        image_url: imageUrl,
        link,
        start_date: startDate,
        end_date: endDate,
        is_active: true,
        created_by: (await supabase.auth.getUser()).data.user.id,
      });

      if (error) throw error;
      navigate("/admin/advertisement");
      toast.success("Advertisement created successfully", {
        position: "top-center",
      });
      console.log(data);
    } catch (error) {
      console.error("Error submitting advertisement:", error);
      toast.error("Error submitting advertisement. Please try again.", {
        position: "top-center",
      });
    }
  };

  return (
    <div className="p-4 bg-[#ffffff] min-h-screen">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-4 text-[#2f2f2f] hover:text-[#000000]"
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Back to Advertisements
      </Button>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-[#2f2f2f]">
            Create New Advertisement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Advertisement Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter advertisement title"
                className="w-full border-[#d8d8d8] text-sm focus:border-[#128100] focus:ring-1 focus:ring-[#128100] shadow-none"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="image"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Advertisement Image
              </Label>
              <div
                className="relative w-full pt-[56.25%] bg-[#f0f0f0] rounded-lg overflow-hidden cursor-pointer"
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
              >
                <Input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                />
                {image ? (
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt="Advertisement preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Upload className="h-12 w-12 text-[#6a6a6a]" />
                  </div>
                )}
                {image && (
                  <div
                    className={`absolute top-2 right-2 p-1 bg-white rounded-full shadow-md cursor-pointer z-20 transition-opacity duration-300 ${
                      isHovering ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setImage(null);
                    }}
                  >
                    <X className="h-4 w-4 text-[#FF0000]" />
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="link"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Advertisement Link
              </Label>
              <Input
                id="link"
                type="url"
                value={link}
                placeholder="Enter advertisement link"
                onChange={(e) => setLink(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="startDate"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm"
                required
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="endDate"
                className="block text-sm font-medium text-[#2f2f2f]"
              >
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full border-[#d8d8d8] focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#128100] hover:bg-[#128100]/90 text-white h-10"
            >
              Create Advertisement
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

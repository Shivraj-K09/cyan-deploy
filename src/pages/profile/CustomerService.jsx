import { ChevronsLeft, FileText, ImageIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import { Textarea } from "../../components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

const CustomerService = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [isLoadingInquiries, setIsLoadingInquiries] = useState(true);

  useEffect(() => {
    fetchUserInquiries();
  }, []);

  const fetchUserInquiries = async () => {
    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      const { data, error } = await supabase
        .from("customer_inquiries")
        .select(
          `
          *,
          users (
            name
          )
        `
        )
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Group inquiries by status
      const grouped = data.reduce((acc, inquiry) => {
        const status = inquiry.status || "New";
        if (!acc[status]) {
          acc[status] = [];
        }
        acc[status].push(inquiry);
        return acc;
      }, {});

      // Convert to array format
      const formattedInquiries = Object.entries(grouped).map(
        ([status, items]) => ({
          status: getStatusText(status),
          items: items.map((item) => ({
            id: item.id,
            title: item.title,
            preview:
              item.content.substring(0, 50) +
              (item.content.length > 50 ? "..." : ""),
            status: item.status,
            hasResponse: !!item.admin_response,
          })),
        })
      );

      setInquiries(formattedInquiries);
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      toast.error("Failed to load inquiries");
    } finally {
      setIsLoadingInquiries(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "New":
        return "진행중";
      case "In Progress":
        return "진행중";
      case "Resolved":
        return "답변 완료";
      default:
        return "진행중";
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) throw userError;

      let imageUrl = null;
      if (image) {
        const fileExt = image.name.split(".").pop();
        const fileName = `${userData.user.id}/${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("inquiry-images")
          .upload(fileName, image);

        if (error) throw error;

        const {
          data: { publicUrl },
        } = supabase.storage.from("inquiry-images").getPublicUrl(fileName);

        imageUrl = publicUrl;
      }

      const { data, error } = await supabase.from("customer_inquiries").insert([
        {
          user_id: userData.user.id,
          title,
          content,
          image_url: imageUrl,
          status: "New",
        },
      ]);

      if (error) throw error;

      toast.success("문의가 성공적으로 제출되었습니다");
      setTitle("");
      setContent("");
      setImage(null);
      await fetchUserInquiries();
    } catch (error) {
      toast.error("문의 제출 중 오류가 발생했습니다");
      console.error("Error submitting inquiry:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInquiryClick = (id) => {
    navigate(`/customer-service/${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <button onClick={() => navigate("/profile")} className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          고객센터
        </h1>
      </div>

      <Tabs defaultValue="inquiries" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-12 p-0 bg-transparent">
          <TabsTrigger
            value="inquiries"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
          >
            내 문의내역
          </TabsTrigger>
          <TabsTrigger
            value="new"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
          >
            문의하기
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inquiries" className="mt-0">
          {isLoadingInquiries ? (
            <div className="flex justify-center items-center h-[calc(100vh-8.5rem)]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8.5rem)] text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p>진행중인 문의가 없습니다.</p>
            </div>
          ) : (
            <>
              {inquiries.map((section, index) => (
                <div key={index}>
                  {index > 0 && (
                    <hr className="border-t border-gray-200 my-4" />
                  )}
                  <div className="px-4 py-3 font-bold">{section.status}</div>
                  <div className="flex flex-col">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className="px-4 py-5 border-b border-gray-200 text-left w-full hover:bg-gray-50 transition-colors"
                        onClick={() => handleInquiryClick(item.id)}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold">{item.title}</h3>
                          {item.hasResponse && (
                            <Badge className="bg-[#128100] text-white">
                              답변완료
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{item.preview}</p>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>

        <TabsContent value="new" className="mt-0">
          <form className="p-4 space-y-6" onSubmit={handleSubmit}>
            <div>
              <h2 className="text-lg font-bold mb-4">사진첨부</h2>
              <Label
                htmlFor="image-upload"
                className="w-24 h-24 bg-gray-100 rounded-lg border flex items-center justify-center cursor-pointer"
              >
                {image ? (
                  <img
                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                    alt="inquiry image"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <ImageIcon className="w-8 h-8 text-gray-400" />
                )}
              </Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-2">제목</h2>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="제목을 작성해주세요"
                className="w-full border-0 border-b border-gray-200 rounded-none px-0 shadow-none focus-visible:ring-0 focus-visible:border-black text-sm h-10"
                required
              />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">내용</h2>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="내용을 입력해주세요."
                className="min-h-[200px] border shadow-none resize-none text-sm"
                required
              />
            </div>

            <div className="pt-4 flex justify-center">
              <Button
                type="submit"
                className="w-48 h-14 bg-[#008C1F] hover:bg-[#007819] text-white"
                disabled={isLoading}
              >
                {isLoading ? "제출 중..." : "문의하기"}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerService;

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

const CustomerService = () => {
  // For demo purposes, we'll keep the hardcoded inquiries but add a flag to toggle empty state
  const showEmptyState = false;

  const inquiries = [
    {
      id: 1,
      status: "진행중",
      items: [
        {
          title: "제품 환불 해주세요.",
          preview: "안녕하세요. 쇼핑에서 물건을 샀는데 취소하고 싶어서...",
        },
        {
          title: "제품 환불 해주세요.",
          preview: "안녕하세요. 쇼핑에서 물건을 샀는데 취소하고 싶어서...",
        },
      ],
    },
    {
      id: 2,
      status: "답변 완료",
      items: [
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
        {
          title: "구독 해지 부탁드립니다.",
          preview: "안녕하세요. 쇼구독 해지하고 싶어 문의 드립니다...",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/profile" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          고객센터
        </h1>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="new" className="w-full">
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
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-8.5rem)] text-gray-400">
              <FileText className="w-12 h-12 mb-4" />
              <p>진행중인 문의가 없습니다.</p>
            </div>
          ) : (
            <>
              {inquiries.map((section, index) => (
                <div key={section.id}>
                  {index > 0 && (
                    <hr className="border-t border-gray-200 my-4" />
                  )}
                  <div className="px-4 py-3 font-bold">{section.status}</div>
                  <div className="flex flex-col">
                    {section.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="px-4 py-5 border-b border-gray-200"
                      >
                        <h3 className="font-bold mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.preview}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </TabsContent>
        <TabsContent value="new" className="mt-0">
          <form className="p-4 space-y-6">
            <div>
              <h2 className="text-lg font-bold mb-4">사진첨부</h2>
              <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-gray-400" />
              </div>
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">제목</h2>
              <Input
                placeholder="제목을 작성해주세요"
                className="w-full border-0 border-b border-gray-200 rounded-none px-0 h-12 shadow-none focus-visible:ring-0 focus-visible:border-black"
              />
            </div>

            <div>
              <h2 className="text-lg font-bold mb-4">내용</h2>
              <Textarea
                placeholder="내용을 입력해주세요."
                className="min-h-[200px] border rounded-xl p-4 resize-none"
              />
            </div>

            <div className="pt-4 flex justify-center">
              <Button className="w-48 h-14 bg-[#008C1F] hover:bg-[#007819] text-white">
                문의하기
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerService;

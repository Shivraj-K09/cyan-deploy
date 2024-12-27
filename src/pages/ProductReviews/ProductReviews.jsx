import { ChevronLeft, ChevronsLeft, Fish, MoreVertical } from "lucide-react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const ProductReviews = () => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState(null);

  // Toggle this to show/hide empty states
  const showEmptyState = false;

  const products = [
    {
      id: 1,
      category: "[낚시상점]",
      name: "어떤 것이든 다 낚는 낚시대",
      description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
      price: 170000,
    },
    {
      id: 2,
      category: "[낚시상점]",
      name: "어떤 것이든 다 낚는 낚시대",
      description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
      price: 170000,
    },
    {
      id: 3,
      category: "[낚시상점]",
      name: "어떤 것이든 다 낚는 낚시대",
      description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
      price: 170000,
    },
    {
      id: 4,
      category: "[낚시상점]",
      name: "어떤 것이든 다 낚는 낚시대",
      description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
      price: 170000,
    },
    {
      id: 5,
      category: "[낚시상점]",
      name: "어떤 것이든 다 낚는 낚시대",
      description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
      price: 170000,
    },
  ];

  const writtenReviews = [
    {
      id: 1,
      category: "[낚시상점]",
      title: "어떤 것이든 다 낚는 낚시대",
      content: [
        "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 딱 맞아 장시간 낚시에도 피로감이 적어요.",
        "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
      ],
    },
    {
      id: 2,
      category: "[낚시상점]",
      title: "어떤 것이든 다 낚는 낚시대",
      content: [
        "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 딱 맞아 장시간 낚시에도 피로감이 적어요.",
        "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
      ],
    },
    {
      id: 3,
      category: "[낚시상점]",
      title: "어떤 것이든 다 낚는 낚시대",
      content: [
        "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 딱 맞아 장시간 낚시에도 피로감이 적어요.",
        "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
      ],
    },
    {
      id: 4,
      category: "[낚시상점]",
      title: "어떤 것이든 다 낚는 낚시대",
      content: [
        "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 딱 맞아 장시간 낚시에도 피로감이 적어요.",
        "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
      ],
    },
  ];

  const handleDeleteClick = (reviewId) => {
    setSelectedReviewId(reviewId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    // Handle delete logic here
    setIsDeleteDialogOpen(false);
    setSelectedReviewId(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="flex items-center px-4 py-3 border-b border-gray-200">
        <a href="/profile" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          제품 리뷰
        </h1>
      </div>

      {/* User Profile */}
      <div className="flex items-center px-4 py-6 border-b border-gray-200">
        <div className="w-[60px] h-[60px] bg-gray-200 rounded-full mr-4" />
        <div>
          <div className="flex items-center gap-1">
            <h2 className="text-lg font-bold">봉어잡자</h2>
            <span className="text-green-600">회원님</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="p-6 gap-6 w-[90%] max-w-[320px] rounded-xl">
          <VisuallyHidden>
            <DialogHeader>
              <DialogTitle></DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
          </VisuallyHidden>
          <div>
            <h2 className="text-xl text-center font-bold">
              리뷰를 삭제하시겠습니까?
            </h2>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-12 text-base font-medium"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              취소
            </Button>
            <Button
              className="flex-1 h-12 bg-[#008C1F] hover:bg-[#007819] text-base font-medium"
              onClick={handleConfirmDelete}
            >
              삭제
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tabs */}
      <Tabs defaultValue="write" className="w-full">
        <TabsList className="w-full grid grid-cols-2 h-12 p-0 bg-transparent">
          <TabsTrigger
            value="write"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
          >
            리뷰 쓰기 {showEmptyState ? "(0)" : "(9)"}
          </TabsTrigger>
          <TabsTrigger
            value="written"
            className="data-[state=active]:border-b-2 data-[state=active]:border-black rounded-none h-full"
          >
            작성한 리뷰 {showEmptyState ? "(0)" : "(7)"}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="write" className="mt-0">
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center py-40 text-gray-400">
              <p>작성할 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex p-4 border-b border-gray-200"
                >
                  <div className="w-20 h-20 bg-gray-200 rounded-md mr-4 flex-shrink-0" />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {product.category}
                      </p>
                      <h3 className="font-bold text-sm mb-1">{product.name}</h3>
                      <p className="text-xs text-gray-600 mb-2 whitespace-pre-line">
                        {product.description}
                      </p>
                      <p className="text-green-600 font-bold text-sm">
                        {product.price.toLocaleString()}원
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <a
                      href={`/product-reviews/write`}
                      className="text-blue-500 text-xs font-semibold ml-auto"
                    >
                      작성하기
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="written" className="mt-0">
          {showEmptyState ? (
            <div className="flex flex-col items-center justify-center py-40 text-gray-400">
              <p>작성한 리뷰가 없습니다.</p>
            </div>
          ) : (
            <div className="flex flex-col">
              {writtenReviews.map((review) => (
                <div key={review.id} className="p-4 border-b border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-semibold text-sm">
                      {review.category} {review.title}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <MoreVertical className="w-5 h-5 text-black flex-shrink-0" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>리뷰 수정</DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDeleteClick(review.id)}
                        >
                          리뷰 삭제
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-md flex-shrink-0" />
                    <div className="flex-1 text-xs text-gray-600 space-y-1 overflow-hidden pr-6">
                      {review.content.map((paragraph, index) => (
                        <p key={index} className="line-clamp-2">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductReviews;

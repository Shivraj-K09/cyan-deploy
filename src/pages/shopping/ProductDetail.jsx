import { useState, useEffect } from "react";
import { FiShare2 } from "react-icons/fi";
import { Link, useParams } from "react-router-dom";
import { FaChevronRight } from "react-icons/fa";
import { supabase } from "@/lib/supabaseClient";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ShoppingCartIcon } from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [api, setApi] = React.useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error("Error fetching product:", error);
      } else {
        setProduct(data);
      }
    };

    console.log("Fetching Product Detail");

    fetchProduct();
  }, [id]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const feedbackSections = [
    {
      key: 1,
      id: "1",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
    {
      key: 2,
      id: "2",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
    {
      key: 3,
      id: "3",
      miniTitle: "낚시박사",
      title: "만족",
      subtitle: "[낚시상점] 어떤 것이든 다 낚는 낚시대",
      content1: "이번에 구매한 낚시대는 정말 만족스러웠습니다.",
      content2:
        "가벼우면서도 견고하고, 손에 쥐는 느낌을 닥 맞아 장시간 낚시에도 피로감이 적어요.",
      content3: "장시간 낚시에도 문제 없습니다. 정말 좋아.....",
    },
  ];

  if (!product) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen">
      {/* Navigation Bar */}
      <div className="flex justify-between items-center p-4 border-b">
        <Link to="/shopping" className="text-gray-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Link>
        <h1 className="text-lg font-semibold">뒤로</h1>
        <button className="text-gray-600">
          <FiShare2 className="h-6 w-6" />
        </button>
      </div>

      {/* Carousel */}
      <div className="mt-4 mx-4">
        <Carousel className="relative" opts={{ loop: true }} setApi={setApi}>
          <CarouselContent>
            {product.image_urls.map((image, index) => (
              <CarouselItem key={index}>
                <div className="aspect-square bg-gray-200 rounded-2xl overflow-hidden">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 transform -translate-y-1/2" />
          <CarouselNext className="absolute right-2 top-1/2 transform -translate-y-1/2" />
        </Carousel>
        {/* Dots */}
        <div className="flex justify-center gap-1 mt-2">
          {product.image_urls.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-colors",
                index === current ? "bg-gray-800" : "bg-gray-300"
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      </div>

      {/* Product Description */}
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-2">{product.name}</h2>
        <div className="flex items-center gap-2">
          <p className="text-3xl font-bold mb-4">{product.price}원</p>
          <p className="text-xl line-through text-gray-600">
            {product.original_price}원
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex text-sm">
            <div className="w-[80px] flex-shrink-0 text-gray-600">
              [제품설명]
            </div>
            <div className="flex-1">{product.description}</div>
          </div>

          <div className="flex text-sm">
            <div className="w-[80px] flex-shrink-0 text-gray-600">[브랜드]</div>
            <div className="flex-1">{product.brand}</div>
          </div>

          <div className="flex text-sm">
            <div className="w-[80px] flex-shrink-0 text-gray-600">[제조사]</div>
            <div className="flex-1">{product.manufacturer}</div>
          </div>

          <div className="flex text-sm">
            <div className="w-[80px] flex-shrink-0 text-gray-600">[배송비]</div>
            <div className="flex-1">{product.delivery_fee}원</div>
          </div>
        </div>

        <div className="flex mt-7 gap-4 items-center justify-center">
          <Button
            variant="outline"
            className="h-10 rounded-none border-[#128100] px-8"
          >
            <ShoppingCartIcon className="h-5 w-5 stroke-[#128100]" />
            장바구니
          </Button>
          <Button className="h-10 bg-[#128100] rounded-none px-10">
            구매하기
          </Button>
        </div>
      </div>

      <div className="bg-gray-300 w-full h-1 my-4" />

      {/* Feedback Sections */}
      <p className="ml-4 text-xl font-bold">상세페이지</p>
      <div className="p-4 space-y-4 pb-20">
        {feedbackSections.map((section) => (
          <div key={section.id}>
            <Link to="/product-review">
              <div className="w-full h-[0.6px] bg-gray-300 my-1" />
              <div className="rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="py-2">
                    <p className="text-[10px]">{section.miniTitle}</p>
                    <p className="font-semibold text-xl text-left">
                      {section.title}
                    </p>
                    <p className="text-l text-left">{section.subtitle}</p>
                  </div>
                  <FaChevronRight className="w-5 h-5" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-32 h-20 bg-gray-200" />
                  <div className="text-wrap text-[10.5px] text-[#424242]">
                    <p>{section.content1}</p>
                    <p>{section.content2}</p>
                    <p className="mt-2">{section.content3}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
        <div className="py-8 w-full flex items-center justify-center">
          <Link
            to="/payment"
            className="bg-[#128100] text-white p-3 px-6 text-lg font-bold rounded-xl"
          >
            결제하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;

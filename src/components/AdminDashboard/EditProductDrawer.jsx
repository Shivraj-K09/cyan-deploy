import { useEffect, useRef, useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { ImageIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/lib/supabaseClient";
import { Textarea } from "../ui/textarea";

const categories = ["낚시용품", "캠핑용품", "미끼류"];

export function EditProductDrawer({ isOpen, onClose, product, onUpdate }) {
  const [editedProduct, setEditedProduct] = useState(null);
  const [images, setImages] = useState([]);
  const fileInputRefs = useRef(Array(4).fill(null));
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setIsLoading(true);
      setEditedProduct(product);
      const initialImages = Array(4).fill(null);
      if (product.image_urls && Array.isArray(product.image_urls)) {
        product.image_urls.forEach((url, index) => {
          if (index < 4) initialImages[index] = url;
        });
      }
      setImages(initialImages);
      // Simulate loading delay
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }
  }, [isOpen, product]);

  const handleUpdate = async () => {
    if (!editedProduct) return;
    setIsSaving(true);

    try {
      // Filter out null values and get existing URLs
      const existingUrls = images.filter(
        (url) => url && url.startsWith("http")
      );

      // Upload new images
      const newImagePromises = images
        .filter((img) => img && !img.startsWith("http"))
        .map(async (img, index) => {
          const file = await fetch(img).then((res) => res.blob());
          const filePath = `${editedProduct.id}/${Date.now()}_${index}.png`;

          const { data, error } = await supabase.storage
            .from("products")
            .upload(filePath, file);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(filePath);

          return publicUrl;
        });

      const newUrls = await Promise.all(newImagePromises);
      const allImageUrls = [...existingUrls, ...newUrls].filter(Boolean);

      // Update product in Supabase
      const { data, error } = await supabase
        .from("products")
        .update({
          ...editedProduct,
          image_urls: allImageUrls,
        })
        .eq("id", editedProduct.id)
        .select();

      if (error) throw error;

      if (data) {
        onUpdate(data[0]);
        onClose();
      }
    } catch (error) {
      console.error("Error updating product:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteImage = async (index) => {
    try {
      const imageUrl = images[index];
      if (imageUrl && imageUrl.startsWith("http")) {
        // Extract the file path from the URL
        const urlParts = imageUrl.split("products/");
        if (urlParts.length > 1) {
          const filePath = urlParts[1];
          const { error } = await supabase.storage
            .from("products")
            .remove([filePath]);

          if (error) throw error;
        }
      }

      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = null;
        return newImages;
      });
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  const handleImageUpload = (index) => {
    fileInputRefs.current[index]?.click();
  };

  const handleFileSelect = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = e.target?.result;
          return newImages;
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const LoadingSkeleton = () => (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-2 gap-2">
        {Array(4)
          .fill(0)
          .map((_, index) => (
            <Skeleton key={index} className="w-full h-36 rounded-lg" />
          ))}
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-24 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      </div>
    </div>
  );

  if (!editedProduct) return null;

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <div className="max-h-[70vh] overflow-hidden flex flex-col">
          <DrawerHeader className="flex-shrink-0 border-b border-[#d8d8d8] pb-4">
            <DrawerTitle className="text-lg font-semibold text-[#2f2f2f]">
              제품 수정
            </DrawerTitle>
            <VisuallyHidden>
              <DrawerDescription></DrawerDescription>
            </VisuallyHidden>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-2">
                  {images.map((imageUrl, index) => (
                    <Card
                      key={index}
                      className="shadow-none relative w-full h-36 overflow-hidden group"
                    >
                      {imageUrl ? (
                        <>
                          <img
                            src={imageUrl || "/placeholder.svg"}
                            alt={`${editedProduct.name} - Image ${index + 1}`}
                            className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-300"
                            onError={(e) => {
                              console.error(`Error loading image: ${imageUrl}`);
                              e.currentTarget.src = "/placeholder.svg";
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            onClick={() => handleDeleteImage(index)}
                          >
                            삭제
                          </Button>
                        </>
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center bg-[#ebebeb] cursor-pointer"
                          onClick={() => handleImageUpload(index)}
                        >
                          <ImageIcon className="h-7 w-7 text-muted-foreground/90" />
                        </div>
                      )}
                      <Input
                        type="file"
                        accept="image/*"
                        ref={(el) => (fileInputRefs.current[index] = el)}
                        onChange={(e) => handleFileSelect(index, e)}
                        className="hidden"
                      />
                    </Card>
                  ))}
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className="text-base font-medium text-[#2f2f2f]"
                    >
                      제품 이름
                    </Label>
                    <Input
                      id="name"
                      value={editedProduct.name}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 text-sm shadow-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-base font-medium text-[#2f2f2f]"
                    >
                      제품 설명
                    </Label>

                    <Textarea
                      id="description"
                      value={editedProduct.description}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="w-full border-[#d8d8d8] text-sm shadow-none"
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="category"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      카테고리
                    </Label>
                    <Select
                      value={editedProduct.category}
                      onValueChange={(value) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          category: value,
                        }))
                      }
                    >
                      <SelectTrigger className="w-full border-[#d8d8d8] h-10 text-sm shadow-none">
                        <SelectValue placeholder="카테고리 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="brand"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      브랜드
                    </Label>
                    <Input
                      id="brand"
                      value={editedProduct.brand}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          brand: e.target.value,
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 text-sm shadow-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="manufacturer"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      제조업체
                    </Label>
                    <Input
                      id="manufacturer"
                      value={editedProduct.manufacturer}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          manufacturer: e.target.value,
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 text-sm shadow-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="price"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      가격
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={editedProduct.price}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          price: Number.parseFloat(e.target.value),
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 shadow-none text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="original_price"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      원래 가격
                    </Label>
                    <Input
                      id="original_price"
                      type="number"
                      value={editedProduct.original_price}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          original_price: Number.parseFloat(e.target.value),
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 shadow-none text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="inventory"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      재고
                    </Label>
                    <Input
                      id="inventory"
                      type="number"
                      value={editedProduct.inventory}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          inventory: Number.parseInt(e.target.value, 10),
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 shadow-none text-sm"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="delivery_fee"
                      className="text-sm font-medium text-[#2f2f2f]"
                    >
                      배달료
                    </Label>
                    <Input
                      id="delivery_fee"
                      type="number"
                      value={editedProduct.delivery_fee}
                      onChange={(e) =>
                        setEditedProduct((prev) => ({
                          ...prev,
                          delivery_fee: Number.parseFloat(e.target.value),
                        }))
                      }
                      className="w-full border-[#d8d8d8] h-10 shadow-none text-sm"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DrawerFooter className="flex-shrink-0 border-t border-[#d8d8d8]">
            <div className="flex justify-between w-full">
              {isLoading ? (
                <>
                  <Skeleton className="h-10 w-24" />
                  <Skeleton className="h-10 w-24" />
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="bg-[#ebebeb] text-[#2f2f2f] hover:bg-[#d8d8d8] h-10 text-sm shadow-none"
                  >
                    취소
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={isSaving}
                    className="bg-[#128100] text-white hover:bg-[#128100]/90 h-10 text-sm shadow-none"
                  >
                    {isSaving ? "저장 중..." : "변경 사항 저장"}
                  </Button>
                </>
              )}
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

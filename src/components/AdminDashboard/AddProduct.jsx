import { ChevronLeftIcon, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { supabase } from "@/lib/supabaseClient";

const categories = ["낚시용품", "캠핑용품", "미끼류"];

export function AddProduct() {
  const navigate = useNavigate();
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: 0,
    inventory: 0,
    brand: "",
    category: "",
    manufacturer: "",
  });

  const [images, setImages] = useState(Array(4).fill(null));
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(Array(4).fill(null));

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]:
        name === "name" ||
        name === "brand" ||
        name === "manufacturer" ||
        name === "description"
          ? value
          : Number(value),
    }));
  };

  const handleCategoryChange = (value) => {
    setProduct((prev) => ({ ...prev, category: value }));
  };

  const handleImageUpload = (index) => {
    fileInputRef.current[index]?.click();
  };

  const handleFileSelect = (index, event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prevImages) => {
          const newImages = [...prevImages];
          newImages[index] = e.target.result;
          return newImages;
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleDeleteImage = (index) => {
    setImages((prevImages) => {
      const newImages = [...prevImages];
      newImages[index] = null;
      return newImages;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user found");

      // Upload images to Supabase Storage
      const imageUrls = await Promise.all(
        images.filter(Boolean).map(async (image, index) => {
          const file = await fetch(image).then((res) => res.blob());
          const filePath = `${Date.now()}_${index}.png`;
          const { data: uploadData, error: uploadError } =
            await supabase.storage.from("products").upload(filePath, file);

          if (uploadError) throw uploadError;

          const {
            data: { publicUrl },
          } = supabase.storage.from("products").getPublicUrl(filePath);

          return publicUrl;
        })
      );

      // Insert product data into Supabase
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            ...product,
            image_urls: imageUrls,
            created_by: user.id, // Directly use the authenticated user's ID
          },
        ])
        .select();

      if (error) throw error;

      console.log("Product added successfully");
      navigate("/admin/shopping");
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-20 flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center"
          aria-label="Go back"
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            Add New Product
          </h3>
        </button>
      </header>

      <form onSubmit={handleSubmit} className="space-y-3 overflow-y-auto pb-32">
        <div className="grid grid-cols-2 gap-3 m-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative w-full h-36 shadow-none border-black/15 overflow-hidden group border rounded-lg"
            >
              {imageUrl ? (
                <>
                  <img
                    src={imageUrl || "/placeholder.svg"}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover group-hover:opacity-75 transition-opacity duration-200"
                  />
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    onClick={() => handleDeleteImage(index)}
                  >
                    Delete
                  </button>
                </>
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center bg-gray-100 cursor-pointer"
                  onClick={() => handleImageUpload(index)}
                >
                  <ImageIcon className="h-7 w-7 text-muted-foreground/90" />
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(index, e)}
                ref={(el) => (fileInputRef.current[index] = el)}
              />
            </div>
          ))}
        </div>

        <div className="space-y-5 p-4">
          <div className="space-y-2">
            <Label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Product Name
            </Label>
            <Input
              id="name"
              placeholder="Product Name"
              name="name"
              value={product.name}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Product Description"
              name="description"
              value={product.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm"
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="category"
              className="block text-sm font-medium text-gray-700"
            >
              Category
            </Label>
            <Select
              value={product.category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full h-10 text-sm shadow-none">
                <SelectValue placeholder="Select Product Category" />
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
              className="block text-sm font-medium text-gray-700"
            >
              Brand
            </Label>
            <Input
              id="brand"
              placeholder="Brand Name"
              name="brand"
              value={product.brand}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="manufacturer"
              className="block text-sm font-medium text-gray-700"
            >
              Manufacturer
            </Label>
            <Input
              id="manufacturer"
              placeholder="Manufacturer Name"
              name="manufacturer"
              value={product.manufacturer}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Price
            </Label>
            <Input
              id="price"
              name="price"
              type="number"
              value={product.price}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="inventory"
              className="block text-sm font-medium text-gray-700"
            >
              Inventory
            </Label>
            <Input
              id="inventory"
              name="inventory"
              type="number"
              value={product.inventory}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-lg border-gray-300 shadow-none focus:border-[#128100] focus:ring-1 focus:ring-[#128100] text-sm h-10"
              required
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate("/admin/shopping")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#128100]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#128100] hover:bg-[#128100]/90 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-[#128100]"
            >
              {isLoading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

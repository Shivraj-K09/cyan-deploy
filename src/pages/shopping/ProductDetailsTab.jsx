import { supabase } from "@/lib/supabaseClient";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export function ProductDetailsTab() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [api, setApi] = useState(null);

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

  return (
    <div className="p-4 text-sm">
      <div className="flex gap-4 flex-col">
        {product && product.image_urls
          ? product.image_urls.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Product ${index + 1}`}
                className="w-full h-full object-cover rounded-md"
              />
            ))
          : null}
      </div>
      {product && (
        <div className="space-y-1">
          <h2 className="text-xl font-semibold mt-4">{product.name}</h2>
          <span>{product.brand}</span>
          <p className="text-gray-600 text-sm">{product.description}</p>
          <span className="inline-block pt-2">
            제조된 {product.manufacturer}
          </span>
        </div>
      )}
    </div>
  );
}

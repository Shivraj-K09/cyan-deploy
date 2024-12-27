import React, { useState } from "react";
import { ChevronLeft, Minus, Plus, ShoppingCartIcon } from "lucide-react";
import { Link } from "react-router-dom";

const ShoppingCart = () => {
  const [items, setItems] = useState([
    {
      id: 1,
      title: "어떤 것이든 다 나는 넥시대",
      price: 170000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      selected: false,
    },
    {
      id: 2,
      title: "어떤 것이든 다 나는 넥시대",
      price: 170000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      selected: false,
    },
    {
      id: 3,
      title: "어떤 것이든 다 나는 넥시대",
      price: 170000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      selected: false,
    },
    {
      id: 4,
      title: "어떤 것이든 다 나는 넥시대",
      price: 170000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      selected: false,
    },
    {
      id: 5,
      title: "어떤 것이든 다 나는 넥시대",
      price: 170000,
      quantity: 1,
      image: "/placeholder.svg?height=80&width=80",
      selected: false,
    },
  ]);

  const toggleItemSelection = (id) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateQuantity = (id, increment) => {
    setItems(
      items.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: increment
                ? item.quantity + 1
                : Math.max(1, item.quantity - 1),
            }
          : item
      )
    );
  };

  const selectedCount = items.filter((item) => item.selected).length;
  const totalItems = items.length;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-0 right-0 bg-white border-b z-10">
          <div className="flex items-center h-14 px-4">
            <button className="p-2 -ml-2">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="flex-1 text-center text-lg font-medium">장바구니</h1>
          </div>
        </header>
        <div className="pt-14 flex flex-col items-center justify-center min-h-screen p-4 text-gray-500">
          <ShoppingCartIcon className="w-16 h-16 mb-4 text-gray-300" />
          <p className="text-lg font-medium mb-2">장바구니가 비어있어요</p>
          <p className="text-sm">새로운 상품으로 채워주세요</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="fixed top-0 left-0 right-0 bg-white border-b z-10">
        <div className="flex items-center h-14 px-4">
          <Link to="/" className="p-2 -ml-2">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <h1 className="flex-1 text-center text-lg font-medium">장바구니</h1>
        </div>
      </header>

      <main className="pt-14 pb-20">
        <div className="p-4 bg-white">
          <p className="text-sm text-gray-600">
            전체선택 ({selectedCount}/{totalItems})
          </p>
        </div>

        <div className="divide-y">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 bg-white">
              <input
                type="checkbox"
                checked={item.selected}
                onChange={() => toggleItemSelection(item.id)}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden border"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-500 mb-1">[N사세일]</p>
                <h3 className="text-sm font-medium mb-2 line-clamp-2">
                  {item.title}
                </h3>
                <p className="text-sm font-medium">
                  {item.price.toLocaleString()}원
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => updateQuantity(item.id, false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, true)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t flex justify-center">
        <Link
          to="/payment"
          className="py-3 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          결제하기
        </Link>
      </div>
    </div>
  );
};

export default ShoppingCart;

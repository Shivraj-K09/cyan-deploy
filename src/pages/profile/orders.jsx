import { ChevronRight, ChevronsLeft } from "lucide-react";

const Orders = () => {
  const orders = [
    {
      id: 1,
      date: "2024.08.19",
      items: [
        {
          status: "결제완료",
          deliveryDate: "08/23(목) 배송 완료",
          title: "어떤 것이든 다 나는 낚시대",
          description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
          price: "170,000원",
        },
      ],
    },
    {
      id: 2,
      date: "2024.04.22",
      items: [
        {
          status: "결제완료",
          deliveryDate: "08/23(목) 배송 완료",
          title: "어떤 것이든 다 나는 낚시대",
          description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
          price: "170,000원",
        },
        {
          status: "결제완료",
          deliveryDate: "08/23(목) 배송 완료",
          title: "어떤 것이든 다 나는 낚시대",
          description: "이 낚시대는 어떤 것이든 다\n낚아드립니다.",
          price: "170,000원",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-6">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <a href="/profile" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          주문내역 / 배송정보
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Stats */}
      <div className="flex justify-between items-start px-8 py-6">
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-600 mb-2">배송중</div>
          <div className="text-4xl font-medium">0</div>
        </div>
        <div className="w-px h-12 bg-gray-200" />
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-600 mb-2">배송완료</div>
          <div className="text-4xl font-medium">0</div>
        </div>
        <div className="w-px h-12 bg-gray-200" />
        <div className="flex-1 text-center">
          <div className="text-sm text-gray-600 mb-2">취소/ 반품</div>
          <div className="text-4xl font-medium">0</div>
        </div>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Orders List */}
      <div className="flex flex-col">
        {orders.map((order, orderIndex) => (
          <a
            href="/order-details"
            className="flex justify-between items-center px-4 pt-6 pb-2"
          >
            <div key={order.id}>
              <div className="flex items-center justify-between w-full">
                <div className="text-xl font-medium">{order.date}</div>
                <ChevronRight className="w-6 h-6 font-semibold" />
              </div>
              {order.items.map((item, itemIndex) => (
                <div key={`${order.id}-${itemIndex}`}>
                  <div className="flex px-4 py-4">
                    <div className="w-[120px] h-[120px] aspect-square bg-gray-200 rounded-md flex-shrink-0" />
                    <div className="flex-1 ml-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-red-500 text-sm">
                          {item.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          - {item.deliveryDate}
                        </span>
                      </div>
                      <div className="font-medium mb-1">{item.title}</div>
                      <div className="text-sm text-gray-600 whitespace-pre-line mb-1">
                        {item.description}
                      </div>
                      <div className="text-[#008C1F] font-medium">
                        {item.price}
                      </div>
                    </div>
                  </div>
                  {(order.date !== "2024.04.22" ||
                    itemIndex === order.items.length - 1) && (
                    <hr className="border-t border-gray-200 my-4" />
                  )}
                </div>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default Orders;

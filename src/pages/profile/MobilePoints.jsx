import { ChevronsLeft } from "lucide-react";

const MobilePoints = () => {
  const transactions = [
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "주문 결제",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: -3000,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
    {
      date: "2024.03.14 17:06",
      type: "주문 결제",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: -3000,
    },
    {
      date: "2024.03.14 17:06",
      type: "구매 확정",
      description: "[낚시상점] 데이 낚는 낚시대",
      amount: 150,
    },
  ];

  return (
    <div className="min-h-screen bg-background pt-6">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <a href="/profile" className="mr-4" aria-label="Go back">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          포인트 내역
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Transactions List */}
      <div className="flex flex-col">
        {transactions.map((transaction, index) => (
          <div key={index} className="px-4 py-5 border-b">
            <div className="text-sm text-muted-foreground mb-1">
              {transaction.date}
            </div>
            <div className="flex justify-between items-start">
              <div>
                <div className="font-medium mb-1">{transaction.type}</div>
                <div className="text-sm text-muted-foreground">
                  {transaction.description}
                </div>
              </div>
              <div
                className={`font-medium ${
                  transaction.amount > 0 ? "text-blue-500" : "text-red-500"
                }`}
              >
                {transaction.amount > 0 ? "+" : ""}
                {transaction.amount.toLocaleString()}원
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MobilePoints;

import { ChevronsLeft } from "lucide-react";

const MyBest = () => {
  const catches = [
    {
      id: 1,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 2,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 3,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 4,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 5,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 6,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
    },
    {
      id: 7,
      username: "봉어잡자",
      date: "오늘",
      location: "서울 강서구 마곡동",
      size: "48.3cm",
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
          나의 최대어
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Catches List */}
      <div className="flex flex-col overflow-y-auto">
        {catches.map((item) => (
          <div key={item.id} className="p-4 border-b">
            <div className="flex gap-4">
              <div className="w-24 h-24 bg-gray-200 rounded-3xl flex-shrink-0" />
              <div className="flex-1 flex flex-col justify-end pb-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{item.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {item.date}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {item.location} - {item.size}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyBest;

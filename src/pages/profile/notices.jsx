import { ChevronsLeft } from "lucide-react";

const Notices = () => {
  const notices = [
    {
      id: 1,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 2,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 3,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 4,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 5,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 6,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 7,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 8,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 9,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
      ],
    },
    {
      id: 10,
      title: "쾌적한 서비스 이용을 위한 커뮤니티 안내",
      preview: [
        "안녕하세요, 봉어야입니다.",
        "봉어야는 누구나 이용할 수 있는....",
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
          공지사항
        </h1>
      </div>

      {/* Notices List */}
      <div className="flex flex-col">
        {notices.map((notice, index) => (
          <div key={notice.id} className="border-b border-gray-200 px-4 py-5">
            <h2 className="text-base font-semibold mb-2">{notice.title}</h2>
            <div className="text-xs text-gray-600 space-y-1">
              {notice.preview.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notices;

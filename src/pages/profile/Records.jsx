import React, { useState } from "react";
import { ChevronsLeft } from "lucide-react";
import { Button } from "../../components/ui/button";

const Records = () => {
  const [activeTab, setActiveTab] = useState("all");

  const records = [
    {
      id: 1,
      username: "봉어잡자",
      date: "오늘",
      content: "서울 강서구 마곡동 3월 10일자 봉어 조황입니다. 많관부~^^",
      description:
        "힘쓰는 손맛이 있는 우리 봉어! 좋은 날씨에 즐거운 낚시였습니다.",
      type: "public",
    },
    {
      id: 2,
      username: "낚시왕",
      date: "어제",
      content: "한강 잠실지구에서 잡은 대물 붕어! 30cm 넘는 거 같아요.",
      description:
        "오랜만에 큰 놈 잡아서 기분 좋네요. 다음에는 더 큰 거 잡아볼게요!",
      type: "public",
    },
    {
      id: 3,
      username: "물고기사냥꾼",
      date: "2일 전",
      content: "개인 낚시터에서의 은밀한 조황. 대박이었습니다!",
      description:
        "비밀 낚시터 위치는 공개 못하지만, 정말 대어가 많이 나왔어요.",
      type: "private",
    },
    {
      id: 4,
      username: "강태공",
      date: "3일 전",
      content: "충주호 야간 낚시 도전기. 밤새 기다린 보람이 있네요.",
      description:
        "밤낚시의 매력에 푹 빠졌습니다. 조용한 호수에서의 시간이 너무 좋았어요.",
      type: "public",
    },
    {
      id: 5,
      username: "낚시초보",
      date: "1주일 전",
      content: "첫 바다낚시 도전! 실패했지만 좋은 경험이었습니다.",
      description:
        "물고기는 못 잡았지만, 바다 풍경이 너무 멋졌어요. 다음에 또 도전해볼게요!",
      type: "public",
    },
    {
      id: 6,
      username: "봉어잡자",
      date: "2주일 전",
      content: "개인 낚시 일지: 오늘의 시행착오와 배운 점",
      description:
        "실패한 기법들과 새로 시도해본 미끼에 대한 기록. 다음에 참고해야지.",
      type: "private",
    },
    {
      id: 7,
      username: "루어마스터",
      date: "3주일 전",
      content: "루어낚시의 묘미, 배스 5마리 연속 히트!",
      description:
        "오늘 사용한 루어 정보와 캐스팅 기법. 다음에 또 써먹어야겠어요.",
      type: "public",
    },
    {
      id: 8,
      username: "바다사나이",
      date: "1달 전",
      content: "제주도 갈치낚시 원정 다녀왔습니다.",
      description:
        "밤바다의 은빛 갈치들, 정말 환상적이었어요. 제주도의 밤바다는 꼭 경험해보세요!",
      type: "public",
    },
    {
      id: 9,
      username: "송어헌터",
      date: "1달 전",
      content: "겨울 계곡 송어낚시, 추웠지만 즐거웠어요.",
      description:
        "눈 쌓인 계곡에서의 송어낚시, 추위를 잊게 만드는 손맛이었습니다.",
      type: "public",
    },
    {
      id: 10,
      username: "낚시왕",
      date: "2달 전",
      content: "비밀 낚시 포인트 발견! 대어 천국이에요.",
      description:
        "우연히 발견한 곳인데 너무 좋아서 비밀로 해두려고 해요. 나중에 또 가볼 예정입니다.",
      type: "private",
    },
    {
      id: 11,
      username: "플라이피셔",
      date: "2달 전",
      content: "처음 도전한 플라이 피싱, 생각보다 어렵네요.",
      description: "캐스팅하는 법부터 배우는 중입니다. 점점 재미가 붙어가요!",
      type: "public",
    },
    {
      id: 12,
      username: "잉어사냥꾼",
      date: "3달 전",
      content: "겨울 잉어 낚시의 묘미, 40cm 대물 낚았어요!",
      description:
        "추운 날씨에도 불구하고 대물 잉어와의 한판 승부, 정말 짜릿했습니다.",
      type: "public",
    },
  ];

  const filteredRecords = records.filter(
    (record) => activeTab === "all" || record.type === activeTab
  );

  const getPostCount = (type) => {
    if (type === "all") return records.length;
    return records.filter((record) => record.type === type).length;
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background z-10">
        <div className="flex items-center px-4 py-3">
          <a href="/profile" className="mr-4" aria-label="Go back">
            <ChevronsLeft className="w-6 h-6" />
          </a>
          <h1 className="text-lg font-medium flex-1 text-center mr-6">
            나의 기록
          </h1>
        </div>
        <hr className="border-t border-gray-200" />
      </div>

      <div className="flex-1 overflow-y-auto h-screen pt-14">
        {/* Tabs */}
        <div className="flex justify-start gap-2 p-4 pl-6">
          <Button
            variant="ghost"
            className={`${
              activeTab === "all"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("all")}
          >
            전체 ({getPostCount("all")})
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === "public"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("public")}
          >
            공개 ({getPostCount("public")})
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === "private"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("private")}
          >
            비공개 ({getPostCount("private")})
          </Button>
        </div>

        {/* Records List */}
        <div className="flex flex-col p-4 gap-4">
          {filteredRecords.map((record) => (
            <div
              key={record.id}
              className="flex gap-3 p-3 rounded-2xl border border-green-500 items-start"
            >
              <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0" />
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{record.username}</span>
                  <span className="text-sm text-muted-foreground">
                    {record.date}
                  </span>
                  <span className="text-xs px-2 py-1 rounded-full border">
                    {record.type === "public" ? "공개" : "비공개"}
                  </span>
                </div>
                <p className="text-sm mb-1 break-words">{record.content}</p>
                <p className="text-sm text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                  {record.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Records;

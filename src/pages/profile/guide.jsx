import { ChevronsLeft } from "lucide-react";

const Guide = () => {
  const guidelines = [
    {
      type: "warning",
      content:
        "모든 사용자에 대한 존중과 배려는 기본입니다. 인신공격, 비방, 혐오 표현, 그리고 자별적 발현은 허용되지 않습니다.",
    },
    {
      type: "info",
      content:
        "개인정보(전화번호, 주소, 이메일 등)와 타인의 개인정보를 공유하지 마세요. 개인 정보 유출 시 책임은 본인에게 있습니다.",
    },
    {
      type: "warning",
      content:
        "모든 사용자에 대한 존중과 배려는 기본입니다. 인신공격, 비방, 혐오 표현, 그리고 자별적 발현은 허용되지 않습니다.",
    },
    {
      type: "info",
      content:
        "개인정보(전화번호, 주소, 이메일 등)와 타인의 개인정보를 공유하지 마세요. 개인 정보 유출 시 책임은 본인에게 있습니다.",
    },
    {
      type: "warning",
      content:
        "모든 사용자에 대한 존중과 배려는 기본입니다. 인신공격, 비방, 혐오 표현, 그리고 자별적 발현은 허용되지 않습니다.",
    },
    {
      type: "info",
      content:
        "개인정보(전화번호, 주소, 이메일 등)와 타인의 개인정보를 공유하지 마세요. 개인 정보 유출 시 책임은 본인에게 있습니다.",
    },
    {
      type: "warning",
      content:
        "모든 사용자에 대한 존중과 배려는 기본입니다. 인신공격, 비방, 혐오 표현, 그리고 자별적 발현은 허용되지 않습니다.",
    },
    {
      type: "info",
      content:
        "개인정보(전화번호, 주소, 이메일 등)와 타인의 개인정보를 공유하지 마세요. 개인 정보 유출 시 책임은 본인에게 있습니다.",
    },
    {
      type: "warning",
      content:
        "모든 사용자에 대한 존중과 배려는 기본입니다. 인신공격, 비방, 혐오 표현, 그리고 자별적 발현은 허용되지 않습니다.",
    },
    {
      type: "info",
      content:
        "개인정보(전화번호, 주소, 이메일 등)와 타인의 개인정보를 공유하지 마세요. 개인 정보 유출 시 책임은 본인에게 있습니다.",
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
          이용 가이드
        </h1>
      </div>

      {/* Content */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">커뮤니티 이용규칙 안내</h2>
        <div className="space-y-6">
          {guidelines.map((guideline, index) => (
            <p key={index} className="text-sm leading-relaxed">
              {guideline.content}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Guide;

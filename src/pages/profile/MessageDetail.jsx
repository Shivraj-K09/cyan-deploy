import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  SendHorizontalIcon,
} from "lucide-react";

export function MessageDetail({ message, onBack, onNavigate, onComposeClick }) {
  return (
    <div className="h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#d8d8d8]">
        <button className="p-2 -ml-2" onClick={onBack}>
          <ChevronLeftIcon className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-medium">쪽지함</h3>
        <div className="w-6 invisible" />
      </header>

      <div className="flex items-center justify-between p-4 border-b border-[#d8d8d8]">
        <button
          className="px-4 py-1.5 rounded-lg border border-[#d8d8d8] text-sm"
          onClick={onBack}
        >
          목록
        </button>
        <span className="font-medium">받은쪽지함</span>
        <div className="w-[52px] invisible" />
      </div>

      <div className="flex items-center justify-between p-4 border-b border-[#d8d8d8]">
        <div className="flex items-center gap-2">
          <span className="text-sm">보낸사람</span>
          <span className="px-2 py-1 text-xs rounded-full bg-[#128100]/10 text-[#128100]">
            {"Admin"}
          </span>
        </div>
        <span className="text-xs text-[#6a6a6a]">{message.timestamp}</span>
      </div>

      <div className="space-y-4">
        <div className="p-4  h-[400px] overflow-y-auto">
          <p className="text-base font-medium">{message.title}</p>
          <p className="text-sm leading-relaxed text-[#2f2f2f]">
            {message.content}
          </p>
        </div>

        <div className="border-t border-[#d8d8d8] bg-white">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
                onClick={onComposeClick}
              >
                답장
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="rounded-full text-xs"
              >
                삭제
              </Button>
            </div>

            <Button
              size="sm"
              className="rounded-full bg-[#128100] hover:bg-[#0f6b00] text-white"
              onClick={onComposeClick}
            >
              <SendHorizontalIcon className="w-3 h-3 mr-1" />
              <span>쪽지쓰기</span>
            </Button>
          </div>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-4 py-2">
          <button
            className="p-0.5 border rounded-md border-[#d8d8d8]"
            disabled={message.current === 1}
            onClick={() => onNavigate("prev")}
          >
            <ChevronLeftIcon
              className={`w-5 h-5 ${
                message.current === 1 ? "text-gray-300" : "text-[#6a6a6a]"
              }`}
            />
          </button>

          <span className="text-sm">
            <span className="font-medium">{message.current}</span>
            {" / "}
            <span className="text-[#6a6a6a]">{message.total}</span>
          </span>

          <button
            className="p-0.5 border rounded-md border-[#d8d8d8]"
            disabled={message.current === message.total}
            onClick={() => onNavigate("next")}
          >
            <ChevronRightIcon
              className={`w-5 h-5 ${
                message.current === message.total
                  ? "text-gray-300"
                  : "text-[#6a6a6a]"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="h-32 invisible" />
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  InboxIcon,
  SendHorizontalIcon,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function MessageInbox({
  messages,
  onMessageSelect,
  onComposeClick,
  isLoading,
}) {
  const [selectedBox, setSelectBox] = useState("received");
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setShowContent(true);
    }
  }, [isLoading]);

  const toggleMessageSelection = (id) => {
    setSelectedMessages((prev) =>
      prev.includes(id) ? prev.filter((msgId) => msgId !== id) : [...prev, id]
    );
  };

  const toggleAllMessages = () => {
    if (selectedMessages.length === messages.length) {
      setSelectedMessages([]);
    } else {
      setSelectedMessages(messages.map((msg) => msg.id));
    }
  };

  const deleteSelectedMessages = () => {
    console.log("Deleting selected messages:", selectedMessages);
    setSelectedMessages([]);
  };

  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate("/admin");
  };

  return (
    <div className="h-screen">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#d8d8d8]">
        <button className="p-2 -ml-2" onClick={handleBackClick}>
          <ChevronLeft className="w-6 h-6" />
        </button>

        <h3 className="text-lg font-semibold">쪽지함</h3>
        <div className="w-6 invisible" />
      </header>

      <div className="flex items-center justify-between p-4 border-b border-[#d8d8d8]">
        <Select value={selectedBox} onValueChange={setSelectBox}>
          <SelectTrigger className="w-[100px] h-8 text-xs">
            <SelectValue placeholder="받은쪽지함" />
          </SelectTrigger>
          <SelectContent className="text-xs">
            <SelectItem value="received">받은쪽지함</SelectItem>
            <SelectItem value="sent">보낸쪽지함</SelectItem>
            <SelectItem value="drafts">임시보관함</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center">
          <span className="font-medium text-sm">받은쪽지함</span>
          <span className="text-[#128100] text-sm ml-1">{messages.length}</span>
        </div>

        <div className="w-[100px] invisible" />
      </div>

      <div className="divide-y divide-[#d8d8d8]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-[#128100] animate-spin mb-4" />
            <p className="text-sm text-[#6a6a6a]">메시지를 불러오는 중...</p>
          </div>
        ) : (
          <div
            className={`transition-opacity duration-300 ${
              showContent ? "opacity-100" : "opacity-0"
            }`}
          >
            {messages.length > 0 ? (
              messages.map((message) => (
                <div
                  key={message.id}
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[#ebebeb] border-b last:border-b-0"
                  onClick={() => onMessageSelect(message.id)}
                >
                  <Checkbox
                    id={`message-${message.id}`}
                    checked={selectedMessages.includes(message.id)}
                    onCheckedChange={() => toggleMessageSelection(message.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-[#6a6a6a]">Admin</div>
                    <div className="font-medium mt-1 text-sm truncate w-[200px]">
                      {message.title}
                    </div>
                  </div>
                  <div className="text-xs text-[#6a6a6a] whitespace-nowrap">
                    {message.timestamp}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <InboxIcon className="w-16 h-16 text-[#d8d8d8] mb-4" />
                <p className="text-sm text-[#6a6a6a]">받은 쪽지가 없습니다.</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Checkbox
              id="select-all"
              checked={
                messages.length > 0 &&
                selectedMessages.length === messages.length
              }
              onCheckedChange={toggleAllMessages}
            />

            <Button
              variant="outline"
              size="sm"
              className="text-xs rounded-md"
              onClick={deleteSelectedMessages}
              disabled={selectedMessages.length === 0}
            >
              삭제
            </Button>
          </div>
          <Button
            size="sm"
            className="rounded-full bg-[#128100] hover:bg-[#0f8b00] text-white"
            onClick={onComposeClick}
          >
            <SendHorizontalIcon className="w-3 h-3 mr-1" />
            <span className="text-xs">쪽지쓰기</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeftIcon,
  PlusIcon,
  SendHorizontalIcon,
  XIcon,
} from "lucide-react";
import { useState } from "react";

export function ComposeMessage({ onBack }) {
  const [isOpen, setIsOpen] = useState(false);
  const [recipients, setRecipients] = useState([
    { id: "abcb1234", name: "봉어잡자" },
    { id: "abcb1235", name: "이재성" },
    { id: "abcb1236", name: "이재성" },
  ]);

  const [selectedRecipient, setSelectedRecipient] = useState([]);

  const toggleRecipient = (recipient) => {
    setSelectedRecipient((prev) =>
      prev.some((r) => r.id === recipient.id)
        ? prev.filter((r) => r.id !== recipient.id)
        : [...prev, recipient]
    );
  };

  const removeRecipient = (id) => {
    setSelectedRecipient((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="h-screen bg-white">
      <header className="flex items-center justify-between px-4 py-3 border-b border-[#d8d8d8]">
        <button className="p-2 -ml-2" onClick={onBack}>
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <h3 className="text-lg font-semibold">쪽지함</h3>
        <div className="w-6 invisible" />
      </header>

      <div className="flex items-center px-4 py-3 border-b border-[#d8d8d8]">
        <Button
          variant="outline"
          className="rounded-lg border-[#d8d8d8] text-[#2f2f2f] h-9 px-4"
        >
          전체작성
        </Button>
        <span className="ml-4 text-lg font-medium">쪽지 쓰기</span>
      </div>

      <div className="relative border-b border-[#d8d8d8]">
        <div className="flex items-center justify-between py-3 px-4">
          <div className="flex-1 flex flex-wrap gap-2 items-center">
            <span className="text-[#2f2f2f] mr-2">받는사람</span>
            {selectedRecipient.map((recipient) => (
              <div
                key={recipient.id}
                className="inline-flex items-center gap-1 px-2 py-1 bg-[#ebebeb] rounded-full text-sm"
              >
                <span className="text-[#2f2f2f]">{recipient.name}</span>
                <button
                  className="text-[#6a6a6a] hover:text-[#2f2f2f] transition-colors"
                  onClick={() => removeRecipient(recipient.id)}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <button className="w-7 h-7 rounded-full bg-[#d8d8d8] flex items-center justify-center transition-colors hover:bg-[#c8c8c8]">
                <PlusIcon className="w-5 h-5" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-screen rounded-t-none rounded-b-xl border-t-0 p-0"
              align="end"
              sideOffset={0}
            >
              <ScrollArea className="h-[200px] px-0">
                <div className="divide-y divide-[#d8d8d8] mt-2">
                  {recipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between py-3 px-4 hover:bg-[#ebebeb] cursor-pointer"
                      onClick={() => toggleRecipient(recipient)}
                    >
                      <span className="text-[#2f2f2f] text-sm">
                        {recipient.name}({recipient.id})
                      </span>
                      {selectedRecipient.some((r) => r.id === recipient.id) && (
                        <div className="w-4 h-4 rounded-full bg-[#128100]" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div>
        <div className="px-4">
          <Textarea
            placeholder="쪽지 내용을 작성해 주세요."
            className="min-h-[400px] mt-6 resize-none rounded-lg border px-3 py-2.5 text-sm shadow-none"
          />
        </div>

        <div className="mt-4 border-t border-[#d8d8d8] pt-4">
          <div className="flex justify-between gap-4 px-4">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs"
              onClick={onBack}
            >
              취소
            </Button>
            <Button
              size="sm"
              className="rounded-full bg-[#128100] hover:bg-[#0f6b00] text-white"
            >
              <SendHorizontalIcon className="w-3 h-3 mr-1" />
              <span>쪽지쓰기</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

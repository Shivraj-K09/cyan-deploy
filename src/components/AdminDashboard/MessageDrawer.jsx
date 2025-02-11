import { useState } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "../ui/drawer";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

export function MessageDrawer({ isOpen, onClose, initialName, recipientId }) {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!message.trim()) {
      toast.error("Please enter a message");
      return;
    }

    setIsSending(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: message.trim(),
      });

      if (error) throw error;
      toast.success("Message sent successfully");
      setMessage("");
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader className="border-b pb-4">
          <DrawerTitle className="text-lg font-semibold">
            에게 메시지를 보내다 {initialName}
          </DrawerTitle>
          <VisuallyHidden>
            <DrawerDescription></DrawerDescription>
          </VisuallyHidden>
        </DrawerHeader>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              이름
            </Label>
            <Input
              id="name"
              className="w-full p-2 bg-gray-100 rounded-md text-sm pointer-events-none shadow-none h-10"
              defaultValue={initialName}
            />
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="message"
              className="text-sm font-medium text-gray-700 shadow-none"
            >
              메시지
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full h-32 text-sm shadow-none"
              placeholder="Type your message here..."
            />
          </div>
        </div>
        <DrawerFooter className="border-t pt-4">
          <div className="flex justify-between w-full">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button onClick={handleSendMessage} disabled={isSending}>
              {isSending ? "전송 중..." : "메시지 보내기"}
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

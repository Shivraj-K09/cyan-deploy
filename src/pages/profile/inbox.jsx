import { useState, useEffect } from "react";
import { ComposeMessage } from "./ComposeMessage";
import { MessageDetail } from "./MessageDetail";
import { MessageInbox } from "./MessageInbox";
import { supabase } from "@/lib/supabaseClient";

export function Inbox() {
  const [view, setView] = useState("inbox");
  const [selectedMessageIndex, setSelectedMessageIndex] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("messages")
        .select(
          `
          id,
          content,
          created_at,
          sender:sender_id(name)
        `
        )
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedMessages = data.map((msg) => ({
        id: msg.id,
        sender: msg.sender.name,
        title:
          msg.content.substring(0, 50) + (msg.content.length > 50 ? "..." : ""),
        content: msg.content,
        timestamp: new Date(msg.created_at).toLocaleString("ko-KR", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsLoading(false);
    }
  };

  const handleMessageSelect = (id) => {
    const index = messages.findIndex((msg) => msg.id === id);
    setSelectedMessageIndex(index);
    setView("detail");
  };

  const handleNavigate = (direction) => {
    if (selectedMessageIndex === null) return;

    if (direction === "prev" && selectedMessageIndex > 0) {
      setSelectedMessageIndex(selectedMessageIndex - 1);
    } else if (
      direction === "next" &&
      selectedMessageIndex < messages.length - 1
    ) {
      setSelectedMessageIndex(selectedMessageIndex + 1);
    }
  };

  const handleComposeClick = () => {
    setView("compose");
  };

  const handleBack = () => {
    setView("inbox");
    setSelectedMessageIndex(null);
  };

  if (view === "compose") {
    return <ComposeMessage onBack={handleBack} />;
  }

  if (view === "detail") {
    const currentMessage = messages[selectedMessageIndex];
    return (
      <MessageDetail
        message={{
          ...currentMessage,
          total: messages.length,
          current: selectedMessageIndex + 1,
        }}
        onBack={handleBack}
        onNavigate={handleNavigate}
        onComposeClick={handleComposeClick}
      />
    );
  }

  return (
    <MessageInbox
      messages={messages}
      onMessageSelect={handleMessageSelect}
      onComposeClick={handleComposeClick}
      isLoading={isLoading}
    />
  );
}

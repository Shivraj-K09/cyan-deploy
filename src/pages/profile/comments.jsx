import { useEffect, useState } from "react";
import { ChevronsLeft, Loader2 } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

const Comments = () => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("User not authenticated");
        }

        const { data, error } = await supabase
          .from("comments")
          .select(
            `
            id,
            post_id,
            content,
            created_at,
            updated_at,
            posts (
              id,
              description
            )
          `
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setComments(data || []);
      } catch (error) {
        console.error("Error fetching comments:", error);
        setError("댓글을 불러오는데 실패했습니다. 다시 시도해 주세요.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date
      .toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
      .replace(/\./g, ".") // Remove space after each dot
      .replace(/,/, "") // Remove comma
      .replace(/\s+$/, "") // Remove trailing space
      .replace(/\.(\d{2}:\d{2})/, "  $1"); // Add double space before time
  };

  return (
    <div className="min-h-screen bg-background pt-6">
      {/* Header */}
      <div className="flex items-center px-4 py-3">
        <a href="/profile" className="mr-4">
          <ChevronsLeft className="w-6 h-6" />
        </a>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          나의 댓글
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Comments List */}
      <div className="flex flex-col">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center text-red-500 p-4">{error}</div>
        ) : comments.length === 0 ? (
          <div className="text-center text-gray-500 p-4">
            작성한 댓글이 없습니다.
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="px-4 py-5 border-b">
              <div className="text-sm text-muted-foreground mb-2">
                {formatDate(comment.created_at)}
              </div>
              <div className="font-semibold mb-1">{comment.content}</div>
              <div className="text-sm text-muted-foreground line-clamp-1">
                {comment.posts?.description || "삭제된 게시글입니다."}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Comments;

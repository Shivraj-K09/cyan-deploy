import { ChevronsLeft } from "lucide-react";

const Comments = () => {
  const comments = [
    {
      id: 1,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 2,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 3,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 4,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 5,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 6,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 7,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 8,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
    {
      id: 9,
      timestamp: "2024.03.14 17:06",
      comment: "와우 봉어 스맛 좋네요~",
      postTitle: "게시글 제목 : 봉어 손맛 좋다!",
    },
  ];

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
        {comments.map((comment) => (
          <div key={comment.id} className="px-4 py-5 border-b">
            <div className="text-sm text-muted-foreground mb-2">
              {comment.timestamp}
            </div>
            <div className="font-semibold mb-1">{comment.comment}</div>
            <div className="text-sm text-muted-foreground">
              {comment.postTitle}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Comments;

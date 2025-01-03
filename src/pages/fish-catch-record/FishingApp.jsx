import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { toast, Toaster } from "sonner";
import { supabase } from "../../lib/supabaseClient";
// import { useAuth } from "../../lib/auth";
import {
  Search,
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  Globe,
  LockIcon,
  Trash2,
  XIcon,
  PenSquare,
  PenLine,
} from "lucide-react";
import { PiHandsClapping } from "react-icons/pi";
import { LuMessageCircle } from "react-icons/lu";
import { Input } from "../../components/ui/input";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "../../components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";

const DUMMY_POSTS = [
  {
    id: "dummy1",
    user_id: "dummy_user",
    created_at: new Date().toISOString(),
    image_urls: ["/img1.jpeg", "/img2.jpeg", "/img3.jpeg", "/img4.jpeg"],
    description:
      "This is a dummy post to show how posts will appear. Create your first post to see it here!",
    likes_count: 15,
    comments_count: 3,
    visibility: "public",
    comments: [
      {
        id: "dummy_comment1",
        user_id: "dummy_commenter1",
        user_name: "John Doe",
        content: "Great post! Looking forward to more content.",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "dummy_comment2",
        user_id: "dummy_commenter2",
        user_name: "Jane Smith",
        content: "This is really interesting. Thanks for sharing!",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "dummy_comment3",
        user_id: "dummy_commenter3",
        user_name: "Bob Johnson",
        content: "I love seeing these updates. Keep them coming!",
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
    top_comments: [
      {
        id: "dummy_comment2",
        user_id: "dummy_commenter2",
        user_name: "Jane Smith",
        content: "This is really interesting. Thanks for sharing!",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: "dummy_comment3",
        user_id: "dummy_commenter3",
        user_name: "Bob Johnson",
        content: "I love seeing these updates. Keep them coming!",
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ],
  },
];

const FishingApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(null);
  const [newComment, setNewComment] = useState("");
  // const { user } = useAuth();

  useEffect(() => {
    fetchCurrentUser();
    checkForNewPost();
    window.addEventListener("focus", checkForNewPost);
    return () => {
      window.removeEventListener("focus", checkForNewPost);
    };
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchCurrentUserData();
    }
  }, [currentUser]);

  useEffect(() => {
    fetchPosts();
    const unsubscribe = setupRealTimeSubscriptions();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [currentUser, currentUserData]);

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) throw error;
      setCurrentUser(session?.user || null);
    } catch (error) {
      console.error("Error fetching current user:", error.message);
      setCurrentUser(null);
    }
  };

  const fetchCurrentUserData = async () => {
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .eq("id", currentUser.id)
        .single();

      if (error) throw error;
      setCurrentUserData(data);
    } catch (error) {
      console.error("Error fetching current user data:", error.message);
    }
  };

  const fetchPosts = async () => {
    try {
      setLoading(true);
      let { data: fetchedPosts, error } = await supabase
        .from("posts")
        .select(
          `
          *,
          comments (
            id,
            content,
            created_at,
            user_id
          ),
          likes (
            id,
            user_id
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const postsWithLikes = await Promise.all(
        fetchedPosts.map(async (post) => {
          const { data: likes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id")
            .eq("post_id", post.id);

          if (likesError) throw likesError;

          return {
            ...post,
            likes,
            likes_count: likes.length,
            user_has_liked: currentUser
              ? likes.some((like) => like.user_id === currentUser.id)
              : false,
          };
        })
      );

      const userIds = new Set();
      postsWithLikes.forEach((post) => {
        userIds.add(post.user_id);
        post.comments.forEach((comment) => userIds.add(comment.user_id));
      });

      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id, name, avatar_url")
        .in("id", Array.from(userIds));

      if (userError) throw userError;

      const userMap = {};
      userData.forEach((user) => {
        userMap[user.id] = user;
      });

      const processedPosts = postsWithLikes.map((post) => ({
        ...post,
        comments: post.comments.map((comment) => ({
          ...comment,
          user_name: userMap[comment.user_id]?.name || "Unknown User",
        })),
        top_comments: post.comments.slice(-2).map((comment) => ({
          ...comment,
          user_name: userMap[comment.user_id]?.name || "Unknown User",
        })),
        comments_count: post.comments.length,
        user_has_liked: post.user_has_liked,
      }));

      setPosts(processedPosts);
      setUsers(userMap);
    } catch (error) {
      console.error("Error fetching posts:", error.message);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const setupRealTimeSubscriptions = () => {
    const channel = supabase
      .channel("public:posts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "posts" },
        (payload) => {
          if (
            payload.new.visibility === "public" ||
            (currentUser && payload.new.user_id === currentUser.id)
          ) {
            setPosts((currentPosts) => [payload.new, ...currentPosts]);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "posts" },
        (payload) => {
          setPosts((currentPosts) =>
            currentPosts.map((post) =>
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            )
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "likes" },
        async (payload) => {
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          const { data: updatedLikes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id")
            .eq("post_id", postId);

          if (likesError) return;

          setPosts((prevPosts) => {
            return prevPosts.map((post) => {
              if (post.id === postId) {
                return {
                  ...post,
                  likes: updatedLikes,
                  likes_count: updatedLikes.length,
                  user_has_liked: currentUser
                    ? updatedLikes.some(
                        (like) => like.user_id === currentUser.id
                      )
                    : false,
                  comments_count: post.comments_count,
                };
              }
              return post;
            });
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        async (payload) => {
          const postId = payload.new?.post_id || payload.old?.post_id;
          if (!postId) return;

          const { data: updatedPost, error } = await supabase
            .from("posts")
            .select(
              `
              *,
              comments (
                id,
                content,
                created_at,
                user_id
              ),
              likes (
                id,
                user_id
              )
            `
            )
            .eq("id", postId)
            .single();

          if (error) return;

          if (updatedPost) {
            setPosts((currentPosts) =>
              currentPosts.map((post) =>
                post.id === postId
                  ? {
                      ...post,
                      ...updatedPost,
                      comments_count: updatedPost.comments.length,
                      likes_count: updatedPost.likes.length,
                      user_has_liked: currentUser
                        ? updatedPost.likes.some(
                            (like) => like.user_id === currentUser.id
                          )
                        : false,
                      likes: updatedPost.likes,
                      comments: updatedPost.comments.map((comment) => ({
                        ...comment,
                        user_name:
                          users[comment.user_id]?.name || "Unknown User",
                      })),
                      top_comments: updatedPost.comments
                        .slice(-2)
                        .map((comment) => ({
                          ...comment,
                          user_name:
                            users[comment.user_id]?.name || "Unknown User",
                        })),
                    }
                  : post
              )
            );
          }
        }
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const toggleLikeBackend = async (postId) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return { success: false };

    try {
      if (post.user_has_liked) {
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);
      } else {
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: currentUser.id });
      }

      const { data: updatedLikes, error: likesError } = await supabase
        .from("likes")
        .select("id, user_id")
        .eq("post_id", postId);

      if (likesError) throw likesError;

      setPosts((prevPosts) => {
        return prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes_count: updatedLikes.length,
              user_has_liked: updatedLikes.some(
                (like) => like.user_id === currentUser.id
              ),
              comments: p.comments,
              comments_count: p.comments_count,
              top_comments: p.top_comments,
            };
          }
          return p;
        });
      });

      return { success: true };
    } catch (error) {
      console.error("Error in toggleLikeBackend:", error.message);
      return { success: false };
    }
  };

  const handleLike = async (postId) => {
    if (postId.startsWith("dummy")) return;
    if (!currentUser) {
      toast.error("Please log in to like posts");
      return;
    }

    const originalPost = posts.find((p) => p.id === postId);
    setPosts((prevPosts) => {
      return prevPosts.map((p) => {
        if (p.id === postId) {
          const newLikesCount = p.user_has_liked
            ? p.likes_count - 1
            : p.likes_count + 1;
          return {
            ...p,
            likes_count: newLikesCount,
            user_has_liked: !p.user_has_liked,
          };
        }
        return p;
      });
    });

    try {
      const result = await toggleLikeBackend(postId);
      if (!result.success) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => (p.id === postId ? originalPost : p))
        );
        toast.error("Failed to update like. Please try again.");
      }
    } catch (error) {
      console.error("Error toggling like:", error.message);
      toast.error("Failed to update like. Please try again.");
    }
  };

  const handleAddComment = async (postId) => {
    if (!currentUser || !currentUserData) {
      toast.error("Please log in to comment");
      return;
    }
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    const newCommentObj = {
      id: Date.now(),
      content: newComment.trim(),
      created_at: new Date().toISOString(),
      user_id: currentUser.id,
      user_name: currentUserData.name,
    };

    setPosts((prevPosts) => {
      return prevPosts.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newCommentObj],
            comments_count: p.comments_count + 1,
            top_comments: [...p.top_comments.slice(-1), newCommentObj],
          };
        }
        return p;
      });
    });

    setNewComment("");

    try {
      const { data, error } = await supabase
        .from("comments")
        .insert({
          post_id: postId,
          user_id: currentUser.id,
          content: newComment.trim(),
        })
        .select();

      if (error) throw error;

      setPosts((prevPosts) => {
        return prevPosts.map((p) => {
          if (p.id === postId) {
            const updatedComments = p.comments.map((c) =>
              c.id === newCommentObj.id ? { ...c, ...data[0] } : c
            );
            return {
              ...p,
              comments: updatedComments,
              top_comments: updatedComments.slice(-2),
            };
          }
          return p;
        });
      });

      toast.success("Comment added successfully");
    } catch (error) {
      console.error("Error adding comment:", error.message);
      toast.error("Failed to add comment. Please try again.");

      setPosts((prevPosts) => {
        return prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              comments: p.comments.filter((c) => c.id !== newCommentObj.id),
              comments_count: p.comments_count - 1,
              top_comments: p.top_comments.filter(
                (c) => c.id !== newCommentObj.id
              ),
            };
          }
          return p;
        });
      });
    }
  };

  const handleRemoveLink = async (postId) => {
    if (!currentUser) {
      toast.error("Please log in to remove links");
      return;
    }

    try {
      const { error } = await supabase
        .from("posts")
        .update({ link: null })
        .eq("id", postId);

      if (error) throw error;

      setPosts(posts.map((p) => (p.id === postId ? { ...p, link: null } : p)));
      toast.success("Link removed successfully");
    } catch (error) {
      console.error("Error removing link:", error.message);
      toast.error("Failed to remove link. Please try again.");
    }
  };

  const getLinkIcon = (link) => {
    if (link.includes("youtube")) return <YoutubeIcon className="h-5 w-5" />;
    if (link.includes("instagram"))
      return <InstagramIcon className="h-5 w-5" />;
    if (link.includes("facebook")) return <FacebookIcon className="h-5 w-5" />;
    return <Globe className="h-5 w-5" />;
  };

  const calculateTimeAgo = (timestamp) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const fishTabs = [
    { id: 0, title: "1위 봉어야" },
    { id: 1, title: "2위 봉어야(동영상)" },
    { id: 2, title: "3위 봉어야" },
  ];

  const handleCommentClick = (post) => {
    if (post.id.startsWith("dummy")) return;
    if (!currentUser) {
      toast.error("Please log in to view and add comments.");
    }
  };

  const checkForNewPost = () => {
    const newPostString = localStorage.getItem("newPost");
    if (newPostString) {
      const newPost = JSON.parse(newPostString);
      setPosts((prevPosts) => [newPost, ...prevPosts]);
      localStorage.removeItem("newPost");
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>Error: {error}</div>;

  return (
    <ErrorBoundary>
      <div className="max-w-md mx-auto min-h-screen flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto pb-24">
          <div className="px-4 my-4">
            <Link to="./filter-post">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="조황기록 검색"
                  className={`w-full px-4 py-2 border border-[#128100] rounded-xl pr-10 ${
                    !currentUser ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  value={searchQuery}
                  onChange={(e) =>
                    currentUser && setSearchQuery(e.target.value)
                  }
                  disabled={!currentUser}
                />
                <Search className="absolute right-3 top-2.5 text-[#128100] w-5 h-5" />
              </div>
            </Link>
            {!currentUser && (
              <p className="text-sm text-red-500 mt-1">
                Please log in to use the search feature.
              </p>
            )}
          </div>

          <div className="mb-6">
            <Card className="mx-4 shadow-xl my-1">
              <CardContent className="p-4">
                <h2 className="text-lg font-bold mb-3">이달의 봉어</h2>
                <div className="flex justify-between">
                  {fishTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`text-sm ${
                        activeTab === tab.id ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {tab.title}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-5 flex flex-col gap-5 px-4">
            {(posts.length === 0 ? DUMMY_POSTS : posts).map((post, index) => {
              const user = users[post.user_id];
              const isPrivate = post.visibility === "private";
              return (
                <Card key={post.id} className="w-full shadow-none">
                  <CardHeader className="p-4">
                    <div className="flex items-center gap-2 justify-between w-full">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage
                            src={
                              post.id.startsWith("dummy")
                                ? "/placeholder.svg?height=32&width=32"
                                : user?.avatar_url
                            }
                            alt={
                              post.id.startsWith("dummy")
                                ? "Dummy User"
                                : user?.name
                            }
                          />
                          <AvatarFallback>
                            {post.id.startsWith("dummy")
                              ? "D"
                              : user?.name
                              ? user.name.charAt(0).toUpperCase()
                              : "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {post.id.startsWith("dummy")
                              ? "Dummy User"
                              : user?.name || "Unknown User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {calculateTimeAgo(post.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isPrivate && (
                          <LockIcon className="h-4 w-4 text-gray-500" />
                        )}
                        {post.link && (
                          <>
                            <a
                              href={post.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:opacity-75 transition-opacity"
                            >
                              {getLinkIcon(post.link)}
                            </a>
                            {currentUser && currentUser.id === post.user_id && (
                              <button
                                onClick={() => handleRemoveLink(post.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    {post.image_urls &&
                      post.image_urls.length > 0 &&
                      (post.image_urls.length === 1 ? (
                        <div className="w-full h-full">
                          <img
                            src={post.image_urls[0]}
                            alt={`Post image`}
                            className="w-full h-full"
                          />
                        </div>
                      ) : (
                        <Carousel className="w-full">
                          <CarouselContent>
                            {post.image_urls.map((imageUrl, index) => (
                              <CarouselItem key={index} className="h-64">
                                <img
                                  src={imageUrl}
                                  alt={`Post image ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </CarouselItem>
                            ))}
                          </CarouselContent>
                        </Carousel>
                      ))}
                    <div className="p-4">
                      <p className="text-sm text-justify">{post.description}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col p-4 !pt-0 ">
                    <div className="flex flex-col gap-2 w-full">
                      {post.top_comments &&
                        post.top_comments.map((comment, index) => (
                          <div key={index} className="flex gap-2 items-center">
                            <div className="flex items-center gap-1">
                              <span className="font-bold text-sm">
                                {comment.user_name}
                              </span>
                              {comment.user_id === post.user_id && (
                                <div className="relative group">
                                  <PenSquare className="h-3.5 w-3.5 text-blue-500" />
                                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                    Author
                                  </div>
                                </div>
                              )}
                            </div>
                            <span className="text-sm truncate flex-1">
                              {comment.content}
                            </span>
                          </div>
                        ))}
                    </div>
                    <div className="mt-3 flex items-center gap-5 w-full">
                      <div className="flex items-center gap-1">
                        <PiHandsClapping
                          className={`h-5 w-5 cursor-pointer ${
                            post.user_has_liked
                              ? "text-red-500 fill-red-500"
                              : "text-gray-500"
                          }`}
                          onClick={() => handleLike(post.id)}
                        />
                        <span>{post.likes_count || 0}</span>
                      </div>
                      <div>
                        {currentUser ? (
                          <Drawer>
                            <DrawerTrigger className="flex items-center gap-1">
                              <LuMessageCircle className="h-5 w-5" />
                              <span>{post.comments_count || 0}</span>
                            </DrawerTrigger>
                            <DrawerContent>
                              <DrawerHeader className="border-b">
                                <DrawerTitle className="flex items-center gap-2 px-4">
                                  <span className="text-base font-medium">
                                    Comments
                                  </span>
                                  <span className="text-base text-gray-500">
                                    {post.comments_count || 0}
                                  </span>
                                  <DrawerClose className="ml-auto">
                                    <XIcon className="h-5 w-5" />
                                  </DrawerClose>
                                </DrawerTitle>
                                <VisuallyHidden>
                                  <DrawerDescription></DrawerDescription>
                                </VisuallyHidden>
                              </DrawerHeader>
                              <div className="flex flex-col h-[400px] overflow-y-auto">
                                {post.comments &&
                                  post.comments.map((comment, index) => (
                                    <div
                                      key={index}
                                      className="flex gap-3 p-4 hover:bg-gray-50"
                                    >
                                      <Avatar className="h-8 w-8">
                                        <AvatarImage
                                          src={
                                            users[comment.user_id]?.avatar_url
                                          }
                                        />
                                        <AvatarFallback>
                                          {comment.user_name
                                            ?.charAt(0)
                                            .toUpperCase() || "U"}
                                        </AvatarFallback>
                                      </Avatar>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                          <span className="font-medium text-sm">
                                            {comment.user_name}
                                          </span>
                                          {comment.user_id === post.user_id && (
                                            <div className="relative group">
                                              <PenSquare className="h-3.5 w-3.5 text-blue-500" />
                                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 text-xs bg-gray-900 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                Author
                                              </div>
                                            </div>
                                          )}
                                          <span className="text-xs text-gray-500">
                                            {formatDistanceToNow(
                                              new Date(comment.created_at),
                                              { addSuffix: true }
                                            )}
                                          </span>
                                        </div>
                                        <p className="text-sm mt-0.5 text-gray-900">
                                          {comment.content}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              <div className="p-4 border-t mt-auto">
                                <div className="flex gap-2 items-center">
                                  <Avatar className="h-8 w-8">
                                    <AvatarImage
                                      src={users[currentUser?.id]?.avatar_url}
                                    />
                                    <AvatarFallback>
                                      {users[currentUser?.id]?.name
                                        ?.charAt(0)
                                        .toUpperCase() || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <Input
                                    placeholder={
                                      post.id.startsWith("dummy")
                                        ? "This is a demo comment input - posting is disabled"
                                        : "Add a comment..."
                                    }
                                    value={newComment}
                                    onChange={(e) =>
                                      setNewComment(e.target.value)
                                    }
                                    className="flex-1 h-11"
                                    disabled={post.id.startsWith("dummy")}
                                  />
                                  <Button
                                    onClick={() => handleAddComment(post.id)}
                                    className="bg-green-500 text-white hover:bg-green-600 h-11 w-20"
                                    disabled={post.id.startsWith("dummy")}
                                  >
                                    Post
                                  </Button>
                                </div>
                              </div>
                            </DrawerContent>
                          </Drawer>
                        ) : (
                          <button
                            onClick={() => handleCommentClick(post)}
                            className="flex items-center gap-1"
                          >
                            <LuMessageCircle className="h-5 w-5" />
                            <span>{post.comments_count || 0}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          <Link
            to="./create-post"
            className="fixed bottom-[102px] right-6 h-20 w-20 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50"
          >
            <PenLine className="w-7 h-7 text-white" />
          </Link>
          <Toaster />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default FishingApp;

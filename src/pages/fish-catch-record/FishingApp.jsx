import React, { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Flag,
  ShoppingBag,
  User,
  PenLine,
  LinkIcon,
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  Globe,
  HeartIcon,
  LockIcon,
  Trash2,
  XIcon,
  PenSquare,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { supabase } from "../../lib/supabaseClient";
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
import { PiHandsClapping } from "react-icons/pi";
import { LuMessageCircle } from "react-icons/lu";
import { Separator } from "../../components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../../components/ui/drawer";
import { Button } from "../../components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Toaster } from "../../components/ui/sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ErrorBoundary from "../../components/ErrorBoundary";
import LoadingSpinner from "../../components/LoadingSpinner";

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
      console.log("Fetching posts...");

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

      // For each post, get accurate likes count
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

      console.log("Posts with accurate likes:", postsWithLikes);

      // Fetch user data for all users involved in posts and comments
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

      // Process posts with comments and likes
      const processedPosts = postsWithLikes.map((post) => {
        return {
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
        };
      });

      console.log("Processed posts:", processedPosts);
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
          console.log("Real-time like event:", payload);
          const postId = payload.new?.post_id || payload.old?.post_id;

          if (!postId) {
            console.error("Invalid postId in real-time like event");
            return;
          }

          // Fetch the updated likes count
          const { data: updatedLikes, error: likesError } = await supabase
            .from("likes")
            .select("id, user_id")
            .eq("post_id", postId);

          if (likesError) {
            console.error("Error fetching updated likes:", likesError);
            return;
          }

          // Update the posts state with the accurate likes count from the backend
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
                  // Preserve the existing comments_count
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
          console.log("Real-time comment event:", payload);
          const postId = payload.new?.post_id || payload.old?.post_id;

          if (!postId) {
            console.error("Invalid postId in real-time comment event");
            return;
          }

          // Fetch the latest data
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

          if (error) {
            console.error("Error fetching updated post:", error);
            return;
          }

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
    if (!post) {
      console.error("Post not found");
      return { success: false };
    }

    try {
      if (post.user_has_liked) {
        // Unlike the post
        const { error } = await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", currentUser.id);

        if (error) throw error;
      } else {
        // Like the post
        const { error } = await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: currentUser.id });

        if (error) throw error;
      }

      // Fetch the updated likes count
      const { data: updatedLikes, error: likesError } = await supabase
        .from("likes")
        .select("id, user_id")
        .eq("post_id", postId);

      if (likesError) throw likesError;

      // Update the posts state with the accurate likes count from the backend
      setPosts((prevPosts) => {
        return prevPosts.map((p) => {
          if (p.id === postId) {
            return {
              ...p,
              likes_count: updatedLikes.length,
              user_has_liked: updatedLikes.some(
                (like) => like.user_id === currentUser.id
              ),
              // Preserve other properties
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
    console.log("handleLike called with postId:", postId);
    if (!currentUser) {
      toast.error("Please log in to like posts");
      return;
    }

    if (!postId) {
      console.error("Invalid postId in handleLike");
      return;
    }

    const originalPost = posts.find((p) => p.id === postId);
    console.log("Original post state:", originalPost);

    // Optimistically update the UI
    setPosts((prevPosts) => {
      return prevPosts.map((p) => {
        if (p.id === postId) {
          const newLikesCount = p.user_has_liked
            ? p.likes_count - 1
            : p.likes_count + 1;
          console.log(
            `Optimistic update - Post ${postId} - New Likes: ${newLikesCount}, Comments: ${p.comments_count}`
          );
          return {
            ...p,
            likes_count: newLikesCount,
            user_has_liked: !p.user_has_liked,
          };
        }
        return p;
      });
    });

    // Perform the actual like/unlike operation and verify with the backend
    try {
      const result = await toggleLikeBackend(postId);
      console.log("Backend toggle result:", result);
      if (!result.success) {
        // If the backend operation failed, revert the optimistic update
        setPosts((prevPosts) => {
          return prevPosts.map((p) => {
            if (p.id === postId) {
              console.log(
                `Reverting optimistic update - Post ${postId} - Original Likes: ${originalPost.likes_count}, Comments: ${originalPost.comments_count}`
              );
              return originalPost;
            }
            return p;
          });
        });
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

    // Optimistically update the UI
    const newCommentObj = {
      id: Date.now(), // Temporary ID
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

    setNewComment(""); // Clear the input field

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

      // Update the post with the actual comment data from the server
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

      // Revert the optimistic update
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

  const handleCommentClick = () => {
    if (!currentUser) {
      toast.error("Please log in to view and add comments.");
      // Implement redirection to login page here
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
          {/* Search Bar */}
          <div className="px-4 my-4">
            <Link to="./filter-post">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="조황기록 검색"
                  className="w-full px-4 py-2 border border-[#128100] rounded-xl pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute right-3 top-2.5 text-[#128100] w-5 h-5" />
              </div>
            </Link>
          </div>

          {/* Monthly Fish Section */}
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

          {/* Content Area */}
          <div className="mb-5 flex flex-col gap-5 px-4">
            {posts.length === 0 ? (
              <div className="text-center text-gray-500">No posts found.</div>
            ) : (
              posts.map((post, index) => {
                const user = users[post.user_id];
                const isPrivate = post.visibility === "private";
                return (
                  <Card key={post.id} className="w-full shadow-none">
                    <CardHeader className="p-4">
                      <div className="flex items-center gap-2 justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={user?.avatar_url}
                              alt={user?.name}
                            />
                            <AvatarFallback>
                              {user?.name
                                ? user.name.charAt(0).toUpperCase()
                                : "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium">
                              {user?.name || "Unknown User"}
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
                              {currentUser &&
                                currentUser.id === post.user_id && (
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
                          <div className="w-full h-64 ">
                            <img
                              src={post.image_urls[0]}
                              alt={`Post image`}
                              className="w-full h-full object-cover"
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
                        <p className="text-sm text-justify">
                          {post.description}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col p-4 !pt-0 ">
                      <div className="flex flex-col gap-2 w-full">
                        {post.top_comments &&
                          post.top_comments.map((comment, index) => (
                            <div
                              key={index}
                              className="flex gap-2 items-center"
                            >
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
                                            {comment.user_id ===
                                              post.user_id && (
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
                                      placeholder="Add a comment..."
                                      value={newComment}
                                      onChange={(e) =>
                                        setNewComment(e.target.value)
                                      }
                                      className="flex-1 h-11"
                                    />
                                    <Button
                                      onClick={() => handleAddComment(post.id)}
                                      className="bg-green-500 text-white hover:bg-green-600 h-11 w-20"
                                    >
                                      Post
                                    </Button>
                                  </div>
                                </div>
                              </DrawerContent>
                            </Drawer>
                          ) : (
                            <button
                              onClick={handleCommentClick}
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
              })
            )}
          </div>

          {/* Floating Action Button */}
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

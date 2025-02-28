import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import {
  FreeMemberIcon,
  GoldMemberIcon,
  PaidMemberIcon,
  SupporterMemberIcon,
} from "../../components/icons/Icons";
import { supabase } from "../../lib/supabaseClient";
import { Footer } from "../footer";

const Profile = () => {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [userName, setUserName] = useState("");
  const [membershipLevel, setMembershipLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postCount, setPostCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [points, setPoints] = useState(0);
  const [activeAd, setActiveAd] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);

      // Check for cached data
      const cachedData = localStorage.getItem("userData");
      if (cachedData) {
        const parsedData = JSON.parse(cachedData);
        setUser(parsedData.user);
        setAvatarUrl(parsedData.avatar_url);
        setUserName(parsedData.name);
        setMembershipLevel(parsedData.membership_level);
        setPostCount(parsedData.post_count || 0);
        setCommentCount(parsedData.comment_count || 0);
        setPoints(parsedData.points || 0);
        setLoading(false);
      }

      // Fetch fresh data
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data, error } = await supabase
          .from("users")
          .select("avatar_url, name, membership_level, points")
          .eq("id", user.id)
          .single();

        if (data && !error) {
          setAvatarUrl(data.avatar_url);
          setUserName(data.name);
          setMembershipLevel(data.membership_level);
          setPoints(data.points || 0);

          // Fetch post count
          const { count, error: postError } = await supabase
            .from("posts")
            .select("id", { count: "exact" })
            .eq("user_id", user.id);

          if (!postError) {
            setPostCount(count);
          }

          // Fetch comment count
          const { count: commentCount, error: commentError } = await supabase
            .from("comments")
            .select("id", { count: "exact" })
            .eq("user_id", user.id);

          if (!commentError) {
            setCommentCount(commentCount);
          }

          // Cache the user data including post count
          localStorage.setItem(
            "userData",
            JSON.stringify({
              user,
              ...data,
              post_count: count,
              comment_count: commentCount,
              points: data.points || 0,
            })
          );
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchLatestActiveAd = async () => {
      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (error) {
        console.error("Error fetching advertisement:", error);
        setActiveAd(null);
      } else if (data && data.length > 0) {
        setActiveAd(data[0]);
      } else {
        setActiveAd(null);
      }
    };

    fetchLatestActiveAd();
    const adInterval = setInterval(fetchLatestActiveAd, 60000); // Check every minute

    return () => clearInterval(adInterval);
  }, []);

  const renderMembershipIcon = () => {
    switch (membershipLevel) {
      case "Free":
        return <FreeMemberIcon className="w-6 h-6 ml-1" />;
      case "Paid":
        return <PaidMemberIcon className="w-6 h-6 ml-1" />;
      case "Gold":
        return <GoldMemberIcon className="w-6 h-6 ml-1" />;
      case "Supporter":
        return <SupporterMemberIcon className="w-6 h-6 ml-1" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <h1 className="text-xl font-medium text-center py-6">내 정보</h1>

      {/* Profile Section */}
      <div className="flex items-center px-4 py-4">
        {user ? (
          <>
            <Avatar className="w-24 h-24 rounded-full mr-4 flex-shrink-0">
              <AvatarImage src={avatarUrl} alt={userName} />
              <AvatarFallback>
                {userName?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-medium mb-2 flex items-center">
                붕어잡자 <span className="mx-2">{renderMembershipIcon()}</span>{" "}
                회원님
              </h2>
              <Link to="/profile-settings">
                <Badge variant="outline" className="text-[10px] rounded-full">
                  프로필 편집
                </Badge>
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-24 h-24 rounded-full bg-gray-200 mr-4 flex-shrink-0" />
            <div className="flex flex-col items-start">
              <h2 className="text-xl font-medium mb-2">로그인을 해주세요</h2>
              <Link to="/login">
                <Badge variant="outline" className="text-[10px] rounded-full">
                  로그인 / 회원가입
                </Badge>
              </Link>
            </div>
          </>
        )}
      </div>
      <hr className="my-4 border-t border-gray-200" />

      {/* Stats */}
      <div className="mx-4 p-4 pt-5 border rounded-xl flex justify-between items-center">
        <Link to="/mobile-points" className="text-center flex-1">
          <div className="text-base font-medium">
            {points.toLocaleString()}원
          </div>
          <div className="text-xs text-muted-foreground">보유 포인트</div>
        </Link>
        <div className="w-px h-8 bg-gray-200" />
        <Link to="/my-best" className="text-center flex-1">
          <div className="text-base font-medium">0cm</div>
          <div className="text-xs text-muted-foreground">나의 최대어</div>
        </Link>
        <div className="w-px h-8 bg-gray-200" />
        <Link to="/records" className="text-center flex-1">
          <div className="text-base font-medium">{postCount}</div>
          <div className="text-xs text-muted-foreground">나의 기록</div>
        </Link>
        <div className="w-px h-8 bg-gray-200" />
        <Link to="/comments" className="text-center flex-1">
          <div className="text-base font-medium">{commentCount}</div>
          <div className="text-xs text-muted-foreground">나의 댓글</div>
        </Link>
      </div>
      <hr className="my-4 border-t border-gray-200" />

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto space-y-1 pb-48">
        <Link to="/inbox" className="block px-4 py-3">
          <span className="text-sm">내편지함</span>
        </Link>
        <Link to="/shopping-cart" className="block px-4 py-3">
          <span className="text-sm">장바구니</span>
        </Link>
        <Link to="/orders" className="block px-4 py-3">
          <span className="text-sm">주문내역 / 배송정보</span>
        </Link>
        <Link to="/notices" className="block px-4 py-3">
          <span className="text-sm">공지사항</span>
        </Link>
        <Link to="/guide" className="block px-4 py-3">
          <span className="text-sm">이용 가이드</span>
        </Link>
        <hr className="my-4 border-t border-gray-200" />
        <Link to="/product-reviews" className="block px-4 py-3">
          <span className="text-sm">제품리뷰</span>
        </Link>
        <Link to="/subscribe" className="block px-4 py-3">
          <span className="text-sm">유료 구독하기</span>
        </Link>

        <Link to="/events" className="block px-4 py-3">
          <span className="text-sm">이벤트</span>
        </Link>

        <div className="px-4 py-2">
          <div className="w-full h-16 flex items-center justify-center shadow-sm border border-black/30 rounded-lg overflow-hidden">
            {activeAd ? (
              <a
                href={activeAd.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full"
              >
                <img
                  src={activeAd.image_url || "/placeholder.svg"}
                  alt={activeAd.title}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <span className="text-[0.85rem] text-muted-foreground">
                There is no active advertisement at this moment.
              </span>
            )}
          </div>
        </div>
        <div className="px-4 py-3">
          <Link to="/customer-service" className="block">
            <span className="text-sm">고객센터</span>
          </Link>
        </div>
      </div>

      <div className="mt-auto fixed bottom-[70px] w-full">
        <Footer />
      </div>
    </div>
  );
};

export default Profile;

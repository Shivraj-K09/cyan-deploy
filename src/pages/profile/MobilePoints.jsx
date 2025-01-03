import React, { useState, useEffect } from "react";
import { ChevronsLeft } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "../../components/ui/skeleton";

const MobilePoints = () => {
  const [pointsHistory, setPointsHistory] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPointsData();
  }, []);

  const getPointsForPost = (visibility, membershipLevel) => {
    if (visibility === "public") {
      switch (membershipLevel) {
        case "Free":
          return 100;
        case "Paid":
        case "Gold":
        case "Supporter":
          return 1000;
        default:
          return 0;
      }
    } else {
      return 0; // No points for private posts
    }
  };

  const fetchPointsData = async () => {
    try {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch user's membership level, last_points_award_date, and points
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("membership_level, last_points_award_date, created_at, points")
        .eq("id", user.id)
        .single();

      if (userError) throw userError;

      console.log("User data:", userData);

      const { membership_level, last_points_award_date, created_at, points } =
        userData;
      setTotalPoints(points);

      // Fetch posts to calculate points history for the authenticated user
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, created_at, description, visibility")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      console.log("Posts data:", postsData);

      let history = postsData
        .map((post) => {
          const pointsEarned = getPointsForPost(
            post.visibility,
            membership_level
          );
          return {
            date: new Date(post.created_at).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            type: "게시물 작성",
            description: `[게시물] ${post.description}`,
            amount: pointsEarned,
          };
        })
        .filter((item) => item.amount > 0);

      // Add rewards for Gold and Supporter memberships
      if (membership_level === "Gold" || membership_level === "Supporter") {
        const startDate = new Date(created_at);
        const lastAwardDate = last_points_award_date
          ? new Date(last_points_award_date)
          : startDate;
        const now = new Date();

        // Calculate monthly periods from account creation to now
        let monthlyPeriods = Math.floor(
          (now - startDate) / (1000 * 60 * 60 * 24 * 30)
        ); // Approximate months

        // Add rewards for all periods up to now
        for (let i = 0; i < monthlyPeriods; i++) {
          const rewardDate = new Date(startDate);
          rewardDate.setMonth(rewardDate.getMonth() + i + 1);

          history.push({
            date: rewardDate.toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }),
            type: "정기 보상",
            description: `${membership_level} 멤버십 월간 보상`,
            amount: membership_level === "Gold" ? 100000 : 1000000,
          });
        }
      }

      // Sort history by date, most recent first
      history.sort((a, b) => new Date(b.date) - new Date(a.date));

      console.log("Final points history:", history);
      setPointsHistory(history);
    } catch (error) {
      console.error("Error fetching points data:", error);
      setError(
        error.message ||
          "Failed to load points history. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderSkeletons = () => (
    <>
      {[...Array(7)].map((_, index) => (
        <div key={index} className="px-4 py-5 border-b">
          <Skeleton className="h-4 w-1/4 mb-2" />
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
      ))}
    </>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-6">
        <div className="flex items-center px-4 py-3">
          <Skeleton className="w-6 h-6 mr-4" />
          <Skeleton className="h-6 w-1/2 mx-auto" />
        </div>
        <hr className="border-t border-gray-200" />
        {renderSkeletons()}
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchPointsData}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-6">
      <div className="flex items-center px-4 py-3">
        <button
          onClick={() => navigate(-1)}
          className="mr-4"
          aria-label="Go back"
        >
          <ChevronsLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-medium flex-1 text-center mr-6">
          포인트 내역
        </h1>
      </div>
      <hr className="border-t border-gray-200" />

      {/* Total points display */}
      {/* <div className="px-4 py-5 bg-blue-50">
        <div className="text-lg font-semibold text-center">
          총 포인트: {totalPoints.toLocaleString()}P
        </div>
      </div> */}

      <div className="flex flex-col">
        {pointsHistory.length > 0 ? (
          pointsHistory.map((item, index) => (
            <div key={index} className="px-4 py-5 border-b">
              <div className="text-sm text-muted-foreground mb-1">
                {item.date}
              </div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium mb-1">{item.type}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1 w-[300px]">
                    {item.description}
                  </div>
                </div>
                <div className="font-medium text-blue-500">
                  +{item.amount.toLocaleString()}P
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-5 text-center text-muted-foreground">
            포인트 내역이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};

export default MobilePoints;

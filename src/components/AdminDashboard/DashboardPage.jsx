"use client";

import { useEffect, useState } from "react";
import { addDays } from "date-fns";
import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatCard } from "./StatCard";
import MembershipChart from "./MemberShipChart";
import { supabase } from "@/lib/supabaseClient";

export function DashboardPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [date, setDate] = useState({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchUserStats = async () => {
    const now = new Date();
    const oneWeekAgo = addDays(now, -7);

    const { data: allUsers, error: userError } = await supabase
      .from("users")
      .select("id, created_at, membership_level");

    if (userError) throw userError;

    const newUsers = allUsers.filter(
      (user) => new Date(user.created_at) >= oneWeekAgo
    );

    const currentStats = {
      totalUsers: allUsers.length,
      newUsers: newUsers.length,
      freeUsers: allUsers.filter((user) => user.membership_level === "Free")
        .length,
      paidUsers: allUsers.filter((user) => user.membership_level === "Paid")
        .length,
      goldUsers: allUsers.filter((user) => user.membership_level === "Gold")
        .length,
      supporterUsers: allUsers.filter(
        (user) => user.membership_level === "Supporter"
      ).length,
    };

    const { data: previousWeekUsers, error: previousError } = await supabase
      .from("users")
      .select("id, membership_level")
      .lt("created_at", oneWeekAgo.toISOString());

    if (previousError) throw previousError;

    const previousStats = {
      totalUsers: previousWeekUsers.length,
      newUsers: 0, // We don't have data for new users from the week before
      freeUsers: previousWeekUsers.filter(
        (user) => user.membership_level === "Free"
      ).length,
      paidUsers: previousWeekUsers.filter(
        (user) => user.membership_level === "Paid"
      ).length,
      goldUsers: previousWeekUsers.filter(
        (user) => user.membership_level === "Gold"
      ).length,
      supporterUsers: previousWeekUsers.filter(
        (user) => user.membership_level === "Supporter"
      ).length,
    };

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: currentStats,
      previous: previousStats,
      growth: {
        totalUsers: calculateGrowth(
          currentStats.totalUsers,
          previousStats.totalUsers
        ),
        newUsers: calculateGrowth(
          currentStats.newUsers,
          previousStats.newUsers
        ),
        freeUsers: calculateGrowth(
          currentStats.freeUsers,
          previousStats.freeUsers
        ),
        paidUsers: calculateGrowth(
          currentStats.paidUsers,
          previousStats.paidUsers
        ),
        goldUsers: calculateGrowth(
          currentStats.goldUsers,
          previousStats.goldUsers
        ),
        supporterUsers: calculateGrowth(
          currentStats.supporterUsers,
          previousStats.supporterUsers
        ),
      },
    };
  };

  const fetchTotalPosts = async () => {
    const now = new Date();
    const oneWeekAgo = addDays(now, -7);

    const { count: currentCount, error: currentError } = await supabase
      .from("posts")
      .select("id", { count: "exact" });

    if (currentError) throw currentError;

    const { count: previousCount, error: previousError } = await supabase
      .from("posts")
      .select("id", { count: "exact" })
      .lt("created_at", oneWeekAgo.toISOString());

    if (previousError) throw previousError;

    const calculateGrowth = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    return {
      current: currentCount,
      previous: previousCount,
      growth: calculateGrowth(currentCount, previousCount),
    };
  };

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      const userStats = await fetchUserStats();
      const postsStats = await fetchTotalPosts();

      setStats({
        ...userStats.current,
        totalPosts: postsStats.current,
        pointsUsed: 45678, // Keeping demo data for now
        pointsPaid: 38541, // Keeping demo data for now
        growth: {
          ...userStats.growth,
          totalPosts: postsStats.growth,
          pointsUsed: -2, // Demo growth data
          pointsPaid: 5, // Demo growth data
        },
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardStats();
  };

  const handleBack = () => {
    navigate("/admin");
  };

  if (isLoading || !stats) {
    return <div>Loading...</div>;
  }

  const statsArray = [
    {
      title: "새로운 회원",
      value: stats.newUsers.toString(),
      change: stats.growth.newUsers.toFixed(1),
      changeType: stats.growth.newUsers >= 0 ? "increase" : "decrease",
      icon: "Users",
    },
    {
      title: "무료 회원",
      value: stats.freeUsers.toString(),
      change: stats.growth.freeUsers.toFixed(1),
      changeType: stats.growth.freeUsers >= 0 ? "increase" : "decrease",
      icon: "UserCheck",
    },
    {
      title: "유료 회원",
      value: stats.paidUsers.toString(),
      change: stats.growth.paidUsers.toFixed(1),
      changeType: stats.growth.paidUsers >= 0 ? "increase" : "decrease",
      icon: "CreditCard",
    },
    {
      title: "골드 멤버스",
      value: stats.goldUsers.toString(),
      change: stats.growth.goldUsers.toFixed(1),
      changeType: stats.growth.goldUsers >= 0 ? "increase" : "decrease",
      icon: "Crown",
    },
    {
      title: "후원 회원",
      value: stats.supporterUsers.toString(),
      change: stats.growth.supporterUsers.toFixed(1),
      changeType: stats.growth.supporterUsers >= 0 ? "increase" : "decrease",
      icon: "HeartHandshake",
    },
    {
      title: "총 게시물",
      value: stats.totalPosts.toString(),
      change: stats.growth.totalPosts.toFixed(1),
      changeType: stats.growth.totalPosts >= 0 ? "increase" : "decrease",
      icon: "MessageSquare",
    },
    {
      title: "사용한 포인트",
      value: stats.pointsUsed.toString(),
      change: stats.growth.pointsUsed.toFixed(1),
      changeType: stats.growth.pointsUsed >= 0 ? "increase" : "decrease",
      icon: "Coins",
    },
    {
      title: "포인트 지급",
      value: stats.pointsPaid.toString(),
      change: stats.growth.pointsPaid.toFixed(1),
      changeType: stats.growth.pointsPaid >= 0 ? "increase" : "decrease",
      icon: "CreditCard",
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-300 px-4 h-14 flex items-center">
        <button onClick={handleBack} className="flex items-center">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-800 flex-1 ml-2">
            게시판
          </h3>
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-4 pb-32">
        <div className="grid grid-cols-2 gap-3 mt-4">
          <StatCard {...statsArray[0]} fullWidth />
          <StatCard {...statsArray[7]} fullWidth />
          <StatCard {...statsArray[6]} fullWidth />
          {statsArray.slice(1, 6).map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}

          <MembershipChart
            membershipData={{
              Free: stats.freeUsers,
              Paid: stats.paidUsers,
              Gold: stats.goldUsers,
              Supporter: stats.supporterUsers,
            }}
          />
        </div>
      </div>
    </div>
  );
}

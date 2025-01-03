import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Skeleton } from "../components/ui/skeleton";
import { Button } from "../components/ui/button";
import { UserIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { toast } from "sonner";
import {
  FreeMemberIcon,
  GoldMemberIcon,
  PaidMemberIcon,
  SupporterMemberIcon,
} from "../components/icons/Icons";
import {
  setUser,
  clearUser,
  updatePoints,
  updateLastPointsAwardDate,
} from "../store/userSlice";
import { checkAndAwardMonthlyPoints } from "../utils/pointSystem";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../components/ui/alert-dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const MembershipIcon = ({ membershipLevel }) => {
  if (membershipLevel === "Free")
    return <FreeMemberIcon className="w-4 h-4 ml-1" />;
  if (membershipLevel === "Paid")
    return <PaidMemberIcon className="w-4 h-4 ml-1" />;
  if (membershipLevel === "Gold")
    return <GoldMemberIcon className="w-4 h-4 ml-1" />;
  if (membershipLevel === "Supporter")
    return <SupporterMemberIcon className="w-4 h-4 ml-1" />;
  return null;
};

const TopNav = () => {
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("users")
          .select(
            "avatar_url, name, membership_level, points, last_points_award_date"
          )
          .eq("id", user.id)
          .single();
        if (data && !error) {
          console.log("User data before daily points check:", data);
          dispatch(
            setUser({
              id: user.id,
              name: data.name,
              avatarUrl: data.avatar_url,
              membershipLevel: data.membership_level,
              points: data.points,
              lastPointsAwardDate: data.last_points_award_date,
            })
          );
          // Check and award daily points
          await checkAndAwardMonthlyPoints(user.id);
          // Fetch updated user data after awarding points
          const { data: updatedData, error: updatedError } = await supabase
            .from("users")
            .select("points, last_points_award_date")
            .eq("id", user.id)
            .single();
          if (updatedData && !updatedError) {
            console.log("User data after daily points check:", updatedData);
            dispatch(updatePoints(updatedData.points));
            dispatch(
              updateLastPointsAwardDate(updatedData.last_points_award_date)
            );
          }
        }
      }
      setIsLoading(false);
    };

    fetchUserData();
  }, [dispatch]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Logout Failed", {
        description: error.message,
      });
    } else {
      dispatch(clearUser());
      toast.success("You have been logged out");
      navigate("/login");
    }
    setIsLoggingOut(false);
  };

  if (location.pathname === "/profile") {
    return null;
  }

  const formattedPoints = new Intl.NumberFormat("ko-KR").format(user.points);

  return (
    <div className="p-4 border-b sticky top-0 z-50 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLoading ? (
            <Skeleton className="h-10 w-10 rounded-full" />
          ) : (
            <Avatar className="h-10 w-10">
              {user.avatarUrl ? (
                <AvatarImage src={user.avatarUrl} alt={user.name} />
              ) : (
                <AvatarFallback>
                  <UserIcon className="h-6 w-6" />
                </AvatarFallback>
              )}
              {user.avatarUrl && (
                <AvatarFallback>
                  {user.name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              )}
            </Avatar>
          )}

          <div>
            <div className="text-sm font-bold flex items-center">
              봉어잡자
              <MembershipIcon membershipLevel={user.membershipLevel} />
            </div>
            <div className="text-sm font-bold">
              내 포인트: {formattedPoints} P
            </div>
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="h-10 w-24 rounded-xl" />
        ) : user.id ? (
          <>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button className="px-4 py-2 text-[#128100] bg-green-200 hover:bg-green-300 font-bold rounded-xl">
                  로그아웃
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="w-[350px] rounded-xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>로그아웃 하시겠습니까?</AlertDialogTitle>
                  <VisuallyHidden>
                    <AlertDialogDescription></AlertDialogDescription>
                  </VisuallyHidden>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex flex-row items-center gap-3">
                  <AlertDialogCancel className="mt-0 w-full h-12 rounded-xl bg-[#128100] text-white">
                    뒤로가기
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="w-full h-12 rounded-xl bg-[#D9D9D9] text-black"
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                  >
                    {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        ) : (
          <Link
            to="/login"
            className="px-4 py-2 text-[#128100] bg-green-200 font-bold rounded-xl"
          >
            로그인
          </Link>
        )}
      </div>
    </div>
  );
};

export default TopNav;

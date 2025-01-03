import { supabase } from "../lib/supabaseClient";
import { store } from "../store";
import { updatePoints, updateLastPointsAwardDate } from "../store/userSlice";

export async function getUserMembershipLevel(userId) {
  const { data, error } = await supabase
    .from("users")
    .select("membership_level")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching user membership level:", error);
    return "Free";
  }

  // Check and award monthly points
  await checkAndAwardMonthlyPoints(userId);

  return data.membership_level;
}

export async function awardPointsForPublicPost(userId, membershipLevel) {
  console.log(
    `Awarding points for user ${userId} with membership level ${membershipLevel}`
  );
  let pointsToAward = 0;

  switch (membershipLevel) {
    case "Free":
      pointsToAward = 100;
      break;
    case "Paid":
      pointsToAward = 1000;
      break;
    case "Gold":
    case "Supporter":
      pointsToAward = 1000; // Same as Paid members
      break;
    default:
      pointsToAward = 0;
  }

  console.log(`Points to award: ${pointsToAward}`);

  if (pointsToAward > 0) {
    // First, get the current points
    const { data: userData, error: fetchError } = await supabase
      .from("users")
      .select("points")
      .eq("id", userId)
      .single();

    if (fetchError) {
      console.error("Error fetching user points:", fetchError);
      return 0;
    }

    console.log(`Current user points: ${userData.points}`);

    // Then, update the points
    const { data, error } = await supabase
      .from("users")
      .update({ points: userData.points + pointsToAward })
      .eq("id", userId)
      .select("points");

    if (error) {
      console.error("Error awarding points:", error);
      return 0;
    } else {
      console.log(
        `Awarded ${pointsToAward} points. New total:`,
        data[0].points
      );

      // Update the post's points_awarded status
      const { error: updateError } = await supabase
        .from("posts")
        .update({ points_awarded: true })
        .eq("user_id", userId)
        .eq("visibility", "public")
        .eq("points_awarded", false);

      if (updateError) {
        console.error(
          "Error updating post points_awarded status:",
          updateError
        );
      } else {
        console.log("Successfully updated post points_awarded status");
      }

      // Update Redux store
      store.dispatch(updatePoints(data[0].points));

      return pointsToAward;
    }
  } else {
    console.log(
      "No points awarded due to membership level or other conditions"
    );
    return 0;
  }
}

export async function checkAndAwardPointsForExistingPublicPosts(userId) {
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("membership_level")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    return;
  }

  const { data: posts, error: postsError } = await supabase
    .from("posts")
    .select("id")
    .eq("user_id", userId)
    .eq("visibility", "public")
    .eq("points_awarded", false);

  if (postsError) {
    console.error("Error fetching public posts:", postsError);
    return;
  }

  if (posts.length === 0) {
    console.log("No new public posts to award points for.");
    return;
  }

  let pointsToAward = 0;
  switch (user.membership_level) {
    case "Free":
      pointsToAward = 100 * posts.length;
      break;
    case "Paid":
    case "Gold":
    case "Supporter":
      pointsToAward = 1000 * posts.length;
      break;
    default:
      pointsToAward = 0;
  }

  if (pointsToAward > 0) {
    const { data, error: updateError } = await supabase
      .from("users")
      .update({ points: supabase.raw(`points + ${pointsToAward}`) })
      .eq("id", userId)
      .select("points");

    if (updateError) {
      console.error("Error updating user points:", updateError);
    } else {
      console.log(
        `Awarded ${pointsToAward} points for ${posts.length} posts. New total:`,
        data[0].points
      );

      // Update Redux store
      store.dispatch(updatePoints(data[0].points));
    }

    const { error: postsUpdateError } = await supabase
      .from("posts")
      .update({ points_awarded: true })
      .eq("user_id", userId)
      .eq("visibility", "public")
      .eq("points_awarded", false);

    if (postsUpdateError) {
      console.error(
        "Error updating posts points_awarded status:",
        postsUpdateError
      );
    }
  }
}

export async function checkAndAwardMonthlyPoints(userId) {
  console.log("Checking daily points for user:", userId);
  const { data: user, error: userError } = await supabase
    .from("users")
    .select("membership_level, last_points_award_date, created_at, points")
    .eq("id", userId)
    .single();

  if (userError) {
    console.error("Error fetching user:", userError);
    return;
  }

  const now = new Date();
  // Use created_at as initial date if no last_points_award_date exists
  const startDate = user.last_points_award_date
    ? new Date(user.last_points_award_date)
    : new Date(user.created_at);
  const monthsSinceStart =
    (now.getFullYear() - startDate.getFullYear()) * 12 +
    now.getMonth() -
    startDate.getMonth();

  console.log("Start date:", startDate);
  console.log("Months since start:", monthsSinceStart);

  if (monthsSinceStart < 1) {
    console.log("Not enough time has passed since the last points award.");
    return;
  }

  let pointsPerMonth = 0;
  switch (user.membership_level) {
    case "Gold":
      pointsPerMonth = 100000;
      break;
    case "Supporter":
      pointsPerMonth = 1000000;
      break;
    default:
      console.log("User is not eligible for monthly points.");
      return;
  }

  // Calculate total points for all days since start
  const totalPointsToAward = pointsPerMonth * monthsSinceStart;
  console.log(
    `Awarding points for ${monthsSinceStart} months at ${pointsPerMonth} points per month. Total: ${totalPointsToAward}`
  );

  const { data, error: updateError } = await supabase
    .from("users")
    .update({
      points: user.points + totalPointsToAward,
      last_points_award_date: now.toISOString(),
    })
    .eq("id", userId)
    .select("points");

  if (updateError) {
    console.error("Error updating user points:", updateError);
  } else {
    console.log(
      `Awarded ${totalPointsToAward} points for ${monthsSinceStart} months. New total:`,
      data[0].points
    );

    // Update Redux store
    store.dispatch(updatePoints(data[0].points));
    store.dispatch(updateLastPointsAwardDate(now.toISOString()));
  }
}

import React, { useState, useEffect } from "react";
import { ChevronsLeft, PlusCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { supabase } from "../../lib/supabaseClient";
import { Link } from "react-router-dom";

const Records = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      const cachedRecords = localStorage.getItem("fishCatchRecords");

      if (cachedRecords) {
        // Clear cache to ensure we're getting fresh data while debugging
        localStorage.removeItem("fishCatchRecords");
      } else {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (!user) throw new Error("No user logged in");

          const { data, error } = await supabase
            .from("posts")
            .select(
              `
              id,
              user_id,
              description,
              created_at,
              image_urls,
              visibility
            `
            )
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

          if (error) throw error;

          // Debug log to check raw data
          console.log("Raw data from Supabase:", data);

          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("name")
            .eq("id", user.id)
            .single();

          if (userError) throw userError;

          const formattedRecords = data.map((record) => {
            // Debug log for each record
            console.log("Processing record:", record);

            return {
              id: record.id,
              username: userData.name,
              date: new Date(record.created_at).toLocaleDateString(),
              content: record.description.split("\n")[0] || "No content",
              description: record.description,
              visibility: record.visibility || "private", // Provide default value if undefined
              imageUrl:
                record.image_urls && record.image_urls.length > 0
                  ? record.image_urls[0]
                  : null,
            };
          });

          console.log("Formatted records:", formattedRecords);

          setRecords(formattedRecords);
          localStorage.setItem(
            "fishCatchRecords",
            JSON.stringify(formattedRecords)
          );
        } catch (error) {
          console.error("Error fetching records:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchRecords();
  }, []);

  // Debug log for current records state
  console.log("Current records state:", records);

  const filteredRecords = records.filter((record) => {
    console.log(`Filtering record ${record.id}:`, record);
    return activeTab === "all" || record.visibility === activeTab;
  });

  const getPostCount = (visibility) => {
    if (visibility === "all") return records.length;
    return records.filter((record) => record.visibility === visibility).length;
  };

  const renderNoRecordsMessage = () => {
    switch (activeTab) {
      case "all":
        return (
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-4">아직 기록이 없습니다</p>
            <p className="text-sm text-gray-500 mb-4">
              첫 번째 기록을 작성해 보세요!
            </p>
            <Link to="/create-post">
              <Button className="bg-green-500 hover:bg-green-600 text-white">
                <PlusCircle className="mr-2 h-4 w-4" />
                기록 작성하기
              </Button>
            </Link>
          </div>
        );
      case "public":
        return (
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-4">공개된 기록이 없습니다</p>
            <p className="text-sm text-gray-500">
              첫 번째 공개 기록을 작성해 보세요!
            </p>
          </div>
        );
      case "private":
        return (
          <div className="text-center py-8">
            <p className="text-lg font-semibold mb-4">비공개 기록이 없습니다</p>
            <p className="text-sm text-gray-500">
              첫 번째 비공개 기록을 작성해 보세요!
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-background">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 bg-background z-10">
        <div className="flex items-center px-4 py-3">
          <a href="/profile" className="mr-4" aria-label="Go back">
            <ChevronsLeft className="w-6 h-6" />
          </a>
          <h1 className="text-lg font-medium flex-1 text-center mr-6">
            나의 기록
          </h1>
        </div>
        <hr className="border-t border-gray-200" />
      </div>

      <div className="flex-1 overflow-y-auto h-screen pt-14">
        {/* Tabs */}
        <div className="flex justify-start gap-2 p-4 pl-6">
          <Button
            variant="ghost"
            className={`${
              activeTab === "all"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("all")}
          >
            전체 ({getPostCount("all")})
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === "public"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("public")}
          >
            공개 ({getPostCount("public")})
          </Button>
          <Button
            variant="ghost"
            className={`${
              activeTab === "private"
                ? "bg-secondary text-secondary-foreground"
                : ""
            } w-32 px-2`}
            onClick={() => setActiveTab("private")}
          >
            비공개 ({getPostCount("private")})
          </Button>
        </div>

        {/* Records List */}
        <div className="flex flex-col p-4 gap-4">
          {loading ? (
            <p>Loading records...</p>
          ) : filteredRecords.length === 0 ? (
            renderNoRecordsMessage()
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="flex gap-3 p-3 rounded-2xl border border-green-500 items-start"
              >
                <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden">
                  {record.imageUrl && (
                    <img
                      src={record.imageUrl}
                      alt="Fish catch"
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm">{record.username}</span>

                    <span className="text-xs px-2 py-1 rounded-full border">
                      {record.visibility}
                    </span>
                  </div>
                  <span className="text-xs mb-2 text-muted-foreground">
                    {record.date}
                  </span>
                  <p className="text-sm mb-1 break-words line-clamp-2 text-balance">
                    {record.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Records;

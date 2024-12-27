import React, { useState, useEffect } from "react";
import { IoChevronBackOutline, IoSearchOutline } from "react-icons/io5";
import { Link } from "react-router-dom";
import { Input } from "../../components/ui/input";
import { supabase } from "../../lib/supabaseClient";

export default function SearchPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("");
  const [fishSpecies, setFishSpecies] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [membershipLevel, setMembershipLevel] = useState("Free");
  const [user, setUser] = useState(null);
  const [showSearchInterface, setShowSearchInterface] = useState(true);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      const { data, error } = await supabase
        .from("users")
        .select("membership_level")
        .eq("id", user.id)
        .single();
      if (data) {
        setMembershipLevel(data.membership_level);
      }
    }
  };

  const periods =
    membershipLevel === "Free"
      ? [
          { id: "1week", label: "1주전" },
          { id: "2weeks", label: "2주전" },
          { id: "3weeks", label: "3주전" },
          { id: "1month", label: "1개월전" },
        ]
      : [
          { id: "1day", label: "1일전" },
          { id: "3days", label: "3일전" },
          { id: "1week", label: "1주전" },
          { id: "1month", label: "1개월전" },
          { id: "3months", label: "3개월" },
          { id: "5months", label: "5개월" },
          { id: "1year", label: "1년전" },
          { id: "direct", label: "직접입력" },
        ];

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    let timeFilter = "";
    const now = new Date();
    switch (selectedPeriod) {
      case "1day":
        timeFilter = now.setDate(now.getDate() - 1);
        break;
      case "3days":
        timeFilter = now.setDate(now.getDate() - 3);
        break;
      case "1week":
        timeFilter = now.setDate(now.getDate() - 7);
        break;
      case "2weeks":
        timeFilter = now.setDate(now.getDate() - 14);
        break;
      case "3weeks":
        timeFilter = now.setDate(now.getDate() - 21);
        break;
      case "1month":
        timeFilter = now.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        timeFilter = now.setMonth(now.getMonth() - 3);
        break;
      case "5months":
        timeFilter = now.setMonth(now.getMonth() - 5);
        break;
      case "1year":
        timeFilter = now.setFullYear(now.getFullYear() - 1);
        break;
      default:
        timeFilter = "";
    }

    let query = supabase
      .from("posts")
      .select(
        `
        id,
        description,
        created_at,
        image_urls,
        users (
          name
        )
      `
      )
      .ilike("description", `%${searchQuery}%`);

    if (timeFilter) {
      query = query.gte("created_at", new Date(timeFilter).toISOString());
    }

    if (fishSpecies) {
      query = query.eq("fish_species", "붕어");
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching search results:", error);
    } else {
      console.log("Search results:", data);
      setSearchResults(data);
      setShowSearchInterface(false);
    }
  };

  const highlightSearchQuery = (text) => {
    if (!searchQuery.trim()) return text;
    const parts = text.split(new RegExp(`(${searchQuery})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === searchQuery.toLowerCase() ? (
        <span key={index} className="bg-[#4B4BA0] text-white">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const getPublicUrl = (url) => {
    if (url.startsWith("http")) {
      return url; // If it's already a full URL, return it as is
    }
    // If it's a path, use the Supabase storage to get the public URL
    const { data } = supabase.storage
      .from("fish-catch-images")
      .getPublicUrl(url);
    return data.publicUrl;
  };

  return (
    <div className="mx-auto h-screen bg-gray-50">
      <div className="flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center px-4 py-3 bg-white">
          <Link className="p-2" to="/fish-catch-record">
            <IoChevronBackOutline className="w-5 h-5" />
          </Link>
          <h1 className="flex-1 text-center text-lg font-medium">상세검색</h1>
        </div>

        {/* Search Input */}
        <div className="p-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="조합기록 검색"
              className="w-full px-4 py-2 pl-10 h-11 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <IoSearchOutline className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          </div>
          {/* Commented out error message */}
          {/* <p className="text-red-500 text-sm mt-1">
            공급자산 조합기록의 키워드를 입력해주세요
          </p> */}

          {showSearchInterface && (
            <>
              {/* Species Section */}
              <div className="mt-6">
                <h2 className="text-lg mb-2">어종</h2>
                <button
                  onClick={() => setFishSpecies(!fishSpecies)}
                  className={`p-2 rounded-lg text-center ${
                    fishSpecies
                      ? "border border-[#128100] font-bold bg-white text-[#128100]"
                      : "bg-white border border-gray-200"
                  }`}
                >
                  <div className="text-sm">붕어</div>
                </button>
              </div>

              {/* Date Selection */}
              <div className="mt-6">
                <h2 className="text-lg mb-2">날짜 선택</h2>
                <div className="grid grid-cols-4 gap-2">
                  {periods.map((period) => (
                    <button
                      key={period.id}
                      onClick={() => setSelectedPeriod(period.id)}
                      className={`p-2 rounded-lg text-center ${
                        selectedPeriod === period.id
                          ? "border border-[#128100] font-bold bg-white text-[#128100]"
                          : "bg-white border border-gray-200"
                      }`}
                    >
                      <div className="text-sm">{period.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button
                  className="mt-8 bg-[#128100] px-16 text-white p-3 rounded-lg"
                  onClick={handleSearch}
                >
                  검색
                </button>
              </div>
            </>
          )}
        </div>

        {/* Search Results */}
        {!showSearchInterface && searchResults.length > 0 && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">검색 결과</h2>
              <button
                className="text-[#128100] underline"
                onClick={() => setShowSearchInterface(true)}
              >
                필터
              </button>
            </div>
            {searchResults.map((record) => {
              const firstImageUrl =
                record.image_urls && record.image_urls.length > 0
                  ? getPublicUrl(record.image_urls[0])
                  : null;

              return (
                <div
                  key={record.id}
                  className="flex gap-3 p-3 rounded-2xl border border-green-500 items-start mb-4"
                >
                  <div className="w-24 h-24 bg-gray-200 rounded-2xl flex-shrink-0 overflow-hidden">
                    {firstImageUrl && (
                      <img
                        src={firstImageUrl}
                        alt="Post image"
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{record.users.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {highlightSearchQuery(record.description)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

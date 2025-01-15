import { openDB } from "idb";
import { Loader2Icon, MapIcon, SatelliteIcon } from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { supabase } from "../../lib/supabaseClient";
import { Switch } from "../../components/ui/switch";
import ReactDOM from "react-dom/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import {
  checkAndAwardPointsForExistingPublicPosts,
  awardPointsForPublicPost,
  getUserMembershipLevel,
} from "../../utils/pointSystem";

const CACHE_KEY = "kakaoMapLoaded";
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

const initIndexedDB = async () => {
  return openDB("KakaoMapsCache", 1, {
    upgrade(db) {
      db.createObjectStore("mapData");
    },
  });
};

const getCachedData = async () => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction("mapData", "readonly");
    const store = tx.objectStore("mapData");
    const cachedData = await store.get(CACHE_KEY);

    console.log("Cached data:", cachedData);

    if (cachedData && Date.now() - cachedData.timestamp < CACHE_EXPIRATION) {
      console.log(
        "Valid cache found, timestamp:",
        new Date(cachedData.timestamp)
      );
      return cachedData.loaded;
    } else if (cachedData) {
      console.log("Cache expired, timestamp:", new Date(cachedData.timestamp));
    } else {
      console.log("No cache found");
    }
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
  }

  return false;
};

const setCachedData = async (loaded) => {
  try {
    const db = await initIndexedDB();
    const tx = db.transaction("mapData", "readwrite");
    const store = tx.objectStore("mapData");
    const timestamp = Date.now();
    await store.put({ loaded, timestamp }, CACHE_KEY);
    console.log("Cache set successfully, timestamp:", new Date(timestamp));
  } catch (error) {
    console.error("Error writing to IndexedDB:", error);
  }
};

export default function MyMap() {
  const [map, setMap] = useState(null);
  const [kakaoMapsLoaded, setKakaoMapsLoaded] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const user = useSelector((state) => state.user);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [userPosts, setUserPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const customOverlaysRef = useRef(new Map());
  const popupOverlayRef = useRef(null);
  const popupContentRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      if (!user.id) {
        setShowLoginAlert(true);
      } else {
        await fetchUserPosts(user.id);
        await checkAndAwardPointsForExistingPublicPosts(user.id);
      }
    };
    checkUser();
  }, [user.id]);

  const fetchUserPosts = async (userId) => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        visibility,
        created_at,
        description,
        points_awarded,
        locations (
          id,
          latitude,
          longitude,
          place_name,
          address
        )
      `
      )
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user posts:", error);
    } else {
      setUserPosts(data);
    }
  };

  useEffect(() => {
    const loadKakaoMaps = async () => {
      const isLoaded = await getCachedData();
      if (isLoaded && window.kakao && window.kakao.maps) {
        console.log("Kakao Maps loaded from cache");
        setKakaoMapsLoaded(true);
        setIsLoading(false);
        return;
      }

      console.log("Loading Kakao Maps from CDN");

      const script = document.createElement("script");
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
        import.meta.env.VITE_KAKAO_MAPS_API_KEY
      }&autoload=false`;
      script.async = true;

      script.onload = () => {
        window.kakao.maps.load(() => {
          console.log("Kakao Maps loaded from CDN");
          setCachedData(true);
          setKakaoMapsLoaded(true);
          setIsLoading(false);
        });
      };

      document.head.appendChild(script);
    };

    if (user.id) {
      loadKakaoMaps();
    }
  }, [user.id]);

  useEffect(() => {
    if (
      user.id &&
      kakaoMapsLoaded &&
      !map &&
      window.kakao &&
      window.kakao.maps
    ) {
      const container = document.getElementById("map");
      if (container) {
        const options = {
          center: new window.kakao.maps.LatLng(36.5, 127.5),
          level: 13,
        };
        const newMap = new window.kakao.maps.Map(container, options);
        setMap(newMap);
      }
    }
  }, [kakaoMapsLoaded, map, user.id]);

  const toggleVisibility = useCallback(
    async (postId, currentVisibility) => {
      console.log("toggleVisibility called", postId, currentVisibility);
      const newVisibility =
        currentVisibility === "public" ? "private" : "public";

      // Prevent the popover from closing
      setIsPopoverOpen(true);

      // Find the current post
      const currentPost = userPosts.find((post) => post.id === postId);
      if (!currentPost) {
        console.error("Post not found:", postId);
        return;
      }

      // Optimistic UI update
      setUserPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, visibility: newVisibility } : post
        )
      );

      // Update marker color
      const overlay = customOverlaysRef.current.get(postId);
      if (overlay) {
        const markerContent = overlay.getContent();
        const svg = markerContent.querySelector("svg");
        svg.setAttribute(
          "fill",
          newVisibility === "public" ? "#128100" : "#FF0000"
        );
      }

      // Update in the database
      const { error } = await supabase
        .from("posts")
        .update({ visibility: newVisibility })
        .eq("id", postId);

      if (error) {
        console.error("Error updating post visibility:", error);
        // Revert optimistic update if there's an error
        setUserPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId
              ? { ...post, visibility: currentVisibility }
              : post
          )
        );
        // Revert marker color
        if (overlay) {
          const markerContent = overlay.getContent();
          const svg = markerContent.querySelector("svg");
          svg.setAttribute(
            "fill",
            currentVisibility === "public" ? "#128100" : "#FF0000"
          );
        }
      } else if (newVisibility === "public" && !currentPost.points_awarded) {
        // Award points for making the post public
        const membershipLevel = await getUserMembershipLevel(user.id);
        await awardPointsForPublicPost(user.id, membershipLevel);

        // Update points_awarded status
        await supabase
          .from("posts")
          .update({ points_awarded: true })
          .eq("id", postId);

        // Update local state to reflect points_awarded change
        setUserPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.id === postId ? { ...post, points_awarded: true } : post
          )
        );
      }

      // Force re-render of the switch to update its state
      const switchContainer = document.getElementById(`switch-${postId}`);
      if (switchContainer) {
        const root = ReactDOM.createRoot(switchContainer);
        root.render(
          <Switch
            checked={newVisibility === "public"}
            onCheckedChange={() => toggleVisibility(postId, newVisibility)}
            className="data-[state=checked]:bg-[#128100]"
          />
        );
      }
      console.log("toggleVisibility completed", postId, newVisibility);
    },
    [user.id, userPosts]
  );

  const createPopupContent = useCallback(
    (post) => {
      const popupContent = document.createElement("div");
      popupContent.style.position = "absolute";
      popupContent.style.bottom = "40px";
      popupContent.style.left = "50%";
      popupContent.style.transform = "translateX(-50%)";

      // Create main popup div
      const popupMain = document.createElement("div");
      Object.assign(popupMain.style, {
        position: "relative",
        background: "white",
        borderRadius: "12px",
        padding: "16px",
        width: "280px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      });

      // Create arrow pointer
      const arrow = document.createElement("div");
      Object.assign(arrow.style, {
        position: "absolute",
        bottom: "-8px",
        left: "50%",
        transform: "translateX(-50%)",
        width: "0",
        height: "0",
        borderLeft: "8px solid transparent",
        borderRight: "8px solid transparent",
        borderTop: "8px solid white",
      });

      // Create header container
      const header = document.createElement("div");
      Object.assign(header.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px",
      });

      // Create title container
      const titleContainer = document.createElement("div");
      Object.assign(titleContainer.style, {
        display: "flex",
        alignItems: "center",
        gap: "4px",
      });

      // Create title text
      const titleText = document.createElement("span");
      titleText.textContent = "내 조황정보";
      Object.assign(titleText.style, {
        fontSize: "13px",
        fontWeight: "500",
        color: "#333",
      });

      // Create date text using the post's created_at date
      const dateText = document.createElement("span");
      const postDate = new Date(post.created_at);
      dateText.textContent = `${postDate.getFullYear()}.${String(
        postDate.getMonth() + 1
      ).padStart(2, "0")}.${String(postDate.getDate()).padStart(2, "0")}`;
      Object.assign(dateText.style, {
        fontSize: "13px",
        fontWeight: "500",
        color: "#333",
      });

      // Assemble title
      titleContainer.appendChild(titleText);
      titleContainer.appendChild(dateText);

      const switchContainer = document.createElement("div");
      switchContainer.id = `switch-${post.id}`;
      switchContainer.classList.add("switch-container"); // Add class for easier targeting

      // Assemble the header
      header.appendChild(titleContainer);
      header.appendChild(switchContainer);

      // Create preview area with fixed dimensions
      const preview = document.createElement("div");
      Object.assign(preview.style, {
        background: "#F5F5F5",
        borderRadius: "6px",
        height: "120px",
        width: "100%",
        marginBottom: "12px",
        overflow: "hidden",
        position: "relative",
        border: "1px solid #c7c6c6",
      });

      // Create map container with absolute positioning
      const mapContainer = document.createElement("div");
      Object.assign(mapContainer.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
      });
      preview.appendChild(mapContainer);

      // Create static map for preview
      const previewMap = new window.kakao.maps.Map(mapContainer, {
        center: new window.kakao.maps.LatLng(
          post.locations.latitude,
          post.locations.longitude
        ),
        level: 4,
        draggable: false,
        zoomable: false,
        scrollwheel: false,
        disableDoubleClick: true,
        disableDoubleClickZoom: true,
      });

      // Add this custom marker overlay instead:
      const previewMarkerContent = document.createElement("div");
      previewMarkerContent.style.position = "absolute";
      previewMarkerContent.style.bottom = "0";
      previewMarkerContent.style.left = "-20px";
      previewMarkerContent.style.cursor = "pointer";

      const previewSvg = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      previewSvg.setAttribute("width", "40");
      previewSvg.setAttribute("height", "40");
      previewSvg.setAttribute("viewBox", "0 0 24 24");
      previewSvg.setAttribute("fill", "#32329C");
      previewSvg.setAttribute("stroke", "#fff");
      previewSvg.setAttribute("stroke-width", "1");
      previewSvg.setAttribute("stroke-linecap", "round");
      previewSvg.setAttribute("stroke-linejoin", "round");

      const previewPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      previewPath.setAttribute(
        "d",
        "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      );

      const previewCircle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      previewCircle.setAttribute("cx", "12");
      previewCircle.setAttribute("cy", "10");
      previewCircle.setAttribute("r", "3");

      previewSvg.appendChild(previewPath);
      previewSvg.appendChild(previewCircle);
      previewMarkerContent.appendChild(previewSvg);

      const previewMarkerOverlay = new window.kakao.maps.CustomOverlay({
        position: new window.kakao.maps.LatLng(
          post.locations.latitude,
          post.locations.longitude
        ),
        content: previewMarkerContent,
        yAnchor: 1,
        zIndex: 3,
      });

      previewMarkerOverlay.setMap(previewMap);

      // Create address text
      const address = document.createElement("div");
      Object.assign(address.style, {
        fontSize: "12px",
        color: "#666",
        lineHeight: "1.4",
      });
      address.textContent = post.locations.address || "주소 정보 없음";

      // Create post content
      const postContent = document.createElement("div");
      Object.assign(postContent.style, {
        fontSize: "12.5px",
        color: "#666",
        marginTop: "8px",
        lineHeight: "1.4",
        display: "-webkit-box",
        WebkitLineClamp: "2",
        WebkitBoxOrient: "vertical",
        overflow: "hidden",
        textOverflow: "ellipsis",
        wordBreak: "break-word",
        minHeight: "2.8em",
        height: "2.8em",
        whiteSpace: "normal",
        width: "100%",
        textAlign: "justify",
      });

      // Update the truncation logic
      const fullDescription = post.description || "내용 없음...";
      const truncatedDescription =
        fullDescription.length > 95
          ? fullDescription.slice(0, 95) + "..."
          : fullDescription;

      postContent.textContent = truncatedDescription;
      console.log("Post description:", fullDescription); // Keep this line for debugging

      // Assemble the popup
      popupMain.appendChild(arrow);
      popupMain.appendChild(header);
      popupMain.appendChild(preview);
      popupMain.appendChild(address);
      popupMain.appendChild(postContent);
      popupContent.appendChild(popupMain);

      popupContent.addEventListener("click", (e) => {
        console.log("Popup clicked");
        e.stopPropagation();
      });
      popupContent.addEventListener(
        "touchstart",
        (e) => {
          console.log("Popup touched");
          e.stopPropagation();
        },
        { passive: false }
      );

      // Render the Switch component
      const root = ReactDOM.createRoot(switchContainer);
      root.render(
        <Switch
          checked={post.visibility === "public"}
          onCheckedChange={() => toggleVisibility(post.id, post.visibility)}
          className="data-[state=checked]:bg-[#128100] switch-element" // Add class to switch element
        />
      );

      // Ensure the preview map is properly resized when the popup is opened
      setTimeout(() => {
        previewMap.relayout();
        previewMap.setCenter(
          new window.kakao.maps.LatLng(
            post.locations.latitude,
            post.locations.longitude
          )
        );
      }, 100);

      return popupContent;
    },
    [toggleVisibility]
  );

  const createCustomOverlay = useCallback(
    (post, position) => {
      // Create marker element
      const markerContent = document.createElement("div");
      markerContent.style.position = "absolute";
      markerContent.style.bottom = "0";
      markerContent.style.left = "-20px";
      markerContent.style.cursor = "pointer";

      // Create SVG element
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", "40");
      svg.setAttribute("height", "40");
      svg.setAttribute("viewBox", "0 0 24 24");
      svg.setAttribute(
        "fill",
        post.visibility === "public" ? "#128100" : "#FF0000"
      );
      svg.setAttribute("stroke", "#fff");
      svg.setAttribute("stroke-width", "1");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");

      // Create path elements
      const path = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      path.setAttribute(
        "d",
        "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
      );

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "10");
      circle.setAttribute("r", "3");

      svg.appendChild(path);
      svg.appendChild(circle);
      markerContent.appendChild(svg);

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        yAnchor: 1,
        zIndex: 1,
      });

      markerContent.addEventListener("click", (e) => {
        console.log("Marker clicked");
        e.stopPropagation();
        setIsPopoverOpen(true);
        setSelectedPost(post);

        if (popupOverlayRef.current) {
          popupOverlayRef.current.setMap(null);
        }

        const popupContent = createPopupContent(post);
        popupContentRef.current = popupContent;

        const popupOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: popupContent,
          zIndex: 2,
        });

        popupOverlay.setMap(map);
        popupOverlayRef.current = popupOverlay;
      });

      return customOverlay;
    },
    [map, createPopupContent]
  );

  useEffect(() => {
    if (map && userPosts.length > 0) {
      // Clear existing overlays
      customOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
      customOverlaysRef.current.clear();

      userPosts.forEach((post) => {
        if (post.locations) {
          const position = new window.kakao.maps.LatLng(
            post.locations.latitude,
            post.locations.longitude
          );

          const customOverlay = createCustomOverlay(post, position);
          customOverlay.setMap(map);
          customOverlaysRef.current.set(post.id, customOverlay);
        }
      });

      // Set initial center
      map.setCenter(new window.kakao.maps.LatLng(36.5, 127.5));
    }

    // Cleanup function
    return () => {
      if (popupOverlayRef.current) {
        popupOverlayRef.current.setMap(null);
      }
      customOverlaysRef.current.forEach((overlay) => overlay.setMap(null));
    };
  }, [map, userPosts, createCustomOverlay]);

  useEffect(() => {
    if (map) {
      const handleMapClick = (e) => {
        console.log("Map clicked", e.target);

        // Check if e.target is defined before using closest
        if (e.target && typeof e.target.closest === "function") {
          // Check if the click is on the switch or its container
          const isSwitch =
            e.target.closest(".switch-container") ||
            e.target.classList.contains("switch-element");

          if (
            isPopoverOpen &&
            popupContentRef.current &&
            !popupContentRef.current.contains(e.target) &&
            !isSwitch
          ) {
            console.log("Closing popup");
            setIsPopoverOpen(false);
            setSelectedPost(null);
            if (popupOverlayRef.current) {
              popupOverlayRef.current.setMap(null);
            }
          }
        } else {
          // Handle the case where e.target is undefined or doesn't have closest method
          console.log("Invalid click target");
          if (isPopoverOpen) {
            setIsPopoverOpen(false);
            setSelectedPost(null);
            if (popupOverlayRef.current) {
              popupOverlayRef.current.setMap(null);
            }
          }
        }
      };

      window.kakao.maps.event.addListener(map, "click", handleMapClick);

      // Add touch event listener to the map container
      const mapContainer = document.getElementById("map");
      mapContainer.addEventListener("touchstart", handleMapClick, {
        passive: true,
      });

      return () => {
        window.kakao.maps.event.removeListener(map, "click", handleMapClick);
        mapContainer.removeEventListener("touchstart", handleMapClick);
      };
    }
  }, [map, isPopoverOpen]);

  const toggleSatelliteView = () => {
    if (map && window.kakao && window.kakao.maps) {
      setIsSatelliteView(!isSatelliteView);
      map.setMapTypeId(
        !isSatelliteView
          ? window.kakao.maps.MapTypeId.HYBRID
          : window.kakao.maps.MapTypeId.ROADMAP
      );
    }
  };

  const handleLogin = () => {
    navigate("/login");
  };

  if (!user.id) {
    return (
      <AlertDialog open={true} onOpenChange={setShowLoginAlert}>
        <AlertDialogContent className="w-[350px] rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              나의 지도는 회원들만 이용할 수 있습니다.
            </AlertDialogTitle>
            <AlertDialogDescription></AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row items-center gap-3">
            <AlertDialogAction
              className="w-full h-12 rounded-xl bg-[#128100] text-white"
              onClick={handleLogin}
            >
              로그인/회원가입
            </AlertDialogAction>
            <AlertDialogCancel
              className="mt-0 w-full h-12 rounded-xl bg-[#D9D9D9] text-black"
              onClick={() => setShowLoginAlert(false)}
            >
              취소
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Map Container */}
      <div className="flex-1 relative pb-24">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <div id="map" className="absolute inset-0" />

        {/* Satellite View Toggle */}
        <button
          onClick={toggleSatelliteView}
          className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          {isSatelliteView ? (
            <>
              <MapIcon className="w-4 h-4" />
              <span>지도 보기</span>
            </>
          ) : (
            <>
              <SatelliteIcon className="w-4 h-4" />
              <span>위성 보기</span>
            </>
          )}
        </button>

        {/* Camera Button */}
        <button className="fixed bottom-[102px] right-6 h-20 w-20 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import { GlobeIcon, Loader2Icon, LocateIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";

const CACHE_KEY = "kakaoMapLoaded";
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
const NEARBY_POSTS_RADIUS = 20; // in kilometers

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

export default function MapView() {
  const [activeTab, setActiveTab] = useState(0);
  const [map, setMap] = useState(null);
  const [kakaoMapsLoaded, setKakaoMapsLoaded] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [publicPosts, setPublicPosts] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [locationMarker, setLocationMarker] = useState(null);
  const [nearbyPosts, setNearbyPosts] = useState([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessageText, setSuccessMessageText] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const tabs = ["1주전", "2주전", "3주전", "한달전"];

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

    loadKakaoMaps();
  }, []);

  const fetchPublicPosts = async () => {
    console.log("Fetching public posts...");
    const { data, error } = await supabase
      .from("posts")
      .select(
        `
        id,
        description,
        created_at,
        image_urls,
        visibility,
        locations (
          latitude,
          longitude
        )
      `
      )
      .eq("visibility", "public");

    if (error) {
      console.error("Error fetching public posts:", error);
    } else {
      console.log("Fetched public posts:", data);
      setPublicPosts(data);
    }
  };

  useEffect(() => {
    fetchPublicPosts();
  }, [refreshTrigger]);

  useEffect(() => {
    if (kakaoMapsLoaded && window.kakao && window.kakao.maps) {
      console.log(
        "Initializing or updating map with public posts:",
        publicPosts
      );

      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      };

      let newMap;
      if (!map) {
        newMap = new window.kakao.maps.Map(container, options);
        newMap.setMinLevel(3);
        newMap.setMaxLevel(14);
        setMap(newMap);
      } else {
        newMap = map;
      }

      // Clear existing markers
      newMap.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);

      if (publicPosts.length > 0) {
        const bounds = new window.kakao.maps.LatLngBounds();

        publicPosts.forEach((post) => {
          if (
            post.locations &&
            post.locations.latitude &&
            post.locations.longitude
          ) {
            const position = new window.kakao.maps.LatLng(
              post.locations.latitude,
              post.locations.longitude
            );
            const marker = new window.kakao.maps.Marker({ position });

            marker.setMap(newMap);

            bounds.extend(position);
          }
        });

        newMap.setBounds(bounds);
      } else {
        const defaultPosition = new window.kakao.maps.LatLng(36.5, 127.5);
        newMap.setCenter(defaultPosition);
      }

      newMap.setLevel(13);
    }
  }, [kakaoMapsLoaded, map, publicPosts]);

  const handleLocate = () => {
    console.log("Locate button clicked. Using test location in Korea.");
    useTestLocation();
  };

  const useTestLocation = () => {
    const testLatitude = 37.5665;
    const testLongitude = 126.978;
    console.log("Using test location in Seoul:", {
      latitude: testLatitude,
      longitude: testLongitude,
    });
    setUserLocation({ latitude: testLatitude, longitude: testLongitude });
    if (map) {
      const newCenter = new window.kakao.maps.LatLng(
        testLatitude,
        testLongitude
      );
      map.setCenter(newCenter);
      map.setLevel(3);

      if (locationMarker) {
        locationMarker.setMap(null);
      }

      const newMarker = new window.kakao.maps.Marker({
        position: newCenter,
        map: map,
      });

      setLocationMarker(newMarker);

      const nearby = findNearbyPosts(
        testLatitude,
        testLongitude,
        NEARBY_POSTS_RADIUS
      );
      setNearbyPosts(nearby);

      updateMapWithNearbyPosts(nearby, map);
    }
  };

  const findNearbyPosts = (
    latitude,
    longitude,
    radius = NEARBY_POSTS_RADIUS
  ) => {
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371;
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    return publicPosts.filter((post) => {
      if (
        post.locations &&
        post.locations.latitude &&
        post.locations.longitude
      ) {
        const distance = getDistance(
          latitude,
          longitude,
          post.locations.latitude,
          post.locations.longitude
        );
        return distance <= radius;
      }
      return false;
    });
  };

  const updateMapWithNearbyPosts = (posts, map) => {
    map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);

    posts.forEach((post) => {
      const position = new window.kakao.maps.LatLng(
        post.locations.latitude,
        post.locations.longitude
      );
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map,
      });

      window.kakao.maps.event.addListener(marker, "click", function () {
        console.log("Clicked post:", post);
      });
    });
  };

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

  const saveImageToGallery = async (file) => {
    if (
      "mediaDevices" in navigator &&
      "getDisplayMedia" in navigator.mediaDevices
    ) {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
        });
        stream.getTracks().forEach((track) => track.stop());

        if ("share" in navigator) {
          const filesArray = [
            new File([file], "captured_image.jpg", { type: "image/jpeg" }),
          ];
          await navigator.share({
            files: filesArray,
            title: "Save to Gallery",
            text: "Save this image to your gallery",
          });
          return true;
        } else {
          console.log("Web Share API not supported");
          return false;
        }
      } catch (error) {
        console.error("Error saving image to gallery:", error);
        return false;
      }
    } else {
      console.log("MediaDevices API not supported");
      return false;
    }
  };

  const handleImageCapture = async (file) => {
    console.log("Processing captured image:", file);

    let savedToGallery = false;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      savedToGallery = await saveImageToGallery(file);
    } else {
      const url = URL.createObjectURL(file);
      const a = document.createElement("a");
      a.href = url;
      a.download = "captured_image.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      savedToGallery = true;
    }

    if (savedToGallery) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase.from("user_gallery").insert({
          user_id: user.id,
          image_url: "local://captured_image.jpg",
        });

        if (error) {
          console.error("Error adding image to gallery:", error);
        } else {
          console.log("Image added to user's gallery:", data);
        }
      } else {
        console.error("No user logged in");
      }

      setSuccessMessageText(
        isMobile
          ? "Image saved to your gallery successfully!"
          : "Image downloaded successfully!"
      );
    } else {
      setSuccessMessageText("Failed to save image. Please try again.");
    }

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleOpenCamera = () => {
    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.capture = "environment";
      input.click();

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          console.log("Image captured on mobile:", file);
          handleImageCapture(file);
        }
      };
    } else {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices
          .getUserMedia({ video: true })
          .then((stream) => {
            const video = document.createElement("video");
            video.srcObject = stream;
            video.autoplay = true;
            video.style.position = "fixed";
            video.style.top = "0";
            video.style.left = "0";
            video.style.width = "100%";
            video.style.height = "100%";
            video.style.zIndex = "1000";
            document.body.appendChild(video);

            const captureButton = document.createElement("button");
            captureButton.textContent = "Capture";
            captureButton.style.position = "fixed";
            captureButton.style.bottom = "20px";
            captureButton.style.left = "50%";
            captureButton.style.transform = "translateX(-50%)";
            captureButton.style.zIndex = "1001";
            document.body.appendChild(captureButton);

            captureButton.onclick = () => {
              const canvas = document.createElement("canvas");
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              canvas.getContext("2d").drawImage(video, 0, 0);
              canvas.toBlob((blob) => {
                const file = new File([blob], "captured_image.jpg", {
                  type: "image/jpeg",
                });
                console.log("Image captured on desktop:", file);
                handleImageCapture(file);

                stream.getTracks().forEach((track) => track.stop());
                document.body.removeChild(video);
                document.body.removeChild(captureButton);
              }, "image/jpeg");
            };
          })
          .catch((error) => {
            console.error("Error accessing camera:", error);
            const input = document.createElement("input");
            input.type = "file";
            input.accept = "image/*";
            input.click();

            input.onchange = (e) => {
              const file = e.target.files[0];
              if (file) {
                console.log("Image selected:", file);
                handleImageCapture(file);
              }
            };
          });
      } else {
        console.error("getUserMedia is not supported in this browser");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.click();

        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log("Image selected:", file);
            handleImageCapture(file);
          }
        };
      }
    }
  };

  // const handleRefresh = () => {
  //   setRefreshTrigger((prev) => prev + 1);
  // };

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex p-2 gap-2 bg-white relative z-10">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-2 rounded-xl text-lg ${
              activeTab === index
                ? "border text-[#32329C] font-bold border-[#32329C]"
                : "bg-gray-100 text-gray-600 border-[1px] border-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div
        className="relative flex-1 z-0"
        style={{
          height: "calc(100vh + 100px)",
          marginTop: "-100px",
          marginLeft: "-25px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <div id="map" className="absolute inset-0" />

        <div className="absolute top-28 gap-2 flex flex-col right-4">
          <button
            onClick={handleLocate}
            className="bg-white p-3 rounded-full shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <LocateIcon className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSatelliteView}
            className="bg-white p-3 rounded-full shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <GlobeIcon className="w-4 h-4" />
          </button>
          {/* <button
            onClick={handleRefresh}
            className="bg-white p-3 rounded-full shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button> */}
        </div>

        <button
          onClick={handleOpenCamera}
          className="fixed bottom-[90px] right-6 h-20 w-20 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50"
        >
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

        {showSuccessMessage && (
          <div className="fixed bottom-24 left-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-md">
            {successMessageText}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-4 bg-white border-t z-50">
        <button className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          </svg>
        </button>
        <button className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M4 15s1-1 4-1 4 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
            <line x1="4" y1="22" x2="4" y2="15"></line>
          </svg>
        </button>
        <button className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="2" y1="12" x2="22" y2="12"></line>
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
          </svg>
        </button>
        <button className="flex flex-col items-center gap-1">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}

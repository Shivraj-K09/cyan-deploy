import React, { useEffect, useState } from "react";
import { openDB } from "idb";
import { GlobeIcon, Loader2Icon, LocateIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";

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

  useEffect(() => {
    const fetchPublicPosts = async () => {
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
        setPublicPosts(data);
      }
    };

    fetchPublicPosts();
  }, []);

  useEffect(() => {
    if (
      kakaoMapsLoaded &&
      !map &&
      window.kakao &&
      window.kakao.maps &&
      publicPosts.length > 0
    ) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      };
      const newMap = new window.kakao.maps.Map(container, options);

      // Set minimum and maximum zoom levels
      newMap.setMinLevel(3);
      newMap.setMaxLevel(14);

      newMap.setLevel(13);

      setMap(newMap);

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

          const customOverlay = new window.kakao.maps.CustomOverlay({
            position: position,
          });

          marker.setMap(newMap);
          customOverlay.setMap(newMap);

          bounds.extend(position);
        }
      });

      newMap.setBounds(bounds);
      newMap.setLevel(13);

      window.kakao.maps.event.addListener(newMap, "zoom_changed", function () {
        const currentLevel = newMap.getLevel();
        console.log("Current zoom level:", currentLevel);
      });
    }
  }, [kakaoMapsLoaded, map, publicPosts]);

  const handleLocate = () => {
    console.log("Locate button clicked. Using test location in Korea.");
    useTestLocation();
  };

  const useTestLocation = () => {
    // Using a location in Seoul, Korea for testing
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
      map.setLevel(3); // Zoom in closer

      // Remove existing location marker if any
      if (locationMarker) {
        locationMarker.setMap(null);
      }

      // Add a new marker for the test location
      const newMarker = new window.kakao.maps.Marker({
        position: newCenter,
        map: map,
      });

      // Set the new marker
      setLocationMarker(newMarker);

      // Find nearby posts
      const nearby = findNearbyPosts(
        testLatitude,
        testLongitude,
        NEARBY_POSTS_RADIUS
      );
      setNearbyPosts(nearby);

      // Update map with nearby posts
      updateMapWithNearbyPosts(nearby, map);
    }
  };

  const findNearbyPosts = (
    latitude,
    longitude,
    radius = NEARBY_POSTS_RADIUS
  ) => {
    // Function to calculate distance between two points using Haversine formula
    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // Radius of the Earth in km
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
          Math.cos(lat2 * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c; // Distance in km
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
    // Clear existing markers (except user location marker)
    map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);

    // Add markers for nearby posts
    posts.forEach((post) => {
      const position = new window.kakao.maps.LatLng(
        post.locations.latitude,
        post.locations.longitude
      );
      const marker = new window.kakao.maps.Marker({
        position: position,
        map: map,
      });

      // You can add click event listeners to markers here if needed
      window.kakao.maps.event.addListener(marker, "click", function () {
        // Handle marker click (e.g., show post details)
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Tabs */}
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

      {/* Map Container */}
      <div
        className="relative flex-1 z-0"
        style={{
          height: "calc(100vh + 100px)",
          marginTop: "-40px",
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-20">
            <Loader2Icon className="h-10 w-10 animate-spin text-primary" />
          </div>
        )}
        <div id="map" className="absolute inset-0" />

        {/* Satellite View Toggle and Locate */}
        <div className="absolute top-16 gap-2 flex flex-col right-4">
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
        </div>

        {/* Camera Button */}
        <button className="fixed bottom-[80px] right-6 h-20 w-20 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 flex items-center justify-center z-50">
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

      {/* Bottom Navigation */}
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

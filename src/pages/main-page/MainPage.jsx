import React, { useEffect, useState, useCallback } from "react";
import { openDB } from "idb";
import { GlobeIcon, Loader2Icon, LocateIcon } from "lucide-react";
import { supabase } from "../../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import CameraButton from "../../components/cameraButton";

const isLocationInKorea = (latitude, longitude) => {
  const koreanBounds = {
    north: 38.6,
    south: 33.0,
    east: 131.9,
    west: 124.5,
  };

  return (
    latitude >= koreanBounds.south &&
    latitude <= koreanBounds.north &&
    longitude >= koreanBounds.west &&
    longitude <= koreanBounds.east
  );
};

const createCustomMarkerSVG = (fill) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", "40");
  svg.setAttribute("height", "40");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", fill);
  svg.setAttribute("stroke", "#fff");
  svg.setAttribute("stroke-width", "1");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");

  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
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

  return svg;
};

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
  const [persistedLocation, setPersistedLocation] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Added authentication state

  const tabs = ["1주전", "2주전", "3주전", "한달전"];

  const saveLocationToLocalStorage = useCallback((location) => {
    localStorage.setItem("userLocation", JSON.stringify(location));
  }, []);

  const getLocationFromLocalStorage = useCallback(() => {
    const storedLocation = localStorage.getItem("userLocation");
    return storedLocation ? JSON.parse(storedLocation) : null;
  }, []);

  const updateMapWithPersistedLocation = useCallback(
    (location) => {
      if (location && map) {
        const { latitude, longitude } = location;
        updateMapWithLocation(latitude, longitude);
      }
    },
    [map]
  );

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
    return new Promise((resolve, reject) => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            console.log("User's actual location:", { latitude, longitude });

            if (isLocationInKorea(latitude, longitude)) {
              console.log("User is in Korea. Using actual location.");
              const location = { latitude, longitude };
              setUserLocation(location);
              setPersistedLocation(location);
              saveLocationToLocalStorage(location);
              updateMapWithLocation(latitude, longitude);
              resolve(location);
            } else {
              console.log(
                "User is not in Korea. Using test location in Seoul."
              );
              resolve(useTestLocation());
            }
          },
          (error) => {
            console.error("Error getting location:", error);
            resolve(useTestLocation());
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
        );
      } else {
        console.log("Geolocation is not supported by this browser.");
        resolve(useTestLocation());
      }
    });
  };

  const useTestLocation = () => {
    const testLatitude = 37.5665;
    const testLongitude = 126.978;
    console.log("Using test location in Seoul:", {
      latitude: testLatitude,
      longitude: testLongitude,
    });
    const location = { latitude: testLatitude, longitude: testLongitude };
    setUserLocation(location);
    setPersistedLocation(location);
    saveLocationToLocalStorage(location);
    updateMapWithLocation(testLatitude, testLongitude);
    return location;
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

  const updateMapWithLocation = useCallback(
    (latitude, longitude) => {
      if (map) {
        const newCenter = new window.kakao.maps.LatLng(latitude, longitude);

        // Remove existing location marker if it exists
        if (locationMarker) {
          locationMarker.setMap(null);
        }

        // Create new marker
        const markerContent = document.createElement("div");
        markerContent.style.position = "absolute";
        markerContent.style.bottom = "0";
        markerContent.style.left = "-20px";

        const svg = createCustomMarkerSVG("#32329C"); // Blue color for user location
        markerContent.appendChild(svg);

        const newMarker = new window.kakao.maps.CustomOverlay({
          position: newCenter,
          content: markerContent,
          map: map,
          yAnchor: 1,
        });

        setLocationMarker(newMarker);

        // Set the map center and zoom level
        map.setCenter(newCenter);
        map.setLevel(3); // You can adjust this value to set the initial zoom level

        // Create a LatLngBounds object and extend it with the marker position
        const bounds = new window.kakao.maps.LatLngBounds();
        bounds.extend(newCenter);

        // Find nearby posts
        const nearby = findNearbyPosts(
          latitude,
          longitude,
          NEARBY_POSTS_RADIUS
        );
        setNearbyPosts(nearby);

        // Add nearby posts to the map and extend bounds
        nearby.forEach((post) => {
          if (
            post.locations &&
            post.locations.latitude &&
            post.locations.longitude
          ) {
            const postPosition = new window.kakao.maps.LatLng(
              post.locations.latitude,
              post.locations.longitude
            );
            bounds.extend(postPosition);

            const postMarkerContent = document.createElement("div");
            postMarkerContent.style.position = "absolute";
            postMarkerContent.style.bottom = "0";
            postMarkerContent.style.left = "-20px";

            const postSvg = createCustomMarkerSVG("#128100"); // Green color for posts
            postMarkerContent.appendChild(postSvg);

            const postMarker = new window.kakao.maps.CustomOverlay({
              position: postPosition,
              content: postMarkerContent,
              map: map,
              yAnchor: 1,
            });

            window.kakao.maps.event.addListener(
              postMarker,
              "click",
              function () {
                console.log("Clicked post:", post);
              }
            );
          }
        });

        // Set the map bounds to fit all markers
        map.setBounds(bounds, 50); // 50 is padding in pixels
      }
    },
    [map, locationMarker, publicPosts]
  );

  const updateMapWithNearbyPosts = (posts, map) => {
    map.removeOverlayMapTypeId(window.kakao.maps.MapTypeId.TRAFFIC);

    posts.forEach((post) => {
      const position = new window.kakao.maps.LatLng(
        post.locations.latitude,
        post.locations.longitude
      );

      const markerContent = document.createElement("div");
      markerContent.style.position = "absolute";
      markerContent.style.bottom = "0";
      markerContent.style.left = "-20px";

      const svg = createCustomMarkerSVG("#128100"); // Green color for posts
      markerContent.appendChild(svg);

      const marker = new window.kakao.maps.CustomOverlay({
        position: position,
        content: markerContent,
        map: map,
        yAnchor: 1,
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

  const handleImageCapture = useCallback(async (watermarkedBlob) => {
    console.log("Processing captured image");

    let savedToGallery = false;

    const isMobile =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

    if (isMobile) {
      savedToGallery = await saveImageToGallery(watermarkedBlob);
    } else {
      // For desktop, the image is already downloaded in the CameraButton component
      savedToGallery = true;
    }

    if (savedToGallery) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase.from("user_gallery").insert({
          user_id: user.id,
          image_url: "local://captured_image_with_watermark.jpg",
        });

        if (error) {
          console.error("Error adding image to gallery:", error);
          setSuccessMessageText(
            "Failed to save image to gallery. Please try again."
          );
        } else {
          console.log("Image added to user's gallery:", data);
          setSuccessMessageText(
            isMobile
              ? "Image saved to your gallery successfully!"
              : "Image downloaded successfully!"
          );
        }
      } else {
        console.error("No user logged in");
        setSuccessMessageText("Failed to save image. User not logged in.");
      }
    } else {
      setSuccessMessageText("Failed to save image. Please try again.");
    }

    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  }, []);

  useEffect(() => {
    const storedLocation = getLocationFromLocalStorage();
    if (storedLocation) {
      setPersistedLocation(storedLocation);
      setUserLocation(storedLocation);
    }
  }, [getLocationFromLocalStorage]);

  useEffect(() => {
    updateMapWithPersistedLocation(persistedLocation);
  }, [persistedLocation, updateMapWithPersistedLocation]);

  useEffect(() => {
    handleLocate();
  }, []);

  useEffect(() => {
    // Added authentication check effect
    const checkAuth = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex p-2 gap-2 bg-white relative z-10">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => isAuthenticated && setActiveTab(index)} // Added authentication check
            className={`flex-1 py-2 rounded-xl text-lg ${
              activeTab === index
                ? "border text-[#32329C] font-bold border-[#32329C]"
                : "bg-gray-100 text-gray-600 border-[1px] border-gray-400"
            } ${!isAuthenticated && "opacity-50 cursor-not-allowed"}`} // Added styling for disabled buttons
            disabled={!isAuthenticated} // Added disabled attribute
          >
            {tab}
          </button>
        ))}
      </div>
      {!isAuthenticated && ( // Added message for non-authenticated users
        <div className="text-center text-red-500 mt-2">
          Please log in to use the tabs.
        </div>
      )}

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
          <button className="bg-white p-3 rounded-full shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors">
            <LocateIcon className="w-4 h-4" />
          </button>

          <button
            onClick={toggleSatelliteView}
            className="bg-white p-3 rounded-full shadow-md z-10 flex items-center space-x-2 text-sm font-medium hover:bg-gray-100 transition-colors"
          >
            <GlobeIcon className="w-4 h-4" />
          </button>
        </div>

        {userLocation && (
          <CameraButton
            userLocation={userLocation}
            onImageCapture={handleImageCapture}
          />
        )}

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

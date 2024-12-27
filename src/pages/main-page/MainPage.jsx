import { openDB } from "idb";
import { Loader2Icon, MapIcon, SatelliteIcon } from "lucide-react";
import { useEffect, useState } from "react";

// Define the marker data type
const markers = [
  { id: 1, latitude: 37.8, longitude: 128.5, count: 24 },
  { id: 2, latitude: 36.5, longitude: 126.5, count: 3 },
  { id: 3, latitude: 35.8, longitude: 129.2, count: 4 },
  { id: 4, latitude: 34.8, longitude: 126.8, count: 8 },
];

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

export default function MapView() {
  const [activeTab, setActiveTab] = useState(0);
  const [map, setMap] = useState(null);
  const [kakaoMapsLoaded, setKakaoMapsLoaded] = useState(false);
  const [isSatelliteView, setIsSatelliteView] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    if (kakaoMapsLoaded && !map && window.kakao && window.kakao.maps) {
      const container = document.getElementById("map");
      const options = {
        center: new window.kakao.maps.LatLng(36.5, 127.5),
        level: 13,
      };
      const newMap = new window.kakao.maps.Map(container, options);
      setMap(newMap);

      const avgLat =
        markers.reduce((sum, marker) => sum + marker.latitude, 0) /
        markers.length;
      const avgLng =
        markers.reduce((sum, marker) => sum + marker.longitude, 0) /
        markers.length;
      newMap.setCenter(new window.kakao.maps.LatLng(avgLat, avgLng));

      markers.forEach((markerData) => {
        const position = new window.kakao.maps.LatLng(
          markerData.latitude,
          markerData.longitude
        );
        const marker = new window.kakao.maps.Marker({ position });

        const content = `
          <div class="p-2 bg-white rounded-lg shadow-lg">
            <span>봉어야!</span>
            <span class="text-gray-500 ml-1">${markerData.count}건</span>
          </div>
        `;

        const customOverlay = new window.kakao.maps.CustomOverlay({
          position: position,
          content: content,
        });

        marker.setMap(newMap);
        customOverlay.setMap(newMap);
      });
    }
  }, [kakaoMapsLoaded, map]);

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
      <div className="flex p-2 gap-2 bg-white">
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

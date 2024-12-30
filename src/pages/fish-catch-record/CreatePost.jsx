import {
  XIcon,
  LinkIcon,
  YoutubeIcon,
  InstagramIcon,
  FacebookIcon,
  Globe,
  TwitterIcon,
  MapPin,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { MdOutlineKeyboardDoubleArrowLeft } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { supabase } from "../../lib/supabaseClient";
import {
  getFormData,
  setFormData,
  getImage,
  setImage,
  deleteImage,
  clearAllData,
} from "../../utils/indexedDB";

const ImageUploadSquare = ({ index, image, onRemove, onUpload }) => {
  const getLabel = (index) => {
    switch (index) {
      case 0:
        return "어종";
      case 1:
        return "길이확대";
      case 2:
        return "장소1";
      case 3:
        return "장소2";
      default:
        return "사진";
    }
  };

  const getPlaceholderImage = (index) => {
    switch (index) {
      case 0:
        return "/img1.jpeg";
      case 1:
        return "/img2.jpeg";
      case 2:
        return "/img3.jpeg";
      case 3:
        return "/img4.jpeg";
      default:
        return "/placeholder.svg?height=200&width=200";
    }
  };

  return (
    <div className="relative w-full aspect-square flex items-center justify-center text-gray-400 bg-gray-200 overflow-hidden">
      {image ? (
        <>
          <img
            src={image.preview}
            alt={`Uploaded ${index + 1}`}
            className="w-full h-full object-cover"
          />

          <button
            type="button"
            onClick={() => onRemove(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition-colors"
          >
            <XIcon className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <label className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors relative">
          <img
            src={getPlaceholderImage(index)}
            alt={getLabel(index)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="text-sm text-white font-medium text-center px-2">
              {getLabel(index)}
            </span>
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => onUpload(e, index)}
            className="hidden"
          />
        </label>
      )}
    </div>
  );
};

const FishCatchForm = () => {
  const [images, setImages] = useState([]);
  const [link, setLink] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [map, setMap] = useState(null);
  const [kakaoMapsLoaded, setKakaoMapsLoaded] = useState(false);
  const [isMapInitialized, setIsMapInitialized] = useState(false);
  const [isFullyInitialized, setIsFullyInitialized] = useState(false);
  const customOverlayRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState({ place: null, fullAddress: null });
  const geocoderRef = useRef(null);
  const mapContainerRef = useRef(null);
  const navigate = useNavigate();

  const SEOUL_COORDINATES = { latitude: 37.5665, longitude: 126.978 };

  const initializeMap = useCallback(() => {
    if (!mapContainerRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(
        SEOUL_COORDINATES.latitude,
        SEOUL_COORDINATES.longitude
      ),
      level: 11,
    };

    const newMap = new window.kakao.maps.Map(mapContainerRef.current, options);
    setMap(newMap);

    geocoderRef.current = new window.kakao.maps.services.Geocoder();

    setIsMapInitialized(true);
    setIsFullyInitialized(true);
    console.log("Map and geocoder initialized successfully");

    setLocation(SEOUL_COORDINATES);
  }, []);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAPS_API_KEY
    }&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        console.log("Kakao Maps loaded successfully");
        setKakaoMapsLoaded(true);
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const updateMarkerPosition = useCallback(
    (newLocation) => {
      if (!map || !newLocation || !geocoderRef.current) {
        console.error(
          "Map not initialized, location not set, or geocoder not available"
        );
        return;
      }

      const { latitude, longitude } = newLocation;
      const latlng = new window.kakao.maps.LatLng(latitude, longitude);

      geocoderRef.current.coord2Address(
        longitude,
        latitude,
        (result, status) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const fullAddress = result[0].address.address_name;
            const place =
              result[0].address.region_3depth_name ||
              result[0].address.region_2depth_name;

            setAddress({ place, fullAddress });

            console.log("Updated location data:", {
              longitude,
              latitude,
              place,
              address: fullAddress,
            });
          } else {
            console.log("Failed to get address information");
            setAddress({ place: null, fullAddress: null });
          }
        }
      );

      if (customOverlayRef.current) {
        customOverlayRef.current.setMap(null);
      }

      const content = `
    <div style="position: absolute; bottom: 0; left: -20px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="#128100" stroke="#fff" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
        <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    </div>
  `;

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: latlng,
        content: content,
        map: map,
        yAnchor: 1,
      });

      customOverlayRef.current = customOverlay;

      map.panTo(latlng);

      console.log("New custom overlay created and map panned smoothly");
    },
    [map]
  );

  const handleMapClick = useCallback(
    (mouseEvent) => {
      if (!isFullyInitialized) {
        console.log("Map not fully initialized yet. Please wait.");
        return;
      }

      console.log("Map clicked. Getting location data...");
      const clickedPosition = mouseEvent.latLng;
      const newLocation = {
        latitude: clickedPosition.getLat(),
        longitude: clickedPosition.getLng(),
      };
      setLocation(newLocation);
      updateMarkerPosition(newLocation);
      console.log("Map clicked at:", newLocation);
    },
    [isFullyInitialized, updateMarkerPosition]
  );

  useEffect(() => {
    if (kakaoMapsLoaded && !isMapInitialized) {
      initializeMap();
    }

    if (isFullyInitialized && map) {
      window.kakao.maps.event.addListener(map, "click", handleMapClick);
      return () => {
        window.kakao.maps.event.removeListener(map, "click", handleMapClick);
      };
    }
  }, [
    kakaoMapsLoaded,
    isMapInitialized,
    isFullyInitialized,
    map,
    handleMapClick,
    initializeMap,
  ]);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    const loadFormData = async () => {
      const savedLink = await getFormData("link");
      const savedDescription = await getFormData("description");
      const savedImageKeys = (await getFormData("imageKeys")) || [];
      const savedLocation = await getFormData("location");

      setLink(savedLink || "");
      setDescription(savedDescription || "");
      if (savedLocation) {
        setLocation(savedLocation);
        console.log("Loaded saved location:", savedLocation);
      }

      const loadedImages = await Promise.all(
        savedImageKeys.map(async (key) => {
          const imageData = await getImage(key);
          if (imageData && imageData.blob) {
            const file = new File([imageData.blob], imageData.name, {
              type: imageData.type,
            });
            return {
              file,
              preview: URL.createObjectURL(file),
            };
          }
          return null;
        })
      );

      setImages(loadedImages.filter(Boolean));
    };

    loadFormData();
  }, []);

  useEffect(() => {
    const saveFormData = async () => {
      await setFormData("link", link);
      await setFormData("description", description);
      if (location) {
        await setFormData("location", location);
      }

      const imageKeys = await Promise.all(
        images.map(async (image, index) => {
          if (image && image.file) {
            const key = `image_${index}`;
            await setImage(key, {
              blob: await image.file.arrayBuffer(),
              name: image.file.name,
              type: image.file.type,
            });
            return key;
          }
          return null;
        })
      );

      await setFormData("imageKeys", imageKeys.filter(Boolean));
    };

    saveFormData();
  }, [link, description, images, location]);

  const handleImageUpload = useCallback(async (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const newImage = {
        file,
        preview: URL.createObjectURL(file),
      };
      setImages((prevImages) => {
        const newImages = [...prevImages];
        newImages[index] = newImage;
        return newImages;
      });
    }
  }, []);

  const removeImage = useCallback(async (index) => {
    await deleteImage(`image_${index}`);
    setImages((prevImages) => {
      const updatedImages = [...prevImages];
      if (updatedImages[index]) {
        URL.revokeObjectURL(updatedImages[index].preview);
        updatedImages[index] = null;
      }
      return updatedImages;
    });
  }, []);

  useEffect(() => {
    if (isMapInitialized && location) {
      updateMarkerPosition(location);
    }
  }, [isMapInitialized, location, updateMarkerPosition]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error(
        "로그인이 필요합니다. 먼저 로그인해주세요. Please Login First to Post it."
      );
      return;
    }

    if (!description.trim()) {
      toast.error("내용을 입력해주세요. Please enter a description.");
      return;
    }

    setIsSubmitting(true);

    try {
      const imageUrls = await Promise.all(
        images.filter(Boolean).map(async (image) => {
          const fileName = `${user.id}/${Date.now()}-${image.file.name}`;
          const { data, error } = await supabase.storage
            .from("fish-catch-images")
            .upload(fileName, image.file);

          if (error) {
            console.error("Error uploading image:", error);
            throw error;
          }

          const { data: signedUrlData, error: signedUrlError } =
            await supabase.storage
              .from("fish-catch-images")
              .createSignedUrl(data.path, 100 * 365 * 24 * 60 * 60);

          if (signedUrlError) {
            console.error("Error getting signed URL:", signedUrlError);
            throw signedUrlError;
          }

          console.log("Image uploaded successfully:", signedUrlData.signedUrl);
          return signedUrlData.signedUrl;
        })
      );

      const { data: locationData, error: locationError } = await supabase
        .from("locations")
        .insert({
          longitude: location.longitude,
          latitude: location.latitude,
          place_name: address.place,
          address: address.fullAddress,
        })
        .select()
        .single();

      if (locationError) {
        console.error("Error inserting location:", locationError);
        throw locationError;
      }

      const newPost = {
        user_id: user.id,
        link: link || null,
        description,
        image_urls: imageUrls,
        created_at: new Date().toISOString(),
        likes_count: 0,
        comments_count: 0,
        location_id: locationData.id,
      };

      console.log("Location data stored:", {
        longitude: locationData.longitude,
        latitude: locationData.latitude,
        place: locationData.place_name,
        address: locationData.address,
      });

      const { data, error } = await supabase
        .from("posts")
        .insert(newPost)
        .select();

      if (error) throw error;

      const enhancedPost = {
        ...data[0],
        comments: [],
        top_comments: [],
        likes: [],
      };

      localStorage.setItem("newPost", JSON.stringify(enhancedPost));

      console.log("Post saved successfully:", data);
      toast.success("Post saved successfully.");

      await clearAllData();

      images.forEach((image) => {
        if (image && image.preview) {
          URL.revokeObjectURL(image.preview);
        }
      });

      navigate("/fish-catch-record");
    } catch (error) {
      console.error("Error submitting post:", error);
      toast.error("Post failed to save. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getLinkIcon = (url) => {
    if (!url) return <LinkIcon className="w-5 h-5 text-gray-400" />;
    if (url.includes("youtube.com") || url.includes("youtu.be"))
      return <YoutubeIcon className="w-5 h-5 text-red-500" />;
    if (url.includes("instagram.com"))
      return <InstagramIcon className="w-5 h-5 text-pink-500" />;
    if (url.includes("facebook.com"))
      return <FacebookIcon className="w-5 h-5 text-blue-500" />;
    if (url.includes("twitter.com") || url.includes("x.com"))
      return <TwitterIcon className="w-5 h-5 text-blue-500" />;
    return <Globe className="w-5 h-5 text-green-500" />;
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 bg-white z-10">
        <div className="max-w-lg mx-auto p-4">
          <div className="flex items-center">
            <Link to="/fish-catch-record">
              <MdOutlineKeyboardDoubleArrowLeft className="w-6 h-6" />
            </Link>
            <p className="text-lg font-bold flex-1 text-center">
              조황 기록하기
            </p>
          </div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-100 pt-16">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg mx-auto bg-white rounded-lg shadow-md p-6"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              사진첨부
            </label>
            <div className="grid grid-cols-2 gap-4 w-full">
              {[...Array(4)].map((_, index) => (
                <ImageUploadSquare
                  key={index}
                  index={index}
                  image={images[index]}
                  onRemove={removeImage}
                  onUpload={handleImageUpload}
                />
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="linkInput"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              링크첨부
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {getLinkIcon(link)}
              </div>
              <Input
                type="text"
                id="linkInput"
                placeholder="링크를 넣어주세요."
                className="block w-full rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm placeholder:text-sm h-10 border border-border shadow-none pl-10"
                value={link}
                onChange={(e) => setLink(e.target.value)}
              />
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className="block text-sm font-bold text-gray-700 mb-2"
            >
              내용
            </label>
            <Textarea
              id="description"
              placeholder="내용을 입력해주세요."
              rows="4"
              className="block w-full h-56 border-border rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm border shadow-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">
              지도표시
            </label>
            <div
              ref={mapContainerRef}
              className="w-full h-60 bg-gray-200 rounded-md relative"
            >
              {!isFullyInitialized && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75">
                  <p>지도를 불러오는 중...</p>
                </div>
              )}
            </div>
            {location && (
              <div className="mt-2 text-sm text-gray-600">
                <p>
                  선택된 위치: {location.latitude.toFixed(6)},{" "}
                  {location.longitude.toFixed(6)}
                </p>
                {address.place && <p>장소: {address.place}</p>}
                {address.fullAddress && <p>주소: {address.fullAddress}</p>}
              </div>
            )}
          </div>

          <div className="text-center">
            <button
              type="submit"
              className="bg-[#128100] text-white p-3 px-16 rounded-md shadow-sm hover:bg-[#0e6600] transition-colors"
              disabled={isSubmitting}
            >
              {isSubmitting ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default FishCatchForm;

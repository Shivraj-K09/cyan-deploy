import React, { useRef, useState, useCallback, useEffect } from "react";
import { getWeatherData } from "../utils/weatherApi";

const CameraButton = ({ userLocation, onImageCapture }) => {
  const weatherDataRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent.toLowerCase()
      );
    };
    setIsMobile(checkMobile());
    console.log(`Device type: ${checkMobile() ? "Mobile" : "Desktop"}`);
  }, []);

  const fetchWeatherData = useCallback(async (latitude, longitude) => {
    try {
      console.log("Fetching weather data...");
      const weather = await getWeatherData(latitude, longitude);
      weatherDataRef.current = weather;
      console.log("Weather data fetched successfully");
      return weather;
    } catch (error) {
      console.log(`Error fetching weather data: ${error.message}`);
      throw error;
    }
  }, []);

  const addWatermark = useCallback((imageData, weather, isMobileView) => {
    return new Promise((resolve) => {
      console.log("Adding watermark to image...");
      const canvas = document.createElement("canvas");
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const watermarkWidth = isMobileView
          ? Math.min(canvas.width * 0.5, canvas.height * 0.25)
          : canvas.width * 0.35;
        const watermarkHeight = isMobileView
          ? Math.min(canvas.height * 0.15, canvas.width * 0.3)
          : canvas.height * 0.25;

        const fontSize = isMobileView
          ? Math.max(12, Math.min(watermarkWidth / 18, watermarkHeight / 8))
          : Math.max(14, Math.floor(canvas.width / 50));

        const padding = Math.max(
          6,
          Math.min(watermarkWidth, watermarkHeight) * 0.03
        );

        const x = isMobileView
          ? padding
          : canvas.width - watermarkWidth - padding;
        const y = canvas.height - watermarkHeight - padding;

        ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
        ctx.fillRect(x, y, watermarkWidth, watermarkHeight);

        ctx.font = `bold ${fontSize}px Arial`;
        ctx.fillStyle = "black";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";

        const date = new Date();
        const watermarkText = [
          `Date: ${date.toLocaleDateString()}`,
          `Time: ${date.toLocaleTimeString()}`,
          `Location: ${weather ? weather.formattedLocation : "N/A"}`,
          `Temp: ${weather && weather.main ? `${weather.main.temp}°C` : "N/A"}`,
          `Weather: ${
            weather && weather.weather ? weather.weather[0].description : "N/A"
          }`,
          `Pressure: ${
            weather && weather.main ? `${weather.main.pressure} hPa` : "N/A"
          }`,
          `Wind: ${
            weather && weather.wind ? `${weather.wind.speed} m/s` : "N/A"
          }`,
        ];

        const lineHeight = Math.min(
          fontSize * 1.2,
          (watermarkHeight - padding * 2) / watermarkText.length
        );

        watermarkText.forEach((line, index) => {
          const textY = y + padding + index * lineHeight;
          if (textY + lineHeight <= y + watermarkHeight - padding) {
            ctx.fillText(
              line,
              x + padding,
              textY,
              watermarkWidth - padding * 2
            );
          }
        });

        canvas.toBlob(resolve, "image/jpeg", 0.95);
      };
      img.src = imageData;
    });
  }, []);

  const processAndDownloadImage = useCallback(
    async (file) => {
      try {
        console.log("Processing and downloading image...");
        const imageData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(file);
        });

        const watermarkedBlob = await addWatermark(
          imageData,
          weatherDataRef.current,
          isMobile
        );

        if (isMobile) {
          console.log("Handling mobile image...");
          // Convert blob to data URL
          const reader = new FileReader();
          reader.onloadend = function () {
            const dataUrl = reader.result;
            console.log("Image converted to data URL");
            // Create a temporary anchor element
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "captured_image_with_watermark.jpg";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            console.log("Download triggered");
          };
          reader.readAsDataURL(watermarkedBlob);
        } else {
          console.log("Triggering download for desktop...");
          const url = URL.createObjectURL(watermarkedBlob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "captured_image_with_watermark.jpg";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }

        onImageCapture(watermarkedBlob);
        console.log("Image processed and handled successfully");
      } catch (err) {
        console.log(
          `Failed to process image: ${err.message || "Unknown error"}`
        );
        setError(`Failed to process image: ${err.message || "Unknown error"}`);
      } finally {
        setIsLoading(false);
      }
    },
    [isMobile, onImageCapture, addWatermark]
  );

  const triggerDownload = useCallback((blob) => {
    console.log("Triggering download...");
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "captured_image_with_watermark.jpg";
    // Dispatch a click event instead of calling click() directly
    const clickEvent = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: false,
    });
    a.dispatchEvent(clickEvent);
    URL.revokeObjectURL(url);
    console.log("Download triggered");
  }, []);

  const captureImage = useCallback((video) => {
    return new Promise((resolve) => {
      console.log("Capturing image from video...");
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d").drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        resolve(new File([blob], "captured_image.jpg", { type: "image/jpeg" }));
      }, "image/jpeg");
    });
  }, []);

  const handleCameraClick = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (!userLocation) {
        throw new Error(
          "User location not available. Please enable location services and refresh the page."
        );
      }

      await fetchWeatherData(userLocation.latitude, userLocation.longitude);

      if (isMobile) {
        console.log("Opening file input for mobile...");
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.capture = "environment";

        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (file) {
            console.log("File selected, processing...");
            const processedBlob = await processAndDownloadImage(file);
            triggerDownload(processedBlob);
          } else {
            console.log("No file selected");
            setIsLoading(false);
          }
        };

        input.onerror = (error) => {
          console.log(
            `Failed to open camera: ${error.message || "Unknown error"}`
          );
          setError(
            `Failed to open camera: ${error.message || "Unknown error"}`
          );
          setIsLoading(false);
        };

        input.click();
      } else {
        console.log("Opening camera for desktop...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        const video = document.createElement("video");
        video.srcObject = stream;
        video.autoplay = true;

        const captureButton = document.createElement("button");
        captureButton.textContent = "Capture";
        captureButton.style.position = "fixed";
        captureButton.style.bottom = "20px";
        captureButton.style.left = "50%";
        captureButton.style.transform = "translateX(-50%)";
        captureButton.style.zIndex = "1001";

        document.body.appendChild(video);
        document.body.appendChild(captureButton);

        captureButton.onclick = async () => {
          console.log("Capture button clicked");
          const file = await captureImage(video);
          await processAndDownloadImage(file);

          stream.getTracks().forEach((track) => track.stop());
          document.body.removeChild(video);
          document.body.removeChild(captureButton);
        };
      }
    } catch (err) {
      console.error("Error in handleCameraClick:", err);
      setError(`Failed to start camera: ${err.message || "Unknown error"}`);
      setIsLoading(false);
    }
  }, [
    isMobile,
    userLocation,
    fetchWeatherData,
    processAndDownloadImage,
    triggerDownload,
  ]);

  return (
    <>
      <button
        onClick={handleCameraClick}
        disabled={isLoading || !userLocation}
        className={`fixed bottom-[90px] right-6 h-20 w-20 rounded-full bg-indigo-600 shadow-lg hover:bg-indigo-700 flex flex-col items-center justify-center z-50 ${
          isLoading || !userLocation ? "opacity-70 cursor-not-allowed" : ""
        }`}
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
      {error && (
        <div className="fixed bottom-24 left-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-md">
          {error}
        </div>
      )}
    </>
  );
};

export default CameraButton;

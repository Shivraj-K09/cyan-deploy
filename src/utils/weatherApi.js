const API_KEY = import.meta.env.VITE_OPENWEATHERMAP_API_KEY;

async function getReverseGeocode(lat, lon) {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${API_KEY}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch location data");
    }
    const data = await response.json();
    if (data && data[0]) {
      return {
        name: data[0].name,
        state: data[0].state,
        country: data[0].country,
      };
    }
    throw new Error("No location data found");
  } catch (error) {
    console.error("Error fetching location data:", error);
    throw error;
  }
}

export async function getWeatherData(lat, lon) {
  if (!API_KEY) {
    throw new Error(
      "OpenWeatherMap API key is not set. Please check your environment variables."
    );
  }
  try {
    const locationData = await getReverseGeocode(lat, lon);

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`
    );
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid API key. Please check your OpenWeatherMap API key."
        );
      }
      throw new Error(`Failed to fetch weather data: ${response.statusText}`);
    }
    const weatherData = await response.json();

    // Format the location string
    const locationString = [
      locationData.name,
      locationData.state,
      locationData.country,
    ]
      .filter(Boolean) // Remove any undefined or null values
      .join(", "); // Join the remaining parts with a comma and space

    return {
      ...weatherData,
      formattedLocation: locationString,
    };
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error;
  }
}

import { toast } from "sonner";

const TWILIO_VERIFY_URL = "https://verify.twilio.com/v2/Services";
const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN;
const TWILIO_VERIFY_SID = import.meta.env.VITE_TWILIO_VERIFY_SID;

const formatPhoneNumber = (phoneNumber) => {
  // Remove any non-digit characters
  const digitsOnly = phoneNumber.replace(/\D/g, "");

  // Check if the number already has a country code
  if (digitsOnly.startsWith("+")) {
    return digitsOnly;
  }

  // If it's an Indian number (assuming it starts with 91 or 0)
  if (digitsOnly.startsWith("91") || digitsOnly.startsWith("0")) {
    return `+${digitsOnly.replace(/^0/, "91")}`;
  }

  // For other numbers, assume it's a US/Canada number
  return digitsOnly.startsWith("1") ? `+${digitsOnly}` : `+82${digitsOnly}`;
};

let isRequestInProgress = false;

const sendVerificationCode = async (phoneNumber) => {
  if (isRequestInProgress) {
    console.log("A request is already in progress. Skipping this one.");
    return false;
  }

  isRequestInProgress = true;

  try {
    console.log(`Attempting to send verification code to ${phoneNumber}`);
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const response = await fetch(
      `${TWILIO_VERIFY_URL}/${TWILIO_VERIFY_SID}/Verifications`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({
          To: formattedPhoneNumber,
          Channel: "sms",
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Error response from Twilio:`, errorData);
      throw new Error(errorData.message || "Failed to send verification code");
    }

    console.log(`Verification code sent successfully to ${phoneNumber}`);
    return true;
  } catch (error) {
    console.error("Error sending verification code:", error);
    toast.error(error.message || "Failed to send verification code");
    return false;
  } finally {
    isRequestInProgress = false;
  }
};

const verifyCode = async (phoneNumber, code) => {
  try {
    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const response = await fetch(
      `${TWILIO_VERIFY_URL}/${TWILIO_VERIFY_SID}/VerificationCheck`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        },
        body: new URLSearchParams({
          To: formattedPhoneNumber,
          Code: code,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to verify code");
    }

    const data = await response.json();
    return data.status === "approved";
  } catch (error) {
    console.error("Error verifying code:", error);
    toast.error(error.message || "Failed to verify code");
    return false;
  }
};

export { sendVerificationCode, verifyCode };

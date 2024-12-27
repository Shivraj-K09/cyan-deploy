import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import { toast } from "sonner";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        if (data?.session) {
          const { user } = data.session;

          // Prepare user data
          const userData = {
            id: user.id,
            email: user.email,
            name:
              user.user_metadata.full_name ||
              user.user_metadata.name ||
              user.email,
            avatar_url: user.user_metadata.avatar_url,
            provider: user.app_metadata.provider,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          // Store user data in the public users table
          const { error: upsertError } = await supabase
            .from("users")
            .upsert(userData, {
              onConflict: "id",
              returning: "minimal",
            });

          if (upsertError) {
            console.error("Error storing user data:", upsertError);
            toast.error("User Data Warning", {
              description:
                "Some user data couldn't be stored. Please contact support.",
            });
          }

          toast.success("Authentication Successful", {
            description: "You have been successfully logged in.",
          });

          // Handle redirection
          navigate("/");
        } else {
          throw new Error("No session data found");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        toast.error("Authentication Failed", {
          description: "Unable to authenticate. Please try again.",
        });

        navigate("/login");
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center w-full h-screen">
      Processing authentication...
    </div>
  );
};

export default AuthCallback;

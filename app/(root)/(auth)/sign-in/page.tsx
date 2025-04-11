"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signInSchema } from "@/lib/schema/auth-schema";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext"; // Import AuthContext

// Define the interface using the schema type
type SignInParams = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setToken } = useAuth();

  const signIn = async (params: SignInParams) => {
    setIsLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      const response = await fetch(
        "https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/auths",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      const data = await response.json();

      // Luôn đóng toast loading trước
      toast.dismiss(toastId);

      if (data.status_code === 200) {
        const accessToken = data.meta_data.access_token;
        localStorage.setItem("accessToken", accessToken);
        setToken(accessToken);
        console.log("Login successful, access token saved:", accessToken);

        // Hiển thị toast success mới
        toast.success("Sign in successful!", { autoClose: 3000 });
        return { success: true };
      } else {
        // Hiển thị toast error mới
        toast.error("Login failed: " + (data.errors?.join(", ") || "Unknown error"), { autoClose: 3000 });
        return { success: false, error: data.errors };
      }
    } catch (error) {
      // Đóng toast loading và hiển thị lỗi
      toast.dismiss(toastId);
      toast.error("Error during login: " + (error as Error).message, { autoClose: 3000 });
      return { success: false, error: "Login error" };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        limit={1}
        newestOnTop={true}
      />
      <div className="container mx-auto py-10">
        <AuthForm
          type="SIGN_IN"
          schema={signInSchema}
          defaultValues={{
            email: "",
            password: "",
          }}
          onSubmit={signIn}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default SignInPage;
"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signInSchema } from "@/lib/schema/auth-schema";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Define the interface using the schema type
type SignInParams = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { setToken, setUserRole } = useAuth();
  const router = useRouter();

  const signIn = async (params: SignInParams) => {
    setIsLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      const response = await fetch(
        "https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/auths",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(params),
        }
      );

      const data = await response.json();

      toast.dismiss(toastId);

      if (data.status_code === 200) {
        const accessToken = data.meta_data.access_token;
        const walletId = data.payload?.wallet_id;
        const userRole = data.payload?.role;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userRole", userRole);

        if (walletId) {
          localStorage.setItem("walletId", walletId);
        }

        setToken(accessToken);
        setUserRole(userRole);

        console.log("Login successful, access token saved:", accessToken);
        console.log("Wallet ID saved:", walletId);
        console.log("User role:", userRole);

        if (userRole !== "CUSTOMER") {
          toast.warning("You are logging in as a non-customer user. Some features may be restricted.", { autoClose: 5000 });
        }

        toast.success("Sign in successful!", { autoClose: 3000 });
        return { success: true };
      } else {
        toast.error("Login failed: " + (data.errors?.join(", ") || "Unknown error"), { autoClose: 3000 });
        return { success: false, error: data.errors };
      }
    } catch (error) {
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
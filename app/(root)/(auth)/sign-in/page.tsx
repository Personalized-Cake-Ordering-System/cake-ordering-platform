"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signInSchema } from "@/lib/schema/auth-schema";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { z } from "zod";

// Define the interface using the schema type
type SignInParams = z.infer<typeof signInSchema>;

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (params: SignInParams) => {
    setIsLoading(true);
    const toastId = toast.loading("Signing in...");

    try {
      const response = await fetch('https://cuscake-ahabbhexbvgebrhh.southeastasia-01.azurewebsites.net/api/auths', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const data = await response.json();

      if (data.status_code === 200) {
        const accessToken = data.meta_data.access_token;
        localStorage.setItem('accessToken', accessToken);
        console.log('Login successful, access token saved:', accessToken);
        toast.update(toastId, {
          render: "Sign in successful!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        return { success: true };
      } else {
        toast.update(toastId, {
          render: 'Login failed: ' + (data.errors?.join(', ') || 'Unknown error'),
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return { success: false, error: data.errors };
      }
    } catch (error) {
      toast.update(toastId, {
        render: 'Error during login: ' + (error as Error).message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return { success: false, error: 'Login error' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
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

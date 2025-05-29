"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signUpSchema } from "@/lib/schema/auth-schema";
import React, { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { z, ZodType } from "zod";

// Define the interface using the schema type
type SignUpParams = z.infer<typeof signUpSchema>;

const SignUpPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const signUp = async (params: SignUpParams) => {
    setIsLoading(true);
    const toastId = toast.loading("Creating your account...");

    try {
      const response = await fetch('https://cus-cake-api-eubghehthseug2g3.eastasia-01.azurewebsites.net/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });
      console.log(response);
      const data = await response.json();

      if (data.status_code === 201) {
        toast.update(toastId, {
          render: "Account created successfully! Please sign in.",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
        return { success: true };
      } else {
        toast.update(toastId, {
          render: 'Registration failed: ' + (data.errors?.join(', ') || 'Unknown error'),
          type: "error",
          isLoading: false,
          autoClose: 3000,
        });
        return { success: false, error: data.errors };
      }
    } catch (error) {
      toast.update(toastId, {
        render: 'Error during registration: ' + (error as Error).message,
        type: "error",
        isLoading: false,
        autoClose: 3000,
      });
      return { success: false, error: 'Registration error' };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container mx-auto py-10">
        <AuthForm
          type="SIGN_UP"
          schema={signUpSchema as ZodType<SignUpParams>}
          defaultValues={{
            name: "",
            email: "",
            password: "",
            phone: "",
            address: "",
            latitude: "0",
            longitude: "0",
          }}
          onSubmit={signUp}
          isLoading={isLoading}
        />
      </div>
    </>
  );
};

export default SignUpPage;

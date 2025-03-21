"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signInSchema } from "@/lib/schema/auth-schema";
import React from "react";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const SignInPage = () => {
  const signIn = async (
    params: { email: string; password: string }
  ) => {
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
        // Save the access token for future use
        localStorage.setItem('accessToken', accessToken);
        console.log('Login successful, access token saved:', accessToken);
        return { success: true };
      } else {
        toast.error('Login failed: ' + (data.errors.join(', ') || 'Unknown error'));
        return { success: false, error: data.errors };
      }
    } catch (error) {
      toast.error('Error during login: ' + (error as Error).message);
      return { success: false, error: 'Login error' };
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="sign-in-container">
        <AuthForm
          type="SIGN_IN"
          schema={signInSchema}
          defaultValues={{
            email: "",
            password: "",
          }}
          onSubmit={signIn}
        />
      </div>
    </>
  );
};

export default SignInPage;

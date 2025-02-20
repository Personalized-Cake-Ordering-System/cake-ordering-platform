"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signUpSchema } from "@/lib/schema/auth-schema";
import React from "react";

const SignUpPage = () => {
  const signUp = async (params: AuthCredentials) => {
    try {
      return { success: true };
    } catch (error) {
      console.log(error, "Signup error");
      return { success: false, error: "Signup error" };
    }
  };

  return (
    <AuthForm
      type="SIGN_UP"
      schema={signUpSchema}
      defaultValues={{
        email: "",
        password: "",
        fullName: "",
      }}
      onSubmit={signUp}
    />
  );
};

export default SignUpPage;

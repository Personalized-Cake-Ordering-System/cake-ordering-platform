"use client";
import AuthForm from "@/components/shared/auth/auth-form";
import { signInSchema } from "@/lib/schema/auth-schema";
import React from "react";

const SignInPage = () => {
  const signIn = async (
    params: Pick<AuthCredentials, "email" | "password">
  ) => {
    try {
      console.log(params);
      return { success: true };
    } catch (error) {
      console.log(error, "signIn error");
      return { success: false, error: "signIn error" };
    }
  };

  return (
    <AuthForm
      type="SIGN_IN"
      schema={signInSchema}
      defaultValues={{
        email: "",
        password: "",
      }}
      onSubmit={signIn}
    />
  );
};

export default SignInPage;

import { z } from "zod";

export const signUpSchema = z.object({
  name: z.string().min(3 , "Name must be at least 3 characters") ,
  email: z.string().email("Invalid email format") ,
  password: z.string()
    .min(8 , "Password must be at least 8 characters long")
    .max(30 , "Password must be between 8 - 30 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/ ,
      "Password must contain at least one uppercase letter , one lowercase letter , and one number"
    ) ,
  phone: z.string()
    .regex(
      /^\+?[0-9]{9 ,15}$/ ,
      "Phone number must be valid (9-15 digits , optional + prefix)"
    ) ,
  address: z.string().min(5 , "Please enter a valid address") ,
  // Using preprocess to ensure these are always strings , not optional
  latitude: z.preprocess(
    val => val === undefined ? "0" : val ,
    z.string()
  ) ,
  longitude: z.preprocess(
    val => val === undefined ? "0" : val , 
    z.string()
  )
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email format") ,
  password: z.string().min(1 , "Password is required") ,
 });
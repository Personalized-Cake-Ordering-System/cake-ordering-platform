"use client" ;

import { zodResolver } from "@hookform/resolvers/zod" ;
import {
  DefaultValues,
  FieldValues,
  Path,
  SubmitHandler,
  useForm,
  UseFormReturn,
} from "react-hook-form" ;
import { ZodType } from "zod" ;

import { Button } from "@/components/ui/button" ;
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form" ;
import { Input } from "@/components/ui/input" ;
import Link from "next/link" ;
import { FIELD_NAMES, FIELD_TYPES } from "@/constants/field-constants" ;
import { useToast } from "@/components/ui/use-toast" ;
import { useRouter } from "next/navigation" ;

interface Props<T extends FieldValues> {
  schema: ZodType<T> ;
  defaultValues: T ;
  onSubmit: (data: T) => Promise<{ success: boolean ; error?: string }> ;
  type: "SIGN_IN" | "SIGN_UP" ;
  isLoading?: boolean ;
}

const AuthForm = <T extends FieldValues>({
  type,
  schema,
  defaultValues,
  onSubmit,
  isLoading = false,
}: Props<T>) => {
  const router = useRouter() ;
  const { toast } = useToast() ;

  const isSignIn = type === "SIGN_IN" ;

  const form: UseFormReturn<T> = useForm({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  }) ;

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const result = await onSubmit(data) ;

    if (result.success) {
      toast({
        title: "Success",
        description: isSignIn
          ? "You have successfully signed in."
          : "You have successfully signed up.",
      }) ;

      router.push("/") ;
    } else {
      toast({
        title: `Error ${isSignIn ? "signing in" : "signing up"}`,
        description: result.error ?? "An error occurred.",
        variant: "destructive",
      }) ;
    }
  } ;

  return (
    <div className="flex flex-col gap-6 max-w-md mx-auto p-6 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isSignIn ? "Welcome back to CusCake" : "Create your CusCake account"}
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          {isSignIn
            ? "Sign in to access your account and place orders"
            : "Join us to order delicious custom cakes and treats"}
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="w-full space-y-4"
        >
          {Object.keys(defaultValues).map((field) => {
            // Skip rendering hidden fields in the UI
            if (FIELD_TYPES[field as keyof typeof FIELD_TYPES] === "hidden") {
              return null ;
            }

            return (
              <FormField
                key={field}
                control={form.control}
                name={field as Path<T>}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 dark:text-gray-200">
                      {FIELD_NAMES[field.name as keyof typeof FIELD_NAMES]}
                    </FormLabel>
                    <FormControl>
                      <Input
                        required
                        type={FIELD_TYPES[field.name as keyof typeof FIELD_TYPES]}
                        {...field}
                        className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-custom-teal focus:border-custom-teal dark:focus:ring-custom-teal dark:focus:border-custom-teal"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            ) ;
          })}

          <Button
            type="submit"
            className="w-full bg-custom-teal hover:bg-custom-pink text-white py-2 rounded-md transition-colors dark:bg-custom-teal dark:hover:bg-custom-pink"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : (isSignIn ? "Sign In" : "Sign Up")}
          </Button>
        </form>
      </Form>

      <div className="text-center border-t pt-4 border-gray-200 dark:border-gray-700">
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          {isSignIn ? "Don't have an account? " : "Already have an account? "}
          <Link
            href={isSignIn ? "/sign-up" : "/sign-in"}
            className="font-medium text-custom-teal hover:text-custom-pink transition-colors"
          >
            {isSignIn ? "Sign up now" : "Sign in"}
          </Link>
        </p>

        {/* {isSignIn && (
          <Link href="/bakery-register">
            <Button variant="ghost" className="mt-3 text-sm text-gray-600 dark:text-gray-300 hover:text-custom-teal">
              Register as a bakery
            </Button>
          </Link>
        )} */}
      </div>
    </div>
  ) ;
} ;

export default AuthForm ;

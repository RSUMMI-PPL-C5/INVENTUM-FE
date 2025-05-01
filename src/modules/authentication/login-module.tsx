"use client";

import Image from 'next/image';
import { Show, Hide } from 'react-iconly';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function LoginModule() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false)

  const formSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    password: z.string().min(1, { message: "Password is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred during login');
      }

      const responseData = await response.json();
      Cookies.set('accessToken', responseData.data.user.token, { expires: 7 });

      router.push('/dashboard/user');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred during login');
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        if (error === "unauthorized") {
          toast.warning("You need to login first");
        } else if (error === "server_error") {
          toast.error("Something went wrong. Please try again.");
        }
      }, 100);
    }
  }, [error]);

  return (
    <div className="h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-8 mb-8">
        <Image
          width={200}
          height={0}
          src="/rsummi-logo.png"
          className="h-auto"
          alt="Logo RS UMMI"
        />
        <div className="bg-white w-[400px] gap-8 px-12 py-6 flex flex-col items-center justify-center shadow-[0px_0px_100px_0px_rgba(0,0,0,0.10)] text-m-medium font-plus-jakarta-sans rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <span className="text-header-h3 font-poppins text-primary-solid">INVENTUM</span>
            <span>Inventaris Terpadu RS UMMI</span>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
              <div className="space-y-4">  
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="azmy.arya.rizaldi" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="******"
                            type={showPassword ? "text" : "password"}
                            className="pr-12"
                            {...field}
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="absolute right-0 top-0 h-full bg-transparent"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                          >
                            {showPassword ? (
                              <Hide set="curved" stroke="bold" primaryColor="#203268" filled />
                            ) : (
                              <Show set="curved" stroke="bold" primaryColor="#203268" filled />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Masuk
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
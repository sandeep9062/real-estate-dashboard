"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useLoginMutation } from "../services/authApi";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../store/authSlice";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, "Email or Phone is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage({
  onLoginSuccess,
  toggleAuthMode,
}: {
  onLoginSuccess: () => void;
  toggleAuthMode: () => void;
}) {
  const [error, setError] = useState("");
  const router = useRouter();
  const [loginUser, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });
  const handleLogin = async (data: LoginFormValues) => {
    try {
      // Transform emailOrPhone to email for backend compatibility
      const loginData = {
        email: data.emailOrPhone,
        password: data.password,
      };

      const result = await loginUser(loginData).unwrap();

      // The backend sets cookies, so we need to get the token from cookies
      const getCookie = (name: string): string | null => {
        if (typeof document === "undefined") return null;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) {
          return parts.pop()?.split(";").shift() || null;
        }
        return null;
      };

      const cookieToken = getCookie("accessToken");

      if (cookieToken) {
        // Store user and token
        dispatch(loginSuccess({ user: result.user, token: cookieToken }));
        localStorage.setItem("token", cookieToken);
        localStorage.setItem("user", JSON.stringify(result.user));

        onLoginSuccess();

        // Check if user has admin role before redirecting to dashboard
        if (result.user.role === "admin") {
          toast.success("Login successful!");
          router.push("/");

          // redirect to dashboard
        } else {
          toast.error("Access denied. Admin role required.");
          setError("Access denied. Admin role required.");
        }
      } else {
        // Fallback to response token if cookies aren't available
        if (result.token) {
          dispatch(loginSuccess({ user: result.user, token: result.token }));
          localStorage.setItem("token", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));

          toast.success("Login successful!");
          onLoginSuccess();

          // Check if user has admin role before redirecting to dashboard
          if (result.user.role === "admin") {
            router.push("/"); // redirect to dashboard
          } else {
            toast.error("Access denied. Admin role required.");
            setError("Access denied. Admin role required.");
          }
        } else {
          throw new Error("Authentication failed - no token received");
        }
      }
    } catch (err: any) {
      setError(err.data?.message || "Login failed");
      toast.error(err.data?.message || "Login failed");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-gray-100 bg-center bg-cover relative"
      style={{ backgroundImage: "url('/real-estate-login.jpg')" }}
    >
      {/* Logo in top-left corner */}
      <div className="absolute top-6 left-6 z-10">
        <img
          src="/propertybulbul.png"
          alt="PropertyBulbul Logo"
          className="h-18 w-auto"
        />
      </div>

      <div className="w-full max-w-sm p-6 sm:p-10 mx-4 sm:mx-0 shadow-xl bg-white/30 backdrop-blur-md rounded-xl">
        <h2 className="mb-6 text-2xl font-bold text-center text-gray-900">
          Admin Login
        </h2>
        {error && <p className="mb-4 text-center text-red-500">{error}</p>}

        <form
          onSubmit={handleSubmit(handleLogin)}
          className="flex flex-col gap-4"
        >
          <div>
            <input
              type="text"
              placeholder="Email or Phone"
              {...register("emailOrPhone")}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.emailOrPhone && (
              <p className="text-red-500 text-sm mt-1">
                {errors.emailOrPhone.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              {...register("password")}
              className="w-full p-3 border border-gray-300  rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="w-full p-3 text-white transition duration-200 bg-indigo-600 rounded-lg hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* <p className="mt-4 text-sm text-center text-gray-700">
          Don't have an account?{" "}
          <button
            onClick={toggleAuthMode}
            className="text-indigo-600 hover:underline"
          >
            Sign up
          </button>
        </p> */}
      </div>
    </div>
  );
}

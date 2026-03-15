"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Separator } from "./ui/separator";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { useLogoutMutation } from "../services/authApi";
import { useUpdateProfileMutation } from "../services/userApi";
import { logoutSuccess as logoutAction, setUser } from "../store/authSlice";
import { toast } from "sonner";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import Image from "next/image";

import { LogOut, User as UserIcon, Upload, X } from "lucide-react";

interface ProfileMenuProps {
  user: any;
}

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(1, "Phone is required"),
});

type FormData = z.infer<typeof schema>;

const ProfileMenu: React.FC<ProfileMenuProps> = ({ user }) => {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [logout] = useLogoutMutation();
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.image || null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  useEffect(() => {
    if (user?.image) {
      if (user.image.startsWith("http") || user.image.startsWith("https")) {
        setPreview(user.image);
      } else {
        // Handle relative paths from backend
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000";
        const imageUrl = `${apiUrl}/${user.image
          .replace(/\\/g, "/")
          .replace(/^\/+/, "")}`;
        setPreview(imageUrl);
      }
    }
  }, [user?.image]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setValue("name", user.name || "");
      setValue("email", user.email || "");
      setValue("phone", user.phone || "");
    }
  }, [user, setValue]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(logoutAction());
      router.push("/auth");
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("email", data.email);
    formData.append("phone", data.phone);

    if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const updatedUser = await updateProfile(formData).unwrap();
      dispatch(
        setUser({
          user: updatedUser,
          token: localStorage.getItem("token") || "",
        })
      );
      toast.success("Profile updated successfully");
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Failed to update profile");
      console.error("Failed to update profile:", error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  if (!mounted) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer border-2 border-blue-200 shadow-sm hover:shadow-md transition-all duration-200 ring-2 ring-transparent hover:ring-blue-100">
            <AvatarImage
              src={preview || undefined}
              alt="user image"
              className="object-cover"
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
              {user?.name
                ?.split(" ")
                .map((n: string) => n[0])
                .join("")
                .toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-72 p-0 shadow-xl border-0 bg-white rounded-xl overflow-hidden">
          {/* User Info Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
                <AvatarImage
                  src={preview || undefined}
                  alt="user image"
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold">
                  {user?.name
                    ?.split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-gray-900 truncate">
                  {user?.name || "User"}
                </p>
                <p className="text-sm text-gray-600 truncate">{user?.email}</p>
                <p className="text-sm text-gray-500 truncate">{user?.phone}</p>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <DropdownMenuItem
              onClick={() => setIsModalOpen(true)}
              className="mx-2 rounded-lg hover:bg-blue-50 transition-colors duration-150 focus:bg-blue-50"
            >
              <UserIcon className="mr-3 h-4 w-4 text-blue-600" />
              <span className="font-medium text-gray-700">Edit Profile</span>
            </DropdownMenuItem>
          </div>

          <div className="border-t border-gray-100 p-2">
            <DropdownMenuItem
              onClick={handleLogout}
              className="mx-2 rounded-lg hover:bg-red-50 text-red-600 transition-colors duration-150 focus:bg-red-50"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span className="font-medium">Logout</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-lg p-0 border-0 bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-3">
              <UserIcon className="h-6 w-6" />
              <div>
                <h2 className="text-xl font-bold">Edit Profile</h2>
                <p className="text-blue-100 text-sm">
                  Update your personal information
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Profile Image Section */}
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                {preview ? (
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100 shadow-lg">
                      <Image
                        src={preview}
                        width={96}
                        height={96}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 h-7 w-7 p-0 rounded-full shadow-md hover:shadow-lg transition-all duration-200"
                      onClick={() => {
                        setPreview(null);
                        setImageFile(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full border-2 border-dashed border-gray-300 bg-gray-50 flex items-center justify-center hover:border-blue-400 hover:bg-blue-50 transition-colors duration-200 cursor-pointer group">
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="text-xs text-gray-500 mt-1">Upload</span>
                    </Label>
                  </div>
                )}
              </div>
              {!preview && (
                <p className="text-sm text-gray-500 text-center">
                  Choose a profile picture
                </p>
              )}
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-400">
                Supported formats: JPG, PNG. Max size: 3MB
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-5">
              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className="text-sm font-semibold text-gray-700"
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  {...register("name")}
                  className="h-11 rounded-lg border-2 focus:border-blue-500 transition-colors"
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.name.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-700"
                >
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  className="h-11 rounded-lg border-2 focus:border-blue-500 transition-colors"
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700">
                  Phone Number
                </Label>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={watch("phone")}
                  onChange={(value) => setValue("phone", value || "")}
                  className="flex h-11 w-full rounded-lg border-2 border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  defaultCountry="IN"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <span className="text-xs">⚠</span> {errors.phone.message}
                  </p>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 h-11 rounded-lg border-2 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 h-11 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Updating...
                  </div>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProfileMenu;

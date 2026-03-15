"use client";
import { useState } from "react";
import LoginPage from "@/components/LoginPage";
import SignupPage from "@/components/SignupPage";
import { StoreProvider } from "@/store/StoreProvider";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);
  };

  const handleLoginSuccess = () => {
    // This function can be expanded later
    console.log("Login successful!");
  };

  return (
    <StoreProvider>
      <div className=" justify-center bg-gray-100">
        {isLogin ? (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            toggleAuthMode={toggleAuthMode}
          />
        ) : (
          <SignupPage toggleAuthMode={toggleAuthMode} />
        )}
      </div>
    </StoreProvider>
  );
};

export default AuthPage;

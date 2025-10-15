"use client";

import { LoginForm } from "./components/login-form";
import { useAuth } from "./lib/auth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";


export default function HomePage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return null;
}

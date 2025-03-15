// routesConfig.tsx
import React from "react";
import Home from "../components/pages/home";
import LoginForm from "../components/auth/LoginForm";
import SignUpForm from "../components/auth/SignUpForm";
import Recipes from "../components/pages/recipes";
import Community from "../components/pages/community";
import Success from "../components/pages/success";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

//? Adjust the path as necessary
const appRoutes = [
    { path: "/", element: <Home /> },
    { path: "/login", element: <LoginForm /> },
    { path: "/signup", element: <SignUpForm /> },
    { path: "/recipes", element: <Recipes /> },
    { path: "/community", element: <Community /> },
    { path: "/success", element: <Success /> },
    { path: "/forgot-password", element: <ForgotPasswordForm /> }
];

export default appRoutes;

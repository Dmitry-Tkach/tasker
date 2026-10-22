import type { Metadata } from "next";
import { ForgotPasswordForm } from "../components/forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password · Tasker",
};

const ForgotPassword = () => {
  return (
    <ForgotPasswordForm/>
  )
}

export default ForgotPassword;

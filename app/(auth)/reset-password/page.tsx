import type { Metadata } from "next";
import { ResetPasswordForm } from "../components/reset-password-form";

export const metadata: Metadata = {
  title: "Reset password · Tasker",
};

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value)?.trim() || undefined;

// Appwrite recovery emails link here as /reset-password?userId=...&secret=...
const ResetPassword = async ({ searchParams }: PageProps<"/reset-password">) => {
  const { userId, secret } = await searchParams;

  return (
    <ResetPasswordForm userId={first(userId)} secret={first(secret)}/>
  )
}

export default ResetPassword;

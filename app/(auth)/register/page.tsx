import { AuthForm } from "../components/register-form";
import { safeRedirectPath } from "../_lib/session";

// `?next=` is where the proxy/requireUser wanted to send the user; only
// same-site paths are honoured.
const Register = async ({ searchParams }: PageProps<"/register">) => {
  const { next } = await searchParams;

  return (
    <AuthForm redirectTo={safeRedirectPath(Array.isArray(next) ? next[0] : next)}/>
  )
}

export default Register;

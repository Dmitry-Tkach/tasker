import { AuthForm } from "../components/login-form";
import { safeRedirectPath } from "../_lib/session";

// `?next=` is where the proxy/requireUser wanted to send the user; only
// same-site paths are honoured.
const Login = async ({ searchParams }: PageProps<"/login">) => {
  const { next } = await searchParams;

  return (
    <AuthForm redirectTo={safeRedirectPath(Array.isArray(next) ? next[0] : next)}/>
  )
}

export default Login;

import LoginRegister from "@/src/views/LoginRegister";
import { loginFormAction } from "@/src/actions/authActions";
import { LoginErrorBoundary } from "@/src/components/LoginErrorBoundary";

export default async function LoginRolePage({ params }) {
  const { role } = await params;
  return (
    <LoginErrorBoundary role={role}>
      <LoginRegister role={role} loginAction={loginFormAction} />
    </LoginErrorBoundary>
  );
}

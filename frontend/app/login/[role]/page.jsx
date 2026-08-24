import LoginRegister from "@/src/views/LoginRegister";
import { loginFormAction } from "@/src/actions/authActions";

export default async function LoginRolePage({ params }) {
  const { role } = await params;
  return <LoginRegister role={role} loginAction={loginFormAction.bind(null, role)} />;
}

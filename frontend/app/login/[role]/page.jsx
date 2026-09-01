import LoginRegister from "@/src/views/LoginRegister";
import { loginFormAction } from "@/src/actions/authActions";

export const dynamic = 'force-dynamic';

export default async function LoginRolePage({ params }) {
  try {
    const { role } = await params;
    return <LoginRegister role={role} loginAction={loginFormAction} />;
  } catch (err) {
    const msg = err?.response?.data?.message || "Đăng nhập thất bại, vui lòng thử lại";
    return (
      <LoginRegister role="tenant" loginAction={loginFormAction} serverError={msg} />
    );
  }
}

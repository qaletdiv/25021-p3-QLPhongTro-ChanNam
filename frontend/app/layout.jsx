import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "SmartRent - Quản Lý Phòng Trọ",
  description: "Hệ thống quản lý phòng trọ thông minh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

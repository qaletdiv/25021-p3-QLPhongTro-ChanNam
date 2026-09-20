import { NextResponse } from "next/server";

// Proxy ảnh từ backend (IMAGE_STORAGE=local).
//
// Frontend truyền URL dẫn xuất từ backend dạng "/api/images/<encoded-key>"
// sang query "?src=<encoded-key>" (qua resolveImageSrc). Trình duyệtr gọi
// GET /images?src=... (cùng origin frontend) — tức KHÔNG qua rewrite
// /api/:path* nên KHÔNG gọi thẳng backend.
//
// Rule này lấy `src`, forward cookie HttpOnly xuống backend /api/images/<src>,
// rồi stream ảnh về. `src` được giữ nguyên dưỡng dạng đã encode của backend
// (có chứa %2F) để backend tự decodeURIComponent.
export async function GET(request) {
  const BACKEND_ORIGIN = (process.env.BACKEND_URL || "http://localhost:3000")
    .replace(/\/+$/, "")
    .replace(/\/api$/, "");

  const { searchParams } = new URL(request.url);
  const src = searchParams.get("src");

  if (!src) {
    return NextResponse.json({ message: "Thiếu tham số ảnh" }, { status: 400 });
  }

  const backendUrl = `${BACKEND_ORIGIN}/api/images/${src}`;

  // Server-side fetch không tự forward HttpOnly cookie -> phải chuyển thủ công.
  const cookieHeader = request.headers.get("cookie");

  let response;
  try {
    response = await fetch(backendUrl, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
  } catch (err) {
    return NextResponse.json({ message: "Lỗi kết nối backend" }, { status: 502 });
  }

  if (!response.ok) {
    return NextResponse.json({ message: "Không tìm thấy ảnh" }, { status: response.status });
  }

  const imageBuffer = await response.arrayBuffer();
  const contentType = response.headers.get("content-type") || "image/jpeg";

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}

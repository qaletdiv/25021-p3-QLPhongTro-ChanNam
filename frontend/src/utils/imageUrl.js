// Chuyển URL ảnh lưu trong DB thành URL hiển thị an toàn.
//
// Backend (IMAGE_STORAGE=local) trả URL dạng "/api/images/<encoded-relpath>".
// Nếu để nguyên, <img src="/api/images/..."> sẽ được trình duyệt gọi thẳng
// backend qua rewrite /api/:path* của Next.js — cùng dạng "bỏ qua frontend".
//
// resolveImageSrc chuyển thành "/images?src=<encoded-relpath>" để ảnh đi qua
// route proxy app/images/route.js (cùng origin), route này forward cookie
// HttpOnly xuống backend. Dùng query-string (không phải đường dẫn động) để
// tránh vấn đề decode %2F trong param đường dẫn của Next.js.
//
// Các dạng URL khác giữ nguyên:
//   - data:image/...             (preview base64 tại client)
//   - https://res.cloudinary.com/ (CDN công khai)
//   - blob:...                   (URL tạm trình duyệt)
export function resolveImageSrc(url) {
  if (!url || typeof url !== "string") return url;
  if (url.startsWith("/api/images/")) {
    const rel = url.slice("/api/images/".length);
    return `/images?src=${encodeURIComponent(rel)}`;
  }
  return url;
}

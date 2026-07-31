# SmartRent Frontend (Next.js)

Frontend cho hệ thống quản lý phòng trọ, xây dựng bằng Next.js 15 (App Router) + MUI + Recharts.

## Cài đặt

```bash
npm install
```

## Chạy phát triển

Backend Express chạy ở `http://localhost:3000`. Frontend chạy ở `http://localhost:5173`, proxy `/api/*` sang backend.

```bash
npm run dev
```

Nếu backend chạy ở cổng khác, set biến môi trường `BACKEND_URL`:

```bash
$env:BACKEND_URL = "http://localhost:4000"
npm run dev
```

## Build sản xuất

```bash
npm run build
npm run start
```

## Cấu trúc

```
app/                    # App Router routes
  login/[role]/         # Đăng nhập / đăng ký theo vai trò (landlord, tenant)
  landlord/             # Các trang của chủ trọ
  tenant/               # Các trang của người thuê
src/
  api/                  # Axios client + API modules
  components/           # RoleRoute, ProtectedRoute
  contexts/             # AuthContext
  layouts/              # MainLayout (chủ trọ), TenantLayout (người thuê)
  views/                # Các trang (page components)
  theme.js              # MUI theme
```

## Ghi chú

- Tất cả view/components đều là client components (`"use client"`) vì ứng dụng dựa vào localStorage, MUI và browser APIs.
- Axios dùng `baseURL: "/api"`; Next.js rewrites `/api/:path*` về backend Express.

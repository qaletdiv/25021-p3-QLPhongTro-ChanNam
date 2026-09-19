import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    // Fetch PDF from backend directly
    // Normalize BACKEND_URL the same way next.config.js does (strip trailing slashes and /api suffix)
    // .env.local: BACKEND_URL=http://localhost:3000/api
    // We need: http://localhost:3000/api/contracts/:id/pdf (not http://localhost:3000/api/api/contracts/:id/pdf)
    const BACKEND_ORIGIN = (process.env.BACKEND_URL || "http://localhost:3000")
      .replace(/\/+$/, "")
      .replace(/\/api$/, "");
    const backendUrl = `${BACKEND_ORIGIN}/api/contracts/${id}/pdf`;

    // Forward cookies from incoming request to backend
    // Server-side fetch() doesn't automatically forward HttpOnly cookies
    const cookieHeader = request.headers.get("cookie");

    const response = await fetch(backendUrl, {
      method: "GET",
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { message: errorText || "Failed to generate PDF" },
        { status: response.status }
      );
    }

    // Get the PDF buffer
    const pdfBuffer = await response.arrayBuffer();

    // Return the PDF as a downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename=hop_dong_${id}.pdf`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF proxy error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
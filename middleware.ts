import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isEventId } from "@/lib/locations";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/").filter(Boolean);

  if (segments[0] !== "events") {
    return NextResponse.next();
  }

  if (segments.length === 2 && !isEventId(segments[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/events/state/${segments[1]}`;
    return NextResponse.rewrite(url);
  }

  if (segments.length === 3 && !isEventId(segments[1])) {
    const url = request.nextUrl.clone();
    url.pathname = `/events/state/${segments[1]}/${segments[2]}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/events/:path*"],
};

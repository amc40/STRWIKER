import { NextResponse, userAgent } from 'next/server';
import { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  return rewriteDeviceSpecificPathname(request);
}

// should not contain trailing /
const DEVICE_SPECIFIC_PATH_ENDS = ['current-game'];

const rewriteDeviceSpecificPathname = (request: NextRequest) => {
  const pathname = request.nextUrl.pathname;
  if (
    !DEVICE_SPECIFIC_PATH_ENDS.some((deviceSpecificPath) =>
      pathname.endsWith(deviceSpecificPath),
    )
  ) {
    return NextResponse.next();
  }
  const { device } = userAgent(request);

  // Check the viewport
  const viewport = device.type === 'mobile' ? 'mobile' : 'desktop';

  // Update the expected url
  request.nextUrl.pathname += `/viewport/${viewport}`;

  return NextResponse.rewrite(request.nextUrl);
};

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
};

import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { IMAGES } from '@/lib/constants';
import { authOptions } from '@/lib/auth';
import { SignOutButton } from '@/components/SignOutButton';

export async function Header() {
  let session = null;
  try {
    session = await getServerSession(authOptions);
  } catch {
    // Invalid session cookie — treat as unauthenticated
  }

  return (
    <header
      className="sticky top-0 z-10 border-b border-white/10 bg-screenriot-bg/95 backdrop-blur"
      role="banner"
      aria-label="Main navigation"
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 rounded focus:outline-none"
          aria-label="Screen Riot — go to home"
        >
          <Image
            src={IMAGES.logo}
            alt="Screen Riot"
            width={160}
            height={40}
            className="h-8 w-auto shrink-0"
          />
        </Link>
        <div className="flex items-center gap-6">
          <Link
            href="/films"
            className="text-sm font-medium text-gray-300 hover:text-white rounded focus:outline-none"
          >
            Discover Films
          </Link>
          <Link
            href="/how-it-works"
            className="text-sm font-medium text-gray-300 hover:text-white rounded focus:outline-none"
          >
            How It Works
          </Link>
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="text-sm font-medium text-screenriot-accent hover:text-screenriot-accent/90 rounded focus:outline-none"
              >
                Dashboard
              </Link>
              <Link
                href="/profile"
                className="text-sm font-medium text-gray-300 hover:text-white rounded focus:outline-none"
                aria-label="Profile"
              >
                Profile
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-gray-300 hover:text-white rounded focus:outline-none"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded bg-screenriot-accent px-3 py-1.5 text-sm font-medium text-screenriot-bg hover:bg-screenriot-accent/90 focus:outline-none"
                role="button"
                aria-label="Register"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

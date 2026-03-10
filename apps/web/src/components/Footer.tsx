import Link from 'next/link';
import Image from 'next/image';
import { IMAGES } from '@/lib/constants';

export function Footer() {
  return (
    <footer
      className="border-t border-white/10 bg-screenriot-bg-elevated"
      role="contentinfo"
      aria-label="Site footer"
    >
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="inline-block rounded focus:outline-none">
              <Image
                src={IMAGES.logo}
                alt="Screen Riot"
                width={120}
                height={30}
                className="h-7 w-auto"
              />
            </Link>
            <p className="mt-3 text-sm text-screenriot-muted">
              Democratizing film financing through community voting and
              blockchain technology.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              For Filmmakers
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/#submit" className="text-sm text-gray-300 hover:text-white">
                  Submit your project
                </Link>
              </li>
              <li>
                <Link href="/#success" className="text-sm text-gray-300 hover:text-white">
                  Success stories
                </Link>
              </li>
              <li>
                <Link href="/#resources" className="text-sm text-gray-300 hover:text-white">
                  Filmmaker resources
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-300 hover:text-white">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              For Investors
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/#how-it-works" className="text-sm text-gray-300 hover:text-white">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/#architecture" className="text-sm text-gray-300 hover:text-white">
                  Platform architecture
                </Link>
              </li>
              <li>
                <Link href="/#tiers" className="text-sm text-gray-300 hover:text-white">
                  Investment tiers
                </Link>
              </li>
              <li>
                <Link href="/#returns" className="text-sm text-gray-300 hover:text-white">
                  DD & returns
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
              Company
            </h3>
            <ul className="mt-3 space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-300 hover:text-white">
                  About us
                </Link>
              </li>
              <li>
                <Link href="/legal" className="text-sm text-gray-300 hover:text-white">
                  Legal & compliance
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-300 hover:text-white">
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-8 text-center text-xs text-screenriot-muted">
          © {new Date().getFullYear()} Screen Riot. All rights reserved. Built
          on blockchain technology with regulatory compliance.
        </p>
      </div>
    </footer>
  );
}

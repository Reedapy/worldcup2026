'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home' },
  { href: '/fixtures', label: 'Fixtures' },
  { href: '/stats', label: 'Stats' },
  { href: '/standings', label: 'Standings' },
  { href: '/bracket', label: 'Bracket' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label }) => {
        const active = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`nav-link${active ? ' nav-link--active' : ''}`}
          >
            {label}
          </Link>
        );
      })}
    </>
  );
}

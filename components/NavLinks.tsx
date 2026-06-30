'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/fixtures', label: 'Fixtures', icon: '📅' },
  { href: '/standings', label: 'Standings', icon: '📊' },
  { href: '/bracket', label: 'Bracket', icon: '🏆' },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <>
      {links.map(({ href, label, icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '8px 4px',
              textDecoration: 'none',
              color: active ? '#c9a227' : '#64748b',
              borderBottom: active ? '2px solid #c9a227' : '2px solid transparent',
              transition: 'color 0.15s, border-color 0.15s',
              fontSize: 11,
              fontWeight: active ? 700 : 500,
            }}
          >
            <span style={{ fontSize: 18 }}>{icon}</span>
            {label}
          </Link>
        );
      })}
    </>
  );
}

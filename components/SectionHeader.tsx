interface SectionHeaderProps {
  children: React.ReactNode;
  variant?: 'default' | 'live' | 'gold';
}

export function SectionHeader({ children, variant = 'default' }: SectionHeaderProps) {
  const cls = variant === 'live' ? 'section-label--live' : variant === 'gold' ? 'section-label--gold' : '';
  return (
    <div className={`section-label ${cls}`}>
      <span>{children}</span>
    </div>
  );
}

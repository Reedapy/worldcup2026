import { flagUrl } from '@/lib/utils';

interface FlagProps {
  tla: string;
  name: string;
  size?: number;
}

export function Flag({ tla, name, size = 32 }: FlagProps) {
  const url = flagUrl(tla, name);
  if (!url) {
    return (
      <span
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: Math.round(size * 0.67),
          background: '#1e2a3a',
          borderRadius: 3,
          fontSize: size * 0.5,
        }}
      >
        🏳️
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={name}
      width={size}
      height={Math.round(size * 0.67)}
      style={{
        borderRadius: 3,
        objectFit: 'cover',
        display: 'block',
        border: '1px solid rgba(255,255,255,0.1)',
      }}
    />
  );
}

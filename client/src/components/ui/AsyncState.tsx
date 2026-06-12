import { AlertCircle, Loader } from 'lucide-react';

export function LoadingState({ label = 'Загрузка данных...' }: { label?: string }) {
  return (
    <div className="async-state">
      <Loader size={28} className="spinner-icon" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="async-state async-state--error">
      <AlertCircle size={28} />
      {message}
    </div>
  );
}

export function SkeletonGrid({ count = 2, narrow = false, wide = false }: { count?: number; narrow?: boolean; wide?: boolean }) {
  return (
    <div className="skeleton-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton ${narrow ? 'skeleton--narrow' : ''} ${wide ? 'skeleton--wide' : ''}`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

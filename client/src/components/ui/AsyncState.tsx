export function LoadingState({ label = 'Загрузка данных...' }: { label?: string }) {
  return <div className="async-state">{label}</div>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="async-state async-state--error">{message}</div>;
}

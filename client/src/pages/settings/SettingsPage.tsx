import { Paintbrush } from 'lucide-react';
import type { ThemeColor } from '../../types';

const themeOptions: Array<{ value: ThemeColor; label: string }> = [
  { value: 'blue', label: 'Синий' },
  { value: 'black', label: 'Черный' },
  { value: 'green', label: 'Зеленый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'orange', label: 'Оранжевый' },
];

export function SettingsPage({ theme, onThemeChange }: { theme: ThemeColor; onThemeChange: (theme: ThemeColor) => void }) {
  return (
    <section className="settings-page">
      <header className="page-head">
        <div>
          <span className="eyebrow">Настройки</span>
          <h1>Оформление</h1>
          <p>Выберите основной цвет интерфейса. Изменения применяются сразу.</p>
        </div>
      </header>

      <section className="panel settings-panel">
        <div className="section-title">
          <Paintbrush size={20} />
          <h2>Цвет акцента</h2>
        </div>

        <div className="theme-grid">
          {themeOptions.map((option) => (
            <button
              className={theme === option.value ? `theme-option theme-option--${option.value} active` : `theme-option theme-option--${option.value}`}
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              type="button"
              aria-label={option.label}
            >
              <span />
              {option.label}
            </button>
          ))}
        </div>

        {theme !== 'blue' && (
          <p style={{ margin: '16px 0 0', color: '#667085', fontSize: '0.88rem' }}>
            Текущая тема: <strong style={{ color: 'var(--accent)' }}>{themeOptions.find(t => t.value === theme)?.label}</strong>
          </p>
        )}
      </section>
    </section>
  );
}

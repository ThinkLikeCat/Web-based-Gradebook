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
          <p>Выберите основной цвет интерфейса.</p>
        </div>
      </header>

      <section className="panel settings-panel">
        <div className="theme-grid">
          {themeOptions.map((option) => (
            <button
              className={theme === option.value ? `theme-option theme-option--${option.value} active` : `theme-option theme-option--${option.value}`}
              key={option.value}
              onClick={() => onThemeChange(option.value)}
              type="button"
            >
              <span></span>
              {option.label}
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

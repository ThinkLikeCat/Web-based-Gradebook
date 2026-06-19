import { Paintbrush } from 'lucide-react';
import type { ThemeColor } from '../../types';

const themeOptions: Array<{ value: ThemeColor; label: string }> = [
  { value: 'blue', label: 'Синий' },
  { value: 'black', label: 'Черный' },
  { value: 'green', label: 'Зеленый' },
  { value: 'purple', label: 'Фиолетовый' },
  { value: 'orange', label: 'Оранжевый' },
];

const layoutOptions: Array<{ value: LayoutMode; label: string; description: string }> = [
  { value: 'classic', label: 'Старый вид', description: 'Боковое меню всегда видно слева.' },
  { value: 'modern', label: 'Новый вид', description: 'Шапка сверху и меню по кнопке.' },
];

export function SettingsPage({
  theme,
  layoutMode,
  onThemeChange,
  onLayoutModeChange,
}: {
  theme: ThemeColor;
  layoutMode: LayoutMode;
  onThemeChange: (theme: ThemeColor) => void;
  onLayoutModeChange: (mode: LayoutMode) => void;
}) {
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

      <section className="panel settings-panel">
        <h2>Вид сайта</h2>
        <div className="layout-grid">
          {layoutOptions.map((option) => (
            <button
              className={layoutMode === option.value ? 'layout-option active' : 'layout-option'}
              key={option.value}
              onClick={() => onLayoutModeChange(option.value)}
              type="button"
            >
              <strong>{option.label}</strong>
              <span>{option.description}</span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
}

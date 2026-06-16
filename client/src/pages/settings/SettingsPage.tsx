import type { LayoutMode, ThemeColor } from '../../types';

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
          <p>Выберите основной цвет и вид интерфейса.</p>
        </div>
      </header>

      <section className="panel settings-panel">
        <h2>Цвет сайта</h2>
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

import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  const nextMode = dark ? 'light' : 'dark';

  return (
    <button
      onClick={toggle}
      type="button"
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
      className="min-h-11 min-w-11 p-2.5 rounded-lg transition-colors
        cursor-pointer
        bg-slate-200 text-slate-700 hover:bg-slate-300
        dark:bg-slate-700/60 dark:hover:bg-slate-600 dark:text-slate-100
        focus-visible:ring-2 focus-visible:ring-cyan-400"
    >
      <span aria-hidden="true">{dark ? '☀️' : '🌙'}</span>
    </button>
  );
}
import { useTheme } from '../../context/ThemeContext';

export function ThemeToggle() {
  const { dark, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg transition-colors
        bg-slate-700/60 hover:bg-slate-600 text-slate-300 hover:text-white
        dark:bg-slate-700/60 dark:hover:bg-slate-600
        light:bg-slate-200 light:hover:bg-slate-300 light:text-slate-700"
      title={dark ? 'Modo claro' : 'Modo noturno'}
    >
      {dark ? '☀️' : '🌙'}
    </button>
  );
}
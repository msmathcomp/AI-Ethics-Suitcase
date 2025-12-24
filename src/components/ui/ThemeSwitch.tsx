import { useState } from "react";
import { MoonIcon, SunIcon } from "lucide-react";

export default function ThemeSwitch() {
  const [ isDarkMode, setIsDarkMode ] = useState(
    localStorage.theme === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  return (
    <button
      onClick={() => {
        if (isDarkMode) {
          localStorage.theme = 'light';
          document.documentElement.classList.remove('dark');
        } else {
          localStorage.theme = 'dark';
          document.documentElement.classList.add('dark');
        }
        setIsDarkMode(!isDarkMode);
      }}
      className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
    >
      {isDarkMode ? <SunIcon size={30} /> : <MoonIcon size={30} />}
    </button>
  );
}

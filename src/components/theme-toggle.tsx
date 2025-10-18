import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("pharma-theme");
    if (savedTheme === "dark" || savedTheme === "light") {
      setTheme(savedTheme);
    } else {
      setTheme("light");
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("pharma-theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
  
      <button
        onClick={toggleTheme}
        className="rounded-full p-2 bg-primary text-white hover:bg-primary/70 transition"
        aria-label="Toggle theme"
      >
        {theme === "light" ? <Moon /> : <Sun />}
      </button>
    </div>
  );
}

import { Settings } from "lucide-react";
import { Link } from "react-router-dom";

export function SettingToggle() {
 

  return (
    <div className="fixed bottom-16 right-4 z-50 flex flex-col gap-2">
          <Link to="/settings">
        <button
          className="rounded-full p-2 bg-secondary text-secondary-foreground hover:bg-secondary/70 transition"
                  aria-label="Settings"
        >
          <Settings className="h-6 w-6" />
        </button>
      </Link>
     
    </div>
  );
}

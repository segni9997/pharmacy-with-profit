import { useEffect, useState } from "react";

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [visible, setVisible] = useState(!navigator.onLine); // show only if offline initially

  useEffect(() => {
    let timeout: number;

    const handleOnline = () => {
      setIsOnline(true);
      setVisible(true); // show "back online" message
      timeout = window.setTimeout(() => setVisible(false), 3000); // hide after 3 seconds
    };

    const handleOffline = () => {
      setIsOnline(false);
      setVisible(true); // show immediately when offline
      if (timeout) clearTimeout(timeout);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(timeout);
    };
  }, []);

  if (!visible) return null; // hide component when not visible

  return (
    <div
      className={`fixed bottom-0 left-0 px-4 py-1 text-white text-center shadow-md w-full transition-all duration-300 ${
        isOnline ? "bg-green-500" : "bg-red-500"
      }`}
    >
      {isOnline ? "✅ You're back online" : "⚠️ You're offline"}
    </div>
  );
}

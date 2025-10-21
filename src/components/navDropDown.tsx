import { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  LayoutDashboardIcon,
  Pill,
  User,
  CurrencyIcon,
  TrendingUpDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";

const baseMenuItems = [
  { icon: ShoppingCart, label: "POS", to: "/pos" },
  { icon: LayoutDashboardIcon, label: "Dashboard", to: "/dashboard" },
  { icon: Pill, label: "Medicine", to: "/medicines" },
  { icon: User, label: "User", to: "/users" },
  { icon: CurrencyIcon, label: "Sold Medicine", to: "/sold-medicines" },
  { icon: TrendingUpDown, label: "Analytics", to: "/reports" },
];

const RADIUS = 100;

export function NavDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [menuItems, setMenuItems] = useState(
    baseMenuItems.map((item, _) => ({ ...item, angle: 0 }))
  );
  const constraintsRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const count = baseMenuItems.length;
    const angleStep = count > 1 ? 180 / (count - 1) : 0; // -90 to 90 spread
    const updatedItems = baseMenuItems.map((item, i) => ({
      ...item,
      angle: 0 + i * angleStep,
    }));
    setMenuItems(updatedItems);
  }, []);

  const getItemPosition = (angle: number) => {
    const radians = (angle * Math.PI) / 180;
    return {
      x: Math.cos(radians) * RADIUS,
      y: Math.sin(radians) * RADIUS,
    };
  };

  return (
    <div ref={constraintsRef} className="fixed inset-0 pointer-events-none">
      <motion.div
        drag
        dragConstraints={constraintsRef}
        dragElastic={0.2}
        className="fixed top-3 right-1/2 -translate-x-1/2 pointer-events-auto"
        initial={{ x: 0, y: 0 }}
      >
        {/* Main button */}
        <motion.button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="relative w-16 h-16 rounded-full border-2 border-accent bg-background shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="flex items-center justify-center w-full h-full">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="w-7 h-7 text-primary"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              <path
                d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"
                fill="currentColor"
              />
            </svg>
          </div>

          <motion.div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-accent/60"
            animate={{ rotate: isOpen ? 360 : 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          />
        </motion.button>

        {/* Menu items */}
        <AnimatePresence>
          {isOpen &&
            menuItems.map((item, index) => {
              const position = getItemPosition(item.angle);
              const Icon = item.icon;

              return (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: position.x,
                    y: position.y,
                  }}
                  exit={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  transition={{
                    delay: index * 0.05,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                  }}
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <Link to={item.to}>
                    <motion.button
                      onClick={() => setIsOpen(false)}
                      className="w-12 h-12 rounded-full border-2 border-primary/80 bg-background shadow-md hover:shadow-lg hover:border-accent transition-all flex items-center justify-center"
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon className="w-5 h-5 text-primary" />
                    </motion.button>
                  </Link>
                </motion.div>
              );
            })}

          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 pointer-events-auto"
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

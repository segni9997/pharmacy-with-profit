
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Home, ShoppingCart, Calendar, Search } from "lucide-react";
import { Link } from "react-router-dom";

export default function NotFound() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  };

  

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-white to-primary flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Decorative background elements */}
      <motion.div
        className="absolute top-10 left-10 w-32 h-32 bg-secondary rounded-full opacity-30 blur-3xl"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY }}
      />
      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-secondary rounded-full opacity-20 blur-3xl"
        animate={{ scale: [1.2, 1, 1.2] }}
        transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY }}
      />

      <motion.div
        className="relative z-10 max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* 404 Number with animation */}
        <motion.div className="text-center mb-8" >
          <motion.div
            className="inline-block"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
          >
            <div className="text-9xl font-bold bg-gradient-to-r from-secondary to-secondary bg-clip-text text-transparent">
              404
            </div>
          </motion.div>
        </motion.div>

        {/* Pharmacy icon with floating animation */}
        <motion.div
          className="flex justify-center mb-8"
          
        >
          <motion.div
            className="relative"
            animate="animate"
          >
            <div className="w-24 h-24 bg-gradient-to-br from-primary0 to-secondary rounded-full flex items-center justify-center shadow-lg">
              <svg
                className="w-12 h-12 text-white"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9h-2.5v2.5h-2v-2.5H8v-2h2.5V8h2v2.5h2.5v2z" />
              </svg>
            </div>
          </motion.div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4"
          
        >
          Oops! Medicine Not Found
        </motion.h1>

        {/* Description */}
        <motion.p
          className="text-lg text-center text-gray-600 mb-8"
        >
          It seems the page you're looking for has gone missing from our
          pharmacy shelves. Don't worry, we'll help you find what you need!
        </motion.p>

        {/* Action buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link to="/">
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-secondary to-primary0 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Back to Home
              </span>
            </motion.button>
          </Link>

          <Link to="/shop">
            <motion.button
              className="px-8 py-3 border-2 border-secondary text-secondary font-semibold rounded-full hover:bg-primary transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Browse Shop
              </span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          
        >
          {[
            { icon: ShoppingCart, label: "Shop", to: "/shop" },
            { icon: Calendar, label: "Appointments", to: "/appointments" },
            { icon: Search, label: "Search", to: "/search" },
            { icon: Home, label: "Home", to: "/" },
          ].map((link, index) => (
            <Link key={index} to={link.to}>
              <motion.div
                className="p-4 bg-white rounded-lg border border-secondary hover:border-secondary hover:shadow-md transition-all cursor-pointer text-center"
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
              >
                <link.icon className="w-6 h-6 text-secondary mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  {link.label}
                </p>
              </motion.div>
            </Link>
          ))}
        </motion.div>

        {/* Decorative pills */}
        <motion.div
          className="flex justify-center gap-2 mt-12"
          
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-secondary rounded-full"
              animate={{ scale: [1, 1.5, 1] }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: i * 0.3,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}

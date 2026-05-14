"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/buttonUi";
import { cn } from "@/components/ui/utilsUi";

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <Button
            variant="default"
            size="icon"
            onClick={scrollToTop}
            className={cn(
              "h-12 w-12 rounded-full shadow-lg",
              "bg-primary hover:bg-primary/90 text-primary-foreground",
              "border-2 border-primary-foreground/10",
            )}
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-6 w-6" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

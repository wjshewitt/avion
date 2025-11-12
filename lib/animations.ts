/**
 * Shared animation variants for Framer Motion
 * Provides consistent animation behavior across the application
 */

import { Variants } from "framer-motion";

/**
 * Panel reveal animation - fade-in with upward slide
 * Duration: 300ms
 * Movement: 8px upward
 */
export const panelVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 8,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1], // cubic-bezier easing
    },
  },
};

/**
 * Stagger container for sidebar icons
 * Delay: 50ms between children
 */
export const sidebarStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05, // 50ms delay
      delayChildren: 0.1,
    },
  },
};

/**
 * Individual sidebar icon animation
 */
export const sidebarIconVariants: Variants = {
  hidden: {
    opacity: 0,
    x: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Stagger container for table rows
 * Delay: 100ms between children
 */
export const tableStaggerVariants: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay
    },
  },
};

/**
 * Individual table row animation
 */
export const tableRowVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 4,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Hover animation for interactive elements
 * Brightness: 1.1
 * Lift: -2px
 * Duration: 150ms
 */
export const hoverVariants: Variants = {
  initial: {
    filter: "brightness(1)",
    y: 0,
  },
  hover: {
    filter: "brightness(1.1)",
    y: -2,
    transition: {
      duration: 0.15,
    },
  },
};

/**
 * Loading skeleton shimmer effect
 */
export const shimmerVariants: Variants = {
  initial: {
    backgroundPosition: "-200% 0",
  },
  animate: {
    backgroundPosition: "200% 0",
    transition: {
      duration: 1.5,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

/**
 * Logo fade-in animation
 * Duration: 200ms
 */
export const logoVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
};

/**
 * Badge color transition
 * Duration: 300ms
 */
export const badgeVariants: Variants = {
  initial: {
    scale: 1,
  },
  updated: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 0.3,
    },
  },
};

/**
 * Notification bell bounce animation
 */
export const bellBounceVariants: Variants = {
  initial: {
    rotate: 0,
  },
  bounce: {
    rotate: [0, -15, 15, -10, 10, 0],
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

/**
 * Toast notification slide from top-right
 */
export const toastVariants: Variants = {
  hidden: {
    opacity: 0,
    x: 100,
    y: -20,
  },
  visible: {
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Pulse effect for updated elements
 */
export const pulseVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 1,
  },
  pulse: {
    scale: [1, 1.02, 1],
    opacity: [1, 0.8, 1],
    transition: {
      duration: 0.4,
      ease: "easeInOut",
    },
  },
};

/**
 * Highlight flash for changed values
 */
export const highlightFlashVariants: Variants = {
  initial: {
    backgroundColor: "transparent",
  },
  flash: {
    backgroundColor: ["transparent", "rgba(59, 130, 246, 0.2)", "transparent"],
    transition: {
      duration: 0.6,
      ease: "easeInOut",
    },
  },
};

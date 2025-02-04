import React, { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

const circleVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const lineVariants = {
  hidden: {
    opacity: 0,
    pathLength: 0,
  },
  visible: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.5,
      ease: "easeInOut",
      delay: 0.5, // Delay the line animation
    },
  },
};

const BanIcon = () => {
  const controls = useAnimation();

  useEffect(() => {
    controls.start("visible");
  }, [controls]);

  return (
    <div className="p-2 flex items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="96"
        height="96"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <motion.circle
          cx="12"
          cy="12"
          r="10"
          variants={circleVariants}
          initial="hidden"
          animate={controls}
        />
        <motion.path
          d="m4.9 4.9 14.2 14.2"
          variants={lineVariants}
          initial="hidden"
          animate={controls}
        />
      </svg>
    </div>
  );
};

export { BanIcon };

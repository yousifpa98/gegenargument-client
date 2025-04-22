import { usePageContext } from "vike-react/usePageContext";
import { motion } from "framer-motion";
import React from "react";

export function Link({
  href,
  children,
  className = "",
  noActiveState = false,
  external = false,
}) {
  const pageContext = usePageContext();
  const { urlPathname } = pageContext;

  // Check if link is active - exact match for home, starts with for other paths
  const isActive =
    href === "/" ? urlPathname === href : urlPathname.startsWith(href);

  // Base styles for all links
  const baseStyles = "relative font-medium transition-all duration-200";

  // Active link styles with animated underline
  const activeStyles =
    !noActiveState && isActive
      ? "text-primary after:absolute after:bottom-[-3px] after:left-0 after:h-[2px] after:w-full after:bg-primary after:content-['']"
      : "hover:text-primary/90";

  // Link animation variants
  const linkVariants = {
    initial: { y: 0 },
    hover: { y: -2 },
    tap: { y: 1 },
  };

  // Combine all classes
  const linkClasses = `${baseStyles} ${activeStyles} ${className}`;

  // External link properties
  const externalProps = external
    ? {
        target: "_blank",
        rel: "noopener noreferrer",
      }
    : {};

  return (
    <motion.a
      href={href}
      className={linkClasses}
      aria-current={isActive ? "page" : undefined}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      variants={linkVariants}
      transition={{ type: "spring", stiffness: 400, damping: 15 }}
      {...externalProps}
    >
      {children}
    </motion.a>
  );
}

export default Link;

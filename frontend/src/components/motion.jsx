import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

export const Reveal = ({ children, delay = 0, className }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y: 46 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-70px" }}
    transition={{ duration: 0.9, delay, ease: EASE }}
  >
    {children}
  </motion.div>
);

export const MaskLine = ({ children, show = true, delay = 0, className }) => (
  <span className={`mask-line ${className || ""}`}>
    <motion.span
      initial={{ y: "112%" }}
      animate={show ? { y: "0%" } : { y: "112%" }}
      transition={{ duration: 1.05, delay, ease: EASE }}
    >
      {children}
    </motion.span>
  </span>
);

export const Tilt = ({ children, className, intensity = 10, ...rest }) => {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 160, damping: 16 });
  const sry = useSpring(ry, { stiffness: 160, damping: 16 });
  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * intensity * 2);
    rx.set(-py * intensity * 2);
  };
  const onLeave = () => { rx.set(0); ry.set(0); };
  return (
    <motion.div
      ref={ref}
      className={`tilt ${className || ""}`}
      style={{ rotateX: srx, rotateY: sry }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

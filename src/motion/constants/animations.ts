import type { Animations } from "../types";

export default {
  clipCircle: {
    animate: {
      clipPath: "circle(120% at 50% 50%)",
    },
    initial: {
      clipPath: "circle(0% at 10% 50%)",
    },
  },
  clipDown: {
    animate: {
      clipPath: "inset(0 0 0% 0)",
    },
    initial: {
      clipPath: "inset(0 0 100% 0)",
    },
  },

  // clips

  clipPop: {
    animate: {
      clipPath: "circle(150% at 50% 50%)",
    },
    initial: {
      clipPath: "circle(0% at 50% 50%)",
    },
  },
  clipUp: {
    animate: {
      clipPath: "inset(0 0 0 0)",
    },
    initial: {
      clipPath: "inset(100% 0 0 0)",
    },
  },
  colorShift: {
    animate: {
      backgroundColor: ["#ff0000", "#00ff88", "#0066ff", "#ff0000"],
    },
    initial: { backgroundColor: "#ff0000" },
  },
  default: {
    animate: {},
    initial: {},
  },
  fadeDown: {
    animate: {
      opacity: 1,
      y: 0,
    },
    initial: { opacity: 0, y: -30 },
  },

  // Fade

  fadeIn: {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
  },
  fadeLeft: {
    animate: {
      opacity: 1,
      x: 0,
    },
    initial: { opacity: 0, x: -30 },
  },
  fadeOut: {
    animate: { opacity: 0 },
    initial: { opacity: 1 },
  },
  fadeRight: {
    animate: {
      opacity: 1,
      x: 0,
    },
    initial: { opacity: 0, x: 30 },
  },
  fadeUp: {
    animate: {
      opacity: 1,
      y: 0,
    },
    initial: { opacity: 0, y: 30 },
  },

  // filters

  filterBlurIn: {
    animate: {
      filter: "blur(0px)",
    },
    initial: { filter: "blur(10px)" },
  },
  filterBlurOut: {
    animate: {
      filter: "blur(10px)",
    },
    initial: { filter: "blur(0px)" },
  },
  filterBrightnessFade: {
    animate: { filter: "brightness(1)" },
    initial: { filter: "brightness(0.5)" },
  },
  filterContrastShift: {
    animate: { filter: "contrast(100%)" },
    initial: { filter: "contrast(50%)" },
  },
  filterGrayscaleFade: {
    animate: { filter: "grayscale(0%)" },
    initial: { filter: "grayscale(100%)" },
  },
  filterHueRotate: {
    animate: { filter: "hue-rotate(360deg)" },
    initial: { filter: "hue-rotate(0deg)" },
  },
  filterInvertColors: {
    animate: { filter: "invert(100%)" },
    initial: { filter: "invert(0%)" },
  },
  filterSaturateIncrease: {
    animate: { filter: "saturate(200%)" },
    initial: { filter: "saturate(50%)" },
  },
  filterSepiaTone: {
    animate: { filter: "sepia(100%)" },
    initial: { filter: "sepia(0%)" },
  },
  flash: {
    animate: {
      opacity: [1, 0, 1],
    },
    initial: { opacity: 1 },
  },
  heartbeat: {
    animate: {
      scale: [1, 1.2, 1],
    },
    initial: { scale: 1 },
  },
  hover: {
    animate: {
      scale: 1.1,
    },
    initial: { scale: 1 },
  },

  // masks

  maskGradient: {
    animate: {
      maskPosition: "0% 50%",
      transform: "translateX(0%)",
    },
    initial: {
      maskImage:
        "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.9) 30%)",
      maskPosition: "100% 50%",
      maskSize: "200% 100%",
      transform: "translateX(3%)",
    },
  },
  maskGradientPerforate: {
    animate: {
      maskPosition: "0% 50%",
      maskSize: ["8% 8%", "6% 6%"],
      transform: "translateX(0%)",
    },
    initial: {
      maskImage:
        "radial-gradient(circle, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 41%)",
      maskPosition: "120% 50%",
      maskSize: "8% 8%",
      transform: "translateX(4%)",
    },
  },
  microWobble: {
    animate: { rotate: 2, scale: 1.005 },
    initial: { rotate: 0, scale: 0.995 },
  },

  // custom

  neonGlow: {
    animate: {
      textShadow: [
        "0 0 0px #fff",
        "0 0 10px #fff, 0 0 20px #ff00ff, 0 0 30px #ff00ff",
        "0 0 0px #fff",
      ],
    },
    initial: { textShadow: "0 0 0px #fff" },
  },
  opacity: {
    animate: { opacity: 1 },
    initial: { opacity: 0 },
  },
  rotateClockwise: {
    animate: {
      rotate: 0,
    },
    initial: { rotate: -45 },
  },
  rotateFlipX: {
    animate: { rotateX: 0 },
    initial: { rotateX: -180 },
  },
  rotateFlipY: {
    animate: { rotateY: 0 },
    initial: { rotateY: -180 },
  },

  // Rotate

  rotateIn: {
    animate: { rotate: 0 },
    initial: { rotate: -90 },
  },
  rotateOut: {
    animate: { rotate: 90 },
    initial: { rotate: 0 },
  },
  rotateRoll: {
    animate: {
      rotateZ: 0,
    },
    initial: { rotateZ: -120 },
  },
  rotating360: {
    animate: {
      rotate: 360,
    },
    initial: { rotate: 0 },
  },

  // Zoom & Scale

  scaleZoomIn: {
    animate: { scale: 1 },
    initial: { scale: 0.8 },
  },
  scaleZoomOut: {
    animate: { scale: 1 },
    initial: { scale: 1.2 },
  },

  // Skew

  skewX30: {
    animate: {
      skewX: 0,
    },
    initial: { skewX: 30 },
  },
  skewX45: {
    animate: {
      skewX: 0,
    },
    initial: { skewX: 45 },
  },
  skewY30: {
    animate: {
      skewY: 0,
    },
    initial: { skewY: 30 },
  },
  skewY45: {
    animate: {
      skewY: 0,
    },
    initial: { skewY: 45 },
  },

  // slides

  slideDown: {
    animate: { y: 0 },
    initial: { y: "-100%" },
  },
  slideLeft: {
    animate: { x: 0 },
    initial: { x: "100%" },
  },
  slideRight: {
    animate: { x: 0 },
    initial: { x: "-100%" },
  },
  slideUp: {
    animate: { y: 0 },
    initial: { y: "100%" },
  },
  snailTrail: {
    animate: {
      opacity: [0, 0.3, 0.5, 0.8, 1],
      x: ["-100%", "-50%", "-25%", "-10%", "0%"],
    },
    initial: { opacity: 0, x: "-100%" },
  },
  spin: {
    animate: { rotate: -360 },
    initial: { rotate: 0 },
  },
  textShimmer: {
    animate: {
      opacity: [0, 1, 0, 0, 1],
    },
    initial: { opacity: 0 },
  },
  transformClipDiamond: {
    animate: {
      clipPath: [
        "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        "polygon(50% 0, 100% 50%, 50% 100%, 0% 50%)",
      ],
      transform: ["scale(0.96)", "scale(1)"],
    },
    initial: {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%)",
      transform: "scale(0.96)",
    },
  },
  transformClipPentagon: {
    animate: {
      clipPath: [
        "polygon(50% 0, 50% 0, 50% 0, 50% 0, 50% 0)",
        "polygon(50% 0, 85% 35%, 70% 85%, 30% 85%, 15% 35%)",
      ],
      transform: ["scale(0.92) rotate(-6deg)", "scale(1) rotate(0deg)"],
    },
    initial: {
      clipPath: "polygon(50% 0, 50% 0, 50% 0, 50% 0, 50% 0)",
      transform: "scale(0.92) rotate(-6deg)",
    },
  },
  transformClipSquare: {
    animate: {
      clipPath: [
        "inset(50% 50% 50% 50%)",
        "inset(12% 12% 12% 12%)",
        "inset(0% 0% 0% 0%)",
      ],
      transform: ["scale(0.96)", "scale(1.01)", "scale(1)"],
    },
    initial: {
      clipPath: "inset(50% 50% 50% 50%)",
      transform: "scale(0.96)",
    },
  },
  transformClipStar: {
    animate: {
      clipPath: [
        "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
        "polygon(50% 0, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 72%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
      ],
      transform: ["scale(0.92) rotate(-8deg)", "scale(1) rotate(0deg)"],
    },
    initial: {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%, 50% 50%)",
      transform: "scale(0.92) rotate(-8deg)",
    },
  },
  transformClipTriangle: {
    animate: {
      clipPath: [
        "polygon(50% 0, 50% 0, 50% 0)",
        "polygon(50% 0, 85% 100%, 15% 100%)",
      ],
      transform: ["scale(0.94) rotate(-4deg)", "scale(1) rotate(0deg)"],
    },
    initial: {
      clipPath: "polygon(50% 0, 50% 0, 50% 0)",
      transform: "scale(0.94) rotate(-4deg)",
    },
  },
  transformClipVShaped: {
    animate: {
      clipPath: [
        "polygon(50% 50%, 50% 50%, 50% 50%)",
        "polygon(10% 0%, 50% 50%, 90% 0%, 90% 100%, 50% 50%, 10% 100%)",
      ],
      transform: ["scale(0.96) rotate(-6deg)", "scale(1) rotate(0deg)"],
    },
    initial: {
      clipPath: "polygon(50% 50%, 50% 50%, 50% 50%)",
      transform: "scale(0.96) rotate(-6deg)",
    },
  },
  transformMaskDown: {
    animate: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
      transform: "skewY(0deg) translateY(0%)",
    },
    initial: {
      clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)",
      transform: "skewY(10deg) translateY(5%)",
    },
  },
  transformMaskGradient: {
    animate: {
      maskPosition: "0% 50%",
      transform: "translateX(0%)",
    },
    initial: {
      maskImage: "linear-gradient(90deg, transparent 0%, rgba(0,0,0,1) 30%)",
      maskPosition: "100% 50%",
      maskSize: "200% 100%",
      transform: "translateX(4%)",
    },
  },
  transformMaskLeft: {
    animate: {
      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0% 100%)",
      transform: "skewX(0deg) translateX(0%)",
    },
    initial: {
      clipPath: "polygon(100% 0, 100% 0, 100% 100%, 100% 100%)",
      transform: "skewX(10deg) translateX(5%)",
    },
  },
  transformMaskRight: {
    animate: {
      clipPath: "polygon(100% 0, 0 0, 0 100%, 100% 100%)",
      transform: "skewX(0deg) translateX(0%)",
    },
    initial: {
      clipPath: "polygon(0 0, 0 0, 0 100%, 0 100%)",
      transform: "skewX(-10deg) translateX(-5%)",
    },
  },
  transformRevealUp: {
    animate: {
      transform: "scaleY(1) translateY(0%)",
      transformOrigin: "bottom center",
    },
    initial: {
      transform: "scaleY(0) translateY(-8%)",
      transformOrigin: "bottom center",
    },
  },
  transformRevealDown: {
    animate: {
      transform: "scaleY(1) translateY(0%)",
      transformOrigin: "top center",
    },
    initial: {
      transform: "scaleY(0) translateY(8%)",
      transformOrigin: "top center",
    },
  },

  // transforms

  transformRevealLeft: {
    animate: {
      transform: "scaleX(1) translateX(0%)",
      transformOrigin: "left center",
    },
    initial: {
      transform: "scaleX(0.0) translateX(8%)",
      transformOrigin: "left center",
    },
  },
  transformRevealRight: {
    animate: {
      transform: "scaleX(1) translateX(0%)",
      transformOrigin: "right center",
    },
    initial: {
      transform: "scaleX(0.0) translateX(-8%)",
      transformOrigin: "right center",
    },
  },
  transformTextGlow: {
    animate: {
      filter: ["hue-rotate(-8deg) blur(3px)", "hue-rotate(6deg) blur(0px)"],
      textShadow: [
        "0 0 0px rgba(255,255,255,0)",
        "0 0 12px rgba(255,220,180,0.9), 0 0 30px rgba(255,160,200,0.6)",
        "0 0 4px rgba(255,255,255,0.4)",
      ],
    },
    initial: {
      filter: "hue-rotate(0deg) blur(2px)",
      textShadow: "0 0 0px rgba(255,255,255,0)",
    },
  },
  transformTextGradient: {
    animate: {
      backgroundPosition: ["100% 50%", "0% 50%"],
      transform: ["translateX(4%)", "translateX(0%)"],
    },
    initial: {
      backgroundImage:
        "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.12) 45%, rgba(255,255,255,0) 65%)",
      backgroundPosition: "100% 50%",
      backgroundSize: "200% 100%",
      transform: "translateX(4%)",
    },
  },

  // 3D Translate

  translate3dIn: {
    animate: { transform: "translate3d(0px, 0px, 0px)" },
    initial: { transform: "translate3d(-100px, -100px, -100px)" },
  },

  translate3dOut: {
    animate: { transform: "translate3d(100px, 100px, 100px)" },
    initial: { transform: "translate3d(0px, 0px, 0px)" },
  },

  translate3dRotate: {
    animate: { transform: "translate3d(0px, 0px, 0px) rotate(360deg)" },
    initial: { transform: "translate3d(-50px, -50px, -50px) rotate(0deg)" },
  },

  translate3dZoom: {
    animate: { transform: "translate3d(0px, 0px, 0px) scale(1)" },
    initial: { transform: "translate3d(-50px, 0px, -100px) scale(0.5)" },
  },
  typingEffect: {
    animate: {
      width: "85%",
    },
    initial: { width: 0 },
  },
} as const satisfies Animations;

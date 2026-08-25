import { createMotionConfig } from ".";

export default createMotionConfig({
  bannerTitle1: {
    type: "MotionText",
    props: {
      wrapperClassName:
        "laptop:text-3xl desktop:text-4xl text-2xl font-secondary",
      animation: {
        mode: ["textShimmer", "transformTextGlow"],
        transition: "linear",
        duration: 1,
        delay: 0.5,
      },
      elementType: "h1",
      config: {
        duration: 0.06,
        mode: "chars",
        space: -1,
      },
    },
  },
  bannerTitle2: {
    type: "MotionText",
    props: {
      animation: {
        mode: ["transformRevealUp", "fadeUp", "filterBlurIn"],
        transition: "bounceHard",
        delay: 2,
        duration: 1,
      },
      config: {
        duration: 0.06,
        mode: "chars",
      },
      elementType: "h2",
      className:
        "laptop:text-3xl desktop:text-4xl text-2xl font-accent text-rose-500",
      wrapperClassName: "pl-2 pt-1",
    },
  },
  contentEditablePlaceholder: {
    type: "MotionText",
    props: {
      animation: {
        mode: ["fadeIn", "filterBlurIn"],
        transition: "gentle",
        delay: 0,
        duration: 1,
      },
      config: {
        duration: 0.03,
        mode: "chars",
      },
      elementType: "span",
    },
  },
});

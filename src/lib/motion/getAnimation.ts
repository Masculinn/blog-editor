import motionConfig from "./data";

export const getAnimation = <K extends keyof typeof motionConfig>(
  key: K,
): (typeof motionConfig)[K]["props"] => {
  return motionConfig[key].props;
};

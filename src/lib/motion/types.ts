import type {
  MotionAnimationProps,
  MotionChainProps,
  MotionContainerProps,
  MotionImageProps,
  MotionTextProps,
} from "@/motion/types";

export type MotionComponentPropsMap = {
  MotionContainer: MotionContainerProps;
  MotionChain: Omit<MotionChainProps, "animations"> & {
    animation: MotionAnimationProps;
  };
  MotionImage: Omit<MotionImageProps, "config"> & {
    config: Omit<MotionImageProps["config"], "img">;
  };
  MotionText: MotionTextProps;
};

export type MotionPhase = {
  [K in keyof MotionComponentPropsMap]: {
    type: K;
    props: Omit<MotionComponentPropsMap[K], "children">;
  };
}[keyof MotionComponentPropsMap];

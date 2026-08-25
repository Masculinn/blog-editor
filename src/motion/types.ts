import type { EasingDefinition, UseInViewOptions } from "motion/react";
import type { HTMLAttributes, HTMLElementType, ImgHTMLAttributes } from "react";
import type animations from "./constants/animations";
import type delays from "./constants/delays";
import type transitions from "./constants/transitions";

/* ============== BASE ============== */

export interface Animations {
  [key: string]: {
    initial: AnimationObjProps;
    animate: AnimationObjProps;
  };
}
export interface Transitions {
  [key: string]: TransitionConfig;
}

export type AnimationKeys = keyof typeof animations;
export type DelayLogic = (typeof delays)[number];
export type TransitionKeys = keyof typeof transitions;
export type MotionElementType = HTMLElementType | keyof SVGElementTagNameMap;
/* ================================== */

export interface MotionControllerProps {
  /**
   * @description
   * Allows you to pass options to the useInView hook,
   * which is used to control the animation with it's
   * viewport visibility.
   *
   * @see https://motion.dev/docs/react-use-in-view
   */
  configView?: Omit<UseInViewOptions, "root">;
  /**
   * @description
   * A controllered prop to trigger the animation state in 2 ways:
   * - Start animate
   * - Reverse animate
   *
   * Behaves like a mini version of @param [MotionControllerProps]
   * because it works with only 2 way in one flow:
   *
   * Start —> animateBegin & Reverse —> animateRollback
   *
   * @default undefined
   * @type boolean
   * @example
   *
   * const [trigger, setTrigger] = useState(false);
   *
   * <MotionContainer
   *   onClick={() => setTrigger(prev => !prev)}
   *   elementType="div"
   *   animation={{
   *     mode: ["filterBrightnessFade"],
   *     transition: "springy",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger,
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  trigger?: boolean;
  /**
   * @description
   * Indicates whether the animation should be stopped completely.
   * Not recommended for stand-alone use. Powerful with useAnimation
   * hook when passed as a prop to control the animation flow.
   *
   * @default undefined
   * @type {boolean}
   * @example
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // might be used in any MP component
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeIn", "filterBlurIn"],
   *     transition: "smooth",
   *   }}
   *   controller={{
   *     isAnimationStopped,
   *     reverse
   *   }}
   *   className="your-css-goes-here"
   * />
   */
  isAnimationStopped?: boolean;
  /**
   * @description
   * Indicates whether the animation should be reversed.
   * Not recommended for stand-alone use. Powerful with useAnimation
   * hook when passed as a prop to control the animation flow.
   *
   * @default undefined
   * @type {boolean}
   * @example
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // might be used in any MP component
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeIn", "filterBlurIn"],
   *     transition: "smooth",
   *   }}
   *   controller={{
   *     isAnimationStopped,
   *     reverse
   *   }}
   *   className="your-css-goes-here"
   * />
   */
  reverse?: boolean;
}

export interface MotionAnimationProps {
  /**
   * @description
   * Predefined animation mode(s) to be applied. MP provides
   * outrageous numbers(75+) of predefined animation modes for
   * you to choose from without worrying about the compexity which
   * is fixed and always hovering around O(n).
   *
   * @default "opacity"
   * @type {AnimationKeys | AnimationKeys[]}
   * @example
   *
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     // yes, that's actually quite all the thing
   *     // to animate without hesitation :)
   *     mode: "fadeIn",
   *     transition: "smooth",
   *   }}
   *   className="your-css-goes-here"
   * />
   */
  mode: AnimationKeys | AnimationKeys[];
  /**
   * @description
   * Predefined animation transition type to be applied.
   * Find the best transition based on your animation needing.
   *
   * @default "default"
   * @type {TransitionKeys}
   * @example
   *
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: "fadeIn",
   *     // powerful typesafe API's enables developer
   *     // to struggle less to choose the right transition
   *     transition: "smooth",
   *   }}
   *   className="your-css-goes-here"
   * />
   */
  transition: TransitionKeys;
  /**
   * @description
   * Delay of the animation applies right before the animation starts.
   * Creates a standby time and you can think of it as a pause before
   * the animation starts.
   *
   * @type {number} delay of the animation in seconds(s).
   * @default 0
   */
  delay?: number;
  /**
   * @description
   * Duration of the animation in seconds(s).
   * It's recommended to keep it between 0.3-1.5
   * seconds.
   *
   * @type {number} duration of the animation in seconds(s).
   * @default 0.5
   * @minimum 0
   *
   */
  duration?: number;
}

// Configs

export interface MotionChainConfigProps {
  /**
   * @description
   * Indicates the animation's sequence and
   * also comes with powerful pre-defined APIs.
   *
   * @default "linear"
   * @type {DelayLogic}
   *
   */
  delayLogic?: DelayLogic;
  /**
   * @description
   * Custom delay logic for each animation.
   * You can create custom sequence effect
   * depending on the index of the animation
   * with this prop.
   *
   * @default undefined
   * @type {(index: number) => number}
   *
   */
  customLogic?: (index: number) => number;
  /**
   * @description
   * Total duration of the animation process in seconds(s).
   * duration represents the base of the
   * animation that is being used inside the
   * 'calculateDelay' utility fn to make sure
   * each animation is passing in sequence.
   *
   * @default 0.5
   * @type {number}
   * @minimum 0
   *
   */
  duration: number;
}

export interface MotionTextConfigProps extends MotionChainConfigProps {
  /**
   * @description
   * Text modes are used to split the text into words
   * or characters and animate them individually.
   *
   * @default "chars"
   * @type {SplittedTextModes}
   *
   */
  mode: SplittedTextModes;
  /**
   * @description
   * Indicates the space between each word or character.
   *
   * @default 0
   * @type {number | string}
   *
   */
  space?: number | string;
}

export interface MotionImageConfigProps extends MotionChainConfigProps {
  /**
   * @description
   * The path to the image that is going to be
   * used through MotionImage components
   * in order to fill the grid.
   *
   * @default undefined
   * @type {string}
   */
  img: string;
  /**
   * @description
   * The amount of pieces that is going to
   * be splitted for the calculation of
   * per-piece delay throughout the image.
   *
   * IMPORTANT NOTE:
   * Keeping the amount of pieces higher than 200
   * might cause performance issues particularly
   * CLS metrics. So keep in mind that this prop
   * has to be used with caution.
   *
   * @default 64
   * @type {ImageMotionPieces}
   *
   */
  pieces: ImageMotionPieces;
  /**
   * @description
   * Some magic prop to add event handlers and
   * trigger per-piece animations. It can be
   * used to create interactive motion. There are
   * 2 modes available:
   * - `"hover"`: mouse movement triggers a 3x3 neighborhood around the pointer.
   * - `"click"`: clicking triggers the neighborhood for the clicked cell.
   *
   * @default undefined
   * @type {"hover" | "click"}
   *
   */
  fn?: "hover" | "click";
}

// Core

type GeneralHTMLAttributes = Omit<
  HTMLAttributes<HTMLElement | SVGElement>,
  "children"
>;

export interface MotionContainerProps
  extends GeneralHTMLAttributes,
    SVGAttributes {
  /**
   * @description
   * Defines properties that can be
   * mandatoryly used across MP components. It includes animation modes,
   * transitions, delays, and durations. Basically everything you need to
   * make the web better :)
   *
   * @property {AnimationKeys | AnimationKeys[]} mode - animation mode(s)
   * @property {TransitionKeys} transition - animation transition type
   * @property {number | undefined} [delay] - animation delay
   * @property {number} [duration] - animation duration
   *
   * @example
   *
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeIn", "filterBlurIn"],
   *     transition: "smooth",
   *   }}
   *   className="your-css-goes-here"
   * />
   *
   */
  animation: MotionAnimationProps;
  /**
   * @description
   * The elementType prop allows you to specify the HTML element type
   * that will be used as the root element for the MotionContainer.
   *
   * @default "div"
   * @type {HTMLElementType}
   */
  elementType: MotionElementType;
  /**
   * @description
   * The children prop is a React node that will be rendered inside
   * the MotionContainer component. It is optional and can be used to
   * add content to the component.
   *
   * @default undefined
   * @type {React.ReactNode}
   */
  children?: React.ReactNode;
  /**
   * @description
   * This is the central scaffold part that you might see as
   * a god of CAS(Centralized Animation System). It's actually
   * standing on the top of each MP components to control
   * and manage the animation process by managing the flow.
   *
   * Highly recommended to use with both
   * @type {UseAnimationControlProps}
   * and @type {UseAnimationProps}
   *
   * @default undefined
   * @typedef {Object} MotionControllerProps
   * @param {boolean} isAnimationStopped
   * @param {boolean} reverseAnimation
   * @param {Partial<UseInViewOptions>} [configView]
   * @param {boolean} [trigger]
   *
   * @example
   *
   * //full example
   *
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // trigger the animation freely
   * <button onClick={onReverse}>Reverse</button>
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeUp", "translate3dIn"],
   *     transition: "cubicBounce",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger: true, // immediately start animation bypassing configView
   *     configView: { once: true, amount: 0.5 } // determine whether to start animation when it's in viewport
   *     isAnimationStopped, // pass the CAS props
   *     reverse // pass the CAS props
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  controller?: MotionControllerProps;
}

export interface MotionChainProps extends GeneralHTMLAttributes {
  /**
   * @description
   * Defines properties that can be mandatoryly used across MP components.
   * It includes animation modes, transitions, delays, and durations. Basically
   * everything you need to make the web better :)
   *
   * @type {MotionAnimationProps[]} animations
   * @example
   *
   * const animations = Array.from({ length: 5 }, () => ({
   *    mode: ["scaleZoomIn","fadeIn"],
   *    transition: "slowSmooth",
   * }))
   * <MotionChain
   *   elementType="div"
   *   animations={animations}
   *   className="your-css-goes-here"
   * />
   *
   */
  animations: MotionAnimationProps[];
  /**
   * @description
   * The elementType prop allows you to specify the HTML element type
   * that will be used as the root element for the MotionContainer where
   * MotionChain encapsulates as its children.
   *
   * @default "div"
   * @type {HTMLElementType}
   */
  elementType: MotionElementType;
  /**
   * @description
   * The children prop is a React nodes that will be rendered inside
   * the MotionChain component.
   *
   * @default undefined
   * @type {React.ReactNode[]}
   */
  children: React.ReactNode[];
  config: MotionChainConfigProps;
  /**
   * @description
   * This is the central scaffold part that you might see as
   * a god of CAS(Centralized Animation System). It's actually
   * standing on the top of each MP components to control
   * and manage the animation process by managing the flow.
   *
   * Highly recommended to use with both:
   * @type {UseAnimationControlProps}
   * @type {UseAnimationProps}
   *
   * @default undefined
   * @typedef {Object} MotionControllerProps
   * @param {boolean} isAnimationStopped
   * @param {boolean} reverseAnimation
   * @param {Partial<UseInViewOptions>} [configView]
   * @param {boolean} [trigger]
   *
   * @example
   *
   * //full example
   *
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // trigger the animation freely
   * <button onClick={onReverse}>Reverse</button>
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeUp", "translate3dIn"],
   *     transition: "cubicBounce",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger: true, // immediately start animation bypassing configView
   *     configView: { once: true, amount: 0.5 } // determine whether to start animation when it's in viewport
   *     isAnimationStopped, // pass the CAS props
   *     reverse // pass the CAS props
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  controller?: MotionControllerProps;
}

export interface MotionTextProps extends GeneralHTMLAttributes {
  /**
   * @description
   * Defines properties that can be
   * mandatoryly used across MP components. It includes animation modes,
   * transitions, delays, and durations. Basically everything you need to
   * make the web better :)
   *
   * @property {AnimationKeys | AnimationKeys[]} mode - animation mode(s)
   * @property {TransitionKeys} transition - animation transition type
   * @property {number | undefined} [delay] - animation delay
   * @property {number} [duration] - animation duration
   *
   * @example
   *
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeIn", "filterBlurIn"],
   *     transition: "smooth",
   *   }}
   *   className="your-css-goes-here"
   * />
   *
   */
  animation: MotionAnimationProps;
  /**
   * @description
   * The elementType prop allows you to specify the HTML element type
   * that will be used as the root element for the MotionContainer.
   *
   * @default "div"
   * @type {HTMLElementType}
   */
  elementType: MotionElementType;
  config: MotionTextConfigProps;
  /**
   * @description
   * The children prop is a React node that will be rendered inside
   * the MotionContainer component. It is optional and can be used to
   * add content to the component.
   *
   * @default undefined
   * @type {React.ReactNode}
   */
  children: React.ReactNode;
  /**
   * @description
   * This is the central scaffolding that you might see as
   * the god of CAS (Centralized Animation System). The
   * animation process is actually controlled and managed
   * from the top of each MP component.
   *
   * Highly recommended to use with both
   * @type {UseAnimationControlProps}
   * and @type {UseAnimationProps} for full control over
   * your MP components
   *
   * @default undefined
   * @typedef {Object} MotionControllerProps
   * @param {boolean} isAnimationStopped
   * @param {boolean} reverseAnimation
   * @param {Partial<UseInViewOptions>} [configView]
   * @param {boolean} [trigger]
   *
   * @example
   *
   * //full example
   *
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // trigger the animation freely
   * <button onClick={onReverse}>Reverse</button>
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeUp", "translate3dIn"],
   *     transition: "cubicBounce",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger: true, // immediately start animation bypassing configView
   *     configView: { once: true, amount: 0.5 } // determine whether to start animation when it's in viewport
   *     isAnimationStopped, // pass the CAS props
   *     reverse // pass the CAS props
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  controller?: MotionControllerProps;
  /**
   * @description
   * The wrapperClassName prop is a string that
   * specifies the class name(s) to be applied to the
   * wrapper element that wraps the child text elements
   *
   * @default undefined
   * @type {string}
   */
  wrapperClassName?: string;
}

export type ImageHTMLProps = Pick<
  ImgHTMLAttributes<HTMLImageElement>,
  | "loading" // "eager" | "lazy"
  | "decoding" // "auto" | "async" | "sync"
  | "fetchPriority" // "high" | "low" | "auto"
  | "crossOrigin" // "anonymous" | "use-credentials"
  | "referrerPolicy"
  | "sizes"
  | "srcSet"
  | "alt"
  | "draggable"
  | "onLoad"
  | "onError"
>;

export interface MotionImageProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onLoad" | "onError">,
    ImageHTMLProps {
  /**
   * Defines properties that can be
   * mandatoryly used across MP components. It includes animation modes,
   * transitions, delays, and durations. Basically everything you need to
   * make the web better :)
   *
   * @typedef {Object} MotionAnimationProps
   * @property {AnimationKeys | AnimationKeys[]} mode - animation mode(s)
   * @property {TransitionKeys} transition - animation transition type
   * @property {number | undefined} [delay] - animation delay
   * @property {number} [duration] - animation duration
   *
   * @example
   *
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeIn", "filterBlurIn"],
   *     transition: "smooth",
   *   }}
   *   className="your-css-goes-here"
   * />
   *
   */
  animation: MotionAnimationProps;
  /**
   * @description
   * A fallback component to be rendered when the image
   * is being loaded.
   *
   * @default undefined
   * @type {React.ReactNode}
   */
  fallback?: React.ReactNode;
  /**
   * @description
   * The wrapperClassName prop is a string that
   * specifies the class name(s) to be applied to the
   * wrapper element that wraps the child text elements
   *
   * @default undefined
   * @type {string}
   */
  wrapperClassName?: string;
  config: MotionImageConfigProps;
  /**
   * @description
   * This is the central scaffold part that you might see as
   * a god of CAS(Centralized Animation System). It's actually
   * standing on the top of each MP components to control
   * and manage the animation process by managing the flow.
   *
   * Highly recommended to use with both
   * @type {UseAnimationControlProps}
   * and @type {UseAnimationProps}
   *
   * @default undefined
   * @typedef {Object} MotionControllerProps
   * @param {boolean} isAnimationStopped
   * @param {boolean} reverseAnimation
   * @param {Partial<UseInViewOptions>} [configView]
   * @param {boolean} [trigger]
   *
   * @example
   *
   * //full example
   *
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // trigger the animation freely
   * <button onClick={onReverse}>Reverse</button>
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeUp", "translate3dIn"],
   *     transition: "cubicBounce",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger: true, // immediately start animation bypassing configView
   *     configView: { once: true, amount: 0.5 } // determine whether to start animation when it's in viewport
   *     isAnimationStopped, // pass the CAS props
   *     reverse // pass the CAS props
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  controller?: MotionControllerProps;
  className?: string;
}

export interface MotionLinkProps {
  timer: number;
  href: string;
  className?: string;
  onReverse: () => void;
  children: React.ReactNode;
}

export interface MotionMovieAnimationsProps
  extends Omit<MotionAnimationProps, "mode"> {
  /**
   * @description
   * Enter animations are covering the start point
   * of the animation process per slide which
   * means the user will see each slide within
   * the enter animations.
   *
   * @default undefined
   * @type {AnimationKeys[] | AnimationKeys}
   */
  enter: AnimationKeys[] | AnimationKeys;
  /**
   * @description
   * Exit animations are covering the end point
   * of the animation process per slide which
   * means the user will end seeing the slide with
   * the exit prop's animations.
   *
   * @default undefined
   * @type {AnimationKeys[] | AnimationKeys}
   */
  exit: AnimationKeys[] | AnimationKeys;
}

type MotionMovieConfigProps = Omit<
  MotionImageConfigProps,
  "duration" | "img"
> & {
  /**
   * @description
   * A list of path that is going to be
   * used through MotionMovie components
   * in order to fill the grid and make the
   * transition between the provided slides.
   *
   * @default undefined
   * @type {string}
   */
  images: string[];
  /**
   *
   * @description
   * Total animation duration of the slide
   * transition process in seconds(s). It has
   * to be bigger than the base duration in order
   * to create a smooth transition otherwise the MotionMovie
   * error logger will be triggered with a warn in your console.
   *
   * @default 2
   * @type {number}
   */
  animationDuration: number;
};

export interface MotionMovieProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "onLoad" | "onError">,
    ImageHTMLProps {
  /**
   * @description
   * A superset of @type {MotionImageProps} that enables you
   * to create a visual slider conventionally using almost the
   * same syntax similar to @type {MotionImageProps}.
   *
   *
   * @default undefined
   * @type {MotionMovieAnimationsProps}
   */
  animations: MotionMovieAnimationsProps;
  /**
   * @description
   * This is the central scaffold part that you might see as
   * a god of CAS(Centralized Animation System). It's actually
   * standing on the top of each MP components to control
   * and manage the animation process by managing the flow.
   *
   * Highly recommended to use with both
   * @type {UseAnimationControlProps}
   * and @type {UseAnimationProps}
   *
   * @default undefined
   * @typedef {Object} MotionControllerProps
   * @param {boolean} isAnimationStopped
   * @param {boolean} reverseAnimation
   * @param {Partial<UseInViewOptions>} [configView]
   * @param {boolean} [trigger]
   *
   * @example
   *
   * //full example
   *
   * const { onReverse, control } = useAnimationControl();
   * const { isAnimationStopped, reverse } = useAnimation(control);
   *
   * // trigger the animation freely
   * <button onClick={onReverse}>Reverse</button>
   * <MotionContainer
   *   elementType="div"
   *   animation={{
   *     mode: ["fadeUp", "translate3dIn"],
   *     transition: "cubicBounce",
   *     duration: 1,
   *   }}
   *   controller={{
   *     trigger: true, // immediately start animation bypassing configView
   *     configView: { once: true, amount: 0.5 } // determine whether to start animation when it's in viewport
   *     isAnimationStopped, // pass the CAS props
   *     reverse // pass the CAS props
   *   }}
   *   className="your-css-goes-here"
   * />
   *   <IfThereIsChildComponent />
   * </MotionContainer>
   *
   */
  controller?: MotionControllerProps;
  config: MotionMovieConfigProps;
  /**
   * @description
   * A fallback component to be rendered when the image
   * is being loaded.
   *
   * @default undefined
   * @type {React.ReactNode}
   */
  fallback?: React.ReactNode;
  /**
   * @description
   * The wrapperClassName prop is a string that
   * specifies the class name(s) to be applied to the
   * wrapper element that wraps the child text elements
   *
   * @default undefined
   * @type {string}
   */
  wrapperClassName?: string;
  /**
   * @description
   * The prefetch prop is a boolean that specifies whether
   * to prefetch the image data for the next slide.
   *
   * @default undefined
   * @type {boolean}
   */
  prefetch?: boolean;
  /**
   * @description
   * Callback fired whenever the active slide index changes.
   * Use this to sync `currImgIdx` into a parent component's state
   * without needing an imperative ref on `MotionMovie` itself.
   *
   * @example
   * const [slide, setSlide] = useState(0);
   *
   * <MotionMovie
   *   onIndexChange={setSlide}
   *   ...
   * />
   * <p>Active slide: {slide}</p>
   */
  onIndexChange?: (index: number) => void;
}

/*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+*+**/

// Constants

export interface AnimationObjProps {
  [key: string]: unknown;
}
export type AnimationModule = {
  initial: AnimationObjProps;
  animate: AnimationObjProps;
};
export interface TransitionConfig {
  duration?: number;
  ease?: EasingDefinition | number[];
  delay?: number;
}
export type SplittedTextModes = "words" | "chars";

// Number unions

export type ImageMotionPieces =
  | 16
  | 25
  | 36
  | 49
  | 64
  | 81
  | 100
  | 121
  | 144
  | 169
  | 196
  | 225
  | 256
  | 289
  | 324
  | 361
  | 400;

interface SVGAttributes {
  accentHeight?: AnyResolvedKeyframe | undefined;
  accumulate?: "none" | "sum" | undefined;
  additive?: "replace" | "sum" | undefined;
  alignmentBaseline?:
    | "auto"
    | "baseline"
    | "before-edge"
    | "text-before-edge"
    | "middle"
    | "central"
    | "after-edge"
    | "text-after-edge"
    | "ideographic"
    | "alphabetic"
    | "hanging"
    | "mathematical"
    | "inherit"
    | undefined;
  allowReorder?: "no" | "yes" | undefined;
  alphabetic?: AnyResolvedKeyframe | undefined;
  amplitude?: AnyResolvedKeyframe | undefined;
  arabicForm?: "initial" | "medial" | "terminal" | "isolated" | undefined;
  ascent?: AnyResolvedKeyframe | undefined;
  attributeName?: string | undefined;
  attributeType?: string | undefined;
  autoReverse?: boolean | undefined;
  azimuth?: AnyResolvedKeyframe | undefined;
  baseFrequency?: AnyResolvedKeyframe | undefined;
  baselineShift?: AnyResolvedKeyframe | undefined;
  baseProfile?: AnyResolvedKeyframe | undefined;
  bbox?: AnyResolvedKeyframe | undefined;
  begin?: AnyResolvedKeyframe | undefined;
  bias?: AnyResolvedKeyframe | undefined;
  by?: AnyResolvedKeyframe | undefined;
  calcMode?: AnyResolvedKeyframe | undefined;
  capHeight?: AnyResolvedKeyframe | undefined;
  clip?: AnyResolvedKeyframe | undefined;
  clipPath?: string | undefined;
  clipPathUnits?: AnyResolvedKeyframe | undefined;
  clipRule?: AnyResolvedKeyframe | undefined;
  colorInterpolation?: AnyResolvedKeyframe | undefined;
  colorInterpolationFilters?:
    | "auto"
    | "sRGB"
    | "linearRGB"
    | "inherit"
    | undefined;
  colorProfile?: AnyResolvedKeyframe | undefined;
  colorRendering?: AnyResolvedKeyframe | undefined;
  contentScriptType?: AnyResolvedKeyframe | undefined;
  contentStyleType?: AnyResolvedKeyframe | undefined;
  cursor?: AnyResolvedKeyframe | undefined;
  cx?: AnyResolvedKeyframe | undefined;
  cy?: AnyResolvedKeyframe | undefined;
  d?: string | undefined;
  decelerate?: AnyResolvedKeyframe | undefined;
  descent?: AnyResolvedKeyframe | undefined;
  diffuseConstant?: AnyResolvedKeyframe | undefined;
  direction?: AnyResolvedKeyframe | undefined;
  display?: AnyResolvedKeyframe | undefined;
  divisor?: AnyResolvedKeyframe | undefined;
  dominantBaseline?: AnyResolvedKeyframe | undefined;
  dur?: AnyResolvedKeyframe | undefined;
  dx?: AnyResolvedKeyframe | undefined;
  dy?: AnyResolvedKeyframe | undefined;
  edgeMode?: AnyResolvedKeyframe | undefined;
  elevation?: AnyResolvedKeyframe | undefined;
  enableBackground?: AnyResolvedKeyframe | undefined;
  end?: AnyResolvedKeyframe | undefined;
  exponent?: AnyResolvedKeyframe | undefined;
  externalResourcesRequired?: boolean | undefined;
  fill?: string | undefined;
  fillOpacity?: AnyResolvedKeyframe | undefined;
  fillRule?: "nonzero" | "evenodd" | "inherit" | undefined;
  filter?: string | undefined;
  filterRes?: AnyResolvedKeyframe | undefined;
  filterUnits?: AnyResolvedKeyframe | undefined;
  floodColor?: AnyResolvedKeyframe | undefined;
  floodOpacity?: AnyResolvedKeyframe | undefined;
  focusable?: boolean | "auto" | undefined;
  fontFamily?: string | undefined;
  fontSize?: AnyResolvedKeyframe | undefined;
  fontSizeAdjust?: AnyResolvedKeyframe | undefined;
  fontStretch?: AnyResolvedKeyframe | undefined;
  fontStyle?: AnyResolvedKeyframe | undefined;
  fontVariant?: AnyResolvedKeyframe | undefined;
  fontWeight?: AnyResolvedKeyframe | undefined;
  format?: AnyResolvedKeyframe | undefined;
  fr?: AnyResolvedKeyframe | undefined;
  from?: AnyResolvedKeyframe | undefined;
  fx?: AnyResolvedKeyframe | undefined;
  fy?: AnyResolvedKeyframe | undefined;
  g1?: AnyResolvedKeyframe | undefined;
  g2?: AnyResolvedKeyframe | undefined;
  glyphName?: AnyResolvedKeyframe | undefined;
  glyphOrientationHorizontal?: AnyResolvedKeyframe | undefined;
  glyphOrientationVertical?: AnyResolvedKeyframe | undefined;
  glyphRef?: AnyResolvedKeyframe | undefined;
  gradientTransform?: string | undefined;
  gradientUnits?: string | undefined;
  hanging?: AnyResolvedKeyframe | undefined;
  horizAdvX?: AnyResolvedKeyframe | undefined;
  horizOriginX?: AnyResolvedKeyframe | undefined;
  href?: string | undefined;
  ideographic?: AnyResolvedKeyframe | undefined;
  imageRendering?: AnyResolvedKeyframe | undefined;
  in2?: AnyResolvedKeyframe | undefined;
  in?: string | undefined;
  intercept?: AnyResolvedKeyframe | undefined;
  k1?: AnyResolvedKeyframe | undefined;
  k2?: AnyResolvedKeyframe | undefined;
  k3?: AnyResolvedKeyframe | undefined;
  k4?: AnyResolvedKeyframe | undefined;
  k?: AnyResolvedKeyframe | undefined;
  kernelMatrix?: AnyResolvedKeyframe | undefined;
  kernelUnitLength?: AnyResolvedKeyframe | undefined;
  kerning?: AnyResolvedKeyframe | undefined;
  keyPoints?: AnyResolvedKeyframe | undefined;
  keySplines?: AnyResolvedKeyframe | undefined;
  keyTimes?: AnyResolvedKeyframe | undefined;
  lengthAdjust?: AnyResolvedKeyframe | undefined;
  letterSpacing?: AnyResolvedKeyframe | undefined;
  lightingColor?: AnyResolvedKeyframe | undefined;
  limitingConeAngle?: AnyResolvedKeyframe | undefined;
  local?: AnyResolvedKeyframe | undefined;
  markerEnd?: string | undefined;
  markerHeight?: AnyResolvedKeyframe | undefined;
  markerMid?: string | undefined;
  markerStart?: string | undefined;
  markerUnits?: AnyResolvedKeyframe | undefined;
  markerWidth?: AnyResolvedKeyframe | undefined;
  mask?: string | undefined;
  maskContentUnits?: AnyResolvedKeyframe | undefined;
  maskUnits?: AnyResolvedKeyframe | undefined;
  mathematical?: AnyResolvedKeyframe | undefined;
  mode?: AnyResolvedKeyframe | undefined;
  numOctaves?: AnyResolvedKeyframe | undefined;
  offset?: AnyResolvedKeyframe | undefined;
  opacity?: AnyResolvedKeyframe | undefined;
  operator?: AnyResolvedKeyframe | undefined;
  order?: AnyResolvedKeyframe | undefined;
  orient?: AnyResolvedKeyframe | undefined;
  orientation?: AnyResolvedKeyframe | undefined;
  origin?: AnyResolvedKeyframe | undefined;
  overflow?: AnyResolvedKeyframe | undefined;
  overlinePosition?: AnyResolvedKeyframe | undefined;
  overlineThickness?: AnyResolvedKeyframe | undefined;
  paintOrder?: AnyResolvedKeyframe | undefined;
  panose1?: AnyResolvedKeyframe | undefined;
  path?: string | undefined;
  pathLength?: AnyResolvedKeyframe | undefined;
  patternContentUnits?: string | undefined;
  patternTransform?: AnyResolvedKeyframe | undefined;
  patternUnits?: string | undefined;
  pointerEvents?: AnyResolvedKeyframe | undefined;
  points?: string | undefined;
  pointsAtX?: AnyResolvedKeyframe | undefined;
  pointsAtY?: AnyResolvedKeyframe | undefined;
  pointsAtZ?: AnyResolvedKeyframe | undefined;
  preserveAlpha?: boolean | undefined;
  preserveAspectRatio?: string | undefined;
  primitiveUnits?: AnyResolvedKeyframe | undefined;
  r?: AnyResolvedKeyframe | undefined;
  radius?: AnyResolvedKeyframe | undefined;
  refX?: AnyResolvedKeyframe | undefined;
  refY?: AnyResolvedKeyframe | undefined;
  renderingIntent?: AnyResolvedKeyframe | undefined;
  repeatCount?: AnyResolvedKeyframe | undefined;
  repeatDur?: AnyResolvedKeyframe | undefined;
  requiredExtensions?: AnyResolvedKeyframe | undefined;
  requiredFeatures?: AnyResolvedKeyframe | undefined;
  restart?: AnyResolvedKeyframe | undefined;
  result?: string | undefined;
  rotate?: AnyResolvedKeyframe | undefined;
  rx?: AnyResolvedKeyframe | undefined;
  ry?: AnyResolvedKeyframe | undefined;
  scale?: AnyResolvedKeyframe | undefined;
  seed?: AnyResolvedKeyframe | undefined;
  shapeRendering?: AnyResolvedKeyframe | undefined;
  slope?: AnyResolvedKeyframe | undefined;
  spacing?: AnyResolvedKeyframe | undefined;
  specularConstant?: AnyResolvedKeyframe | undefined;
  specularExponent?: AnyResolvedKeyframe | undefined;
  speed?: AnyResolvedKeyframe | undefined;
  spreadMethod?: string | undefined;
  startOffset?: AnyResolvedKeyframe | undefined;
  stdDeviation?: AnyResolvedKeyframe | undefined;
  stemh?: AnyResolvedKeyframe | undefined;
  stemv?: AnyResolvedKeyframe | undefined;
  stitchTiles?: AnyResolvedKeyframe | undefined;
  stopColor?: string | undefined;
  stopOpacity?: AnyResolvedKeyframe | undefined;
  strikethroughPosition?: AnyResolvedKeyframe | undefined;
  strikethroughThickness?: AnyResolvedKeyframe | undefined;
  string?: AnyResolvedKeyframe | undefined;
  stroke?: string | undefined;
  strokeDasharray?: AnyResolvedKeyframe | undefined;
  strokeDashoffset?: AnyResolvedKeyframe | undefined;
  strokeLinecap?: "butt" | "round" | "square" | "inherit" | undefined;
  strokeLinejoin?: "miter" | "round" | "bevel" | "inherit" | undefined;
  strokeMiterlimit?: AnyResolvedKeyframe | undefined;
  strokeOpacity?: AnyResolvedKeyframe | undefined;
  strokeWidth?: AnyResolvedKeyframe | undefined;
  surfaceScale?: AnyResolvedKeyframe | undefined;
  systemLanguage?: AnyResolvedKeyframe | undefined;
  tableValues?: AnyResolvedKeyframe | undefined;
  targetX?: AnyResolvedKeyframe | undefined;
  targetY?: AnyResolvedKeyframe | undefined;
  textAnchor?: string | undefined;
  textDecoration?: AnyResolvedKeyframe | undefined;
  textLength?: AnyResolvedKeyframe | undefined;
  textRendering?: AnyResolvedKeyframe | undefined;
  to?: AnyResolvedKeyframe | undefined;
  transform?: string | undefined;
  u1?: AnyResolvedKeyframe | undefined;
  u2?: AnyResolvedKeyframe | undefined;
  underlinePosition?: AnyResolvedKeyframe | undefined;
  underlineThickness?: AnyResolvedKeyframe | undefined;
  unicode?: AnyResolvedKeyframe | undefined;
  unicodeBidi?: AnyResolvedKeyframe | undefined;
  unicodeRange?: AnyResolvedKeyframe | undefined;
  unitsPerEm?: AnyResolvedKeyframe | undefined;
  vAlphabetic?: AnyResolvedKeyframe | undefined;
  values?: string | undefined;
  vectorEffect?: AnyResolvedKeyframe | undefined;
  version?: string | undefined;
  vertAdvY?: AnyResolvedKeyframe | undefined;
  vertOriginX?: AnyResolvedKeyframe | undefined;
  vertOriginY?: AnyResolvedKeyframe | undefined;
  vHanging?: AnyResolvedKeyframe | undefined;
  vIdeographic?: AnyResolvedKeyframe | undefined;
  viewBox?: string | undefined;
  viewTarget?: AnyResolvedKeyframe | undefined;
  visibility?: AnyResolvedKeyframe | undefined;
  vMathematical?: AnyResolvedKeyframe | undefined;
  widths?: AnyResolvedKeyframe | undefined;
  wordSpacing?: AnyResolvedKeyframe | undefined;
  writingMode?: AnyResolvedKeyframe | undefined;
  x1?: AnyResolvedKeyframe | undefined;
  x2?: AnyResolvedKeyframe | undefined;
  x?: AnyResolvedKeyframe | undefined;
  xChannelSelector?: string | undefined;
  xHeight?: AnyResolvedKeyframe | undefined;
  xlinkActuate?: string | undefined;
  xlinkArcrole?: string | undefined;
  xlinkHref?: string | undefined;
  xlinkRole?: string | undefined;
  xlinkShow?: string | undefined;
  xlinkTitle?: string | undefined;
  xlinkType?: string | undefined;
  xmlBase?: string | undefined;
  xmlLang?: string | undefined;
  xmlns?: string | undefined;
  xmlnsXlink?: string | undefined;
  xmlSpace?: string | undefined;
  y1?: AnyResolvedKeyframe | undefined;
  y2?: AnyResolvedKeyframe | undefined;
  y?: AnyResolvedKeyframe | undefined;
  yChannelSelector?: string | undefined;
  z?: AnyResolvedKeyframe | undefined;
  zoomAndPan?: string | undefined;
}

type AnyResolvedKeyframe = string | number;

import { cn } from "@/lib/utils";

export function EditorBg({ className }: { className?: string }) {
  return (
    <div className={cn("p-8 size-full absolute inset-0 -z-10", className)}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "linear-gradient(180deg, #dadcdf 0%, #8fb0be 12%, #43aaa3 42%, #2a5140 57%, #121813 92%, #060706 100%)",
        }}
      />
      <div
        className="absolute -z-1"
        style={{
          inset: "-10% -14% 20%",
          backgroundImage:
            "repeating-linear-gradient(105deg, rgba(255,255,255,0.13) 0 3%, rgba(18, 24, 19, 0.47) 6% 11%, rgba(57, 208, 199, 0.30) 14%, transparent 18% 23%)",
          filter: "blur(34px)",
          opacity: 0.65,
          maskImage: "linear-gradient(to bottom, #000 0 61%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-2"
        style={{
          background:
            "radial-gradient(ellipse at 56% 6%, rgba(255,255,255,0.20), transparent 38%), radial-gradient(ellipse at 57% 43%, rgba(57, 208, 199, 0.30), transparent 42%)",
        }}
      />
      <div
        className="absolute inset-0 -z-4"
        style={{
          background:
            "radial-gradient(circle at center, transparent 25%, rgba(0,0,0,0.15) 58%, rgba(0,0,0,0.84) 100%), linear-gradient(to bottom, transparent 45%, rgba(0,0,0,0.78) 100%)",
        }}
      />
      <div
        className="absolute inset-0 -z-5 mix-blend-soft-light"
        style={{ opacity: 0.22 }}
      />
    </div>
  );
}

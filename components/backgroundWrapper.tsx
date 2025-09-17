// components/BackgroundWrapper.tsx
import { ReactNode } from "react";

type BackgroundWrapperProps = {
  image: string;
  children: ReactNode;
  overlayColor?: string;
  overlayOpacity?: number;
  contentClassName?: string;
};

export default function BackgroundWrapper({
  image,
  children,
  overlayColor = "black",
  overlayOpacity = 0.4,
  contentClassName,
}: BackgroundWrapperProps) {
  return (
    <div className="relative w-full min-h-screen bg-black">
      {/* Background image as an element (prevents 1px white gap) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
        src={image}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
        // helps some GPUs avoid sub-pixel seams
        style={{ transform: "translateZ(0)" }}
        />

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
        />
      </div>

      {/* Content */}
      <div className={`relative z-10 w-full p-4 ${contentClassName ?? ""}`}>
        {children}
      </div>
    </div>
  );
}
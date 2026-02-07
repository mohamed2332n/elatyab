/**
 * Animated Loading Components
 */

import { cn } from "@/lib/utils";

// Animated Spinner
export function AnimatedSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-r-primary opacity-50 animate-spin" style={{ animationDirection: 'reverse' }}></div>
      </div>
    </div>
  );
}

// Bouncing Dots
export function BouncingDots({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-2 items-center justify-center", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-3 w-3 rounded-full bg-primary animate-bounce"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );
}

// Pulsing Orb
export function PulsingOrb({ emoji = "✨", className }: { emoji?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-center animate-pulse text-4xl", className)}>
      {emoji}
    </div>
  );
}

// Animated Progress Bar
export function AnimatedProgressBar({ progress = 65, className }: { progress?: number; className?: string }) {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2 overflow-hidden", className)}>
      <div
        className="bg-gradient-to-r from-primary to-blue-500 h-full transition-all duration-500"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute inset-0 h-full bg-gradient-to-r from-transparent to-white opacity-30 animate-shimmer"></div>
      </div>
    </div>
  );
}

// Floating Bubbles
export function FloatingBubbles({ className }: { className?: string }) {
  return (
    <div className={cn("flex gap-4 items-center justify-center", className)}>
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className="h-4 w-4 rounded-full bg-primary opacity-60 animate-bounce"
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '1.4s'
          }}
        />
      ))}
    </div>
  );
}

// Animated Loading Text
export function AnimatedLoadingText({ text = "Loading", className }: { text?: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      <span>{text}</span>
      <span className="flex gap-1">
        {[...Array(3)].map((_, i) => (
          <span
            key={i}
            className="animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          >
            .
          </span>
        ))}
      </span>
    </div>
  );
}

// Infinite Scroll Indicator
export function InfiniteScrollIndicator({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-6", className)}>
      <div className="h-2 w-2 rounded-full bg-primary animate-bounce"></div>
      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.1s' }}></div>
      <div className="h-2 w-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
    </div>
  );
}

// Skeleton Loader
export function SkeletonLoader({ count = 3, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-12 w-full skeleton rounded-lg"></div>
          <div className="h-4 w-3/4 skeleton rounded"></div>
          <div className="h-4 w-1/2 skeleton rounded"></div>
        </div>
      ))}
    </div>
  );
}

// Pulsing Badge
export function PulsingBadge({ emoji = "🎁", text, className }: { emoji?: string; text?: string; className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 animate-pulse", className)}>
      <span className="emoji-bounce">{emoji}</span>
      {text && <span className="text-sm font-medium">{text}</span>}
    </div>
  );
}

// Animated Checkmark
export function AnimatedCheckmark({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex", className)}>
      <svg
        className="w-6 h-6 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{
          strokeDasharray: '50',
          strokeDashoffset: '50',
          animation: 'drawCheckmark 0.6s ease-out forwards'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
      <style>{`
        @keyframes drawCheckmark {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </div>
  );
}

// Animated X Mark
export function AnimatedXMark({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex", className)}>
      <svg
        className="w-6 h-6 text-red-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        style={{
          opacity: 0,
          animation: 'fadeInX 0.3s ease-out forwards'
        }}
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
      <style>{`
        @keyframes fadeInX {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

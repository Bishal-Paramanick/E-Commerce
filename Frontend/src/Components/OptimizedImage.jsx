import { useState, useEffect } from "react";
import { getProductImageUrl } from "../util/imageUrl";

/**
 * High-Performance Progressive Image Component
 * - Prevents Cumulative Layout Shift (CLS) via fixed aspect-ratio container
 * - Renders a shimmering LQIP/skeleton placeholder while image resolves
 * - Applies loading="lazy", decoding="async", and custom fetchPriority
 * - Fades in smoothly once decoded
 */
export function OptimizedImage({
  src,
  alt = "Product",
  className = "",
  containerClassName = "",
  aspectRatio = "aspect-square",
  priority = false,
  fallback = "https://placehold.co/300x300?text=Product",
  width,
  height,
}) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  const resolvedSrc = error ? fallback : getProductImageUrl(src);

  useEffect(() => {
    setLoaded(false);
    setError(false);
  }, [src]);

  return (
    <div
      className={`relative w-full ${aspectRatio} overflow-hidden bg-slate-50 flex items-center justify-center ${containerClassName}`}
    >
      {/* Shimmering Skeleton Placeholder */}
      {!loaded && !error && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-slate-100 via-slate-200/70 to-slate-100 animate-pulse"
          aria-hidden="true"
        />
      )}

      {/* Main Image */}
      <img
        src={resolvedSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "low"}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setError(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-contain transition-all duration-300 ${
          loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
        } ${className}`}
      />
    </div>
  );
}

export default OptimizedImage;


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const PLACEHOLDER_URL = "https://placehold.co/150x150?text=No+Image";

export function getProductImageUrl(imagePath) {
  if (!imagePath || typeof imagePath !== "string") {
    return PLACEHOLDER_URL;
  }

  // Already absolute or self-contained: http(s), protocol-relative (//cdn...), data:, blob:
  if (/^(https?:)?\/\//i.test(imagePath) || /^(data|blob):/i.test(imagePath)) {
    return imagePath;
  }

  // Ensure exactly one leading slash
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // Frontend static assets are served from the client host
  if (cleanPath.startsWith("/images")) {
    return cleanPath;
  }

  // Uploaded assets and everything else come from the backend host
  return `${API_BASE_URL}${cleanPath}`;
}

export default getProductImageUrl;
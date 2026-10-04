const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export function getProductImageUrl(imagePath) {
  if (!imagePath) {
    return "https://placehold.co/150x150?text=No+Image";
  }

  // If it's already an absolute URL (e.g. https://...), return as-is
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Strip duplicate leading slash if needed
  const cleanPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;

  // If it's an uploaded asset from the backend (/uploads/...), prepend backend host
  if (cleanPath.startsWith("/uploads")) {
    return `${API_BASE_URL}${cleanPath}`;
  }

  // If it's a frontend static asset (starts with /images), serve from client host
  if (cleanPath.startsWith("/images")) {
    return cleanPath;
  }

  // Default: prepend backend host
  return `${API_BASE_URL}${cleanPath}`;
}

export default getProductImageUrl;

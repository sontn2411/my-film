import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Ghép các class Tailwind tiện dụng và an toàn
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Xử lý link ảnh từ PhimAPI (hỗ trợ cả link tương đối và tuyệt đối)
 */
export function getMovieImage(url?: string | null): string {
  if (!url) return '/placeholder-poster.png';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
  return `https://phimimg.com/${cleanUrl}`;
}

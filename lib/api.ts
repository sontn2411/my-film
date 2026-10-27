import { CategoryItem, CountryItem, MovieDetailResponse, MovieItem, PaginationData } from '@/types/movie';

const BASE_URL = 'https://phimapi.com';

export interface MoviesListResponse {
  items: MovieItem[];
  pagination: PaginationData;
  titlePage?: string;
  cdnImage?: string;
}

/**
 * Lấy danh sách phim mới cập nhật
 */
export async function getLatestMovies(page = 1): Promise<MoviesListResponse> {
  const res = await fetch(`${BASE_URL}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải danh sách phim mới');
  const data = await res.json();
  return {
    items: data.items || [],
    pagination: data.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: page, totalPages: 1 },
    titlePage: 'Phim Mới Cập Nhật',
    cdnImage: 'https://phimimg.com',
  };
}

/**
 * Lấy danh sách phim theo phân loại (phim-le, phim-bo, hoat-hinh, tv-shows)
 */
export async function getMoviesByType(
  type: string,
  params: {
    page?: number;
    category?: string;
    country?: string;
    year?: string;
    sort_field?: string;
    sort_type?: string;
  } = {}
): Promise<MoviesListResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.category) query.set('category', params.category);
  if (params.country) query.set('country', params.country);
  if (params.year) query.set('year', params.year);
  if (params.sort_field) query.set('sort_field', params.sort_field);
  if (params.sort_type) query.set('sort_type', params.sort_type);

  const res = await fetch(`${BASE_URL}/v1/api/danh-sach/${type}?${query.toString()}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Không thể tải danh sách ${type}`);
  const json = await res.json();
  const d = json.data;
  return {
    items: d?.items || [],
    pagination: d?.params?.pagination || { totalItems: 0, totalItemsPerPage: 24, currentPage: params.page || 1, totalPages: 1 },
    titlePage: d?.titlePage || type,
    cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
  };
}

/**
 * Tìm kiếm phim theo từ khóa
 */
export async function searchMovies(keyword: string, page = 1, limit = 24): Promise<MoviesListResponse> {
  const res = await fetch(
    `${BASE_URL}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&page=${page}&limit=${limit}`,
    { cache: 'no-store' }
  );
  if (!res.ok) throw new Error('Lỗi tìm kiếm phim');
  const json = await res.json();
  const d = json.data;
  return {
    items: d?.items || [],
    pagination: d?.params?.pagination || { totalItems: 0, totalItemsPerPage: limit, currentPage: page, totalPages: 1 },
    titlePage: d?.titlePage || `Tìm kiếm: ${keyword}`,
    cdnImage: d?.APP_DOMAIN_CDN_IMAGE || 'https://phimimg.com',
  };
}

/**
 * Lấy chi tiết phim và các tập/link stream
 */
export async function getMovieDetail(slug: string): Promise<MovieDetailResponse> {
  const res = await fetch(`${BASE_URL}/phim/${slug}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Không thể tải chi tiết phim');
  return res.json();
}

/**
 * Lấy danh mục thể loại
 */
export async function getCategories(): Promise<CategoryItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/the-loai`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items || [];
  } catch {
    return [];
  }
}

/**
 * Lấy danh mục quốc gia
 */
export async function getCountries(): Promise<CountryItem[]> {
  try {
    const res = await fetch(`${BASE_URL}/quoc-gia`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items || [];
  } catch {
    return [];
  }
}

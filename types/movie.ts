export interface MovieItem {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  type?: string;
  thumb_url: string;
  poster_url: string;
  year: number | string;
  time?: string;
  episode_current?: string;
  quality?: string;
  lang?: string;
  modified?: {
    time: string;
  };
  category?: Array<{ id: string; name: string; slug: string }>;
  country?: Array<{ id: string; name: string; slug: string }>;
}

export interface PaginationData {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
}

export interface EpisodeServerData {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

export interface EpisodeServer {
  server_name: string;
  server_data: EpisodeServerData[];
}

export interface MovieDetail extends MovieItem {
  content: string;
  status: string;
  trailer_url?: string;
  episode_total?: number | string;
  view?: number;
  actor?: string[];
  director?: string[];
  is_copyright?: boolean;
  sub_docquyen?: boolean;
  chieurap?: boolean;
}

export interface MovieDetailResponse {
  status: boolean;
  msg: string;
  movie: MovieDetail;
  episodes: EpisodeServer[];
}

export interface CategoryItem {
  _id: string;
  name: string;
  slug: string;
}

export interface CountryItem {
  _id: string;
  name: string;
  slug: string;
}

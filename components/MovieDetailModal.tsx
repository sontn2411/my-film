'use client';

import React, { useEffect, useState } from 'react';
import { getMovieDetail } from '@/lib/api';
import { getMovieImage } from '@/lib/utils';
import { EpisodeServer, MovieDetail } from '@/types/movie';
import { X, ExternalLink, Play, Copy, Check, Film, Calendar, Clock, Eye, Layers } from 'lucide-react';
import DOMPurify from 'dompurify';

interface MovieDetailModalProps {
  slug: string | null;
  onClose: () => void;
}

export function MovieDetailModal({ slug, onClose }: MovieDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [movie, setMovie] = useState<MovieDetail | null>(null);
  const [episodes, setEpisodes] = useState<EpisodeServer[]>([]);
  const [selectedServerIdx, setSelectedServerIdx] = useState<number>(0);
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedM3u8, setCopiedM3u8] = useState<boolean>(false);

  useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setIsPlaying(false);
    setSelectedServerIdx(0);
    setActiveEpisodeIdx(0);

    getMovieDetail(slug)
      .then((data) => {
        if (!isMounted) return;
        if (data.status && data.movie) {
          setMovie(data.movie);
          setEpisodes(data.episodes || []);
        } else {
          setError('Không tìm thấy thông tin chi tiết phim');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Lỗi kết nối khi tải phim');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (!slug) return null;

  const currentServer = episodes[selectedServerIdx];
  const currentEpisode = currentServer?.server_data?.[activeEpisodeIdx];

  const handleCopyM3u8 = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedM3u8(true);
    setTimeout(() => setCopiedM3u8(false), 2000);
  };

  const sanitizedContent =
    movie?.content && typeof window !== 'undefined'
      ? DOMPurify.sanitize(movie.content)
      : movie?.content || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative flex max-h-[90vh] w-full max-w-4xl flex-col rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-100 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950 px-5 py-3">
          <div className="flex items-center gap-2">
            <Film className="h-5 w-5 text-amber-500" />
            <h2 className="text-base font-semibold text-neutral-100 truncate max-w-md">
              {movie?.name || 'Chi tiết phim'}
            </h2>
            {movie?.origin_name && (
              <span className="text-xs text-neutral-400 hidden sm:inline">
                ({movie.origin_name})
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            title="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          {loading && (
            <div className="py-20 text-center text-neutral-400">
              <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-neutral-500 border-t-amber-500 mb-2"></div>
              <p>Đang tải dữ liệu phim...</p>
            </div>
          )}

          {error && (
            <div className="rounded border border-red-800 bg-red-950/50 p-4 text-red-300">
              {error}
            </div>
          )}

          {movie && !loading && (
            <>
              {/* Video Player Modal Section if activated */}
              {isPlaying && currentEpisode && (
                <div className="rounded-lg overflow-hidden border border-neutral-700 bg-black">
                  <div className="flex items-center justify-between bg-neutral-950 px-3 py-1.5 text-xs text-neutral-300 border-b border-neutral-800">
                    <span className="font-medium text-amber-400">
                      Đang phát: {currentEpisode.name} ({currentServer.server_name})
                    </span>
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="text-xs text-neutral-400 hover:text-white underline"
                    >
                      Thu nhỏ trình phát
                    </button>
                  </div>
                  <div className="relative aspect-video w-full">
                    <iframe
                      src={currentEpisode.link_embed}
                      className="h-full w-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  </div>
                </div>
              )}

              {/* Main Metadata Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                {/* Poster column */}
                <div className="md:col-span-1 space-y-2">
                  <div className="relative aspect-[2/3] w-full overflow-hidden rounded border border-neutral-800 bg-neutral-950">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={getMovieImage(movie.poster_url || movie.thumb_url)}
                      alt={movie.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="text-xs space-y-1 text-neutral-400">
                    <div>
                      <span className="font-semibold text-neutral-300">Slug:</span>{' '}
                      <code className="bg-neutral-800 px-1 py-0.5 rounded text-[11px] text-neutral-300">
                        {movie.slug}
                      </code>
                    </div>
                    {movie.view !== undefined && (
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> Lượt xem: {movie.view}
                      </div>
                    )}
                  </div>
                </div>

                {/* Details column */}
                <div className="md:col-span-3 space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-white">{movie.name}</h3>
                    <p className="text-sm text-neutral-400">{movie.origin_name}</p>
                  </div>

                  {/* Badges row */}
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-amber-500/10 px-2 py-0.5 font-medium text-amber-400 border border-amber-500/20">
                      {movie.year}
                    </span>
                    {movie.time && (
                      <span className="flex items-center gap-1 rounded bg-neutral-800 px-2 py-0.5 text-neutral-300">
                        <Clock className="h-3 w-3" /> {movie.time}
                      </span>
                    )}
                    {movie.quality && (
                      <span className="rounded bg-blue-500/10 px-2 py-0.5 font-medium text-blue-400 border border-blue-500/20">
                        {movie.quality}
                      </span>
                    )}
                    {movie.lang && (
                      <span className="rounded bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400 border border-emerald-500/20">
                        {movie.lang}
                      </span>
                    )}
                    {movie.episode_current && (
                      <span className="rounded bg-purple-500/10 px-2 py-0.5 font-medium text-purple-400 border border-purple-500/20">
                        {movie.episode_current}
                      </span>
                    )}
                    {movie.type && (
                      <span className="rounded bg-neutral-800 px-2 py-0.5 text-neutral-300 uppercase">
                        {movie.type}
                      </span>
                    )}
                  </div>

                  {/* Key metadata grid */}
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-neutral-300 border-y border-neutral-800 py-2.5">
                    <div>
                      <span className="text-neutral-500">Thể loại:</span>{' '}
                      {movie.category?.map((c) => c.name).join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="text-neutral-500">Quốc gia:</span>{' '}
                      {movie.country?.map((c) => c.name).join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="text-neutral-500">Đạo diễn:</span>{' '}
                      {movie.director?.filter(Boolean).join(', ') || 'N/A'}
                    </div>
                    <div>
                      <span className="text-neutral-500">Diễn viên:</span>{' '}
                      {movie.actor?.filter(Boolean).slice(0, 5).join(', ') || 'N/A'}
                    </div>
                    {movie.trailer_url && (
                      <div className="col-span-2">
                        <span className="text-neutral-500">Trailer:</span>{' '}
                        <a
                          href={movie.trailer_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline inline-flex items-center gap-1"
                        >
                          Xem trên Youtube <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Synopsis */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                      Nội dung:
                    </span>
                    <div
                      className="text-xs leading-relaxed text-neutral-300 max-h-36 overflow-y-auto rounded bg-neutral-950 p-2.5 border border-neutral-800/80"
                      dangerouslySetInnerHTML={{ __html: sanitizedContent || 'Chưa có tóm tắt.' }}
                    />
                  </div>
                </div>
              </div>

              {/* Episodes & Streaming Links Section */}
              <div className="border-t border-neutral-800 pt-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-amber-500" />
                    <h4 className="text-sm font-semibold text-neutral-200">
                      Danh sách tập & Nguồn phát ({episodes.length} server)
                    </h4>
                  </div>

                  {/* Server tabs */}
                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded border border-neutral-800">
                    {episodes.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedServerIdx(idx);
                          setActiveEpisodeIdx(0);
                        }}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${
                          selectedServerIdx === idx
                            ? 'bg-amber-500 text-black font-semibold'
                            : 'text-neutral-400 hover:text-white'
                        }`}
                      >
                        {s.server_name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Episode buttons */}
                {currentServer && currentServer.server_data?.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto p-2 rounded bg-neutral-950 border border-neutral-800">
                      {currentServer.server_data.map((ep, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setActiveEpisodeIdx(idx);
                            setIsPlaying(true);
                          }}
                          className={`px-3 py-1 text-xs rounded border transition-colors ${
                            activeEpisodeIdx === idx && isPlaying
                              ? 'border-amber-500 bg-amber-500/20 text-amber-300 font-semibold'
                              : activeEpisodeIdx === idx
                              ? 'border-neutral-500 bg-neutral-800 text-white'
                              : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white'
                          }`}
                        >
                          {ep.name}
                        </button>
                      ))}
                    </div>

                    {/* Quick stream URLs of selected episode */}
                    {currentEpisode && (
                      <div className="rounded border border-neutral-800 bg-neutral-950 p-2.5 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-neutral-300 font-medium">
                          <span>
                            Tập đang chọn: <strong className="text-white">{currentEpisode.name}</strong>
                          </span>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="inline-flex items-center gap-1 rounded bg-amber-500 px-2.5 py-1 text-xs font-semibold text-black hover:bg-amber-400"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            {isPlaying ? 'Tắt Player' : 'Xem ngay (Embed)'}
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                          <div className="flex items-center gap-1.5 overflow-hidden rounded bg-neutral-900 px-2 py-1.5 border border-neutral-800">
                            <span className="text-neutral-500 shrink-0 font-mono">HLS m3u8:</span>
                            <span className="truncate text-neutral-400 font-mono text-[11px] flex-1">
                              {currentEpisode.link_m3u8}
                            </span>
                            <button
                              onClick={() => handleCopyM3u8(currentEpisode.link_m3u8)}
                              className="rounded p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                              title="Sao chép link m3u8"
                            >
                              {copiedM3u8 ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" />
                              )}
                            </button>
                          </div>

                          <div className="flex items-center gap-1.5 overflow-hidden rounded bg-neutral-900 px-2 py-1.5 border border-neutral-800">
                            <span className="text-neutral-500 shrink-0 font-mono">Embed URL:</span>
                            <span className="truncate text-neutral-400 font-mono text-[11px] flex-1">
                              {currentEpisode.link_embed}
                            </span>
                            <a
                              href={currentEpisode.link_embed}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="rounded p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors"
                              title="Mở tab mới"
                            >
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-neutral-500">Chưa có tập phim cho server này.</p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-neutral-800 bg-neutral-950 px-5 py-2.5">
          <button
            onClick={onClose}
            className="rounded bg-neutral-800 px-4 py-1.5 text-xs font-medium text-neutral-200 hover:bg-neutral-700"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

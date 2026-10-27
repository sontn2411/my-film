'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { getMovieImage } from '@/lib/utils';
import { EpisodeServer, MovieDetail } from '@/types/movie';
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  Layers,
  Copy,
  Check,
  ExternalLink,
  Play,
  Film,
  Code,
  Tag,
  Globe,
  User,
  Tv,
} from 'lucide-react';
import DOMPurify from 'dompurify';

interface MovieDetailClientProps {
  movie: MovieDetail;
  episodes: EpisodeServer[];
}

export function MovieDetailClient({ movie, episodes }: MovieDetailClientProps) {
  const [selectedServerIdx, setSelectedServerIdx] = useState<number>(0);
  const [activeEpisodeIdx, setActiveEpisodeIdx] = useState<number>(0);
  const [copiedM3u8, setCopiedM3u8] = useState<boolean>(false);
  const [copiedSlug, setCopiedSlug] = useState<boolean>(false);
  const [showRawJson, setShowRawJson] = useState<boolean>(false);

  const currentServer = episodes[selectedServerIdx];
  const currentEpisode = currentServer?.server_data?.[activeEpisodeIdx];

  const handleCopy = (text: string, type: 'm3u8' | 'slug') => {
    navigator.clipboard.writeText(text);
    if (type === 'm3u8') {
      setCopiedM3u8(true);
      setTimeout(() => setCopiedM3u8(false), 2000);
    } else {
      setCopiedSlug(true);
      setTimeout(() => setCopiedSlug(false), 2000);
    }
  };

  const sanitizedContent =
    movie.content && typeof window !== 'undefined'
      ? DOMPurify.sanitize(movie.content)
      : movie.content || '';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Subheader Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-3">
        <div className="container mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors border border-neutral-700 shadow-xs"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại bảng danh sách</span>
            </Link>
            <div className="h-4 w-px bg-neutral-700 hidden sm:block" />
            <div className="hidden sm:flex items-center gap-2 text-xs text-neutral-400">
              <Link href="/" className="hover:text-amber-400">
                Quản lý phim
              </Link>
              <span>/</span>
              <span className="text-white font-medium truncate max-w-xs">{movie.name}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleCopy(movie.slug, 'slug')}
              className="inline-flex items-center gap-1.5 rounded bg-neutral-950 px-2.5 py-1 text-xs text-neutral-400 hover:text-amber-400 border border-neutral-800 transition-colors font-mono"
              title="Sao chép slug"
            >
              <span>slug: {movie.slug}</span>
              {copiedSlug ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="inline-flex items-center gap-1.5 rounded bg-neutral-800 px-2.5 py-1 text-xs text-neutral-300 hover:bg-neutral-700 border border-neutral-700 transition-colors"
              title="Xem Raw JSON API"
            >
              <Code className="h-3.5 w-3.5 text-amber-500" />
              <span className="hidden md:inline">JSON Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto p-4 flex-1 space-y-6">
        {/* Raw JSON Debug Box if opened */}
        {showRawJson && (
          <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-2">
              <span className="font-semibold text-amber-400 font-mono">
                Dữ liệu JSON gốc từ API: https://phimapi.com/phim/{movie.slug}
              </span>
              <button
                onClick={() => setShowRawJson(false)}
                className="text-neutral-500 hover:text-white"
              >
                ✕ Đóng
              </button>
            </div>
            <pre className="max-h-72 overflow-y-auto rounded bg-neutral-950 p-3 font-mono text-[11px] text-neutral-300 border border-neutral-800">
              {JSON.stringify({ movie, episodes }, null, 2)}
            </pre>
          </div>
        )}

        {/* Top Info Header Card */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Poster Column */}
            <div className="lg:col-span-3 flex flex-col items-center sm:items-start space-y-3">
              <div className="relative aspect-[2/3] w-full max-w-[260px] mx-auto rounded-lg overflow-hidden border border-neutral-800 bg-neutral-950 shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={getMovieImage(movie.poster_url || movie.thumb_url)}
                  alt={movie.name}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Status / Quick attributes */}
              <div className="w-full max-w-[260px] mx-auto space-y-1.5 text-xs text-neutral-300 bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Mã ID:</span>
                  <span className="font-mono text-neutral-300 text-[11px] truncate max-w-[140px]">
                    {movie._id}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Trạng thái:</span>
                  <span className="text-amber-400 font-semibold uppercase">{movie.status || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">Định dạng:</span>
                  <span className="uppercase text-neutral-300 font-mono">{movie.type || 'Phim'}</span>
                </div>
                {movie.view !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-500">Lượt xem:</span>
                    <span className="text-neutral-200 font-medium">{movie.view.toLocaleString()}</span>
                  </div>
                )}
                {movie.modified?.time && (
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-neutral-500">Cập nhật:</span>
                    <span className="font-mono text-neutral-400">
                      {new Date(movie.modified.time).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Detailed Metadata & Synopsis */}
            <div className="lg:col-span-9 space-y-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded bg-amber-500 px-2.5 py-0.5 text-xs font-bold text-black">
                    {movie.year}
                  </span>
                  {movie.quality && (
                    <span className="rounded bg-blue-500/20 px-2.5 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/30">
                      {movie.quality}
                    </span>
                  )}
                  {movie.lang && (
                    <span className="rounded bg-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/30">
                      {movie.lang}
                    </span>
                  )}
                  {movie.episode_current && (
                    <span className="rounded bg-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-400 border border-purple-500/30">
                      {movie.episode_current}
                    </span>
                  )}
                  {movie.time && (
                    <span className="flex items-center gap-1 rounded bg-neutral-800 px-2.5 py-0.5 text-xs text-neutral-300">
                      <Clock className="h-3 w-3 text-neutral-400" />
                      {movie.time}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  {movie.name}
                </h1>
                <p className="text-base text-neutral-400 mt-0.5 italic">{movie.origin_name}</p>
              </div>

              {/* Information Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-950 p-4 rounded-lg border border-neutral-800/80">
                <div className="flex items-start gap-2">
                  <Tag className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 font-medium">Thể loại:</span>{' '}
                    <span className="text-neutral-200">
                      {movie.category?.map((c) => c.name).join(', ') || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 font-medium">Quốc gia:</span>{' '}
                    <span className="text-neutral-200">
                      {movie.country?.map((c) => c.name).join(', ') || 'Chưa cập nhật'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 font-medium">Đạo diễn:</span>{' '}
                    <span className="text-neutral-200">
                      {movie.director?.filter(Boolean).join(', ') || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Tv className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-neutral-500 font-medium">Diễn viên:</span>{' '}
                    <span className="text-neutral-200">
                      {movie.actor?.filter(Boolean).join(', ') || 'Đang cập nhật'}
                    </span>
                  </div>
                </div>

                {movie.trailer_url && (
                  <div className="md:col-span-2 flex items-center gap-2 pt-1 border-t border-neutral-900">
                    <span className="text-neutral-500 font-medium">Trailer chính thức:</span>
                    <a
                      href={movie.trailer_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-amber-400 hover:underline inline-flex items-center gap-1 font-medium"
                    >
                      Mở xem trên YouTube <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Synopsis */}
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                  Tóm tắt cốt truyện:
                </h3>
                <div
                  className="rounded-lg bg-neutral-950 p-4 text-sm leading-relaxed text-neutral-300 border border-neutral-800/80 max-h-56 overflow-y-auto"
                  dangerouslySetInnerHTML={{
                    __html: sanitizedContent || '<p className="text-neutral-500">Chưa có mô tả chi tiết.</p>',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Video Player & Episodes Management Section */}
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-amber-500" />
              <h2 className="text-base font-bold text-white">
                Trình phát & Danh sách nguồn phát ({episodes.length} Server)
              </h2>
            </div>

            {/* Server tabs */}
            <div className="flex items-center gap-1.5 bg-neutral-950 p-1 rounded-md border border-neutral-800">
              {episodes.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedServerIdx(idx);
                    setActiveEpisodeIdx(0);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                    selectedServerIdx === idx
                      ? 'bg-amber-500 text-black shadow-xs'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  Server {s.server_name}
                </button>
              ))}
            </div>
          </div>

          {currentServer && currentServer.server_data?.length > 0 ? (
            <div className="space-y-4">
              {/* Active Episode Player */}
              {currentEpisode && (
                <div className="space-y-2">
                  <div className="rounded-lg overflow-hidden border border-neutral-800 bg-black shadow-xl">
                    <div className="flex items-center justify-between bg-neutral-950 px-4 py-2 border-b border-neutral-800 text-xs">
                      <div className="flex items-center gap-2 text-neutral-200">
                        <Play className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>
                          Đang phát:{' '}
                          <strong className="text-white font-semibold">
                            {currentEpisode.name}
                          </strong>{' '}
                          ({currentServer.server_name})
                        </span>
                      </div>
                      <a
                        href={currentEpisode.link_embed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-400 hover:underline inline-flex items-center gap-1"
                      >
                        Mở player ở tab mới <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                    <div className="relative aspect-video w-full bg-neutral-950">
                      <iframe
                        src={currentEpisode.link_embed}
                        className="h-full w-full"
                        allowFullScreen
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      />
                    </div>
                  </div>

                  {/* Streaming links inspect tools */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-950 p-3 rounded-lg border border-neutral-800">
                    <div className="flex items-center gap-2 overflow-hidden rounded bg-neutral-900 px-3 py-2 border border-neutral-800">
                      <span className="text-neutral-400 font-semibold font-mono shrink-0">
                        HLS .m3u8:
                      </span>
                      <span className="truncate text-neutral-300 font-mono text-[11px] flex-1">
                        {currentEpisode.link_m3u8}
                      </span>
                      <button
                        onClick={() => handleCopy(currentEpisode.link_m3u8, 'm3u8')}
                        className="rounded p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors shrink-0"
                        title="Sao chép link m3u8"
                      >
                        {copiedM3u8 ? (
                          <Check className="h-4 w-4 text-emerald-400" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 overflow-hidden rounded bg-neutral-900 px-3 py-2 border border-neutral-800">
                      <span className="text-neutral-400 font-semibold font-mono shrink-0">
                        Embed iframe:
                      </span>
                      <span className="truncate text-neutral-300 font-mono text-[11px] flex-1">
                        {currentEpisode.link_embed}
                      </span>
                      <a
                        href={currentEpisode.link_embed}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded p-1 text-neutral-400 hover:text-amber-400 hover:bg-neutral-800 transition-colors shrink-0"
                        title="Xem trực tiếp"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Episode Selection Grid */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider block">
                  Chọn tập phim ({currentServer.server_data.length} tập):
                </span>
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-3 rounded-lg bg-neutral-950 border border-neutral-800">
                  {currentServer.server_data.map((ep, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveEpisodeIdx(idx)}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                        activeEpisodeIdx === idx
                          ? 'border-amber-500 bg-amber-500 text-black shadow-md'
                          : 'border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white'
                      }`}
                    >
                      {ep.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 py-6 text-center">
              Chưa có dữ liệu tập phim cho server này.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

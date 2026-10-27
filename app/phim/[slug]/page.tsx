import { Suspense } from 'react';
import { getMovieDetail } from '@/lib/api';
import { MovieDetailClient } from './MovieDetailClient';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  try {
    const data = await getMovieDetail(slug);
    if (data.status && data.movie) {
      return {
        title: `${data.movie.name} | Chi Tiết Phim`,
        description: data.movie.origin_name || data.movie.name,
      };
    }
  } catch {
    // fallback
  }
  return {
    title: 'Chi Tiết Phim - Quản Lý Phim',
  };
}

async function MovieDetailContent({ params }: PageProps) {
  const { slug } = await params;

  try {
    const data = await getMovieDetail(slug);

    if (!data.status || !data.movie) {
      return (
        <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center space-y-4 shadow-xl">
            <h1 className="text-xl font-bold text-red-400">Không tìm thấy phim</h1>
            <p className="text-xs text-neutral-400">
              Không thể tải dữ liệu chi tiết cho phim có slug:{' '}
              <code className="text-amber-400 font-mono bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800">
                {slug}
              </code>
            </p>
            <div>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" /> Quay lại danh sách phim
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return <MovieDetailClient movie={data.movie} episodes={data.episodes || []} />;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Lỗi kết nối khi tải phim';
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-4 font-sans">
        <div className="max-w-md w-full rounded-lg border border-neutral-800 bg-neutral-900 p-6 text-center space-y-4 shadow-xl">
          <h1 className="text-xl font-bold text-red-400">Đã xảy ra lỗi</h1>
          <p className="text-xs text-neutral-400">{errorMsg}</p>
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded bg-amber-500 px-4 py-2 text-xs font-bold text-black hover:bg-amber-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Quay lại danh sách phim
            </Link>
          </div>
        </div>
      </div>
    );
  }
}

function MovieDetailSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      <div className="border-b border-neutral-800 bg-neutral-900 px-4 py-3">
        <div className="container mx-auto h-7 w-48 bg-neutral-800 rounded animate-pulse" />
      </div>
      <div className="container mx-auto p-4 flex-1 space-y-6">
        <div className="rounded-lg border border-neutral-800 bg-neutral-900 p-5 shadow animate-pulse h-96" />
      </div>
    </div>
  );
}

export default function MovieDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={<MovieDetailSkeleton />}>
      <MovieDetailContent params={params} />
    </Suspense>
  );
}

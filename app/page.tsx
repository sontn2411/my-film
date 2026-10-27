"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  getCategories,
  getCountries,
  getLatestMovies,
  getMoviesByType,
  searchMovies,
} from "@/lib/api";
import { getMovieImage } from "@/lib/utils";
import {
  CategoryItem,
  CountryItem,
  MovieItem,
  PaginationData,
} from "@/types/movie";
import Link from "next/link";
import {
  Search,
  RotateCw,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ExternalLink,
  Film,
  Info,
  Clock,
  Sparkles,
  Database,
} from "lucide-react";

const MOVIE_TYPES = [
  { id: "phim-moi-cap-nhat", label: "Mới Cập Nhật" },
  { id: "phim-le", label: "Phim Lẻ" },
  { id: "phim-bo", label: "Phim Bộ" },
  { id: "hoat-hinh", label: "Hoạt Hình" },
  { id: "tv-shows", label: "TV Shows" },
];

const YEARS = Array.from({ length: 15 }, (_, i) => (2026 - i).toString());

export default function AdminMoviePage() {
  // Navigation / Selection State
  const [activeTab, setActiveTab] = useState<string>("phim-moi-cap-nhat");
  const [keyword, setKeyword] = useState<string>("");
  const [searchedKeyword, setSearchedKeyword] = useState<string>("");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [sortField, setSortField] = useState<string>("modified.time");
  const [sortType, setSortType] = useState<string>("desc");

  // Data State
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    totalItems: 0,
    totalItemsPerPage: 24,
    currentPage: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Meta Dictionaries
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [countries, setCountries] = useState<CountryItem[]>([]);

  // Jump page input
  const [jumpPage, setJumpPage] = useState<string>("1");

  // Load initial dropdowns
  useEffect(() => {
    Promise.all([getCategories(), getCountries()]).then(([cats, ctrys]) => {
      setCategories(cats);
      setCountries(ctrys);
    });
  }, []);

  // Fetch Movies List
  const fetchMovies = useCallback(
    async (pageToLoad = 1) => {
      setLoading(true);
      setError(null);
      try {
        let result;
        if (searchedKeyword.trim()) {
          result = await searchMovies(searchedKeyword.trim(), pageToLoad, 24);
        } else if (activeTab === "phim-moi-cap-nhat") {
          result = await getLatestMovies(pageToLoad);
        } else {
          result = await getMoviesByType(activeTab, {
            page: pageToLoad,
            category: selectedCategory || undefined,
            country: selectedCountry || undefined,
            year: selectedYear || undefined,
            sort_field: sortField,
            sort_type: sortType,
          });
        }
        setMovies(result.items || []);
        if (result.pagination) {
          setPagination(result.pagination);
          setJumpPage(result.pagination.currentPage.toString());
        }
      } catch (err: unknown) {
        const errorMsg =
          err instanceof Error ? err.message : "Lỗi tải danh sách phim";
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    },
    [
      activeTab,
      searchedKeyword,
      selectedCategory,
      selectedCountry,
      selectedYear,
      sortField,
      sortType,
    ],
  );

  // Trigger fetch when tab or filter changes
  useEffect(() => {
    fetchMovies(1);
  }, [fetchMovies]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchedKeyword(keyword);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSearchedKeyword("");
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSelectedCountry("");
    setSelectedYear("");
    setSortField("modified.time");
    setSortType("desc");
    setKeyword("");
    setSearchedKeyword("");
  };

  const handlePageChange = (newPage: number) => {
    if (
      newPage < 1 ||
      newPage > pagination.totalPages ||
      newPage === pagination.currentPage
    )
      return;
    fetchMovies(newPage);
  };

  const handleJumpPageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= pagination.totalPages) {
      handlePageChange(pageNum);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Top Admin Header Bar */}
      <header className="border-b border-neutral-800 bg-neutral-900/90 backdrop-blur-md sticky top-0 z-40 px-4 py-2.5">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-amber-500 text-black font-bold shadow">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide">
                  HỆ THỐNG QUẢN LÝ DỮ LIỆU PHIM
                </h1>
                <span className="rounded bg-neutral-800 px-2 py-0.5 text-[11px] font-mono text-neutral-400 border border-neutral-700">
                  Admin Table Mode
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Nguồn API: <code className="text-amber-400">phimapi.com</code> |
                CDN: <code className="text-neutral-300">phimimg.com</code>
              </p>
            </div>
          </div>

          {/* Quick Stats & Refresh Button */}
          <div className="flex items-center gap-3 text-xs">
            <div className="hidden sm:flex items-center gap-2 rounded bg-neutral-950 px-3 py-1.5 border border-neutral-800 text-neutral-300">
              <Database className="h-3.5 w-3.5 text-amber-500" />
              <span>
                Tổng số:{" "}
                <strong className="text-white">
                  {pagination.totalItems.toLocaleString()}
                </strong>{" "}
                phim
              </span>
              <span className="text-neutral-600">|</span>
              <span>
                Trang{" "}
                <strong className="text-white">{pagination.currentPage}</strong>{" "}
                / {pagination.totalPages}
              </span>
            </div>

            <button
              onClick={() => fetchMovies(pagination.currentPage)}
              disabled={loading}
              className="flex items-center gap-1.5 rounded border border-neutral-700 bg-neutral-800 px-3 py-1.5 font-medium text-neutral-200 hover:bg-neutral-700 hover:text-white transition-colors disabled:opacity-50"
              title="Tải lại dữ liệu"
            >
              <RotateCw
                className={`h-3.5 w-3.5 ${loading ? "animate-spin text-amber-400" : ""}`}
              />
              <span className="hidden md:inline">Làm mới</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="container  w-full mx-auto p-4 flex-1 flex flex-col space-y-3">
        {/* Type Navigation Tabs & Search Row */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-neutral-900 p-2 rounded-lg border border-neutral-800">
          {/* Movie Category Tabs */}
          <div className="flex flex-wrap items-center gap-1">
            {MOVIE_TYPES.map((type) => {
              const isActive = activeTab === type.id && !searchedKeyword;
              return (
                <button
                  key={type.id}
                  onClick={() => {
                    setActiveTab(type.id);
                    setSearchedKeyword("");
                    setKeyword("");
                  }}
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                    isActive
                      ? "bg-amber-500 text-black font-semibold shadow-xs"
                      : "text-neutral-300 hover:bg-neutral-800 hover:text-white"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-1.5 max-w-md w-full"
          >
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Tìm tên phim, tên gốc, slug..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full rounded bg-neutral-950 border border-neutral-800 pl-8 pr-7 py-1.5 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
              />
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-neutral-500" />
              {keyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 top-1.5 text-xs text-neutral-500 hover:text-neutral-300"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="submit"
              className="rounded bg-amber-500 px-3 py-1.5 text-xs font-semibold text-black hover:bg-amber-400 transition-colors shrink-0"
            >
              Tìm
            </button>
          </form>
        </div>

        {/* Filter Controls Row (Category, Country, Year, Sort) */}
        {activeTab !== "phim-moi-cap-nhat" && !searchedKeyword && (
          <div className="flex flex-wrap items-center gap-2 bg-neutral-900/60 p-2.5 rounded-lg border border-neutral-800/80 text-xs">
            <div className="flex items-center gap-1.5 text-neutral-400 mr-1">
              <SlidersHorizontal className="h-3.5 w-3.5 text-amber-500" />
              <span className="font-semibold uppercase text-[10px] tracking-wider">
                Bộ lọc:
              </span>
            </div>

            {/* Category Select */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Tất cả thể loại</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Country Select */}
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Tất cả quốc gia</option>
              {countries.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Year Select */}
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="">Tất cả năm</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  Năm {y}
                </option>
              ))}
            </select>

            {/* Sort Field */}
            <select
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
              className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="modified.time">Sắp xếp: Ngày cập nhật</option>
              <option value="year">Sắp xếp: Năm sản xuất</option>
              <option value="_id">Sắp xếp: Mã ID</option>
            </select>

            {/* Sort Type */}
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="rounded bg-neutral-950 border border-neutral-800 px-2 py-1 text-neutral-200 focus:outline-none focus:border-amber-500"
            >
              <option value="desc">Giảm dần (Mới nhất)</option>
              <option value="asc">Tăng dần (Cũ nhất)</option>
            </select>

            {(selectedCategory || selectedCountry || selectedYear) && (
              <button
                onClick={handleResetFilters}
                className="ml-auto text-neutral-400 hover:text-amber-400 underline"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {/* Search Active Notification Indicator */}
        {searchedKeyword && (
          <div className="flex items-center justify-between rounded bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 text-xs text-amber-300">
            <span>
              Đang hiển thị kết quả tìm kiếm cho từ khóa:{" "}
              <strong>&ldquo;{searchedKeyword}&rdquo;</strong> (
              {pagination.totalItems} kết quả)
            </span>
            <button
              onClick={handleClearSearch}
              className="underline font-semibold hover:text-white"
            >
              Quay lại danh sách
            </button>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="rounded border border-red-800 bg-red-950/40 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* Admin Data Table Section */}
        <div className="flex-1 rounded-lg border border-neutral-800 bg-neutral-900 overflow-hidden flex flex-col shadow">
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-neutral-950 text-neutral-400 border-b border-neutral-800 font-semibold tracking-wider uppercase text-xs sticky top-0 z-20">
                  <th className="py-3 px-3.5 w-14 text-center">STT</th>
                  <th className="py-3 px-3.5 w-20 text-center">Poster</th>
                  <th className="py-3 px-3.5 min-w-[260px]">
                    Tên Phim / Tên Gốc
                  </th>
                  <th className="py-3 px-3.5 w-24 text-center">Năm</th>
                  <th className="py-3 px-3.5 w-28 text-center">Loại</th>
                  <th className="py-3 px-3.5 w-32 text-center">
                    Tập / Tiến độ
                  </th>
                  <th className="py-3 px-3.5 w-36 text-center">Bản / Phụ đề</th>
                  <th className="py-3 px-3.5 min-w-[180px]">
                    Thể loại & Quốc gia
                  </th>
                  <th className="py-3 px-3.5 w-40">Cập nhật</th>
                  <th className="py-3 px-3.5 w-32 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i} className="animate-pulse bg-neutral-900/50">
                      <td className="py-4 px-3.5 text-center text-neutral-600">
                        --
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-20 w-14 rounded-md bg-neutral-800 mx-auto" />
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-4 w-48 bg-neutral-800 rounded mb-1.5" />
                        <div className="h-3 w-32 bg-neutral-800/60 rounded" />
                      </td>
                      <td className="py-4 px-3.5 text-center">
                        <div className="h-4 w-10 bg-neutral-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-3.5 text-center">
                        <div className="h-4 w-14 bg-neutral-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-3.5 text-center">
                        <div className="h-4 w-16 bg-neutral-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-3.5 text-center">
                        <div className="h-4 w-20 bg-neutral-800 rounded mx-auto" />
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-4 w-28 bg-neutral-800 rounded" />
                      </td>
                      <td className="py-4 px-3.5">
                        <div className="h-4 w-24 bg-neutral-800 rounded" />
                      </td>
                      <td className="py-4 px-3.5 text-center">
                        <div className="h-7 w-20 bg-neutral-800 rounded mx-auto" />
                      </td>
                    </tr>
                  ))
                ) : movies.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="py-16 text-center text-neutral-400 text-sm"
                    >
                      Không tìm thấy bộ phim nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  movies.map((m, index) => {
                    const rowNumber =
                      (pagination.currentPage - 1) *
                        pagination.totalItemsPerPage +
                      index +
                      1;
                    const imageUrl = getMovieImage(m.thumb_url || m.poster_url);
                    const formattedDate = m.modified?.time
                      ? new Date(m.modified.time).toLocaleString("vi-VN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "N/A";

                    return (
                      <tr
                        key={m._id || m.slug || index}
                        className="hover:bg-neutral-800/50 transition-colors group"
                      >
                        {/* 1. Index */}
                        <td className="py-3 px-3.5 text-center font-mono text-sm text-neutral-400">
                          {rowNumber}
                        </td>

                        {/* 2. Thumbnail Poster */}
                        <td className="py-3 px-3.5 text-center">
                          <Link
                            href={`/phim/${m.slug}`}
                            className="relative block h-20 w-14 mx-auto rounded-md overflow-hidden bg-neutral-950 border border-neutral-800 shadow-md cursor-pointer group-hover:border-amber-500/60 transition-all hover:scale-105"
                            title="Bấm để xem chi tiết"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={imageUrl}
                              alt={m.name}
                              loading="lazy"
                              className="h-full w-full object-cover transition-transform"
                            />
                          </Link>
                        </td>

                        {/* 3. Movie Names & Slug */}
                        <td className="py-3 px-3.5">
                          <Link
                            href={`/phim/${m.slug}`}
                            className="text-left font-semibold text-neutral-100 text-sm hover:text-amber-400 hover:underline transition-colors block line-clamp-1"
                          >
                            {m.name}
                          </Link>
                          <div className="text-xs text-neutral-400 line-clamp-1 mt-0.5">
                            {m.origin_name}
                          </div>
                          <div className="text-[11px] text-neutral-500 font-mono flex items-center gap-1.5 mt-1">
                            <span className="text-neutral-500">slug:</span>
                            <span className="text-neutral-300 bg-neutral-950 px-1 py-0.5 rounded border border-neutral-800/80">
                              {m.slug}
                            </span>
                          </div>
                        </td>

                        {/* 4. Year */}
                        <td className="py-3 px-3.5 text-center">
                          <span className="rounded bg-neutral-800 px-2 py-1 font-semibold text-xs text-neutral-200 border border-neutral-700/60">
                            {m.year || "--"}
                          </span>
                        </td>

                        {/* 5. Type */}
                        <td className="py-3 px-3.5 text-center">
                          <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-800 text-neutral-300 uppercase">
                            {m.type || "Phim"}
                          </span>
                        </td>

                        {/* 6. Current Episode */}
                        <td className="py-3 px-3.5 text-center">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium inline-block ${
                              m.episode_current?.toLowerCase().includes("full")
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                                : "bg-purple-500/10 text-purple-400 border border-purple-500/25"
                            }`}
                          >
                            {m.episode_current || "Full"}
                          </span>
                        </td>

                        {/* 7. Quality & Lang */}
                        <td className="py-3 px-3.5 text-center space-y-1">
                          {m.quality && (
                            <span className="inline-block rounded bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-400 border border-blue-500/25 mr-1">
                              {m.quality}
                            </span>
                          )}
                          {m.lang && (
                            <span className="inline-block rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-200">
                              {m.lang}
                            </span>
                          )}
                        </td>

                        {/* 8. Categories & Country */}
                        <td className="py-3 px-3.5 space-y-1.5">
                          <div className="flex flex-wrap gap-1">
                            {m.category && m.category.length > 0 ? (
                              m.category.slice(0, 3).map((c, i) => (
                                <span
                                  key={i}
                                  className="text-xs text-neutral-300 bg-neutral-950 px-1.5 py-0.5 rounded border border-neutral-800"
                                >
                                  {c.name}
                                </span>
                              ))
                            ) : (
                              <span className="text-neutral-600 text-xs">
                                --
                              </span>
                            )}
                          </div>
                          {m.country && m.country.length > 0 && (
                            <div className="text-xs text-neutral-400">
                              🌍 {m.country.map((c) => c.name).join(", ")}
                            </div>
                          )}
                        </td>

                        {/* 9. Modified Time */}
                        <td className="py-3 px-3.5 text-neutral-300 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-neutral-500 shrink-0" />
                            <span>{formattedDate}</span>
                          </div>
                        </td>

                        {/* 10. Actions */}
                        <td className="py-3 px-3.5 text-center">
                          <Link
                            href={`/phim/${m.slug}`}
                            className="inline-flex items-center gap-1.5 rounded bg-neutral-800 px-3 py-1.5 text-xs font-medium text-amber-400 hover:bg-neutral-700 hover:text-amber-300 transition-colors border border-neutral-700 shadow-xs"
                            title="Mở trang chi tiết & xem link phát"
                          >
                            <Info className="h-3.5 w-3.5" />
                            <span>Chi tiết</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Admin Table Pagination Footer */}
          <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-300">
            <div className="flex items-center gap-2">
              <span>
                Hiển thị trang <strong>{pagination.currentPage}</strong> /{" "}
                <strong>{pagination.totalPages}</strong> (
                {pagination.totalItems.toLocaleString()} phim)
              </span>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Về trang đầu"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Trang trước"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 font-semibold text-amber-400">
                {pagination.currentPage}
              </span>

              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={
                  pagination.currentPage >= pagination.totalPages || loading
                }
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Trang kế tiếp"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(pagination.totalPages)}
                disabled={
                  pagination.currentPage >= pagination.totalPages || loading
                }
                className="rounded p-1 text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent"
                title="Đến trang cuối"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>

              {/* Jump to Page Input Form */}
              <form
                onSubmit={handleJumpPageSubmit}
                className="flex items-center gap-1 ml-3"
              >
                <span className="text-neutral-500">Đến trang:</span>
                <input
                  type="number"
                  min="1"
                  max={pagination.totalPages}
                  value={jumpPage}
                  onChange={(e) => setJumpPage(e.target.value)}
                  className="w-14 rounded bg-neutral-900 border border-neutral-700 px-1.5 py-0.5 text-center text-xs text-white focus:outline-none focus:border-amber-500"
                />
                <button
                  type="submit"
                  className="rounded bg-neutral-800 px-2 py-0.5 text-xs text-neutral-300 hover:bg-neutral-700 hover:text-white"
                >
                  Đi
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

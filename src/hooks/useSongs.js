// src/hooks/useSongs.js
import { useState, useCallback } from "react";

const API_URL   = import.meta.env.VITE_API_BASE_URL;
const CACHE_KEY = "moodtune_songs";      // localStorage key prefix
const CACHE_TTL = 1000 * 60 * 60 * 24;  // 24 hours in ms — matches DynamoDB TTL

// ── localStorage helpers ────────────────────────────────────────────────────
function readCache(mood) {
  try {
    const raw = localStorage.getItem(`${CACHE_KEY}_${mood}`);
    if (!raw) return null;
    const { songs, allSongs, timestamp, totalSongs } = JSON.parse(raw);
    // Expired?
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(`${CACHE_KEY}_${mood}`);
      return null;
    }
    return { songs, allSongs, totalSongs };
  } catch {
    return null;
  }
}

function writeCache(mood, allSongs, totalSongs) {
  try {
    localStorage.setItem(`${CACHE_KEY}_${mood}`, JSON.stringify({
      allSongs,
      songs    : allSongs,
      totalSongs,
      timestamp: Date.now(),
    }));
  } catch (e) {
    // localStorage can throw if storage is full — non-fatal
    console.warn("localStorage write failed:", e.message);
  }
}

function clearCache(mood) {
  try { localStorage.removeItem(`${CACHE_KEY}_${mood}`); } catch {}
}

// ── Hook ────────────────────────────────────────────────────────────────────
export function useSongs() {
  const [songs,       setSongs]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [totalSongs,  setTotalSongs]  = useState(0);
  const [currentMood, setCurrentMood] = useState(null);

  // ── Fetch songs for a mood ─────────────────────────────────────────────────
  const fetchSongs = useCallback(async (mood) => {
    setLoading(true);
    setError(null);
    setSongs([]);
    setPage(1);
    setHasMore(false);
    setCurrentMood(mood);

    // 1. Check localStorage first
    const cached = readCache(mood.id);
    if (cached) {
      console.log(`[Cache HIT] ${mood.id} — ${cached.allSongs.length} songs from localStorage`);
      setSongs(cached.allSongs.slice(0, 10));
      setHasMore(cached.allSongs.length > 10);
      setTotalSongs(cached.totalSongs || cached.allSongs.length);
      setPage(1);
      setLoading(false);
      return;
    }

    // 2. Cache miss — fetch from Lambda
    console.log(`[Cache MISS] ${mood.id} — fetching from API`);
    try {
      const data = await callAPI(mood.id, 1);
      const initialSongs = data.songs || [];

      // If there are more pages, fetch ALL pages so we can cache the full set
      // This means one mood costs quota only on first visit, never again
      let allSongs = [...initialSongs];

      if (data.hasMore) {
        const totalPages = data.totalPages || 1;
        // Fetch remaining pages in parallel
        const remainingPages = Array.from(
          { length: totalPages - 1 },
          (_, i) => i + 2
        );
        const results = await Promise.allSettled(
          remainingPages.map(p => callAPI(mood.id, p))
        );
        for (const r of results) {
          if (r.status === "fulfilled") {
            allSongs = [...allSongs, ...(r.value.songs || [])];
          }
        }
      }

      // Save full list to localStorage
      writeCache(mood.id, allSongs, data.totalSongs || allSongs.length);

      // Show first 10 in UI
      setSongs(allSongs.slice(0, 10));
      setHasMore(allSongs.length > 10);
      setTotalSongs(data.totalSongs || allSongs.length);
      setPage(1);

    } catch (e) {
      setError(e.message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Load more from localStorage (no API call needed) ──────────────────────
  const fetchMore = useCallback(async () => {
    if (!currentMood || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

    // Always read from localStorage cache first
    const cached = readCache(currentMood.id);
    if (cached?.allSongs) {
      const start    = (nextPage - 1) * 10;
      const moreSongs = cached.allSongs.slice(start, start + 10);
      setSongs(prev => [...prev, ...moreSongs]);
      setHasMore(start + 10 < cached.allSongs.length);
      setPage(nextPage);
      setLoadingMore(false);
      return;
    }

    // Fallback: fetch from API if cache somehow missing
    try {
      const data = await callAPI(currentMood.id, nextPage);
      setSongs(prev => [...prev, ...(data.songs || [])]);
      setHasMore(data.hasMore || false);
      setPage(nextPage);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoadingMore(false);
    }
  }, [currentMood, page, hasMore, loadingMore]);

  // ── Force refresh — clears cache and refetches ─────────────────────────────
  const refresh = useCallback(async (mood) => {
    if (!mood) return;
    clearCache(mood.id);
    await fetchSongs(mood);
  }, [fetchSongs]);

  return {
    songs, loading, loadingMore,
    error, hasMore, totalSongs,
    fetchSongs, fetchMore, refresh,
  };
}

// ── API call ─────────────────────────────────────────────────────────────────
async function callAPI(mood, page) {
  const res = await fetch(`${API_URL}/songs`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ mood, page }),
  });

  const outer = await res.json();
  const data  = typeof outer.body === "string"
    ? JSON.parse(outer.body)
    : (outer.body ?? outer);

  if (data.error)  throw new Error(data.error);
  if (!res.ok)     throw new Error(`HTTP ${res.status}`);

  return data;
}
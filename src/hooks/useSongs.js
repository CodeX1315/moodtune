
import { useState, useCallback } from "react";

const API_URL = import.meta.env.VITE_API_BASE_URL;

export function useSongs() {
  const [songs,       setSongs]       = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error,       setError]       = useState(null);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(false);
  const [totalSongs,  setTotalSongs]  = useState(0);
  const [currentMood, setCurrentMood] = useState(null);

  const fetchSongs = useCallback(async (mood) => {
    setLoading(true);
    setError(null);
    setSongs([]);
    setPage(1);
    setHasMore(false);
    setCurrentMood(mood);

    try {
      const data = await callAPI(mood.id, 1);
      setSongs(data.songs || []);
      setHasMore(data.hasMore || false);
      setTotalSongs(data.totalSongs || 0);
      setPage(1);
    } catch (e) {
      setError(e.message);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const fetchMore = useCallback(async () => {
    if (!currentMood || loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;

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

  return {
    songs, loading, loadingMore,
    error, hasMore, totalSongs,
    fetchSongs, fetchMore,
  };
}

async function callAPI(mood, page) {
  const res = await fetch(`${API_URL}/songs`, {
    method : "POST",
    headers: { "Content-Type": "application/json" },
    body   : JSON.stringify({ mood, page }),
  });

  // Lambda via API Gateway returns body as a stringified JSON string
  // So we parse the outer envelope first, then parse body again if it's a string
  const outer = await res.json();

  const data = typeof outer.body === "string"
    ? JSON.parse(outer.body)
    : (outer.body ?? outer);

  if (data.error) {
    throw new Error(data.error);
  }

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  return data;
}
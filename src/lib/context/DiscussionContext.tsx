// context/DiscussionContext.tsx
"use client"
import React, { createContext, useContext, useState, useEffect } from "react";

interface DiscussionContextProps {
  threads: any[];
  loadMore: () => void;
  applyFilters: (filters: any) => void;
  isLoading: boolean;
  hasMore: boolean;
}

const DiscussionContext = createContext<DiscussionContextProps | undefined>(
  undefined
);

export const useDiscussions = () => {
  const context = useContext(DiscussionContext);
  if (!context) {
    throw new Error("useDiscussions must be used within a DiscussionProvider");
  }
  return context;
};

export const DiscussionProvider = ({
  children,
  initialData, // Accept the initial server-side fetched data
}: {
  children: React.ReactNode;
  initialData: any;
}) => {
  // Initialize threads with server-side data
  const [threads, setThreads] = useState(initialData.data || []);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(
    initialData.pagination.totalPages > 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({});

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/forum/threads?page=${page + 1}&limit=10&filters=${JSON.stringify(
          filters
        )}`
      );
      const data = await response.json();
      setThreads((prevThreads: any) => [...prevThreads, ...data.data]);
      setHasMore(page < data.pagination.totalPages);
      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error("Error loading more threads", error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = async (newFilters: any) => {
    setIsLoading(true);
    setFilters(newFilters);
    setPage(1); // Reset the page
    try {
      const response = await fetch(
        `https://jrp7pe2xhj.us-east-1.awsapprunner.com/api/v1/forum/threads?page=1&limit=10&filters=${JSON.stringify(
          newFilters
        )}`
      );
      const data = await response.json();
      setThreads(data.data); // Reset the threads
      setHasMore(data.pagination.totalPages > 1);
    } catch (error) {
      console.error("Error applying filters", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DiscussionContext.Provider
      value={{ threads, loadMore, applyFilters, isLoading, hasMore }}
    >
      {children}
    </DiscussionContext.Provider>
  );
};

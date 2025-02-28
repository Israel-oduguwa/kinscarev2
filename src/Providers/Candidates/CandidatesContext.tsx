// CandidatesContext.tsx
"use client"
import React, { createContext, useState, useEffect, ReactNode, useContext } from "react";
import axios from "axios";
import MongoContext from "@/app/MongoContext";

export interface Candidate {
  _id: string;
  fname: string;
  lname: string;
  certifications: string;
  licenses: string[];
  schedule: string[];
  minHours: number;
  compensation: string;
  city: string;
}

interface Pagination {
  totalCaregivers: number;
  totalPages: number;
  currentPage: number;
}

interface CaregiverApiResponse {
  pagination: Pagination;
  caregivers: Candidate[];
}

interface CandidatesApiResponse {
  totalCandidates: number;
  totalPages: number;
  currentPage: number;
  candidates: Candidate[];
  caregivers: Candidate[];
}

interface CandidatesContextType {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  isFilteredSearch: boolean;
  selectedShifts: string[];
  selectedLicenses: string[];
  setSelectedShifts: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedLicenses: React.Dispatch<React.SetStateAction<string[]>>;
  fetchCandidatesData: (userID: string, page: number) => Promise<void>;
  fetchFilteredCandidatesData: () => Promise<void>;
  loadMoreCandidates: (userID: string) => Promise<void>;
  handleSearch: () => Promise<void>;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}

export const CandidatesContext = createContext<CandidatesContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

export const CandidatesProvider: React.FC<Props> = ({children }) => {
    const {userData}:any = useContext(MongoContext);
    const userID = userData.userID
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFilteredSearch, setIsFilteredSearch] = useState(false);
  const [selectedShifts, setSelectedShifts] = useState<string[]>([]);
  const [selectedLicenses, setSelectedLicenses] = useState<string[]>([]);

  // Unfiltered candidates fetch
  const fetchCandidatesData = async (userID: string, page: number) => {
    console.log(userID, "thso=s")
    try {
      setLoading(true);
      const response = await axios.get(
        `https://api.kinscare.org/api/v1/providers/caregivers/match/${userID}?page=${page}&limit=10`
      );
      const data: CandidatesApiResponse = response.data;
      setCandidates(data.candidates);
      setTotalPages(data.totalPages);
      setIsFilteredSearch(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Filtered candidates fetch (if needed separately)
  const fetchFilteredCandidatesData = async () => {
    try {
      setLoading(true);
      const availabilityParam = selectedShifts.join(",");
      const licensesParam = selectedLicenses.join(",");
      const response = await axios.get(
        `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${availabilityParam}&licenses=${licensesParam}&page=1&limit=40`
      );
      const data: CaregiverApiResponse = response.data;
      setCandidates(data.caregivers);
      setTotalPages(data.pagination.totalPages);
      setPage(1);
      setIsFilteredSearch(true);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Global handleSearch function, based on your original code
  const handleSearch = async () => {
    setPage(1);
    setIsFilteredSearch(true);
    setLoading(true);
    setError(null);

    try {
      const availabilityParam = selectedShifts.join(",");
      const licensesParam = selectedLicenses.join(",");
      const response = await axios.get(
        `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${availabilityParam}&licenses=${licensesParam}&page=1&limit=40`
      );
      const data: CaregiverApiResponse = response.data;
      setCandidates(data.caregivers);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Load more candidates for pagination
  const loadMoreCandidates = async (userID: string) => {
    if (page >= totalPages) return;
    try {
      setLoading(true);
      const nextPage = page + 1;
      if (isFilteredSearch) {
        const availabilityParam = selectedShifts.join(",");
        const licensesParam = selectedLicenses.join(",");
        const response = await axios.get(
          `https://api.kinscare.org/api/v1/providers/find-caregivers/filter?availability=${availabilityParam}&licenses=${licensesParam}&page=${nextPage}&limit=40`
        );
        const data: CaregiverApiResponse = response.data;
        setCandidates((prev) => [...prev, ...data.caregivers]);
      } else {
        const response = await axios.get(
          `https://api.kinscare.org/api/v1/providers/caregivers/match/${userID}?page=${nextPage}&limit=10`
        );
        const data: CandidatesApiResponse = response.data;
        setCandidates((prev) => [...prev, ...data.candidates]);
      }
      setPage(nextPage);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when provider mounts
  useEffect(() => {
    if (userID) {
      fetchCandidatesData(userID, page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userID]);

  return (
    <CandidatesContext.Provider
      value={{
        candidates,
        loading,
        error,
        page,
        totalPages,
        isFilteredSearch,
        selectedShifts,
        selectedLicenses,
        setSelectedShifts,
        setSelectedLicenses,
        fetchCandidatesData,
        fetchFilteredCandidatesData,
        loadMoreCandidates,
        handleSearch,
        setPage,
      }}
    >
      {children}
    </CandidatesContext.Provider>
  );
};

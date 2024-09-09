"use client";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
function ContextProviders({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default ContextProviders;

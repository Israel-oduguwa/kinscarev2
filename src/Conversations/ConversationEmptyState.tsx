"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/context/AuthContext";
import { useApiClient } from "@/hooks/useApiClient";
import { Loader2 } from "lucide-react";

type EmptyStateProps = {
  basePath: string;
  title: string;
  description: string;
  icon?: string;
};

export default function ConversationEmptyState({
  basePath,
  title,
  description,
  icon = "✨",
}: EmptyStateProps) {
  const { userData } = useAuthContext();
  const { privateApi } = useApiClient();
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const identity = userData?.userID;
    if (!identity) {
      setChecking(false);
      return;
    }

    let isMounted = true;
    const checkLatest = async () => {
      try {
        const { data } = await privateApi.get("/api/conversations/list", {
          params: { identity },
        });
        if (!isMounted || !data?.success) return;
        const items = Array.isArray(data.data) ? data.data : [];
        if (items.length > 0) {
          const sorted = [...items].sort((a, b) => {
            const aTime = new Date(
              a.dateUpdated || a.dateCreated || 0
            ).getTime();
            const bTime = new Date(
              b.dateUpdated || b.dateCreated || 0
            ).getTime();
            return bTime - aTime;
          });
          const sid = sorted[0]?.conversationSid;
          if (sid) {
            router.replace(`${basePath}/${sid}`);
            return;
          }
        }
      } catch (_error) {
        // Ignore fetch failures; show empty state.
      } finally {
        if (isMounted) setChecking(false);
      }
    };

    checkLatest();
    return () => {
      isMounted = false;
    };
  }, [basePath, privateApi, router, userData?.userID]);

  return (
    <div className="max-w-[1700px] mx-auto flex h-full items-center justify-center px-6 py-12">
      <div className="max-w-sm text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg">
          {checking ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <span className="text-xl">{icon}</span>
          )}
        </div>
        <p className="mt-4 text-lg font-semibold text-slate-900">{title}</p>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </div>
  );
}

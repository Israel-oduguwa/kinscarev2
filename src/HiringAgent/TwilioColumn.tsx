"use client";

import React from "react";
import invariant from "tiny-invariant";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

import TwilioApplicantCard from "./TwilioApplicantCard";
import {
  Applicant,
  ColumnKey,
  COLUMN_CONFIG,
} from "./TwilioKanbanTypes";

type MatchApplicantPayload = {
  id: string;
  tempHash?: string | null;
  email?: string | null;
  phone?: string | null;
  zipcode?: string | null;
  existingAccount?: boolean | null;
};

type TwilioColumnProps = {
  columnKey: ColumnKey;
  items: Applicant[];
  privateApi: any;
  onToggleContacted: (id: string, value: boolean) => void;
  onTogglePostJob: (id: string, value: boolean) => void;
  onToggleAddPayment: (id: string, value: boolean) => void;
  onToggleMatchMade: (payload: MatchApplicantPayload, value: boolean) => void;
  onRemoveFromFlow: (id: string, jobId?: string | null) => void;
  onDeleteSignup: (applicant: Applicant) => void;
};

const TwilioColumn: React.FC<TwilioColumnProps> = ({
  columnKey,
  items,
  privateApi,
  onToggleContacted,
  onTogglePostJob,
  onToggleAddPayment,
  onToggleMatchMade,
  onRemoveFromFlow,
  onDeleteSignup,
}) => {
  const columnRef = React.useRef<HTMLDivElement | null>(null);
  const [isDraggedOver, setIsDraggedOver] = React.useState(false);

  React.useEffect(() => {
    const el = columnRef.current;
    if (!el) return;

    invariant(el);

    const cleanup = dropTargetForElements({
      element: el,
      getData: () => ({
        type: "column",
        columnKey,
      }),
      getIsSticky: () => true,
      onDragEnter: () => setIsDraggedOver(true),
      onDragLeave: () => setIsDraggedOver(false),
      onDrop: () => setIsDraggedOver(false),
    });

    return () => {
      cleanup();
    };
  }, [columnKey]);

  return (
    <div ref={columnRef} className="w-[390px] shrink-0">
      <Card
        className={`border border-slate-200/70 bg-white/80 flex flex-col max-h-[75vh] transition-all duration-200 shadow-[0_10px_30px_-20px_rgba(15,23,42,0.35)] rounded-2xl ${
          isDraggedOver
            ? "border-indigo-400/80 bg-indigo-50/80 shadow-[0_18px_40px_-25px_rgba(79,70,229,0.35)]"
            : "hover:border-slate-300/70"
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              {COLUMN_CONFIG[columnKey].title}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200/70">
                {items.length}
              </span>
            </CardTitle>
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
              Stage
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {COLUMN_CONFIG[columnKey].subtitle}
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-2 px-3 flex-1 overflow-x-hidden overflow-y-auto">
          <ScrollArea className="h-full pr-2">
            {items.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-6 text-center">
                No providers in this stage yet.
              </p>
            ) : (
              items.map((applicant) => (
                <TwilioApplicantCard
                  key={applicant._id}
                  applicant={applicant}
                  columnKey={columnKey}
                  privateApi={privateApi}
                  onToggleContacted={onToggleContacted}
                  onTogglePostJob={onTogglePostJob}
                  onToggleAddPayment={onToggleAddPayment}
                  onToggleMatchMade={onToggleMatchMade}
                  onRemoveFromFlow={onRemoveFromFlow}
                  onDeleteSignup={onDeleteSignup}
                />
              ))
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwilioColumn;

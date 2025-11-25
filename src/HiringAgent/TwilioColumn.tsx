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
  onToggleContacted: (id: string, value: boolean) => void;
  onTogglePostJob: (id: string, value: boolean) => void;
  onToggleAddPayment: (id: string, value: boolean) => void;
  onToggleMatchMade: (payload: MatchApplicantPayload, value: boolean) => void;
  onRemoveFromFlow: (id: string, jobId?: string | null) => void;
  onDeleteSignup: (id: string) => void;
};

const TwilioColumn: React.FC<TwilioColumnProps> = ({
  columnKey,
  items,
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
    <div ref={columnRef} className="w-[380px] shrink-0">
      <Card
        className={`border border-slate-200 bg-slate-50/80 flex flex-col max-h-[75vh] transition-colors ${
          isDraggedOver ? "border-indigo-400 bg-indigo-50/80" : ""
        }`}
      >
        <CardHeader className="pb-2">
          <div className="flex items-baseline justify-between">
            <CardTitle className="text-sm font-semibold flex items-center gap-1.5">
              {COLUMN_CONFIG[columnKey].title}
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                {items.length}
              </span>
            </CardTitle>
          </div>
          <p className="text-xs text-slate-500">
            {COLUMN_CONFIG[columnKey].subtitle}
          </p>
        </CardHeader>
        <Separator />
        <CardContent className="pt-2 px-2 flex-1 overflow-x-hidden overflow-y-auto">
          <ScrollArea className="h-full pr-2">
            {items.length === 0 ? (
              <p className="text-[11px] text-slate-400 italic py-4 text-center">
                No providers in this stage yet.
              </p>
            ) : (
              items.map((applicant) => (
                <TwilioApplicantCard
                  key={applicant._id}
                  applicant={applicant}
                  columnKey={columnKey}
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

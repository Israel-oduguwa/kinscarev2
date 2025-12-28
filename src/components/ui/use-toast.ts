"use client";

import type { ReactNode } from "react";
import { toast as sonnerToast, type ExternalToast } from "sonner";
import type { ToastActionElement } from "@/components/ui/toast";

type ToastVariant = "default" | "destructive";

type ToastInput = {
  title?: ReactNode;
  description?: ReactNode;
  variant?: ToastVariant;
  action?: ExternalToast["action"] | ToastActionElement;
};

type ToastReturn = {
  id: string | number;
  dismiss: () => void;
  update: (props: ToastInput) => void;
};

const getText = (value?: ReactNode): string | undefined => {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
};

const isActionObject = (
  action?: ToastInput["action"]
): action is ExternalToast["action"] => {
  if (!action || typeof action !== "object") return false;
  const maybeAction = action as { label?: unknown; onClick?: unknown };
  return (
    typeof maybeAction.label === "string" &&
    typeof maybeAction.onClick === "function"
  );
};

const buildOptions = (
  props: ToastInput,
  id?: string | number
): ExternalToast => {
  const options: ExternalToast = {};
  const hasTitle = Boolean(getText(props.title));

  if (hasTitle && props.description) {
    options.description = props.description;
  } else if (!hasTitle && props.description && typeof props.description !== "string") {
    options.description = props.description;
  }

  if (isActionObject(props.action)) {
    options.action = props.action;
  }

  if (id !== undefined) {
    options.id = id;
  }

  return options;
};

const emitToast = (props: ToastInput, id?: string | number) => {
  const titleText = getText(props.title);
  const descText = getText(props.description);
  const message = titleText ?? descText ?? "Notification";
  const options = buildOptions(props, id);

  if (props.variant === "destructive") {
    return sonnerToast.error(message, options);
  }

  return sonnerToast.message(message, options);
};

function toast(props: ToastInput): ToastReturn {
  const id = emitToast(props);

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
    update: (nextProps) => {
      emitToast(nextProps, id);
    },
  };
}

function useToast() {
  return {
    toast,
    dismiss: (toastId?: string | number) => sonnerToast.dismiss(toastId),
  };
}

export { useToast, toast };

"use client";
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DialogContextType = {
  openDialog: (component: ReactNode) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState<ReactNode>(null);

  const openDialog = (component: ReactNode) => {
    setDialogContent(component);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setDialogContent(null);
  };

  return (
    <DialogContext.Provider value={{ openDialog, closeDialog }}>
      {children}
      <Dialog
        open={isOpen}
        // Only close when shadcn asks to close (not when it tries to open)
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
      >
        <DialogContent
          className="p-0 sm:max-w-[900px] max-h-[90dvh] [&>button]:hidden overflow-hidden bg-transparent border-0 shadow-none rounded-2xl"
          aria-label="Global Dialog"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          {dialogContent}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error("useDialog must be used within a DialogProvider");
  return context;
};

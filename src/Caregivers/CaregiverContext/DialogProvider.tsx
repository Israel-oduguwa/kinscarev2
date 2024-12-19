"use client"
import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

type DialogContextType = {
  openDialog: (component: ReactNode) => void;
  closeDialog: () => void;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

// Dialog Provider
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
      <Dialog open={isOpen} onOpenChange={closeDialog}>
        <DialogContent
          className="max-w-3xl p-0 bg-gray-50 [&>button]:hidden"
          aria-label="Global Dialog"
        >
          {dialogContent}
        </DialogContent>
      </Dialog>
    </DialogContext.Provider>
  );
};

// Custom hook to use Dialog Context
export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("useDialog must be used within a DialogProvider");
  }
  return context;
};

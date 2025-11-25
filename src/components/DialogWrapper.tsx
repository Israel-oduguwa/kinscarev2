import React, { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";

interface DialogWrapperProps {
  isOpen: boolean; // To control whether the dialog is open
  onClose: () => void; // To handle closing the dialog
  children: ReactNode; // The content of the dialog
  dialogTitle?: string; // Optional title for the dialog
  width:string;
}

const DialogWrapper: React.FC<DialogWrapperProps> = ({
  isOpen,
  onClose,
  children,
  dialogTitle,
  width
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={width}>
        {dialogTitle && <DialogHeader>{dialogTitle}</DialogHeader>}
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default DialogWrapper;

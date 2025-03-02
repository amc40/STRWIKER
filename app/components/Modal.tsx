import React, { FC, ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export interface CustomModalProps {
  show: boolean;
  onClose: () => void;
}

interface ModalProps extends CustomModalProps {
  title: string | ReactNode;
  children?: React.JSX.Element;
}

const Modal: FC<ModalProps> = ({ title, children, show, onClose }) => {
  return (
    <Dialog
      open={show}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-fit">
        <DialogHeader>
          <DialogTitle className="text-xl md:text-3xl font-semibold">
            {title}
          </DialogTitle>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};

export default Modal;

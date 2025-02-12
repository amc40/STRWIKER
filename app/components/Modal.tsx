import React, { FC, ReactNode } from 'react';
import { Cross } from './icons/Cross';

export interface CustomModalProps {
  show: boolean;
  onClose: () => void;
}

interface ModalProps extends CustomModalProps {
  title: string | ReactNode;
  children?: React.JSX.Element;
}

const Modal: FC<ModalProps> = ({ title, children, show, onClose }) => {
  if (!show) {
    return null;
  }

  return (
    <div
      className={
        'fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50'
      }
      onClick={onClose}
    >
      <div
        className={'bg-white opacity-100 text-black rounded-md p-5 pt-2'}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <div className="flex justify-between items-center">
          <h1 className="text-xl md:text-3xl font-semibold">{title}</h1>
          <button className="border-red-500 text-red-500" onClick={onClose}>
            <Cross />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

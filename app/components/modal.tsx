import { FC, useEffect } from 'react';

export interface ModalProps {
  show: Boolean;
  children?: JSX.Element;
  onClose: () => void;
}

const Modal: FC<ModalProps> = ({ children, show, onClose }) => {
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
        onClick={(e) => e.stopPropagation()}
      >
        <div className={'text-right'}>
          <button onClick={onClose}>Close</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;

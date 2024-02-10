import React from 'react';
import Modal, { ModalProps } from './Modal';
import { AbandonGameButton } from './AbandonGameButton';

export const SettingsModal: React.FC<ModalProps> = (props) => {
  return (
    <Modal {...props}>
      <div
        className={
          'min-w-[80vw] lg:min-w-[40vw] min-h-[50vh] lg:min-h-[30vh] max-h-[80vh] flex items-center justify-center'
        }
      >
        <AbandonGameButton />
      </div>
    </Modal>
  );
};

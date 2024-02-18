import React from 'react';
import Modal, { CustomModalProps } from '../Modal';
import { AbandonGameButton } from '../AbandonGameButton';
import { SettingsModalSectionHeader } from './SettingsModalSectionHeader';
import { SettingsModalDescription } from './SettingsModalDescription';
import { RotatyStrategySelector } from './RotationStrategySelector';
import { SettingsModalSettingHeader } from './SettingsModalSettingHeader';

export const SettingsModal: React.FC<CustomModalProps> = (props) => {
  return (
    <Modal {...props} title="Settings">
      <div className={'max-w-[80vw] w-[40rem]'}>
        <div>
          <SettingsModalSectionHeader title="General" />
          <SettingsModalDescription
            text="Abandon the current game.
              Stats will still be stored, but the game will be marked as
              'Abandoned'."
          />
          <AbandonGameButton />
        </div>
        <div>
          <SettingsModalSectionHeader title="Blue Team Settings" />
          <div>
            <SettingsModalSettingHeader title="Rotation Strategy" />
            <SettingsModalDescription text="Defines whether players auto-rotate after a goal is scored." />
            <RotatyStrategySelector team="Blue" />
          </div>
        </div>
        <div>
          <SettingsModalSectionHeader title="Red Team Settings" />
          <div>
            <SettingsModalSettingHeader title="Rotation Strategy" />
            <SettingsModalDescription text="Defines whether players auto-rotate after a goal is scored." />
            <RotatyStrategySelector team="Red" />
          </div>
        </div>
      </div>
    </Modal>
  );
};

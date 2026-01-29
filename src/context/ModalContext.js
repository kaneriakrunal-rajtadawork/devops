"use client";

import React, { createContext, useContext, useState } from 'react';

const ModalContext = createContext();

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const [isBugIndexModalOpen, setIsBugIndexModalOpen] = useState(false);
  const [bugIndexModalKey, setBugIndexModalKey] = useState(0);
  const [actionType, setActionType] = useState('');

  const [isGitHubAuthModalOpen, setIsGitHubAuthModalOpen] = useState(false);

  const handleOpenBugIndexModal = (action) => {
    setActionType(action);
    setBugIndexModalKey(prevKey => prevKey + 1);
    setIsBugIndexModalOpen(true);
  };

  const handleCloseBugIndexModal = () => {
    setIsBugIndexModalOpen(false);
  };

  const handleOpenGitHubAuthModal = () => {
    setIsGitHubAuthModalOpen(true);
  };

  const handleCloseGitHubAuthModal = () => {
    setIsGitHubAuthModalOpen(false);
  };

  const value = {
    isBugIndexModalOpen,
    bugIndexModalKey,
    actionType,
    handleOpenBugIndexModal,
    handleCloseBugIndexModal,
    isGitHubAuthModalOpen,
    handleOpenGitHubAuthModal,
    handleCloseGitHubAuthModal
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
}; 
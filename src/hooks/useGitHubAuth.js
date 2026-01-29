'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useModal } from '@/context/ModalContext';

export const useGitHubAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { isGitHubAuthModalOpen, handleOpenGitHubAuthModal, handleCloseGitHubAuthModal } = useModal();

  const hasGitHubAccess = user !==null && user?.githubAccessToken;
  const needsGitHubAuth = isAuthenticated && !hasGitHubAccess;
  useEffect(() => {
    if (needsGitHubAuth && !isGitHubAuthModalOpen) {
      // Small delay to ensure the component is mounted
      const timer = setTimeout(() => {
        handleOpenGitHubAuthModal();
      }, 1000);

      return () => clearTimeout(timer);
    } else if (!needsGitHubAuth && isGitHubAuthModalOpen) {
      handleCloseGitHubAuthModal();
    }
  }, [needsGitHubAuth, isGitHubAuthModalOpen, handleOpenGitHubAuthModal, handleCloseGitHubAuthModal]);

  return {
    hasGitHubAccess,
    needsGitHubAuth,
    isModalOpen: isGitHubAuthModalOpen,
    closeModal: handleCloseGitHubAuthModal
  };
};

'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { usePathname, useRouter } from 'next/navigation';

const publicRoutes = ['/signin', '/signup'];

export const useAuth = () => {
  const { isAuthenticated, user, isRehydrated } = useSelector((state) => state.auth);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only perform redirects after rehydration is complete
    if (!isRehydrated) return;
    
    const isPublic = publicRoutes.includes(pathname);

    // If user is not authenticated and on a private route, redirect to signin
    if (!isAuthenticated && !isPublic) {
      router.push('/signin');
    }

    // If user is authenticated and on a public route, redirect to dashboard/home
    if (isAuthenticated && isPublic) {
      router.push('/');
    }
  }, []);

  const isAuthPage = publicRoutes.includes(pathname);

  return { 
    isAuthenticated, 
    user, 
    isAuthPage, 
    isLoading: !isRehydrated, // Show loading until rehydration is complete
    isRehydrated 
  };
}; 
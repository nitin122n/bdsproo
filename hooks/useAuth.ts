'use client';

import { useState, useEffect } from 'react';
import { User, signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Use environment variable or current origin for API URL
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || window.location.origin;
      window.location.href = `${apiUrl}/api/auth/google`;
      
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (auth) {
        await firebaseSignOut(auth);
        toast.success('Signed out successfully');
      }
    } catch (error: any) {
      console.error('Sign-out error:', error);
      toast.error('Failed to sign out');
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };
};

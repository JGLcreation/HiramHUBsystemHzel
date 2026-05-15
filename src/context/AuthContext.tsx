import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { storage } from '../services/storage';

interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('hiramhub_session');
    if (savedUser) {
      const userProfile = JSON.parse(savedUser);
      setProfile(userProfile);
    }
    setLoading(false);
  }, []);

  const isAdmin = profile?.role === 'admin' || profile?.email === 'jaysongeronlozada@gmail.com';

  return (
    <AuthContext.Provider value={{ user: profile, profile, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

import { createContext, useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [correctPassword, setCorrectPassword] = useState('123456');

  useEffect(() => {
    const fetchPassword = async () => {
      const docRef = doc(db, 'settings', 'adminPassword');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCorrectPassword(docSnap.data().value);
      }
    };
    fetchPassword();
  }, []);

  const login = (password) => {
    if (password === correctPassword) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  const updatePassword = async (newPassword) => {
    await setDoc(doc(db, 'settings', 'adminPassword'), {
      value: newPassword
    });
    setCorrectPassword(newPassword);
  };

  return (
    <AuthContext.Provider 
      value={{ isAuthenticated, login, logout, correctPassword, updatePassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};
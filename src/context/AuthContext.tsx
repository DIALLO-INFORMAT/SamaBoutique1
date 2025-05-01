// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'customer' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (name: string, email: string, password: string, role?: UserRole) => Promise<User>;
  logout: () => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

const AUTH_STORAGE_KEY = 'sama_boutique_auth';
const USERS_STORAGE_KEY = 'users'; // Key for storing all users (for simulation)

// --- Mock User Database (localStorage) ---
const initializeMockDB = () => {
  if (typeof window !== 'undefined') {
    if (!localStorage.getItem(USERS_STORAGE_KEY)) {
      const defaultAdmin: User = {
        id: 'admin-default',
        name: "Admin SamaBoutique",
        email: "samaboutique@gmail.com",
        // WARNING: Storing plain text passwords is INSECURE. This is for simulation ONLY.
        // In a real app, hash passwords server-side.
        password: "Passer@123", // STORE HASHED PASSWORD IN REAL APP
        role: "admin",
        createdAt: new Date()
      };
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify([defaultAdmin]));
    }
  }
};

initializeMockDB();

const getUserByEmail = (email: string): (User & { password?: string }) | null => {
    if (typeof window === 'undefined') return null;
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users: (User & { password?: string })[] = storedUsers ? JSON.parse(storedUsers) : [];
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

const addUserToDB = (newUser: User & { password?: string }) => {
    if (typeof window === 'undefined') return;
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const users: (User & { password?: string })[] = storedUsers ? JSON.parse(storedUsers) : [];
    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

const updateUserInDB = (userId: string, updates: Partial<User>) => {
     if (typeof window === 'undefined') return;
    const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    let users: (User & { password?: string })[] = storedUsers ? JSON.parse(storedUsers) : [];
     users = users.map(u => u.id === userId ? { ...u, ...updates } : u);
     localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

const updateUserPasswordInDB = (email: string, newPassword: string) => {
     if (typeof window === 'undefined') return;
     const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
     let users: (User & { password?: string })[] = storedUsers ? JSON.parse(storedUsers) : [];
      users = users.map(u => u.email.toLowerCase() === email.toLowerCase() ? { ...u, password: newPassword } : u); // STORE HASHED PASSWORD
     localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

// --- AuthProvider Component ---
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load authenticated user from localStorage on initial mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
      if (storedAuth) {
        try {
          const authData = JSON.parse(storedAuth);
          // Basic validation: check if essential fields exist
          if (authData && authData.id && authData.email && authData.role) {
             // Re-fetch user data from "DB" to ensure consistency (optional but good practice)
             const dbUser = getUserByEmail(authData.email);
             if (dbUser) {
                 const { password, ...userToSet } = dbUser; // Exclude password
                 setUser(userToSet);
             } else {
                  // User in auth storage but not DB? Clear auth storage.
                 localStorage.removeItem(AUTH_STORAGE_KEY);
             }
          } else {
             localStorage.removeItem(AUTH_STORAGE_KEY); // Clear invalid data
          }
        } catch (error) {
          console.error("Failed to parse auth data from localStorage:", error);
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      }
      setIsLoading(false);
    }
  }, []);

  // --- Authentication Functions ---

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const foundUser = getUserByEmail(email);

        // WARNING: Comparing plain text passwords. INSECURE. Use hashing in real apps.
        if (!foundUser || foundUser.password !== password) {
            throw new Error("Email ou mot de passe incorrect.");
        }

        const { password: _, ...userToAuth } = foundUser; // Exclude password before setting state/storage

        setUser(userToAuth);
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToAuth));
        }
        return userToAuth;
    } catch (error) {
        console.error("Login error:", error);
        throw error; // Re-throw error to be caught by the caller
    } finally {
        setIsLoading(false);
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole = 'customer'): Promise<User> => {
    setIsLoading(true);
    try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 700));

        if (getUserByEmail(email)) {
            throw new Error("Cet email est déjà utilisé.");
        }

        // Basic role validation (more robust validation should be server-side)
        const allowedRoles: UserRole[] = ['admin', 'manager', 'customer'];
        if (!allowedRoles.includes(role)) {
            throw new Error("Rôle invalide sélectionné.");
        }

        // WARNING: Storing plain password. Hash on server in real app.
        const newUser: User & { password?: string } = {
            id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, // Simple unique ID
            name,
            email,
            password, // STORE HASHED PASSWORD IN REAL APP
            role,
            createdAt: new Date(),
        };

        addUserToDB(newUser);

        const { password: _, ...userToReturn } = newUser; // Exclude password from return value
        // Optionally log in the user immediately after signup
        // setUser(userToReturn);
        // localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToReturn));

        return userToReturn;
    } catch (error) {
        console.error("Signup error:", error);
        throw error; // Re-throw error
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
    // Optionally redirect here or let the calling component handle it
  };

   const updateUserProfile = async (userId: string, updates: Partial<User>) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
            // In real app: await fetch(`/api/users/${userId}`, { method: 'PATCH', body: JSON.stringify(updates) });
            updateUserInDB(userId, updates);
            // Update context state if the updated user is the current user
            if (user && user.id === userId) {
                 const updatedUser = { ...user, ...updates };
                 setUser(updatedUser);
                 localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
            }
        } catch (error) {
            console.error("Update profile error:", error);
            throw error;
        } finally {
             setIsLoading(false);
        }
   };

    const changePassword = async (email: string, currentPassword: string, newPassword: string) => {
        setIsLoading(true);
         try {
            await new Promise(resolve => setTimeout(resolve, 600)); // Simulate API delay
            const userToUpdate = getUserByEmail(email);

            if (!userToUpdate) {
                throw new Error("Utilisateur non trouvé.");
            }
             // WARNING: Plain text comparison - INSECURE
            if (userToUpdate.password !== currentPassword) {
                throw new Error("Incorrect current password"); // Specific error message
            }
            // WARNING: Plain text comparison - INSECURE
             if (currentPassword === newPassword) {
                 throw new Error("New password must be different from the current password.");
             }

             // In real app: await fetch(`/api/users/change-password`, { method: 'POST', body: JSON.stringify({ email, currentPassword, newPassword }) });
             updateUserPasswordInDB(email, newPassword); // Update with new (ideally hashed) password

         } catch (error) {
             console.error("Change password error:", error);
             throw error;
         } finally {
              setIsLoading(false);
         }
    };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserProfile, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

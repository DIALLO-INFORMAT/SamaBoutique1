// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export type UserRole = 'admin' | 'manager' | 'customer' | 'guest';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string; // Add optional phone number
  role: UserRole;
  createdAt: Date;
}

// Define the shape of the user object stored in localStorage (including password hash)
interface StoredUser extends User {
    password?: string; // Hashed password (INSECURE plain text in this simulation)
}


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (emailOrPhone: string, password: string) => Promise<User>; // Updated parameter name
  signup: (name: string, email: string, password: string, phone?: string, role?: UserRole) => Promise<User>; // Added phone
  logout: () => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => Promise<void>;
  changePassword: (email: string, currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (userId: string) => Promise<void>; // Added resetPassword function
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
      const defaultAdmin: StoredUser = {
        id: 'admin-default',
        name: "Admin SamaBoutique",
        email: "samaboutique@gmail.com",
        phone: "+221771234567", // Example phone
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

// Helper function to get all stored users
const getAllStoredUsers = (): StoredUser[] => {
     if (typeof window === 'undefined') return [];
     const storedUsers = localStorage.getItem(USERS_STORAGE_KEY);
     return storedUsers ? JSON.parse(storedUsers) : [];
}

// Helper function to save all users back to storage
const saveAllStoredUsers = (users: StoredUser[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}


const getUserByEmail = (email: string): StoredUser | null => {
    const users = getAllStoredUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase()) || null;
};

const getUserByPhone = (phone: string): StoredUser | null => {
    const users = getAllStoredUsers();
    // Basic normalization (remove spaces, dashes) - adapt if needed
    const normalizedPhone = phone.replace(/[\s-]+/g, '');
    return users.find(u => u.phone?.replace(/[\s-]+/g, '') === normalizedPhone) || null;
}

const addUserToDB = (newUser: StoredUser) => {
    const users = getAllStoredUsers();
    users.push(newUser);
    saveAllStoredUsers(users);
};

const updateUserInDB = (userId: string, updates: Partial<User>) => {
     let users = getAllStoredUsers();
     users = users.map(u => u.id === userId ? { ...u, ...updates } : u);
     saveAllStoredUsers(users);
}

const updateUserPasswordInDB = (userId: string, newPassword: string) => {
      let users = getAllStoredUsers();
      users = users.map(u => u.id === userId ? { ...u, password: newPassword } : u); // STORE HASHED PASSWORD
      saveAllStoredUsers(users);
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
          if (authData && authData.id && authData.email && authData.role) {
             const dbUser = getUserByEmail(authData.email); // Check DB consistency
             if (dbUser) {
                 const { password, ...userToSet } = dbUser; // Exclude password
                 setUser(userToSet);
             } else {
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

  const login = async (emailOrPhone: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 500));

        let foundUser: StoredUser | null = null;
        // Check if input looks like an email
        if (emailOrPhone.includes('@')) {
            foundUser = getUserByEmail(emailOrPhone);
        } else {
            // Assume it's a phone number
            foundUser = getUserByPhone(emailOrPhone);
        }

        if (!foundUser || foundUser.password !== password) {
            throw new Error("Email/Téléphone ou mot de passe incorrect."); // Updated error message
        }

        const { password: _, ...userToAuth } = foundUser;

        setUser(userToAuth);
        if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userToAuth));
        }
        return userToAuth;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

   const signup = async (name: string, email: string, password: string, phone?: string, role: UserRole = 'customer'): Promise<User> => {
    setIsLoading(true);
    try {
        await new Promise(resolve => setTimeout(resolve, 700));

        if (getUserByEmail(email)) {
            throw new Error("Cet email est déjà utilisé.");
        }
        // Optional: Add check if phone number is already used
        if (phone && getUserByPhone(phone)) {
             throw new Error("Ce numéro de téléphone est déjà utilisé.");
        }

        const allowedRoles: UserRole[] = ['admin', 'manager', 'customer'];
        if (!allowedRoles.includes(role)) {
            throw new Error("Rôle invalide sélectionné.");
        }

        const newUser: StoredUser = {
            id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            name,
            email,
            phone: phone || undefined, // Store phone if provided
            password, // STORE HASHED PASSWORD IN REAL APP
            role,
            createdAt: new Date(),
        };

        addUserToDB(newUser);

        const { password: _, ...userToReturn } = newUser;

        return userToReturn;
    } catch (error) {
        console.error("Signup error:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

   const updateUserProfile = async (userId: string, updates: Partial<User>) => {
        setIsLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 300));
            // Add validation if phone number is being updated (check uniqueness)
            if (updates.phone) {
                const existingUser = getUserByPhone(updates.phone);
                if (existingUser && existingUser.id !== userId) {
                     throw new Error("Ce numéro de téléphone est déjà utilisé par un autre compte.");
                }
            }
            updateUserInDB(userId, updates);
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
            await new Promise(resolve => setTimeout(resolve, 600));
            const userToUpdate = getUserByEmail(email);

            if (!userToUpdate) {
                throw new Error("Utilisateur non trouvé.");
            }
            if (userToUpdate.password !== currentPassword) {
                throw new Error("Incorrect current password");
            }
             if (currentPassword === newPassword) {
                 throw new Error("New password must be different from the current password.");
             }

             updateUserPasswordInDB(userToUpdate.id, newPassword); // Update using ID

         } catch (error) {
             console.error("Change password error:", error);
             throw error;
         } finally {
              setIsLoading(false);
         }
    };

    // Function for Admin to reset a user's password
    const resetPassword = async (userId: string): Promise<void> => {
        // Check if the current user is an admin
        if (user?.role !== 'admin') {
            throw new Error("Action non autorisée. Seuls les administrateurs peuvent réinitialiser les mots de passe.");
        }

        setIsLoading(true); // Consider a different loading state like 'isResetting' if needed
        try {
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

            // In a real app, call an API: await fetch(`/api/admin/users/${userId}/reset-password`, { method: 'POST' });
            // Simulation: Set a default password
            const defaultPassword = "password123"; // Define a default password for reset
            updateUserPasswordInDB(userId, defaultPassword); // Update the password in our mock DB

            console.log(`Password for user ${userId} reset to '${defaultPassword}'`);
            // NOTE: In a real app, you'd likely trigger an email to the user, not expose the password.

        } catch (error) {
            console.error(`Password reset error for user ${userId}:`, error);
            throw error; // Re-throw to be caught by the calling component
        } finally {
            setIsLoading(false);
        }
    };


  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout, updateUserProfile, changePassword, resetPassword }}>
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

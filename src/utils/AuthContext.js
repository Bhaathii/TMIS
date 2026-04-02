import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence, } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
const AuthContext = createContext(undefined);
export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    useEffect(() => {
        setPersistence(auth, browserLocalPersistence).then(() => {
            const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
                try {
                    if (firebaseUser) {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
                            if (userDoc.exists()) {
                                const userData = userDoc.data();
                                const role = (userData.role || 'viewer').trim().toLowerCase();
                                setCurrentUser({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    displayName: firebaseUser.displayName || undefined,
                                    role: role,
                                    createdAt: new Date(),
                                });
                            }
                            else {
                                // User document doesn't exist, create it with role based on email
                                const emailLower = firebaseUser.email?.toLowerCase() || '';
                                let role = 'viewer';
                                if (emailLower.includes('admin')) {
                                    role = 'admin';
                                }
                                else if (emailLower.includes('editor')) {
                                    role = 'editor';
                                }
                                // Create user document with determined role
                                await setDoc(doc(db, 'users', firebaseUser.uid), {
                                    email: firebaseUser.email,
                                    role: role,
                                    createdAt: new Date(),
                                });
                                setCurrentUser({
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email || '',
                                    displayName: firebaseUser.displayName || undefined,
                                    role: role,
                                    createdAt: new Date(),
                                });
                            }
                        }
                        catch (firestoreErr) {
                            // Firestore read failed, but user is authenticated - allow access with default role
                            console.warn('Could not read/create user document:', firestoreErr);
                            setCurrentUser({
                                uid: firebaseUser.uid,
                                email: firebaseUser.email || '',
                                displayName: firebaseUser.displayName || undefined,
                                role: 'viewer',
                                createdAt: new Date(),
                            });
                        }
                    }
                    else {
                        setCurrentUser(null);
                    }
                    setError(null);
                }
                catch (err) {
                    console.error('Auth state change error:', err);
                    setError(err instanceof Error ? err.message : 'Authentication error');
                }
                finally {
                    setLoading(false);
                }
            });
            return unsubscribe;
        }).catch(err => {
            console.error('Persistence error:', err);
            setLoading(false);
        });
    }, []);
    const login = async (email, password) => {
        try {
            setError(null);
            await signInWithEmailAndPassword(auth, email, password);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Login failed';
            setError(errorMessage);
            throw err;
        }
    };
    const logout = async () => {
        try {
            setError(null);
            await signOut(auth);
            setCurrentUser(null);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Logout failed';
            setError(errorMessage);
            throw err;
        }
    };
    const isAdmin = () => currentUser?.role?.trim().toLowerCase() === 'admin';
    const isEditor = () => currentUser?.role?.trim().toLowerCase() === 'editor';
    const isViewer = () => currentUser?.role?.trim().toLowerCase() === 'viewer';
    const canEdit = () => isAdmin() || isEditor();
    const canDelete = () => isAdmin();
    const value = {
        currentUser,
        loading,
        error,
        login,
        logout,
        isAdmin,
        isEditor,
        isViewer,
        canEdit,
        canDelete,
    };
    return _jsx(AuthContext.Provider, { value: value, children: children });
};
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

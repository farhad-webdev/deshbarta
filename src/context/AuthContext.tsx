import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  where,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, validateFirestoreConnection } from '../lib/firebase';

export interface BookmarkItem {
  id: string;
  userId: string;
  articleId: string;
  articleTitle: string;
  articleImage: string;
  category: string;
  publisher: string;
  savedAt: string;
}

export interface CommentItem {
  id: string;
  articleId: string;
  userId: string;
  userName: string;
  userPhoto: string;
  text: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  bookmarks: BookmarkItem[];
  addBookmark: (article: any) => Promise<void>;
  removeBookmark: (articleId: string) => Promise<void>;
  isBookmarked: (articleId: string) => boolean;
  addComment: (articleId: string, text: string) => Promise<void>;
  fetchComments: (articleId: string) => Promise<CommentItem[]>;
  sendFeedback: (message: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  useEffect(() => {
    validateFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Sync user profile in Firestore
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName || 'পাঠক',
            email: currentUser.email || '',
            photoURL: currentUser.photoURL || '',
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (err) {
          console.warn('Could not sync user profile:', err);
        }

        // Listen for bookmarks subcollection
        const bookmarksRef = collection(db, 'users', currentUser.uid, 'bookmarks');
        const unsubBookmarks = onSnapshot(
          bookmarksRef,
          (snapshot) => {
            const list: BookmarkItem[] = [];
            snapshot.forEach((docSnap) => {
              list.push(docSnap.data() as BookmarkItem);
            });
            setBookmarks(list);
          },
          (error) => {
            handleFirestoreError(error, OperationType.GET, `users/${currentUser.uid}/bookmarks`);
          }
        );

        setLoading(false);
        return () => unsubBookmarks();
      } else {
        setBookmarks([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error('Sign in error:', err);
      alert('গুগল দিয়ে লগইন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const isBookmarked = (articleId: string): boolean => {
    return bookmarks.some((b) => b.articleId === articleId);
  };

  const addBookmark = async (article: any) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    const sanitizedArticleId = (article.id || `art-${Date.now()}`).replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100);
    const bookmarkDocId = `bm-${sanitizedArticleId}`;
    const path = `users/${user.uid}/bookmarks/${bookmarkDocId}`;

    try {
      const bRef = doc(db, 'users', user.uid, 'bookmarks', bookmarkDocId);
      const payload: BookmarkItem = {
        id: bookmarkDocId,
        userId: user.uid,
        articleId: article.id || sanitizedArticleId,
        articleTitle: (article.title || 'সংবাদ শিরোনাম').slice(0, 500),
        articleImage: (article.image || '').slice(0, 1000),
        category: (article.category || 'সংবাদ').slice(0, 100),
        publisher: (article.publisherBengali || article.publisherName || 'দেশবার্তা').slice(0, 100),
        savedAt: new Date().toISOString(),
      };
      await setDoc(bRef, payload);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const removeBookmark = async (articleId: string) => {
    if (!user) return;
    const sanitizedArticleId = articleId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 100);
    const bookmarkDocId = `bm-${sanitizedArticleId}`;
    const path = `users/${user.uid}/bookmarks/${bookmarkDocId}`;

    try {
      const bRef = doc(db, 'users', user.uid, 'bookmarks', bookmarkDocId);
      await deleteDoc(bRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const addComment = async (articleId: string, text: string) => {
    if (!user) {
      await signInWithGoogle();
      return;
    }
    if (!text.trim()) return;

    const sanitizedDocId = `c-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const path = `comments/${sanitizedDocId}`;

    try {
      const cRef = doc(db, 'comments', sanitizedDocId);
      await setDoc(cRef, {
        id: sanitizedDocId,
        articleId: articleId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 200),
        userId: user.uid,
        userName: user.displayName || 'পাঠক',
        userPhoto: user.photoURL || '',
        text: text.trim().slice(0, 950),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const fetchComments = async (articleId: string): Promise<CommentItem[]> => {
    const cleanArtId = articleId.replace(/[^a-zA-Z0-9_\-]/g, '_').slice(0, 200);
    const path = 'comments';
    try {
      const q = query(collection(db, 'comments'), where('articleId', '==', cleanArtId));
      const snap = await getDocs(q);
      const list: CommentItem[] = [];
      snap.forEach((d) => {
        list.push(d.data() as CommentItem);
      });
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
      return [];
    }
  };

  const sendFeedback = async (message: string) => {
    if (!message.trim()) return;
    const sanitizedDocId = `fb-${Date.now()}`;
    const path = `feedback/${sanitizedDocId}`;

    try {
      const fRef = doc(db, 'feedback', sanitizedDocId);
      await setDoc(fRef, {
        id: sanitizedDocId,
        userId: user ? user.uid : 'anonymous',
        userName: user ? (user.displayName || 'পাঠক') : 'বেনামী',
        email: user ? (user.email || '') : '',
        message: message.trim().slice(0, 1900),
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signOutUser,
        bookmarks,
        addBookmark,
        removeBookmark,
        isBookmarked,
        addComment,
        fetchComments,
        sendFeedback
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  username: string;
  role: string;
  profile?: {
    firstName: string;
    lastName: string;
    nationalId: string;
  };
}

interface UserState {
  // Rehydration state
  _hasHydrated: boolean;

  // Admin user state
  adminUser: User | null;
  adminToken: string | null;

  // Store admin user state
  storeUser: User | null;
  storeToken: string | null;

  // Regular user state
  user: User | null;
  token: string | null;

  // Actions
  setAdminUser: (user: User | null, token: string | null) => void;
  setStoreUser: (user: User | null, token: string | null) => void;
  setUser: (user: User | null, token: string | null) => void;

  // Logout actions
  logoutAdmin: () => void;
  logoutStore: () => void;
  logoutUser: () => void;

  // Get current user based on route
  getCurrentUser: () => { user: User | null; token: string | null };

  // Set hydration state
  setHasHydrated: (hasHydrated: boolean) => void;

  // Get user full name
  getUserFullName: () => string | null;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // Initial state
      _hasHydrated: false,
      adminUser: null,
      adminToken: null,
      storeUser: null,
      storeToken: null,
      user: null,
      token: null,

      //   get user full name
      getUserFullName: () => {
        if (get().adminUser) {
          return `${get().adminUser?.profile?.firstName} ${get().adminUser?.profile?.lastName}`;
        } else if (get().storeUser) {
          return `${get().storeUser?.profile?.firstName} ${get().storeUser?.profile?.lastName}`;
        } else {
          return get().user?.username!;
        }
      },

      // Set admin user
      setAdminUser: (user, token) => {
        set({ adminUser: user, adminToken: token });
        // Also update localStorage for backward compatibility
        if (user && token) {
          localStorage.setItem("adminUser", JSON.stringify(user));
          localStorage.setItem("adminToken", token);
        }
      },

      // Set store admin user
      setStoreUser: (user, token) => {
        set({ storeUser: user, storeToken: token });
        // Also update localStorage for backward compatibility
        if (user && token) {
          localStorage.setItem("storeUser", JSON.stringify(user));
          localStorage.setItem("storeToken", token);
        }
      },

      // Set regular user
      setUser: (user, token) => {
        set({ user, token });
        // Also update localStorage for backward compatibility
        if (user && token) {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("token", token);
        }
      },

      // Logout admin
      logoutAdmin: () => {
        set({ adminUser: null, adminToken: null });
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminToken");
      },

      // Logout store admin
      logoutStore: () => {
        set({ storeUser: null, storeToken: null });
        localStorage.removeItem("storeUser");
        localStorage.removeItem("storeToken");
      },

      // Logout regular user
      logoutUser: () => {
        set({ user: null, token: null });
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      },

      // Get current user based on route
      getCurrentUser: () => {
        if (typeof window === "undefined") {
          return { user: null, token: null };
        }

        const pathname = window.location.pathname;

        if (pathname.startsWith("/admin")) {
          return { user: get().adminUser, token: get().adminToken };
        } else if (pathname.startsWith("/storeAdmin")) {
          return { user: get().storeUser, token: get().storeToken };
        } else {
          return { user: get().user, token: get().token };
        }
      },

      // Set hydration state
      setHasHydrated: (hasHydrated) => {
        set({ _hasHydrated: hasHydrated });
      },
    }),
    {
      name: "user-storage", // unique name for localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        adminUser: state.adminUser,
        adminToken: state.adminToken,
        storeUser: state.storeUser,
        storeToken: state.storeToken,
        user: state.user,
        token: state.token,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Error rehydrating storage:", error);
        } else {
          // Set hydration state to true when rehydration is complete
          state?.setHasHydrated(true);
        }
      },
      version: 1,
      migrate: (persistedState, version) => {
        if (version === 1) {
          return persistedState;
        }
        return persistedState;
      },
    }
  )
);

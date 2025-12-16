// lib/db.ts

export type User = {
  id: string;
  email: string;
  name: string | null;
  emailNotifications: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: string;
  userId: string;
  surah: number;
  startAyah: number;
  endAyah: number;
  startPage: number | null;
  endPage: number | null;
  date: Date;
  duration: number | null;
};

export type Goal = {
  id: string;
  userId: string;
  type: string;
  targetAmount: number | null;
  deadline: Date | null;
  status: string;
  lastNotificationSent: Date | null;
  notificationCount: number;
  createdAt: Date;
};

// Mock Data Store
let users: User[] = [];
let sessions: Session[] = [];
let goals: Goal[] = [];

// Helper to save to localStorage
const saveToStorage = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('qp_users', JSON.stringify(users));
    localStorage.setItem('qp_sessions', JSON.stringify(sessions));
    localStorage.setItem('qp_goals', JSON.stringify(goals));
  }
};

// Helper to load from localStorage
const loadFromStorage = () => {
  if (typeof window !== 'undefined') {
    const storedUsers = localStorage.getItem('qp_users');
    const storedSessions = localStorage.getItem('qp_sessions');
    const storedGoals = localStorage.getItem('qp_goals');

    if (storedUsers) users = JSON.parse(storedUsers);
    if (storedSessions) sessions = JSON.parse(storedSessions);
    if (storedGoals) goals = JSON.parse(storedGoals);
  }
};

// Initialize
loadFromStorage();

export const db = {
  user: {
    findUnique: async ({ where }: { where: { email: string } }) => {
      loadFromStorage(); // Ensure fresh data
      return users.find((u) => u.email === where.email) || null;
    },
    create: async ({ data }: { data: any }) => {
      const newUser = {
        ...data,
        id: Math.random().toString(36).substring(7),
        emailNotifications: data.emailNotifications ?? false,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.push(newUser);
      saveToStorage();
      return newUser;
    },
    findMany: async ({ where }: { where: any }) => {
      loadFromStorage();
      if (!where || Object.keys(where).length === 0) {
        return users;
      }
      return users.filter((u) => {
        return Object.keys(where).every((key) => (u as any)[key] === where[key]);
      });
    },
  },
  session: {
    create: async ({ data }: { data: any }) => {
      const newSession = { ...data, id: Math.random().toString(36).substring(7), date: new Date() };
      sessions.push(newSession);
      saveToStorage();
      return newSession;
    },
    findMany: async ({ where }: { where: any }) => {
      loadFromStorage();
      return sessions.filter((s) => s.userId === where.userId);
    },
  },
  goal: {
    create: async ({ data }: { data: any }) => {
      const newGoal = {
        ...data,
        id: Math.random().toString(36).substring(7),
        lastNotificationSent: data.lastNotificationSent ?? null,
        notificationCount: data.notificationCount ?? 0,
        createdAt: new Date()
      };
      goals.push(newGoal);
      saveToStorage();
      return newGoal;
    },
    findMany: async ({ where }: { where: any }) => {
      loadFromStorage();
      return goals.filter((g) => g.userId === where.userId);
    },
    findFirst: async ({ where }: { where: any }) => {
      loadFromStorage();
      return goals.find((g) => g.userId === where.userId && g.type === where.type) || null;
    },
    update: async ({ where, data }: { where: any; data: any }) => {
      loadFromStorage();
      const index = goals.findIndex((g) => g.id === where.id);
      if (index !== -1) {
        goals[index] = { ...goals[index], ...data };
        saveToStorage();
        return goals[index];
      }
      return null;
    },
    delete: async ({ where }: { where: any }) => {
      loadFromStorage();
      const index = goals.findIndex((g) => g.id === where.id);
      if (index !== -1) {
        goals.splice(index, 1);
        saveToStorage();
        return true;
      }
      return false;
    },
  },
};

export type AuthProvider = 'Google' | 'Facebook';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  provider?: AuthProvider;
  avatar: string;
}

export type UserRole = 'owner' | 'editor' | 'viewer';

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface Label {
  id: string;
  text: string;
  color: string; // Tailwind color class or hex
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description: string;
  assignee?: Participant;
  signee: Participant; // Creator / Assignor
  deadline?: string;
  labels: Label[];
  position: number; // Order index within column
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  title: string;
  position: number;
}

export interface Board {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  participants: Participant[];
  createdAt: string;
}

export type OrderingStrategy = 'fractional' | 'integer_reindex';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  provider?: string;
}

export interface Card {
  id: string;
  columnId: string;
  title: string;
  description?: string;
  position: string;
  labels: string[];
  assigneeId?: string;
  assigneeName?: string;
  assigneeAvatar?: string;
  deadline?: string;
  createdAt: string;
}

export interface Column {
  id: string;
  boardId: string;
  name: string;
  position: string;
  wipLimit?: number | null;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  columns: Column[];
  cards: Card[];
}

import { Board, Column, Card, Participant } from '../types';

export const GUEST_USER: Participant = {
  id: 'usr-guest',
  name: 'Гість',
  email: 'guest@local',
  avatar: 'https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff',
  role: 'owner',
};

export const INITIAL_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'Моя Канбан Дошка',
    description: 'Простір для вашої особистої та командної роботи',
    ownerId: 'usr-guest',
    participants: [
      {
        id: 'usr-guest',
        name: 'Гість',
        email: 'guest@local',
        avatar: 'https://ui-avatars.com/api/?name=Guest&background=6366f1&color=fff',
        role: 'owner',
      },
    ],
    createdAt: new Date().toISOString().split('T')[0],
  },
];

export const INITIAL_COLUMNS: Column[] = [
  { id: 'col-1', boardId: 'board-1', title: 'To Do (Заплановано)', position: 1 },
  { id: 'col-2', boardId: 'board-1', title: 'In Progress (В роботі)', position: 2 },
  { id: 'col-3', boardId: 'board-1', title: 'Review (Перевірка)', position: 3 },
  { id: 'col-4', boardId: 'board-1', title: 'Done (Завершено)', position: 4 },
];

export const INITIAL_CARDS: Card[] = [
  {
    id: 'card-1',
    columnId: 'col-1',
    title: 'Ласкаво просимо до вашої дошки!',
    description: 'Натисніть на картку, щоб змінити назву, опис, виконавця чи дедлайн.',
    assignee: undefined,
    signee: GUEST_USER,
    deadline: '',
    labels: [
      { id: 'l1', text: 'Порада', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
    ],
    position: 1.0,
    createdAt: new Date().toISOString().split('T')[0],
  },
  {
    id: 'card-2',
    columnId: 'col-2',
    title: 'Додайте нових учасників до дошки',
    description: 'Відкрийте кнопку "Учасники" зверху та введіть будь-яке ім\'я та email, щоб призначити ролі (Owner, Editor, Viewer).',
    assignee: GUEST_USER,
    signee: GUEST_USER,
    deadline: '',
    labels: [
      { id: 'l2', text: 'Команда', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
    ],
    position: 1.0,
    createdAt: new Date().toISOString().split('T')[0],
  },
];

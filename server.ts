import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });
const PORT = 3000;

app.use(express.json());

// Прості демо-дані в пам’яті
let boards = [
  {
    id: 'b1',
    name: 'Q4 Product Roadmap',
    description: 'Основна дошка розробки продукту',
    columns: [
      { id: 'c1', boardId: 'b1', name: 'Backlog', position: 'a', wipLimit: null },
      { id: 'c2', boardId: 'b1', name: 'In Progress', position: 'b', wipLimit: 3 },
      { id: 'c3', boardId: 'b1', name: 'Done', position: 'c', wipLimit: null }
    ],
    cards: [
      {
        id: 'k1',
        columnId: 'c2',
        title: 'Авторизація через OAuth',
        description: 'Додати підтримку входу через Google та Facebook',
        position: 'a',
        labels: ['Auth', 'Urgent'],
        assigneeName: 'Олександр',
        createdAt: new Date().toISOString()
      }
    ]
  }
];

// REST API Ендпоінти
app.get('/api/boards', (req, res) => {
  res.json(boards);
});

app.get('/api/boards/:id', (req, res) => {
  const board = boards.find(b => b.id === req.params.id);
  if (!board) return res.status(404).json({ error: 'Дошку не знайдено' });
  res.json(board);
});

// Перевірка та оновлення WIP ліміту при переміщенні картки
app.put('/api/cards/:id/move', (req, res) => {
  const { targetColumnId } = req.body;
  const board = boards[0];
  const col = board.columns.find(c => c.id === targetColumnId);

  if (col && col.wipLimit) {
    const cardsInCol = board.cards.filter(c => c.columnId === targetColumnId);
    if (cardsInCol.length >= col.wipLimit) {
      return res.status(400).json({
        error: 'WIP_LIMIT_EXCEEDED',
        message: `Колонка "${col.name}" перевищує дозволений WIP-ліміт (${col.wipLimit})!`
      });
    }
  }

  const card = board.cards.find(c => c.id === req.params.id);
  if (card) {
    card.columnId = targetColumnId;
  }
  
  // Сповіщаємо всіх клієнтів по WebSockets
  broadcast({ type: 'CARD_MOVED', cardId: req.params.id, targetColumnId });
  res.json({ success: true });
});

// WebSocket трансляція змін
function broadcast(data: any) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Підключення Vite Middleware у розробці
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Сервер запущено на http://localhost:${PORT}`);
  });
}

start();
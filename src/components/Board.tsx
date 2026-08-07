import React, { useState } from 'react';
import {
  Plus,
  Users,
  HelpCircle,
  FolderPlus,
  Layout,
  Crown,
  Shield,
  Trash2,
  List,
  SlidersHorizontal,
} from 'lucide-react';
import { Board, Column, Card, Participant, OrderingStrategy, UserRole } from '../types';
import {
  INITIAL_BOARDS,
  INITIAL_COLUMNS,
  INITIAL_CARDS,
  GUEST_USER,
} from '../data/mockData';
import { calculatePosition, reindexColumnCards } from '../utils/positioning';
import ColumnComponent from './ColumnComponent';
import CardModal from './CardModal';
import ParticipantModal from './ParticipantModal';

interface BoardProps {
  currentUser?: Participant;
}

export default function BoardView({ currentUser = GUEST_USER }: BoardProps) {
  // Main state
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string>(INITIAL_BOARDS[0].id);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [orderingStrategy, setOrderingStrategy] = useState<OrderingStrategy>('fractional');

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isDefenseModalOpen, setIsDefenseModalOpen] = useState(false);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);

  // New board inputs
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [newBoardDesc, setNewBoardDesc] = useState('');

  // Drag state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);

  // Active board object
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  // User participant object on active board
  const activeUserParticipant =
    activeBoard?.participants.find((p) => p.email === currentUser.email) || {
      ...currentUser,
      role: (activeBoard?.ownerId === currentUser.id ? 'owner' : 'editor') as UserRole,
    };

  const userRole = activeUserParticipant.role;
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

  // Filter columns and cards for active board
  const activeColumns = columns
    .filter((col) => col.boardId === activeBoard.id)
    .sort((a, b) => a.position - b.position);

  // Board creation
  const handleCreateBoard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title: newBoardTitle.trim(),
      description: newBoardDesc.trim(),
      ownerId: currentUser.id,
      participants: [{ ...currentUser, role: 'owner' }],
      createdAt: new Date().toISOString().split('T')[0],
    };

    // Default columns for new board
    const defaultCols: Column[] = [
      { id: `col-${Date.now()}-1`, boardId: newBoard.id, title: 'Заплановано', position: 1 },
      { id: `col-${Date.now()}-2`, boardId: newBoard.id, title: 'В роботі', position: 2 },
      { id: `col-${Date.now()}-3`, boardId: newBoard.id, title: 'Готово', position: 3 },
    ];

    setBoards([...boards, newBoard]);
    setColumns([...columns, ...defaultCols]);
    setActiveBoardId(newBoard.id);
    setNewBoardTitle('');
    setNewBoardDesc('');
    setIsNewBoardModalOpen(false);
  };

  // Delete Board
  const handleDeleteBoard = () => {
    if (boards.length <= 1) {
      alert('Не можна видалити останню дошку!');
      return;
    }
    if (confirm(`Ви дійсно хочете видалити дошку "${activeBoard.title}"?`)) {
      const remainingBoards = boards.filter((b) => b.id !== activeBoard.id);
      setBoards(remainingBoards);
      setActiveBoardId(remainingBoards[0].id);
    }
  };

  // Add Column
  const handleAddColumn = () => {
    const title = prompt('Введіть назву нової колонки:');
    if (!title || !title.trim()) return;

    const maxPos = activeColumns.reduce((max, c) => Math.max(max, c.position), 0);
    const newCol: Column = {
      id: `col-${Date.now()}`,
      boardId: activeBoard.id,
      title: title.trim(),
      position: maxPos + 1,
    };

    setColumns([...columns, newCol]);
  };

  // Rename Column
  const handleRenameColumn = (columnId: string, newTitle: string) => {
    setColumns(
      columns.map((c) => (c.id === columnId ? { ...c, title: newTitle } : c))
    );
  };

  // Delete Column
  const handleDeleteColumn = (columnId: string) => {
    setColumns(columns.filter((c) => c.id !== columnId));
    setCards(cards.filter((card) => card.columnId !== columnId));
  };

  // Card Save / Create / Edit
  const handleSaveCard = (cardData: Omit<Card, 'id' | 'createdAt'> & { id?: string }) => {
    if (cardData.id) {
      // Edit
      setCards(
        cards.map((c) =>
          c.id === cardData.id
            ? { ...c, ...cardData }
            : c
        )
      );
    } else {
      // Create new
      const colCards = cards.filter((c) => c.columnId === cardData.columnId);
      const maxPos = colCards.reduce((max, c) => Math.max(max, c.position), 0);

      const newCard: Card = {
        ...cardData,
        id: `card-${Date.now()}`,
        position: maxPos + 1.0,
        createdAt: new Date().toISOString().split('T')[0],
      };

      setCards([...cards, newCard]);
    }
  };

  // Delete Card
  const handleDeleteCard = (cardId: string) => {
    setCards(cards.filter((c) => c.id !== cardId));
  };

  // Drag and drop handlers
  const handleDragStartCard = (e: React.DragEvent, card: Card) => {
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', card.id);
  };

  const handleDragOverCard = (e: React.DragEvent, hoverCard: Card) => {
    e.preventDefault();
  };

  const handleDropCardOnColumn = (e: React.DragEvent, destColumnId: string) => {
    e.preventDefault();
    if (!draggedCardId) return;

    const cardToMove = cards.find((c) => c.id === draggedCardId);
    if (!cardToMove) return;

    // Target column's current sorted cards
    const destCards = cards
      .filter((c) => c.columnId === destColumnId && c.id !== draggedCardId)
      .sort((a, b) => a.position - b.position);

    const prevPos = destCards.length > 0 ? destCards[destCards.length - 1].position : null;
    const { newPos, requiresReindex } = calculatePosition(
      prevPos,
      null,
      orderingStrategy
    );

    let updatedCardList = cards.map((c) =>
      c.id === draggedCardId
        ? { ...c, columnId: destColumnId, position: newPos }
        : c
    );

    if (requiresReindex) {
      const colCards = updatedCardList.filter((c) => c.columnId === destColumnId);
      const normalized = reindexColumnCards(colCards);
      updatedCardList = updatedCardList.map((c) => {
        const found = normalized.find((nc) => nc.id === c.id);
        return found || c;
      });
    }

    setCards(updatedCardList);
    setDraggedCardId(null);
  };

  // Normalize all column positions
  const handleNormalizeAll = () => {
    let normalizedAll = [...cards];
    activeColumns.forEach((col) => {
      const colCards = normalizedAll.filter((c) => c.columnId === col.id);
      const normalized = reindexColumnCards(colCards);
      normalizedAll = normalizedAll.map((c) => {
        const found = normalized.find((nc) => nc.id === c.id);
        return found || c;
      });
    });
    setCards(normalizedAll);
    alert('Усі позиції карток успішно скинуто до цілих чисел 1, 2, 3...!');
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-70px)] p-4 sm:p-6 max-w-[1600px] mx-auto w-full gap-6">
      {/* Top Board Toolbar */}
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        {/* Board Switcher & Title */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-indigo-400" />
            <select
              value={activeBoardId}
              onChange={(e) => setActiveBoardId(e.target.value)}
              className="bg-slate-950 text-white font-bold text-sm sm:text-base border border-slate-700 rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer shadow-inner"
            >
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setIsNewBoardModalOpen(true)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
            title="Створити нову дошку"
          >
            <FolderPlus className="w-4 h-4 text-indigo-400" />
            <span className="hidden sm:inline">Нова дошка</span>
          </button>

          {/* User Role Badge */}
          <div
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 text-xs rounded-lg border border-slate-700 text-slate-300"
            title={`Ваші права на цієї дошці: ${userRole}`}
          >
            {isOwner ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span className="capitalize font-semibold">{userRole}</span>
          </div>
        </div>

        {/* Board Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Participants Button */}
          <button
            onClick={() => setIsParticipantModalOpen(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Учасники ({activeBoard.participants.length})</span>
          </button>

          {/* Delete Board (Owner only) */}
          {isOwner && (
            <button
              onClick={handleDeleteBoard}
              className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition"
              title="Видалити дошку"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Board Description Banner */}
      {activeBoard.description && (
        <div className="px-4 py-2 bg-slate-900/40 border border-slate-800/80 rounded-xl text-xs text-slate-400 flex justify-between items-center">
          <span>{activeBoard.description}</span>
          <span className="text-[10px] text-slate-500">
            Створено: {activeBoard.createdAt}
          </span>
        </div>
      )}

      {/* Kanban Columns Canvas Area */}
      <div className="flex-1 overflow-x-auto pb-6 pt-2 flex items-start gap-4 scrollbar-thin">
        {activeColumns.map((col) => {
          const colCards = cards.filter((c) => c.columnId === col.id);
          return (
            <ColumnComponent
              key={col.id}
              column={col}
              cards={colCards}
              onRenameColumn={handleRenameColumn}
              onDeleteColumn={handleDeleteColumn}
              onAddCardClick={(cId) => {
                setTargetColumnId(cId);
                setEditingCard(null);
                setIsCardModalOpen(true);
              }}
              onEditCardClick={(card) => {
                setEditingCard(card);
                setTargetColumnId(card.columnId);
                setIsCardModalOpen(true);
              }}
              onDragStartCard={handleDragStartCard}
              onDragOverCard={handleDragOverCard}
              onDropCardOnColumn={handleDropCardOnColumn}
              canEdit={canEdit}
            />
          );
        })}

        {/* Add Column Button */}
        {canEdit && (
          <button
            onClick={handleAddColumn}
            className="w-72 shrink-0 h-32 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-300 font-semibold text-xs gap-2 transition"
          >
            <Plus className="w-6 h-6 p-1 bg-slate-800 rounded-lg text-indigo-400" />
            Додати нову колонку
          </button>
        )}
      </div>

      {/* Modals */}
      <CardModal
        isOpen={isCardModalOpen}
        onClose={() => setIsCardModalOpen(false)}
        card={editingCard}
        columnId={targetColumnId}
        columns={activeColumns}
        participants={activeBoard.participants}
        currentParticipant={activeUserParticipant}
        onSaveCard={handleSaveCard}
        onDeleteCard={handleDeleteCard}
        canEdit={canEdit}
      />

      <ParticipantModal
        isOpen={isParticipantModalOpen}
        onClose={() => setIsParticipantModalOpen(false)}
        board={activeBoard}
        currentUserId={currentUser.id}
        onUpdateParticipants={(updatedParticipants) => {
          const updatedBoards = boards.map((b) =>
            b.id === activeBoard.id ? { ...b, participants: updatedParticipants } : b
          );
          setBoards(updatedBoards);
        }}
      />

      {/* New Board Modal */}
      {isNewBoardModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Створити нову дошку</h3>
            <form onSubmit={handleCreateBoard} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Назва дошки *
                </label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="Наприклад: Мобільний додаток"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Короткий опис
                </label>
                <input
                  type="text"
                  value={newBoardDesc}
                  onChange={(e) => setNewBoardDesc(e.target.value)}
                  placeholder="Про що ця дошка..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewBoardModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
                >
                  Скасувати
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold"
                >
                  Створити
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

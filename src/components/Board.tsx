import React, { useState } from 'react';
import {
  Plus,
  Users,
  FolderPlus,
  Layout,
  Crown,
  Shield,
  Trash2,
  X,
  Check,
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
import NewBoardModal from './NewBoardModal';

interface BoardProps {
  currentUser?: Participant;
}

export default function BoardView({ currentUser = GUEST_USER }: BoardProps) {
  // Main state
  const [boards, setBoards] = useState<Board[]>(INITIAL_BOARDS);
  const [activeBoardId, setActiveBoardId] = useState<string>(INITIAL_BOARDS[0].id);
  const [columns, setColumns] = useState<Column[]>(INITIAL_COLUMNS);
  const [cards, setCards] = useState<Card[]>(INITIAL_CARDS);
  const [orderingStrategy] = useState<OrderingStrategy>('fractional');

  // Modals state
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [targetColumnId, setTargetColumnId] = useState<string>('');

  const [isParticipantModalOpen, setIsParticipantModalOpen] = useState(false);
  const [isNewBoardModalOpen, setIsNewBoardModalOpen] = useState(false);

  // Inline New Column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  // Drag state
  const [draggedCardId, setDraggedCardId] = useState<string | null>(null);
  const [hoverCardId, setHoverCardId] = useState<string | null>(null);
  const [hoverPosition, setHoverPosition] = useState<'above' | 'below'>('below');

  // Active board object
  const activeBoard = boards.find((b) => b.id === activeBoardId) || boards[0];

  // User participant object on active board
  const activeUserParticipant =
    activeBoard?.participants.find((p) => p.email === currentUser.email) || {
      ...currentUser,
      // Non-participants on board default to viewer for security
      role: (activeBoard?.ownerId === currentUser.id ? 'owner' : 'viewer') as UserRole,
    };

  const userRole = activeUserParticipant.role;
  const canEdit = userRole === 'owner' || userRole === 'editor';
  const isOwner = userRole === 'owner';

  // Filter columns for active board
  const activeColumns = columns
    .filter((col) => col.boardId === activeBoard.id)
    .sort((a, b) => a.position - b.position);

  // Board creation
  const handleCreateBoard = (title: string, description: string) => {
    const newBoard: Board = {
      id: `board-${Date.now()}`,
      title,
      description,
      ownerId: currentUser.id,
      participants: [{ ...currentUser, role: 'owner' }],
      createdAt: new Date().toISOString().split('T')[0],
    };

    const defaultCols: Column[] = [
      { id: `col-${Date.now()}-1`, boardId: newBoard.id, title: 'Заплановано', position: 1 },
      { id: `col-${Date.now()}-2`, boardId: newBoard.id, title: 'В роботі', position: 2 },
      { id: `col-${Date.now()}-3`, boardId: newBoard.id, title: 'Готово', position: 3 },
    ];

    setBoards([...boards, newBoard]);
    setColumns([...columns, ...defaultCols]);
    setActiveBoardId(newBoard.id);
  };

  // Delete Board with cascade cleanup (columns and cards)
  const handleDeleteBoard = () => {
    if (boards.length <= 1) {
      alert('Не можна видалити останню дошку!');
      return;
    }
    if (confirm(`Ви дійсно хочете видалити дошку "${activeBoard.title}"?`)) {
      const boardColIds = columns.filter((c) => c.boardId === activeBoard.id).map((c) => c.id);

      // Clean up columns and cards
      setColumns((prev) => prev.filter((c) => c.boardId !== activeBoard.id));
      setCards((prev) => prev.filter((card) => !boardColIds.includes(card.columnId)));

      const remainingBoards = boards.filter((b) => b.id !== activeBoard.id);
      setBoards(remainingBoards);
      setActiveBoardId(remainingBoards[0].id);
    }
  };

  // Add Column
  const handleAddColumnSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;

    const maxPos = activeColumns.reduce((max, c) => Math.max(max, c.position), 0);
    const newCol: Column = {
      id: `col-${Date.now()}`,
      boardId: activeBoard.id,
      title: newColumnTitle.trim(),
      position: maxPos + 1,
    };

    setColumns([...columns, newCol]);
    setNewColumnTitle('');
    setIsAddingColumn(false);
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
      setCards(
        cards.map((c) => (c.id === cardData.id ? { ...c, ...cardData } : c))
      );
    } else {
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

  // Participant Removed Cascade Handler
  const handleParticipantRemoved = (participantId: string) => {
    setCards((prevCards) =>
      prevCards.map((card) => ({
        ...card,
        assignee: card.assignee?.id === participantId ? undefined : card.assignee,
      }))
    );
  };

  // Drag and drop handlers
  const handleDragStartCard = (e: React.DragEvent, card: Card) => {
    setDraggedCardId(card.id);
    e.dataTransfer.setData('text/plain', card.id);
  };

  const handleDragOverCard = (e: React.DragEvent, hoverCard: Card) => {
    e.preventDefault();
    if (hoverCard.id === draggedCardId) return;

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const placement = e.clientY < midY ? 'above' : 'below';

    setHoverCardId(hoverCard.id);
    setHoverPosition(placement);
  };

  const handleDropCardOnColumn = (e: React.DragEvent, destColumnId: string) => {
    e.preventDefault();
    if (!draggedCardId) return;

    const cardToMove = cards.find((c) => c.id === draggedCardId);
    if (!cardToMove) return;

    // Destination column cards excluding the moved card
    const destCards = cards
      .filter((c) => c.columnId === destColumnId && c.id !== draggedCardId)
      .sort((a, b) => a.position - b.position);

    let prevPos: number | null = null;
    let nextPos: number | null = null;

    if (hoverCardId && destCards.some((c) => c.id === hoverCardId)) {
      const hoverIndex = destCards.findIndex((c) => c.id === hoverCardId);
      if (hoverIndex !== -1) {
        if (hoverPosition === 'above') {
          prevPos = hoverIndex > 0 ? destCards[hoverIndex - 1].position : null;
          nextPos = destCards[hoverIndex].position;
        } else {
          prevPos = destCards[hoverIndex].position;
          nextPos = hoverIndex < destCards.length - 1 ? destCards[hoverIndex + 1].position : null;
        }
      }
    } else {
      // Default drop at the bottom of column
      prevPos = destCards.length > 0 ? destCards[destCards.length - 1].position : null;
      nextPos = null;
    }

    const { newPos, requiresReindex } = calculatePosition(
      prevPos,
      nextPos,
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
    setHoverCardId(null);
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
            title={`Ваші права на цій дошці: ${userRole}`}
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

        {/* Add Column Button / Form */}
        {canEdit && (
          <div className="w-72 shrink-0">
            {isAddingColumn ? (
              <form
                onSubmit={handleAddColumnSubmit}
                className="p-3 bg-slate-900 border border-indigo-500/50 rounded-2xl space-y-2 shadow-xl"
              >
                <input
                  type="text"
                  placeholder="Назва колонки..."
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  autoFocus
                  required
                />
                <div className="flex items-center gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="p-1.5 text-slate-400 hover:bg-slate-800 rounded-lg text-xs"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Додати
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="w-full h-32 border-2 border-dashed border-slate-800 hover:border-indigo-500/50 bg-slate-900/30 hover:bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center text-slate-400 hover:text-indigo-300 font-semibold text-xs gap-2 transition cursor-pointer"
              >
                <Plus className="w-6 h-6 p-1 bg-slate-800 rounded-lg text-indigo-400" />
                Додати нову колонку
              </button>
            )}
          </div>
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
        onParticipantRemoved={handleParticipantRemoved}
      />

      <NewBoardModal
        isOpen={isNewBoardModalOpen}
        onClose={() => setIsNewBoardModalOpen(false)}
        onCreateBoard={handleCreateBoard}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X, Layers } from 'lucide-react';
import { Column, Card } from '../types';
import CardComponent from './CardComponent';

interface ColumnComponentProps {
  column: Column;
  cards: Card[];
  onRenameColumn: (columnId: string, newTitle: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onAddCardClick: (columnId: string) => void;
  onEditCardClick: (card: Card) => void;
  onDragStartCard: (e: React.DragEvent, card: Card) => void;
  onDragOverCard: (e: React.DragEvent, card: Card) => void;
  onDropCardOnColumn: (e: React.DragEvent, columnId: string) => void;
  canEdit: boolean;
}

export default function ColumnComponent({
  column,
  cards,
  onRenameColumn,
  onDeleteColumn,
  onAddCardClick,
  onEditCardClick,
  onDragStartCard,
  onDragOverCard,
  onDropCardOnColumn,
  canEdit,
}: ColumnComponentProps) {
  // Hooks MUST be called at the top level before any conditional return (Rules of Hooks)
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(column?.title || '');
  const [isDragOverColumn, setIsDragOverColumn] = useState(false);

  if (!column) return null;

  const sortedCards = [...cards].sort((a, b) => a.position - b.position);

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== column.title) {
      onRenameColumn(column.id, titleInput.trim());
    }
    setIsEditingTitle(false);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverColumn(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear highlight if leaving the column container itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOverColumn(false);
    }
  };

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={(e) => {
        e.preventDefault();
        if (!isDragOverColumn) setIsDragOverColumn(true);
      }}
      onDragLeave={handleDragLeave}
      onDrop={(e) => {
        setIsDragOverColumn(false);
        onDropCardOnColumn(e, column.id);
      }}
      className={`w-72 md:w-80 shrink-0 bg-slate-900/60 border ${
        isDragOverColumn ? 'border-indigo-500 ring-2 ring-indigo-500/20 bg-indigo-950/20' : 'border-slate-800'
      } rounded-2xl flex flex-col max-h-full transition-all duration-200 shadow-xl`}
    >
      {/* Column Header */}
      <div className="p-3.5 border-b border-slate-800/80 flex items-center justify-between gap-2 bg-slate-900/80 rounded-t-2xl">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-1 w-full">
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full px-2 py-1 bg-slate-950 border border-indigo-500 rounded text-xs text-white focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
              />
              <button
                onClick={handleSaveTitle}
                className="p-1 text-emerald-400 hover:bg-slate-800 rounded transition"
                title="Зберегти"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="p-1 text-slate-400 hover:bg-slate-800 rounded transition"
                title="Скасувати"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h3 className="text-xs font-bold text-slate-200 truncate uppercase tracking-wider">
                {column.title}
              </h3>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-slate-800 text-indigo-300 rounded-full border border-slate-700/80">
                {cards.length}
              </span>
            </div>
          )}
        </div>

        {canEdit && !isEditingTitle && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => {
                setTitleInput(column.title);
                setIsEditingTitle(true);
              }}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Перейменувати колонку"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                if (confirm(`Видалити колонку "${column.title}" та її картки?`)) {
                  onDeleteColumn(column.id);
                }
              }}
              className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              title="Видалити колонку"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Cards List Body */}
      <div className="p-3 overflow-y-auto space-y-2.5 flex-1 min-h-[150px]">
        {sortedCards.map((card) => (
          <CardComponent
            key={card.id}
            card={card}
            onEdit={onEditCardClick}
            onDragStart={onDragStartCard}
            onDragOver={onDragOverCard}
            canEdit={canEdit}
          />
        ))}

        {sortedCards.length === 0 && (
          <div className="h-28 border-2 border-dashed border-slate-800/80 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs">
            <Layers className="w-5 h-5 mb-1 opacity-40" />
            <span>Перетягніть картку сюди</span>
          </div>
        )}
      </div>

      {/* Column Footer: Add Card Button */}
      {canEdit && (
        <div className="p-2.5 border-t border-slate-800/80 bg-slate-900/40 rounded-b-2xl">
          <button
            onClick={() => onAddCardClick(column.id)}
            className="w-full py-2 bg-slate-800/80 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700/50 hover:border-indigo-500/30"
          >
            <Plus className="w-4 h-4" /> Додати картку
          </button>
        </div>
      )}
    </div>
  );
}

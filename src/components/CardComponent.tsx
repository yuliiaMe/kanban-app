import React from 'react';
import { GripVertical, Calendar, Hash, Edit2, User } from 'lucide-react';
import { Card } from '../types';

interface CardComponentProps {
  card: Card;
  onEdit: (card: Card) => void;
  onDragStart: (e: React.DragEvent, card: Card) => void;
  onDragOver: (e: React.DragEvent, card: Card) => void;
  canEdit: boolean;
}

export default function CardComponent({
  card,
  onEdit,
  onDragStart,
  onDragOver,
  canEdit,
}: CardComponentProps) {
  if (!card) return null;

  // Check if deadline is today or past
  const isOverdue = card.deadline ? new Date(card.deadline) < new Date() : false;

  return (
    <div
      draggable={canEdit}
      onDragStart={(e) => onDragStart(e, card)}
      onDragOver={(e) => onDragOver(e, card)}
      className={`group relative p-3.5 bg-slate-900/90 hover:bg-slate-900 border border-slate-700/70 hover:border-indigo-500/50 rounded-xl shadow-md hover:shadow-xl transition-all duration-200 cursor-grab active:cursor-grabbing select-none ${
        canEdit ? 'hover:-translate-y-0.5' : ''
      }`}
    >
      {/* Top Bar: Labels & Position & Drag Handle */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-1 items-center max-w-[75%]">
          {(card.labels || []).map((label) => (
            <span
              key={label.id}
              className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${label.color}`}
            >
              {label.text}
            </span>
          ))}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Position Index Badge */}
          <span
            className="inline-flex items-center gap-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded border border-slate-700/80"
            title={`Позиційне число у колонці: ${card.position ?? 1}`}
          >
            <Hash className="w-2.5 h-2.5" />
            {typeof card.position === 'number'
              ? Number.isInteger(card.position)
                ? card.position
                : card.position.toFixed(2)
              : 1}
          </span>

          {canEdit && (
            <div className="text-slate-600 group-hover:text-slate-400 transition">
              <GripVertical className="w-4 h-4" />
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <h4 className="text-xs font-bold text-slate-100 group-hover:text-white leading-snug mb-1">
        {card.title}
      </h4>

      {/* Description Snippet */}
      {card.description && (
        <p className="text-[11px] text-slate-400 line-clamp-2 mb-3 leading-relaxed">
          {card.description}
        </p>
      )}

      {/* Bottom Bar: Assignee, Signee, Deadline, Edit button */}
      <div className="pt-2 mt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* Assignee Avatar */}
          {card.assignee ? (
            <div className="flex items-center gap-1" title={`Виконавець: ${card.assignee.name}`}>
              <img
                src={card.assignee.avatar}
                alt={card.assignee.name}
                className="w-5 h-5 rounded-full object-cover border border-slate-600"
              />
              <span className="text-[10px] text-slate-300 max-w-[80px] truncate">
                {card.assignee.name.split(' ')[0]}
              </span>
            </div>
          ) : (
            <span className="text-[10px] text-slate-500 italic flex items-center gap-1">
              <User className="w-3 h-3" /> Без виконавця
            </span>
          )}

          {/* Signee Avatar (Creator) */}
          {card.signee && (
            <div
              className="text-[10px] text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded border border-slate-800"
              title={`Автор / Хто призначив: ${card.signee.name}`}
            >
              від {card.signee.name.split(' ')[0]}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Deadline */}
          {card.deadline && (
            <div
              className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded font-medium ${
                isOverdue
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}
              title={`Дедлайн: ${card.deadline}`}
            >
              <Calendar className="w-3 h-3" />
              <span>{card.deadline.slice(5)}</span>
            </div>
          )}

          {/* Quick Edit button */}
          <button
            onClick={() => onEdit(card)}
            className="p-1 rounded text-slate-500 hover:text-white hover:bg-slate-800 transition"
            title="Переглянути / Редагувати"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
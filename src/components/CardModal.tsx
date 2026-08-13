import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Tag, AlignLeft, Hash, Plus, Trash2, CheckCircle } from 'lucide-react';
import { Card, Column, Participant, Label } from '../types';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card?: Card | null; // Null if creating new card
  columnId: string;
  columns: Column[];
  participants: Participant[];
  currentParticipant: Participant;
  onSaveCard: (cardData: Omit<Card, 'id' | 'createdAt'> & { id?: string }) => void;
  onDeleteCard?: (cardId: string) => void;
  canEdit: boolean;
}

const PRESET_COLORS = [
  { name: 'Indigo', class: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' },
  { name: 'Emerald', class: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
  { name: 'Rose', class: 'bg-rose-500/20 text-rose-300 border-rose-500/30' },
  { name: 'Amber', class: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
  { name: 'Cyan', class: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
  { name: 'Purple', class: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
];

export default function CardModal({
  isOpen,
  onClose,
  card,
  columnId,
  columns,
  participants,
  currentParticipant,
  onSaveCard,
  onDeleteCard,
  canEdit,
}: CardModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetColumnId, setTargetColumnId] = useState(columnId);
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [signeeId, setSigneeId] = useState<string>('');
  const [deadline, setDeadline] = useState('');
  const [position, setPosition] = useState<number>(1.0);
  const [labels, setLabels] = useState<Label[]>([]);
  const [newLabelText, setNewLabelText] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].class);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description);
      setTargetColumnId(card.columnId);
      setAssigneeId(card.assignee?.id || '');
      setSigneeId(card.signee?.id || currentParticipant.id);
      setDeadline(card.deadline || '');
      setPosition(card.position);
      setLabels(card.labels || []);
    } else {
      setTitle('');
      setDescription('');
      setTargetColumnId(columnId);
      setAssigneeId(currentParticipant.id);
      setSigneeId(currentParticipant.id);
      setDeadline('');
      setPosition(1.0);
      setLabels([]);
    }
  }, [card, columnId, currentParticipant.id, isOpen]);

  if (!isOpen) return null;

  const handleAddLabel = () => {
    if (!newLabelText.trim()) return;
    const newLabel: Label = {
      id: `lbl-${Date.now()}`,
      text: newLabelText.trim(),
      color: selectedColor,
    };
    setLabels([...labels, newLabel]);
    setNewLabelText('');
  };

  const handleRemoveLabel = (id: string) => {
    setLabels(labels.filter(l => l.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const selectedAssignee = participants.find(p => p.id === assigneeId);
    const selectedSignee = participants.find(p => p.id === signeeId) || currentParticipant;

    onSaveCard({
      ...(card?.id ? { id: card.id } : {}),
      columnId: targetColumnId,
      title: title.trim(),
      description: description.trim(),
      assignee: selectedAssignee,
      signee: selectedSignee,
      deadline: deadline || undefined,
      labels,
      position: Number(position) || 1.0,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">
            {card ? 'Редагувати картку' : 'Створити нову картку'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Заголовок картки *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: Написати документацію кнопок"
              disabled={!canEdit}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-400" /> Опис
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Додайте детальний опис завдання..."
              disabled={!canEdit}
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Grid layout for Assignee, Signee, Column, Deadline, Position */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Column selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Колонка
              </label>
              <select
                value={targetColumnId}
                onChange={(e) => setTargetColumnId(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {columns.map(col => (
                  <option key={col.id} value={col.id}>{col.title}</option>
                ))}
              </select>
            </div>

            {/* Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-indigo-400" /> Позиція (Position index)
              </label>
              <input
                type="number"
                step="any"
                value={position}
                onChange={(e) => setPosition(parseFloat(e.target.value) || 1)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-indigo-300 font-mono font-bold focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Assignee (Виконавець) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" /> Виконавець (Assignee)
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="">-- Не призначено --</option>
                {participants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Signee (Хто призначив / Створив) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-purple-400" /> Хто створив (Signee)
              </label>
              <select
                value={signeeId}
                onChange={(e) => setSigneeId(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                {participants.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Deadline */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Дедлайн (Deadline)
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={!canEdit}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Labels Section */}
          <div className="space-y-2 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" /> Мітки / Теги (Labels)
            </label>

            {/* Existing Labels */}
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {labels.map(l => (
                <span
                  key={l.id}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${l.color}`}
                >
                  {l.text}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLabel(l.id)}
                      className="hover:text-rose-400 transition ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}
              {labels.length === 0 && (
                <span className="text-xs text-slate-500 italic">Немає міток</span>
              )}
            </div>

            {/* Add Label Form */}
            {canEdit && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Новий тег..."
                  value={newLabelText}
                  onChange={(e) => setNewLabelText(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <div className="flex items-center gap-1">
                  {PRESET_COLORS.map((c, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedColor(c.class)}
                      className={`w-5 h-5 rounded-full border border-white/20 transition ${
                        c.class.split(' ')[0]
                      } ${selectedColor === c.class ? 'ring-2 ring-indigo-400 scale-110' : 'opacity-70'}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddLabel}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Тег
                </button>
              </div>
            )}
          </div>

          {/* Footer controls */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            {card && onDeleteCard && canEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Ви дійсно бажаєте видалити цю картку?')) {
                    onDeleteCard(card.id);
                    onClose();
                  }
                }}
                className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition border border-rose-500/20"
              >
                <Trash2 className="w-4 h-4" /> Видалити
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
              >
                Скасувати
              </button>
              {canEdit && (
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition shadow-lg shadow-indigo-500/20 flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4" /> Зберегти
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
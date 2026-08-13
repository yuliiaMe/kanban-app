import React, { useState } from 'react';
import { X, UserPlus, Shield, UserX, Crown, Edit3, Eye, Check } from 'lucide-react';
import { Board, Participant, UserRole } from '../types';

interface ParticipantModalProps {
  isOpen: boolean;
  onClose: () => void;
  board: Board;
  currentUserId: string;
  onUpdateParticipants: (participants: Participant[]) => void;
}

export default function ParticipantModal({
  isOpen,
  onClose,
  board,
  currentUserId,
  onUpdateParticipants,
}: ParticipantModalProps) {
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('editor');

  if (!isOpen) return null;

  const isOwner = board.ownerId === currentUserId || board.participants.find(p => p.id === currentUserId)?.role === 'owner';

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    const newParticipant: Participant = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newName.trim())}&background=6366f1&color=fff`,
      role: newRole,
    };

    onUpdateParticipants([...board.participants, newParticipant]);
    setNewName('');
    setNewEmail('');
  };

  const handleRoleChange = (participantId: string, role: UserRole) => {
    const updated = board.participants.map(p =>
      p.id === participantId ? { ...p, role } : p
    );
    onUpdateParticipants(updated);
  };

  const handleRemoveParticipant = (participantId: string) => {
    const updated = board.participants.filter(p => p.id !== participantId);
    onUpdateParticipants(updated);
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-3.5 h-3.5 text-amber-400" />;
      case 'editor':
        return <Edit3 className="w-3.5 h-3.5 text-indigo-400" />;
      case 'viewer':
        return <Eye className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'owner':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
      case 'editor':
        return 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20';
      case 'viewer':
        return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-white">Учасники та Ролі Дошки</h2>
              <p className="text-xs text-slate-400">{board.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          {/* Add Participant Form (Owners only) */}
          {isOwner && (
            <form onSubmit={handleAddParticipant} className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-indigo-400" /> Додати нового учасника
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Ім'я"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>
              <div className="flex items-center gap-2 justify-between pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Роль:</span>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as UserRole)}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="editor">Editor (Редактор)</option>
                    <option value="viewer">Viewer (Спостерігач)</option>
                    <option value="owner">Owner (Власник)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition"
                >
                  Додати
                </button>
              </div>
            </form>
          )}

          {/* Current Members List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Список учасників ({board.participants.length})
            </h3>
            <div className="space-y-2">
              {board.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/60 flex items-center justify-between gap-3 transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={participant.avatar}
                      alt={participant.name}
                      className="w-9 h-9 rounded-full object-cover border border-slate-600 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                        {participant.name}
                        {participant.id === currentUserId && (
                          <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded font-normal">
                            Ви
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">{participant.email}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Role selector or badge */}
                    {isOwner && participant.id !== board.ownerId ? (
                      <select
                        value={participant.role}
                        onChange={(e) => handleRoleChange(participant.id, e.target.value as UserRole)}
                        className="px-2 py-1 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        <option value="owner">Owner</option>
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full border ${getRoleBadge(
                          participant.role
                        )}`}
                      >
                        {getRoleIcon(participant.role)}
                        <span className="capitalize">{participant.role}</span>
                      </span>
                    )}

                    {/* Remove button */}
                    {isOwner && participant.id !== board.ownerId && (
                      <button
                        onClick={() => handleRemoveParticipant(participant.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-700 rounded-lg transition"
                        title="Видалити з дошки"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition"
          >
            Закрити
          </button>
        </div>
      </div>
    </div>
  );
}

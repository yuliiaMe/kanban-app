import React, { useState, useEffect } from 'react';
import { Board } from './types';

export default function App() {
  const [board, setBoard] = useState<Board | null>(null);
  const [wipError, setWipError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/boards/b1')
      .then(res => res.json())
      .then(data => setBoard(data))
      .catch(console.error);
  }, []);

  const moveCard = async (cardId: string, targetColumnId: string) => {
    const res = await fetch(`/api/cards/${cardId}/move`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetColumnId })
    });

    const data = await res.json();
    if (!res.ok) {
      setWipError(data.message);
    } else {
      setWipError(null);
      // Оновлюємо стан локально
      setBoard(prev => {
        if (!prev) return null;
        return {
          ...prev,
          cards: prev.cards.map(c => c.id === cardId ? { ...c, columnId: targetColumnId } : c)
        };
      });
    }
  };

  if (!board) return <div className="p-8 text-center text-slate-400">Завантаження...</div>;

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-200 p-6">
      <header className="mb-6 flex items-center justify-between border-b border-white/10 pb-4">
        <h1 className="text-xl font-bold text-white">{board.name}</h1>
        <p className="text-xs text-slate-400">{board.description}</p>
      </header>

      {wipError && (
        <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-semibold">
          ⚠️ {wipError}
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {board.columns.map(col => {
          const colCards = board.cards.filter(c => c.columnId === col.id);
          const isOverWip = col.wipLimit && colCards.length >= col.wipLimit;

          return (
            <div
              key={col.id}
              className={`w-80 shrink-0 bg-[#0F1115] border rounded-2xl p-4 flex flex-col ${
                isOverWip ? 'border-rose-500/40 bg-rose-950/10' : 'border-white/5'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-xs uppercase text-slate-300">{col.name}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {colCards.length} {col.wipLimit ? `/ ${col.wipLimit}` : ''}
                </span>
              </div>

              <div className="space-y-3 flex-1">
                {colCards.map(card => (
                  <div
                    key={card.id}
                    className="bg-[#161920] border border-white/5 p-4 rounded-xl shadow-md hover:border-blue-500/40 transition-colors"
                  >
                    <h4 className="font-semibold text-sm text-white mb-1">{card.title}</h4>
                    <p className="text-xs text-slate-400 mb-3">{card.description}</p>
                    
                    {/* Кнопка швидкого переміщення */}
                    <div className="flex gap-1 pt-2 border-t border-white/5">
                      {board.columns.filter(c => c.id !== col.id).map(targetCol => (
                        <button
                          key={targetCol.id}
                          onClick={() => moveCard(card.id, targetCol.id)}
                          className="text-[10px] px-2 py-1 bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white rounded-md transition-colors"
                        >
                          → {targetCol.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
import React from 'react';
import { LayoutDashboard } from 'lucide-react';

export default function Board() {
  return (
    <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="border border-white/20 bg-white/5 backdrop-blur-sm rounded-2xl h-[70vh] flex flex-col items-center justify-center text-white/50 shadow-2xl">
        <LayoutDashboard size={64} className="mb-4 opacity-50" />
        <p className="text-lg font-medium">Тут буде дошка із завданнями</p>
        <p className="text-sm mt-2 opacity-60">(Колаборативний простір)</p>
      </div>
    </main>
  );
}

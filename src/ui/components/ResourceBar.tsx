import React from 'react';
import type { GameState, Season } from '../../engine/types';
import { Coins, Wheat, Trees, Mountain, Hammer, Zap, Calendar } from 'lucide-react';

interface ResourceBarProps {
  state: GameState;
}

const SEASON_NAMES: Record<Season, { name: string; icon: string; color: string }> = {
  spring: { name: 'Printemps', icon: '🌱', color: 'text-green-700' },
  summer: { name: 'Été', icon: '☀️', color: 'text-amber-600' },
  autumn: { name: 'Automne', icon: '🍂', color: 'text-orange-700' },
  winter: { name: 'Hiver', icon: '❄️', color: 'text-sky-700' },
};

export const ResourceBar: React.FC<ResourceBarProps> = ({ state }) => {
  const playerLord = state.lords[state.playerLordId];

  // Aggregate resources of player-owned provinces
  const playerProvinces = Object.values(state.provinces).filter(
    p => p.lordId === state.playerLordId
  );

  const totalFood = playerProvinces.reduce((sum, p) => sum + p.resources.food, 0);
  const totalWood = playerProvinces.reduce((sum, p) => sum + p.resources.wood, 0);
  const totalStone = playerProvinces.reduce((sum, p) => sum + p.resources.stone, 0);
  const totalIron = playerProvinces.reduce((sum, p) => sum + p.resources.iron, 0);

  const seasonInfo = SEASON_NAMES[state.season] ?? SEASON_NAMES.spring;

  const currentPA = playerLord?.actionPoints ?? 0;
  const paPercentage = Math.min(100, (currentPA / 40) * 100);

  return (
    <header className="bg-parchment-200 border-b-2 border-parchment-border px-4 py-2.5 shadow-sm text-iron-grey-900 select-none">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Realm Calendar */}
        <div className="flex items-center gap-3 bg-parchment-100 px-3 py-1 rounded border border-parchment-border">
          <Calendar className="w-4 h-4 text-royal-gold-700" />
          <span className="font-serif font-bold text-sm tracking-wide">
            Mois {state.month}
          </span>
          <span className="text-parchment-border">|</span>
          <span className={`text-xs font-serif font-semibold flex items-center gap-1 ${seasonInfo.color}`}>
            <span>{seasonInfo.icon}</span>
            <span>{seasonInfo.name}</span>
          </span>
        </div>

        {/* Resources Badges */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Gold */}
          <div
            className="flex items-center gap-1.5 bg-royal-gold-50/70 border border-royal-gold-400 px-2.5 py-1 rounded shadow-inner"
            title="Trésor royal en écus d'or"
          >
            <Coins className="w-4 h-4 text-royal-gold-600" />
            <span className="font-serif font-bold text-sm text-royal-gold-900">
              {playerLord?.gold.toLocaleString() ?? 0}
            </span>
            <span className="text-[10px] uppercase font-serif text-royal-gold-700">écus</span>
          </div>

          {/* Wheat / Food */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-parchment-300 transition-colors"
            title="Réserves de blé dans vos greniers (nourrit la population et l'armée)"
          >
            <Wheat className="w-4 h-4 text-amber-700" />
            <span className="font-serif font-bold text-sm">{totalFood.toLocaleString()}</span>
          </div>

          {/* Wood */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-parchment-300 transition-colors"
            title="Réserves de bois pour les constructions et engins"
          >
            <Trees className="w-4 h-4 text-emerald-800" />
            <span className="font-serif font-bold text-sm">{totalWood.toLocaleString()}</span>
          </div>

          {/* Stone */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-parchment-300 transition-colors"
            title="Réserves de pierre pour remparts et forteresses"
          >
            <Mountain className="w-4 h-4 text-stone-600" />
            <span className="font-serif font-bold text-sm">{totalStone.toLocaleString()}</span>
          </div>

          {/* Iron */}
          <div
            className="flex items-center gap-1.5 px-2 py-1 rounded hover:bg-parchment-300 transition-colors"
            title="Réserves de fer pour forger armes et armures"
          >
            <Hammer className="w-4 h-4 text-slate-700" />
            <span className="font-serif font-bold text-sm">{totalIron.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Points Gauge (Plafond 40 PA) */}
        <div
          className="flex items-center gap-2 bg-parchment-100 border border-parchment-border px-3 py-1 rounded min-w-[140px]"
          title="Points d'Action (PA). Vous gagnez +10 PA chaque mois (Plafond: 40 PA). Chaque décision tactique en consomme."
        >
          <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
          <div className="flex-1">
            <div className="flex justify-between items-center text-[10px] font-serif font-bold text-iron-grey-700 mb-0.5">
              <span>PA</span>
              <span>{currentPA} / 40</span>
            </div>
            <div className="w-full bg-parchment-300 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-royal-gold-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${paPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

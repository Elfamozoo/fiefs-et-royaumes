import React from 'react';
import type { GameState } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { HeraldicShield } from '../components/HeraldicShield';
import { Crown, Scroll } from 'lucide-react';

interface ThroneRoomViewProps {
  state: GameState;
  onNavigate: (tab: string) => void;
}

export const ThroneRoomView: React.FC<ThroneRoomViewProps> = ({ state, onNavigate }) => {
  const player = state.lords[state.playerLordId];

  const playerProvinces = Object.values(state.provinces).filter(
    p => p.lordId === state.playerLordId
  );
  const totalPopulation = playerProvinces.reduce((s, p) => s + p.population, 0);
  const averageMorale = playerProvinces.length > 0
    ? Math.round(playerProvinces.reduce((s, p) => s + p.morale, 0) / playerProvinces.length)
    : 0;

  const playerArmies = Object.values(state.armies).filter(
    a => a.lordId === state.playerLordId
  );
  const totalTroops = playerArmies.reduce(
    (s, a) => s + a.regiments.reduce((rs, r) => rs + r.count, 0),
    0
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Royal Banner & Lord Presentation */}
      <div className="bg-gradient-to-r from-royal-gold-100 via-parchment-100 to-royal-gold-100 border-2 border-royal-gold-500 rounded-lg p-6 shadow-md flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <HeraldicShield heraldry={player?.heraldry} size="lg" />
          <div>
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-royal-gold-600" />
              <h1 className="text-2xl font-serif font-bold text-iron-grey-900 tracking-wide">
                {player?.name ?? 'Monseigneur'}
              </h1>
            </div>
            <p className="text-sm font-serif text-iron-grey-600 mt-1">
              Souverain régnant sur {playerProvinces.length} fiefs des Terres de Kald
            </p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-parchment-light border border-parchment-border px-4 py-2 rounded text-center min-w-[100px]">
            <div className="text-xs font-serif text-iron-grey-600">Sujets</div>
            <div className="text-lg font-serif font-bold text-iron-grey-900">
              {totalPopulation.toLocaleString()}
            </div>
          </div>
          <div className="bg-parchment-light border border-parchment-border px-4 py-2 rounded text-center min-w-[100px]">
            <div className="text-xs font-serif text-iron-grey-600">Satisfaction</div>
            <div className={`text-lg font-serif font-bold ${averageMorale >= 70 ? 'text-emerald-700' : averageMorale >= 40 ? 'text-amber-700' : 'text-crimson-700'}`}>
              {averageMorale}%
            </div>
          </div>
          <div className="bg-parchment-light border border-parchment-border px-4 py-2 rounded text-center min-w-[100px]">
            <div className="text-xs font-serif text-iron-grey-600">Armée</div>
            <div className="text-lg font-serif font-bold text-royal-blue">
              {totalTroops.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Throne Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Urgent Realm Events & Pigeon Missives */}
        <div className="md:col-span-2 space-y-6">
          <ParchmentCard
            title="Dépêches et Missives Royales"
            subtitle="Correspondance diplomatique et alertes de vos intendants"
            badge={
              state.messages.length > 0 && (
                <span className="bg-crimson-seal text-white text-[10px] px-2 py-0.5 rounded-full font-serif font-bold">
                  {state.messages.length}
                </span>
              )
            }
          >
            {state.messages.length === 0 ? (
              <p className="text-sm font-serif text-iron-grey-500 italic py-4 text-center">
                Aucune nouvelle dépêche ce mois-ci.
              </p>
            ) : (
              <div className="space-y-3">
                {state.messages.slice(0, 5).map(msg => (
                  <div
                    key={msg.id}
                    className="p-3 bg-parchment-50 border border-parchment-border rounded flex items-start gap-3 shadow-xs"
                  >
                    <Scroll className="w-5 h-5 text-royal-gold-700 shrink-0 mt-0.5" />
                    <div className="flex-1 text-sm font-serif">
                      <div className="flex justify-between items-center text-xs text-iron-grey-500 mb-1">
                        <span className="font-bold text-iron-grey-800">
                          {msg.fromLordId === 'system' ? 'Chancellerie Royale' : (state.lords[msg.fromLordId]?.name ?? msg.fromLordId)}
                        </span>
                        <span>Mois {msg.month}</span>
                      </div>
                      <p className="text-iron-grey-800 leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ParchmentCard>

          {/* Whispers of Kald (Public Rumors) */}
          <ParchmentCard
            title="Murmures & Rumeurs des Terres de Kald"
            subtitle="Échos de la rue, vantardises de seigneurs et ragots de taverne"
          >
            <div className="space-y-3">
              {state.rumors.slice(0, 4).map(rumor => (
                <div
                  key={rumor.id}
                  className="p-3 bg-parchment-light border-l-4 border-royal-gold-500 rounded-r text-sm font-serif italic text-iron-grey-800"
                >
                  <p className="leading-relaxed">« {rumor.text} »</p>
                  <div className="text-[11px] text-right font-normal text-iron-grey-500 mt-1">
                    — {rumor.authorName ?? 'Un voyageur masqué'}, Mois {rumor.month} ({rumor.season})
                  </div>
                </div>
              ))}
            </div>
          </ParchmentCard>
        </div>

        {/* Quick Strategic Actions & Realm Status */}
        <div className="space-y-6">
          <ParchmentCard title="Actions Royales Directes">
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('map')}
                className="w-full text-left p-3 rounded bg-parchment-50 border border-parchment-border hover:bg-parchment-200 transition-colors flex items-center justify-between font-serif text-sm font-bold"
              >
                <span>Consulter la Carte de Kald</span>
                <span className="text-royal-gold-700">➔</span>
              </button>
              <button
                onClick={() => onNavigate('fiefs')}
                className="w-full text-left p-3 rounded bg-parchment-50 border border-parchment-border hover:bg-parchment-200 transition-colors flex items-center justify-between font-serif text-sm font-bold"
              >
                <span>Ajuster les Impôts des Fiefs</span>
                <span className="text-royal-gold-700">➔</span>
              </button>
              <button
                onClick={() => onNavigate('military')}
                className="w-full text-left p-3 rounded bg-parchment-50 border border-parchment-border hover:bg-parchment-200 transition-colors flex items-center justify-between font-serif text-sm font-bold"
              >
                <span>Lever des Troupes à la Caserne</span>
                <span className="text-royal-gold-700">➔</span>
              </button>
              <button
                onClick={() => onNavigate('market')}
                className="w-full text-left p-3 rounded bg-parchment-50 border border-parchment-border hover:bg-parchment-200 transition-colors flex items-center justify-between font-serif text-sm font-bold"
              >
                <span>Négocier au Marché Mondial</span>
                <span className="text-royal-gold-700">➔</span>
              </button>
              <button
                onClick={() => onNavigate('diplomacy')}
                className="w-full text-left p-3 rounded bg-parchment-50 border border-parchment-border hover:bg-parchment-200 transition-colors flex items-center justify-between font-serif text-sm font-bold"
              >
                <span>Envoyer un Pigeon Diplomatique</span>
                <span className="text-royal-gold-700">➔</span>
              </button>
            </div>
          </ParchmentCard>

          <ParchmentCard title="Seigneurs Rivaux">
            <div className="space-y-2.5">
              {Object.values(state.lords)
                .filter(l => !l.isPlayer)
                .map(lord => (
                  <div
                    key={lord.id}
                    className="flex items-center justify-between p-2 rounded bg-parchment-light border border-parchment-border"
                  >
                    <div className="flex items-center gap-2.5">
                      <HeraldicShield heraldry={lord.heraldry} size="sm" />
                      <div>
                        <div className="text-xs font-serif font-bold text-iron-grey-900">
                          {lord.name}
                        </div>
                        <div className="text-[10px] font-serif text-iron-grey-600 capitalize">
                          {lord.archetype}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-xs font-serif">
                      <span className="font-bold text-royal-gold-800">{lord.gold}</span> écus
                    </div>
                  </div>
                ))}
            </div>
          </ParchmentCard>
        </div>
      </div>
    </div>
  );
};

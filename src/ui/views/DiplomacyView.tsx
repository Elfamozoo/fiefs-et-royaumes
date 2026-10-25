import React, { useState } from 'react';
import type { GameState } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { WaxSealButton } from '../components/WaxSealButton';
import { HeraldicShield } from '../components/HeraldicShield';
import { Send, MessageSquare, Crown, Shield, Scroll } from 'lucide-react';

interface DiplomacyViewProps {
  state: GameState;
  onSendPigeon: (toLordId: string, content: string) => void;
  onPostRumor: (text: string) => void;
  onSwearFealty: (suzerainId: string) => void;
}

export const DiplomacyView: React.FC<DiplomacyViewProps> = ({
  state,
  onSendPigeon,
  onPostRumor,
  onSwearFealty,
}) => {
  const [selectedLordId, setSelectedLordId] = useState<string>('lord_aldous');
  const [pigeonText, setPigeonText] = useState<string>('');
  const [rumorText, setRumorText] = useState<string>('');

  const player = state.lords[state.playerLordId];
  const aiLords = Object.values(state.lords).filter(l => !l.isPlayer);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-serif font-bold text-iron-grey-900 tracking-wide">
          Chancellerie Diplomatique & Rumeurs de Kald
        </h2>
        <p className="text-xs font-serif text-iron-grey-600">
          Tissez des alliances, prêtez hommage féodal ou lancez des rumeurs venimeuses sur la place publique.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lords Roster & Fealty */}
        <div className="space-y-4">
          <ParchmentCard title="Pairs du Royaume" subtitle="Seigneurs et dynasties des Terres de Kald">
            <div className="space-y-3 font-serif">
              {aiLords.map(lord => {
                const isSelected = selectedLordId === lord.id;
                const isPlayerSuzerain = lord.suzerainId === state.playerLordId;
                const isPlayerVassal = player?.suzerainId === lord.id;

                return (
                  <div
                    key={lord.id}
                    onClick={() => setSelectedLordId(lord.id)}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-royal-gold-100 border-royal-gold-500 shadow-sm'
                        : 'bg-parchment-light border-parchment-border hover:bg-parchment-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <HeraldicShield heraldry={lord.heraldry} size="sm" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-iron-grey-900">{lord.name}</div>
                        <div className="text-[11px] text-iron-grey-600 capitalize">
                          Archétype : {lord.archetype}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-xs pt-2 mt-2 border-t border-parchment-border/60">
                      <span className="text-iron-grey-600">Trésor : {lord.gold} écus</span>
                      {isPlayerSuzerain ? (
                        <span className="text-emerald-700 font-bold">Votre vassal</span>
                      ) : isPlayerVassal ? (
                        <span className="text-royal-blue font-bold">Votre suzerain</span>
                      ) : (
                        <span className="text-iron-grey-500">Indépendant</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ParchmentCard>
        </div>

        {/* Pigeon Dispatcher & Letter Exchange */}
        <div className="lg:col-span-2 space-y-6">
          <ParchmentCard
            title="Dépêche par Pigeon Voyageur"
            subtitle={`À l'attention de : ${state.lords[selectedLordId]?.name ?? 'Seigneur sélectionné'}`}
          >
            <div className="space-y-3 font-serif">
              <textarea
                value={pigeonText}
                onChange={e => setPigeonText(e.target.value)}
                placeholder="Rédigez votre missive scellée..."
                rows={3}
                className="w-full bg-parchment-light border border-parchment-border p-3 rounded text-sm font-serif placeholder:italic focus:outline-none focus:ring-1 focus:ring-royal-gold-500"
              />

              <div className="flex justify-between items-center">
                <div className="text-xs text-iron-grey-500 italic">
                  Les pigeons atteignent leur destinataire sans délai dans tout le royaume.
                </div>
                <WaxSealButton
                  variant="seal"
                  size="sm"
                  disabled={!pigeonText.trim()}
                  onClick={() => {
                    if (pigeonText.trim()) {
                      onSendPigeon(selectedLordId, pigeonText.trim());
                      setPigeonText('');
                    }
                  }}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  Envoyer le pigeon
                </WaxSealButton>
              </div>
            </div>
          </ParchmentCard>

          {/* Public Rumor Submission */}
          <ParchmentCard
            title="Place des Rumeurs & Taverne"
            subtitle="Faites circuler une annonce publique entendue par tous les seigneurs"
          >
            <div className="space-y-3 font-serif">
              <textarea
                value={rumorText}
                onChange={e => setRumorText(e.target.value)}
                placeholder="« On raconte dans les auberges que... »"
                rows={2}
                className="w-full bg-parchment-light border border-parchment-border p-3 rounded text-sm font-serif placeholder:italic focus:outline-none focus:ring-1 focus:ring-royal-gold-500"
              />

              <div className="flex justify-end">
                <WaxSealButton
                  variant="gold"
                  size="sm"
                  disabled={!rumorText.trim()}
                  onClick={() => {
                    if (rumorText.trim()) {
                      onPostRumor(rumorText.trim());
                      setRumorText('');
                    }
                  }}
                  icon={<MessageSquare className="w-3.5 h-3.5" />}
                >
                  Répandre la rumeur
                </WaxSealButton>
              </div>

              {/* Rumors Board */}
              <div className="space-y-2 pt-2 border-t border-parchment-border/70">
                {state.rumors.map(rumor => (
                  <div
                    key={rumor.id}
                    className="p-2.5 bg-parchment-50 border-l-3 border-royal-gold-600 rounded text-xs text-iron-grey-800"
                  >
                    <p className="italic">« {rumor.text} »</p>
                    <div className="text-[10px] text-iron-grey-500 text-right mt-1">
                      {rumor.authorName} — Mois {rumor.month}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ParchmentCard>
        </div>
      </div>
    </div>
  );
};

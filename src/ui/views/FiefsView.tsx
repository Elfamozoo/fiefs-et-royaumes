import React from 'react';
import type { GameState, TaxRate, Province } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { WaxSealButton } from '../components/WaxSealButton';
import { TAX_RATES_CONFIG } from '../../engine/systems/economy';
import { Coins, Heart, Users, ShieldAlert, Hammer } from 'lucide-react';

interface FiefsViewProps {
  state: GameState;
  onSetTaxRate: (provinceId: string, rate: TaxRate) => void;
}

export const FiefsView: React.FC<FiefsViewProps> = ({ state, onSetTaxRate }) => {
  const player = state.lords[state.playerLordId];
  const playerProvinces = Object.values(state.provinces).filter(
    p => p.lordId === state.playerLordId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-iron-grey-900 tracking-wide">
            Gestion Fiscale & Territoriale des Fiefs
          </h2>
          <p className="text-xs font-serif text-iron-grey-600">
            Ajustez le niveau d’imposition de chaque province (Coût : 1 PA). L'extorsion remplit le trésor mais provoque des révoltes !
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {playerProvinces.map(prov => {
          const currentTaxConfig = TAX_RATES_CONFIG[prov.taxRate];
          const estimatedTaxGold = Math.floor(prov.population * currentTaxConfig.rate);

          return (
            <ParchmentCard
              key={prov.id}
              title={prov.name}
              subtitle={`Biome: ${prov.biome.toUpperCase()}`}
              badge={
                <span className="text-xs bg-parchment-200 border border-parchment-border px-2 py-0.5 rounded font-serif">
                  {prov.population.toLocaleString()} habitants
                </span>
              }
            >
              <div className="space-y-4 font-serif text-sm">
                {/* Morale and Tax Status */}
                <div className="bg-parchment-50 p-3 rounded border border-parchment-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="flex items-center gap-1.5 font-bold text-iron-grey-700">
                      <Heart className="w-4 h-4 text-crimson-600" />
                      Satisfaction citoyenne
                    </span>
                    <span className="font-bold">{prov.morale}%</span>
                  </div>
                  <div className="w-full bg-parchment-300 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        prov.morale >= 70 ? 'bg-emerald-600' : prov.morale >= 40 ? 'bg-amber-500' : 'bg-crimson-600'
                      }`}
                      style={{ width: `${prov.morale}%` }}
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1 border-t border-parchment-border/60">
                    <span className="text-iron-grey-600">Recettes fiscales prévues :</span>
                    <span className="font-bold text-royal-gold-900">+{estimatedTaxGold} écus / mois</span>
                  </div>
                </div>

                {/* Fiscal Policy Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-iron-grey-700 mb-2">
                    Politique Fiscale (1 PA)
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {(['low', 'moderate', 'high', 'extortion'] as TaxRate[]).map(rate => {
                      const isSelected = prov.taxRate === rate;
                      const config = TAX_RATES_CONFIG[rate];
                      const labels: Record<TaxRate, string> = {
                        low: 'Basse (5%)',
                        moderate: 'Modérée (15%)',
                        high: 'Forte (25%)',
                        extortion: 'Extorsion (40%)',
                      };

                      return (
                        <button
                          key={rate}
                          onClick={() => onSetTaxRate(prov.id, rate)}
                          disabled={(player?.actionPoints ?? 0) < 1 || isSelected}
                          className={`p-2 rounded border text-center transition-all ${
                            isSelected
                              ? 'bg-royal-gold-500 text-iron-grey-900 font-bold border-royal-gold-700 shadow-inner'
                              : 'bg-parchment-100 text-iron-grey-800 border-parchment-border hover:bg-parchment-200'
                          } disabled:opacity-50`}
                          title={`Impact mensuel: ${config.moraleDelta >= 0 ? `+${config.moraleDelta}` : config.moraleDelta} au moral`}
                        >
                          <div className="text-[11px] font-bold">{labels[rate]}</div>
                          <div className="text-[10px] text-iron-grey-600">
                            {config.moraleDelta >= 0 ? `+${config.moraleDelta}` : config.moraleDelta} moral
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Provincial Granaries & Materials */}
                <div className="bg-parchment-light p-2.5 rounded border border-parchment-border grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-iron-grey-500 block">🌾 Blé</span>
                    <span className="font-bold">{prov.resources.food}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-iron-grey-500 block">🌲 Bois</span>
                    <span className="font-bold">{prov.resources.wood}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-iron-grey-500 block">⛰️ Pierre</span>
                    <span className="font-bold">{prov.resources.stone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-iron-grey-500 block">⚒️ Fer</span>
                    <span className="font-bold">{prov.resources.iron}</span>
                  </div>
                </div>
              </div>
            </ParchmentCard>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import type { GameState, UnitFamily, UnitDefinition } from '../../engine/types';
import { UNIT_CATALOGUE } from '../../engine/data/units';
import { ParchmentCard } from '../components/ParchmentCard';
import { WaxSealButton } from '../components/WaxSealButton';
import { MedievalModal } from '../components/MedievalModal';
import { Swords, Crosshair, Flag, Sparkles, Axe } from 'lucide-react';

interface MilitaryViewProps {
  state: GameState;
  onRecruit: (provinceId: string, unitId: string, count: number) => void;
}

const FAMILY_ICONS: Record<UnitFamily, React.ReactNode> = {
  infantry: <Swords className="w-4 h-4 text-iron-grey-700" />,
  ranged: <Crosshair className="w-4 h-4 text-emerald-700" />,
  cavalry: <Flag className="w-4 h-4 text-amber-700" />,
  exotic: <Sparkles className="w-4 h-4 text-purple-700" />,
  siege: <Axe className="w-4 h-4 text-crimson-700" />,
};

export const MilitaryView: React.FC<MilitaryViewProps> = ({ state, onRecruit }) => {
  const [selectedFamily, setSelectedFamily] = useState<UnitFamily | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [recruitingUnit, setRecruitingUnit] = useState<UnitDefinition | null>(null);
  const [recruitCount, setRecruitCount] = useState<number>(10);
  const [targetProvinceId, setTargetProvinceId] = useState<string>('');

  const player = state.lords[state.playerLordId];
  const playerProvinces = Object.values(state.provinces).filter(
    p => p.lordId === state.playerLordId
  );

  const filteredUnits = UNIT_CATALOGUE.filter(unit => {
    const matchesFamily = selectedFamily === 'all' || unit.family === selectedFamily;
    const matchesSearch =
      unit.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      unit.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFamily && matchesSearch;
  });

  const playerArmies = Object.values(state.armies).filter(
    a => a.lordId === state.playerLordId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-serif font-bold text-iron-grey-900 tracking-wide">
            Caserne Royale & Ost Militaire
          </h2>
          <p className="text-xs font-serif text-iron-grey-600">
            Recrutez parmi plus de 100 régiments historiques et unités légendaires de Kald (Coût : 2 PA).
          </p>
        </div>
      </div>

      {/* Armies Overview */}
      <ParchmentCard title="Vos Osts en Campagne" subtitle={`${playerArmies.length} armées levées`}>
        {playerArmies.length === 0 ? (
          <p className="text-sm font-serif text-iron-grey-500 italic py-3 text-center">
            Vous ne commandez aucune armée actuellement. Levez vos premières troupes à la caserne ci-dessous.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {playerArmies.map(army => {
              const province = state.provinces[army.provinceId];
              const totalTroops = army.regiments.reduce((s, r) => s + r.count, 0);

              return (
                <div
                  key={army.id}
                  className="bg-parchment-50 p-3 rounded border border-parchment-border font-serif text-xs space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-iron-grey-900">{army.name}</span>
                    <span className="bg-parchment-200 px-2 py-0.5 rounded font-bold">
                      {totalTroops} hommes
                    </span>
                  </div>
                  <div className="text-iron-grey-600">
                    Stationnée à : <span className="font-bold">{province?.name ?? army.provinceId}</span>
                  </div>
                  <div className="space-y-1 pt-1 border-t border-parchment-border/60">
                    {army.regiments.map((reg, idx) => (
                      <div key={idx} className="flex justify-between text-[11px]">
                        <span>{reg.unitId}</span>
                        <span className="font-bold">{reg.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ParchmentCard>

      {/* Catalogue Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-parchment-100 p-3 rounded-lg border border-parchment-border">
        <div className="flex flex-wrap items-center gap-1.5">
          {(['all', 'infantry', 'ranged', 'cavalry', 'exotic', 'siege'] as const).map(fam => (
            <button
              key={fam}
              onClick={() => setSelectedFamily(fam)}
              className={`px-3 py-1.5 rounded text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                selectedFamily === fam
                  ? 'bg-royal-gold-500 text-iron-grey-900 shadow-sm'
                  : 'bg-parchment-200 text-iron-grey-700 hover:bg-parchment-300'
              }`}
            >
              {fam !== 'all' && FAMILY_ICONS[fam]}
              <span className="capitalize">{fam === 'all' ? 'Toutes les unités' : fam}</span>
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="Rechercher une unité..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-3 py-1.5 bg-parchment-light border border-parchment-border rounded text-xs font-serif placeholder:italic focus:outline-none focus:ring-1 focus:ring-royal-gold-500 min-w-[220px]"
        />
      </div>

      {/* Units Catalogue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUnits.map(unit => {
          return (
            <div
              key={unit.id}
              className="bg-parchment-light border border-parchment-border rounded-lg p-3.5 shadow-xs flex flex-col justify-between font-serif space-y-3"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <div className="flex items-center gap-1.5">
                    {FAMILY_ICONS[unit.family]}
                    <h4 className="font-bold text-sm text-iron-grey-900">{unit.name}</h4>
                  </div>
                  <span className="text-[10px] uppercase tracking-wider bg-parchment-200 border border-parchment-border px-1.5 py-0.5 rounded">
                    Tier {unit.tier}
                  </span>
                </div>
                <p className="text-[11px] text-iron-grey-600 line-clamp-2 leading-relaxed">
                  {unit.description}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-1 bg-parchment-50 p-2 rounded text-[10px] text-center border border-parchment-border/70">
                <div>⚔️ Att: <span className="font-bold">{unit.attack}</span></div>
                <div>🛡️ Déf: <span className="font-bold">{unit.defense}</span></div>
                <div>🏹 Tir: <span className="font-bold">{unit.rangedAttack}</span></div>
                <div>🛡️ Arm: <span className="font-bold">{unit.armor}</span></div>
                <div>⚡ Vit: <span className="font-bold">{unit.speed}</span></div>
                <div>❤️ Mor: <span className="font-bold">{unit.morale}</span></div>
              </div>

              {/* Cost & Recruitment Button */}
              <div className="flex items-center justify-between pt-1 border-t border-parchment-border/60">
                <div className="text-[11px] font-bold text-royal-gold-900">
                  {unit.cost.gold} écus {unit.cost.iron ? `+ ${unit.cost.iron} fer` : ''}
                </div>
                <WaxSealButton
                  size="sm"
                  variant="gold"
                  onClick={() => {
                    setRecruitingUnit(unit);
                    setTargetProvinceId(playerProvinces[0]?.id ?? '');
                  }}
                  disabled={playerProvinces.length === 0 || (player?.actionPoints ?? 0) < 2}
                >
                  Recruter
                </WaxSealButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recruitment Modal */}
      {recruitingUnit && (
        <MedievalModal
          isOpen={true}
          onClose={() => setRecruitingUnit(null)}
          title={`Enrôlement : ${recruitingUnit.name}`}
          subtitle={`Coût unitaire : ${recruitingUnit.cost.gold} écus, Solde : ${recruitingUnit.upkeep.gold} écus/mois`}
        >
          <div className="space-y-4 font-serif text-sm">
            <div>
              <label className="block text-xs font-bold text-iron-grey-700 mb-1">
                Fief de rassemblement
              </label>
              <select
                value={targetProvinceId}
                onChange={e => setTargetProvinceId(e.target.value)}
                className="w-full bg-parchment-light border border-parchment-border p-2 rounded text-sm font-serif"
              >
                {playerProvinces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Fer: {p.resources.iron}, Bois: {p.resources.wood})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-iron-grey-700 mb-1">
                Nombre de combattants : {recruitCount}
              </label>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={recruitCount}
                onChange={e => setRecruitCount(Number(e.target.value))}
                className="w-full accent-royal-gold-600"
              />
            </div>

            <div className="bg-parchment-50 p-3 rounded border border-parchment-border text-xs space-y-1">
              <div className="flex justify-between">
                <span>Coût total en écus :</span>
                <span className="font-bold">{recruitingUnit.cost.gold * recruitCount} écus</span>
              </div>
              {recruitingUnit.cost.iron && (
                <div className="flex justify-between">
                  <span>Coût en fer :</span>
                  <span className="font-bold">{recruitingUnit.cost.iron * recruitCount} fer</span>
                </div>
              )}
              <div className="flex justify-between text-royal-gold-900 font-bold pt-1 border-t border-parchment-border">
                <span>Points d'Action (PA) :</span>
                <span>2 PA</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <WaxSealButton
                variant="parchment"
                onClick={() => setRecruitingUnit(null)}
              >
                Annuler
              </WaxSealButton>
              <WaxSealButton
                variant="seal"
                onClick={() => {
                  if (targetProvinceId && recruitingUnit) {
                    onRecruit(targetProvinceId, recruitingUnit.id, recruitCount);
                    setRecruitingUnit(null);
                  }
                }}
              >
                Apposer le Sceau
              </WaxSealButton>
            </div>
          </div>
        </MedievalModal>
      )}
    </div>
  );
};

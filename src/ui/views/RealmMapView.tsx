import React, { useState } from 'react';
import type { GameState, Province, Army } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { HeraldicShield } from '../components/HeraldicShield';
import { WaxSealButton } from '../components/WaxSealButton';
import { Shield, Users, Castle, ArrowRight } from 'lucide-react';

interface RealmMapViewProps {
  state: GameState;
  onMoveArmy: (armyId: string, targetProvinceId: string) => void;
}

const BIOME_COLORS: Record<string, string> = {
  plains: '#a8d5a2',
  forest: '#5a9367',
  hills: '#cbb682',
  mountains: '#8d8780',
  marsh: '#728a7c',
  coast: '#7fb8c9',
  desert: '#e8c988',
};

export const RealmMapView: React.FC<RealmMapViewProps> = ({ state, onMoveArmy }) => {
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('prov_kaldheim');
  const [selectedArmyId, setSelectedArmyId] = useState<string | null>(null);

  const selectedProvince = state.provinces[selectedProvinceId];
  const provinceOwner = selectedProvince?.lordId ? state.lords[selectedProvince.lordId] : null;

  // Armies stationed in selected province
  const stationedArmies = Object.values(state.armies).filter(
    a => a.provinceId === selectedProvinceId
  );

  // Player armies that can move
  const playerStationedArmies = stationedArmies.filter(
    a => a.lordId === state.playerLordId
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Interactive SVG Map */}
        <div className="flex-1 bg-parchment-100 border-2 border-parchment-border rounded-lg shadow-md p-4 relative overflow-hidden">
          <div className="flex justify-between items-center mb-3">
            <div>
              <h2 className="font-serif font-bold text-lg text-iron-grey-900 tracking-wide">
                Carte des Terres de Kald
              </h2>
              <p className="text-xs font-serif text-iron-grey-600">
                Sélectionnez une province pour inspecter son fief ou déplacer vos osts.
              </p>
            </div>
          </div>

          <div className="relative w-full aspect-16/10 bg-[#e4d7bf] rounded-md border border-parchment-border/80 overflow-hidden shadow-inner">
            <svg viewBox="0 0 1000 600" className="w-full h-full select-none">
              {/* Province Connections (Edges) */}
              {Object.values(state.provinces).map(prov => {
                return prov.connections.map(targetId => {
                  const targetProv = state.provinces[targetId];
                  if (!targetProv || prov.id > targetId) return null; // Draw once per pair
                  return (
                    <line
                      key={`${prov.id}-${targetId}`}
                      x1={prov.coordinates.x * 9 + 50}
                      y1={prov.coordinates.y * 5.2 + 40}
                      x2={targetProv.coordinates.x * 9 + 50}
                      y2={targetProv.coordinates.y * 5.2 + 40}
                      stroke="#8b7355"
                      strokeWidth="2.5"
                      strokeDasharray="4,4"
                      opacity="0.6"
                    />
                  );
                });
              })}

              {/* Province Nodes */}
              {Object.values(state.provinces).map(prov => {
                const isSelected = prov.id === selectedProvinceId;
                const isConnectedToSelected = selectedProvince?.connections.includes(prov.id);
                const owner = prov.lordId ? state.lords[prov.lordId] : null;
                const isPlayer = prov.lordId === state.playerLordId;
                const hasArmy = Object.values(state.armies).some(a => a.provinceId === prov.id);

                const cx = prov.coordinates.x * 9 + 50;
                const cy = prov.coordinates.y * 5.2 + 40;

                return (
                  <g
                    key={prov.id}
                    onClick={() => {
                      if (selectedArmyId && isConnectedToSelected) {
                        onMoveArmy(selectedArmyId, prov.id);
                        setSelectedArmyId(null);
                      }
                      setSelectedProvinceId(prov.id);
                    }}
                    className="cursor-pointer group"
                  >
                    {/* Highlight ring for connection / move target */}
                    {selectedArmyId && isConnectedToSelected && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r="32"
                        fill="none"
                        stroke="#e67e22"
                        strokeWidth="3"
                        strokeDasharray="3,3"
                        className="animate-pulse"
                      />
                    )}

                    {/* Node circle */}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 26 : 22}
                      fill={BIOME_COLORS[prov.biome] ?? '#cbb682'}
                      stroke={isSelected ? '#d4af37' : isPlayer ? '#27ae60' : '#4a3728'}
                      strokeWidth={isSelected ? 4 : 2}
                      className="transition-all duration-200 group-hover:scale-110"
                    />

                    {/* Army Marker Indicator */}
                    {hasArmy && (
                      <circle
                        cx={cx + 14}
                        cy={cy - 14}
                        r="8"
                        fill="#c0392b"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Province Label */}
                    <text
                      x={cx}
                      y={cy + 34}
                      textAnchor="middle"
                      className={`text-[11px] font-serif font-bold ${
                        isSelected ? 'fill-royal-gold-900 underline' : 'fill-iron-grey-900'
                      }`}
                    >
                      {prov.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Province Details Sidebar */}
        <div className="w-full lg:w-96 space-y-4">
          {selectedProvince && (
            <ParchmentCard
              title={selectedProvince.name}
              subtitle={`Biome: ${selectedProvince.biome.toUpperCase()}`}
              badge={
                provinceOwner && (
                  <span className="text-xs bg-royal-gold-100 border border-royal-gold-400 px-2 py-0.5 rounded font-serif">
                    {provinceOwner.name}
                  </span>
                )
              }
            >
              {/* Province Stats */}
              <div className="space-y-4 text-sm font-serif">
                <div className="grid grid-cols-2 gap-2 bg-parchment-50 p-2.5 rounded border border-parchment-border">
                  <div>
                    <span className="text-xs text-iron-grey-600 block">Population</span>
                    <span className="font-bold">{selectedProvince.population.toLocaleString()} hab.</span>
                  </div>
                  <div>
                    <span className="text-xs text-iron-grey-600 block">Moral citoyen</span>
                    <span className="font-bold">{selectedProvince.morale}%</span>
                  </div>
                  <div>
                    <span className="text-xs text-iron-grey-600 block">Régime fiscal</span>
                    <span className="font-bold capitalize">{selectedProvince.taxRate}</span>
                  </div>
                  <div>
                    <span className="text-xs text-iron-grey-600 block">Fortifications</span>
                    <span className="font-bold">
                      {selectedProvince.buildings.find(b => b.type === 'walls') ? 'Remparts' : 'Aucun'}
                    </span>
                  </div>
                </div>

                {/* Resources In Stock */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-iron-grey-700 mb-1.5">
                    Ressources du fief
                  </h4>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    <div className="bg-parchment-light px-2 py-1 rounded border border-parchment-border">
                      🌾 Blé: <span className="font-bold">{selectedProvince.resources.food}</span>
                    </div>
                    <div className="bg-parchment-light px-2 py-1 rounded border border-parchment-border">
                      🌲 Bois: <span className="font-bold">{selectedProvince.resources.wood}</span>
                    </div>
                    <div className="bg-parchment-light px-2 py-1 rounded border border-parchment-border">
                      ⛰️ Pierre: <span className="font-bold">{selectedProvince.resources.stone}</span>
                    </div>
                    <div className="bg-parchment-light px-2 py-1 rounded border border-parchment-border">
                      ⚒️ Fer: <span className="font-bold">{selectedProvince.resources.iron}</span>
                    </div>
                  </div>
                </div>

                {/* Stationed Armies */}
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-iron-grey-700 mb-1.5">
                    Armées en garnison ({stationedArmies.length})
                  </h4>
                  {stationedArmies.length === 0 ? (
                    <p className="text-xs text-iron-grey-500 italic">Aucune troupe en garnison.</p>
                  ) : (
                    <div className="space-y-2">
                      {stationedArmies.map(army => {
                        const isPlayerArmy = army.lordId === state.playerLordId;
                        const totalUnits = army.regiments.reduce((s, r) => s + r.count, 0);

                        return (
                          <div
                            key={army.id}
                            className={`p-2 rounded border text-xs ${
                              isPlayerArmy
                                ? selectedArmyId === army.id
                                  ? 'bg-amber-100 border-amber-500 font-bold'
                                  : 'bg-parchment-light border-parchment-border'
                                : 'bg-crimson-50 border-crimson-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold">{army.name}</span>
                              <span>{totalUnits} combattants</span>
                            </div>

                            {isPlayerArmy && (
                              <div className="mt-2 flex justify-end">
                                <WaxSealButton
                                  size="sm"
                                  variant={selectedArmyId === army.id ? 'seal' : 'gold'}
                                  onClick={() => setSelectedArmyId(selectedArmyId === army.id ? null : army.id)}
                                >
                                  {selectedArmyId === army.id ? 'Annuler' : 'Déplacer'}
                                </WaxSealButton>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Instructions if moving */}
                {selectedArmyId && (
                  <div className="p-2.5 bg-amber-50 border border-amber-300 rounded text-xs text-amber-900 flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>Cliquez sur une province adjacente sur la carte pour faire marcher l'ost.</span>
                  </div>
                )}
              </div>
            </ParchmentCard>
          )}
        </div>
      </div>
    </div>
  );
};

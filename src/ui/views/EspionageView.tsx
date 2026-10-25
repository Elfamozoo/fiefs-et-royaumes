import React, { useState } from 'react';
import type { GameState, SpyMissionType, SpyResult } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { WaxSealButton } from '../components/WaxSealButton';
import { Eye, Shield, Flame, Skull, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface EspionageViewProps {
  state: GameState;
  onLaunchMission: (missionType: SpyMissionType, targetProvinceId: string) => SpyResult;
}

const MISSIONS_CONFIG: Record<
  SpyMissionType,
  { title: string; description: string; risk: string; icon: React.ReactNode }
> = {
  infiltrate: {
    title: 'Infiltration de Province',
    description: 'Inspecte en secret la population, le moral citoyen et les fortifications d’un fief rival.',
    risk: 'Risque faible (20% de capture en cas d’échec)',
    icon: <Eye className="w-5 h-5 text-emerald-700" />,
  },
  scout_army: {
    title: 'Reconnaissance des Troupes',
    description: 'Révèle le nombre exact de régiments et la composition de la garnison ennemie.',
    risk: 'Risque modéré (25% de capture en cas d’échec)',
    icon: <Shield className="w-5 h-5 text-sky-700" />,
  },
  sabotage: {
    title: 'Sabotage des Greniers',
    description: 'Met le feu aux silos à blé adverses pour provoquer la famine et affamer les troupes.',
    risk: 'Risque élevé (40% de capture en cas d’échec)',
    icon: <Flame className="w-5 h-5 text-amber-700" />,
  },
  assassinate: {
    title: 'Élimination d’un Capitaine',
    description: 'Supprime un officier de garnison pour briser le moral de la province.',
    risk: 'Risque critique (50% de capture en cas d’échec)',
    icon: <Skull className="w-5 h-5 text-crimson-700" />,
  },
};

export const EspionageView: React.FC<EspionageViewProps> = ({ state, onLaunchMission }) => {
  const [selectedMission, setSelectedMission] = useState<SpyMissionType>('infiltrate');
  const [targetProvinceId, setTargetProvinceId] = useState<string>('');
  const [lastResult, setLastResult] = useState<SpyResult | null>(null);

  const player = state.lords[state.playerLordId];

  // Target provinces: non-player provinces
  const targetProvinces = Object.values(state.provinces).filter(
    p => p.lordId !== state.playerLordId
  );

  const activeTargetId = targetProvinceId || (targetProvinces[0]?.id ?? '');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-serif font-bold text-iron-grey-900 tracking-wide">
          Guilde des Maîtres-Espions
        </h2>
        <p className="text-xs font-serif text-iron-grey-600">
          Ordonnez des opérations clandestines dans les fiefs rivaux (Coût : 2 PA). Les espions capturés sont jetés aux cachots !
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Mission Dispatcher */}
        <ParchmentCard title="Planification Opérationnelle">
          <div className="space-y-4 font-serif text-sm">
            {/* Target Province */}
            <div>
              <label className="block text-xs font-bold text-iron-grey-700 mb-1">
                Province cible
              </label>
              <select
                value={activeTargetId}
                onChange={e => setTargetProvinceId(e.target.value)}
                className="w-full bg-parchment-light border border-parchment-border p-2 rounded text-sm font-serif"
              >
                {targetProvinces.map(p => {
                  const owner = p.lordId ? state.lords[p.lordId] : null;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} ({owner?.name ?? 'Fief libre'})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Mission Type Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-iron-grey-700">
                Type d'opération clandestine
              </label>
              <div className="space-y-2">
                {(['infiltrate', 'scout_army', 'sabotage', 'assassinate'] as SpyMissionType[]).map(type => {
                  const isSelected = selectedMission === type;
                  const config = MISSIONS_CONFIG[type];

                  return (
                    <div
                      key={type}
                      onClick={() => setSelectedMission(type)}
                      className={`p-3 rounded-lg border-2 cursor-pointer transition-all flex items-start gap-3 ${
                        isSelected
                          ? 'bg-royal-gold-100 border-royal-gold-500 shadow-xs'
                          : 'bg-parchment-light border-parchment-border hover:bg-parchment-100'
                      }`}
                    >
                      <div className="mt-0.5 shrink-0">{config.icon}</div>
                      <div className="flex-1">
                        <div className="font-bold text-sm text-iron-grey-900">{config.title}</div>
                        <p className="text-xs text-iron-grey-600 mt-0.5 leading-relaxed">
                          {config.description}
                        </p>
                        <div className="text-[10px] text-amber-800 font-bold mt-1">
                          ⚠️ {config.risk}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <WaxSealButton
                variant="seal"
                size="lg"
                className="w-full"
                disabled={(player?.actionPoints ?? 0) < 2 || !activeTargetId}
                onClick={() => {
                  if (activeTargetId) {
                    const res = onLaunchMission(selectedMission, activeTargetId);
                    setLastResult(res);
                  }
                }}
              >
                Déployer l’Agent (2 PA)
              </WaxSealButton>
            </div>
          </div>
        </ParchmentCard>

        {/* Intelligence Report */}
        <ParchmentCard title="Dernier Rapport d’Espionnage">
          {!lastResult ? (
            <div className="py-12 text-center text-sm font-serif text-iron-grey-500 italic">
              Aucun rapport récent. Déployez un agent pour obtenir des renseignements secrets.
            </div>
          ) : (
            <div className="space-y-4 font-serif text-sm">
              <div
                className={`p-4 rounded-lg border flex items-start gap-3 ${
                  lastResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-crimson-50 border-crimson-300 text-crimson-950'
                }`}
              >
                {lastResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-crimson-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-bold text-sm">
                    {lastResult.success ? 'Opération couronnée de succès !' : 'Échec de la mission'}
                  </div>
                  <p className="text-xs mt-1 leading-relaxed">{lastResult.details}</p>
                </div>
              </div>

              {/* Intel Payload if any */}
              {lastResult.intel && (
                <div className="bg-parchment-50 p-3 rounded border border-parchment-border text-xs space-y-2">
                  <div className="font-bold text-iron-grey-800 uppercase tracking-wider text-[10px]">
                    Renseignements Dérobés
                  </div>
                  <pre className="text-[11px] font-mono text-iron-grey-800 overflow-x-auto p-2 bg-parchment-light rounded border border-parchment-border/70">
                    {JSON.stringify(lastResult.intel, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </ParchmentCard>
      </div>
    </div>
  );
};

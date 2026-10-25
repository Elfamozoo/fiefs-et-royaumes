import React, { useState } from 'react';
import { useGameStore } from './ui/state/useGameStore';
import { ResourceBar } from './ui/components/ResourceBar';
import { TimeController } from './ui/components/TimeController';
import { WaxSealButton } from './ui/components/WaxSealButton';
import { MedievalModal } from './ui/components/MedievalModal';
import { ThroneRoomView } from './ui/views/ThroneRoomView';
import { RealmMapView } from './ui/views/RealmMapView';
import { FiefsView } from './ui/views/FiefsView';
import { MilitaryView } from './ui/views/MilitaryView';
import { MarketView } from './ui/views/MarketView';
import { DiplomacyView } from './ui/views/DiplomacyView';
import { EspionageView } from './ui/views/EspionageView';

import {
  Crown,
  Map as MapIcon,
  Castle,
  Swords,
  Coins,
  Scroll,
  Eye,
  Download,
  Upload,
  RotateCcw,
} from 'lucide-react';

type NavigationTab =
  | 'throne'
  | 'map'
  | 'fiefs'
  | 'military'
  | 'market'
  | 'diplomacy'
  | 'espionage';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('throne');
  const [isNewGameOpen, setIsNewGameOpen] = useState<boolean>(false);
  const [newPlayerName, setNewPlayerName] = useState<string>('Julien de Kald');

  const {
    gameState,
    advanceTurn,
    changeTaxRate,
    recruit,
    move,
    trade,
    sendPigeon,
    postRumor,
    launchSpy,
    fealty,
    resetGame,
    exportSave,
    importSave,
  } = useGameStore();

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          const success = importSave(content);
          if (success) {
            alert('Sauvegarde chargée avec succès !');
          } else {
            alert('Fichier de sauvegarde invalide.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const navItems: Array<{ id: NavigationTab; label: string; icon: React.ReactNode }> = [
    { id: 'throne', label: 'Trône', icon: <Crown className="w-4 h-4" /> },
    { id: 'map', label: 'Carte de Kald', icon: <MapIcon className="w-4 h-4" /> },
    { id: 'fiefs', label: 'Fiefs & Impôts', icon: <Castle className="w-4 h-4" /> },
    { id: 'military', label: 'Caserne & Osts', icon: <Swords className="w-4 h-4" /> },
    { id: 'market', label: 'Marché Mondial', icon: <Coins className="w-4 h-4" /> },
    { id: 'diplomacy', label: 'Diplomatie', icon: <Scroll className="w-4 h-4" /> },
    { id: 'espionage', label: 'Espionnage', icon: <Eye className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-parchment flex flex-col text-iron-grey-900 font-serif">
      {/* Top Persistent Resource & Status Bar */}
      <ResourceBar state={gameState} />

      {/* Navigation Sub-header & Fast Time Controller */}
      <div className="bg-parchment-100 border-b border-parchment-border px-4 py-2 select-none shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Main Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentTab(item.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-serif font-bold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-royal-gold-500 text-iron-grey-900 shadow-sm'
                      : 'text-iron-grey-700 hover:bg-parchment-200'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Time Controls & Game Menu */}
          <div className="flex items-center gap-2">
            <TimeController onAdvanceMonth={advanceTurn} />

            {/* Quick Actions / Save-Load */}
            <div className="flex items-center gap-1 border-l border-parchment-border pl-2">
              <button
                onClick={exportSave}
                title="Exporter la sauvegarde (.fief)"
                className="p-1.5 rounded hover:bg-parchment-200 text-iron-grey-700 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              <label
                title="Importer une sauvegarde"
                className="p-1.5 rounded hover:bg-parchment-200 text-iron-grey-700 cursor-pointer transition-colors"
              >
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept=".fief,.json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setIsNewGameOpen(true)}
                title="Nouvelle partie"
                className="p-1.5 rounded hover:bg-parchment-200 text-iron-grey-700 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Screen Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        {currentTab === 'throne' && (
          <ThroneRoomView
            state={gameState}
            onNavigate={tab => setCurrentTab(tab as NavigationTab)}
          />
        )}
        {currentTab === 'map' && (
          <RealmMapView state={gameState} onMoveArmy={move} />
        )}
        {currentTab === 'fiefs' && (
          <FiefsView state={gameState} onSetTaxRate={changeTaxRate} />
        )}
        {currentTab === 'military' && (
          <MilitaryView state={gameState} onRecruit={recruit} />
        )}
        {currentTab === 'market' && (
          <MarketView state={gameState} onTrade={trade} />
        )}
        {currentTab === 'diplomacy' && (
          <DiplomacyView
            state={gameState}
            onSendPigeon={sendPigeon}
            onPostRumor={postRumor}
            onSwearFealty={fealty}
          />
        )}
        {currentTab === 'espionage' && (
          <EspionageView state={gameState} onLaunchMission={launchSpy} />
        )}
      </main>

      {/* New Game Confirmation Modal */}
      {isNewGameOpen && (
        <MedievalModal
          isOpen={true}
          onClose={() => setIsNewGameOpen(false)}
          title="Fonder une Nouvelle Dynastie"
          subtitle="Réinitialise la simulation des Terres de Kald"
        >
          <div className="space-y-4 font-serif text-sm">
            <div>
              <label className="block text-xs font-bold text-iron-grey-700 mb-1">
                Nom de votre Seigneur
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={e => setNewPlayerName(e.target.value)}
                className="w-full bg-parchment-light border border-parchment-border p-2 rounded text-sm font-serif"
              />
            </div>
            <p className="text-xs text-iron-grey-600 italic">
              Attention : toute votre progression dans la partie actuelle sera écrasée.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <WaxSealButton
                variant="parchment"
                onClick={() => setIsNewGameOpen(false)}
              >
                Annuler
              </WaxSealButton>
              <WaxSealButton
                variant="seal"
                onClick={() => {
                  resetGame(newPlayerName);
                  setIsNewGameOpen(false);
                }}
              >
                Commencer le Règne
              </WaxSealButton>
            </div>
          </div>
        </MedievalModal>
      )}

      {/* Medieval Footer */}
      <footer className="border-t border-parchment-border/60 py-3 text-center text-xs text-iron-grey-500 font-serif">
        Fiefs & Royaumes Remake — Les Chroniques des Terres de Kald — 100% Fidèle & Déterministe
      </footer>
    </div>
  );
};

export default App;

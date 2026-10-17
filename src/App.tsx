import React, { useState } from 'react';
import { 
  Crown, 
  Shield, 
  Coins, 
  Scroll, 
  Swords, 
  Castle, 
  Sparkles,
  Compass
} from 'lucide-react';

export const App: React.FC = () => {
  const [acclaimed, setAcclaimed] = useState(false);

  return (
    <div className="min-h-screen parchment-texture flex flex-col items-center justify-center p-6 text-iron-grey-900">
      {/* Royal Seal & Header */}
      <div className="max-w-2xl w-full parchment-card parchment-border rounded-lg p-8 relative overflow-hidden text-center">
        {/* Wax seal ornament in corner */}
        <div className="absolute top-4 right-4 w-12 h-12 rounded-full wax-seal flex items-center justify-center text-royal-gold-200 border border-royal-gold-500/40">
          <Crown className="w-6 h-6 drop-shadow" />
        </div>

        <div className="flex justify-center mb-4 text-royal-gold-700">
          <Castle className="w-16 h-16" />
        </div>

        <h1 className="text-4xl md:text-5xl font-bold tracking-wide text-iron-grey-900 font-serif mb-2">
          Fiefs & Royaumes
        </h1>
        <p className="text-xl italic text-royal-gold-800 font-serif mb-6">
          — Chroniques des Terres de Kald —
        </p>

        <div className="w-48 h-1 bg-royal-gold-500/50 mx-auto my-4 rounded"></div>

        <p className="text-sm md:text-base text-iron-grey-700 max-w-lg mx-auto leading-relaxed mb-6 font-serif">
          Bienvenue, Messire. Le royaume est en cours d'édification. Le moteur de simulation médiévale 
          et le grand registre des fiefs prennent forme.
        </p>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6 text-left">
          <div className="bg-parchment-100/80 p-3 rounded border border-parchment-border">
            <div className="flex items-center space-x-2 text-royal-gold-700 font-bold text-xs uppercase mb-1">
              <Coins className="w-4 h-4" />
              <span>10 PA / Mois</span>
            </div>
            <p className="text-xs text-iron-grey-600">Plafond strict de 40 PA</p>
          </div>

          <div className="bg-parchment-100/80 p-3 rounded border border-parchment-border">
            <div className="flex items-center space-x-2 text-crimson-700 font-bold text-xs uppercase mb-1">
              <Swords className="w-4 h-4" />
              <span>100+ Unités</span>
            </div>
            <p className="text-xs text-iron-grey-600">5 familles d'armes</p>
          </div>

          <div className="bg-parchment-100/80 p-3 rounded border border-parchment-border">
            <div className="flex items-center space-x-2 text-royal-blue-700 font-bold text-xs uppercase mb-1">
              <Scroll className="w-4 h-4" />
              <span>4 Saisons</span>
            </div>
            <p className="text-xs text-iron-grey-600">Récoltes & climats</p>
          </div>

          <div className="bg-parchment-100/80 p-3 rounded border border-parchment-border">
            <div className="flex items-center space-x-2 text-heraldic-green-700 font-bold text-xs uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>Marché Mondial</span>
            </div>
            <p className="text-xs text-iron-grey-600">Offre & demande</p>
          </div>
        </div>

        {/* Interactive Button */}
        <div className="mt-8">
          <button
            onClick={() => setAcclaimed(true)}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-crimson-800 hover:bg-crimson-700 text-parchment-100 font-serif font-semibold rounded shadow-parchment transition duration-150 border border-royal-gold-500/50 hover:border-royal-gold-400"
          >
            <Shield className="w-5 h-5 text-royal-gold-400" />
            <span>{acclaimed ? "Gloire au Seigneur !" : "Revendiquer la Couronne"}</span>
            {acclaimed && <Sparkles className="w-4 h-4 text-royal-gold-300 ml-1" />}
          </button>
        </div>

        {acclaimed && (
          <p className="mt-4 text-xs italic text-crimson-800 animate-fade-in font-serif">
            Les clairons résonnent dans Kald. Que votre règne soit juste et prospère !
          </p>
        )}
      </div>

      {/* Footer attribution */}
      <footer className="mt-8 text-xs text-iron-grey-600 font-serif text-center">
        Socle technique initialisé — React + TypeScript + Tailwind CSS + Vitest
      </footer>
    </div>
  );
};

export default App;

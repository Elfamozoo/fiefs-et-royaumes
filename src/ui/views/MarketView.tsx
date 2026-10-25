import React, { useState } from 'react';
import type { GameState, ResourceType } from '../../engine/types';
import { ParchmentCard } from '../components/ParchmentCard';
import { WaxSealButton } from '../components/WaxSealButton';
import { TrendingUp, TrendingDown, Minus, Coins, Wheat, Trees, Mountain, Hammer } from 'lucide-react';

interface MarketViewProps {
  state: GameState;
  onTrade: (provinceId: string, resource: ResourceType, amount: number, isBuy: boolean) => void;
}

const RESOURCE_LABELS: Record<ResourceType, { name: string; icon: React.ReactNode }> = {
  gold: { name: 'Écus d’or', icon: <Coins className="w-4 h-4 text-royal-gold-600" /> },
  food: { name: 'Blé & Vivres', icon: <Wheat className="w-4 h-4 text-amber-700" /> },
  wood: { name: 'Bois de charpente', icon: <Trees className="w-4 h-4 text-emerald-800" /> },
  stone: { name: 'Pierre de taille', icon: <Mountain className="w-4 h-4 text-stone-600" /> },
  iron: { name: 'Minerai de fer', icon: <Hammer className="w-4 h-4 text-slate-700" /> },
};

export const MarketView: React.FC<MarketViewProps> = ({ state, onTrade }) => {
  const [selectedResource, setSelectedResource] = useState<ResourceType>('food');
  const [tradeAmount, setTradeAmount] = useState<number>(50);
  const [isBuyMode, setIsBuyMode] = useState<boolean>(true);
  const [selectedProvinceId, setSelectedProvinceId] = useState<string>('');

  const player = state.lords[state.playerLordId];
  const playerProvinces = Object.values(state.provinces).filter(
    p => p.lordId === state.playerLordId
  );

  const activeProvince = playerProvinces.find(p => p.id === selectedProvinceId) ?? playerProvinces[0];
  const commodity = state.market[selectedResource];
  const totalCost = Math.round(commodity.currentPrice * tradeAmount);

  // Available commodity keys (excluding gold)
  const tradeableCommodities: ResourceType[] = ['food', 'wood', 'stone', 'iron'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h2 className="text-xl font-serif font-bold text-iron-grey-900 tracking-wide">
          Marché Mondial des Denrées de Kald
        </h2>
        <p className="text-xs font-serif text-iron-grey-600">
          Les cours évoluent selon la loi de l'offre et de la demande. Spéculez, alimentez vos greniers ou vendez vos surplus au prix fort.
        </p>
      </div>

      {/* Commodity Price Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tradeableCommodities.map(res => {
          const item = state.market[res];
          const history = item.priceHistory;
          const prevPrice = history.length >= 2 ? history[history.length - 2] : item.basePrice;
          const priceDiff = item.currentPrice - prevPrice;
          const isSelected = selectedResource === res;

          return (
            <div
              key={res}
              onClick={() => setSelectedResource(res)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'bg-royal-gold-100/70 border-royal-gold-500 shadow-md scale-102'
                  : 'bg-parchment-light border-parchment-border hover:bg-parchment-100'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-1.5 font-serif font-bold text-sm text-iron-grey-900">
                  {RESOURCE_LABELS[res].icon}
                  <span>{RESOURCE_LABELS[res].name}</span>
                </div>
                {priceDiff > 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                ) : priceDiff < 0 ? (
                  <TrendingDown className="w-4 h-4 text-crimson-600" />
                ) : (
                  <Minus className="w-4 h-4 text-iron-grey-400" />
                )}
              </div>

              <div className="text-2xl font-serif font-bold text-royal-gold-900">
                {item.currentPrice}{' '}
                <span className="text-xs font-normal text-iron-grey-600">écus / u</span>
              </div>

              <div className="text-[11px] font-serif text-iron-grey-500 mt-1 flex justify-between">
                <span>Prix de base : {item.basePrice}</span>
                <span
                  className={
                    priceDiff > 0
                      ? 'text-emerald-700 font-bold'
                      : priceDiff < 0
                      ? 'text-crimson-700 font-bold'
                      : ''
                  }
                >
                  {priceDiff > 0 ? `+${priceDiff}` : priceDiff}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Trading Desk & Price History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trade Execution Form */}
        <ParchmentCard
          title={`Comptoir de négociation : ${RESOURCE_LABELS[selectedResource].name}`}
          subtitle={`Cours actuel : ${commodity.currentPrice} écus par unité`}
        >
          <div className="space-y-4 font-serif text-sm">
            {/* Buy / Sell Mode Toggle */}
            <div className="flex rounded border border-parchment-border overflow-hidden">
              <button
                type="button"
                onClick={() => setIsBuyMode(true)}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-wider transition-colors ${
                  isBuyMode
                    ? 'bg-royal-gold-500 text-iron-grey-900'
                    : 'bg-parchment-100 text-iron-grey-700 hover:bg-parchment-200'
                }`}
              >
                Acheter sur le marché
              </button>
              <button
                type="button"
                onClick={() => setIsBuyMode(false)}
                className={`flex-1 py-2 font-bold text-xs uppercase tracking-wider transition-colors ${
                  !isBuyMode
                    ? 'bg-royal-gold-500 text-iron-grey-900'
                    : 'bg-parchment-100 text-iron-grey-700 hover:bg-parchment-200'
                }`}
              >
                Vendre au marché
              </button>
            </div>

            {/* Province Depot Selector */}
            <div>
              <label className="block text-xs font-bold text-iron-grey-700 mb-1">
                Fief de livraison / prélèvement
              </label>
              <select
                value={activeProvince?.id ?? ''}
                onChange={e => setSelectedProvinceId(e.target.value)}
                className="w-full bg-parchment-light border border-parchment-border p-2 rounded text-sm font-serif"
              >
                {playerProvinces.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Stock actuel : {p.resources[selectedResource]} {selectedResource})
                  </option>
                ))}
              </select>
            </div>

            {/* Quantity Slider */}
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-iron-grey-700 mb-1">
                <span>Quantité : {tradeAmount} unités</span>
                <span>
                  {isBuyMode
                    ? `Trésor : ${player?.gold ?? 0} écus`
                    : `Stock fief : ${activeProvince?.resources[selectedResource] ?? 0}`}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                step="10"
                value={tradeAmount}
                onChange={e => setTradeAmount(Number(e.target.value))}
                className="w-full accent-royal-gold-600"
              />
            </div>

            {/* Transaction Receipt */}
            <div className="bg-parchment-50 p-3 rounded border border-parchment-border text-xs space-y-1.5">
              <div className="flex justify-between">
                <span>Cours unitaire :</span>
                <span className="font-bold">{commodity.currentPrice} écus</span>
              </div>
              <div className="flex justify-between">
                <span>Volume négocié :</span>
                <span className="font-bold">{tradeAmount} {selectedResource}</span>
              </div>
              <div className="flex justify-between text-sm font-bold pt-1.5 border-t border-parchment-border text-royal-gold-900">
                <span>{isBuyMode ? 'Montant à débiter :' : 'Montant à créditer :'}</span>
                <span>{totalCost} écus</span>
              </div>
            </div>

            {/* Submit Trade Button */}
            <WaxSealButton
              variant={isBuyMode ? 'gold' : 'seal'}
              size="lg"
              className="w-full"
              disabled={
                !activeProvince ||
                (isBuyMode
                  ? (player?.gold ?? 0) < totalCost
                  : (activeProvince.resources[selectedResource] ?? 0) < tradeAmount)
              }
              onClick={() => {
                if (activeProvince) {
                  onTrade(activeProvince.id, selectedResource, tradeAmount, isBuyMode);
                }
              }}
            >
              {isBuyMode ? `Acheter (${totalCost} écus)` : `Vendre (+${totalCost} écus)`}
            </WaxSealButton>
          </div>
        </ParchmentCard>

        {/* Historical Price Trend */}
        <ParchmentCard
          title="Historique des Cours"
          subtitle={`Évolution des prix sur les 24 derniers mois (${RESOURCE_LABELS[selectedResource].name})`}
        >
          <div className="space-y-4 font-serif">
            {/* Simple SVG Sparkline / Bar Chart */}
            <div className="w-full h-44 bg-parchment-50 p-3 rounded border border-parchment-border flex items-end gap-1.5 overflow-hidden">
              {commodity.priceHistory.map((price, idx) => {
                const maxPrice = Math.max(...commodity.priceHistory, 15);
                const barHeight = Math.max(10, (price / maxPrice) * 120);

                return (
                  <div
                    key={idx}
                    className="flex-1 flex flex-col items-center justify-end h-full group relative"
                  >
                    <div
                      className="w-full bg-royal-gold-500 hover:bg-royal-gold-400 rounded-t transition-all"
                      style={{ height: `${barHeight}px` }}
                    />
                    <span className="text-[9px] text-iron-grey-500 mt-1">M{idx + 1}</span>

                    {/* Tooltip on hover */}
                    <div className="absolute bottom-16 opacity-0 group-hover:opacity-100 bg-iron-grey-900 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none transition-opacity">
                      {price} écus
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="text-xs text-iron-grey-600 leading-relaxed bg-parchment-light p-3 rounded border border-parchment-border">
              💡 <strong>Astuce du marchand :</strong> L'automne apporte d'abondantes récoltes et fait chuter le cours du blé, tandis que l'hiver rigoureux augmente la consommation de 30% et fait flamber les prix.
            </div>
          </div>
        </ParchmentCard>
      </div>
    </div>
  );
};

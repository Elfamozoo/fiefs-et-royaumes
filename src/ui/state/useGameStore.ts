import { useState, useEffect, useCallback } from 'react';
import type { GameState, TaxRate, ResourceType, SpyMissionType, SpyResult } from '../../engine/types';
import {
  createInitialGameState,
  tickGameState,
  setProvinceTaxRate,
  recruitRegiment,
  moveArmy,
  executeMarketTrade,
  sendPigeonMessage,
  postPublicRumor,
  launchSpyMission,
  swearFealty,
} from '../../engine';

const SAVE_KEY = 'fiefs_et_royaumes_save_v1';

export function useGameStore() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load save from localStorage', e);
    }
    return createInitialGameState('Seigneur de Kald');
  });

  // Auto-save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(gameState));
    } catch (e) {
      console.warn('Failed to auto-save to localStorage', e);
    }
  }, [gameState]);

  const advanceTurn = useCallback(() => {
    setGameState(prev => tickGameState(prev));
  }, []);

  const changeTaxRate = useCallback((provinceId: string, rate: TaxRate) => {
    setGameState(prev => setProvinceTaxRate(prev, prev.playerLordId, provinceId, rate));
  }, []);

  const recruit = useCallback((provinceId: string, unitId: string, count: number) => {
    setGameState(prev => {
      const res = recruitRegiment(prev, prev.playerLordId, provinceId, unitId, count);
      return res.ok ? res.value : prev;
    });
  }, []);

  const move = useCallback((armyId: string, targetProvinceId: string) => {
    setGameState(prev => {
      const res = moveArmy(prev, armyId, targetProvinceId);
      return res.ok ? res.value : prev;
    });
  }, []);

  const trade = useCallback((provinceId: string, resource: ResourceType, amount: number, isBuy: boolean) => {
    setGameState(prev => {
      // Clone state for trade execution
      const clone = JSON.parse(JSON.stringify(prev));
      const res = executeMarketTrade(clone, clone.playerLordId, provinceId, resource, amount, isBuy);
      return res.state ?? prev;
    });
  }, []);

  const sendPigeon = useCallback((toLordId: string, content: string) => {
    setGameState(prev => sendPigeonMessage(prev, prev.playerLordId, toLordId, content));
  }, []);

  const postRumor = useCallback((text: string) => {
    setGameState(prev => postPublicRumor(prev, prev.playerLordId, text));
  }, []);

  const launchSpy = useCallback((missionType: SpyMissionType, targetProvinceId: string): SpyResult => {
    let result: SpyResult = { success: false, captured: false, details: '' };
    setGameState(prev => {
      const outcome = launchSpyMission(prev, prev.playerLordId, missionType, targetProvinceId);
      result = outcome.result;
      return outcome.state;
    });
    return result;
  }, []);

  const fealty = useCallback((suzerainId: string) => {
    setGameState(prev => swearFealty(prev, prev.playerLordId, suzerainId));
  }, []);

  const resetGame = useCallback((playerName: string = 'Seigneur de Kald') => {
    const fresh = createInitialGameState(playerName);
    setGameState(fresh);
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(fresh));
    } catch {}
  }, []);

  const exportSave = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(gameState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `fiefs_et_royaumes_save_m${gameState.month}.fief`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [gameState]);

  const importSave = useCallback((jsonStr: string) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed.lords && parsed.provinces && parsed.month) {
        setGameState(parsed);
        return true;
      }
    } catch (e) {
      console.error('Invalid save file', e);
    }
    return false;
  }, []);

  return {
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
  };
}

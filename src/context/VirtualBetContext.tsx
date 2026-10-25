import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { BetSelection, VirtualBet } from '../types/football.js';
import { soundEffects } from '../utils/soundUtils.js';

interface VirtualBetContextType {
  balance: number;
  selections: BetSelection[];
  betType: 'single' | 'accumulator';
  setBetType: (type: 'single' | 'accumulator') => void;
  stake: number;
  setStake: (stake: number) => void;
  addSelection: (selection: BetSelection) => void;
  removeSelection: (id: string) => void;
  clearSelections: () => void;
  isSelectionActive: (matchId: string, type: string) => boolean;
  totalOdds: number;
  potentialReturn: number;
  placeBet: () => boolean;
  myBets: VirtualBet[];
  settleBet: (betId: string, result: 'WON' | 'LOST') => void;
  resetBankroll: () => void;
  stats: {
    totalBets: number;
    wonBets: number;
    lostBets: number;
    winRate: number;
    netProfit: number;
  };
}

export const VirtualBetContext = createContext<VirtualBetContextType>({
  balance: 1000,
  selections: [],
  betType: 'accumulator',
  setBetType: () => {},
  stake: 50,
  setStake: () => {},
  addSelection: () => {},
  removeSelection: () => {},
  clearSelections: () => {},
  isSelectionActive: () => false,
  totalOdds: 1.0,
  potentialReturn: 0,
  placeBet: () => false,
  myBets: [],
  settleBet: () => {},
  resetBankroll: () => {},
  stats: {
    totalBets: 0,
    wonBets: 0,
    lostBets: 0,
    winRate: 0,
    netProfit: 0,
  },
});

export const VirtualBetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('medbet_balance');
      return saved ? parseFloat(saved) : 1000;
    } catch {
      return 1000;
    }
  });

  const [selections, setSelections] = useState<BetSelection[]>([]);
  const [betType, setBetType] = useState<'single' | 'accumulator'>('accumulator');
  const [stake, setStake] = useState<number>(50);

  const [myBets, setMyBets] = useState<VirtualBet[]>(() => {
    try {
      const saved = localStorage.getItem('medbet_my_bets');
      if (saved) return JSON.parse(saved);
      // Sample initial settled slip
      return [
        {
          id: 'bet-sample-1',
          type: 'single',
          selections: [
            {
              id: 'm-seriea-1_OVER_2_5',
              matchId: 'm-seriea-1',
              matchTitle: 'Inter Milan vs Juventus',
              matchTitleAr: 'إنتر ميلان ضد يوفنتوس',
              homeTeam: 'Inter Milan',
              awayTeam: 'Juventus',
              selectionType: 'OVER_2_5',
              selectionLabel: 'Over 2.5 Goals',
              selectionLabelAr: 'أكثر من 2.5 هدف',
              odds: 1.95,
              kickoffUtc: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
              matchStatus: 'FINISHED',
              currentScore: '4 - 4',
              isWon: true,
            },
          ],
          stake: 100,
          totalOdds: 1.95,
          potentialReturn: 195,
          status: 'WON',
          placedAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString(),
          settledAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('medbet_balance', balance.toString());
  }, [balance]);

  useEffect(() => {
    localStorage.setItem('medbet_my_bets', JSON.stringify(myBets));
  }, [myBets]);

  const addSelection = (sel: BetSelection) => {
    setSelections(prev => {
      // If same match has a selection, replace it with new one
      const filtered = prev.filter(s => s.matchId !== sel.matchId);
      const isAlreadySelected = prev.some(s => s.id === sel.id);
      if (isAlreadySelected) {
        // Toggle off
        return prev.filter(s => s.id !== sel.id);
      }
      return [...filtered, sel];
    });
    soundEffects.playBetPlaced();
  };

  const removeSelection = (id: string) => {
    setSelections(prev => prev.filter(s => s.id !== id));
  };

  const clearSelections = () => {
    setSelections([]);
  };

  const isSelectionActive = (matchId: string, type: string) => {
    return selections.some(s => s.matchId === matchId && s.selectionType === type);
  };

  // Calculate total odds
  const totalOdds = React.useMemo(() => {
    if (selections.length === 0) return 0;
    if (betType === 'single') {
      return selections[0]?.odds || 0;
    }
    const combined = selections.reduce((acc, curr) => acc * curr.odds, 1);
    return parseFloat(combined.toFixed(2));
  }, [selections, betType]);

  const potentialReturn = parseFloat((stake * totalOdds).toFixed(2));

  const placeBet = (): boolean => {
    if (selections.length === 0) return false;
    if (stake <= 0 || stake > balance) return false;

    const newBet: VirtualBet = {
      id: `slip-${Date.now()}`,
      type: selections.length > 1 ? 'accumulator' : 'single',
      selections: [...selections],
      stake,
      totalOdds,
      potentialReturn,
      status: 'OPEN',
      placedAt: new Date().toISOString(),
    };

    setBalance(prev => parseFloat((prev - stake).toFixed(2)));
    setMyBets(prev => [newBet, ...prev]);
    setSelections([]);
    soundEffects.playBetPlaced();
    return true;
  };

  const settleBet = (betId: string, result: 'WON' | 'LOST') => {
    setMyBets(prev =>
      prev.map(b => {
        if (b.id === betId && b.status === 'OPEN') {
          if (result === 'WON') {
            setBalance(cur => parseFloat((cur + b.potentialReturn).toFixed(2)));
            soundEffects.playGoalCelebration();
            try {
              confetti({
                particleCount: 80,
                spread: 70,
                origin: { y: 0.6 },
              });
            } catch {
              // ignore
            }
          }
          return {
            ...b,
            status: result,
            settledAt: new Date().toISOString(),
          };
        }
        return b;
      })
    );
  };

  const resetBankroll = () => {
    setBalance(1000);
  };

  // Stats calculation
  const stats = React.useMemo(() => {
    const settled = myBets.filter(b => b.status !== 'OPEN');
    const won = settled.filter(b => b.status === 'WON');
    const lost = settled.filter(b => b.status === 'LOST');

    const totalReturn = won.reduce((sum, b) => sum + b.potentialReturn, 0);
    const totalStaked = settled.reduce((sum, b) => sum + b.stake, 0);
    const netProfit = parseFloat((totalReturn - totalStaked).toFixed(2));

    const winRate = settled.length > 0 ? Math.round((won.length / settled.length) * 100) : 0;

    return {
      totalBets: myBets.length,
      wonBets: won.length,
      lostBets: lost.length,
      winRate,
      netProfit,
    };
  }, [myBets]);

  return (
    <VirtualBetContext.Provider
      value={{
        balance,
        selections,
        betType,
        setBetType,
        stake,
        setStake,
        addSelection,
        removeSelection,
        clearSelections,
        isSelectionActive,
        totalOdds,
        potentialReturn,
        placeBet,
        myBets,
        settleBet,
        resetBankroll,
        stats,
      }}
    >
      {children}
    </VirtualBetContext.Provider>
  );
};

export const useVirtualBet = () => useContext(VirtualBetContext);

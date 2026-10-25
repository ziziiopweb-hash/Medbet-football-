import React, { createContext, useContext, useState, useEffect } from 'react';

interface FavoritesContextType {
  favoriteMatches: string[];
  favoriteTeams: string[];
  favoriteLeagues: string[];
  toggleFavoriteMatch: (id: string) => void;
  isMatchFavorite: (id: string) => boolean;
  toggleFavoriteTeam: (id: string) => void;
  isTeamFavorite: (id: string) => boolean;
  toggleFavoriteLeague: (id: string) => void;
  isLeagueFavorite: (id: string) => boolean;
  hasFavorites: boolean;
}

export const FavoritesContext = createContext<FavoritesContextType>({
  favoriteMatches: [],
  favoriteTeams: [],
  favoriteLeagues: [],
  toggleFavoriteMatch: () => {},
  isMatchFavorite: () => false,
  toggleFavoriteTeam: () => {},
  isTeamFavorite: () => false,
  toggleFavoriteLeague: () => {},
  isLeagueFavorite: () => false,
  hasFavorites: false,
});

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favoriteMatches, setFavoriteMatches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('medbet_fav_matches');
      return saved ? JSON.parse(saved) : ['m-ucl-1']; // Default favorite
    } catch {
      return ['m-ucl-1'];
    }
  });

  const [favoriteTeams, setFavoriteTeams] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('medbet_fav_teams');
      return saved ? JSON.parse(saved) : ['real-madrid', 'al-hilal'];
    } catch {
      return ['real-madrid', 'al-hilal'];
    }
  });

  const [favoriteLeagues, setFavoriteLeagues] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('medbet_fav_leagues');
      return saved ? JSON.parse(saved) : ['ucl', 'epl'];
    } catch {
      return ['ucl', 'epl'];
    }
  });

  useEffect(() => {
    localStorage.setItem('medbet_fav_matches', JSON.stringify(favoriteMatches));
  }, [favoriteMatches]);

  useEffect(() => {
    localStorage.setItem('medbet_fav_teams', JSON.stringify(favoriteTeams));
  }, [favoriteTeams]);

  useEffect(() => {
    localStorage.setItem('medbet_fav_leagues', JSON.stringify(favoriteLeagues));
  }, [favoriteLeagues]);

  const toggleFavoriteMatch = (id: string) => {
    setFavoriteMatches(prev => (prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]));
  };

  const isMatchFavorite = (id: string) => favoriteMatches.includes(id);

  const toggleFavoriteTeam = (id: string) => {
    setFavoriteTeams(prev => (prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]));
  };

  const isTeamFavorite = (id: string) => favoriteTeams.includes(id);

  const toggleFavoriteLeague = (id: string) => {
    setFavoriteLeagues(prev => (prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]));
  };

  const isLeagueFavorite = (id: string) => favoriteLeagues.includes(id);

  return (
    <FavoritesContext.Provider
      value={{
        favoriteMatches,
        favoriteTeams,
        favoriteLeagues,
        toggleFavoriteMatch,
        isMatchFavorite,
        toggleFavoriteTeam,
        isTeamFavorite,
        toggleFavoriteLeague,
        isLeagueFavorite,
        hasFavorites: favoriteMatches.length > 0 || favoriteTeams.length > 0,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoritesContext);

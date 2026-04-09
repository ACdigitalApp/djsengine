import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

export type Language = 'en' | 'it';

const translations = {
  // Navigation
  'nav.dashboard': { en: 'Dashboard', it: 'Dashboard' },
  'nav.library': { en: 'Library', it: 'Libreria' },
  'nav.smartCrates': { en: 'Smart Crates', it: 'Crate Intelligenti' },
  'nav.sources': { en: 'Sources', it: 'Sorgenti' },
  'nav.settings': { en: 'Settings', it: 'Impostazioni' },

  // Library sidebar
  'sidebar.library': { en: 'Library', it: 'Libreria' },
  'sidebar.allTracks': { en: 'All Tracks', it: 'Tutti i Brani' },
  'sidebar.newArrivals': { en: 'New Arrivals', it: 'Nuovi Arrivi' },
  'sidebar.trending': { en: 'Trending', it: 'In Tendenza' },
  'sidebar.warmUp': { en: 'Warm Up', it: 'Warm Up' },
  'sidebar.peakTime': { en: 'Peak Time', it: 'Peak Time' },
  'sidebar.riempipista': { en: 'Riempipista', it: 'Riempipista' },
  'sidebar.toReview': { en: 'To Review', it: 'Da Valutare' },
  'sidebar.approved': { en: 'Approved', it: 'Approvati' },
  'sidebar.rejected': { en: 'Rejected', it: 'Rifiutati' },
  'sidebar.favorites': { en: 'Favorites', it: 'Preferiti' },
  'sidebar.sources': { en: 'Sources', it: 'Sorgenti' },
  'sidebar.localLibrary': { en: 'Local Library', it: 'Libreria Locale' },
  'sidebar.otherSources': { en: 'Other Sources', it: 'Altre Sorgenti' },
  'sidebar.soon': { en: 'Soon', it: 'Presto' },

  // Track table columns
  'col.titleArtist': { en: 'Title / Artist', it: 'Titolo / Artista' },
  'col.bpm': { en: 'BPM', it: 'BPM' },
  'col.key': { en: 'Key', it: 'Tonalità' },
  'col.energy': { en: 'Energy', it: 'Energia' },
  'col.genre': { en: 'Genre', it: 'Genere' },
  'col.affinity': { en: 'Affinity', it: 'Affinità' },
  'col.crowd': { en: 'Crowd', it: 'Crowd' },
  'col.fresh': { en: 'Fresh', it: 'Novità' },
  'col.fit': { en: 'Fit', it: 'Fit' },
  'col.source': { en: 'Source', it: 'Sorgente' },
  'col.status': { en: 'Status', it: 'Stato' },

  // Filters
  'filter.searchTracks': { en: 'Search tracks...', it: 'Cerca brani...' },
  'filter.bpmMin': { en: 'BPM min', it: 'BPM min' },
  'filter.bpmMax': { en: 'BPM max', it: 'BPM max' },
  'filter.allKeys': { en: 'All Keys', it: 'Tutte le Tonalità' },
  'filter.allGenres': { en: 'All Genres', it: 'Tutti i Generi' },
  'filter.clear': { en: 'Clear', it: 'Pulisci' },

  // Status
  'status.approved': { en: 'Approved', it: 'Approvato' },
  'status.rejected': { en: 'Rejected', it: 'Rifiutato' },
  'status.toReview': { en: 'To Review', it: 'Da Valutare' },

  // Recommendation panel
  'rec.selectedTrack': { en: 'Selected Track', it: 'Brano Selezionato' },
  'rec.bestFor': { en: 'Best for', it: 'Ideale per' },
  'rec.recommendedNext': { en: 'Recommended Next', it: 'Consigliati Dopo' },
  'rec.moreOptions': { en: 'More options', it: 'Altre opzioni' },
  'rec.selectTrack': { en: 'Select a track to see recommendations', it: 'Seleziona un brano per le raccomandazioni' },

  // Recommendation reasons
  'reason.bpmMatch': { en: 'BPM match', it: 'BPM compatibile' },
  'reason.keyMatch': { en: 'Key match', it: 'Tonalità compatibile' },
  'reason.keyCompatible': { en: 'Key compatible', it: 'Tonalità affine' },
  'reason.sameEnergy': { en: 'Same energy', it: 'Stessa energia' },
  'reason.energyUp': { en: 'Energy up', it: 'Energia in salita' },
  'reason.energyDown': { en: 'Energy down', it: 'Energia in discesa' },
  'reason.highCrowd': { en: 'High crowd', it: 'Alto potenziale crowd' },
  'reason.highAffinity': { en: 'High affinity', it: 'Alta affinità' },
  'reason.fresh': { en: 'Fresh pick', it: 'Novità fresca' },
  'reason.sameGenre': { en: 'Same genre', it: 'Stesso genere' },

  // Actions
  'action.approve': { en: 'Approve', it: 'Approva' },
  'action.reject': { en: 'Reject', it: 'Rifiuta' },
  'action.favorite': { en: 'Favorite', it: 'Preferito' },
  'action.riempipista': { en: 'Riempipista', it: 'Riempipista' },
  'action.save': { en: 'Save', it: 'Salva' },
  'action.addToPlaylist': { en: 'Add to playlist', it: 'Aggiungi a playlist' },
  'action.removeFavorite': { en: 'Remove from favorites', it: 'Rimuovi dai preferiti' },
  'action.savedFavorite': { en: 'Saved to favorites', it: 'Salvato nei preferiti' },
  'action.removedFavorite': { en: 'Removed from favorites', it: 'Rimosso dai preferiti' },
  'action.playlistComingSoon': { en: 'Playlist: coming soon', it: 'Playlist: in arrivo' },

  // Audio player
  'player.uploadAudio': { en: 'Upload audio', it: 'Carica audio' },
  'player.audioUploaded': { en: 'Audio uploaded!', it: 'Audio caricato!' },
  'player.artworkUploaded': { en: 'Artwork uploaded!', it: 'Copertina caricata!' },
  'player.uploadError': { en: 'Upload error', it: 'Errore upload' },
  'player.noAudio': { en: 'No audio', it: 'Nessun audio' },

  // Dashboard
  'dash.title': { en: 'Dashboard', it: 'Dashboard' },
  'dash.subtitle': { en: 'Your music selection overview', it: 'Panoramica della tua selezione musicale' },
  'dash.totalTracks': { en: 'Total Tracks', it: 'Brani Totali' },
  'dash.newRecommended': { en: 'New Recommended', it: 'Nuovi Consigliati' },
  'dash.highCrowd': { en: 'High Crowd', it: 'Alto Crowd' },
  'dash.toReview': { en: 'To Review', it: 'Da Valutare' },
  'dash.approved': { en: 'Approved', it: 'Approvati' },
  'dash.rejected': { en: 'Rejected', it: 'Rifiutati' },
  'dash.topRecommended': { en: 'Top Recommended New', it: 'Top Nuovi Consigliati' },
  'dash.bestWarmup': { en: 'Best Warm-Up', it: 'Migliori Warm-Up' },
  'dash.peakBangers': { en: 'Peak Time Bangers', it: 'Hit da Peak Time' },
  'dash.noTracks': { en: 'No tracks yet', it: 'Nessun brano ancora' },

  // Settings
  'settings.title': { en: 'Settings', it: 'Impostazioni' },
  'settings.subtitle': { en: 'Configure recommendation engine parameters', it: 'Configura i parametri del motore di raccomandazione' },
  'settings.mixWeights': { en: 'Mix Compatibility Weights', it: 'Pesi Compatibilità Mix' },
  'settings.weightsDesc': { en: 'Adjust how much each factor influences the compatibility score. Total:', it: 'Regola quanto ogni fattore influenza il punteggio di compatibilità. Totale:' },
  'settings.bpmCompat': { en: 'BPM Compatibility', it: 'Compatibilità BPM' },
  'settings.keyCompat': { en: 'Key Compatibility', it: 'Compatibilità Tonalità' },
  'settings.energyMatch': { en: 'Energy Match', it: 'Corrispondenza Energia' },
  'settings.soundAffinity': { en: 'Sound Affinity', it: 'Affinità Sonora' },
  'settings.crowdScore': { en: 'Crowd Score', it: 'Punteggio Crowd' },
  'settings.personalFit': { en: 'Personal Fit', it: 'Compatibilità Personale' },
  'settings.preferences': { en: 'Preferences', it: 'Preferenze' },
  'settings.bpmTolerance': { en: 'BPM Tolerance Range', it: 'Tolleranza BPM' },
  'settings.keyStrictness': { en: 'Key Compatibility Strictness', it: 'Rigidità Compatibilità Tonalità' },
  'settings.energyPref': { en: 'Energy Preference (low→high)', it: 'Preferenza Energia (bassa→alta)' },
  'settings.freshnessImportance': { en: 'Freshness Importance', it: 'Importanza Novità' },
  'settings.crowdImportance': { en: 'Crowd Score Importance', it: 'Importanza Punteggio Crowd' },
  'settings.save': { en: 'Save Settings', it: 'Salva Impostazioni' },
  'settings.saved': { en: 'Settings saved', it: 'Impostazioni salvate' },
  'settings.language': { en: 'Language', it: 'Lingua' },
  'settings.languageDesc': { en: 'Choose the app language', it: 'Scegli la lingua dell\'app' },

  // Crates
  'crates.title': { en: 'Smart Crates', it: 'Crate Intelligenti' },
  'crates.subtitle': { en: 'Auto-organized collections based on scoring rules', it: 'Collezioni automatiche basate su regole di punteggio' },
  'crates.warmUp': { en: 'Warm Up', it: 'Warm Up' },
  'crates.warmUpDesc': { en: 'Low energy, smooth openers', it: 'Bassa energia, aperture fluide' },
  'crates.primeTime': { en: 'Prime Time', it: 'Prime Time' },
  'crates.primeTimeDesc': { en: 'Building momentum', it: 'Costruzione del momento' },
  'crates.peakTime': { en: 'Peak Time', it: 'Peak Time' },
  'crates.peakTimeDesc': { en: 'Maximum energy bangers', it: 'Hit ad alta energia' },
  'crates.closing': { en: 'Closing', it: 'Chiusura' },
  'crates.closingDesc': { en: 'Wind down tracks', it: 'Brani per chiudere' },
  'crates.newHeat': { en: 'New Heat', it: 'Novità Calde' },
  'crates.newHeatDesc': { en: 'Fresh high-scoring tracks', it: 'Novità con punteggio alto' },
  'crates.safeMix': { en: 'Safe Mix', it: 'Mix Sicuro' },
  'crates.safeMixDesc': { en: 'Proven crowd pleasers', it: 'Successi comprovati per il pubblico' },
  'crates.energyUp': { en: 'Energy Up', it: 'Energia Su' },
  'crates.energyUpDesc': { en: 'Tracks to raise energy', it: 'Brani per alzare l\'energia' },
  'crates.riempipista': { en: 'Riempipista', it: 'Riempipista' },
  'crates.riem pipistaDesc': { en: 'Guaranteed floor fillers', it: 'Riempi pista garantiti' },
  'crates.similarFav': { en: 'Similar to Favorites', it: 'Simili ai Preferiti' },
  'crates.similarFavDesc': { en: 'Matches your top picks', it: 'Corrispondenze con le tue scelte' },
  'crates.highCompat': { en: 'High Compatibility', it: 'Alta Compatibilità' },
  'crates.highCompatDesc': { en: 'Best mixing candidates', it: 'Migliori candidati per il mix' },
  'crates.gems': { en: 'Underused Gems', it: 'Gemme Nascoste' },
  'crates.gemsDesc': { en: 'Great tracks, rarely played', it: 'Ottimi brani, raramente suonati' },
  'crates.moreTracks': { en: 'more tracks', it: 'altri brani' },
  'crates.noTracks': { en: 'No matching tracks', it: 'Nessun brano corrispondente' },

  // Sources
  'sources.title': { en: 'Sources', it: 'Sorgenti' },
  'sources.subtitle': { en: 'Music source adapters and integrations', it: 'Adattatori e integrazioni sorgenti musicali' },
  'sources.active': { en: 'Active', it: 'Attivo' },
  'sources.placeholder': { en: 'Placeholder', it: 'Segnaposto' },
  'sources.activeDesc': { en: 'Connected and active. Tracks are imported from your local files.', it: 'Connesso e attivo. I brani vengono importati dai tuoi file locali.' },
  'sources.placeholderDesc': { en: 'This adapter is a placeholder for future integration. No real data connection exists yet.', it: 'Questo adattatore è un segnaposto per integrazioni future. Nessuna connessione reale.' },
  'sources.mockWarning': { en: 'This is a mock adapter. It returns demo data only. Real API integration requires proper credentials and legal access.', it: 'Questo è un adattatore fittizio. Restituisce solo dati demo. L\'integrazione API reale richiede credenziali e accesso legale.' },
  'sources.adapterMethods': { en: 'Adapter methods', it: 'Metodi adattatore' },
  'sources.archNotes': { en: 'Architecture Notes', it: 'Note Architettura' },
  'sources.archDesc': { en: 'Each source adapter implements a common interface with methods for fetching trending tracks, new releases, searching, and mapping external data to the internal track model. The adapter pattern allows adding new sources without modifying existing code. Placeholder adapters return mock data and are clearly marked as non-functional.', it: 'Ogni adattatore sorgente implementa un\'interfaccia comune con metodi per ottenere brani in tendenza, nuove uscite, ricerca e mappatura dei dati esterni nel modello interno. Il pattern adapter consente di aggiungere nuove sorgenti senza modificare il codice esistente.' },

  // Track detail
  'detail.backToLibrary': { en: 'Back to Library', it: 'Torna alla Libreria' },
  'detail.duration': { en: 'Duration', it: 'Durata' },
  'detail.recommendedNext': { en: 'Recommended Next', it: 'Consigliati Dopo' },

  // Use cases
  'useCase.warmUp': { en: 'Warm Up', it: 'Warm Up' },
  'useCase.midSet': { en: 'Mid Set', it: 'Mid Set' },
  'useCase.peakTime': { en: 'Peak Time', it: 'Peak Time' },
  'useCase.closing': { en: 'Closing', it: 'Chiusura' },

  // General
  'general.loading': { en: 'Loading tracks...', it: 'Caricamento brani...' },
  'general.noTracks': { en: 'No tracks found', it: 'Nessun brano trovato' },
  'general.trackNotFound': { en: 'Track not found', it: 'Brano non trovato' },
} as const;

type TranslationKey = keyof typeof translations;

interface I18nContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('dj-engine-lang');
    return (saved === 'it' || saved === 'en') ? saved : 'en';
  });

  const setLang = useCallback((l: Language) => {
    setLangState(l);
    localStorage.setItem('dj-engine-lang', l);
  }, []);

  const t = useCallback((key: TranslationKey): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[lang] || entry.en;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

import type { Track, RecommendationWeights, DEFAULT_WEIGHTS } from '@/types/track';

// Camelot wheel key compatibility
const CAMELOT_WHEEL: Record<string, number[]> = {
  '1A': [1], '1B': [1], '2A': [2], '2B': [2], '3A': [3], '3B': [3],
  '4A': [4], '4B': [4], '5A': [5], '5B': [5], '6A': [6], '6B': [6],
  '7A': [7], '7B': [7], '8A': [8], '8B': [8], '9A': [9], '9B': [9],
  '10A': [10], '10B': [10], '11A': [11], '11B': [11], '12A': [12], '12B': [12],
};

function getKeyNumber(key: string): { num: number; mode: string } | null {
  const match = key.match(/^(\d+)(A|B)$/);
  if (!match) return null;
  return { num: parseInt(match[1]), mode: match[2] };
}

export function keyCompatibility(key1: string | null, key2: string | null): number {
  if (!key1 || !key2) return 50;
  const k1 = getKeyNumber(key1);
  const k2 = getKeyNumber(key2);
  if (!k1 || !k2) return 50;
  
  // Same key = 100
  if (k1.num === k2.num && k1.mode === k2.mode) return 100;
  // Same number different mode = 80 (relative major/minor)
  if (k1.num === k2.num) return 80;
  // Adjacent on Camelot wheel = 85
  const diff = Math.abs(k1.num - k2.num);
  const circularDiff = Math.min(diff, 12 - diff);
  if (circularDiff === 1 && k1.mode === k2.mode) return 85;
  if (circularDiff <= 2) return 60;
  if (circularDiff <= 3) return 40;
  return 20;
}

export function bpmCompatibility(bpm1: number | null, bpm2: number | null, tolerance: number = 6): number {
  if (!bpm1 || !bpm2) return 50;
  const diff = Math.abs(bpm1 - bpm2);
  if (diff <= 1) return 100;
  if (diff <= tolerance / 2) return 90;
  if (diff <= tolerance) return 70;
  // Check half/double time
  const halfDouble = Math.min(Math.abs(bpm1 - bpm2 * 2), Math.abs(bpm1 * 2 - bpm2));
  if (halfDouble <= tolerance) return 65;
  if (diff <= tolerance * 2) return 40;
  return 15;
}

export function energyMatch(e1: number | null, e2: number | null): number {
  if (e1 === null || e2 === null) return 50;
  const diff = Math.abs(e1 - e2);
  if (diff === 0) return 100;
  if (diff === 1) return 85;
  if (diff === 2) return 65;
  if (diff <= 3) return 45;
  return 20;
}

export function calculateCompatibility(
  source: Track,
  candidate: Track,
  weights: RecommendationWeights = { bpm: 25, key: 20, energy: 15, affinity: 20, crowd: 10, personalFit: 10 }
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  
  const bpmScore = bpmCompatibility(source.bpm, candidate.bpm);
  const keyScore = keyCompatibility(source.key, candidate.key);
  const energyScore = energyMatch(source.energy, candidate.energy);
  const affinityScore = (candidate.affinity_score || 0) * 10;
  const crowdScoreVal = (candidate.crowd_score || 0) * 10;
  const fitScore = (candidate.personal_fit_score || 0) * 10;
  
  const totalWeight = weights.bpm + weights.key + weights.energy + weights.affinity + weights.crowd + weights.personalFit;
  const score = Math.round(
    (bpmScore * weights.bpm + keyScore * weights.key + energyScore * weights.energy +
     affinityScore * weights.affinity + crowdScoreVal * weights.crowd + fitScore * weights.personalFit) / totalWeight
  );
  
  if (bpmScore >= 85) reasons.push(`Compatible BPM (${candidate.bpm})`);
  if (keyScore >= 80) reasons.push(`Harmonic key match (${candidate.key})`);
  if (energyScore >= 80) reasons.push('Similar energy level');
  if (crowdScoreVal >= 70) reasons.push('Strong crowd potential');
  if (affinityScore >= 70) reasons.push('High sound affinity');
  if (fitScore >= 70) reasons.push('Matches your style');
  if ((candidate.freshness_score || 0) >= 7) reasons.push('Fresh alternative');
  if (bpmScore >= 90 && keyScore >= 80) reasons.push('Excellent transition potential');
  
  if (reasons.length === 0) {
    if (score >= 60) reasons.push('Good overall compatibility');
    else reasons.push('Exploratory pick');
  }
  
  return { score: Math.min(100, Math.max(0, score)), reasons };
}

export function getTrackUseCase(track: Track): string {
  const energy = track.energy || 5;
  const bpm = track.bpm || 120;
  
  if (energy <= 3 || bpm < 115) return 'Warm Up';
  if (energy <= 5) return 'Mid Set';
  if (energy >= 8 || bpm >= 130) return 'Peak Time';
  if (energy >= 6) return 'Prime Time';
  return 'Closing';
}

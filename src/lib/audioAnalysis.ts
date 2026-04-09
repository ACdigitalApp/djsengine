import MusicTempo from 'music-tempo';
import { convertKeyToCamelot } from '@/lib/adapters/virtualdj';

/**
 * Krumhansl-Schmuckler key profiles
 */
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function correlate(chromagram: number[], profile: number[]): number {
  const n = profile.length;
  let sumXY = 0, sumX = 0, sumY = 0, sumX2 = 0, sumY2 = 0;
  for (let i = 0; i < n; i++) {
    sumXY += chromagram[i] * profile[i];
    sumX += chromagram[i];
    sumY += profile[i];
    sumX2 += chromagram[i] * chromagram[i];
    sumY2 += profile[i] * profile[i];
  }
  const num = n * sumXY - sumX * sumY;
  const den = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
  return den === 0 ? 0 : num / den;
}

function detectKey(audioBuffer: AudioBuffer): string {
  const data = audioBuffer.getChannelData(0);
  const sampleRate = audioBuffer.sampleRate;
  
  // Build chromagram using simple FFT-based approach
  const fftSize = 4096;
  const chromagram = new Array(12).fill(0);
  const hopSize = fftSize / 2;
  
  // Use OfflineAudioContext-free approach: manual DFT on small windows
  const numFrames = Math.floor((data.length - fftSize) / hopSize);
  
  for (let frame = 0; frame < Math.min(numFrames, 200); frame++) {
    const start = frame * hopSize;
    // Compute power at each pitch class frequency
    for (let pitchClass = 0; pitchClass < 12; pitchClass++) {
      // Check octaves 2-6
      for (let octave = 2; octave <= 6; octave++) {
        const freq = 440 * Math.pow(2, (pitchClass - 9) / 12 + (octave - 4));
        const k = Math.round(freq * fftSize / sampleRate);
        if (k <= 0 || k >= fftSize / 2) continue;
        
        // Goertzel algorithm for single frequency
        let s0 = 0, s1 = 0, s2 = 0;
        const coeff = 2 * Math.cos(2 * Math.PI * k / fftSize);
        for (let i = 0; i < fftSize; i++) {
          s0 = (data[start + i] || 0) + coeff * s1 - s2;
          s2 = s1;
          s1 = s0;
        }
        const power = s1 * s1 + s2 * s2 - coeff * s1 * s2;
        chromagram[pitchClass] += Math.abs(power);
      }
    }
  }

  // Normalize
  const maxVal = Math.max(...chromagram);
  if (maxVal > 0) {
    for (let i = 0; i < 12; i++) chromagram[i] /= maxVal;
  }

  // Correlate with all major and minor profiles (all rotations)
  let bestCorr = -Infinity;
  let bestKey = 'C';
  let bestMode = 'major';

  for (let shift = 0; shift < 12; shift++) {
    const rotated = [...chromagram.slice(shift), ...chromagram.slice(0, shift)];
    
    const majorCorr = correlate(rotated, MAJOR_PROFILE);
    if (majorCorr > bestCorr) {
      bestCorr = majorCorr;
      bestKey = NOTE_NAMES[shift];
      bestMode = 'major';
    }
    
    const minorCorr = correlate(rotated, MINOR_PROFILE);
    if (minorCorr > bestCorr) {
      bestCorr = minorCorr;
      bestKey = NOTE_NAMES[shift];
      bestMode = 'minor';
    }
  }

  // Convert to standard notation for Camelot conversion
  const keyStr = bestMode === 'minor' ? `${bestKey}m` : bestKey;
  return keyStr;
}

function detectBPM(audioBuffer: AudioBuffer): number {
  const data = audioBuffer.getChannelData(0);
  const floatArray = new Float32Array(data);
  const mt = new MusicTempo(floatArray);
  return Math.round(mt.tempo);
}

export interface AnalysisResult {
  bpm: number;
  key: string; // Camelot notation
  rawKey: string; // e.g. "Am", "C"
}

export async function analyzeAudioFile(file: File): Promise<AnalysisResult> {
  const arrayBuffer = await file.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    const bpm = detectBPM(audioBuffer);
    const rawKey = detectKey(audioBuffer);
    const key = convertKeyToCamelot(rawKey) || rawKey;
    
    return { bpm, key, rawKey };
  } finally {
    await audioContext.close();
  }
}

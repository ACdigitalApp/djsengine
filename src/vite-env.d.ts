/// <reference types="vite/client" />

declare module 'music-tempo' {
  class MusicTempo {
    constructor(audioData: Float32Array, params?: Record<string, any>);
    tempo: number;
    beats: number[];
  }
  export default MusicTempo;
}

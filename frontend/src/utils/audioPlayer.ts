const SAMPLE_RATE = 24000;

function pcm16ToFloat32(pcm: Uint8Array): Float32Array {
  const samples = pcm.length / 2;
  const float32 = new Float32Array(samples);
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength);
  for (let i = 0; i < samples; i++) {
    const int16 = view.getInt16(i * 2, true);
    float32[i] = int16 / 32768;
  }
  return float32;
}

export class AudioStreamPlayer {
  private ctx: AudioContext;
  private gainNode: GainNode;
  analyser: AnalyserNode;
  private nextStartTime = 0;
  private _playing = false;
  private scheduledCount = 0;

  constructor() {
    this.ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
    this.gainNode = this.ctx.createGain();
    this.analyser = this.ctx.createAnalyser();
    this.analyser.fftSize = 256;
    this.gainNode.connect(this.analyser);
    this.analyser.connect(this.ctx.destination);
  }

  get playing(): boolean {
    return this._playing;
  }

  async resume(): Promise<void> {
    if (this.ctx.state === "suspended") {
      await this.ctx.resume();
    }
  }

  feedChunk(base64Pcm: string): void {
    const binaryStr = atob(base64Pcm);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const float32 = pcm16ToFloat32(bytes);
    if (float32.length === 0) return;

    const buffer = this.ctx.createBuffer(1, float32.length, SAMPLE_RATE);
    buffer.getChannelData(0).set(float32);

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.gainNode);

    const now = this.ctx.currentTime;
    const startAt = Math.max(now, this.nextStartTime);
    source.start(startAt);
    this.nextStartTime = startAt + buffer.duration;

    this.scheduledCount++;
    this._playing = true;

    source.onended = () => {
      this.scheduledCount--;
      if (this.scheduledCount <= 0) {
        this.scheduledCount = 0;
        this._playing = false;
      }
    };
  }

  reset(): void {
    this.nextStartTime = 0;
    this.scheduledCount = 0;
    this._playing = false;
  }

  getFrequencyData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  getTimeDomainData(): Uint8Array {
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteTimeDomainData(data);
    return data;
  }

  setVolume(volume: number): void {
    this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
  }

  destroy(): void {
    this.ctx.close();
  }
}

/* ROCKY SAVES THE UNIVERSE — audio.js
 * Rocky's whole world is this file's subject matter, so it had better be good.
 * The engine says WHAT happened (a cue id). This decides what it sounds like.
 */
(function (root) {
  'use strict';
  const CFG = root.ROCKY_CFG;
  let ctx = null, master = null, on = true;

  function start() {
    if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
    const AC = root.AudioContext || root.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = CFG.audio.master;
    master.connect(ctx.destination);
  }

  function ping(freq, dur, type, vol, sweepTo) {
    if (!ctx || !on) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (sweepTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, sweepTo), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol == null ? 0.3 : vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.02);
  }

  function noise(dur, cut, vol) {
    if (!ctx || !on) return;
    const t = ctx.currentTime;
    const n = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, n, ctx.sampleRate);
    const dat = buf.getChannelData(0);
    for (let i = 0; i < n; i++) dat[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = ctx.createBufferSource();
    s.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cut || 900;
    const g = ctx.createGain();
    g.gain.value = vol == null ? 0.18 : vol;
    s.connect(f); f.connect(g); g.connect(master);
    s.start(t);
  }

  /* An Eridian pulse is a hard click, and then the room answers. */
  const CUES = {
    pulse: function () {
      ping(CFG.audio.pulseHz * 2, 0.055, 'square', 0.16, CFG.audio.pulseHz);
      setTimeout(function () { noise(0.5, 700, 0.07); }, 90);
    },
    jump: function () { ping(180, 0.1, 'triangle', 0.14, 300); },
    land: function () { noise(0.14, 260, 0.22); },
    /* five legs, so a footfall is a little scatter of clicks, not one thump */
    step: function () {
      noise(0.05, 1600, 0.05);
      setTimeout(function () { noise(0.04, 1200, 0.035); }, 32);
    },
    gauge: function () {
      ping(880, 0.09, 'sine', 0.2);
      setTimeout(function () { ping(1320, 0.12, 'sine', 0.16); }, 100);
    },
    take: function () { ping(300, 0.07, 'triangle', 0.16, 460); },
    place: function () { noise(0.2, 340, 0.3); ping(140, 0.16, 'sine', 0.2, 90); },
    /* the resonator hears you: a bell finding its own note */
    ear: function () {
      ping(1320, 0.5, 'sine', 0.22);
      setTimeout(function () { ping(1980, 0.6, 'sine', 0.14); }, 60);
    },
    /* a bell shouting back: struck, and then it rings on */
    bell: function () {
      ping(784, 0.9, 'sine', 0.24);
      ping(1176, 0.7, 'sine', 0.12);
      setTimeout(function () { ping(1568, 0.5, 'sine', 0.07); }, 40);
    },
    door: function () {
      noise(0.6, 200, 0.3);
      [220, 165, 110].forEach(function (f, i) { setTimeout(function () { ping(f, 0.35, 'sawtooth', 0.1); }, i * 90); });
    },
    chapter: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.5, 'sine', 0.16); }, i * 150);
      });
    },
    'source:vent': function () { noise(0.32, 420, 0.05); },
    'source:pipe': function () { ping(320, 0.16, 'sine', 0.035); },
    'source:drip': function () { ping(1400, 0.05, 'sine', 0.03, 900); },
    'source:gauge': function () { ping(1100, 0.06, 'sine', 0.025); }
  };

  root.RockyAudio = {
    start: start,
    cue: function (id) { const f = CUES[id]; if (f) f(); },
    setOn: function (v) { on = !!v; },
    /* the test suite asks this: every cue the ENGINE can utter must have a voice */
    ids: function () { return Object.keys(CUES); }
  };
})(typeof self !== 'undefined' ? self : this);

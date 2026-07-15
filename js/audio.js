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
    feed: function () { noise(0.18, 500, 0.16); ping(160, 0.1, 'sine', 0.1, 110); },
    /* the forge makes a thing: a hiss, and then it rings like what it now is */
    craft: function () {
      noise(0.35, 1800, 0.2);
      [440, 660, 880, 1320].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.4, 'sine', 0.16); }, 120 + i * 70);
      });
    },
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
    /* a step of the walkthrough falls into place */
    'step:done': function () {
      ping(880, 0.14, 'sine', 0.18);
      setTimeout(function () { ping(1320, 0.22, 'sine', 0.14); }, 90);
    },
    chapter: function () {
      [523, 659, 784, 1046].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.5, 'sine', 0.16); }, i * 150);
      });
    },
    /* the way out, calling: a soft open fifth, and it does not stop */
    'source:exit': function () {
      ping(659, 0.55, 'sine', 0.05);
      ping(988, 0.45, 'sine', 0.035);
    },
    exitopen: function () {
      [659, 988, 1319].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.7, 'sine', 0.16); }, i * 130);
      });
    },
    done: function () {
      [523, 659, 784, 1046, 1319].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.8, 'sine', 0.18); }, i * 120);
      });
    },
    /* the air comes back: a rush, and then the room is loud again */
    pressure: function () {
      noise(1.2, 900, 0.30);
      [131, 196, 262, 392].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.9, 'sine', 0.16); }, 260 + i * 110);
      });
    },
    /* somebody working: a tap, a scrape, a thing being put down */
    'source:folk': function () {
      ping(392 + Math.random() * 180, 0.06, 'triangle', 0.05);
      setTimeout(function () { noise(0.07, 1100, 0.04); }, 70 + Math.random() * 90);
    },
    meet: function () {
      [440, 587, 740].forEach(function (f, i) {
        setTimeout(function () { ping(f, 0.45, 'sine', 0.15); }, i * 110);
      });
    },
    'source:vent': function () { noise(0.32, 420, 0.05); },
    'source:pipe': function () { ping(320, 0.16, 'sine', 0.035); },
    'source:drip': function () { ping(1400, 0.05, 'sine', 0.03, 900); },
    'source:gauge': function () { ping(1100, 0.06, 'sine', 0.025); },
    /* THE BURN: a low rolling roar with a body under it, throbbing on the drive's clock.
     * It is the loudest thing in the game and it should sit UNDER everything, felt more
     * than heard — the sound of being carried. */
    'source:burn': function () { noise(0.6, 150, 0.055); ping(58, 0.5, 'sine', 0.045); }
  };

  /* THE ROOM ANSWERS IN ITS OWN VOICE.
   * PLAYTEST: "the sounds don't sound all that much different to me." They did not,
   * because they were not sounds at all — every material had a colour and a texture
   * and nothing to say. Now each one has a NOTE, and when your pulse comes home the
   * room plays back a chord of whatever it hit, each material as loud as the share of
   * the echo it accounts for.
   *
   * So a basalt corridor comes back a low, dull hum. A gallery of xenonite and bells
   * comes back bright and ringing. A room with grit in it has a hole in the chord.
   * You can hear the difference between two rooms with your eyes shut, which is the
   * entire premise of this game and was, until now, a lie. */
  function chord(mix) {
    if (!ctx || !on || !mix.length) return;
    const t = ctx.currentTime;
    mix.slice(0, 5).forEach(function (m, i) {
      if (!m.note || m.share < 0.03) return;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = m.note > 500 ? 'sine' : 'triangle';
      o.frequency.setValueAtTime(m.note, t);
      const vol = Math.min(0.16, 0.03 + m.share * 0.26);
      const dur = 0.5 + m.share * 0.8;
      const at = t + i * 0.035;
      g.gain.setValueAtTime(0.0001, at);
      g.gain.exponentialRampToValueAtTime(vol, at + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
      o.connect(g); g.connect(master);
      o.start(at); o.stop(at + dur + 0.02);
    });
  }

  root.RockyAudio = {
    start: start,
    chord: chord,
    cue: function (id) { const f = CUES[id]; if (f) f(); },
    setOn: function (v) { on = !!v; },
    /* the test suite asks this: every cue the ENGINE can utter must have a voice */
    ids: function () { return Object.keys(CUES); }
  };
})(typeof self !== 'undefined' ? self : this);

/* ROCKY SAVES THE UNIVERSE — anonymous, cookieless analytics.
 * =============================================================================
 * The whole point: know how many people find the game, where they came from, and
 * how far they get before they wander off -- WITHOUT a cookie banner, a login, or
 * shipping anyone's identity anywhere. There is no personal data here. A random id
 * lives in localStorage so a returning player is not counted as a new one; that is
 * the extent of it, and it never leaves this browser except as that opaque string.
 *
 * WHERE IT GOES: an n8n Webhook. The game is served from automate.bworldtools.com but
 * n8n lives on n8n.bworldtools.com, so this POST is CROSS-ORIGIN. To dodge a CORS
 * preflight (which sendBeacon cannot perform), the body goes as text/plain -- a
 * CORS-"simple" request that the browser sends cross-origin without asking permission.
 * The payload is still JSON, just carried as text; the n8n side JSON-parses it (the
 * Flatten node already handles a string body). Build a Webhook node -- HTTP Method
 * POST, Path `rocky-analytics` -- ACTIVATE it, and match its production URL to ENDPOINT.
 *
 * WHAT IT SENDS (JSON body):
 *   event   'visit' | 'chapter' | 'finished' | 'session_end'
 *   cid     anonymous per-browser id (stable across visits)
 *   sid     per-page-load id (one play session)
 *   t       epoch ms
 *   ref     document.referrer (where they came from -- x.com, a discord link, etc.)
 *   ver     cache version, so you can tell old clients from new
 *   visit:        returning, w, h, dpr, lang, ua, standalone (installed as an app?)
 *   chapter:      id, chapterIndex (1-based), name   <- the funnel
 *   finished:     (they reached the sunrise)
 *   session_end:  durationS, furthest, furthestIndex  <- how deep they got, sent on leave
 *
 * RESPECTS Do Not Track / Global Privacy Control: if the browser asks not to be
 * tracked, this sends nothing at all. Set ENDPOINT to '' to switch it off entirely.
 * ========================================================================== */
(function () {
  'use strict';

  var ENDPOINT = 'https://n8n.bworldtools.com/webhook/rocky-analytics';
  var VER = 'rocky-v72';

  var dnt = navigator.doNotTrack === '1' || window.doNotTrack === '1' ||
            navigator.msDoNotTrack === '1' || navigator.globalPrivacyControl === true;
  var off = dnt || !ENDPOINT;

  function rid() {
    try { return 'r' + (Date.now().toString(36)) + Math.random().toString(36).slice(2, 10); }
    catch (e) { return 'r' + Math.random(); }
  }

  // a stable anonymous id, and whether we have seen this browser before
  var cid, returning = false;
  try {
    cid = localStorage.getItem('rocky_cid');
    if (cid) returning = true; else { cid = rid(); localStorage.setItem('rocky_cid', cid); }
  } catch (e) { cid = rid(); }   // private mode / storage blocked: still counts, just always "new"

  var sid = rid();
  var t0 = Date.now();
  var furthest = { id: '', i: -1 };

  function post(event, props) {
    if (off) return;
    var body = { event: event, cid: cid, sid: sid, t: Date.now(), ref: document.referrer || '', ver: VER };
    if (props) for (var k in props) if (Object.prototype.hasOwnProperty.call(props, k)) body[k] = props[k];
    var json = '';
    try { json = JSON.stringify(body); } catch (e) { return; }
    // sendBeacon survives the page being closed (the whole reason session_end can fire on
    // leave). text/plain keeps it a CORS-"simple" request, so it crosses to n8n.* without a
    // preflight the beacon could not answer; the body is JSON text, parsed on the n8n side.
    try {
      var blob = new Blob([json], { type: 'text/plain;charset=UTF-8' });
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, blob)) return;
    } catch (e) {}
    // fallback for browsers without sendBeacon: keepalive fetch, no-cors + text/plain so the
    // cross-origin POST is delivered even though a bare webhook sends no CORS headers back
    // (no-cors makes the response opaque, which is fine -- we never read it).
    try {
      fetch(ENDPOINT, { method: 'POST', body: json, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true, mode: 'no-cors' });
    } catch (e) {}
  }

  /* THE ONE HOOK app.js CALLS. It records the deepest room reached (for session_end)
   * and forwards the event. Guarded everywhere with `if (window.RockyTrack)`, so the
   * game runs identically whether or not this file loaded. */
  window.RockyTrack = function (event, props) {
    props = props || {};
    if (typeof props.chapterIndex === 'number' && props.chapterIndex > furthest.i) {
      furthest = { id: props.id || '', i: props.chapterIndex };
    }
    post(event, props);
  };

  // the visit itself — fired once, now
  post('visit', {
    returning: returning,
    w: (screen && screen.width) || 0,
    h: (screen && screen.height) || 0,
    dpr: window.devicePixelRatio || 1,
    lang: navigator.language || '',
    ua: navigator.userAgent || '',
    standalone: !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  });

  // how deep they got, sent exactly once when they leave or background the tab
  var ended = false;
  function end() {
    if (ended) return; ended = true;
    post('session_end', { durationS: Math.round((Date.now() - t0) / 1000), furthest: furthest.id, furthestIndex: furthest.i });
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') end(); });
  window.addEventListener('pagehide', end);
})();

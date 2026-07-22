(function () {
  "use strict";

  var script = document.currentScript;
  var endpoint = script && script.dataset.endpoint;

  if (!endpoint || navigator.globalPrivacyControl === true || navigator.doNotTrack === "1") {
    return;
  }

  var SESSION_KEY = "dg_analytics_session";
  var UTM_KEY = "dg_analytics_utm";
  var SESSION_TTL = 30 * 60 * 1000;

  function randomId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
  }

  function getSessionId() {
    var now = Date.now();
    try {
      var saved = JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
      if (saved && saved.id && now - saved.lastSeen < SESSION_TTL) {
        saved.lastSeen = now;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(saved));
        return saved.id;
      }
      var next = { id: randomId(), lastSeen: now };
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(next));
      return next.id;
    } catch (_error) {
      return randomId();
    }
  }

  function getAttribution() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(UTM_KEY) || "null");
      if (saved) return saved;

      var params = new URLSearchParams(window.location.search);
      var attribution = {};
      ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (key) {
        var value = params.get(key);
        if (value) attribution[key] = value.slice(0, 100);
      });
      sessionStorage.setItem(UTM_KEY, JSON.stringify(attribution));
      return attribution;
    } catch (_error) {
      return {};
    }
  }

  function cleanUrl(value) {
    if (!value) return null;
    try {
      var parsed = new URL(value, window.location.href);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
      return parsed.origin + parsed.pathname;
    } catch (_error) {
      return null;
    }
  }

  function send(eventName, details) {
    var payload = Object.assign(
      {
        event_id: randomId(),
        event_name: eventName,
        session_id: getSessionId(),
        page_path: window.location.pathname,
        referrer: cleanUrl(document.referrer),
        client_occurred_at: new Date().toISOString()
      },
      getAttribution(),
      details || {}
    );
    var body = JSON.stringify(payload);

    if (navigator.sendBeacon) {
      var accepted = navigator.sendBeacon(endpoint, new Blob([body], { type: "text/plain;charset=UTF-8" }));
      if (accepted) return;
    }

    fetch(endpoint, {
      method: "POST",
      body: body,
      headers: { "Content-Type": "text/plain;charset=UTF-8" },
      keepalive: true,
      credentials: "omit"
    }).catch(function () {});
  }

  send("page_view");

  document.addEventListener(
    "click",
    function (event) {
      var link = event.target.closest("a[data-analytics-event]");
      if (!link) return;

      send(link.dataset.analyticsEvent, {
        object_type: link.dataset.analyticsObjectType || null,
        object_id: link.dataset.analyticsObjectId || null,
        action: link.dataset.analyticsAction || null,
        destination: cleanUrl(link.href)
      });
    },
    true
  );
})();

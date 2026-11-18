<script id="aeroTerminalModule">
/* ============================================================================
   ✈️ SECOVVV GEO-PRO // AEROTERMINAL DATALINK & METAR/TAF FLIGHT OPS MODULE (V2)
   - Sayfa yenilenince panel ilk konum ve boyutuna sıfırlanır
   - Şeffaf Türkçe Veri Kaynağı & Çevrimdışı (Offline) Durum Bilgilendirme Kutusu
   - SIGMET bbox (minLat,minLon,maxLat,maxLon) düzeltmesi + Çok satırlı TAF
   - Çift Katmanlı Datalink: AirportDB -> Local JSON | CheckWX -> NOAA + Proxy Filtresi
   ============================================================================ */
(function () {
  "use strict";

  const DEFAULT_CHECKWX_KEY = "c2fba2f55e25421aad8549b5fd7af61d";
  const DEFAULT_AIRPORTDB_KEY = "8795517890fd3ed2dfd6a6b72cee0cfd6f8b7ad79f1634244907f5944d762ac1acadec1129c37bc098766310ee302fcd";
  const WX_CACHE_TTL_MS = 5 * 60 * 1000;

  const CORE_AIRPORTS_FALLBACK = [
    { icao: "LTFM", iata: "IST", name: "Istanbul Airport", city: "Istanbul", country: "TR", elevation: 325, lat: 41.275278, lon: 28.751944, tz: "Europe/Istanbul" },
    { icao: "LTFJ", iata: "SAW", name: "Sabiha Gokcen International Airport", city: "Istanbul", country: "TR", elevation: 312, lat: 40.898611, lon: 29.309167, tz: "Europe/Istanbul" },
    { icao: "LTAC", iata: "ESB", name: "Esenboga International Airport", city: "Ankara", country: "TR", elevation: 3125, lat: 40.128056, lon: 32.995, tz: "Europe/Istanbul" },
    { icao: "LTBJ", iata: "ADB", name: "Adnan Menderes International Airport", city: "Izmir", country: "TR", elevation: 412, lat: 38.2924, lon: 27.157, tz: "Europe/Istanbul" },
    { icao: "LTAI", iata: "AYT", name: "Antalya International Airport", city: "Antalya", country: "TR", elevation: 177, lat: 36.8987, lon: 30.8005, tz: "Europe/Istanbul" },
    { icao: "LTCG", iata: "TZX", name: "Trabzon International Airport", city: "Trabzon", country: "TR", elevation: 104, lat: 40.9951, lon: 39.7897, tz: "Europe/Istanbul" },
    { icao: "LTAU", iata: "ASR", name: "Kayseri Erkilet Airport", city: "Kayseri", country: "TR", elevation: 3485, lat: 38.7704, lon: 35.4954, tz: "Europe/Istanbul" },
    { icao: "LTAF", iata: "ADA", name: "Adana Sakirpasa Airport", city: "Adana", country: "TR", elevation: 65, lat: 36.9822, lon: 35.2804, tz: "Europe/Istanbul" },
    { icao: "LTFE", iata: "BJV", name: "Milas Bodrum Airport", city: "Mugla", country: "TR", elevation: 21, lat: 37.2506, lon: 27.6643, tz: "Europe/Istanbul" },
    { icao: "LTBS", iata: "DLM", name: "Dalaman International Airport", city: "Mugla", country: "TR", elevation: 20, lat: 36.7131, lon: 28.7925, tz: "Europe/Istanbul" },
    { icao: "LTFG", iata: "GZP", name: "Gazipasa Alanya Airport", city: "Antalya", country: "TR", elevation: 45, lat: 36.2992, lon: 32.3006, tz: "Europe/Istanbul" },
    { icao: "LTCB", iata: "OGU", name: "Ordu Giresun Airport", city: "Ordu", country: "TR", elevation: 10, lat: 40.967, lon: 38.08, tz: "Europe/Istanbul" },
    { icao: "LTFH", iata: "SZF", name: "Samsun Carsamba Airport", city: "Samsun", country: "TR", elevation: 18, lat: 41.2545, lon: 36.5671, tz: "Europe/Istanbul" },
    { icao: "LTAJ", iata: "GZT", name: "Gaziantep Oguzeli International Airport", city: "Gaziantep", country: "TR", elevation: 2315, lat: 36.9472, lon: 37.4787, tz: "Europe/Istanbul" },
    { icao: "LTCN", iata: "KCM", name: "Kahramanmaras Airport", city: "Kahramanmaras", country: "TR", elevation: 1722, lat: 37.539, lon: 36.9534, tz: "Europe/Istanbul" },
    { icao: "LTCE", iata: "ERZ", name: "Erzurum Airport", city: "Erzurum", country: "TR", elevation: 5763, lat: 39.9565, lon: 41.1702, tz: "Europe/Istanbul" },
    { icao: "LTCC", iata: "DIY", name: "Diyarbakir Airport", city: "Diyarbakir", country: "TR", elevation: 2251, lat: 37.8939, lon: 40.201, tz: "Europe/Istanbul" },
    { icao: "LTCA", iata: "EZS", name: "Elazig Airport", city: "Elazig", country: "TR", elevation: 2927, lat: 38.6069, lon: 39.2914, tz: "Europe/Istanbul" },
    { icao: "EGLL", iata: "LHR", name: "London Heathrow Airport", city: "London", country: "GB", elevation: 83, lat: 51.4706, lon: -0.461941, tz: "Europe/London" },
    { icao: "LFPG", iata: "CDG", name: "Charles de Gaulle International Airport", city: "Paris", country: "FR", elevation: 392, lat: 49.012798, lon: 2.55, tz: "Europe/Paris" },
    { icao: "EDDF", iata: "FRA", name: "Frankfurt am Main Airport", city: "Frankfurt", country: "DE", elevation: 364, lat: 50.033333, lon: 8.570556, tz: "Europe/Berlin" },
    { icao: "EHAM", iata: "AMS", name: "Amsterdam Airport Schiphol", city: "Amsterdam", country: "NL", elevation: -11, lat: 52.308601, lon: 4.76389, tz: "Europe/Amsterdam" },
    { icao: "KJFK", iata: "JFK", name: "John F Kennedy International Airport", city: "New York", country: "US", elevation: 13, lat: 40.639801, lon: -73.7789, tz: "America/New_York" },
    { icao: "KLAX", iata: "LAX", name: "Los Angeles International Airport", city: "Los Angeles", country: "US", elevation: 125, lat: 33.942501, lon: -118.407997, tz: "America/Los_Angeles" },
    { icao: "OMDB", iata: "DXB", name: "Dubai International Airport", city: "Dubai", country: "AE", elevation: 62, lat: 25.2528, lon: 55.364399, tz: "Asia/Dubai" },
    { icao: "UUEE", iata: "SVO", name: "Sheremetyevo International Airport", city: "Moscow", country: "RU", elevation: 622, lat: 55.972599, lon: 37.4146, tz: "Europe/Moscow" },
    { icao: "UUDD", iata: "DME", name: "Domodedovo International Airport", city: "Moscow", country: "RU", elevation: 588, lat: 55.408798, lon: 37.9063, tz: "Europe/Moscow" },
    { icao: "RJTT", iata: "HND", name: "Tokyo Haneda International Airport", city: "Tokyo", country: "JP", elevation: 35, lat: 35.552299, lon: 139.779999, tz: "Asia/Tokyo" },
    { icao: "WSSS", iata: "SIN", name: "Singapore Changi Airport", city: "Singapore", country: "SG", elevation: 22, lat: 1.35019, lon: 103.994003, tz: "Asia/Singapore" }
  ];

  const WORLD_CLOCKS = [
    ["LOCAL", Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Istanbul"],
    ["ISTANBUL", "Europe/Istanbul"],
    ["LONDON", "Europe/London"],
    ["MOSCOW", "Europe/Moscow"],
    ["DUBAI", "Asia/Dubai"],
    ["FRANKFURT", "Europe/Berlin"],
    ["PARIS", "Europe/Paris"],
    ["NEW YORK", "America/New_York"],
    ["CHICAGO", "America/Chicago"],
    ["LOS ANGELES", "America/Los_Angeles"],
    ["TOKYO", "Asia/Tokyo"],
    ["SINGAPORE", "Asia/Singapore"],
    ["SYDNEY", "Australia/Sydney"]
  ];

  const icaoMap = new Map();
  const iataMap = new Map();
  let allAirportsList = [];
  let airportsDbLoaded = false;
  let airportsDbSourceLabel = "Gömülü Çekirdek Liste (29 Meydan)";
  let airportsDbLoadingPromise = null;
  const wxMemoryCache = new Map();

  let aeroPanelOpen = false;
  let aeroMinimized = false;
  let forceNoaa = false;
  let forceLocalApt = false;
  let worldClockIdx = 0;
  let clockTimer = null;

  let customCheckWxKey = localStorage.getItem("secovvv_aero_checkwx_key") || "";
  let customAirportDbKey = localStorage.getItem("secovvv_aero_airportdb_key") || "";
  let selectedAltitudeFt = Number(localStorage.getItem("secovvv_aero_alt_ft") || 0);
  let currentHue = Number(localStorage.getItem("secovvv_aero_hue") || 185);

  let activeAirport = null;
  let rawMetarText = "";
  let rawTafText = "";
  let rawRunwayHtml = "";
  let isMetarDecoded = false;
  let isTafDecoded = false;
  let activeSubModal = null;
  let aeroQueryToken = 0;
  let aeroWxLoading = false;
  let routeDlgState = null;

  function isAeroNetOnline() {
    return (typeof isNetworkAllowed === "function") ? isNetworkAllowed() : navigator.onLine;
  }

  function formatTimeHHMM(ts) {
    if (!ts) return "--:--";
    try {
      return new Date(ts).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
    } catch (_) { return "--:--"; }
  }

  function indexAirportRecord(rec) {
    if (!rec || !rec.icao) return;
    const icao = String(rec.icao).trim().toUpperCase();
    const iata = rec.iata ? String(rec.iata).trim().toUpperCase() : "";
    const lat = Number(rec.lat);
    const lon = Number(rec.lon);
    if (!icao || !isFinite(lat) || !isFinite(lon)) return;
    const item = {
      icao,
      iata,
      name: rec.name || "UNKNOWN AIRPORT",
      city: rec.city || rec.municipality || "UNKNOWN CITY",
      country: rec.country || "",
      elevation: (rec.elevation !== undefined && rec.elevation !== null && rec.elevation !== "") ? Number(rec.elevation) : null,
      lat,
      lon,
      tz: rec.tz || "UTC"
    };
    icaoMap.set(icao, item);
    if (iata && iata.length === 3) {
      if (!iataMap.has(iata) || (item.name && item.name.toLowerCase().includes("international"))) {
        iataMap.set(iata, item);
      }
    }
    return item;
  }

  CORE_AIRPORTS_FALLBACK.forEach(r => {
    const indexed = indexAirportRecord(r);
    if (indexed) allAirportsList.push(indexed);
  });

  let audioCtx = null;
  function playAeroBeep(freq = 1150, durationMs = 70, type = "sine") {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return;
      if (!audioCtx) audioCtx = new Ctx();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.045, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + durationMs / 1000);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + durationMs / 1000);
    } catch (_) {}
  }

  function speakAviationText(text) {
    try {
      if (!("speechSynthesis" in window)) return;
      window.speechSynthesis.cancel();
      if (!text) return;
      playAeroBeep(1320, 85);
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = "en-US";
      utter.rate = 1.02;
      utter.pitch = 0.88;
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find(v => /en[-_](US|GB)/i.test(v.lang));
      if (enVoice) utter.voice = enVoice;
      window.speechSynthesis.speak(utter);
    } catch (_) {}
  }

  function stopAviationSpeech() {
    try {
      if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    } catch (_) {}
  }

  // ================= 1. AIRPORTS.JSON YÜKLEME & INDEXED-DB ÖNBELLEK =================
  async function ensureAirportsDatabaseLoaded() {
    if (airportsDbLoaded) return true;
    if (airportsDbLoadingPromise) return airportsDbLoadingPromise;

    airportsDbLoadingPromise = (async () => {
      try {
        let rawData = null;
        if (typeof fetchWithOfflineBackup === "function") {
          rawData = await fetchWithOfflineBackup("aero_airports_json_v1", "./airports.json");
        } else {
          const resp = await fetch("./airports.json");
          if (!resp.ok) throw new Error("HTTP " + resp.status);
          rawData = await resp.json();
        }

        if (rawData && typeof rawData === "object") {
          const tempArr = [];
          const keys = Object.keys(rawData);
          for (let i = 0; i < keys.length; i++) {
            const k = keys[i];
            const obj = rawData[k];
            if (!obj) continue;
            if (!obj.icao) obj.icao = k;
            const item = indexAirportRecord(obj);
            if (item) tempArr.push(item);
          }
          CORE_AIRPORTS_FALLBACK.forEach(c => {
            const item = indexAirportRecord(c);
            if (item && c.iata) iataMap.set(c.iata, item);
          });
          if (tempArr.length > 0) {
            allAirportsList = tempArr;
            airportsDbLoaded = true;
            airportsDbSourceLabel = `airports.json / IndexedDB (${icaoMap.size.toLocaleString("tr-TR")} Meydan)`;
            updateDbBadgeStatus();
            renderSourceStatusBanner();
            return true;
          }
        }
      } catch (err) {
        airportsDbSourceLabel = `Gömülü Çekirdek Liste (${icaoMap.size} Meydan • airports.json okunamadı)`;
        updateDbBadgeStatus(true);
        renderSourceStatusBanner();
      } finally {
        airportsDbLoadingPromise = null;
      }
      return false;
    })();

    return airportsDbLoadingPromise;
  }

  function updateDbBadgeStatus(isFallbackOnly = false) {
    const el = document.getElementById("aeroDbCountBadge");
    if (!el) return;
    const online = isAeroNetOnline();
    if (!online) {
      el.textContent = `🔴 OFFLINE • DB: ${icaoMap.size.toLocaleString("tr-TR")} MEYDAN`;
      el.style.color = "#fda4af";
    } else if (airportsDbLoaded) {
      el.textContent = `🟢 ONLINE • DB: ${icaoMap.size.toLocaleString("tr-TR")} MEYDAN`;
      el.style.color = "#00ff88";
    } else if (isFallbackOnly) {
      el.textContent = `🟡 CORE DB (${icaoMap.size} MEYDAN • YEREL YEDEK)`;
      el.style.color = "#ffb300";
    } else {
      el.textContent = `🟢 ONLINE • DB HAZIR (${icaoMap.size})`;
      el.style.color = "#00ff88";
    }
  }

  // ================= 2. ŞEFFAF VERİ KAYNAĞI & ÇEVRİMDIŞI DURUM BİLGİLENDİRME KUTUSU =================
  function renderSourceStatusBanner() {
    const el = document.getElementById("aeroSourceStatusBlock");
    if (!el) return;

    const online = isAeroNetOnline();
    const isManualOff = (typeof manualOfflineOverride !== "undefined") && manualOfflineOverride && navigator.onLine;
    const offReason = isManualOff
      ? "Manuel Çevrimdışı Mod aktif (Üst bardan kapatabilirsiniz)."
      : "Şu an internet bağlantısı yok.";

    if (!online) {
      const cacheNote = (activeAirport && activeAirport.fromMemoryCache)
        ? `<div style="margin-top:4px;color:#d8b4fe;">🟣 <b>Önbellek Notu:</b> Bu meydanın hava durumu verisi internet kesilmeden önce (${formatTimeHHMM(activeAirport.cachedAt)}) hafızaya alındığı için önbellekten gösteriliyor.</div>`
        : "";

      el.className = "aero-block aero-status-offline";
      el.innerHTML =
        `<div style="color:#fda4af;font-weight:900;margin-bottom:4px;">🔴 ÇEVRİMDIŞI MOD — ${offReason}</div>` +
        `<div style="color:#6ee7b7;margin-bottom:3px;"><b>✅ Veritabanından Çalışmaya Devam Edenler:</b><br>` +
        `&bull; Meydan Arama, Koordinat, Şehir &amp; Rakım (<i>${aeroEsc(airportsDbSourceLabel)}</i>)<br>` +
        `&bull; 2D/3D Haritada Odaklanma, Uçuş Rotası Ekleme ve <b>E6-B</b> Hesaplayıcı</div>` +
        `<div style="color:#fca5a5;"><b>⛔ İnternet Olmadığı İçin Çalışmayacaklar:</b><br>` +
        `&bull; Canlı <b>METAR / TAF</b>, Aktif Pist &amp; Yan Rüzgâr Analizi, Yoğunluk İrtifası (DA), <b>SIGMET</b> Radarı, <b>D-ATIS</b> Yayını, <b>AirportDB</b> Pist/Frekansları ve 250 NM <b>ALTN</b> Canlı Tarama.</div>` +
        cacheNote;
      return;
    }

    // Çevrimiçi (Online) Durum Bilgilendirmesi
    const aptSrcTxt = activeAirport
      ? activeAirport.airportSource
      : (forceLocalApt ? "Yerel Veritabanı (Zorunlu)" : "AirportDB.io API → Yedek: Yerel Veritabanı");

    const wxSrcTxt = activeAirport
      ? (aeroWxLoading ? "Bağlanıyor..." : activeAirport.weatherSource)
      : (forceNoaa ? "NOAA AviationWeather.gov (Zorunlu)" : "CheckWX API → Yedek: NOAA AviationWeather.gov");

    const sigSrcTxt = "NOAA AviationWeather.gov (ISIGMET ±5°)";

    el.className = "aero-block aero-status-online";
    el.innerHTML =
      `<div style="color:#6ee7b7;font-weight:900;margin-bottom:3px;">🟢 ÇEVRİMİÇİ — VERİ KAYNAKLARI ŞEFFAFLIK PANELİ</div>` +
      `<div style="color:#cbd5e1;font-size:10.6px;line-height:1.45;">` +
      `&bull; <b>Meydan Veritabanı:</b> <span style="color:#7dd3fc;">${aeroEsc(airportsDbSourceLabel)}</span><br>` +
      `&bull; <b>Pist &amp; Frekanslar:</b> <span style="color:#fde047;">${aeroEsc(aptSrcTxt)}</span><br>` +
      `&bull; <b>METAR &amp; TAF:</b> <span style="color:#00ffcc;">${aeroEsc(wxSrcTxt)}</span><br>` +
      `&bull; <b>SIGMET &amp; ALTN:</b> <span style="color:#c4b5fd;">${aeroEsc(sigSrcTxt)}</span>` +
      `</div>`;
  }

  // ================= 3. HAVACILIK VE METEOROLOJİ ALGORİTMALARI =================
  function estimateMagneticDeclinationDeg(latDeg, lonDeg) {
    const toRad = Math.PI / 180;
    const toDeg = 180 / Math.PI;
    const poleLat = 80.8 * toRad;
    const poleLon = -72.7 * toRad;
    const lat = latDeg * toRad;
    const lon = lonDeg * toRad;
    const dLon = poleLon - lon;
    const y = Math.sin(dLon) * Math.cos(poleLat);
    const x = Math.cos(lat) * Math.sin(poleLat) - Math.sin(lat) * Math.cos(poleLat) * Math.cos(dLon);
    let dec = Math.atan2(y, x) * toDeg;
    dec += 5.2 * Math.sin((lonDeg - 10) * toRad) * Math.cos(latDeg * 0.8 * toRad);
    return Math.max(-35, Math.min(35, dec));
  }

  function calcDistanceNM(lat1, lon1, lat2, lon2) {
    const toRad = Math.PI / 180;
    const dLat = (lat2 - lat1) * toRad;
    const dLon = (lon2 - lon1) * toRad;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * toRad) * Math.cos(lat2 * toRad) * Math.sin(dLon / 2) ** 2;
    return 3440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function analyzeFlightRules(metar) {
    if (!metar || metar.includes("ERROR") || metar.includes("FAILED") || metar.includes("OFFLINE") || metar.includes("ÇEVRİMDIŞI") || metar.includes("NO ACTIVE")) {
      return `<span style="color:#94a3b8;">BİLİNMİYOR (Canlı METAR verisi yok)</span>`;
    }
    if (/\bR[0-9]{2}[LRC]?\/[MP]?[0-9]{4}\b/.test(metar)) {
      return `<span style="color:#b388ff;font-weight:800;">[LVP - CAT II/III] LOW VISIBILITY PROCEDURES ACTIVE!</span><br>RVR (Runway Visual Range) limits in effect.`;
    }
    if (metar.includes("CAVOK")) {
      return `<span style="color:#00ff66;font-weight:800;">[VFR] Measured: CAVOK (Vis 10+km, No Clouds).</span><br>VMC Conditions Met. Cleared for flight.`;
    }

    let visMeters = 9999;
    let minCeilingFeet = 99900;
    let isDangerous = false;

    const padded = " " + metar + " ";
    const visIcao = padded.match(/\s(\d{4})(?:NDV)?\s/);
    if (visIcao) {
      visMeters = parseInt(visIcao[1], 10) || 9999;
    } else {
      const visFaa = padded.match(/\s(\d{1,2})SM\s/);
      if (visFaa) visMeters = Math.round((parseInt(visFaa[1], 10) || 10) * 1609.34);
    }

    const cloudRegex = /\b(BKN|OVC)(\d{3})\b/g;
    let m;
    while ((m = cloudRegex.exec(metar)) !== null) {
      const base = (parseInt(m[2], 10) || 999) * 100;
      if (base < minCeilingFeet) minCeilingFeet = base;
    }

    if (padded.includes(" FG ") || padded.includes(" TS") || padded.includes(" +SN") || padded.includes(" GR")) {
      isDangerous = true;
    }

    const visStr = visMeters >= 9999 ? "10+ km" : `${visMeters}m`;
    const ceilStr = minCeilingFeet === 99900 ? "Clear/Unlimited" : `${minCeilingFeet}ft`;

    if (isDangerous) {
      return `<span style="color:#ff2a6d;font-weight:800;">[IFR] Hazardous Weather (Fog/Storm). Instrument Flight Only!</span>`;
    }
    if (visMeters < 1500 || minCeilingFeet < 1000) {
      return `<span style="color:#ff2a6d;font-weight:800;">[IFR] Measured: Vis ${visStr}, Ceiling ${ceilStr}.</span><br>IMC Conditions Active (VFR Prohibited).`;
    }
    if (visMeters >= 1500 && visMeters <= 4999) {
      return `<span style="color:#ffb300;font-weight:800;">[SPECIAL VFR] Measured: Vis ${visStr}, Ceiling ${ceilStr}.</span><br>Requires Tower Clearance (SVFR).`;
    }
    return `<span style="color:#00ff66;font-weight:800;">[VFR] Measured: Vis ${visStr}, Ceiling ${ceilStr}.</span><br>VMC Conditions Met. Cleared for flight.`;
  }

  function calcDensityAltitudeHtml(metar, elevStr) {
    const numMatch = String(elevStr || "").match(/-?\d+(\.\d+)?/);
    if (!numMatch) return "";
    const elevation = parseFloat(numMatch[0]);
    const tempMatch = metar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
    if (!tempMatch) return "";
    const oat = parseFloat(tempMatch[1].replace("M", "-"));
    if (!isFinite(oat)) return "";

    let qnh = 1013.25;
    const qnhMatch = metar.match(/\bQ(\d{4})\b/);
    if (qnhMatch) {
      qnh = parseFloat(qnhMatch[1]) || 1013.25;
    } else {
      const altMatch = metar.match(/\bA(\d{4})\b/);
      if (altMatch) {
        const inHg = (parseFloat(altMatch[1]) || 2992) / 100.0;
        qnh = inHg * 33.8639;
      }
    }

    const pa = elevation + (1013.25 - qnh) * 30.0;
    const isa = 15.0 - 1.98 * (elevation / 1000.0);
    const daInt = Math.round(pa + 120.0 * (oat - isa));
    const warn = daInt > elevation + 2000
      ? `<br><span style="color:#ff2a6d;font-weight:800;">&gt; WARNING: HIGH DENSITY ALTITUDE! Performance Loss.</span>`
      : "";
    return `<br>&gt; Density Altitude (DA): <b>${daInt} FT</b>${warn}`;
  }

  function analyzeAtmosphericThreatsHtml(metar) {
    let threats = "";
    const tempMatch = metar.match(/\b(M?\d{2})\/(M?\d{2})\b/);
    if (tempMatch) {
      const t = parseInt(tempMatch[1].replace("M", "-"), 10);
      const d = parseInt(tempMatch[2].replace("M", "-"), 10);
      if (isFinite(t) && isFinite(d) && (t - d) >= 0 && (t - d) <= 3) {
        threats += `<br><span style="color:#ffb300;font-weight:800;">&gt; THREAT: FOG / CARB ICING RISK! (Spread ≤ 3°C)</span>`;
      }
    }
    const windMatch = metar.match(/\b([0-3]\d{2}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS)\b/);
    if (windMatch && windMatch[3]) {
      threats += `<br><span style="color:#ff2a6d;font-weight:800;">&gt; THREAT: WINDSHEAR / GUSTS DETECTED! (${windMatch[3]})</span>`;
    }
    return threats;
  }

  function analyzeRunwayAndWindHtml(metar, apt) {
    if (!metar || metar.includes("ERROR") || metar.includes("FAILED") || metar.includes("OFFLINE") || metar.includes("ÇEVRİMDIŞI") || metar.includes("NO ACTIVE")) {
      return `<span style="color:#94a3b8;">[ANALİZ DEVRE DIŞI] Aktif pist ve yan rüzgâr hesabı için canlı METAR verisi gereklidir.</span>`;
    }
    const daHtml = calcDensityAltitudeHtml(metar, apt.rakim);
    const threatHtml = analyzeAtmosphericThreatsHtml(metar);

    const windMatch = metar.match(/\b([0-3]\d{2}|VRB)(\d{2,3})(?:G(\d{2,3}))?(KT|MPS)\b/);
    if (!windMatch) {
      return `<span style="color:#ffb300;">[ANALYSIS] Wind data missing or calm (00000KT).</span>${daHtml}${threatHtml}`;
    }
    if (windMatch[1] === "VRB") {
      return `<span style="color:#00e5ff;"><b>[RUNWAY &amp; WEATHER ANALYSIS]</b><br>&gt; Wind: VARIABLE (VRB) at ${parseInt(windMatch[2], 10)} ${windMatch[4]}.<br>&gt; Status: All runways suitable.</span>${daHtml}${threatHtml}`;
    }

    const trueWindDeg = parseFloat(windMatch[1]);
    const windSpdKt = parseFloat(windMatch[2]) * (windMatch[4] === "MPS" ? 1.94384 : 1.0);
    const magDec = estimateMagneticDeclinationDeg(apt.lat, apt.lon);
    const magWindDeg = (trueWindDeg - magDec + 360.0) % 360.0;
    const magWindStr = String(Math.round(magWindDeg) % 360).padStart(3, "0");

    if (!apt.pistler || apt.pistler.includes("NO DATA") || apt.pistler.includes("NO RECORDS") || apt.pistler.includes("YOK")) {
      return `&gt; <b>WIND &amp; ATMOSPHERE ANALYSIS</b><br>&gt; True Wind: ${Math.round(trueWindDeg)}° (${Math.round(windSpdKt)} KT) &rarr; Mag Wind: <span style="color:#00e5ff;font-weight:800;">${magWindStr}°</span> (Var: ${magDec >= 0 ? "+" : ""}${magDec.toFixed(1)}°)<br>&gt; Pist Yönü: <span style="color:#ffb300;">Yerel veritabanında pist bilgisi yok (AirportDB gerekli)</span>${daHtml}${threatHtml}`;
    }

    let bestRwy = "";
    let maxHeadwind = -999;
    let bestCrosswind = 0;
    const rwyRegex = /\b([0-3]\d[LRC]?)\/([0-3]\d[LRC]?)\b/g;
    let rm;
    while ((rm = rwyRegex.exec(apt.pistler)) !== null) {
      [rm[1], rm[2]].forEach(rwyId => {
        const num = parseInt(rwyId.slice(0, 2), 10);
        if (!isFinite(num)) return;
        const rwyHdg = num * 10;
        const diff = Math.min(Math.abs(magWindDeg - rwyHdg), 360 - Math.abs(magWindDeg - rwyHdg));
        const rad = diff * Math.PI / 180;
        const hw = Math.cos(rad) * windSpdKt;
        if (hw > maxHeadwind) {
          maxHeadwind = hw;
          bestRwy = rwyId;
          bestCrosswind = Math.abs(Math.sin(rad) * windSpdKt);
        }
      });
    }

    if (!bestRwy) {
      return `&gt; <b>WIND &amp; WEATHER ANALYSIS</b><br>&gt; True Wind: ${Math.round(trueWindDeg)}° &rarr; Mag Wind: <span style="color:#00e5ff;font-weight:800;">${magWindStr}°</span>${daHtml}${threatHtml}`;
    }

    const cwKt = Math.round(bestCrosswind);
    const hwKt = Math.round(maxHeadwind);
    const col = cwKt >= 15 ? "#ff2a6d" : (cwKt >= 10 ? "#ffb300" : "#00ff66");
    const statusTxt = cwKt >= 15 ? "WARNING: HIGH CROSSWIND LIMIT!" : "OPTIMUM";

    return `&gt; <b>RUNWAY &amp; WEATHER ANALYSIS</b> <i><span style="color:#64748b;">(Sesli okuma için tıklayın)</span></i><br>` +
      `&gt; True Wind: ${String(Math.round(trueWindDeg)).padStart(3, "0")}° &rarr; Mag Wind: <span style="color:#00e5ff;font-weight:800;">${magWindStr}°</span><br>` +
      `&gt; Suitable Active Runway: <b style="color:#fff;">Runway ${bestRwy}</b> (Headwind: ${hwKt} KT)<br>` +
      `&gt; Crosswind Component: <span style="color:${col};font-weight:800;">${cwKt} KT</span> | Status: <span style="color:${col};font-weight:800;">${statusTxt}</span>` +
      `${daHtml}${threatHtml}`;
  }

  function decodeAviationTermsHtml(rawText) {
    if (!rawText) return "";
    let d = rawText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\r?\n/g, "<br>");

    d = d.replace(/\bR(\d{2}[LRC]?)\/([MP]?)(\d{4})(V\d{4})?([FUDNZ]?)\b/g, (_, pist, _mp, vis, _v, trend) => {
      const tr = trend === "U" ? " (Upward)" : trend === "D" ? " (Downward)" : trend === "N" ? " (No change)" : "";
      return `<b style="color:#b388ff;">[RVR - Runway ${pist} Visibility: ${parseInt(vis, 10)} meters${tr}]</b>`;
    });

    d = d.replace(/\bCAVOK\b/g, `<b style="color:#00ff66;">[CAVOK: Visibility 10km+, no significant clouds]</b>`);
    d = d.replace(/\bNOSIG\b/g, `<b>[NOSIG: No significant change in next 2 hrs]</b>`);
    d = d.replace(/\bNSW\b/g, `<b>[NSW: No significant weather]</b>`);
    d = d.replace(/\sTEMPO\s/g, `<br><b>&bull; TEMPORARILY:</b> `);
    d = d.replace(/\sBECMG\s/g, `<br><b>&bull; BECOMING:</b> `);
    d = d.replace(/\sPROB30\s/g, `<br><b>&bull; 30% PROBABILITY:</b> `);
    d = d.replace(/\sPROB40\s/g, `<br><b>&bull; 40% PROBABILITY:</b> `);
    d = d.replace(/\b9999\b/g, `<b>[Visibility: 10 km or more]</b>`);

    d = d.replace(/(^|\s)(\d{4})(NDV)?(?=\s|$|<br>)/g, (m, pre, vis) => {
      if (vis === "9999") return m;
      return `${pre}<b>[Visibility: ${parseInt(vis, 10)} meters]</b>`;
    });

    d = d.replace(/\b([0-3]\d{2}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS)\b/g, (_, dir, spd, gust, unit) => {
      const y = dir === "VRB" ? "Variable directions" : `${dir} degrees`;
      const g = gust ? `, Gusts: ${gust.replace("G", "")} ${unit}` : "";
      return `<b style="color:#00e5ff;">[Wind: ${y} at ${parseInt(spd, 10)} ${unit}${g}]</b>`;
    });

    d = d.replace(/\b(FEW|SCT|BKN|OVC|VV)(\d{3})(CB|TCU)?\b/g, (_, typ, alt, cb) => {
      const map = { FEW: "Few Clouds", SCT: "Scattered Clouds", BKN: "Broken Clouds", OVC: "Overcast", VV: "Vertical Visibility" };
      const extra = cb === "CB" ? " (Cumulonimbus - Storm!)" : cb === "TCU" ? " (Towering Cumulus)" : "";
      return `<b>[Clouds: ${map[typ] || typ} at ${parseInt(alt, 10) * 100} feet${extra}]</b>`;
    });

    d = d.replace(/\b(M?\d{2})\/(M?\d{2})\b/g, (_, t, dw) => {
      return `<b>[Temperature: ${t.replace("M", "Minus ")}°C, Dew Point: ${dw.replace("M", "Minus ")}°C]</b>`;
    });

    d = d.replace(/\bQ(\d{4})\b/g, (_, q) => `<b style="color:#00ffcc;">[Pressure QNH: ${q} hPa]</b>`);
    d = d.replace(/\bA(\d{4})\b/g, (_, a) => `<b style="color:#00ffcc;">[Altimeter: ${a.slice(0, 2)}.${a.slice(2, 4)} inHg]</b>`);

    const wxTokens = [
      ["TSRA", "[Thunderstorm with Rain]"],
      ["VCTS", "[Thunderstorm in Vicinity]"],
      ["-RA", "[Light Rain]"],
      ["+RA", "[Heavy Rain]"],
      ["RA", "[Rain]"],
      ["-SN", "[Light Snow]"],
      ["+SN", "[Heavy Snow]"],
      ["SN", "[Snow]"],
      ["FG", "<span style='color:#ffb300;'>[Fog]</span>"],
      ["BR", "[Mist]"],
      ["HZ", "[Haze]"]
    ];
    wxTokens.forEach(([tok, label]) => {
      const escaped = tok.replace(/[+-]/g, "\\$&");
      d = d.replace(new RegExp(`(^|\\s)${escaped}(?=\\s|$|<br>)`, "g"), `$1<b>${label}</b>`);
    });

    return `<span style="color:#ff2a6d;font-weight:800;">[PILOT DECODER ACTIVE]</span><br>${d}`;
  }

  function cleanHtmlForSpeech(rawOrHtml, decodeFirst = true) {
    const html = decodeFirst ? decodeAviationTermsHtml(rawOrHtml) : rawOrHtml;
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    return (tmp.textContent || tmp.innerText || "")
      .replace(/\[/g, " ")
      .replace(/\]/g, ". ")
      .replace(/°C/g, " degrees Celsius ")
      .replace(/\bKT\b/g, " knots ")
      .replace(/PILOT DECODER ACTIVE/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  // ================= 4. DATALINK ZİNCİRİ & CORS YEDEKLEMELİ FETCH =================
  async function fetchWithTimeout(url, options = {}, timeoutMs = 8500) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      return await fetch(url, { ...options, signal: ctrl.signal });
    } finally {
      clearTimeout(timer);
    }
  }

  function isLikelyProxyErrorHtml(txt) {
    if (!txt) return false;
    return /<!doctype|<html|<head|<body|access denied|bad gateway|error\s*40\d|error\s*50\d|rate limit/i.test(txt);
  }

  async function fetchNoaaTextResilient(endpointAndQuery) {
    const directUrl = `https://aviationweather.gov/api/data/${endpointAndQuery}`;
    const candidates = [
      { url: directUrl, ms: 4500 },
      { url: `https://api.allorigins.win/raw?url=${encodeURIComponent(directUrl)}`, ms: 6500 },
      { url: `https://corsproxy.io/?${encodeURIComponent(directUrl)}`, ms: 6500 }
    ];
    for (const c of candidates) {
      try {
        const r = await fetchWithTimeout(c.url, {}, c.ms);
        if (r.ok) {
          const txt = (await r.text()).trim();
          if (!isLikelyProxyErrorHtml(txt)) return txt;
        }
      } catch (_) {}
    }
    throw new Error("NOAA_UNREACHABLE");
  }

  async function queryAirportAndWeather(baseApt, bypassCache = false, onPartial = null) {
    const icao = baseApt.icao.toUpperCase();
    const netAllowed = isAeroNetOnline();
    const cached = wxMemoryCache.get(icao);

    // 1) Çevrimdışıysak: hafızada önceden çekilmiş veri varsa "ÖNBELLEK" etiketiyle sun, yoksa net çevrimdışı uyarısı dön
    if (!netAllowed) {
      if (cached && cached.payload) {
        const p = cached.payload;
        const tStr = formatTimeHHMM(cached.ts);
        return {
          apt: { ...p.apt },
          metar: p.metar,
          taf: p.taf,
          sigmetHtml: p.sigmetHtml,
          airportSource: `${p.airportSource} (Önbellek • ${tStr})`,
          weatherSource: `🔴 ÇEVRİMDIŞI — Son Önbellek (${tStr})`,
          isOffline: true,
          fromMemoryCache: true,
          cachedAt: cached.ts
        };
      }
      const elevLocalStr = (baseApt.elevation !== null && isFinite(baseApt.elevation))
        ? `${Math.round(baseApt.elevation)} ft (Yerel DB)`
        : "Kayıt Yok (Yerel DB)";
      return {
        apt: {
          icao,
          iata: baseApt.iata || "---",
          ad: baseApt.name || "UNKNOWN AIRPORT",
          sehir: baseApt.city || "UNKNOWN CITY",
          rakim: elevLocalStr,
          pistler: "YOK (İnternet kesik • AirportDB erişilemiyor)",
          frekanslar: "YOK (İnternet kesik • AirportDB erişilemiyor)",
          lat: Number(baseApt.lat),
          lon: Number(baseApt.lon),
          tz: baseApt.tz || "UTC"
        },
        airportSource: `Yerel Veritabanı (${airportsDbLoaded ? "airports.json" : "Çekirdek 29 Meydan"})`,
        weatherSource: "🔴 ÇEVRİMDIŞI — Canlı METAR/TAF Alınamaz",
        metar: "[ÇEVRİMDIŞI MOD] İnternet bağlantısı olmadığı için canlı METAR çekilemiyor.",
        taf: "[ÇEVRİMDIŞI MOD] İnternet bağlantısı olmadığı için canlı TAF çekilemiyor.",
        sigmetHtml: `&gt; <span style="color:#fda4af;">[SIGMET] ÇEVRİMDIŞI — İnternet olmadığı için enroute tehlike radarı çalışmıyor.</span>`,
        isOffline: true,
        fromMemoryCache: false
      };
    }

    // 2) Çevrimiçiysek ve 5 dakikalık bellek önbelleği tazeyse bunu açıkça etiketleyerek kullan
    if (!bypassCache && cached && (Date.now() - cached.ts < WX_CACHE_TTL_MS)) {
      const tStr = formatTimeHHMM(cached.ts);
      return {
        ...cached.payload,
        apt: { ...cached.payload.apt },
        weatherSource: `${cached.payload.weatherSource} (Önbellek • ${tStr})`,
        fromMemoryCache: true,
        cachedAt: cached.ts
      };
    }

    const elevLocalStr = (baseApt.elevation !== null && isFinite(baseApt.elevation))
      ? `${Math.round(baseApt.elevation)} ft (Yerel DB)`
      : "Kayıt Yok (Yerel DB)";

    const willFetchApt = !forceLocalApt;

    const state = {
      apt: {
        icao,
        iata: baseApt.iata || "---",
        ad: baseApt.name || "UNKNOWN AIRPORT",
        sehir: baseApt.city || "UNKNOWN CITY",
        rakim: elevLocalStr,
        pistler: willFetchApt ? "Yükleniyor (AirportDB)..." : "YOK (Yerel JSON seçili)",
        frekanslar: willFetchApt ? "Yükleniyor (AirportDB)..." : "YOK (Yerel JSON seçili)",
        lat: Number(baseApt.lat),
        lon: Number(baseApt.lon),
        tz: baseApt.tz || "UTC"
      },
      airportSource: forceLocalApt ? "Yerel JSON (Zorunlu Seçim)" : "AirportDB.io API (Sorgulanıyor...)",
      weatherSource: "Bağlanıyor...",
      metar: "",
      taf: "",
      sigmetHtml: `&gt; <span style="color:#00e5ff;">[SIGMET] NOAA ISIGMET (±5° sektör) taranıyor...</span>`,
      wxPending: true,
      sigPending: true,
      isOffline: false
    };

    const emit = () => {
      if (typeof onPartial !== "function") return;
      try { onPartial({ ...state, apt: { ...state.apt } }); } catch (_) {}
    };

    // 1) AIRPORTDB -> LOCAL JSON (paralel)
    const aptTask = (async () => {
      if (forceLocalApt) return;
      const dbToken = customAirportDbKey || DEFAULT_AIRPORTDB_KEY;
      try {
        const resp = await fetchWithTimeout(`https://airportdb.io/api/v1/airport/${encodeURIComponent(icao)}?apiToken=${encodeURIComponent(dbToken)}`, {}, 5500);
        if (resp.ok) {
          const db = await resp.json();
          if (db && (db.icao || db.ident || db.name)) {
            const elevFt = db.elevation_ft !== undefined && db.elevation_ft !== null && db.elevation_ft !== ""
              ? `${Math.round(Number(db.elevation_ft))} ft`
              : elevLocalStr;

            const runwaysStr = Array.isArray(db.runways) && db.runways.length > 0
              ? db.runways.map(r => {
                  const le = r.le_ident || "--";
                  const he = r.he_ident || "--";
                  const lenM = r.length_ft ? `${Math.round(Number(r.length_ft) * 0.3048)}m` : "?m";
                  const surf = r.surface || "ASP";
                  return `${le}/${he} (${lenM} ${surf})`;
                }).join(", ")
              : "Kayıt Bulunamadı";

            const freqsStr = Array.isArray(db.freqs) && db.freqs.length > 0
              ? db.freqs.slice(0, 8).map(f => `${f.type || "FREQ"} ${f.frequency_mhz || "?"}`).join(" | ")
              : "Frekans Kaydı Yok";

            state.apt = {
              icao: (db.icao || db.ident || icao).toUpperCase(),
              iata: db.iata || db.iata_code || state.apt.iata,
              ad: db.name || state.apt.ad,
              sehir: db.municipality || state.apt.sehir,
              rakim: elevFt,
              pistler: runwaysStr,
              frekanslar: freqsStr,
              lat: isFinite(parseFloat(db.latitude_deg)) ? parseFloat(db.latitude_deg) : state.apt.lat,
              lon: isFinite(parseFloat(db.longitude_deg)) ? parseFloat(db.longitude_deg) : state.apt.lon,
              tz: state.apt.tz
            };
            state.airportSource = "AirportDB.io Canlı API";
            return;
          }
        }
        state.airportSource = "Yerel JSON (AirportDB yanıt vermedi)";
      } catch (_) {
        state.airportSource = "Yerel JSON (AirportDB erişim hatası)";
      } finally {
        if (state.apt.pistler.includes("Yükleniyor")) state.apt.pistler = "YOK (Yerel JSON'da pist verisi bulunmaz)";
        if (state.apt.frekanslar.includes("Yükleniyor")) state.apt.frekanslar = "YOK (Yerel JSON'da frekans verisi bulunmaz)";
        emit();
      }
    })();

    // 2) CHECKWX -> NOAA AUTO-FALLBACK (paralel)
    const wxTask = (async () => {
      const wxKey = customCheckWxKey || DEFAULT_CHECKWX_KEY;
      let wxSuccess = false;

      if (!forceNoaa) {
        try {
          const [mResp, tResp] = await Promise.all([
            fetchWithTimeout(`https://api.checkwx.com/metar/${encodeURIComponent(icao)}`, { headers: { "X-API-Key": wxKey } }, 5500),
            fetchWithTimeout(`https://api.checkwx.com/taf/${encodeURIComponent(icao)}`, { headers: { "X-API-Key": wxKey } }, 5500)
          ]);
          if (mResp.ok) {
            const mJson = await mResp.json();
            if (mJson && Array.isArray(mJson.data) && mJson.data.length > 0 && mJson.data[0]) {
              state.metar = String(mJson.data[0]).trim();
              wxSuccess = true;
              state.weatherSource = `CheckWX Canlı API (${formatTimeHHMM(Date.now())})`;
              if (tResp.ok) {
                const tJson = await tResp.json();
                state.taf = (tJson && Array.isArray(tJson.data) && tJson.data.length > 0 && tJson.data[0])
                  ? String(tJson.data[0]).trim()
                  : "TAF: Bu meydan için aktif TAF yayınlanmamış.";
              } else {
                state.taf = "TAF: CheckWX üzerinden alınamadı.";
              }
            }
          }
        } catch (_) {}
      }

      if (!wxSuccess) {
        try {
          const [mRaw, tRaw] = await Promise.all([
            fetchNoaaTextResilient(`metar?ids=${encodeURIComponent(icao)}&format=raw`),
            fetchNoaaTextResilient(`taf?ids=${encodeURIComponent(icao)}&format=raw`).catch(() => "")
          ]);
          if (mRaw && mRaw.length >= 10) {
            state.metar = mRaw.split(/\r?\n/)[0].trim();
            state.taf = tRaw ? tRaw.trim() : "TAF: Bu meydan için aktif TAF yayınlanmamış.";
            state.weatherSource = forceNoaa
              ? `NOAA AviationWeather.gov (${formatTimeHHMM(Date.now())})`
              : `NOAA AviationWeather.gov (CheckWX Yedeği • ${formatTimeHHMM(Date.now())})`;
            wxSuccess = true;
          } else {
            state.metar = `NO ACTIVE METAR PUBLISHED FOR ${icao}.`;
            state.taf = `NO ACTIVE TAF PUBLISHED FOR ${icao}.`;
            state.weatherSource = forceNoaa ? "NOAA (Rapor Bulunamadı)" : "Aktif METAR Raporu Yok";
          }
        } catch (_) {
          state.metar = "ERROR: WEATHER DATALINK CONNECTION FAILED (CheckWX & NOAA erişilemiyor).";
          state.taf = "ERROR: TAF DATALINK CONNECTION FAILED.";
          state.weatherSource = "Bağlantı Hatası / Engellendi";
        }
      }
      state.wxPending = false;
      emit();
      return wxSuccess;
    })();

    // 3) KÜRESEL SIGMET RADARI — DÜZELTİLMİŞ BBOX: minLat,minLon,maxLat,maxLon
    const sigTask = (async () => {
      try {
        const la = Number(baseApt.lat), lo = Number(baseApt.lon);
        const minLat = Math.max(-90, la - 5).toFixed(2);
        const maxLat = Math.min(90, la + 5).toFixed(2);
        const minLon = Math.max(-180, lo - 5).toFixed(2);
        const maxLon = Math.min(180, lo + 5).toFixed(2);
        const bbox = `${minLat},${minLon},${maxLat},${maxLon}`;
        const sigRaw = await fetchNoaaTextResilient(`isigmet?format=raw&bbox=${bbox}`);
        if (sigRaw && sigRaw.length > 5) {
          let dec = sigRaw
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/\bSEV TURB\b/g, `<b style="color:#ff2a6d;">[SEVERE TURBULENCE]</b>`)
            .replace(/\bSEV ICE\b/g, `<b style="color:#ff2a6d;">[SEVERE ICING]</b>`)
            .replace(/\bOBS TS\b/g, `<b style="color:#ff2a6d;">[THUNDERSTORMS]</b>`);
          const lines = dec.split(/\r?\n/).filter(Boolean);
          const preview = lines.slice(0, 5).join("<br>&gt; ") + (lines.length > 5 ? `<br>&gt; <b style="color:#ff2a6d;">... +${lines.length - 5} SATIR DAHA</b>` : "");
          state.sigmetHtml = `&gt; <b style="color:#ff2a6d;">[ ⚠️ ENROUTE HAZARDS (SIGMET) DETECTED! ]</b> <i>(NOAA AWC)</i><br>&gt; ${preview}`;
        } else {
          state.sigmetHtml = `&gt; <span style="color:#00ff66;">[SIGMET] TEMİZ: ±5° sektörde aktif yol boyu tehlike yok (NOAA AWC).</span>`;
        }
      } catch (_) {
        state.sigmetHtml = `&gt; <span style="color:#ffb300;">[SIGMET] NOAA ISIGMET uydu hattına şu an ulaşılamıyor.</span>`;
      }
      state.sigPending = false;
      emit();
    })();

    const [, wxRes] = await Promise.allSettled([aptTask, wxTask, sigTask]);
    const wxSuccess = wxRes && wxRes.status === "fulfilled" && wxRes.value === true;

    const payload = {
      apt: state.apt, metar: state.metar, taf: state.taf, sigmetHtml: state.sigmetHtml,
      airportSource: state.airportSource, weatherSource: state.weatherSource, isOffline: false,
      fromMemoryCache: false
    };
    if (wxSuccess) {
      wxMemoryCache.set(icao, { ts: Date.now(), payload });
    }
    return payload;
  }

  // ================= 5. HARİTA (2D SVG + 3D GLOBE CANVAS) ENTEGRASYONU =================
  let aeroSvgGroup = null;

  function ensureAeroSvgLayer() {
    if (aeroSvgGroup && !aeroSvgGroup.empty()) return aeroSvgGroup;
    if (typeof mapGroup === "undefined" || !mapGroup || mapGroup.empty()) return null;
    aeroSvgGroup = mapGroup.append("g").attr("class", "secovvv-aeroterminal-layer");
    return aeroSvgGroup;
  }

  function renderAeroAirportMarkerOnSvg() {
    const g = ensureAeroSvgLayer();
    if (!g) return;
    if (!activeAirport || (typeof isMorphing !== "undefined" && isMorphing)) {
      g.style("display", "none");
      return;
    }

    const lon = activeAirport.lon;
    const lat = activeAirport.lat;
    const globeOn = (typeof isGlobeMode !== "undefined") && isGlobeMode;
    const visible = !globeOn || (typeof isGeoVisibleOnGlobe === "function" ? isGeoVisibleOnGlobe(lon, lat, 0.02) : true);
    if (!visible || typeof projection !== "function") {
      g.style("display", "none");
      return;
    }

    const pt = projection([lon, lat]);
    if (!pt || !isFinite(pt[0]) || !isFinite(pt[1])) {
      g.style("display", "none");
      return;
    }

    g.style("display", "block");
    const k = (typeof currentZoomK !== "undefined" && currentZoomK > 0) ? currentZoomK : 1;
    const invScale = 1 / Math.max(1, Math.pow(k, 0.76));

    const node = g.selectAll("g.aero-apt-target")
      .data([activeAirport], d => d.icao)
      .join(enter => {
        const grp = enter.append("g")
          .attr("class", "aero-apt-target")
          .style("cursor", "pointer")
          .on("click", (ev) => {
            ev.stopPropagation();
            toggleAeroTerminalPanel(true);
          });

        grp.append("circle")
          .attr("class", "aero-pulse-ring")
          .attr("r", 18)
          .attr("fill", "rgba(0, 229, 255, 0.14)")
          .attr("stroke", "#00e5ff")
          .attr("stroke-width", 1.5)
          .attr("stroke-dasharray", "4,3");

        grp.append("circle")
          .attr("r", 9.5)
          .attr("fill", "rgba(6, 12, 24, 0.94)")
          .attr("stroke", "#00ffcc")
          .attr("stroke-width", 1.8);

        grp.append("text")
          .attr("y", 0.5)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-size", "10.5px")
          .text("✈️");

        grp.append("rect")
          .attr("class", "aero-tag-bg")
          .attr("x", -34)
          .attr("y", 13)
          .attr("width", 68)
          .attr("height", 15)
          .attr("rx", 4)
          .attr("fill", "rgba(6, 11, 22, 0.95)")
          .attr("stroke", "#00e5ff")
          .attr("stroke-width", 1.1);

        grp.append("text")
          .attr("class", "aero-tag-txt")
          .attr("y", 20.5)
          .attr("text-anchor", "middle")
          .attr("dominant-baseline", "central")
          .attr("font-family", "Consolas, monospace")
          .attr("font-size", "9px")
          .attr("font-weight", "900")
          .attr("fill", "#00ffcc");

        return grp;
      });

    node.select("text.aero-tag-txt")
      .text(activeAirport.iata && activeAirport.iata !== "---" ? `${activeAirport.icao}/${activeAirport.iata}` : activeAirport.icao);

    node.attr("transform", `translate(${pt[0]}, ${pt[1]}) scale(${invScale})`);
    g.raise();
  }

  const prevFastCanvasHook = window.drawSpaceAndGeoToolsOnFastCanvas;
  window.drawSpaceAndGeoToolsOnFastCanvas = function (ctx, cPath, activeProj, k, morphState, camVec) {
    if (typeof prevFastCanvasHook === "function") {
      prevFastCanvasHook(ctx, cPath, activeProj, k, morphState, camVec);
    }
    if (!activeAirport || !activeProj) return;
    if (typeof isGeoVisibleOnGlobe === "function" && !isGeoVisibleOnGlobe(activeAirport.lon, activeAirport.lat, 0.02)) return;
    const pt = activeProj([activeAirport.lon, activeAirport.lat]);
    if (!pt) return;
    const s = 1 / Math.max(1, Math.pow(k || 1, 0.76));
    ctx.save();
    ctx.translate(pt[0], pt[1]);
    ctx.scale(s, s);
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 229, 255, 0.16)";
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#00e5ff";
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = "#00ffcc";
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = "#060b16";
    ctx.stroke();

    ctx.font = "900 9px Consolas, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#00ffcc";
    ctx.strokeStyle = "#060b16";
    ctx.lineWidth = 2.5;
    const lbl = activeAirport.icao;
    ctx.strokeText(lbl, 0, 9);
    ctx.fillText(lbl, 0, 9);
    ctx.restore();
  };

  function flyMapToAirport(apt) {
    if (!apt || !isFinite(apt.lon) || !isFinite(apt.lat)) return;
    renderAeroAirportMarkerOnSvg();
    if (typeof focusGeoTarget === "function" && typeof projection2D === "function") {
      const globeOn = (typeof isGlobeMode !== "undefined") && isGlobeMode;
      const curK = (typeof currentZoomK !== "undefined") ? currentZoomK : 1;
      const targetK = globeOn ? Math.max(curK, 3.4) : Math.max(curK, 5.2);
      focusGeoTarget([apt.lon, apt.lat], projection2D([apt.lon, apt.lat]), targetK, () => {
        renderAeroAirportMarkerOnSvg();
        if (typeof projection === "function" && typeof triggerRadarRings === "function") {
          const p = projection([apt.lon, apt.lat]);
          if (p) triggerRadarRings(p[0], p[1], "#00e5ff");
        }
      });
    }
  }

  if (typeof svg !== "undefined" && svg && svg.on) {
    svg.on("zoom.aeroSync pointerup.aeroSync wheel.aeroSync", () => {
      if (activeAirport) requestAnimationFrame(renderAeroAirportMarkerOnSvg);
    });
  }

  // ================= 6. ARAYÜZ (STİL, ÜST BAR BUTONU VE PANEL) =================
  const aeroCss = document.createElement("style");
  aeroCss.textContent = `
    .btn-aeroterminal-top {
      background: linear-gradient(135deg, #091526 0%, #0f2942 100%) !important;
      border: 1.5px solid #00e5ff !important;
      color: #00ffcc !important;
      font-family: "Segoe UI", system-ui, sans-serif;
      font-weight: 800 !important;
      box-shadow: 0 0 12px rgba(0, 229, 255, 0.25);
    }
    .btn-aeroterminal-top:hover, .btn-aeroterminal-top.active {
      background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%) !important;
      color: #ffffff !important;
      border-color: #7dd3fc !important;
      box-shadow: 0 0 18px rgba(0, 229, 255, 0.65);
    }
    #aeroTerminalPanel {
      --aero-neon: hsl(185, 100%, 55%);
      position: absolute;
      top: 14px;
      left: 14px;
      width: min(465px, calc(100vw - 24px));
      max-height: calc(100% - 28px);
      background: rgba(8, 14, 24, 0.96);
      border: 1.5px solid var(--aero-neon);
      border-radius: 11px;
      box-shadow: 0 18px 46px rgba(0, 0, 0, 0.92), 0 0 22px rgba(0, 229, 255, 0.22);
      color: var(--aero-neon);
      font-family: "Consolas", "JetBrains Mono", "Courier New", monospace;
      z-index: 26;
      display: none;
      flex-direction: column;
      overflow: hidden;
      backdrop-filter: blur(10px);
      user-select: none;
    }
    #aeroTerminalPanel.aero-open { display: flex; }
    #aeroTerminalPanel.aero-minimized .aero-body-wrap { display: none; }
    .aero-head {
      background: linear-gradient(90deg, #0c1729 0%, #10213a 100%);
      border-bottom: 1px solid rgba(0, 229, 255, 0.35);
      padding: 8px 11px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      cursor: move;
    }
    .aero-head-title { display: flex; flex-direction: column; gap: 2px; }
    .aero-brand-line {
      font-size: 12.5px;
      font-weight: 900;
      letter-spacing: 0.8px;
      color: #00ffcc;
      text-shadow: 0 0 8px rgba(0, 255, 204, 0.45);
    }
    .aero-sub-line { font-size: 9.5px; color: #94a3b8; }
    .aero-clock-strip { display: flex; align-items: center; gap: 6px; }
    .aero-clock-box {
      background: #060b14;
      border: 1px solid #1e3a5f;
      border-radius: 5px;
      padding: 3px 6px;
      font-size: 9.5px;
      line-height: 1.15;
      text-align: center;
      color: #e2e8f0;
      cursor: pointer;
    }
    .aero-win-btns { display: flex; gap: 4px; }
    .aero-win-btn {
      background: #132036;
      border: 1px solid #2c456b;
      color: #cbd5e1;
      border-radius: 5px;
      padding: 3px 7px;
      font-family: inherit;
      font-size: 11px;
      font-weight: 800;
      cursor: pointer;
    }
    .aero-win-btn:hover { border-color: #00e5ff; color: #fff; }
    .aero-win-btn.close:hover { background: #e11d48; border-color: #fda4af; color: #fff; }
    .aero-body-wrap { display: flex; flex-direction: column; overflow: hidden; flex: 1; }
    .aero-toolbar-row {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      padding: 7px 10px;
      background: #0b1322;
      border-bottom: 1px solid rgba(56, 189, 248, 0.2);
    }
    .aero-tbtn {
      background: #131f33;
      border: 1px solid #2b4266;
      color: #93c5fd;
      padding: 4px 7px;
      border-radius: 4px;
      font-family: inherit;
      font-size: 10.5px;
      font-weight: 700;
      cursor: pointer;
      transition: 0.12s;
    }
    .aero-tbtn:hover, .aero-tbtn.active { background: #0284c7; border-color: #7dd3fc; color: #ffffff; }
    .aero-tbtn.warn { color: #fbbf24; border-color: #92400e; }
    .aero-input-bar {
      display: grid;
      grid-template-columns: 86px 96px 1fr auto;
      gap: 6px;
      padding: 8px 10px;
      background: #070d18;
      border-bottom: 1px solid rgba(0, 229, 255, 0.25);
      align-items: center;
    }
    .aero-code-input {
      background: #0d1729;
      border: 1.5px solid #274469;
      border-radius: 5px;
      color: #00ffcc;
      font-family: inherit;
      font-size: 13px;
      font-weight: 900;
      text-align: center;
      text-transform: uppercase;
      padding: 6px 4px;
      letter-spacing: 1.5px;
      outline: none;
    }
    .aero-code-input::placeholder { color: #476282; font-size: 10.5px; letter-spacing: 0.5px; }
    .aero-code-input:focus { border-color: #00ffcc; box-shadow: 0 0 10px rgba(0, 255, 204, 0.35); }
    .aero-enter-btn {
      background: linear-gradient(135deg, #00c853 0%, #009624 100%);
      border: 1px solid #69f0ae;
      color: #04120a;
      font-family: inherit;
      font-size: 12px;
      font-weight: 900;
      border-radius: 5px;
      padding: 6px 10px;
      cursor: pointer;
      letter-spacing: 0.6px;
    }
    .aero-enter-btn:hover { filter: brightness(1.12); }
    .aero-clr-btn {
      background: #1f1629;
      border: 1px solid #ff2a6d;
      color: #ff2a6d;
      font-family: inherit;
      font-size: 11px;
      font-weight: 800;
      border-radius: 5px;
      padding: 6px 8px;
      cursor: pointer;
    }
    .aero-clr-btn:hover { background: #ff2a6d; color: #fff; }
    .aero-map-actions {
      display: none;
      gap: 6px;
      padding: 6px 10px;
      background: rgba(2, 132, 199, 0.12);
      border-bottom: 1px solid rgba(56, 189, 248, 0.22);
    }
    .aero-map-actions.visible { display: flex; flex-wrap: wrap; }
    .aero-screen {
      padding: 10px 12px 14px;
      overflow-y: auto;
      max-height: min(56vh, 520px);
      font-size: 11.5px;
      line-height: 1.5;
      color: var(--aero-neon);
      text-shadow: 0 0 6px rgba(0, 229, 255, 0.22);
      user-select: text;
    }
    .aero-block {
      padding: 7px 9px;
      margin-bottom: 7px;
      background: rgba(13, 22, 38, 0.78);
      border-left: 2.5px solid var(--aero-neon);
      border-radius: 4px;
      word-wrap: break-word;
    }
    .aero-block.aero-status-online {
      background: rgba(6, 38, 32, 0.52);
      border-left: 3px solid #10b981;
      text-shadow: none;
    }
    .aero-block.aero-status-offline {
      background: rgba(64, 12, 24, 0.68);
      border-left: 3px solid #f43f5e;
      text-shadow: none;
      font-size: 10.6px;
      line-height: 1.45;
    }
    .aero-block.clickable { cursor: pointer; transition: background 0.14s, border-color 0.14s; }
    .aero-block.clickable:hover { background: rgba(20, 36, 62, 0.95); border-left-color: #ff2a6d; }
    .aero-submodal {
      display: none;
      padding: 10px 12px;
      background: #091220;
      border-bottom: 1.5px solid #00e5ff;
      max-height: 300px;
      overflow-y: auto;
      font-size: 11.2px;
      color: #e2e8f0;
    }
    .aero-submodal.open { display: block; }
    .aero-cfg-input {
      width: 100%;
      background: #0f1a2e;
      border: 1px solid #33507a;
      color: #00ffcc;
      font-family: inherit;
      font-size: 11px;
      padding: 5px 7px;
      border-radius: 4px;
      margin: 3px 0 8px;
    }
    .aero-submodal.altn { max-height: min(70vh, 640px); font-size: 12.4px; line-height: 1.55; }
    .aero-submodal.altn .aero-tbtn { font-size: 11.5px; padding: 4px 10px; }
    #aeroTerminalPanel:not(.aero-sized) .aero-body-wrap { overflow-y: auto; min-height: 0; }

    .aero-rz { position: absolute; z-index: 6; touch-action: none; transition: background 0.12s; }
    .aero-rz:hover { background: rgba(0, 229, 255, 0.28); }
    .aero-rz-e { right: 0; top: 46px; bottom: 16px; width: 7px; cursor: ew-resize; }
    .aero-rz-w { left: 0; top: 46px; bottom: 16px; width: 7px; cursor: ew-resize; }
    .aero-rz-s { left: 16px; right: 16px; bottom: 0; height: 7px; cursor: ns-resize; }
    .aero-rz-se, .aero-rz-sw { bottom: 0; width: 18px; height: 18px; }
    .aero-rz-se { right: 0; cursor: nwse-resize; }
    .aero-rz-sw { left: 0; cursor: nesw-resize; }
    .aero-rz-se, .aero-rz-sw {
      background: linear-gradient(135deg, transparent 52%, rgba(0,229,255,.75) 52%, rgba(0,229,255,.75) 60%, transparent 60%, transparent 72%, rgba(0,229,255,.75) 72%, rgba(0,229,255,.75) 80%, transparent 80%);
    }
    .aero-rz-sw { transform: scaleX(-1); }
    #aeroTerminalPanel.aero-sized { max-height: none; }
    #aeroTerminalPanel.aero-sized .aero-body-wrap { min-height: 0; overflow: hidden; }
    #aeroTerminalPanel.aero-sized .aero-screen { flex: 1 1 0; min-height: 60px; max-height: none; }
    #aeroTerminalPanel.aero-sized .aero-submodal { max-height: none; flex: 0 1 auto; min-height: 0; }
    #aeroTerminalPanel.aero-minimized { height: auto !important; }
    #aeroTerminalPanel.aero-minimized .aero-rz-s, #aeroTerminalPanel.aero-minimized .aero-rz-se, #aeroTerminalPanel.aero-minimized .aero-rz-sw { display: none; }
    .aero-route-status {
      flex-basis: 100%;
      font-size: 10.5px;
      font-weight: 800;
      color: #fde047;
      letter-spacing: 0.3px;
      padding: 2px 2px 0;
      word-break: break-word;
    }
    .aero-route-status span { color: #94a3b8; font-weight: 600; }

    .aero-rd-backdrop {
      --aero-neon: hsl(185, 100%, 58%);
      position: absolute;
      inset: 0;
      z-index: 120;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding: min(9vh, 64px) 12px 12px;
      background: rgba(3, 7, 14, 0.62);
      backdrop-filter: blur(3px);
      font-family: "Consolas", "JetBrains Mono", "Courier New", monospace;
      animation: aeroRdFade 0.14s ease-out;
    }
    @keyframes aeroRdFade { from { opacity: 0; } to { opacity: 1; } }
    .aero-rd-card {
      width: min(540px, 100%);
      max-height: 100%;
      overflow-y: auto;
      background: rgba(8, 14, 24, 0.98);
      border: 1.5px solid var(--aero-neon);
      border-radius: 12px;
      box-shadow: 0 22px 60px rgba(0, 0, 0, 0.9), 0 0 26px rgba(0, 229, 255, 0.24);
      color: #e2e8f0;
      padding: 12px 14px 12px;
      display: flex;
      flex-direction: column;
      gap: 9px;
    }
    .aero-rd-head { display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 900; letter-spacing: 0.8px; color: #00ffcc; }
    .aero-rd-chain { display: flex; flex-wrap: wrap; align-items: center; gap: 5px; padding: 6px 8px; background: rgba(13, 22, 38, 0.85); border-left: 2.5px solid var(--aero-neon); border-radius: 4px; font-size: 11px; }
    .aero-rd-chip { background: #0d1a2e; border: 1px solid #2b4266; border-radius: 4px; padding: 1px 6px; font-weight: 900; color: #00ffcc; white-space: nowrap; }
    .aero-rd-chip i { font-style: normal; color: #fde047; margin-right: 4px; }
    .aero-rd-chip.next { border-style: dashed; color: #94a3b8; }
    .aero-rd-arrow { color: #64748b; }
    .aero-rd-total { margin-left: auto; color: #34d399; font-weight: 800; white-space: nowrap; }
    .aero-rd-label { font-size: 12px; color: #cbd5e1; line-height: 1.4; }
    .aero-rd-label b { color: #fde047; }
    .aero-rd-input {
      width: 100%; box-sizing: border-box; background: #0d1729; border: 1.5px solid #274469; border-radius: 7px;
      color: #00ffcc; font-family: inherit; font-size: 20px; font-weight: 900; letter-spacing: 3px;
      text-transform: uppercase; text-align: center; padding: 10px 8px; outline: none;
    }
    .aero-rd-input::placeholder { color: #476282; font-size: 13px; letter-spacing: 0.5px; text-transform: none; }
    .aero-rd-input:focus { border-color: #00ffcc; box-shadow: 0 0 12px rgba(0, 255, 204, 0.35); }
    .aero-rd-input.shake { animation: aeroRdShake 0.28s; border-color: #ff2a6d; }
    @keyframes aeroRdShake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
    .aero-rd-preview { min-height: 44px; padding: 7px 9px; font-size: 11.5px; line-height: 1.5; border-radius: 6px; background: rgba(13, 22, 38, 0.7); border: 1px dashed #274469; color: #94a3b8; }
    .aero-rd-preview.ok { border: 1px solid #00c853; background: rgba(0, 200, 83, 0.09); color: #e2e8f0; }
    .aero-rd-preview.err { border: 1px solid #ff2a6d; background: rgba(255, 42, 109, 0.09); color: #fda4af; }
    .aero-rd-preview b.code { color: #00ffcc; }
    .aero-rd-flash { min-height: 15px; font-size: 11px; font-weight: 800; }
    .aero-rd-flash.ok { color: #6ee7b7; }
    .aero-rd-flash.err { color: #ff6b8f; }
    .aero-rd-sugg { display: flex; flex-direction: column; gap: 3px; max-height: 190px; overflow-y: auto; }
    .aero-rd-sugg:empty { display: none; }
    .aero-rd-item { display: flex; align-items: center; gap: 8px; background: #0d1729; border: 1px solid #1f3556; border-radius: 5px; padding: 5px 8px; color: #cbd5e1; font-family: inherit; font-size: 11px; text-align: left; cursor: pointer; }
    .aero-rd-item:hover, .aero-rd-item.sel { background: #0b3a5a; border-color: #00e5ff; color: #fff; }
    .aero-rd-item .codes { min-width: 66px; font-weight: 900; color: #00ffcc; }
    .aero-rd-item .nm { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .aero-rd-item .ct { color: #94a3b8; font-size: 10px; white-space: nowrap; }
    .aero-rd-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: flex-end; align-items: center; }
    .aero-rd-actions .aero-tbtn, .aero-rd-actions .aero-enter-btn { padding: 7px 11px; font-size: 11.5px; }
    .aero-rd-actions .spacer { flex: 1; }
    .aero-rd-actions kbd { font-family: inherit; font-size: 9.5px; opacity: 0.8; border: 1px solid currentColor; border-radius: 3px; padding: 0 3px; margin-left: 3px; }
    .aero-rd-hint { font-size: 9.8px; color: #64748b; line-height: 1.45; }
    .aero-e6b-row { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 7px; }
  `;
  document.head.appendChild(aeroCss);

  function injectTopBarButtonAndPanel() {
    const toolbar = document.querySelector(".top-bar .toolbar") || document.querySelector(".top-bar");
    if (toolbar && !document.getElementById("btnAeroTerminalToggle")) {
      const btn = document.createElement("button");
      btn.className = "btn btn-aeroterminal-top";
      btn.id = "btnAeroTerminalToggle";
      btn.type = "button";
      btn.title = "AeroTerminal: Canlı METAR, TAF, SIGMET, Aktif Pist & Yan Rüzgâr Analizi, D-ATIS ve E6-B Uçuş Bilgisayarı";
      btn.innerHTML = "✈️ AeroTerminal";
      btn.addEventListener("click", () => toggleAeroTerminalPanel());
      toolbar.insertBefore(btn, toolbar.firstChild);
    }

    const stage = document.getElementById("mapStage") || document.body;
    if (document.getElementById("aeroTerminalPanel")) return;

    const panel = document.createElement("div");
    panel.id = "aeroTerminalPanel";
    panel.innerHTML = `
      <div class="aero-head" id="aeroDragHandle">
        <div class="aero-head-title">
          <span class="aero-brand-line">✈️ AEROTERMINAL: SECOVVV</span>
          <span class="aero-sub-line" id="aeroDbCountBadge">DB: HAZIR</span>
        </div>
        <div class="aero-clock-strip">
          <div class="aero-clock-box" id="aeroZuluBox" title="UTC / Havacılık Zulu Saati">ZULU<br>--:--:--</div>
          <div class="aero-clock-box" id="aeroWorldClockBox" title="Tıklayarak Küresel Havacılık Saatleri Arasında Geçiş Yapın">LOCAL<br><span style="color:#ffb300;">--:--:--</span></div>
        </div>
        <div class="aero-win-btns">
          <button type="button" class="aero-win-btn" id="btnAeroMin" title="Küçült / Büyüt">▾</button>
          <button type="button" class="aero-win-btn close" id="btnAeroClose" title="Kapat">✖</button>
        </div>
      </div>

      <div class="aero-body-wrap">
        <div class="aero-toolbar-row">
          <button type="button" class="aero-tbtn" id="btnAeroAptSrc" title="Havalimanı Veri Kaynağı (AirportDB <-> Local JSON)">[APTDB]</button>
          <button type="button" class="aero-tbtn" id="btnAeroWxSrc" title="Meteoroloji Kaynağı (CheckWX <-> NOAA)">[CHKWX]</button>
          <button type="button" class="aero-tbtn" id="btnAeroAtis" title="Sentetik D-ATIS Sesli Yayını Üret">[D-ATIS]</button>
          <button type="button" class="aero-tbtn" id="btnAeroAltn" title="250 NM Çapındaki En Uygun Yedek (Alternate) Meydanları Bul">[ALTN]</button>
          <button type="button" class="aero-tbtn" id="btnAeroE6b" title="E6-B Taktiksel Uçuş ve Birim Dönüştürücü">[E6-B]</button>
          <button type="button" class="aero-tbtn" id="btnAeroPrint" title="Brifing Raporunu Yazdır">[PRINT]</button>
          <button type="button" class="aero-tbtn" id="btnAeroCfg" title="API Anahtarı (BYOK), Hedef İrtifa ve Terminal Rengi Ayarları">[CFG]</button>
        </div>

        <div class="aero-submodal" id="aeroSubModal"></div>

        <div class="aero-input-bar">
          <input type="text" id="aeroInputIata" class="aero-code-input" maxlength="3" placeholder="IATA (3)" autocomplete="off" spellcheck="false">
          <input type="text" id="aeroInputIcao" class="aero-code-input" maxlength="4" placeholder="ICAO (4)" autocomplete="off" spellcheck="false">
          <button type="button" class="aero-enter-btn" id="btnAeroEnter">&gt; ENTER</button>
          <button type="button" class="aero-clr-btn" id="btnAeroClear" title="Terminali ve Seçimi Temizle">CLR</button>
        </div>

        <div class="aero-map-actions" id="aeroMapActions">
          <button type="button" class="aero-tbtn" id="btnAeroFly" title="2D Atlas veya 3D Kürede Meydana Uç">🎯 Meydana Odaklan</button>
          <button type="button" class="aero-tbtn" id="btnAeroAddRoute" title="Bu Havalimanını Çok Duraklı Büyük Daire Uçuş Rotasına Durak Olarak Ekle">➕ Uçuş Rotasına Ekle</button>
          <button type="button" class="aero-tbtn" id="btnAeroRefresh" title="Önbelleği Atlayıp Canlı METAR/TAF Yenile">🔄 Canlı Yenile</button>
          <button type="button" class="aero-tbtn" id="btnAeroUndoRoute" style="display:none;" title="Rotaya eklenen son durağı geri al">↩ Son Durağı Geri Al</button>
          <button type="button" class="aero-tbtn warn" id="btnAeroCancelRoute" style="display:none;" title="Planlanan uçuş rotasının tamamını iptal et">✖ Rotayı İptal Et</button>
          <div class="aero-route-status" id="aeroRouteStatus" style="display:none;"></div>
        </div>

        <div class="aero-screen" id="aeroTerminalScreen">
          <div class="aero-block" id="aeroSourceStatusBlock"></div>
          <div class="aero-block" id="aeroHeaderBlock"></div>
          <div class="aero-block" id="aeroConditionBlock" style="display:none;"></div>
          <div class="aero-block clickable" id="aeroRunwayBlock" style="display:none;" title="Sesli Pist & Rüzgâr Analizi İçin Tıklayın"></div>
          <div class="aero-block clickable" id="aeroMetarBlock" style="display:none;" title="Pilot Decoder ve Sesli Okuma İçin Tıklayın"></div>
          <div class="aero-block clickable" id="aeroTafBlock" style="display:none;" title="Pilot Decoder ve Sesli Okuma İçin Tıklayın"></div>
          <div class="aero-block" id="aeroSigmetBlock" style="display:none;"></div>
        </div>
      </div>
    `;
    stage.appendChild(panel);

    applyTerminalHue(currentHue);
    updateDbBadgeStatus();
    renderStandbyScreen();
    bindAeroPanelEvents(panel);
    makeAeroPanelDraggable(panel);
    makeAeroPanelResizable(panel);
  }

  function applyTerminalHue(hue) {
    currentHue = Number(hue) || 185;
    const panel = document.getElementById("aeroTerminalPanel");
    if (panel) panel.style.setProperty("--aero-neon", `hsl(${currentHue}, 100%, 58%)`);
  }

  function renderStandbyScreen(customError = "") {
    renderSourceStatusBanner();
    const hdr = document.getElementById("aeroHeaderBlock");
    if (!hdr) return;
    ["aeroConditionBlock", "aeroRunwayBlock", "aeroMetarBlock", "aeroTafBlock", "aeroSigmetBlock"].forEach(id => {
      const el = document.getElementById(id);
      if (el) { el.style.display = "none"; el.innerHTML = ""; }
    });
    const act = document.getElementById("aeroMapActions");
    if (act) act.classList.remove("visible");

    if (customError) {
      hdr.innerHTML = `&gt; <b style="color:#ff2a6d;">[ SİSTEM HATASI ]</b><br>&gt; ${customError}<br>&gt; 3 harfli <b>IATA</b> (örn. IST, TZX, JFK) veya 4 harfli <b>ICAO</b> (örn. LTFM, LTCG, KJFK) girin.`;
      return;
    }

    const keyInfo = (customCheckWxKey || customAirportDbKey)
      ? `<span style="color:#00ff66;">ÖZEL BYOK API ANAHTARI AKTİF</span>`
      : `<span style="color:#ffb300;">VARSAYILAN DATALINK ANAHTARLARI AKTİF</span>`;

    hdr.innerHTML =
      `&gt; <b>AEROTERMINAL: SECOVVV</b> // FLIGHT OPS HAZIR<br>` +
      `&gt; Sorgulamak için <b>IATA (3)</b> veya <b>ICAO (4)</b> kodu girin.<br>` +
      `&gt; API Güvenliği: ${keyInfo}`;
  }

  // ================= 7. SORGULAMA VE GÖRÜNÜM GÜNCELLEME =================
  function normalizeAeroCode(str) {
    return String(str || "").replace(/İ/g, "I").replace(/ı/g, "I").toUpperCase().replace(/[^A-Z0-9]/g, "");
  }

  async function executeAirportQuery(bypassCache = false) {
    stopAviationSpeech();
    const myToken = ++aeroQueryToken;
    const iataEl = document.getElementById("aeroInputIata");
    const icaoEl = document.getElementById("aeroInputIcao");
    const iataIn = normalizeAeroCode(iataEl ? iataEl.value : "");
    const icaoIn = normalizeAeroCode(icaoEl ? icaoEl.value : "");

    if (!iataIn && !icaoIn && !activeAirport) {
      playAeroBeep(340, 140, "sawtooth");
      renderStandbyScreen("Arama kodu girilmedi. IATA (3) veya ICAO (4) kodu yazın.");
      return;
    }
    if (iataIn && iataIn.length !== 3) {
      playAeroBeep(340, 140, "sawtooth");
      renderStandbyScreen(`Geçersiz IATA kodu: '${iataIn}' (3 harf olmalı).`);
      return;
    }
    if (!iataIn && icaoIn && icaoIn.length !== 4) {
      playAeroBeep(340, 140, "sawtooth");
      renderStandbyScreen(`Geçersiz ICAO kodu: '${icaoIn}' (4 karakter olmalı).`);
      return;
    }

    const lookup = () => {
      if (iataIn) return iataMap.get(iataIn) || null;
      if (icaoIn) return icaoMap.get(icaoIn) || null;
      return null;
    };

    const hdr = document.getElementById("aeroHeaderBlock");
    let targetBase = null;

    if (iataIn || icaoIn) {
      targetBase = lookup();
      if (!targetBase && !airportsDbLoaded) {
        hdr.innerHTML = `&gt; <span style="color:#00e5ff;">Yerel havalimanı veritabanı (airports.json) yükleniyor...</span>`;
        await ensureAirportsDatabaseLoaded();
        if (myToken !== aeroQueryToken) return;
        targetBase = lookup();
      }
      if (!targetBase) {
        playAeroBeep(340, 140, "sawtooth");
        const dbHint = !airportsDbLoaded
          ? " (Not: airports.json yüklenemediği için yalnızca 29 çekirdek meydan taranabildi.)"
          : "";
        renderStandbyScreen((iataIn ? `IATA '${iataIn}'` : `ICAO '${icaoIn}'`) + ` için meydan bulunamadı.${dbHint}`);
        return;
      }
    } else if (activeAirport) {
      targetBase = icaoMap.get(activeAirport.icao) || {
        icao: activeAirport.icao,
        iata: activeAirport.iata,
        name: activeAirport.ad,
        city: activeAirport.sehir,
        elevation: parseFloat(activeAirport.rakim) || 0,
        lat: activeAirport.lat,
        lon: activeAirport.lon,
        tz: activeAirport.tz
      };
    }

    playAeroBeep(1180, 75);

    const online = isAeroNetOnline();
    activeAirport = {
      icao: targetBase.icao,
      iata: targetBase.iata || "---",
      ad: targetBase.name,
      sehir: targetBase.city,
      rakim: targetBase.elevation !== null ? `${targetBase.elevation} ft` : "Kayıt Yok",
      pistler: online ? "Yükleniyor..." : "YOK (Çevrimdışı)",
      frekanslar: online ? "Yükleniyor..." : "YOK (Çevrimdışı)",
      lat: targetBase.lat,
      lon: targetBase.lon,
      tz: targetBase.tz || "UTC",
      airportSource: `Yerel DB (${airportsDbLoaded ? "airports.json" : "Çekirdek"})`,
      weatherSource: online ? "Bağlanıyor..." : "🔴 ÇEVRİMDIŞI",
      isOffline: !online
    };
    aeroWxLoading = online;
    isMetarDecoded = false;
    isTafDecoded = false;
    rawMetarText = "";
    rawTafText = "";
    renderAeroAirportMarkerOnSvg();
    updateActiveTerminalBlocks(online ? `&gt; <span style="color:#00e5ff;">[SIGMET] NOAA taranıyor...</span>` : "");
    const act = document.getElementById("aeroMapActions");
    if (act) act.classList.add("visible");
    syncAeroRouteButtons();
    flyMapToAirport(activeAirport);

    const applyPartial = (p) => {
      if (myToken !== aeroQueryToken) return;
      activeAirport = {
        ...p.apt,
        airportSource: p.airportSource,
        weatherSource: p.wxPending ? "Bağlanıyor..." : p.weatherSource,
        isOffline: !!p.isOffline,
        fromMemoryCache: !!p.fromMemoryCache,
        cachedAt: p.cachedAt || 0
      };
      aeroWxLoading = !!p.wxPending;
      if (!p.wxPending) {
        rawMetarText = p.metar;
        rawTafText = p.taf;
        isMetarDecoded = false;
        isTafDecoded = false;
      }
      updateActiveTerminalBlocks(p.sigmetHtml);
    };

    const res = await queryAirportAndWeather(targetBase, bypassCache, applyPartial);
    if (myToken !== aeroQueryToken) return;

    aeroWxLoading = false;
    activeAirport = {
      ...res.apt,
      airportSource: res.airportSource,
      weatherSource: res.weatherSource,
      isOffline: !!res.isOffline,
      fromMemoryCache: !!res.fromMemoryCache,
      cachedAt: res.cachedAt || 0
    };
    rawMetarText = res.metar;
    rawTafText = res.taf;
    isMetarDecoded = false;
    isTafDecoded = false;

    renderAeroAirportMarkerOnSvg();
    updateActiveTerminalBlocks(res.sigmetHtml);
    syncAeroRouteButtons();
    playAeroBeep(1560, 90);
  }

  function updateActiveTerminalBlocks(sigmetHtmlOpt) {
    renderSourceStatusBanner();
    if (!activeAirport) return;
    const hdr = document.getElementById("aeroHeaderBlock");
    const cond = document.getElementById("aeroConditionBlock");
    const rwy = document.getElementById("aeroRunwayBlock");
    const met = document.getElementById("aeroMetarBlock");
    const taf = document.getElementById("aeroTafBlock");
    const sig = document.getElementById("aeroSigmetBlock");

    hdr.innerHTML =
      `&gt; <b>OPERATIONS CENTER:</b> <span style="color:#fff;">${aeroEsc(activeAirport.ad)}</span><br>` +
      `&gt; <b>CITY / COORD:</b> ${aeroEsc(activeAirport.sehir)} (${activeAirport.lat.toFixed(3)}°, ${activeAirport.lon.toFixed(3)}°)<br>` +
      `&gt; <b>IATA / ICAO:</b> <span style="color:#00ffcc;font-weight:900;">${aeroEsc(activeAirport.iata || "---")}</span> | <span style="color:#00ffcc;font-weight:900;">${aeroEsc(activeAirport.icao)}</span><br>` +
      `&gt; <b>ELEVATION:</b> ${aeroEsc(activeAirport.rakim)}<br>` +
      `&gt; <b>RUNWAYS:</b> ${aeroEsc(activeAirport.pistler)}<br>` +
      `&gt; <b>FREQUENCIES:</b> ${aeroEsc(activeAirport.frekanslar)}`;

    if (aeroWxLoading) {
      cond.style.display = "block";
      cond.innerHTML = `&gt; <span style="color:#00e5ff;">Canlı METAR ve TAF verileri indiriliyor...</span>`;
      rwy.style.display = "none";
      met.style.display = "none";
      taf.style.display = "none";
      if (sigmetHtmlOpt !== undefined) {
        sig.style.display = "block";
        sig.innerHTML = sigmetHtmlOpt;
      }
      return;
    }

    const flTxt = selectedAltitudeFt >= 10000 ? ` (FL${Math.round(selectedAltitudeFt / 100)})` : "";
    let airspaceClass = "CLASS G/C (Traffic Pattern)";
    let airspaceRule = `<span style="color:#00e5ff;">VFR Min Vis: 5 KM. Remain clear of surface clouds.</span>`;
    if (selectedAltitudeFt >= 19500) {
      airspaceClass = "CLASS A (FL195+)";
      airspaceRule = `<span style="color:#ff2a6d;">Strictly IFR! VFR flight prohibited.</span>`;
    } else if (selectedAltitudeFt >= 10000) {
      airspaceClass = "CLASS B/C (FL100 - FL195)";
      airspaceRule = `<span style="color:#ffb300;">VFR Min Vis: 8 KM. Clouds: Vert 1000ft, Horiz 1500m.</span>`;
    } else if (selectedAltitudeFt > 3000) {
      airspaceClass = "CLASS C/D/E (3000ft - FL100)";
      airspaceRule = `<span style="color:#00ff66;">VFR Min Vis: 5 KM. Clouds: Vert 1000ft, Horiz 1500m.</span>`;
    }

    cond.style.display = "block";
    cond.innerHTML =
      `&gt; <b>AIRPORT CONDITION ANALYSIS:</b><br>${analyzeFlightRules(rawMetarText)}<br>` +
      `&gt; <b>TARGET ALTITUDE:</b> ${selectedAltitudeFt} FT${flTxt} &bull; ${airspaceClass}<br>` +
      `&gt; ${airspaceRule}`;

    rawRunwayHtml = analyzeRunwayAndWindHtml(rawMetarText, activeAirport);
    rwy.style.display = "block";
    rwy.innerHTML = rawRunwayHtml;

    const safeMetar = aeroEsc(rawMetarText).replace(/\r?\n/g, "<br>");
    const safeTaf = aeroEsc(rawTafText).replace(/\r?\n/g, "<br>");

    met.style.display = "block";
    met.innerHTML = `&gt; <b>METAR</b> <i><span style="color:#94a3b8;">(Pilot Decoder &amp; Sesli Okuma için tıklayın)</span></i>:<br>` +
      (isMetarDecoded ? decodeAviationTermsHtml(rawMetarText) : `<span style="color:#ffffff;">${safeMetar}</span>`);

    taf.style.display = "block";
    taf.innerHTML = `&gt; <b>TAF</b> <i><span style="color:#94a3b8;">(Pilot Decoder &amp; Sesli Okuma için tıklayın)</span></i>:<br>` +
      (isTafDecoded ? decodeAviationTermsHtml(rawTafText) : `<span style="color:#cbd5e1;">${safeTaf}</span>`);

    if (sigmetHtmlOpt !== undefined) {
      sig.style.display = "block";
      sig.innerHTML = sigmetHtmlOpt;
    }
  }

  // ================= 8. ALT ARAÇLAR: D-ATIS, 250NM ALTN, E6-B, CFG, PRINT =================
  function toggleSubModal(mode) {
    const box = document.getElementById("aeroSubModal");
    if (!box) return;
    const setWide = (on) => { box.classList.toggle("altn", on); };
    if (activeSubModal === mode) {
      activeSubModal = null;
      box.classList.remove("open");
      box.innerHTML = "";
      setWide(false);
      stopAviationSpeech();
      return;
    }
    activeSubModal = mode;
    box.classList.add("open");
    setWide(mode === "altn");
    playAeroBeep(1020, 60);

    if (mode === "atis") renderAtisModal(box);
    else if (mode === "altn") renderAlternateModal(box);
    else if (mode === "e6b") renderE6bModal(box);
    else if (mode === "cfg") renderConfigModal(box);
  }

  function renderAtisModal(box) {
    if (!activeAirport || !rawMetarText || rawMetarText.includes("ERROR") || rawMetarText.includes("OFFLINE") || rawMetarText.includes("ÇEVRİMDIŞI")) {
      box.innerHTML = `&gt; <b style="color:#ff2a6d;">[D-ATIS DEVRE DIŞI]</b> Sentetik D-ATIS yayını için önce internet bağlıyken geçerli bir meydan sorgulayın.`;
      return;
    }
    const phonetic = ["ALPHA","BRAVO","CHARLIE","DELTA","ECHO","FOXTROT","GOLF","HOTEL","INDIA","JULIET","KILO","LIMA","MIKE","NOVEMBER","OSCAR","PAPA","QUEBEC","ROMEO","SIERRA","TANGO","UNIFORM","VICTOR","WHISKEY","X-RAY","YANKEE","ZULU"];
    const now = new Date();
    const hr = now.getUTCHours();
    const mn = now.getUTCMinutes();
    const infoLetter = phonetic[hr % 26];
    const zuluStr = `${String(hr).padStart(2, "0")}${String(mn).padStart(2, "0")} ZULU`;

    let msg = `${activeAirport.icao} TERMINAL INFORMATION ${infoLetter}. TIME ${zuluStr}. `;
    const rwyMatch = rawRunwayHtml.match(/Runway\s+([0-9]{2}[LRC]?)/);
    if (rwyMatch) msg += `EXPECTING ILS OR VISUAL APPROACH RUNWAY ${rwyMatch[1]}. `;

    const wMatch = rawMetarText.match(/\b([0-3]\d{2}|VRB)(\d{2,3})(G\d{2,3})?(KT|MPS)\b/);
    if (wMatch) {
      msg += `WIND ${wMatch[1] === "VRB" ? "VARIABLE" : wMatch[1]} AT ${parseInt(wMatch[2], 10)} KNOTS. `;
    } else {
      msg += `WIND CALM. `;
    }

    if (rawMetarText.includes("CAVOK")) msg += `CAVOK. `;
    else {
      const vMatch = (" " + rawMetarText + " ").match(/\s(\d{4})(?:NDV)?\s/);
      if (vMatch) msg += vMatch[1] === "9999" ? "VISIBILITY 10 KILOMETERS OR MORE. " : `VISIBILITY ${parseInt(vMatch[1], 10)} METERS. `;
    }

    const tMatch = rawMetarText.match(/\b(M?\d{2})\/(M?\d{2})\b/);
    if (tMatch) msg += `TEMPERATURE ${tMatch[1].replace("M", "MINUS ")}, DEW POINT ${tMatch[2].replace("M", "MINUS ")}. `;

    const qMatch = rawMetarText.match(/\bQ(\d{4})\b/);
    if (qMatch) msg += `ALTIMETER QNH ${qMatch[1]}. `;
    else {
      const aMatch = rawMetarText.match(/\bA(\d{4})\b/);
      if (aMatch) msg += `ALTIMETER ${aMatch[1].slice(0, 2)} DECIMAL ${aMatch[1].slice(2, 4)}. `;
    }
    msg += `ADVISE ON INITIAL CONTACT YOU HAVE INFORMATION ${infoLetter}.`;

    box.innerHTML =
      `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">` +
      `<b style="color:#00ffcc;">[ 📡 SYNTHESIZED D-ATIS BROADCAST ]</b>` +
      `<button type="button" class="aero-tbtn" onclick="document.getElementById('btnAeroAtis').click()">KAPAT</button></div>` +
      `<div style="color:#e2e8f0;line-height:1.45;">&gt; ${msg}</div>`;

    speakAviationText(msg);
  }

  async function renderAlternateModal(box) {
    if (!activeAirport) {
      box.innerHTML = `&gt; <b style="color:#ff2a6d;">[ALTN BEKLEMEDE]</b> Önce bir kalkış/varış meydanı seçin.`;
      return;
    }
    box.innerHTML = `&gt; <span style="color:#ffb300;">[ 📡 ${activeAirport.icao} ÇEVRESİNDE 250 NM TARANIYOR... ]</span>`;
    await ensureAirportsDatabaseLoaded();

    const originIcao = activeAirport.icao.toUpperCase();
    const originPrefix = originIcao.slice(0, 2);

    const nearby = [];
    for (let i = 0; i < allAirportsList.length; i++) {
      const a = allAirportsList[i];
      if (!a.icao || a.icao === originIcao || a.icao.length !== 4) continue;
      if (!a.iata || a.iata.length !== 3) continue;
      const dist = calcDistanceNM(activeAirport.lat, activeAirport.lon, a.lat, a.lon);
      if (dist <= 250.0) nearby.push({ apt: a, dist });
    }
    nearby.sort((x, y) => x.dist - y.dist);
    const top10 = nearby.slice(0, 10);

    if (top10.length === 0) {
      box.innerHTML = `&gt; <b style="color:#ff2a6d;">[ALTN]</b> 250 NM içinde ticari meydan bulunamadı.`;
      return;
    }

    if (!isAeroNetOnline()) {
      box.innerHTML =
        `&gt; <b style="color:#fda4af;">[ALTN • ÇEVRİMDIŞI MOD]</b> İnternet olmadığı için yedek meydanların canlı METAR havası çekilemiyor.<br>` +
        `&gt; <b>Yerel Veritabanından En Yakın Meydanlar:</b> ` +
        top10.slice(0, 5).map(x => `<a href="#" style="color:#00ffcc;" onclick="window.secovvvAeroJumpIcao('${x.apt.icao}');return false;">${x.apt.icao} (${x.dist.toFixed(0)} NM)</a>`).join(", ");
      return;
    }

    const icaoCsv = top10.map(x => x.apt.icao).join(",");
    try {
      const raw = await fetchNoaaTextResilient(`metar?ids=${encodeURIComponent(icaoCsv)}&format=raw`);
      const lines = raw.split(/\r?\n/).map(l => l.replace(/^METAR\s+|^SPECI\s+/, "").trim()).filter(l => l.length > 6);
      if (lines.length === 0) throw new Error("EMPTY_ALTN");

      lines.sort((a, b) => {
        const pA = a.slice(0, 2) === originPrefix ? 0 : 1;
        const pB = b.slice(0, 2) === originPrefix ? 0 : 1;
        if (pA !== pB) return pA - pB;
        const ifrA = analyzeFlightRules(a).includes("[IFR]") ? 1 : 0;
        const ifrB = analyzeFlightRules(b).includes("[IFR]") ? 1 : 0;
        return ifrA - ifrB;
      });

      let html = `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">` +
        `<b style="color:#00ffcc;">[ 🔄 YEDEK MEYDANLAR (≤250 NM • NOAA) ]</b>` +
        `<button type="button" class="aero-tbtn" onclick="document.getElementById('btnAeroAltn').click()">KAPAT</button></div>`;

      lines.slice(0, 4).forEach((mLine, idx) => {
        const ic = mLine.slice(0, 4).toUpperCase();
        const found = top10.find(x => x.apt.icao === ic);
        const distTxt = found ? `${found.dist.toFixed(1)} NM` : "? NM";
        const nameTxt = found ? `${found.apt.name} (${found.apt.iata})` : ic;
        const cond = analyzeFlightRules(mLine);
        const isIfr = cond.includes("[IFR]");
        html += `<div style="padding:6px;margin-bottom:6px;background:#0e1b2e;border-left:2px solid ${isIfr ? "#ff2a6d" : "#00ff66"};border-radius:4px;">` +
          `<b>#${idx + 1} ${ic}</b> - ${aeroEsc(nameTxt)} &bull; <b style="color:#00e5ff;">${distTxt}</b> ` +
          `<button type="button" class="aero-tbtn" style="float:right;padding:1px 6px;" onclick="window.secovvvAeroJumpIcao('${ic}')">UÇ &rarr;</button><br>` +
          `<span style="color:${isIfr ? "#ff2a6d" : "#00ff66"};font-weight:800;">${isIfr ? "WEATHER LIMITS (IFR)" : "SUITABLE FOR DIVERSION"}</span><br>` +
          `<span style="color:#94a3b8;font-size:10px;">${aeroEsc(mLine)}</span></div>`;
      });
      box.innerHTML = html;
    } catch (_) {
      box.innerHTML = `&gt; <b style="color:#ffb300;">[ALTN]</b> NOAA çoklu METAR hattına ulaşılamadı; veritabanındaki en yakın meydanlar: ` +
        top10.slice(0, 4).map(x => `<a href="#" style="color:#00ffcc;" onclick="window.secovvvAeroJumpIcao('${x.apt.icao}');return false;">${x.apt.icao} (${x.dist.toFixed(0)} NM)</a>`).join(", ");
    }
  }

  window.secovvvAeroJumpIcao = function (icao) {
    const iataEl = document.getElementById("aeroInputIata");
    const icaoEl = document.getElementById("aeroInputIcao");
    if (iataEl) iataEl.value = "";
    if (icaoEl) icaoEl.value = icao;
    if (activeSubModal) toggleSubModal(activeSubModal);
    executeAirportQuery(false);
  };

  function renderE6bModal(box) {
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <b style="color:#00ffcc;">[ 🧮 E6-B UÇUŞ BİLGİSAYARI (ÇEVRİMDIŞI ÇALIŞIR) ]</b>
        <button type="button" class="aero-tbtn" onclick="document.getElementById('btnAeroE6b').click()">KAPAT</button>
      </div>
      <div style="color:#b388ff;font-size:10px;">&gt; HIZ: KNOTS &harr; KM/S</div>
      <div class="aero-e6b-row">
        <input type="number" step="any" class="aero-cfg-input" placeholder="KT" oninput="this.nextElementSibling.value = this.value===''?'':(parseFloat(this.value)*1.852).toFixed(2)">
        <input type="number" step="any" class="aero-cfg-input" placeholder="KM/S" oninput="this.previousElementSibling.value = this.value===''?'':(parseFloat(this.value)/1.852).toFixed(2)">
      </div>
      <div style="color:#b388ff;font-size:10px;">&gt; MESAFE: NAUTICAL MILES (NM) &harr; KM</div>
      <div class="aero-e6b-row">
        <input type="number" step="any" class="aero-cfg-input" placeholder="NM" oninput="this.nextElementSibling.value = this.value===''?'':(parseFloat(this.value)*1.852).toFixed(2)">
        <input type="number" step="any" class="aero-cfg-input" placeholder="KM" oninput="this.previousElementSibling.value = this.value===''?'':(parseFloat(this.value)/1.852).toFixed(2)">
      </div>
      <div style="color:#b388ff;font-size:10px;">&gt; İRTİFA: FEET (FT) &harr; METRE (M)</div>
      <div class="aero-e6b-row">
        <input type="number" step="any" class="aero-cfg-input" placeholder="FEET" oninput="this.nextElementSibling.value = this.value===''?'':(parseFloat(this.value)*0.3048).toFixed(2)">
        <input type="number" step="any" class="aero-cfg-input" placeholder="METRE" oninput="this.previousElementSibling.value = this.value===''?'':(parseFloat(this.value)/0.3048).toFixed(2)">
      </div>
      <div style="color:#b388ff;font-size:10px;">&gt; BASINÇ: QNH (hPa) &harr; ALTIMETER (inHg)</div>
      <div class="aero-e6b-row">
        <input type="number" step="any" class="aero-cfg-input" placeholder="hPa (örn. 1013)" oninput="this.nextElementSibling.value = this.value===''?'':(parseFloat(this.value)/33.8639).toFixed(2)">
        <input type="number" step="any" class="aero-cfg-input" placeholder="inHg (örn. 29.92)" oninput="this.previousElementSibling.value = this.value===''?'':(parseFloat(this.value)*33.8639).toFixed(1)">
      </div>
      <div style="color:#b388ff;font-size:10px;">&gt; YAKIT JET-A1: LİTRE &harr; KİLOGRAM (0.803)</div>
      <div class="aero-e6b-row">
        <input type="number" step="any" class="aero-cfg-input" placeholder="Litre" oninput="this.nextElementSibling.value = this.value===''?'':(parseFloat(this.value)*0.803).toFixed(1)">
        <input type="number" step="any" class="aero-cfg-input" placeholder="KG" oninput="this.previousElementSibling.value = this.value===''?'':(parseFloat(this.value)/0.803).toFixed(1)">
      </div>
    `;
  }

  function renderConfigModal(box) {
    const fl = selectedAltitudeFt >= 10000 ? ` (FL${Math.round(selectedAltitudeFt / 100)})` : "";
    box.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <b style="color:#00ffcc;">[ ⚙️ SİSTEM AYARLARI &amp; API ANAHTARLARI ]</b>
        <button type="button" class="aero-tbtn" onclick="document.getElementById('btnAeroCfg').click()">KAPAT</button>
      </div>
      <div style="font-size:10px;color:#94a3b8;">ÖZEL CHECKWX API KEY (Boş bırakılırsa varsayılan kullanılır):</div>
      <input type="text" id="cfgCheckWxInput" class="aero-cfg-input" value="${aeroEsc(customCheckWxKey)}" placeholder="Opsiyonel kişisel CheckWX anahtarı">
      <div style="font-size:10px;color:#94a3b8;">ÖZEL AIRPORTDB API KEY (Boş bırakılırsa varsayılan kullanılır):</div>
      <input type="text" id="cfgAirportDbInput" class="aero-cfg-input" value="${aeroEsc(customAirportDbKey)}" placeholder="Opsiyonel kişisel AirportDB token">
      <div style="font-size:10.5px;color:#00ffcc;margin-top:4px;" id="cfgAltLabel">HEDEF İRTİFA: ${selectedAltitudeFt} FT${fl}</div>
      <input type="range" id="cfgAltRange" min="0" max="400" step="5" value="${Math.round(selectedAltitudeFt / 100)}" style="width:100%;margin:4px 0 8px;">
      <div style="font-size:10.5px;color:#00e5ff;" id="cfgHueLabel">TERMİNAL RENGİ (${currentHue}°):</div>
      <input type="range" id="cfgHueRange" min="0" max="360" step="1" value="${currentHue}" style="width:100%;margin:4px 0 10px;">
      <button type="button" class="aero-enter-btn" id="btnSaveAeroCfg" style="width:100%;">&gt; KAYDET VE UYGULA</button>
    `;

    const altRange = document.getElementById("cfgAltRange");
    const altLbl = document.getElementById("cfgAltLabel");
    altRange.addEventListener("input", () => {
      selectedAltitudeFt = Number(altRange.value) * 100;
      const flTag = selectedAltitudeFt >= 10000 ? ` (FL${Math.round(selectedAltitudeFt / 100)})` : "";
      altLbl.textContent = `HEDEF İRTİFA: ${selectedAltitudeFt} FT${flTag}`;
      if (activeAirport) updateActiveTerminalBlocks();
    });

    const hueRange = document.getElementById("cfgHueRange");
    const hueLbl = document.getElementById("cfgHueLabel");
    hueRange.addEventListener("input", () => {
      applyTerminalHue(Number(hueRange.value));
      if (hueLbl) hueLbl.textContent = `TERMİNAL RENGİ (${currentHue}°):`;
    });

    document.getElementById("btnSaveAeroCfg").addEventListener("click", () => {
      customCheckWxKey = document.getElementById("cfgCheckWxInput").value.trim();
      customAirportDbKey = document.getElementById("cfgAirportDbInput").value.trim();
      localStorage.setItem("secovvv_aero_checkwx_key", customCheckWxKey);
      localStorage.setItem("secovvv_aero_airportdb_key", customAirportDbKey);
      localStorage.setItem("secovvv_aero_alt_ft", String(selectedAltitudeFt));
      localStorage.setItem("secovvv_aero_hue", String(currentHue));
      playAeroBeep(1480, 90);
      toggleSubModal("cfg");
      if (!activeAirport) renderStandbyScreen();
    });
  }

  function printTerminalReport() {
    if (!activeAirport) return;
    playAeroBeep(1100, 80);
    const screen = document.getElementById("aeroTerminalScreen");
    const w = window.open("", "_blank", "width=820,height=680");
    if (!w) return;
    w.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AEROTERMINAL BRIEFING - ${activeAirport.icao}</title>` +
      `<style>body{font-family:Consolas,monospace;padding:24px;color:#000;line-height:1.55;}` +
      `.aero-block{border-left:3px solid #000;padding-left:10px;margin-bottom:14px;} span,b{color:#000 !important;}</style>` +
      `</head><body><h2>&gt;&gt;&gt; SECOVVV AEROTERMINAL FLIGHT DISPATCH BRIEFING: ${activeAirport.icao} &lt;&lt;&lt;</h2>` +
      `${screen ? screen.innerHTML : ""}<hr><small>Generated by SECOVVV GEO-PRO AeroTerminal &bull; ${new Date().toUTCString()}</small></body></html>`
    );
    w.document.close();
    w.focus();
    setTimeout(() => w.print(), 250);
  }

  // ================= 9. UÇUŞ ROTASI PENCERESİ =================
  function aeroEsc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function foldAeroText(str) {
    return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ı/g, "i").toLowerCase();
  }

  function aeroRouteLabel(a) {
    const ic = a.icao;
    const ia = a.iata && a.iata !== "---" ? a.iata : "";
    return ia ? `${ic} (${ia})` : ic;
  }

  function aeroRoutePts() {
    return (typeof measurePoints !== "undefined" && Array.isArray(measurePoints)) ? measurePoints : [];
  }

  function aeroRouteCodes() {
    return aeroRoutePts().map(pt => String(pt.label || "").split(" (")[0].split(" ")[0] || "?");
  }

  function syncAeroRouteButtons() {
    const n = aeroRoutePts().length;
    const undoB = document.getElementById("btnAeroUndoRoute");
    const cancB = document.getElementById("btnAeroCancelRoute");
    const st = document.getElementById("aeroRouteStatus");
    const addB = document.getElementById("btnAeroAddRoute");
    if (undoB) undoB.style.display = n > 0 ? "" : "none";
    if (cancB) cancB.style.display = n > 0 ? "" : "none";
    if (addB) addB.textContent = n > 0 ? "➕ Durak Ekle…" : "➕ Uçuş Rotasına Ekle…";
    if (st) {
      if (n > 0) {
        st.style.display = "block";
        st.innerHTML = `🧭 ROTA: ${aeroEsc(aeroRouteCodes().join(" → "))} <span>(${n} durak)</span>`;
      } else {
        st.style.display = "none";
        st.innerHTML = "";
      }
    }
  }

  function restoreRouteSnapshot(snapshot, wasMode) {
    measurePoints = snapshot.map(pt => ({ ...pt }));
    measureRouteCache = (measurePoints.length >= 2 && typeof computeMultiStopRouteMetrics === "function")
      ? computeMultiStopRouteMetrics(measurePoints) : null;
    if (typeof renderMeasureOverlay === "function") renderMeasureOverlay();
    if (!wasMode && typeof measureMode !== "undefined" && measureMode && typeof toggleMeasureMode === "function") {
      toggleMeasureMode();
    } else if (typeof updateMeasureHudPanel === "function") {
      updateMeasureHudPanel();
    }
  }

  function searchAirportsForRoute(query, limit = 7) {
    const raw = String(query || "").trim();
    if (raw.length < 2) return [];
    const code = normalizeAeroCode(raw);
    const q = foldAeroText(raw).trim();
    const top = [];
    const list = allAirportsList;
    for (let i = 0; i < list.length; i++) {
      const it = list[i];
      let sc = 0;
      if (code) {
        if (it.iata === code || it.icao === code) sc = 100;
        else if (it.iata && it.iata.startsWith(code)) sc = 62;
        else if (it.icao.startsWith(code)) sc = 55;
      }
      if (sc < 50 && q.length >= 3) {
        if (it._c === undefined) {
          it._c = foldAeroText(it.city);
          it._n = foldAeroText(it.name);
        }
        if (it._c.startsWith(q)) sc = Math.max(sc, 50);
        else if (it._n.startsWith(q)) sc = Math.max(sc, 45);
        else if (it._c.includes(q) || it._n.includes(q)) sc = Math.max(sc, 25);
      }
      if (sc <= 0) continue;
      if (it.iata) sc += 4;
      if (/international/i.test(it.name)) sc += 3;
      if (top.length < limit || sc > top[top.length - 1].sc) {
        let pos = top.length;
        while (pos > 0 && top[pos - 1].sc < sc) pos--;
        top.splice(pos, 0, { it, sc });
        if (top.length > limit) top.pop();
      }
    }
    return top.map(x => x.it);
  }

  function closeRouteDialog() {
    const st = routeDlgState;
    if (!st) return;
    try { st.root.remove(); } catch (_) {}
    routeDlgState = null;
    syncAeroRouteButtons();
    const addB = document.getElementById("btnAeroAddRoute");
    if (addB) { try { addB.focus(); } catch (_) {} }
  }

  function openRouteAddDialog() {
    if (routeDlgState || !activeAirport) return;
    if (typeof addMeasurePoint !== "function" || typeof toggleMeasureMode !== "function") return;

    const wasMode = (typeof measureMode !== "undefined") && measureMode;
    const snapshot = aeroRoutePts().map(pt => ({ ...pt }));
    if (!wasMode) toggleMeasureMode();

    const pts = aeroRoutePts();
    if (pts.length === 0) {
      addMeasurePoint(activeAirport.lon, activeAirport.lat, aeroRouteLabel(activeAirport));
    }

    const stage = document.getElementById("mapStage") || document.body;
    const root = document.createElement("div");
    root.className = "aero-rd-backdrop";
    root.id = "aeroRouteDlg";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.style.setProperty("--aero-neon", `hsl(${currentHue}, 100%, 58%)`);
    root.innerHTML = `
      <div class="aero-rd-card">
        <div class="aero-rd-head">
          <span id="aeroRdTitle">✈️ UÇUŞ ROTASINA DURAK EKLE</span>
          <button type="button" class="aero-win-btn close" id="aeroRdX" title="İptal (Esc)">✖</button>
        </div>
        <div class="aero-rd-chain" id="aeroRdChain"></div>
        <label class="aero-rd-label" for="aeroRdInput">Gideceğiniz meydanın <b>ICAO</b> veya <b>IATA</b> kodunu girin</label>
        <input type="text" id="aeroRdInput" class="aero-rd-input" autocomplete="off" spellcheck="false"
               autocapitalize="characters" maxlength="40" placeholder="Örn: JFK, LHR, EGLL (şehir adıyla da aranır)">
        <div class="aero-rd-preview" id="aeroRdPreview"></div>
        <div class="aero-rd-flash" id="aeroRdFlash" aria-live="polite"></div>
        <div class="aero-rd-sugg" id="aeroRdSugg" role="listbox"></div>
        <div class="aero-rd-actions">
          <button type="button" class="aero-tbtn warn" id="aeroRdCancel">✖ İptal <kbd>Esc</kbd></button>
          <button type="button" class="aero-tbtn" id="aeroRdUndo">↩ Geri Al</button>
          <span class="spacer"></span>
          <button type="button" class="aero-tbtn" id="aeroRdDone">✔ Bitir</button>
          <button type="button" class="aero-enter-btn" id="aeroRdAdd">➕ Ekle <kbd>↵</kbd></button>
        </div>
        <div class="aero-rd-hint">Enter: durağı ekle &bull; Boş Enter: bitir &bull; ↑↓: öneri seç &bull; Esc: iptal</div>
      </div>`;
    stage.appendChild(root);

    const $ = (id) => root.querySelector("#" + id);
    const el = {
      input: $("aeroRdInput"), chain: $("aeroRdChain"), preview: $("aeroRdPreview"),
      flash: $("aeroRdFlash"), sugg: $("aeroRdSugg"), undo: $("aeroRdUndo")
    };
    const st = routeDlgState = { root, snapshot, wasMode, added: 0, sel: -1, sugg: [], exact: null, flashTimer: null };

    function flash(msg, kind) {
      el.flash.className = "aero-rd-flash " + (kind || "");
      el.flash.textContent = msg || "";
      clearTimeout(st.flashTimer);
      if (msg) st.flashTimer = setTimeout(() => { el.flash.textContent = ""; }, 3600);
    }

    function shake() {
      el.input.classList.remove("shake");
      void el.input.offsetWidth;
      el.input.classList.add("shake");
      playAeroBeep(340, 130, "sawtooth");
    }

    function distFromLastText(apt) {
      const ps = aeroRoutePts();
      const l = ps[ps.length - 1];
      if (!l) return "";
      const nm = calcDistanceNM(l.lat, l.lon, apt.lat, apt.lon);
      return ` &bull; Son duraktan <b style="color:#34d399;">${Math.round(nm * 1.852).toLocaleString("tr-TR")} km</b> (${Math.round(nm).toLocaleString("tr-TR")} NM)`;
    }

    function renderChain() {
      const ps = aeroRoutePts();
      const codes = aeroRouteCodes();
      const nextLetter = String.fromCharCode(65 + (ps.length % 26));
      let html = "";
      codes.forEach((c, i) => {
        html += `<span class="aero-rd-chip"><i>${String.fromCharCode(65 + (i % 26))}</i>${aeroEsc(c)}</span><span class="aero-rd-arrow">→</span>`;
      });
      html += `<span class="aero-rd-chip next"><i>${nextLetter}</i>?</span>`;
      if (typeof measureRouteCache !== "undefined" && measureRouteCache && ps.length >= 2) {
        html += `<span class="aero-rd-total">Σ ${Math.round(measureRouteCache.distKm).toLocaleString("tr-TR")} km</span>`;
      }
      el.chain.innerHTML = html;
      el.undo.disabled = ps.length === 0;
      el.undo.style.opacity = ps.length === 0 ? "0.4" : "1";
    }

    function currentTarget() { return st.sel >= 0 ? st.sugg[st.sel] : st.exact; }

    function renderPreview() {
      const raw = el.input.value.trim();
      const t = currentTarget();
      el.preview.className = "aero-rd-preview";
      if (t) {
        el.preview.classList.add("ok");
        el.preview.innerHTML =
          `✓ <b class="code">${aeroEsc(t.icao)}${t.iata ? " / " + aeroEsc(t.iata) : ""}</b> &mdash; ${aeroEsc(t.name)}<br>` +
          `${aeroEsc(t.city)}${t.country ? ", " + aeroEsc(t.country) : ""}${distFromLastText(t)}`;
      } else if (raw.length >= 3 && st.sugg.length === 0 && !(!airportsDbLoaded && !!airportsDbLoadingPromise)) {
        el.preview.classList.add("err");
        el.preview.innerHTML = `✖ <b>${aeroEsc(raw.toUpperCase())}</b> koduyla eşleşen meydan bulunamadı.`;
      } else if (st.sugg.length > 0) {
        el.preview.innerHTML = `Listeden bir meydan seçin (↑↓ + Enter) veya tam kodu yazın.`;
      } else {
        el.preview.innerHTML = `Meydan kodu bekleniyor&hellip;`;
      }
    }

    function renderSugg() {
      el.sugg.innerHTML = st.sugg.map((a, i) =>
        `<button type="button" class="aero-rd-item ${i === st.sel ? "sel" : ""}" data-i="${i}">` +
        `<span class="codes">${aeroEsc(a.icao)}${a.iata ? "/" + aeroEsc(a.iata) : ""}</span>` +
        `<span class="nm">${aeroEsc(a.name)}</span>` +
        `<span class="ct">${aeroEsc(a.city)}${a.country ? " · " + aeroEsc(a.country) : ""}</span></button>`
      ).join("");
    }

    function refresh() {
      const raw = el.input.value;
      const code = normalizeAeroCode(raw);
      st.exact = code.length === 3 ? (iataMap.get(code) || null) : (code.length === 4 ? (icaoMap.get(code) || null) : null);
      let list = searchAirportsForRoute(raw, 7);
      if (st.exact) list = [st.exact, ...list.filter(a => a.icao !== st.exact.icao)].slice(0, 7);
      st.sugg = list;
      st.sel = -1;
      renderSugg();
      renderPreview();
    }

    function commit(apt) {
      if (!apt) { shake(); flash("Geçerli bir ICAO / IATA kodu girin.", "err"); return; }
      const ps = aeroRoutePts();
      if (ps.length >= MAX_MEASURE_STOPS) { shake(); flash(`En fazla ${MAX_MEASURE_STOPS} durak eklenebilir.`, "err"); return; }
      const l = ps[ps.length - 1];
      if (l && Math.hypot(l.lon - apt.lon, l.lat - apt.lat) < 0.05) { shake(); flash(`${apt.icao} zaten son durak.`, "err"); return; }
      addMeasurePoint(apt.lon, apt.lat, aeroRouteLabel(apt));
      st.added++;
      playAeroBeep(1640, 85);
      const letter = String.fromCharCode(65 + ((aeroRoutePts().length - 1) % 26));
      flash(`✓ ${apt.icao} eklendi (durak ${letter}).`, "ok");
      el.input.value = "";
      renderChain();
      refresh();
      syncAeroRouteButtons();
      if (aeroRoutePts().length >= 2 && typeof fitMeasureRouteView === "function") fitMeasureRouteView();
      el.input.focus();
    }

    function finish() { playAeroBeep(1480, 80); closeRouteDialog(); }
    function cancel() { playAeroBeep(620, 90); restoreRouteSnapshot(st.snapshot, st.wasMode); closeRouteDialog(); syncAeroRouteButtons(); }
    function undo() {
      if (aeroRoutePts().length === 0 || typeof popLastMeasurePoint !== "function") { shake(); return; }
      const removed = aeroRouteCodes().slice(-1)[0];
      popLastMeasurePoint();
      if (st.added > 0) st.added--;
      playAeroBeep(760, 70);
      flash(`↩ ${removed} rotadan çıkarıldı.`, "ok");
      renderChain();
      refresh();
      syncAeroRouteButtons();
      if (aeroRoutePts().length >= 2 && typeof fitMeasureRouteView === "function") fitMeasureRouteView();
      el.input.focus();
    }

    function moveSel(delta) {
      if (!st.sugg.length) return;
      st.sel = st.sel < 0 ? (delta > 0 ? 0 : st.sugg.length - 1) : (st.sel + delta + st.sugg.length) % st.sugg.length;
      renderSugg();
      renderPreview();
      const node = el.sugg.querySelector(".aero-rd-item.sel");
      if (node && node.scrollIntoView) node.scrollIntoView({ block: "nearest" });
    }

    function onEnter() {
      const t = currentTarget();
      if (t) return commit(t);
      const raw = el.input.value.trim();
      if (!raw) {
        if (aeroRoutePts().length >= 2) return finish();
        shake(); flash("Gideceğiniz meydanın ICAO veya IATA kodunu girin.", "err"); return;
      }
      if (st.sugg.length === 1) return commit(st.sugg[0]);
      shake(); flash("Geçerli bir kod bulunamadı.", "err");
    }

    el.input.addEventListener("input", () => { flash(""); refresh(); });
    el.sugg.addEventListener("mousedown", (e) => e.preventDefault());
    el.sugg.addEventListener("click", (e) => {
      const b = e.target.closest(".aero-rd-item");
      if (b) commit(st.sugg[Number(b.dataset.i)]);
    });
    $("aeroRdAdd").addEventListener("click", onEnter);
    $("aeroRdDone").addEventListener("click", finish);
    $("aeroRdCancel").addEventListener("click", cancel);
    $("aeroRdX").addEventListener("click", cancel);
    el.undo.addEventListener("click", undo);

    root.addEventListener("keydown", (e) => {
      e.stopPropagation();
      if (e.key === "Escape") { e.preventDefault(); cancel(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1); return; }
      if (e.key === "Enter") {
        const tag = document.activeElement && document.activeElement.tagName;
        if (tag === "BUTTON" && document.activeElement !== el.input && !document.activeElement.classList.contains("aero-rd-item")) return;
        e.preventDefault();
        onEnter();
      }
    });
    ["keyup", "keypress"].forEach(t => root.addEventListener(t, (e) => e.stopPropagation()));

    renderChain();
    refresh();
    syncAeroRouteButtons();
    ensureAirportsDatabaseLoaded().then(() => { if (routeDlgState === st) refresh(); });
    try { el.input.focus(); } catch (_) {}
  }

  // ================= 10. OLAYLAR, SAAT, SÜRÜKLEME & SIFIRLANABİLİR BOYUTLANDIRMA =================
  function updateClocks() {
    try { syncAeroRouteButtons(); } catch (_) {}
    const zEl = document.getElementById("aeroZuluBox");
    const wEl = document.getElementById("aeroWorldClockBox");
    if (!zEl || !wEl) return;
    const now = new Date();
    zEl.innerHTML = `ZULU<br><b style="color:#00ffcc;">${now.toISOString().slice(11, 19)}</b>`;
    const [cityLabel, tz] = WORLD_CLOCKS[worldClockIdx % WORLD_CLOCKS.length];
    let wStr = "--:--:--";
    try {
      wStr = new Intl.DateTimeFormat("en-GB", {
        timeZone: tz, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
      }).format(now);
    } catch (_) {}
    wEl.innerHTML = `${cityLabel}<br><b style="color:#ffb300;">${wStr}</b>`;
  }

  function bindAeroPanelEvents(panel) {
    const iataEl = document.getElementById("aeroInputIata");
    const icaoEl = document.getElementById("aeroInputIcao");

    iataEl.addEventListener("focus", () => { icaoEl.value = ""; });
    icaoEl.addEventListener("focus", () => { iataEl.value = ""; });

    const onKeyEnter = (ev) => {
      if (ev.key === "Enter") { ev.preventDefault(); executeAirportQuery(false); }
    };
    iataEl.addEventListener("keydown", onKeyEnter);
    icaoEl.addEventListener("keydown", onKeyEnter);

    let autoTimer = null;
    const bindAutoRun = (inputEl, len) => {
      inputEl.addEventListener("input", () => {
        const clean = normalizeAeroCode(inputEl.value).slice(0, len);
        if (inputEl.value !== clean) inputEl.value = clean;
        clearTimeout(autoTimer);
        if (clean.length === len) autoTimer = setTimeout(() => executeAirportQuery(false), 260);
      });
    };
    bindAutoRun(iataEl, 3);
    bindAutoRun(icaoEl, 4);

    document.getElementById("btnAeroEnter").addEventListener("click", () => executeAirportQuery(false));
    document.getElementById("btnAeroClear").addEventListener("click", () => {
      stopAviationSpeech();
      playAeroBeep(700, 70);
      aeroQueryToken++;
      aeroWxLoading = false;
      iataEl.value = "";
      icaoEl.value = "";
      activeAirport = null;
      rawMetarText = "";
      rawTafText = "";
      rawRunwayHtml = "";
      if (activeSubModal) toggleSubModal(activeSubModal);
      renderAeroAirportMarkerOnSvg();
      renderStandbyScreen();
    });

    document.getElementById("btnAeroClose").addEventListener("click", () => toggleAeroTerminalPanel(false));
    document.getElementById("btnAeroMin").addEventListener("click", () => {
      aeroMinimized = !aeroMinimized;
      panel.classList.toggle("aero-minimized", aeroMinimized);
      document.getElementById("btnAeroMin").textContent = aeroMinimized ? "▴" : "▾";
    });

    document.getElementById("aeroWorldClockBox").addEventListener("click", () => {
      worldClockIdx = (worldClockIdx + 1) % WORLD_CLOCKS.length;
      playAeroBeep(1250, 45);
      updateClocks();
    });

    document.getElementById("btnAeroAptSrc").addEventListener("click", (e) => {
      forceLocalApt = !forceLocalApt;
      e.currentTarget.textContent = forceLocalApt ? "[LOCAL]" : "[APTDB]";
      e.currentTarget.classList.toggle("warn", forceLocalApt);
      playAeroBeep(980, 60);
      renderSourceStatusBanner();
      if (!activeAirport) renderStandbyScreen();
    });

    document.getElementById("btnAeroWxSrc").addEventListener("click", (e) => {
      forceNoaa = !forceNoaa;
      e.currentTarget.textContent = forceNoaa ? "[ NOAA ]" : "[CHKWX]";
      e.currentTarget.classList.toggle("warn", forceNoaa);
      playAeroBeep(980, 60);
      renderSourceStatusBanner();
      if (!activeAirport) renderStandbyScreen();
    });

    document.getElementById("btnAeroAtis").addEventListener("click", () => toggleSubModal("atis"));
    document.getElementById("btnAeroAltn").addEventListener("click", () => toggleSubModal("altn"));
    document.getElementById("btnAeroE6b").addEventListener("click", () => toggleSubModal("e6b"));
    document.getElementById("btnAeroCfg").addEventListener("click", () => toggleSubModal("cfg"));
    document.getElementById("btnAeroPrint").addEventListener("click", printTerminalReport);

    document.getElementById("btnAeroFly").addEventListener("click", () => { if (activeAirport) flyMapToAirport(activeAirport); });
    document.getElementById("btnAeroRefresh").addEventListener("click", () => { if (activeAirport) executeAirportQuery(true); });
    document.getElementById("btnAeroAddRoute").addEventListener("click", () => openRouteAddDialog());

    document.getElementById("btnAeroUndoRoute").addEventListener("click", () => {
      if (typeof popLastMeasurePoint !== "function" || aeroRoutePts().length === 0) return;
      popLastMeasurePoint();
      playAeroBeep(760, 70);
      syncAeroRouteButtons();
    });

    document.getElementById("btnAeroCancelRoute").addEventListener("click", () => {
      if (aeroRoutePts().length === 0) return;
      if (typeof measureMode !== "undefined" && measureMode && typeof toggleMeasureMode === "function") toggleMeasureMode();
      else if (typeof clearMeasureRoute === "function") clearMeasureRoute();
      playAeroBeep(620, 90);
      syncAeroRouteButtons();
    });

    document.getElementById("aeroRunwayBlock").addEventListener("click", () => {
      if (!rawRunwayHtml || rawRunwayHtml.includes("DEVRE DIŞI")) return;
      speakAviationText("Captain, Runway and wind analysis. " + cleanHtmlForSpeech(rawRunwayHtml, false));
    });

    document.getElementById("aeroMetarBlock").addEventListener("click", () => {
      if (!rawMetarText || rawMetarText.includes("ERROR") || rawMetarText.includes("OFFLINE") || rawMetarText.includes("ÇEVRİMDIŞI")) return;
      isMetarDecoded = !isMetarDecoded;
      updateActiveTerminalBlocks();
      if (isMetarDecoded) speakAviationText("Captain, current METAR report. " + cleanHtmlForSpeech(rawMetarText, true));
      else stopAviationSpeech();
    });

    document.getElementById("aeroTafBlock").addEventListener("click", () => {
      if (!rawTafText || rawTafText.includes("ERROR") || rawTafText.includes("OFFLINE") || rawTafText.includes("ÇEVRİMDIŞI")) return;
      isTafDecoded = !isTafDecoded;
      updateActiveTerminalBlocks();
      if (isTafDecoded) speakAviationText("Captain, current TAF forecast. " + cleanHtmlForSpeech(rawTafText, true));
      else stopAviationSpeech();
    });
  }

  function makeAeroPanelDraggable(panel) {
    const handle = document.getElementById("aeroDragHandle");
    if (!handle) return;
    let dragging = false, pid = null, sx = 0, sy = 0, il = 0, it = 0;

    handle.addEventListener("pointerdown", (e) => {
      if (e.button !== undefined && e.button !== 0) return;
      if (e.target.closest("button, .aero-clock-box")) return;
      const stage = document.getElementById("mapStage") || document.body;
      const sRect = stage.getBoundingClientRect();
      const pRect = panel.getBoundingClientRect();
      il = pRect.left - sRect.left;
      it = pRect.top - sRect.top;
      sx = e.clientX;
      sy = e.clientY;
      pid = e.pointerId;
      dragging = true;
      panel.style.zIndex = "35";
      try { handle.setPointerCapture(pid); } catch (_) {}
      e.stopPropagation();
    });

    handle.addEventListener("pointermove", (e) => {
      if (!dragging || e.pointerId !== pid) return;
      const stage = document.getElementById("mapStage") || document.body;
      const sRect = stage.getBoundingClientRect();
      const pRect = panel.getBoundingClientRect();
      const maxL = Math.max(4, sRect.width - pRect.width - 4);
      const maxT = Math.max(4, sRect.height - pRect.height - 4);
      panel.style.left = Math.max(4, Math.min(maxL, il + (e.clientX - sx))) + "px";
      panel.style.top = Math.max(4, Math.min(maxT, it + (e.clientY - sy))) + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      e.stopPropagation();
      e.preventDefault();
    });

    const stop = (e) => {
      if (!dragging || (e && e.pointerId !== undefined && e.pointerId !== pid)) return;
      try { handle.releasePointerCapture(pid); } catch (_) {}
      dragging = false;
      pid = null;
    };
    handle.addEventListener("pointerup", stop);
    handle.addEventListener("pointercancel", stop);
  }

  const AERO_SIZE_KEY = "secovvv_aero_size";
  const AERO_POS_KEY = "secovvv_aero_pos";

  function clampAeroPanelToStage(panel) {
    const stage = document.getElementById("mapStage") || document.body;
    const sr = stage.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    if (pr.width < 50 || sr.width < 50) return;
    const sized = panel.classList.contains("aero-sized");
    const w = sized ? Math.min(pr.width, sr.width - 8) : pr.width;
    const h = sized ? Math.min(pr.height, sr.height - 8) : pr.height;
    let l = pr.left - sr.left, t = pr.top - sr.top;
    l = Math.max(4, Math.min(l, Math.max(4, sr.width - w - 4)));
    t = Math.max(4, Math.min(t, Math.max(4, sr.height - Math.min(h, 120) - 4)));
    if (sized) { panel.style.width = w + "px"; panel.style.height = h + "px"; }
    panel.style.left = l + "px";
    panel.style.top = t + "px";
  }

  function resetAeroPanelSize(panel) {
    panel.classList.remove("aero-sized");
    panel.style.width = "";
    panel.style.height = "";
    panel.style.maxHeight = "";
    panel.style.left = "14px";
    panel.style.top = "14px";
    playAeroBeep(900, 50);
  }

  function makeAeroPanelResizable(panel) {
    ["e", "w", "s", "se", "sw"].forEach(d => {
      const h = document.createElement("div");
      h.className = "aero-rz aero-rz-" + d;
      h.dataset.dir = d;
      h.title = "Sürükleyerek yeniden boyutlandırın • Çift tıklayın: ilk boyut ve konum";
      panel.appendChild(h);
    });

    // Sayfa her yenilendiğinde varsayılan boyut ve konuma dönmesi için eski kayıtları temizle
    try {
      localStorage.removeItem(AERO_SIZE_KEY);
      localStorage.removeItem(AERO_POS_KEY);
    } catch (_) {}

    let st = null;
    const MIN_W = 340, MIN_H = 200;

    panel.addEventListener("pointerdown", (e) => {
      const h = e.target.closest && e.target.closest(".aero-rz");
      if (!h || (e.button !== undefined && e.button !== 0)) return;
      const stage = document.getElementById("mapStage") || document.body;
      const sr = stage.getBoundingClientRect();
      const pr = panel.getBoundingClientRect();
      st = { dir: h.dataset.dir, pid: e.pointerId, h, sx: e.clientX, sy: e.clientY,
             l: pr.left - sr.left, t: pr.top - sr.top, w: pr.width, hgt: pr.height, sw: sr.width, sh: sr.height };
      panel.classList.add("aero-sized");
      panel.style.maxHeight = "none";
      panel.style.width = pr.width + "px";
      panel.style.height = pr.height + "px";
      panel.style.left = st.l + "px";
      panel.style.top = st.t + "px";
      panel.style.right = "auto";
      panel.style.bottom = "auto";
      panel.style.zIndex = "35";
      try { h.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
      e.stopPropagation();
    });

    panel.addEventListener("pointermove", (e) => {
      if (!st || e.pointerId !== st.pid) return;
      const dx = e.clientX - st.sx, dy = e.clientY - st.sy;
      const d = st.dir;
      if (d.includes("e")) panel.style.width = Math.max(MIN_W, Math.min(st.w + dx, st.sw - st.l - 4)) + "px";
      if (d.includes("w")) {
        const right = st.l + st.w;
        const w = Math.max(MIN_W, Math.min(st.w - dx, right - 4));
        panel.style.width = w + "px";
        panel.style.left = (right - w) + "px";
      }
      if (d.includes("s")) panel.style.height = Math.max(MIN_H, Math.min(st.hgt + dy, st.sh - st.t - 4)) + "px";
      e.preventDefault();
      e.stopPropagation();
    });

    const end = (e) => {
      if (!st || (e && e.pointerId !== undefined && e.pointerId !== st.pid)) return;
      try { st.h.releasePointerCapture(st.pid); } catch (_) {}
      st = null;
    };
    panel.addEventListener("pointerup", end);
    panel.addEventListener("pointercancel", end);

    panel.addEventListener("dblclick", (e) => {
      if (e.target.closest && e.target.closest(".aero-rz")) resetAeroPanelSize(panel);
    });

    window.addEventListener("resize", () => clampAeroPanelToStage(panel));
  }

  function attachMapSyncHooks() {
    if (typeof zoom !== "undefined" && zoom && zoom.on) {
      zoom.on("zoom.aeroSync end.aeroSync", () => {
        if (activeAirport) renderAeroAirportMarkerOnSvg();
      });
    }
    window.addEventListener("pointerup", () => {
      if (activeAirport) setTimeout(renderAeroAirportMarkerOnSvg, 60);
    });

    // Üst bardaki Online / Offline rozetine tıklandığında AeroTerminal durumunu anlık senkronize et
    if (typeof updateNetworkBadge === "function") {
      const _prevNetBadge = updateNetworkBadge;
      updateNetworkBadge = function () {
        _prevNetBadge.apply(this, arguments);
        try {
          updateDbBadgeStatus();
          renderSourceStatusBanner();
        } catch (_) {}
      };
    }
  }

  window.toggleAeroTerminalPanel = function (forceState) {
    injectTopBarButtonAndPanel();
    const panel = document.getElementById("aeroTerminalPanel");
    const btn = document.getElementById("btnAeroTerminalToggle");
    aeroPanelOpen = typeof forceState === "boolean" ? forceState : !aeroPanelOpen;

    if (panel) panel.classList.toggle("aero-open", aeroPanelOpen);
    if (btn) btn.classList.toggle("active", aeroPanelOpen);

    if (aeroPanelOpen) {
      playAeroBeep(1280, 70);
      if (panel) clampAeroPanelToStage(panel);
      updateDbBadgeStatus();
      renderSourceStatusBanner();
      updateClocks();
      if (!clockTimer) clockTimer = setInterval(updateClocks, 1000);
      ensureAirportsDatabaseLoaded();
      setTimeout(() => {
        const iataEl = document.getElementById("aeroInputIata");
        if (iataEl && !activeAirport) iataEl.focus();
      }, 80);
    } else {
      stopAviationSpeech();
      if (clockTimer) { clearInterval(clockTimer); clockTimer = null; }
    }
  };

  function bootAeroModule() {
    injectTopBarButtonAndPanel();
    attachMapSyncHooks();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bootAeroModule);
  } else {
    bootAeroModule();
  }
})();
</script>
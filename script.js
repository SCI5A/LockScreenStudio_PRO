/**
 * LockScreenStudio PRO
 * Cinematic iPhone Lockscreen Scene Creator
 * Premium Motion System + Full Feature Engine
 */

'use strict';

/* ============================================================
   STATE
   ============================================================ */
const State = {
  bgObjectURL:    null,
  iconObjectURL:  null,
  musicObjectURL: null,
  soundObjectURL: null,
  bgIsVideo:      false,
  isPlaying:      false,
  notifTimer:     null,
  clockInterval:  null,
  grainCtx:       null,
  grainAnim:      null,
  analogTimer:    null,
  cinematicZoom:  true,
};

/* ============================================================
   DOM REFS
   ============================================================ */
const $ = id => document.getElementById(id);

const DOM = {
  // Controls
  bgFile:        $('bgFile'),
  bgUploadZone:  $('bgUploadZone'),
  bgBlur:        $('bgBlur'),
  bgBrightness:  $('bgBrightness'),
  cinematicZoom: $('cinematicZoom'),
  clockInput:    $('clockInput'),
  dateInput:     $('dateInput'),
  clockStyle:    $('clockStyle'),
  notifApp:      $('notifApp'),
  notifTitle:    $('notifTitle'),
  notifMsg:      $('notifMsg'),
  iconFile:      $('iconFile'),
  iconUploadZone:$('iconUploadZone'),
  notifDelay:    $('notifDelay'),
  notifDelayVal: $('notifDelayVal'),
  musicFile:     $('musicFile'),
  musicUploadZone:$('musicUploadZone'),
  soundFile:     $('soundFile'),
  soundUploadZone:$('soundUploadZone'),
  musicVol:      $('musicVol'),
  soundVol:      $('soundVol'),
  statusText:    $('statusText'),
  customLabel:   $('customLabel'),
  // Buttons
  replayBtn:     $('replayBtn'),
  fullscreenBtn: $('fullscreenBtn'),
  themeToggle:   $('themeToggle'),
  mobileMenuBtn: $('mobileMenuBtn'),
  // Preview
  phoneFrame:    $('phoneFrame'),
  phoneScreen:   $('phoneScreen'),
  bgLayer:       $('bgLayer'),
  bgMediaWrap:   $('bgMediaWrap'),
  statusTime:    $('statusTime'),
  clockDisplay:  $('clockDisplay'),
  dateDisplay:   $('dateDisplay'),
  analogClock:   $('analogClock'),
  clockBlock:    $('clockBlock'),
  lockscreenStatus: $('lockscreenStatus'),
  notifCard:     $('notifCard'),
  notifAppIcon:  $('notifAppIcon'),
  notifAppName:  $('notifAppName'),
  notifTitleDisplay: $('notifTitleDisplay'),
  notifMsgDisplay:   $('notifMsgDisplay'),
  customLabelWrap:   $('customLabelWrap'),
  customLabelDisplay:$('customLabelDisplay'),
  // Fullscreen
  fullscreenOverlay: $('fullscreenOverlay'),
  fsBg:          $('fsBg'),
  fsScreen:      $('fsScreen'),
  fsClose:       $('fsClose'),
  fsReplay:      $('fsReplay'),
  // Audio
  musicAudio:    $('musicAudio'),
  soundAudio:    $('soundAudio'),
  // Grain
  grainCanvas:   $('grainCanvas'),
  // Sidebar
  sidebar:       $('sidebar'),
};

/* ============================================================
   GRAIN NOISE SYSTEM
   ============================================================ */
function initGrain() {
  const canvas = DOM.grainCanvas;
  const ctx = canvas.getContext('2d');
  State.grainCtx = ctx;

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let frame = 0;
  function renderGrain() {
    frame++;
    if (frame % 2 !== 0) { // 30fps grain
      State.grainAnim = requestAnimationFrame(renderGrain);
      return;
    }
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (Math.random() * 255) | 0;
      data[i]   = v;
      data[i+1] = v;
      data[i+2] = v;
      data[i+3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    State.grainAnim = requestAnimationFrame(renderGrain);
  }
  renderGrain();
}

/* ============================================================
   CLOCK SYSTEM
   ============================================================ */
function formatTime(val) {
  if (!val) return '9:41';
  const [h, m] = val.split(':');
  let hour = parseInt(h, 10);
  const min = m;
  const ampm = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${min}`;
}

function updateClockDisplay() {
  const val = DOM.clockInput.value;
  const timeStr = formatTime(val);
  DOM.clockDisplay.textContent = timeStr;
  DOM.statusTime.textContent   = timeStr;
}

function updateDateDisplay() {
  DOM.dateDisplay.textContent = DOM.dateInput.value || 'Saturday, September 12';
}

function applyClockStyle(style) {
  const clock = DOM.clockDisplay;
  const analog = DOM.analogClock;

  clock.classList.remove('medium');

  if (style === 'large') {
    clock.style.display = 'block';
    analog.style.display = 'none';
  } else if (style === 'medium') {
    clock.style.display = 'block';
    clock.classList.add('medium');
    analog.style.display = 'none';
  } else if (style === 'analog') {
    clock.style.display = 'none';
    analog.style.display = 'block';
    drawAnalogClock();
  }
}

function drawAnalogClock() {
  const canvas = DOM.analogClock;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  const cx = size / 2;
  const cy = size / 2;
  const r  = size / 2 - 6;

  const val = DOM.clockInput.value || '09:41';
  const [h, m] = val.split(':').map(Number);
  const sec = 0;

  ctx.clearRect(0, 0, size, size);

  // Face
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.2)';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Hour markers
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
    const x1 = cx + Math.cos(angle) * (r - 8);
    const y1 = cy + Math.sin(angle) * (r - 8);
    const x2 = cx + Math.cos(angle) * (r - 14);
    const y2 = cy + Math.sin(angle) * (r - 14);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // Hour hand
  const hourAngle = ((h % 12 + m / 60) / 12) * Math.PI * 2 - Math.PI / 2;
  drawHand(ctx, cx, cy, hourAngle, r * 0.5, 3, 'rgba(255,255,255,0.95)');

  // Minute hand
  const minAngle = (m / 60) * Math.PI * 2 - Math.PI / 2;
  drawHand(ctx, cx, cy, minAngle, r * 0.72, 2, 'rgba(255,255,255,0.9)');

  // Center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 4, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  ctx.fill();
}

function drawHand(ctx, cx, cy, angle, length, width, color) {
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(angle) * length, cy + Math.sin(angle) * length);
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/* ============================================================
   BACKGROUND SYSTEM
   ============================================================ */
function setBackground(file) {
  if (State.bgObjectURL) URL.revokeObjectURL(State.bgObjectURL);

  const url = URL.createObjectURL(file);
  State.bgObjectURL = url;
  State.bgIsVideo = file.type.startsWith('video/');

  // Clear existing media
  DOM.bgMediaWrap.innerHTML = '';

  if (State.bgIsVideo) {
    const video = document.createElement('video');
    video.src = url;
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    DOM.bgMediaWrap.appendChild(video);
    video.play().catch(() => {});
  } else {
    const img = document.createElement('img');
    img.src = url;
    img.alt = 'Background';
    img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
    DOM.bgMediaWrap.appendChild(img);
  }

  applyBgFilters();
  DOM.bgUploadZone.classList.add('has-file');
}

function applyBgFilters() {
  const blur = DOM.bgBlur.value;
  const brightness = DOM.bgBrightness.value;
  DOM.bgMediaWrap.style.filter = `blur(${blur}px) brightness(${brightness}%)`;
}

/* ============================================================
   NOTIFICATION SYSTEM — Cinematic Physics
   ============================================================ */
function resetNotification() {
  clearTimeout(State.notifTimer);
  const card = DOM.notifCard;
  card.classList.remove('notif-entering', 'notif-visible', 'notif-exiting');
  card.style.opacity = '0';
  card.style.transform = 'scale(0.88) translateY(-120px)';
  card.style.filter = 'blur(12px)';
}

function playNotification(delay = 0) {
  resetNotification();

  State.notifTimer = setTimeout(() => {
    const card = DOM.notifCard;

    // Trigger sound
    if (State.soundObjectURL) {
      DOM.soundAudio.currentTime = 0;
      DOM.soundAudio.volume = DOM.soundVol.value / 100;
      DOM.soundAudio.play().catch(() => {});
    }

    // Remove inline styles to let animation take over
    card.style.opacity = '';
    card.style.transform = '';
    card.style.filter = '';

    card.classList.add('notif-entering');

    card.addEventListener('animationend', () => {
      card.classList.remove('notif-entering');
      card.classList.add('notif-visible');
    }, { once: true });

  }, delay * 1000);
}

function updateNotifContent() {
  DOM.notifAppName.textContent    = DOM.notifApp.value || 'Messages';
  DOM.notifTitleDisplay.textContent = DOM.notifTitle.value || 'John Appleseed';
  DOM.notifMsgDisplay.textContent   = DOM.notifMsg.value || '';
}

/* ============================================================
   REPLAY SCENE
   ============================================================ */
function replayScene() {
  // Stop and restart music
  if (State.musicObjectURL) {
    DOM.musicAudio.currentTime = 0;
    DOM.musicAudio.volume = DOM.musicVol.value / 100;
    DOM.musicAudio.play().catch(() => {});
  }

  // Reset notification
  resetNotification();

  // Play notification after delay
  const delay = parseFloat(DOM.notifDelay.value) || 1.5;
  playNotification(delay);
}

/* ============================================================
   FULLSCREEN MODE
   ============================================================ */
function openFullscreen() {
  const overlay = DOM.fullscreenOverlay;
  const fsScreen = DOM.fsScreen;

  // Clone the phone screen content into fullscreen
  fsScreen.innerHTML = '';

  // Build a fullscreen lockscreen
  const fsLock = document.createElement('div');
  fsLock.className = 'fs-lockscreen';
  fsLock.style.cssText = `
    width: 100vw;
    height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  `;

  // Background
  const fsBgLayer = document.createElement('div');
  fsBgLayer.style.cssText = 'position:absolute;inset:0;overflow:hidden;';

  if (State.bgObjectURL) {
    if (State.bgIsVideo) {
      const v = document.createElement('video');
      v.src = State.bgObjectURL;
      v.autoplay = true;
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      if (State.cinematicZoom) {
        v.style.animation = 'cinematicZoom 12s ease-in-out infinite alternate';
      }
      fsBgLayer.appendChild(v);
      v.play().catch(() => {});
    } else {
      const img = document.createElement('img');
      img.src = State.bgObjectURL;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';
      if (State.cinematicZoom) {
        img.style.animation = 'cinematicZoom 12s ease-in-out infinite alternate';
      }
      fsBgLayer.appendChild(img);
    }
  } else {
    const grad = document.createElement('div');
    grad.style.cssText = `
      width:100%;height:100%;
      background: linear-gradient(160deg, #0f0c29 0%, #302b63 40%, #24243e 70%, #0f0c29 100%);
      animation: gradientShift 12s ease-in-out infinite;
    `;
    fsBgLayer.appendChild(grad);
  }

  // Overlay
  const overlay2 = document.createElement('div');
  overlay2.style.cssText = `
    position:absolute;inset:0;
    background: linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.5) 100%);
  `;
  fsBgLayer.appendChild(overlay2);

  // Apply blur/brightness
  const blur = DOM.bgBlur.value;
  const brightness = DOM.bgBrightness.value;
  fsBgLayer.querySelector('img,video,div')
    && (fsBgLayer.firstChild.style.filter = `blur(${blur}px) brightness(${brightness}%)`);

  fsLock.appendChild(fsBgLayer);

  // Status bar
  const sb = document.createElement('div');
  sb.style.cssText = `
    position:relative;z-index:10;
    display:flex;align-items:center;justify-content:space-between;
    padding: env(safe-area-inset-top, 14px) 28px 0;
    height: calc(44px + env(safe-area-inset-top, 0px));
  `;
  sb.innerHTML = `
    <span style="font-size:17px;font-weight:600;color:rgba(255,255,255,0.95);letter-spacing:-0.3px;font-family:-apple-system,'Inter',sans-serif;">
      ${DOM.statusTime.textContent}
    </span>
    <div style="display:flex;gap:6px;color:rgba(255,255,255,0.9);">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.5C4.5 5.5 8 4 12 4s7.5 1.5 10.5 4.5L21 11c-2.5-2.5-5.5-4-9-4s-6.5 1.5-9 4L1.5 8.5z"/><path d="M5 12c1.9-1.9 4.3-3 7-3s5.1 1.1 7 3l-1.5 1.5C15.9 14 14 13 12 13s-3.9 1-5.5 2.5L5 12z"/><circle cx="12" cy="17" r="2"/></svg>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="1" y="6" width="15" height="12" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="3" y="8" width="9" height="8" rx="1" fill="currentColor"/><path d="M17 10v4a2 2 0 000-4z" fill="currentColor"/></svg>
    </div>
  `;
  fsLock.appendChild(sb);

  // Clock
  const clockWrap = document.createElement('div');
  clockWrap.style.cssText = 'position:relative;z-index:10;text-align:center;padding:32px 20px 20px;margin-top:24px;';
  const timeStr = DOM.clockDisplay.textContent;
  const dateStr = DOM.dateDisplay.textContent;
  clockWrap.innerHTML = `
    <div style="font-size:clamp(80px,18vw,120px);font-weight:200;color:rgba(255,255,255,0.97);letter-spacing:-5px;line-height:1;font-family:-apple-system,'Inter',sans-serif;text-shadow:0 2px 30px rgba(0,0,0,0.3);">
      ${timeStr}
    </div>
    <div style="font-size:clamp(15px,3.5vw,20px);font-weight:400;color:rgba(255,255,255,0.85);margin-top:8px;font-family:-apple-system,'Inter',sans-serif;">
      ${dateStr}
    </div>
  `;
  fsLock.appendChild(clockWrap);

  // Status pill
  const statusPillWrap = document.createElement('div');
  statusPillWrap.style.cssText = 'position:relative;z-index:10;display:flex;justify-content:center;padding:6px 20px;';
  const statusTxt = DOM.statusText.value || '';
  if (statusTxt) {
    statusPillWrap.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:20px;padding:6px 16px;font-size:13px;font-weight:500;color:rgba(255,255,255,0.85);">
        ${statusTxt}
      </span>
    `;
  }
  fsLock.appendChild(statusPillWrap);

  // Notification
  const notifWrap = document.createElement('div');
  notifWrap.id = 'fsNotifCard';
  notifWrap.style.cssText = `
    position:relative;z-index:20;
    margin: 16px clamp(12px, 5vw, 60px) 0;
    border-radius: 22px;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.88) translateY(-120px);
    filter: blur(12px);
    will-change: transform, opacity, filter;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    width: calc(100% - clamp(24px, 10vw, 120px));
  `;

  const appName = DOM.notifApp.value || 'Messages';
  const notifTitleTxt = DOM.notifTitle.value || 'John Appleseed';
  const notifMsgTxt = DOM.notifMsg.value || '';
  const iconSrc = State.iconObjectURL;

  notifWrap.innerHTML = `
    <div style="position:absolute;inset:0;background:rgba(28,28,40,0.72);backdrop-filter:blur(40px) saturate(180%);-webkit-backdrop-filter:blur(40px) saturate(180%);border:1px solid rgba(255,255,255,0.12);border-radius:22px;"></div>
    <div style="position:relative;z-index:1;padding:16px 18px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
        <div style="width:32px;height:32px;background:linear-gradient(135deg,#34c759,#30b350);border-radius:9px;display:flex;align-items:center;justify-content:center;color:white;flex-shrink:0;overflow:hidden;">
          ${iconSrc ? `<img src="${iconSrc}" style="width:100%;height:100%;object-fit:cover;" />` : `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>`}
        </div>
        <span style="font-size:13px;font-weight:600;color:rgba(255,255,255,0.7);flex:1;">${appName}</span>
        <span style="font-size:12px;color:rgba(255,255,255,0.4);">now</span>
      </div>
      <p style="font-size:clamp(14px,3vw,17px);font-weight:600;color:rgba(255,255,255,0.95);margin-bottom:3px;line-height:1.3;">${notifTitleTxt}</p>
      <p style="font-size:clamp(13px,2.5vw,15px);font-weight:400;color:rgba(255,255,255,0.7);line-height:1.4;">${notifMsgTxt}</p>
    </div>
  `;
  fsLock.appendChild(notifWrap);

  // Bottom
  const bottom = document.createElement('div');
  bottom.style.cssText = `
    position:absolute;bottom:0;left:0;right:0;z-index:10;
    display:flex;align-items:flex-end;justify-content:space-between;
    padding: 0 32px calc(env(safe-area-inset-bottom, 20px) + 16px);
  `;
  bottom.innerHTML = `
    <div style="width:52px;height:52px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.85);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 2h8l2 8H6L8 2z"/><path d="M6 10l2 12h8l2-12"/><line x1="12" y1="14" x2="12" y2="18"/></svg>
    </div>
    <div style="width:130px;height:5px;background:rgba(255,255,255,0.3);border-radius:3px;margin-bottom:6px;"></div>
    <div style="width:52px;height:52px;background:rgba(255,255,255,0.12);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border:1px solid rgba(255,255,255,0.15);border-radius:50%;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,0.85);">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>
    </div>
  `;
  fsLock.appendChild(bottom);

  fsScreen.appendChild(fsLock);

  // Show overlay
  overlay.classList.add('active');

  // Trigger notification animation
  const delay = parseFloat(DOM.notifDelay.value) || 1.5;
  setTimeout(() => {
    const card = document.getElementById('fsNotifCard');
    if (!card) return;

    if (State.soundObjectURL) {
      DOM.soundAudio.currentTime = 0;
      DOM.soundAudio.volume = DOM.soundVol.value / 100;
      DOM.soundAudio.play().catch(() => {});
    }

    card.style.transition = 'none';
    card.style.opacity = '0';
    card.style.transform = 'scale(0.88) translateY(-120px)';
    card.style.filter = 'blur(12px)';

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.72s cubic-bezier(0.34,1.56,0.64,1), transform 0.72s cubic-bezier(0.34,1.56,0.64,1), filter 0.72s cubic-bezier(0.34,1.56,0.64,1)';
        card.style.opacity = '1';
        card.style.transform = 'scale(1) translateY(0)';
        card.style.filter = 'blur(0px)';
      });
    });
  }, delay * 1000);

  // Music
  if (State.musicObjectURL) {
    DOM.musicAudio.currentTime = 0;
    DOM.musicAudio.volume = DOM.musicVol.value / 100;
    DOM.musicAudio.play().catch(() => {});
  }

  // Try native fullscreen
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

function closeFullscreen() {
  DOM.fullscreenOverlay.classList.remove('active');
  DOM.fsScreen.innerHTML = '';

  if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
  else if (document.webkitExitFullscreen) document.webkitExitFullscreen();

  DOM.musicAudio.pause();
}

function replayFullscreen() {
  closeFullscreen();
  setTimeout(openFullscreen, 300);
}

/* ============================================================
   CINEMATIC ZOOM TOGGLE
   ============================================================ */
function applyCinematicZoom() {
  State.cinematicZoom = DOM.cinematicZoom.checked;
  if (State.cinematicZoom) {
    DOM.bgLayer.classList.add('cinematic-zoom-active');
  } else {
    DOM.bgLayer.classList.remove('cinematic-zoom-active');
  }
}

/* ============================================================
   STATUS TEXT
   ============================================================ */
function updateStatusText() {
  const txt = DOM.statusText.value;
  const pill = DOM.lockscreenStatus.querySelector('.status-pill');
  if (pill) {
    pill.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C8.13 2 5 5.13 5 9v1H3v12h18V10h-2V9c0-3.87-3.13-7-7-7zm0 2c2.76 0 5 2.24 5 5v1H7V9c0-2.76 2.24-5 5-5z"/>
      </svg>
      ${txt}
    `;
  }
}

function updateCustomLabel() {
  const txt = DOM.customLabel.value;
  if (txt.trim()) {
    DOM.customLabelWrap.style.display = 'block';
    DOM.customLabelDisplay.textContent = txt;
  } else {
    DOM.customLabelWrap.style.display = 'none';
  }
}

/* ============================================================
   THEME TOGGLE
   ============================================================ */
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  html.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
}

/* ============================================================
   MOBILE SIDEBAR
   ============================================================ */
let sidebarOverlay = null;

function initMobileSidebar() {
  // Create overlay element
  sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'sidebar-overlay';
  document.body.appendChild(sidebarOverlay);

  DOM.mobileMenuBtn.addEventListener('click', () => {
    DOM.sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('active');
  });

  sidebarOverlay.addEventListener('click', () => {
    DOM.sidebar.classList.remove('open');
    sidebarOverlay.classList.remove('active');
  });
}

/* ============================================================
   SECTION COLLAPSE (accordion)
   ============================================================ */
function initSectionAccordion() {
  document.querySelectorAll('.section-header').forEach(header => {
    header.addEventListener('click', () => {
      const body = header.nextElementSibling;
      if (!body || !body.classList.contains('section-body')) return;
      const isOpen = body.style.display !== 'none';
      body.style.display = isOpen ? 'none' : 'flex';
    });
  });
}

/* ============================================================
   UPLOAD HANDLERS
   ============================================================ */
function initUploads() {
  // Background
  DOM.bgUploadZone.addEventListener('click', () => DOM.bgFile.click());
  DOM.bgUploadZone.addEventListener('dragover', e => {
    e.preventDefault();
    DOM.bgUploadZone.style.borderColor = 'var(--accent)';
  });
  DOM.bgUploadZone.addEventListener('dragleave', () => {
    DOM.bgUploadZone.style.borderColor = '';
  });
  DOM.bgUploadZone.addEventListener('drop', e => {
    e.preventDefault();
    DOM.bgUploadZone.style.borderColor = '';
    const file = e.dataTransfer.files[0];
    if (file) setBackground(file);
  });
  DOM.bgFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) setBackground(file);
  });

  // App Icon
  DOM.iconUploadZone.addEventListener('click', () => DOM.iconFile.click());
  DOM.iconFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (State.iconObjectURL) URL.revokeObjectURL(State.iconObjectURL);
    State.iconObjectURL = URL.createObjectURL(file);
    DOM.notifAppIcon.innerHTML = `<img src="${State.iconObjectURL}" style="width:100%;height:100%;object-fit:cover;" />`;
    DOM.iconUploadZone.classList.add('has-file');
    DOM.iconUploadZone.querySelector('span').textContent = file.name.slice(0, 18) + (file.name.length > 18 ? '…' : '');
  });

  // Music
  DOM.musicUploadZone.addEventListener('click', () => DOM.musicFile.click());
  DOM.musicFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (State.musicObjectURL) URL.revokeObjectURL(State.musicObjectURL);
    State.musicObjectURL = URL.createObjectURL(file);
    DOM.musicAudio.src = State.musicObjectURL;
    DOM.musicUploadZone.classList.add('has-file');
    DOM.musicUploadZone.querySelector('span').textContent = '♪ ' + file.name.slice(0, 16) + (file.name.length > 16 ? '…' : '');
  });

  // Sound
  DOM.soundUploadZone.addEventListener('click', () => DOM.soundFile.click());
  DOM.soundFile.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    if (State.soundObjectURL) URL.revokeObjectURL(State.soundObjectURL);
    State.soundObjectURL = URL.createObjectURL(file);
    DOM.soundAudio.src = State.soundObjectURL;
    DOM.soundUploadZone.classList.add('has-file');
    DOM.soundUploadZone.querySelector('span').textContent = '🔔 ' + file.name.slice(0, 14) + (file.name.length > 14 ? '…' : '');
  });
}

/* ============================================================
   CONTROL LISTENERS
   ============================================================ */
function initControls() {
  // Clock
  DOM.clockInput.addEventListener('input', updateClockDisplay);
  DOM.dateInput.addEventListener('input', updateDateDisplay);
  DOM.clockStyle.addEventListener('change', e => applyClockStyle(e.target.value));

  // Background filters
  DOM.bgBlur.addEventListener('input', applyBgFilters);
  DOM.bgBrightness.addEventListener('input', applyBgFilters);
  DOM.cinematicZoom.addEventListener('change', applyCinematicZoom);

  // Notification content
  DOM.notifApp.addEventListener('input', updateNotifContent);
  DOM.notifTitle.addEventListener('input', updateNotifContent);
  DOM.notifMsg.addEventListener('input', updateNotifContent);

  // Notification delay
  DOM.notifDelay.addEventListener('input', () => {
    DOM.notifDelayVal.textContent = DOM.notifDelay.value + 's';
  });

  // Volume
  DOM.musicVol.addEventListener('input', () => {
    DOM.musicAudio.volume = DOM.musicVol.value / 100;
  });
  DOM.soundVol.addEventListener('input', () => {
    DOM.soundAudio.volume = DOM.soundVol.value / 100;
  });

  // Status & custom label
  DOM.statusText.addEventListener('input', updateStatusText);
  DOM.customLabel.addEventListener('input', updateCustomLabel);

  // Buttons
  DOM.replayBtn.addEventListener('click', replayScene);
  DOM.fullscreenBtn.addEventListener('click', openFullscreen);
  DOM.themeToggle.addEventListener('click', toggleTheme);
  DOM.fsClose.addEventListener('click', closeFullscreen);
  DOM.fsReplay.addEventListener('click', replayFullscreen);

  // Keyboard
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && DOM.fullscreenOverlay.classList.contains('active')) {
      closeFullscreen();
    }
    if (e.key === 'r' || e.key === 'R') {
      if (!e.target.matches('input, textarea, select')) {
        replayScene();
      }
    }
    if (e.key === 'f' || e.key === 'F') {
      if (!e.target.matches('input, textarea, select')) {
        openFullscreen();
      }
    }
  });

  // Touch on notification card — tap to dismiss/replay
  DOM.notifCard.addEventListener('click', () => {
    if (DOM.notifCard.classList.contains('notif-visible')) {
      DOM.notifCard.classList.add('notif-exiting');
      DOM.notifCard.addEventListener('animationend', () => {
        DOM.notifCard.classList.remove('notif-visible', 'notif-exiting');
        DOM.notifCard.style.opacity = '0';
      }, { once: true });
    }
  });
}

/* ============================================================
   SLIDER FILL (visual progress)
   ============================================================ */
function initSliderFill() {
  document.querySelectorAll('.slider').forEach(slider => {
    function updateFill() {
      const min = parseFloat(slider.min) || 0;
      const max = parseFloat(slider.max) || 100;
      const val = parseFloat(slider.value);
      const pct = ((val - min) / (max - min)) * 100;
      slider.style.background = `linear-gradient(to right, var(--accent) ${pct}%, var(--slider-track) ${pct}%)`;
    }
    updateFill();
    slider.addEventListener('input', updateFill);
  });
}

/* ============================================================
   AUTO-START SCENE
   ============================================================ */
function autoStartScene() {
  // Initial notification after 1.5s
  const delay = parseFloat(DOM.notifDelay.value) || 1.5;
  playNotification(delay);

  // Apply cinematic zoom
  applyCinematicZoom();
}

/* ============================================================
   RESIZE HANDLER
   ============================================================ */
function initResize() {
  window.addEventListener('resize', () => {
    // Close sidebar on desktop
    if (window.innerWidth > 768) {
      DOM.sidebar.classList.remove('open');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
  });
}

/* ============================================================
   INIT
   ============================================================ */
function init() {
  // Grain
  initGrain();

  // Clock
  updateClockDisplay();
  updateDateDisplay();

  // Cinematic zoom
  DOM.bgLayer.classList.add('cinematic-zoom-active');

  // Uploads
  initUploads();

  // Controls
  initControls();

  // Slider fill
  initSliderFill();

  // Mobile sidebar
  initMobileSidebar();

  // Accordion
  initSectionAccordion();

  // Resize
  initResize();

  // Auto-start
  autoStartScene();

  // Keyboard shortcut hint
  console.log('%cLockScreenStudio PRO', 'font-size:18px;font-weight:bold;color:#7c6dfa;');
  console.log('%cShortcuts: R = Replay | F = Fullscreen | Esc = Close', 'color:#aaa;');
}

// Run when DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

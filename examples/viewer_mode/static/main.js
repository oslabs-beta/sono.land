import { SonoClient } from "../../src/sonoClient.js"
import { SonoRTC } from "../../src/sonoRTC.js"

function log(...args) {
  console.log('[APP]', ...args)
}

const sono = new SonoClient('ws://localhost:8080/ws')
const videoGrid = document.getElementById('videoGrid')
const toggleBtn = document.getElementById('toggleCam')

// Local video in grid
const localVideoEl = document.createElement('video')
localVideoEl.autoplay = true
localVideoEl.playsInline = true
localVideoEl.muted = true
localVideoEl.id = 'localVideo'
localVideoEl.style.cssText = 'width:100%;aspect-ratio:16/9;object-fit:cover;background:#000;border-radius:8px'
videoGrid.appendChild(localVideoEl)

log('Creating SonoRTC in viewer mode')

// Init RTC in viewer mode
const rtc = new SonoRTC(
  'stun:stun2.l.google.com:19302',
  sono,
  localVideoEl,
  videoGrid,
  { audio: false, video: true },
  true
)

// Auto-connect
sono.onconnection(() => {
  log('WebSocket connected, calling startConnection')
  rtc.startConnection()
})

// When someone becomes a broadcaster, re-run createRTCs to get their stream
sono.on('broadcasterChanged', (payload) => {
  log('Broadcaster changed:', payload.from, 'isViewer:', payload.isViewer)
  if (!payload.isViewer) {
    log('New broadcaster detected, triggering createRTCs')
    // Reset existing PC for this client so it gets recreated with proper handlers
    if (rtc.peerconnection[payload.from]) {
      delete rtc.peerconnection[payload.from]
    }
    rtc.createRTCs()
  }
})

// Toggle camera
toggleBtn.onclick = () => {
  if (rtc.viewerMode) {
    log('Enabling camera - switching to broadcaster')
    rtc.setViewerMode(false)
    rtc.startLocalMedia()
    toggleBtn.textContent = 'Disable Camera'
    toggleBtn.classList.add('active')
  } else {
    log('Disabling camera - switching to viewer')
    rtc.setViewerMode(true)
    toggleBtn.textContent = 'Enable Camera'
    toggleBtn.classList.remove('active')
    localVideoEl.srcObject = null
  }
}

// Clean up
sono.on('clientleaving', (payload) => {
  log('Client leaving:', payload.from)
  const el = document.getElementById(payload.from)
  if (el) el.remove()
})

sono.on('clientjoining', (payload) => {
  log('Client joining:', payload.from)
})
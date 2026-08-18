const CFG = {
  host: "127.0.0.1",
  port: 8080,
  reconnectMs: 3000,
  sounds: true,
  maxDocked: 4,
};
const stage = document.getElementById("stage"),
  status = document.getElementById("status");
const active = new Map();
const recentModeration = new Map();
let audio = null,
  barSound = null,
  lockQueue = [],
  lockBusy = false;
const BAR_SOUND = "assets/audio/395920__locontrario23__closing-door.wav";
const rootStyle = document.documentElement.style;
const overlaySettings = {
  stackScalePercent: 33,
  maxDocked: 4,
  edgeOffset: 28,
  stackGap: 18,
};
function updateStackSize() {
  const scale =
    parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--stack-scale",
      ),
    ) || 0.333333;
  rootStyle.setProperty("--stack-h", 310 * scale + "px");
}
function applyOverlaySettings(d) {
  if (!d || typeof d !== "object") return;

  const stackScale = Number(d.banWidgetStackScalePercent);
  if (Number.isFinite(stackScale)) {
    overlaySettings.stackScalePercent = Math.max(10, Math.min(100, stackScale));
    rootStyle.setProperty(
      "--stack-scale",
      String(overlaySettings.stackScalePercent / 100),
    );
  }

  const maxDocked = Number(d.banWidgetMaxDocked);
  if (Number.isFinite(maxDocked)) {
    overlaySettings.maxDocked = Math.max(1, Math.min(25, Math.round(maxDocked)));
    CFG.maxDocked = overlaySettings.maxDocked;
  }

  const edgeOffset = Number(d.banWidgetEdgeOffset);
  if (Number.isFinite(edgeOffset)) {
    overlaySettings.edgeOffset = Math.max(0, Math.min(200, edgeOffset));
    rootStyle.setProperty("--edge", overlaySettings.edgeOffset + "px");
  }

  const stackGap = Number(d.banWidgetStackGap);
  if (Number.isFinite(stackGap)) {
    overlaySettings.stackGap = Math.max(0, Math.min(100, stackGap));
    rootStyle.setProperty("--stack-gap", overlaySettings.stackGap + "px");
  }

  updateStackSize();
}
rootStyle.setProperty("--stack-scale", String(overlaySettings.stackScalePercent / 100));
rootStyle.setProperty("--edge", overlaySettings.edgeOffset + "px");
rootStyle.setProperty("--stack-gap", overlaySettings.stackGap + "px");
updateStackSize();
function say(s) {
  status.textContent = s;
  status.classList.add("show");
  clearTimeout(status.t);
  status.t = setTimeout(() => status.classList.remove("show"), 1200);
}
function unlock() {
  if (!CFG.sounds) return;
  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)();
  if (audio.state === "suspended") audio.resume();
  if (!barSound) {
    barSound = new Audio(BAR_SOUND);
    barSound.preload = "auto";
    barSound.load();
  }
}
function tone(f, d, t = "square", g = 0.04, delay = 0) {
  if (!CFG.sounds) return;
  unlock();
  if (!audio) return;
  const o = audio.createOscillator(),
    a = audio.createGain();
  o.type = t;
  o.frequency.value = f;
  a.gain.setValueAtTime(g, audio.currentTime + delay);
  a.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + delay + d);
  o.connect(a).connect(audio.destination);
  o.start(audio.currentTime + delay);
  o.stop(audio.currentTime + delay + d + 0.03);
}
function clang() {
  if (!CFG.sounds) return Promise.resolve();
  unlock();
  if (!barSound) return Promise.resolve();
  barSound.currentTime = 0;
  barSound.volume = 0.85;
  return new Promise((resolve) => {
    let done = false,
      timeoutId = null;
    const finish = () => {
      if (done) return;
      done = true;
      barSound.removeEventListener("ended", finish);
      barSound.removeEventListener("error", finish);
      barSound.removeEventListener("loadedmetadata", setFallback);
      if (timeoutId) clearTimeout(timeoutId);
      resolve();
    };
    const setFallback = () => {
      if (!Number.isFinite(barSound.duration) || barSound.duration <= 0) return;
      timeoutId = setTimeout(finish, Math.ceil(barSound.duration * 1000) + 250);
    };
    barSound.addEventListener("ended", finish, { once: true });
    barSound.addEventListener("error", finish, { once: true });
    barSound.addEventListener("loadedmetadata", setFallback, { once: true });
    if (Number.isFinite(barSound.duration) && barSound.duration > 0)
      setFallback();
    const p = barSound.play();
    if (p)
      p.catch(() => {
        say("CLICK TO ENABLE SOUND");
        finish();
      });
  });
}
function releaseSound() {
  tone(520, 0.08, "triangle", 0.03);
}
function siren() {
  tone(650, 0.18, "sawtooth", 0.025);
  tone(900, 0.18, "sawtooth", 0.025, 0.19);
  tone(650, 0.18, "sawtooth", 0.025, 0.38);
  tone(900, 0.18, "sawtooth", 0.025, 0.57);
}
function fmt(s) {
  s = Math.max(0, Math.ceil(s));
  return (
    String(Math.floor(s / 60)).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0")
  );
}
function key(d) {
  return (
    d.id ||
    d.userId ||
    d.username ||
    d.userName ||
    d.displayName ||
    crypto.randomUUID()
  );
}
function setName(e, text) {
  e.querySelector(".nameplate span").textContent = text || "UNKNOWN USER";
}
function setReason(e, text) {
  const box = e.querySelector(".reason"),
    span = box.querySelector("span");
  span.textContent = text || "TIMEOUT";
  requestAnimationFrame(() => {
    box.classList.remove("scrolling");
    span.style.removeProperty("--scroll-time");
    if (span.scrollWidth > box.clientWidth) {
      const sec = Math.max(5, Math.min(14, span.scrollWidth / 35));
      box.style.setProperty("--scroll-time", sec + "s");
      box.classList.add("scrolling");
    }
  });
}
function scheduleAngryAvatar(e) {
  const avatar = e.querySelector(".avatar");
  let startTimer = null;
  let endTimer = null;
  let stopped = false;

  function scheduleNext() {
    if (stopped || !e.isConnected || e.classList.contains("releasing")) return;
    const delay = 10000 + Math.random() * 10000;
    startTimer = setTimeout(() => {
      if (stopped || !e.isConnected || e.classList.contains("releasing")) return;
      avatar.classList.add("angry");
      endTimer = setTimeout(() => {
        avatar.classList.remove("angry");
        scheduleNext();
      }, 2000);
    }, delay);
  }

  scheduleNext();

  return () => {
    stopped = true;
    if (startTimer) clearTimeout(startTimer);
    if (endTimer) clearTimeout(endTimer);
    avatar.classList.remove("angry");
  };
}
function createCell(d) {
  const e = document.createElement("div");
  e.className = "cell";
  e.innerHTML =
    '<img class="avatar" alt=""><div class="bars"><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i><i class="bar"></i></div><img class="frame" src="assets/cell_frame_final.png" alt=""><div class="timer">00:00</div><div class="nameplate"><span></span></div><div class="reason"><span></span></div>';
  const a = e.querySelector(".avatar");
  a.src =
    d.avatar ||
    d.profileImageUrl ||
    d.targetUserProfileImageUrl ||
    d.userProfileImageUrl ||
    "";
  a.onerror = () => (a.style.opacity = ".12");
  setName(
    e,
    d.displayName ||
      d.userName ||
      d.username ||
      d.login ||
      d.targetUser ||
      "UNKNOWN USER",
  );
  setReason(e, d.reason || d.timeoutReason || d.message || "TIMEOUT");
  e.stopAngryAvatar = scheduleAngryAvatar(e);
  return e;
}
function restack() {
  [...stage.querySelectorAll(".cell.docked")].forEach((x, i) => {
    x.classList.remove("stack1", "stack2", "stack3");
    if (i > 0) x.classList.add("stack" + Math.min(i, 3));
  });
}
function dockSameCell(e) {
  e.classList.remove("locking");
  e.classList.add("locked", "docked");
  restack();
  const cards = [...stage.querySelectorAll(".cell.docked")];
  if (cards.length > CFG.maxDocked) {
    const oldest = cards[0],
      ent = [...active.entries()].find(([, v]) => v.el === oldest);
    if (ent) release(ent[0]);
  }
}
function processLockQueue() {
  if (lockBusy || !lockQueue.length) return;
  const item = lockQueue.shift(),
    current = active.get(item.k);
  if (!current || current.item !== item) {
    processLockQueue();
    return;
  }
  lockBusy = true;
  const duration = Math.max(1, Number(item.d.duration) || 1),
    e = createCell(item.d);
  stage.appendChild(e);
  active.set(item.k, {
    el: e,
    end: Date.now() + duration * 1000,
    type: "timeout",
  });
  e.classList.add("locking");
  const tick = () => {
    const x = active.get(item.k);
    if (!x || x.el !== e) return;
    const left = (x.end - Date.now()) / 1000;
    e.querySelector(".timer").textContent = fmt(left);
    if (left <= 0) {
      release(item.k);
      return;
    }
    requestAnimationFrame(tick);
  };
  tick();
  Promise.all([new Promise((r) => setTimeout(r, 1500)), clang()]).then(() => {
    const x = active.get(item.k);
    if (x?.el === e) dockSameCell(e);
    lockBusy = false;
    processLockQueue();
  });
}
function timeout(d) {
  unlock();
  const k = key(d);
  if (active.has(k)) release(k);
  const item = { d, k };
  active.set(k, { item, type: "timeout" });
  lockQueue.push(item);
  processLockQueue();
}
function release(k) {
  const x = active.get(k);
  if (!x) return;
  if (x.item && !x.el) {
    x.item.cancelled = true;
    active.delete(k);
    lockQueue = lockQueue.filter((i) => i !== x.item);
    processLockQueue();
    return;
  }
  if (!x.el) return;
  const e = x.el;
  if (e.stopAngryAvatar) e.stopAngryAvatar();
  e.classList.add("releasing");
  releaseSound();
  setTimeout(() => {
    e.remove();
    active.delete(k);
    restack();
  }, 2600);
}
function setBanReason(trail, text) {
  const box = trail.querySelector(".ban-reason"),
    span = box.querySelector("span");
  span.textContent = text || "BANNED";
  requestAnimationFrame(() => {
    box.classList.remove("scrolling");
    span.style.removeProperty("--ban-scroll-time");
    if (span.scrollWidth > box.clientWidth) {
      const sec = Math.max(6, Math.min(14, span.scrollWidth / 40));
      box.style.setProperty("--ban-scroll-time", sec + "s");
      box.classList.add("scrolling");
    }
  });
}
function ban(d) {
  unlock();
  const k = key(d);
  if (active.has(k)) release(k);
  const scene = document.createElement("div");
  scene.className = "ban-scene";
  scene.innerHTML =
    '<div class="ban-trail"><div class="skid one"></div><div class="skid two"></div><div class="ban-reason"><span></span></div></div><div class="truck"><div class="truck-window"><img class="truck-avatar" alt=""><div class="truck-bars"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div></div>';
  stage.appendChild(scene);
  const truck = scene.querySelector(".truck"),
    w = scene.querySelector(".truck-window"),
    avatar = scene.querySelector(".truck-avatar"),
    bars = [...scene.querySelectorAll(".truck-bars i")],
    trail = scene.querySelector(".ban-trail");
  avatar.src =
    d.avatar ||
    d.profileImageUrl ||
    d.targetUserProfileImageUrl ||
    d.userProfileImageUrl ||
    "";
  avatar.onerror = () => (avatar.style.opacity = ".12");
  active.set(k, { scene, type: "ban" });
  setBanReason(trail, d.reason || d.banReason || d.message || "BANNED");
  setTimeout(() => {
    if (active.get(k)?.scene !== scene) return;
    w.classList.add("visible");
    setTimeout(() => {
      if (active.get(k)?.scene !== scene) return;
      bars.forEach((b) => {
        b.style.transition = "transform 1.5s cubic-bezier(.25,.8,.25,1)";
        b.style.transform = "scaleY(1)";
      });
      clang().then(() => {
        if (active.get(k)?.scene !== scene) return;
        trail.classList.add("revealing");
        truck.classList.add("driving-off");
        siren();
        setTimeout(() => {
          trail.classList.remove("revealing");
          trail.classList.add("fading");
          setTimeout(() => {
            scene.remove();
            active.delete(k);
          }, 1200);
        }, 4300);
      });
    }, 100);
  }, 1800);
}
function normaliseCustomArgs(d) {
  if (!d || typeof d !== "object") return d;
  let x = { ...d };
  if (x.data && typeof x.data === "object") x = { ...x, ...x.data };
  if (x.args && typeof x.args === "object") x = { ...x, ...x.args };
  if (x.payload && typeof x.payload === "object") x = { ...x, ...x.payload };
  return x;
}
function handle(d) {
  if (typeof d === "string") {
    try {
      d = JSON.parse(d);
    } catch {
      return;
    }
  }
  if (d?.data && typeof d.data === "string") {
    try {
      d.data = JSON.parse(d.data);
    } catch {}
  }
  if (d?.payload && typeof d.payload === "string") {
    try {
      d.payload = JSON.parse(d.payload);
    } catch {}
  }
  d = normaliseCustomArgs(d);
  if (!d || typeof d !== "object") return;
  applyOverlaySettings(d);
  const name = String(
    d.eventName || d.triggerCustomEventName || "",
  ).toLowerCase();
  if (name && name !== "banwidget") return;
  const act = String(d.actionName || d.name || "").toLowerCase();
  const src = String(
    d.__source || d.source || d.eventSource || "",
  ).toLowerCase();
  const timeoutEvent = src === "twitchusertimedout" || act.includes("timeout");
  const banEvent =
    src === "twitchuserbanned" ||
    act === "duhbuh - ban - ban" ||
    act.endsWith(" - ban - ban") ||
    act.includes("ban - ban");
  if (timeoutEvent) {
    timeout({
      ...d,
      action: "timeout",
      id: d.userId || d.id,
      username: d.userName || d.username || d.login || d.targetUserName,
      displayName:
        d.displayName || d.userName || d.username || d.login || d.targetUser,
      avatar:
        d.avatar ||
        d.profileImageUrl ||
        d.targetUserProfileImageUrl ||
        d.userProfileImageUrl,
      reason: d.reason || d.timeoutReason || d.message,
    });
    return;
  }
  if (banEvent) {
    ban({
      ...d,
      action: "ban",
      id: d.userId || d.id,
      username: d.userName || d.username || d.login || d.targetUserName,
      displayName:
        d.displayName || d.userName || d.username || d.login || d.targetUser,
      avatar:
        d.avatar ||
        d.profileImageUrl ||
        d.targetUserProfileImageUrl ||
        d.userProfileImageUrl,
      reason: d.reason || d.banReason || d.message,
    });
  }
}
function onCustomEvent(data) {
  const d = normaliseCustomArgs(data || {});
  const name = String(
    d.eventName || d.triggerCustomEventName || "",
  ).toLowerCase();
  if (name && name !== "banwidget") return;
  handle(d);
}
function connect() {
  const ws = new WebSocket(`ws://${CFG.host}:${CFG.port}/`);
  ws.onopen = () => {
    say("BAN WIDGET V4 ONLINE");
    ws.send(
      JSON.stringify({
        request: "Subscribe",
        id: "ban-widget-v4",
        events: { Custom: ["Event"] },
      }),
    );
  };
  ws.onmessage = (e) => {
    try {
      const m = JSON.parse(e.data),
        src = String(m.event?.source || "").toLowerCase(),
        typ = String(m.event?.type || "").toLowerCase();
      if (src === "custom" && typ === "event") onCustomEvent(m.data);
    } catch (err) {
      console.warn("Ban widget websocket message error", err);
    }
  };
  ws.onclose = () => setTimeout(connect, CFG.reconnectMs);
  ws.onerror = () => ws.close();
}
function demoTimeout(
  name = "DEMO_VIEWER",
  duration = 59,
  reason = "BACKSEAT GAMING",
) {
  timeout({
    action: "timeout",
    id: name,
    username: name,
    displayName: name,
    avatar:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png",
    duration,
    reason,
  });
}
function demoStack() {
  [
    ["ALPHA", "NO SPOILERS"],
    ["BRAVO", "BACKSEAT GAMING"],
    ["CHARLIE", "BE RESPECTFUL"],
    ["DELTA", "NO CAPS"],
  ].forEach((x, i) =>
    setTimeout(() => demoTimeout(x[0], 75 + i * 15, x[1]), i * 700),
  );
}
function demoLong() {
  demoTimeout(
    "LONG_MESSAGE",
    59,
    "PLEASE RESPECT EVERYONE IN CHAT AND KEEP IT POSITIVE AND FOLLOW THE RULES",
  );
}
function demoBan() {
  ban({
    action: "ban",
    id: "DEMO_BANNED",
    username: "DEMO_BANNED",
    displayName: "DEMO_BANNED",
    avatar:
      "https://static-cdn.jtvnw.net/jtv_user_pictures/xarth/404_user_70x70.png",
    reason: "Repeated backseat gaming after multiple warnings",
  });
}
window.testTimeout = demoTimeout;
window.testStack = demoStack;
window.testLong = demoLong;
window.testBan = demoBan;
const q = new URLSearchParams(location.search);
if (q.get("test") === "timeout") setTimeout(demoTimeout, 300);
if (q.get("test") === "stack") setTimeout(demoStack, 300);
if (q.get("test") === "long") setTimeout(demoLong, 300);
if (q.get("test") === "ban") setTimeout(demoBan, 300);
document.addEventListener("pointerdown", unlock, { once: true });
connect();

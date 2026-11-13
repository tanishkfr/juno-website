import Lenis from "lenis";
import "lenis/dist/lenis.css";
import { createPixelField } from "./pixel-field";
import { createSky } from "./sky";
document.documentElement.classList.add("js");
type Companion = {
  name: string;
  personality: string;
  quote: string;
  strength: string;
  greeting: string;
  bg: string;
  ink: string;
};
const companions: Record<string, Companion> = {
  kyoto: {
    name: "Kyoto",
    personality: "Calm, precise, composed",
    quote: "Cut the second paragraph. The first one already said it.",
    strength: "For focus, editing and clear plans.",
    greeting: "What needs a little clarity?",
    bg: "#f3e8df",
    ink: "#75372b",
  },
  prague: {
    name: "Prague",
    personality: "Observant, skeptical, a little dry",
    quote:
      "It’s competent, which is the problem. Nothing here would make anyone stop scrolling.",
    strength: "For critique, analysis and failure modes.",
    greeting: "What should we put to the test?",
    bg: "#eee8f6",
    ink: "#543979",
  },
  lisbon: {
    name: "Lisbon",
    personality: "Warm, thoughtful, dreamy, nostalgic",
    quote:
      "There’s a lovely rhythm in your opening line. Let’s follow it and see where the page wants to go.",
    strength: "For writing, stories and creative directions.",
    greeting: "What are you imagining?",
    bg: "#e8edf8",
    ink: "#314e85",
  },
  seoul: {
    name: "Seoul",
    personality: "Energetic, exploratory, builder instinct",
    quote:
      "Okay, this has potential. Let me mock up three headline variants so we can compare.",
    strength: "For code, products and quick prototypes.",
    greeting: "What can we make?",
    bg: "#f4e8ee",
    ink: "#793d59",
  },
  toronto: {
    name: "Toronto",
    personality: "Patient, comfortable, quietly funny",
    quote:
      "The headline’s a good start. A couple of small changes could help it land better.",
    strength: "For explanations, learning and everyday help.",
    greeting: "What can I help you untangle?",
    bg: "#e6f0f1",
    ink: "#315b62",
  },
  "new-york": {
    name: "New York",
    personality: "Blunt, decisive, efficient",
    quote: "Headline’s weak. CTA’s buried. Fix both, then we’ll talk.",
    strength: "For decisions, priorities and business tradeoffs.",
    greeting: "What needs deciding?",
    bg: "#f4eedb",
    ink: "#635024",
  },
};
const byId = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const demoVideo = byId<HTMLVideoElement>("workflow-demo");
const playDemo = byId<HTMLButtonElement>("play-demo");
const demoError = byId("demo-error");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
demoVideo.muted = true;
demoVideo.autoplay = !reducedMotion.matches;
demoVideo.controls = false;
async function playWorkflow(showError = true) {
  playDemo.hidden = true;
  demoError.hidden = true;
  demoVideo.controls = true;
  try {
    await demoVideo.play();
  } catch {
    demoVideo.controls = false;
    playDemo.hidden = false;
    demoError.textContent =
      "The demo couldn’t play. Try again, or read the conversation below.";
    demoError.hidden = !showError;
  }
}
playDemo.addEventListener("click", () => void playWorkflow());
demoVideo.addEventListener("play", () => {
  playDemo.hidden = true;
  demoVideo.controls = true;
});
demoVideo.addEventListener("ended", () => {
  demoVideo.controls = false;
  byId("demo-play-label").textContent = "Replay demo";
  playDemo.hidden = false;
});
if (reducedMotion.matches) playDemo.hidden = false;
else void playWorkflow(false);
const copyEmail = byId<HTMLButtonElement>("copy-email");
copyEmail.hidden = false;
copyEmail.addEventListener("click", async () => {
  const email = byId("beta-email-address");
  const status = byId("copy-email-status");
  try {
    if (!navigator.clipboard?.writeText)
      throw new Error("Clipboard unavailable");
    await navigator.clipboard.writeText(email.textContent!.trim());
    status.textContent = "Email address copied.";
  } catch {
    const range = document.createRange();
    range.selectNodeContents(email);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    status.textContent = "Email selected. Copy the highlighted address.";
  }
});
/** Restart a short CSS entrance on an element whose content just changed. */
function replay(element: HTMLElement, name: string) {
  element.classList.remove(name);
  void element.offsetWidth;
  element.classList.add(name);
}
const portrait = byId("companion-portrait");
const companionButtons = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-companion]"),
];
for (const button of companionButtons) {
  button.addEventListener("click", () => {
    const key = button.dataset.companion!;
    const c = companions[key];
    companionButtons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b === button)),
    );
    portrait.style.setProperty("--portrait-bg", c.bg);
    portrait.style.setProperty("--portrait-ink", c.ink);
    const img = byId<HTMLImageElement>("portrait-img");
    selectedCompanion = key;
    img.alt = c.name;
    byId("portrait-name").textContent = c.name;
    byId("portrait-personality").textContent = c.personality;
    byId("portrait-quote").textContent = `“${c.quote}”`;
    byId("portrait-strength").textContent = c.strength;
    replay(portrait, "swap");
    updateMotion();
  });
  button.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = companionButtons.indexOf(button);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 5
          : (index + (event.key === "ArrowRight" ? 1 : 5)) % 6;
    companionButtons[next].focus();
    companionButtons[next].click();
  });
}
const previewScenes: Record<
  string,
  { image: string; alt: string; caption: string }
> = {
  conversation: {
    image: "conversation",
    alt: "An illustrative conversation with Kyoto about a neighborhood bookshop, shown in the real Juno app.",
    caption: "Conversation with Kyoto · Illustrative text, real app",
  },
  workspace: {
    image: "agent-kyoto",
    alt: "Juno’s actual workspace with Kyoto at the center and the six city companions in the sidebar.",
    caption: "The Kyoto workspace · Actual Juno application",
  },
  code: {
    image: "code",
    alt: "The real Juno Code file editor with the Fieldnotes example project. Its AI provider is not connected.",
    caption: "Local file editing in Code · AI provider not connected",
  },
};
const previewTabs = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-preview]"),
];
const heroShot = document.querySelector<HTMLButtonElement>(".hero-shot")!;
const heroImage = heroShot.querySelector("img")!;
const companionPlayback = byId<HTMLButtonElement>("companion-playback");
const companyOrb = byId<HTMLImageElement>("company-orb");
const portraitPlayback = byId<HTMLButtonElement>("portrait-playback");
const portraitImage = byId<HTMLImageElement>("portrait-img");
const decorativeOrbs = [
  ...document.querySelectorAll<HTMLImageElement>("img[data-orb]"),
];
const visibleOrbs = new Set<HTMLImageElement>();
let selectedCompanion = "kyoto";
let portraitVisible = false;
let tourPlaying = !reducedMotion.matches;
let charactersPlaying = !reducedMotion.matches;
let previewVisible = false;
let companionVisible = false;
let previewHovered = false;
let tourTimer: ReturnType<typeof setTimeout> | undefined;
let outgoingImage: HTMLImageElement | undefined;
let previewTransition: Animation | undefined;

function updatePlaybackButton(
  button: HTMLButtonElement,
  playing: boolean,
  label: string,
) {
  button.hidden = false;
  button.disabled = reducedMotion.matches;
  button.title = reducedMotion.matches
    ? "Paused for your reduced motion preference"
    : "";
  button.querySelector("span")!.textContent = reducedMotion.matches
    ? `${label[0].toUpperCase() + label.slice(1)} paused`
    : `${playing ? "Pause" : "Play"} ${label}`;
  button
    .querySelector("path")!
    .setAttribute("d", playing ? "M7 5v10M13 5v10" : "M7 4l8 6-8 6V4Z");
}

function updateMotion() {
  clearTimeout(tourTimer);
  const tourAllowed = tourPlaying && !reducedMotion.matches;
  updatePlaybackButton(
    companionPlayback,
    charactersPlaying && !reducedMotion.matches,
    "animation",
  );
  updatePlaybackButton(
    portraitPlayback,
    charactersPlaying && !reducedMotion.matches,
    "expressions",
  );
  byId("preview-caption").setAttribute(
    "aria-live",
    tourAllowed ? "off" : "polite",
  );
  if (
    tourAllowed &&
    previewVisible &&
    !previewHovered &&
    !document.hidden &&
    !byId<HTMLDialogElement>("image-dialog").open
  ) {
    tourTimer = setTimeout(() => {
      const index = previewTabs.findIndex(
        (tab) => tab.getAttribute("aria-selected") === "true",
      );
      showPreview(previewTabs[(index + 1) % previewTabs.length], true);
      updateMotion();
    }, 5000);
  }
  const orbSource =
    charactersPlaying &&
    companionVisible &&
    !reducedMotion.matches &&
    !document.hidden &&
    !byId<HTMLDialogElement>("image-dialog").open
      ? "/assets/kyoto-expressions.webp"
      : "/assets/kyoto.png";
  if (companyOrb.getAttribute("src") !== orbSource) companyOrb.src = orbSource;
  const portraitSource =
    charactersPlaying &&
    portraitVisible &&
    !reducedMotion.matches &&
    !document.hidden &&
    !byId<HTMLDialogElement>("image-dialog").open
      ? `/assets/${selectedCompanion}-expressions.webp`
      : `/assets/${selectedCompanion}.png`;
  if (portraitImage.getAttribute("src") !== portraitSource)
    portraitImage.src = portraitSource;
  const charactersAllowed =
    charactersPlaying &&
    !reducedMotion.matches &&
    !document.hidden &&
    !byId<HTMLDialogElement>("image-dialog").open;
  for (const orb of decorativeOrbs) {
    const source =
      charactersAllowed && visibleOrbs.has(orb)
        ? `/assets/${orb.dataset.orb}-expressions.webp`
        : `/assets/${orb.dataset.orb}.png`;
    if (orb.getAttribute("src") !== source) orb.src = source;
  }
}

function stopTour() {
  tourPlaying = false;
  updateMotion();
}

function showPreview(tab: HTMLButtonElement, automatic = false) {
  previewTransition?.cancel();
  outgoingImage?.remove();
  outgoingImage = undefined;
  if (automatic) {
    outgoingImage = heroImage.cloneNode() as HTMLImageElement;
    outgoingImage.className = "preview-outgoing";
    outgoingImage.alt = "";
    outgoingImage.setAttribute("aria-hidden", "true");
    outgoingImage.style.objectPosition =
      getComputedStyle(heroImage).objectPosition;
    heroShot.append(outgoingImage);
  }
  const key = tab.dataset.preview!;
  const scene = previewScenes[key];
  previewTabs.forEach((button) => {
    button.setAttribute("aria-selected", String(button === tab));
    button.tabIndex = button === tab ? 0 : -1;
  });
  heroImage.srcset = `/assets/${scene.image}-960.webp 960w, /assets/${scene.image}-1440.webp 1440w`;
  heroImage.src = `/assets/${scene.image}-1440.webp`;
  heroImage.alt = scene.alt;
  heroShot.dataset.image = scene.image;
  heroShot.dataset.caption = scene.caption;
  heroShot.setAttribute(
    "aria-label",
    `Enlarge ${key === "code" ? "Juno Code" : key === "workspace" ? "the Juno workspace" : "the conversation with Kyoto"}`,
  );
  document.querySelector<HTMLElement>(".hero-stage")!.dataset.scene = key;
  byId("product-preview").setAttribute("aria-labelledby", tab.id);
  byId("preview-caption").textContent = scene.caption;
  const cover = outgoingImage;
  if (cover)
    void heroImage
      .decode()
      .then(() => {
        if (outgoingImage !== cover) return;
        previewTransition = cover.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: reducedMotion.matches ? 0 : 450,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "forwards",
        });
        void previewTransition.finished
          .then(() => cover.remove())
          .catch(() => {});
      })
      .catch(() => cover.remove());
}
for (const tab of previewTabs) {
  tab.addEventListener("click", () => {
    stopTour();
    showPreview(tab);
  });
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const index = previewTabs.indexOf(tab);
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? previewTabs.length - 1
          : (index +
              (event.key === "ArrowRight" ? 1 : previewTabs.length - 1)) %
            previewTabs.length;
    previewTabs[next].focus();
    previewTabs[next].click();
  });
}
companionPlayback.addEventListener("click", () => {
  charactersPlaying = !charactersPlaying;
  updateMotion();
});
portraitPlayback.addEventListener("click", () => {
  charactersPlaying = !charactersPlaying;
  updateMotion();
});
for (const tab of previewTabs) tab.addEventListener("focus", stopTour);
heroShot.addEventListener("focus", stopTour);
heroShot.addEventListener("pointerenter", () => {
  previewHovered = true;
  updateMotion();
});
heroShot.addEventListener("pointerleave", () => {
  previewHovered = false;
  updateMotion();
});
const motionVisibility = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (
        entry.target instanceof HTMLImageElement &&
        entry.target.hasAttribute("data-orb")
      ) {
        if (entry.isIntersecting) visibleOrbs.add(entry.target);
        else visibleOrbs.delete(entry.target);
      } else if (entry.target === heroShot)
        previewVisible = entry.intersectionRatio >= 0.15;
      else if (entry.target === companyOrb)
        companionVisible = entry.isIntersecting;
      else portraitVisible = entry.isIntersecting;
    }
    updateMotion();
  },
  { threshold: [0, 0.15] },
);
motionVisibility.observe(heroShot);
motionVisibility.observe(companyOrb);
motionVisibility.observe(portrait);
decorativeOrbs.forEach((orb) => motionVisibility.observe(orb));
document.addEventListener("visibilitychange", updateMotion);
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    demoVideo.autoplay = false;
    demoVideo.pause();
    if (!demoVideo.currentTime) playDemo.hidden = false;
    tourPlaying = false;
    charactersPlaying = false;
    previewTransition?.finish();
    outgoingImage?.remove();
  }
  updateMotion();
});
updateMotion();
const dialog = byId<HTMLDialogElement>("image-dialog");
const dialogImage = byId<HTMLImageElement>("dialog-image");
const imageViewport = byId("image-viewport");
const imageSize = byId<HTMLButtonElement>("image-size");
const imageStatus = byId("image-status");
const resetZoom = () => {
  byId("image-zoom-hint").hidden = true;
  imageViewport.dataset.zoomed = "false";
  imageViewport.setAttribute("aria-label", "Screenshot fit to view.");
  imageSize.setAttribute("aria-pressed", "false");
  imageSize.textContent = "Actual size";
  imageViewport.scrollTo(0, 0);
};
dialogImage.addEventListener("load", () => {
  if (!dialog.open) return;
  imageStatus.hidden = true;
  dialogImage.hidden = false;
  imageSize.disabled = false;
});
dialogImage.addEventListener("error", () => {
  if (!dialog.open) return;
  imageStatus.hidden = false;
  imageStatus.textContent =
    "This screenshot couldn’t load. Close it and try again.";
  dialogImage.hidden = true;
  imageSize.disabled = true;
});
imageSize.addEventListener("click", () => {
  const zoomed = imageSize.getAttribute("aria-pressed") !== "true";
  imageViewport.dataset.zoomed = String(zoomed);
  imageSize.setAttribute("aria-pressed", String(zoomed));
  imageSize.textContent = zoomed ? "Fit to view" : "Actual size";
  byId("image-zoom-hint").hidden = !zoomed;
  const photo = imageTrigger?.dataset.image;
  const focalPoint =
    photo === "code"
      ? 1
      : ["conversation", "agent-kyoto", "computer-control", "library"].includes(
            photo ?? "",
          )
        ? 0.64
        : 0.5;
  imageViewport.scrollTo(
    zoomed
      ? (imageViewport.scrollWidth - imageViewport.clientWidth) * focalPoint
      : 0,
    0,
  );
  imageViewport.setAttribute(
    "aria-label",
    zoomed
      ? "Screenshot at actual size. Scroll to explore."
      : "Screenshot fit to view.",
  );
  if (zoomed) imageViewport.focus({ preventScroll: true });
});
let imageTrigger: HTMLElement | undefined;
document
  .querySelectorAll<HTMLButtonElement>("[data-image]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      imageTrigger = button;
      resetZoom();
      imageSize.disabled = true;
      imageStatus.hidden = false;
      imageStatus.textContent = "Loading screenshot…";
      dialogImage.hidden = true;
      const img = byId<HTMLImageElement>("dialog-image");
      img.src = `/assets/${button.dataset.image}-full.webp`;
      img.alt =
        button.querySelector("img")?.alt ?? "Juno application screenshot";
      byId("image-dialog-caption").textContent =
        button.dataset.caption ?? "Juno";
      dialog.showModal();
      updateMotion();
    });
  });
byId("close-image").addEventListener("click", () => dialog.close());
dialog.addEventListener("keydown", (event) => {
  if (event.key === "Tab") {
    const controls = [
      imageSize,
      byId<HTMLButtonElement>("close-image"),
      imageViewport,
    ].filter(
      (control) => !(control instanceof HTMLButtonElement && control.disabled),
    );
    const index = controls.indexOf(document.activeElement as HTMLElement);
    if (
      index === -1 ||
      (!event.shiftKey && index === controls.length - 1) ||
      (event.shiftKey && index === 0)
    ) {
      event.preventDefault();
      controls[event.shiftKey ? controls.length - 1 : 0].focus();
    }
  }
});
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) {
    const box = dialog.getBoundingClientRect();
    if (
      event.clientX < box.left ||
      event.clientX > box.right ||
      event.clientY < box.top ||
      event.clientY > box.bottom
    )
      dialog.close();
  }
});
dialog.addEventListener("close", () => {
  updateMotion();
  resetZoom();
  byId<HTMLImageElement>("dialog-image").removeAttribute("src");
  imageTrigger?.focus({ preventScroll: true });
});
const menuButton = document.querySelector<HTMLButtonElement>(".menu-toggle")!;
const mobileNav = byId("mobile-nav");
const closeMenu = () => {
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation");
  mobileNav.hidden = true;
};
menuButton.addEventListener("click", () => {
  const opening = menuButton.getAttribute("aria-expanded") !== "true";
  menuButton.setAttribute("aria-expanded", String(opening));
  menuButton.setAttribute(
    "aria-label",
    opening ? "Close navigation" : "Open navigation",
  );
  mobileNav.hidden = !opening;
});
mobileNav
  .querySelectorAll("a")
  .forEach((a) => a.addEventListener("click", closeMenu));
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !mobileNav.hidden) {
    closeMenu();
    menuButton.focus();
  }
});
window.matchMedia("(min-width:761px)").addEventListener("change", (event) => {
  if (event.matches) closeMenu();
});
const header = document.querySelector(".site-header")!;
const navSections = ["overview", "companions", "features", "control"].map(
  (id) => byId(id),
);
const navLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>(
    ".desktop-nav a,#mobile-nav a",
  ),
];
let navFramePending = false;
function updateNavigation() {
  const current =
    navSections
      .filter((section) => section.getBoundingClientRect().top <= 160)
      .at(-1)?.id ?? "overview";
  for (const link of navLinks) {
    if (link.hash === "#" + current)
      link.setAttribute("aria-current", "location");
    else link.removeAttribute("aria-current");
  }
  navFramePending = false;
}
window.addEventListener(
  "scroll",
  () => {
    if (!navFramePending) {
      navFramePending = true;
      requestAnimationFrame(updateNavigation);
    }
  },
  { passive: true },
);
updateNavigation();

// ── Hero: choose who greets you ────────────────────────────────────────────
const hero = byId("overview");
const heroScene = byId("hero-scene");
const heroOrb = byId<HTMLImageElement>("hero-orb");
const heroPicks = [
  ...document.querySelectorAll<HTMLButtonElement>("[data-hero-pick]"),
];
for (const pick of heroPicks) {
  pick.addEventListener("click", () => {
    const key = pick.dataset.heroPick!;
    const c = companions[key];
    heroPicks.forEach((b) => b.setAttribute("aria-pressed", String(b === pick)));
    hero.dataset.host = key;
    heroOrb.dataset.orb = key;
    heroOrb.alt = `${c.name}, one of Juno’s six pixel companions`;
    byId("hero-greeting").textContent = c.greeting;
    byId("hero-host-name").textContent = c.name;
    byId("hero-host-trait").textContent = c.personality;
    replay(heroScene, "swap");
    updateMotion();
  });
}

// ── Scroll reveals ─────────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add("in");
      revealObserver.unobserve(entry.target);
    }
  },
  { rootMargin: "0px 0px -12% 0px", threshold: 0.08 },
);
document
  .querySelectorAll("[data-reveal], .footer-mark")
  .forEach((element) => revealObserver.observe(element));

// ── Scroll engine ──────────────────────────────────────────────────────────
// Native scrolling is never intercepted. One rAF loop eases a follower value
// toward the real scroll position and every scroll-linked effect reads that,
// so motion stays fluid on stepped mouse wheels. Transform/opacity only; the
// loop sleeps as soon as the follower catches up.
const root = document.documentElement;
const clamp = (value: number, min = 0, max = 1) =>
  Math.min(max, Math.max(min, value));
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
const pixelField = finePointer.matches
  ? createPixelField(reducedMotion)
  : undefined;
// Lenis glides the page itself on wheel and trackpad input. It is only used
// with a mouse and motion allowed: touch keeps native momentum, and reduced
// motion keeps plain native scrolling.
let lenis: Lenis | undefined;
function syncLenis() {
  const wanted = finePointer.matches && !reducedMotion.matches;
  if (wanted && !lenis) {
    lenis = new Lenis({ autoRaf: true, lerp: 0.1, anchors: true });
  } else if (!wanted && lenis) {
    lenis.destroy();
    lenis = undefined;
  }
}
syncLenis();
reducedMotion.addEventListener("change", syncLenis);
finePointer.addEventListener("change", syncLenis);
const hostColors: Record<string, string> = {
  kyoto: "#ff8a73",
  prague: "#b79cf0",
  lisbon: "#9dbaf3",
  seoul: "#f5a3c6",
  toronto: "#8fd8ea",
  "new-york": "#f0d06a",
};
const chapters = [...document.querySelectorAll<HTMLElement>("[data-chapter]")];
const companySection = document.querySelector<HTMLElement>(".company-section")!;
const crowd = [...document.querySelectorAll<HTMLElement>("[data-crowd]")];
const phrases = [...document.querySelectorAll<HTMLElement>("[data-phrase]")];
const footerMark = document.querySelector<HTMLElement>(".footer-mark")!;
const railBuddy = byId<HTMLImageElement>("rail-buddy");
const skyTime = byId("sky-time");
const pinQuery = window.matchMedia(
  "(min-width: 1001px) and (min-height: 620px)",
);

// Headlines dissolve in word by word through a grid of dots as they arrive.
for (const heading of document.querySelectorAll<HTMLElement>(".kin")) {
  let index = 0;
  const wrap = (parent: Node) => {
    for (const node of [...parent.childNodes]) {
      if (node.nodeType === Node.TEXT_NODE) {
        const fragment = document.createDocumentFragment();
        for (const part of node.textContent!.split(/(\s+)/)) {
          if (!part.trim()) {
            if (part) fragment.append(" ");
            continue;
          }
          const word = document.createElement("span");
          word.className = "w";
          word.style.setProperty("--i", String(index++));
          word.textContent = part;
          fragment.append(word);
        }
        node.replaceWith(fragment);
      } else if (node instanceof HTMLElement && node.tagName !== "BR") {
        wrap(node);
      }
    }
  };
  wrap(heading);
  revealObserver.observe(heading);
}
// Once a dot-grid dissolve has finished, drop its mask so shadows return.
document.addEventListener("animationend", (event) => {
  if (event.animationName.startsWith("dz") && event.target instanceof Element)
    event.target.classList.add("dz-done");
});

// The sky follows the scroll through a day; the clock reads the time back.
const sky = createSky(reducedMotion, (hour, night) => {
  const minutes = Math.round((((hour % 24) + 24) % 24) * 60) % 1440;
  const h = Math.floor(minutes / 60);
  skyTime.textContent = `${h % 12 || 12}:${String(minutes % 60).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
  root.dataset.sky = night ? "night" : "day";
});

let follower = window.scrollY;
let engineRunning = false;
let railHost = "";
let lastTrail = 0;

function currentHost(chapter: HTMLElement) {
  const name = chapter.dataset.chapter!;
  if (name === "hero") return hero.dataset.host ?? "kyoto";
  if (name === "cast") return selectedCompanion;
  return name;
}

function engineFrame() {
  const target = window.scrollY;
  const viewport = window.innerHeight;
  sky.update(target);
  header.classList.toggle("scrolled", target > 48);
  if (reducedMotion.matches) {
    follower = target;
    engineRunning = false;
    root.style.setProperty("--v", "0");
    hero.style.setProperty("--hp", "0");
    footerMark.style.removeProperty("--fp");
    phrases.forEach((phrase) => phrase.classList.add("lit"));
    updateRail(target, viewport, 0);
    return;
  }
  // With Lenis the page position is already eased, so effects track it
  // exactly and the lean comes from Lenis's own velocity. Without it (touch),
  // the follower supplies the easing.
  if (lenis) follower = target;
  else {
    follower += (target - follower) * 0.13;
    if (Math.abs(target - follower) < 0.4) follower = target;
  }
  const lag = target - follower;
  const gliding = lenis ? Math.abs(lenis.velocity) > 0.01 : false;
  const velocity = clamp(
    (lenis ? lenis.velocity / 0.13 : lag) / (viewport * 0.4),
    -1,
    1,
  );

  // Read layout first, then write.
  const companyBox = companySection.getBoundingClientRect();
  const footerBox = footerMark.getBoundingClientRect();

  root.style.setProperty("--v", velocity.toFixed(3));
  // The hero lifts away and fades as the next section rises.
  hero.style.setProperty("--hp", clamp(follower / (viewport * 0.8)).toFixed(3));

  // Dusk: pinned on large screens, the cast walks in one by one.
  const companyTop = companyBox.top + lag;
  const companyProgress = pinQuery.matches
    ? clamp(-companyTop / Math.max(1, companyBox.height - viewport))
    : clamp((viewport * 0.75 - companyTop) / (viewport * 0.7));
  crowd.forEach((bot, index) => {
    const t = clamp((companyProgress - (0.05 + index * 0.13)) / 0.3);
    const eased = 1 - (1 - t) ** 3;
    const hop = Math.abs(Math.sin(t * Math.PI * 3)) * 26 * (1 - t);
    bot.style.setProperty("--t", eased.toFixed(3));
    bot.style.setProperty("--hop", hop.toFixed(1));
  });
  phrases.forEach((phrase, index) =>
    phrase.classList.toggle("lit", companyProgress >= [0.02, 0.2, 0.34][index]),
  );

  // Footer wordmark fills in ten stepped rows.
  const footerProgress = clamp(
    (viewport - (footerBox.top + lag)) / (footerBox.height * 0.85),
  );
  footerMark.style.setProperty(
    "--fp",
    (Math.ceil(footerProgress * 10) / 10).toFixed(1),
  );

  updateRail(follower, viewport, velocity);

  if (follower !== target || gliding) requestAnimationFrame(engineFrame);
  else engineRunning = false;
}

function updateRail(position: number, viewport: number, velocity: number) {
  const progress = clamp(
    position / Math.max(1, root.scrollHeight - viewport),
  );
  root.style.setProperty("--rail-p", progress.toFixed(4));
  let chapter = chapters[0];
  for (const candidate of chapters) {
    if (candidate.getBoundingClientRect().top <= viewport * 0.45)
      chapter = candidate;
  }
  const host = currentHost(chapter);
  if (host !== railHost) {
    const first = !railHost;
    railHost = host;
    railBuddy.src = `/assets/${host}.png`;
    pixelField?.setColor(hostColors[host]);
    if (!first && !reducedMotion.matches) replay(railBuddy, "hop");
  }
  // The companion by the clock kicks up pixels when the page moves quickly.
  const now = performance.now();
  if (pixelField && Math.abs(velocity) > 0.12 && now - lastTrail > 45) {
    lastTrail = now;
    const box = railBuddy.getBoundingClientRect();
    if (box.width)
      pixelField.spawn(
        box.left + Math.random() * box.width,
        box.top + (velocity > 0 ? -8 : box.height + 8) - velocity * 30,
        0.7,
      );
  }
}

function wakeEngine() {
  if (engineRunning) return;
  engineRunning = true;
  requestAnimationFrame(engineFrame);
}
window.addEventListener("scroll", wakeEngine, { passive: true });
window.addEventListener("resize", wakeEngine);
window.addEventListener("load", wakeEngine);
reducedMotion.addEventListener("change", wakeEngine);
// Selecting a companion (hero or roster) changes who rides the rail.
document.addEventListener("click", (event) => {
  if (
    event.target instanceof Element &&
    event.target.closest("[data-hero-pick], [data-companion]")
  )
    wakeEngine();
});
wakeEngine();

if (finePointer.matches) {
  hero.addEventListener("pointermove", (event) => {
    if (reducedMotion.matches) return;
    const box = heroScene.getBoundingClientRect();
    const x = (event.clientX - (box.left + box.width / 2)) / window.innerWidth;
    const y = (event.clientY - (box.top + box.height / 2)) / window.innerHeight;
    heroScene.style.setProperty("--mx", (-x * 1.4).toFixed(3));
    heroScene.style.setProperty("--my", (-y * 1.4).toFixed(3));
  });
  hero.addEventListener("pointerleave", () => {
    heroScene.style.setProperty("--mx", "0");
    heroScene.style.setProperty("--my", "0");
  });
}

// ── Feature index follows the panel being read ─────────────────────────────
const featureLinks = [
  ...document.querySelectorAll<HTMLAnchorElement>("[data-feature-link]"),
];
const featureObserver = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      for (const link of featureLinks) {
        if (link.hash === "#" + entry.target.id)
          link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      }
    }
  },
  { rootMargin: "-45% 0px -45% 0px" },
);
document
  .querySelectorAll(".feature-panel")
  .forEach((panel) => featureObserver.observe(panel));

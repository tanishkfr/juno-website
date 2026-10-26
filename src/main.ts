type Companion = {
  name: string;
  personality: string;
  quote: string;
  strength: string;
  bg: string;
  ink: string;
};
const companions: Record<string, Companion> = {
  kyoto: {
    name: "Kyoto",
    personality: "Calm, precise, composed",
    quote: "Cut the second paragraph. The first one already said it.",
    strength: "For focus, editing and clear plans.",
    bg: "#f3e8df",
    ink: "#75372b",
  },
  prague: {
    name: "Prague",
    personality: "Observant, skeptical, a little dry",
    quote:
      "It’s competent, which is the problem. Nothing here would make anyone stop scrolling.",
    strength: "For critique, analysis and failure modes.",
    bg: "#eee8f6",
    ink: "#543979",
  },
  lisbon: {
    name: "Lisbon",
    personality: "Warm, thoughtful, dreamy, nostalgic",
    quote:
      "There’s a lovely rhythm in your opening line. Let’s follow it and see where the page wants to go.",
    strength: "For writing, stories and creative directions.",
    bg: "#e8edf8",
    ink: "#314e85",
  },
  seoul: {
    name: "Seoul",
    personality: "Energetic, exploratory, builder instinct",
    quote:
      "Okay, this has potential. Let me mock up three headline variants so we can compare.",
    strength: "For code, products and quick prototypes.",
    bg: "#f4e8ee",
    ink: "#793d59",
  },
  toronto: {
    name: "Toronto",
    personality: "Patient, comfortable, quietly funny",
    quote:
      "The headline’s a good start. A couple of small changes could help it land better.",
    strength: "For explanations, learning and everyday help.",
    bg: "#e6f0f1",
    ink: "#315b62",
  },
  "new-york": {
    name: "New York",
    personality: "Blunt, decisive, efficient",
    quote: "Headline’s weak. CTA’s buried. Fix both, then we’ll talk.",
    strength: "For decisions, priorities and business tradeoffs.",
    bg: "#f4eedb",
    ink: "#635024",
  },
};
const byId = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;
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
    img.src = `/assets/${key}.png`;
    img.alt = c.name;
    byId("portrait-name").textContent = c.name;
    byId("portrait-personality").textContent = c.personality;
    byId("portrait-quote").textContent = `“${c.quote}”`;
    byId("portrait-strength").textContent = c.strength;
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
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const previewPlayback = byId<HTMLButtonElement>("preview-playback");
const companionPlayback = byId<HTMLButtonElement>("companion-playback");
const companyOrb = byId<HTMLImageElement>("company-orb");
let tourPlaying = !reducedMotion.matches;
let companionPlaying = !reducedMotion.matches;
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
    ? `${label === "tour" ? "Tour" : "Animation"} paused`
    : `${playing ? "Pause" : "Play"} ${label}`;
  button
    .querySelector("path")!
    .setAttribute("d", playing ? "M7 5v10M13 5v10" : "M7 4l8 6-8 6V4Z");
}

function updateMotion() {
  clearTimeout(tourTimer);
  const tourAllowed = tourPlaying && !reducedMotion.matches;
  updatePlaybackButton(previewPlayback, tourAllowed, "tour");
  updatePlaybackButton(
    companionPlayback,
    companionPlaying && !reducedMotion.matches,
    "animation",
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
    }, 7000);
  }
  const orbSource =
    companionPlaying &&
    companionVisible &&
    !reducedMotion.matches &&
    !document.hidden &&
    !byId<HTMLDialogElement>("image-dialog").open
      ? "/assets/kyoto-idle.webp"
      : "/assets/kyoto.png";
  if (companyOrb.getAttribute("src") !== orbSource) companyOrb.src = orbSource;
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
previewPlayback.addEventListener("click", () => {
  tourPlaying = !tourPlaying;
  updateMotion();
});
companionPlayback.addEventListener("click", () => {
  companionPlaying = !companionPlaying;
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
      if (entry.target === heroShot)
        previewVisible = entry.intersectionRatio >= 0.15;
      else companionVisible = entry.isIntersecting;
    }
    updateMotion();
  },
  { threshold: [0, 0.15] },
);
motionVisibility.observe(heroShot);
motionVisibility.observe(companyOrb);
document.addEventListener("visibilitychange", updateMotion);
reducedMotion.addEventListener("change", () => {
  if (reducedMotion.matches) {
    tourPlaying = false;
    companionPlaying = false;
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
const observer = new IntersectionObserver(
  ([entry]) => header.classList.toggle("scrolled", !entry.isIntersecting),
  { rootMargin: "-80px 0px 0px 0px" },
);
observer.observe(document.querySelector(".hero-copy")!);
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

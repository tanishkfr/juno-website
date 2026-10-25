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
const dialog = byId<HTMLDialogElement>("image-dialog");
let imageTrigger: HTMLElement | undefined;
document
  .querySelectorAll<HTMLButtonElement>("[data-image]")
  .forEach((button) => {
    button.addEventListener("click", () => {
      imageTrigger = button;
      const img = byId<HTMLImageElement>("dialog-image");
      img.src = `/assets/${button.dataset.image}-full.webp`;
      img.alt =
        button.querySelector("img")?.alt ?? "Juno application screenshot";
      byId("image-dialog-caption").textContent =
        button.dataset.caption ?? "Juno";
      dialog.showModal();
    });
  });
byId("close-image").addEventListener("click", () => dialog.close());
dialog.addEventListener("keydown", (event) => {
  // This image viewer has one interactive control. Keep both tab directions
  // on Close while it is modal; Escape continues to use the native behavior.
  if (event.key === "Tab") {
    event.preventDefault();
    byId("close-image").focus();
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

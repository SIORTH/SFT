import { rawServices } from "./data-services.js";

/**
 * SIFORTECH - Refactored Script
 * Architecture:
 *   - Init waits until HTML partials finish loading
 *   - Single IntersectionObserver reveal system
 *   - Catalog rendering stays data-driven
 *   - DOM selectors are cached after partial injection
 */
const WA_NUMBER = "6289613864000";

let currentFilter = "all";
let listContainer = null;
let emptyState = null;
let sideDrawer = null;
let drawerOverlay = null;
let isInitialized = false;

const cacheDom = () => {
  listContainer = document.getElementById("servicesList");
  emptyState = document.getElementById("emptyState");
  sideDrawer = document.getElementById("sideDrawer");
  drawerOverlay = document.getElementById("drawerOverlay");
};

// Render Katalog Layanan
const renderServices = () => {
  if (!listContainer || !emptyState) {
    return;
  }

  const filtered = rawServices.filter(
    (item) => currentFilter === "all" || item.category === currentFilter,
  );
  listContainer.innerHTML = "";

  if (filtered.length === 0) {
    emptyState.classList.remove("hidden");
    emptyState.classList.add("flex");
  } else {
    emptyState.classList.add("hidden");
    emptyState.classList.remove("flex");

    filtered.forEach((service, index) => {
      const card = document.createElement("div");
      card.className =
        "glass-card p-6 md:p-8 rounded-3xl cursor-pointer group reveal active";
      card.onclick = () => openArticle(service);
      card.innerHTML = `
                        <div class="flex justify-between items-start mb-6">
                            <div class="w-12 h-12 bg-blue-50 text-brand-blue rounded-xl flex items-center justify-center group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                <i data-lucide="${service.icon}" class="w-6 h-6"></i>
                            </div>
                            <span class="text-[10px] font-bold tracking-wider text-slate-400 bg-slate-50 border border-slate-100 px-3 py-1 rounded-full uppercase group-hover:border-brand-blue/30">${service.packageLevel}</span>
                        </div>
                        <h4 class="text-xl font-bold text-brand-dark mb-2 group-hover:text-brand-blue transition-colors">${service.name}</h4>
                        <p class="text-sm text-slate-600 leading-relaxed mb-6 line-clamp-2">${service.desc}</p>
                        <div class="flex items-center text-sm font-bold text-brand-blue gap-2 group-hover:translate-x-2 transition-transform">
                            Lihat Detail <i data-lucide="arrow-right" class="w-4 h-4"></i>
                        </div>
                    `;
      listContainer.appendChild(card);
    });
  }
  lucide.createIcons();
};

// Buka Panel Detail
window.openArticle = (service) => {
  if (!sideDrawer || !drawerOverlay) {
    return;
  }

  document.getElementById("drawerTitle").textContent = service.name;
  document.getElementById("drawerBadge").textContent =
    "Pilihan: " + service.packageLevel;
  document.getElementById("drawerArticle").innerHTML = service.article;
  document.getElementById("drawerWaBtn").href =
    `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(service.message)}`;

  drawerOverlay.classList.remove("opacity-0", "pointer-events-none");
  sideDrawer.classList.remove("translate-x-full");
  document.body.style.overflow = "hidden";
  lucide.createIcons();
};

// Tutup Panel Detail
window.closeArticle = () => {
  if (!sideDrawer || !drawerOverlay) {
    return;
  }

  drawerOverlay.classList.add("opacity-0", "pointer-events-none");
  sideDrawer.classList.add("translate-x-full");
  document.body.style.overflow = "";
};

const setupFilterButtons = () => {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.onclick = () => {
      document.querySelectorAll(".filter-btn").forEach((button) => {
        button.classList.remove(
          "bg-brand-dark",
          "text-white",
          "border-transparent",
        );
        button.classList.add("bg-white", "text-slate-600", "border-slate-200");
      });

      btn.classList.add("bg-brand-dark", "text-white", "border-transparent");
      btn.classList.remove("bg-white", "text-slate-600", "border-slate-200");

      currentFilter = btn.dataset.filter;
      renderServices();
    };
  });
};

// CTA General
const contactGeneral = () =>
  window.open(
    `https://wa.me/${WA_NUMBER}?text=Halo SiforTech, saya mau konsultasi jasa.`,
    "_blank",
  );
window.contactGeneral = contactGeneral;

// Scroll Observer untuk Animasi
const observeElements = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          // Nggak usah unobserve kalau mau bisa animasi ulang pas discroll bolak-balik,
          // Tapi standar biasanya di unobserve biar ringan.
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 },
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
};

// Active State Sidebar pas di-scroll
const observeSections = () => {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-item");

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => {
            link.classList.remove(
              "active",
              "bg-blue-50",
              "text-brand-blue",
              "border-r-4",
              "border-brand-blue",
            );
            link.classList.add("text-slate-500");

            if (link.dataset.target === entry.target.id) {
              link.classList.add(
                "active",
                "bg-blue-50",
                "text-brand-blue",
                "border-r-4",
                "border-brand-blue",
              );
              link.classList.remove("text-slate-500");
            }
          });
        }
      });
    },
    { rootMargin: "-50% 0px -50% 0px" },
  ); // Trigger pas seksi ada di tengah layar

  sections.forEach((sec) => observer.observe(sec));
};

const initializePage = () => {
  if (isInitialized) {
    return;
  }

  cacheDom();

  if (!listContainer || !emptyState || !sideDrawer || !drawerOverlay) {
    return;
  }

  setupFilterButtons();
  renderServices();
  lucide.createIcons();
  setTimeout(observeElements, 100); // delay dikit biar DOM siap
  observeSections();
  isInitialized = true;
};

if (window.__partialsReady) {
  initializePage();
} else {
  document.addEventListener("partials:loaded", initializePage, { once: true });
}

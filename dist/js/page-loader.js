const partials = [
  ["sidebar-container", "pages/sidebar.html"],
  ["hero-container", "pages/hero.html"],
  ["keunggulan-container", "pages/keunggulan.html"],
  ["alur-container", "pages/alur.html"],
  ["katalog-container", "pages/katalog.html"],
  ["faq-container", "pages/faq.html"],
  ["footer-container", "pages/footer.html"],
  ["modal-container", "pages/modal.html"],
];

const loadPartial = async (containerId, partialPath) => {
  const container = document.getElementById(containerId);

  if (!container) {
    throw new Error(`Container tidak ditemukan: ${containerId}`);
  }

  const response = await fetch(partialPath);

  if (!response.ok) {
    throw new Error(`Gagal memuat ${partialPath}: ${response.status}`);
  }

  container.innerHTML = await response.text();
};

document.addEventListener("DOMContentLoaded", async () => {
  try {
    for (const [containerId, partialPath] of partials) {
      await loadPartial(containerId, partialPath);
    }

    window.__partialsReady = true;
    document.dispatchEvent(new Event("partials:loaded"));
  } catch (error) {
    console.error("Gagal memuat partial halaman.", error);
  }
});

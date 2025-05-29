document.addEventListener('DOMContentLoaded', () => {
    AOS.init({
        once: true, // Animasi hanya berjalan sekali
        duration: 800, // Durasi animasi default
        offset: 100, // Offset sebelum animasi dimulai
    });

    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('backToTop');
    const toPortfolioBtn = document.getElementById('toPortfolioBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const darkModeIcon = darkModeToggle.querySelector('i');
    let currentSection = 'home';
    let lastFocusedElement = null; // Untuk menyimpan elemen yang terakhir fokus sebelum modal

    // Portfolio data
    const portfolioItems = [
        // GANTI DATA & GAMBAR: Sesuaikan dengan proyek portofolio Anda
        {
            id: 'proyek-gedung', // ID unik untuk setiap item
            title: 'Layanan Drafting',
            tags: ['drafting', 'arsitektur'],
            thumb: '/assets/content/drafting.png',
            fullImage: '/assets/content/drafting.png',
            desc: 'Gambar kerja lengkap gedung modern bertingkat dengan detail struktur, arsitektur, dan MEP. Menggunakan AutoCAD dan Revit.'
        },
        {
            id: 'pemetaan-kota',
            title: 'Layanan Pemetaan',
            tags: ['mapping', 'gis'],
            thumb: '/assets/content/mapping.png',
            fullImage: '/assets/content/mapping.png',
            desc: 'Pemetaan GIS untuk analisis perkembangan perkotaan, perencanaan tata ruang, dan identifikasi potensi wilayah. Menggunakan QGIS.'
        },
        {
            id: 'desain-logo-tech',
            title: 'Admin Fleksibel',
            tags: ['design', 'branding'],
            thumb: '/assets/content/admin-fleksibel.png',
            fullImage: '/assets/content/admin-fleksibel.png',
            desc: 'Admin Fleksibel untuk pengelolaan dokumen, entri data, dan dukungan administratif. Tersedia secara onsite maupun remote sesuai kebutuhan proyek, dengan fokus pada efisiensi dan ketepatan data.'
        },

    ];

    // Render portfolio cards
    const portfolioGrid = document.querySelector('#portfolio .cards-grid');
    function renderPortfolio(filter = 'all') {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = '';
        const filteredItems = filter === 'all' ? portfolioItems : portfolioItems.filter(item => item.tags.includes(filter));

        if (filteredItems.length === 0) {
            portfolioGrid.innerHTML = '<p class="text-center w-100">Tidak ada proyek yang cocok dengan filter ini.</p>';
            return;
        }

        filteredItems.forEach((item) => {
            const card = document.createElement('article');
            card.className = 'card';
            card.tabIndex = 0;
            card.setAttribute('role', 'listitem');
            card.setAttribute('aria-label', `Proyek portofolio: ${item.title}`);
            card.dataset.id = item.id; // Gunakan ID unik
            card.setAttribute('data-aos', 'fade-up');


            card.innerHTML = `
                        <img src="${item.thumb}" alt="Thumbnail proyek ${item.title}" loading="lazy" />
                        <div class="card-body">
                        <h3 class="card-title">${item.title}</h3>
                        <p class="card-tags">${item.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ')}</p>
                        </div>`;
            portfolioGrid.appendChild(card);
        });
        AOS.refresh(); // Refresh AOS setelah item ditambahkan
    }
    if (portfolioGrid) renderPortfolio();


    // Handle portfolio filter buttons
    document.querySelectorAll('#portfolio .filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('#portfolio .filter-btn').forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-pressed', 'true');
            renderPortfolio(btn.dataset.filter);
        });
    });

    // Portfolio modal elements
    const portfolioModalElement = document.getElementById('portfolioModal');
    const portfolioModal = portfolioModalElement ? new bootstrap.Modal(portfolioModalElement) : null;
    const modalTitle = document.getElementById('portfolioModalLabel');
    const modalImg = document.getElementById('portfolioModalImg');
    const modalDesc = document.getElementById('portfolioModalDesc');
    const modalTags = document.getElementById('portfolioModalTags');

    // Open modal on card click/enter
    function openPortfolioModal(cardElement) {
        if (!cardElement || !portfolioModal) return;
        const itemId = cardElement.dataset.id;
        const item = portfolioItems.find(p => p.id === itemId);
        if (!item) return;

        lastFocusedElement = cardElement; // Simpan elemen yang memicu modal

        modalTitle.textContent = item.title;
        modalImg.src = item.fullImage || item.thumb; // Gunakan fullImage jika ada
        modalImg.alt = `Gambar lengkap proyek ${item.title}`;
        modalDesc.textContent = item.desc;
        modalTags.textContent = item.tags.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
        portfolioModal.show();
    }

    if (portfolioGrid) {
        portfolioGrid.addEventListener('click', e => {
            const card = e.target.closest('.card');
            if (card) openPortfolioModal(card);
        });

        portfolioGrid.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('card')) {
                e.preventDefault();
                openPortfolioModal(e.target);
            }
        });
    }

    // Return focus when modal is hidden
    if (portfolioModalElement) {
        portfolioModalElement.addEventListener('hidden.bs.modal', () => {
            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        });
    }


    // SPA Navigation logic
    function setActiveSection(targetId, isInitialLoad = false) {
        if (!targetId) targetId = 'home'; // Default ke home jika tidak ada target
        if (!isInitialLoad && targetId === currentSection) return;

        const oldSection = document.getElementById(currentSection);
        const newSection = document.getElementById(targetId);

        if (!newSection) {
            console.warn(`Section with id "${targetId}" not found.`);
            return; // Jika section baru tidak ditemukan, jangan lakukan apa-apa
        }

        // Update nav links
        navLinks.forEach(link => {
            if (link.getAttribute('href') === '#' + targetId) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
                link.tabIndex = 0;
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
                link.tabIndex = -1;
            }
        });

        if (isInitialLoad) {
            if (oldSection && oldSection !== newSection) oldSection.classList.remove('active');
            newSection.classList.add('active');
            currentSection = targetId;
            AOS.refresh();
            // Tidak perlu fokus pada initial load, biarkan browser menangani
            return;
        }

        if (oldSection && oldSection !== newSection) {
            // Animate old section out
            gsap.to(oldSection, {
                duration: 0.4, // Durasi lebih cepat
                opacity: 0,
                y: 30, // Perpindahan lebih sedikit
                ease: "power2.in",
                onComplete: () => {
                    oldSection.classList.remove('active');
                    oldSection.style.opacity = ''; // Reset style
                    oldSection.style.transform = ''; // Reset style

                    // Show new section, animate it in
                    newSection.classList.add('active');
                    newSection.focus({ preventScroll: true }); // Fokus ke section baru
                    gsap.fromTo(
                        newSection,
                        { opacity: 0, y: -30 },
                        { duration: 0.5, opacity: 1, y: 0, ease: "power2.out", onComplete: AOS.refresh }
                    );
                }
            });
        } else if (!oldSection && newSection) { // Jika tidak ada oldSection (misalnya, dari direct URL hash)
            newSection.classList.add('active');
            newSection.focus({ preventScroll: true });
            gsap.fromTo(
                newSection,
                { opacity: 0, y: -30 },
                { duration: 0.5, opacity: 1, y: 0, ease: "power2.out", onComplete: AOS.refresh }
            );
        }


        currentSection = targetId;
        if (window.location.hash !== '#' + targetId) {
            history.pushState(null, null, '#' + targetId); // Update URL hash
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Handle initial load based on URL hash
    const initialHash = window.location.hash.substring(1);
    setActiveSection(initialHash || 'home', true);


    // Nav link click handler
    navLinks.forEach(navLink => {
        navLink.addEventListener('click', e => {
            e.preventDefault();
            const target = navLink.getAttribute('href').substring(1);
            setActiveSection(target);
            // Close collapsible navbar on mobile if open
            const navbarCollapseElement = document.getElementById('navbarNav');
            if (navbarCollapseElement && navbarCollapseElement.classList.contains('show')) {
                const bsCollapse = bootstrap.Collapse.getInstance(navbarCollapseElement) || new bootstrap.Collapse(navbarCollapseElement, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

    // Handle browser back/forward navigation
    window.addEventListener('popstate', () => {
        const hash = window.location.hash.substring(1);
        setActiveSection(hash || 'home');
    });


    // "Lihat Portofolio" CTA button
    if (toPortfolioBtn) {
        toPortfolioBtn.addEventListener('click', () => {
            setActiveSection('contact');
        });
    }

    // Tombol "Pesan Sekarang" di service card & footer
    document.querySelectorAll('.toContactBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault(); // Hindari default jika ini adalah <a>
            setActiveSection('contact');
            // Jika di dalam service card, tutup flip
            const serviceCardInner = btn.closest('.service-card .inner');
            if (serviceCardInner) {
                serviceCardInner.style.transform = ''; // Reset flip
                const front = serviceCardInner.querySelector('.service-front');
                const back = serviceCardInner.querySelector('.service-back');
                if (front) front.setAttribute('aria-hidden', 'false');
                if (back) back.setAttribute('aria-hidden', 'true');
            }
        });
    });


    // Back to top button show/hide
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            if (backToTopBtn) backToTopBtn.style.display = 'block';
            gsap.to(backToTopBtn, { autoAlpha: 1, duration: 0.3 });
        } else {
            gsap.to(backToTopBtn, {
                autoAlpha: 0, duration: 0.3, onComplete: () => {
                    if (backToTopBtn) backToTopBtn.style.display = 'none';
                }
            });
        }
    });

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            setActiveSection('home'); // Kembali ke section home
        });
    }

    // Service card keyboard flip effect
    document.querySelectorAll('.service-card').forEach(card => {
        const inner = card.querySelector('.inner');
        const front = card.querySelector('.service-front');
        const back = card.querySelector('.service-back');

        card.addEventListener('keydown', e => {
            if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === card) {
                e.preventDefault();
                const isFlipped = inner.style.transform === 'rotateY(180deg)';
                inner.style.transform = isFlipped ? '' : 'rotateY(180deg)';
                if (front && back) {
                    front.setAttribute('aria-hidden', isFlipped ? 'false' : 'true');
                    back.setAttribute('aria-hidden', isFlipped ? 'true' : 'false');
                }
            }
        });
        // Reset flip on mouse leave if not focused by keyboard
        card.addEventListener('mouseleave', () => {
            if (document.activeElement !== card) { // Hanya reset jika tidak sedang difokus keyboard
                inner.style.transform = '';
                if (front && back) {
                    front.setAttribute('aria-hidden', 'false');
                    back.setAttribute('aria-hidden', 'true');
                }
            }
        });
        // Reset flip on blur if it was focused
        card.addEventListener('blur', () => {
            // Cek apakah elemen yang mendapat fokus berikutnya adalah tombol di dalam kartu
            setTimeout(() => { // Timeout untuk membiarkan event fokus baru terjadi
                if (!card.contains(document.activeElement)) {
                    inner.style.transform = '';
                    if (front && back) {
                        front.setAttribute('aria-hidden', 'false');
                        back.setAttribute('aria-hidden', 'true');
                    }
                }
            }, 0);
        });
    });


    // Contact form handling
    const contactForm = document.getElementById('contactForm');
    const formMessageStatus = document.getElementById('form-message-status');

    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            formMessageStatus.textContent = ''; // Clear previous messages
            formMessageStatus.className = 'mt-3'; // Reset class

            const name = contactForm.nameInput.value.trim();
            const email = contactForm.emailInput.value.trim();
            const message = contactForm.msgInput.value.trim();
            let isValid = true;

            if (name === '') {
                formMessageStatus.textContent = 'Nama harus diisi. ';
                formMessageStatus.classList.add('text-danger');
                isValid = false;
            }
            if (email === '') {
                formMessageStatus.textContent += 'Email harus diisi. ';
                formMessageStatus.classList.add('text-danger');
                isValid = false;
            } else {
                const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                if (!emailValid) {
                    formMessageStatus.textContent += 'Format email tidak valid. ';
                    formMessageStatus.classList.add('text-danger');
                    isValid = false;
                }
            }
            if (message === '') {
                formMessageStatus.textContent += 'Pesan harus diisi.';
                formMessageStatus.classList.add('text-danger');
                isValid = false;
            }

            if (!isValid) {
                formMessageStatus.setAttribute('role', 'alert'); // Jadi alert jika ada error
                return;
            }

            formMessageStatus.setAttribute('role', 'status'); // Kembali jadi status jika sukses
            formMessageStatus.classList.remove('text-danger');
            formMessageStatus.classList.add('text-success');
            formMessageStatus.textContent = 'Pesan Anda sedang dikirim...';

            // Simulate form submission (ganti dengan fetch API ke backend Anda)
            setTimeout(() => {
                formMessageStatus.textContent = 'Pesan Anda berhasil dikirim. Terima kasih!';
                gsap.to(contactForm.querySelectorAll('input, textarea, button'), {
                    duration: 0.3, opacity: 0.7, ease: "power1.out",
                    onComplete: () => {
                        contactForm.reset();
                        gsap.to(contactForm.querySelectorAll('input, textarea, button'), {
                            duration: 0.3, opacity: 1,
                        });
                    }
                });
                // Hapus pesan sukses setelah beberapa detik
                setTimeout(() => {
                    formMessageStatus.textContent = '';
                    formMessageStatus.className = 'mt-3';
                }, 5000);
            }, 1500);
        });
    }

    // Dark Mode Toggle
    function setDarkMode(isDark) {
        if (isDark) {
            document.body.classList.add('dark-mode');
            if (darkModeIcon) darkModeIcon.classList.replace('fa-moon', 'fa-sun');
            localStorage.setItem('darkMode', 'true');
            if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'true');
        } else {
            document.body.classList.remove('dark-mode');
            if (darkModeIcon) darkModeIcon.classList.replace('fa-sun', 'fa-moon');
            localStorage.setItem('darkMode', 'false');
            if (darkModeToggle) darkModeToggle.setAttribute('aria-pressed', 'false');
        }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            setDarkMode(!document.body.classList.contains('dark-mode'));
        });
    }

    // Check local storage for dark mode preference
    if (localStorage.getItem('darkMode') === 'true' ||
        (localStorage.getItem('darkMode') === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
    // Listen for OS theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (localStorage.getItem('darkMode') === null) { // Hanya jika user belum override
            setDarkMode(e.matches);
        }
    });

    // Update current year in footer
    const currentYearElement = document.getElementById('currentYear');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }

});

function updateHomeSectionShrink() {
    const homeSection = document.getElementById('home');
    if (!homeSection) return;

    // ambil hash tanpa #
    const hash = window.location.hash.slice(1);

    if (hash && hash !== 'home') {
        homeSection.classList.add('shrinked');
    } else {
        homeSection.classList.remove('shrinked');
    }
}

// Nav Button
document.getElementById('homeBtn').addEventListener('click', () => {
    window.location.href = `${window.location.origin}${window.location.pathname}#home`;
    window.location.reload(); // optional, kalau pengen jamin reload penuh
});
document.getElementById('aboutBtn').addEventListener('click', () => {
    window.location.href = `${window.location.origin}${window.location.pathname}#about`;
    window.location.reload();
});
document.getElementById('protfolionBtn').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `${window.location.origin}${window.location.pathname}#portfolio`;
    window.location.reload();
});

document.getElementById('servicesBtn').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `${window.location.origin}${window.location.pathname}#services`;
    window.location.reload();
});

document.getElementById('contactBtn').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `${window.location.origin}${window.location.pathname}#contact`;
    window.location.reload();
});
document.getElementById('btn-cta').addEventListener('click', function (e) {
    e.preventDefault();
    window.location.href = `${window.location.origin}${window.location.pathname}#contact`;
    window.location.reload();
});

// Call on initial load and whenever section changes
updateHomeSectionShrink();

// Patch setActiveSection to also update home shrink
const originalSetActiveSection = setActiveSection;
setActiveSection = function (targetId, isInitialLoad = false) {
    originalSetActiveSection(targetId, isInitialLoad);
    updateHomeSectionShrink();
};

const navbarToggler = document.querySelector('.navbar-toggler');
const togglerIcon = navbarToggler?.querySelector('i');
const navbarCollapse = document.getElementById('navbarNav');

if (navbarToggler && togglerIcon && navbarCollapse) {
    // Saat tombol diklik (manual toggle)
    navbarToggler.addEventListener('click', () => {
        const isExpanded = navbarToggler.getAttribute('aria-expanded') === 'true';
        togglerIcon.classList.toggle('fa-xmark', !isExpanded);
        togglerIcon.classList.toggle('fa-bars', isExpanded);
    });

    // Saat collapse selesai menutup (klik menu, klik luar, dll)
    navbarCollapse.addEventListener('hidden.bs.collapse', () => {
        togglerIcon.classList.remove('fa-xmark');
        togglerIcon.classList.add('fa-bars');
    });

    // Saat collapse selesai terbuka
    navbarCollapse.addEventListener('shown.bs.collapse', () => {
        togglerIcon.classList.remove('fa-bars');
        togglerIcon.classList.add('fa-xmark');
    });
}

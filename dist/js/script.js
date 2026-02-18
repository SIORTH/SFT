/**
 * SIFORTECH - Refactored Script
 * Architecture:
 *   - Single IntersectionObserver reveal system (no AOS, no library)
 *   - fetch → build full HTML string → single innerHTML inject
 *   - Global state machine: loading → rendering → ready / error
 *   - Skeleton hides only after DOM + next rAF
 *   - Event delegation for filters
 *   - No inline onclick
 *   - All selectors cached; no forced reflow
 */
(function () {
    'use strict';

    /* ============================================
       Config
       ============================================ */
    const CONFIG = {
        API_URL: 'https://api.sifortech.site/article',
        WA_BASE: 'https://wa.me/6289698910380?text=',
        FETCH_TIMEOUT: 10000,
        STORAGE_KEY: 'sifortech-theme',
        ITEMS_PER_PAGE: 12
    };

    /* ============================================
       State
       ============================================ */
    // 'loading' | 'rendering' | 'ready' | 'error'
    let appState = 'loading';
    let servicesData = [];
    let currentPage = 1;
    let totalPages = 1;
    let currentFilter = 'all';

    /* ============================================
       DOM Cache  (queried once after DOMContentLoaded)
       ============================================ */
    let dom = {};

    function cacheDOM() {
        dom.html              = document.documentElement;
        dom.navbar            = document.querySelector('.nav-fixed');
        dom.themeToggle       = document.getElementById('themeToggle');
        dom.themeToggleMobile = document.getElementById('themeToggleMobile');
        dom.themeIcon         = document.getElementById('themeIcon');
        dom.themeIconMobile   = document.getElementById('themeIconMobile');
        dom.themeTextMobile   = document.getElementById('themeTextMobile');
        dom.particles         = document.getElementById('particles');
        dom.layananLoading    = document.getElementById('layanan-loading');
        dom.layananError      = document.getElementById('layanan-error');
        dom.layananGrid       = document.getElementById('layanan-grid');
        dom.layananFilter     = document.getElementById('layananFilter');
        dom.layananPagination = document.getElementById('layanan-pagination');
        dom.paginationPages   = document.getElementById('paginationPages');
        dom.counters          = document.querySelectorAll('.counter');
        dom.revealEls         = document.querySelectorAll('.reveal');
    }

    /* ============================================
       Utilities
       ============================================ */
    function esc(str) {
        if (typeof str !== 'string') return '';
        return str
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function formatPrice(price) {
        if (typeof price === 'number') return 'Rp\u00A0' + price.toLocaleString('id-ID');
        if (typeof price === 'string' && price.trim()) return price.trim();
        return 'Hubungi kami';
    }

    function classifyService(name) {
        if (!name) return { label: 'Layanan Umum', cls: 'umum' };
        const up = name.toUpperCase();
        if (up.match(/DOKUMEN|PROPOSAL|LAPORAN|ADMINISTRASI/))
            return { label: 'Administrasi Proyek', cls: 'administrasi' };
        if (up.match(/AUTOCAD|REVIT|GIS|TEKNIS|MAPPING|DRAFTING/))
            return { label: 'Layanan Teknis', cls: 'teknis' };
        if (up.match(/EXCEL|AI|OTOMASI|OTOMATISASI|AUTOMASI/))
            return { label: 'Otomatisasi Kerja', cls: 'otomasi' };
        return { label: 'Layanan Umum', cls: 'umum' };
    }

    function waUrl(message) {
        const text = message
            ? message
            : 'Halo SIFORTECH, saya ingin konsultasikan pekerjaan saya';
        return CONFIG.WA_BASE + encodeURIComponent(text);
    }

    /* ============================================
       Theme / Dark Mode
       ============================================ */
    function initTheme() {
        const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme((saved === 'dark' || (!saved && prefersDark)) ? 'dark' : 'light');
    }

    function setTheme(theme) {
        dom.html.setAttribute('data-theme', theme);
        localStorage.setItem(CONFIG.STORAGE_KEY, theme);
        const isDark = theme === 'dark';
        const icon = isDark ? 'light_mode' : 'dark_mode';
        const text = isDark ? 'Mode Terang' : 'Mode Gelap';
        if (dom.themeIcon)        dom.themeIcon.textContent        = icon;
        if (dom.themeIconMobile)  dom.themeIconMobile.textContent  = icon;
        if (dom.themeTextMobile)  dom.themeTextMobile.textContent  = text;
    }

    function toggleTheme() {
        setTheme(dom.html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    }

    function bindThemeToggle() {
        if (dom.themeToggle) {
            dom.themeToggle.addEventListener('click', toggleTheme);
        }
        if (dom.themeToggleMobile) {
            dom.themeToggleMobile.addEventListener('click', function (e) {
                e.preventDefault();
                toggleTheme();
            });
        }
    }

    /* ============================================
       Materialize Init
       ============================================ */
    function initMaterialize() {
        if (typeof M === 'undefined') return;

        var sidenavEls = document.querySelectorAll('.sidenav');
        if (sidenavEls.length) {
            M.Sidenav.init(sidenavEls, { edge: 'left', draggable: true });
        }

        var scrollspyEls = document.querySelectorAll('.scrollspy');
        if (scrollspyEls.length) {
            M.ScrollSpy.init(scrollspyEls, { scrollOffset: 80 });
        }
    }

    /* ============================================
       Navbar Scroll
       ============================================ */
    function initNavbar() {
        if (!dom.navbar) return;
        var ticking = false;

        function update() {
            dom.navbar.classList.toggle('scrolled', window.scrollY > 50);
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                requestAnimationFrame(update);
                ticking = true;
            }
        }, { passive: true });
    }

    /* ============================================
       Particles (hero decoration)
       ============================================ */
    function initParticles() {
        if (!dom.particles) return;
        var count = window.innerWidth < 768 ? 12 : 22;
        // Build all particles in a fragment — single DOM write
        var frag = document.createDocumentFragment();
        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'particle';
            var size = Math.random() * 5 + 4;
            p.style.cssText =
                'width:' + size + 'px;' +
                'height:' + size + 'px;' +
                'left:' + (Math.random() * 100) + '%;' +
                'top:' + (Math.random() * 100) + '%;' +
                'animation-delay:' + (Math.random() * 12) + 's;' +
                'animation-duration:' + (Math.random() * 8 + 12) + 's;';
            frag.appendChild(p);
        }
        dom.particles.appendChild(frag);
    }

    /* ============================================
       Counter Animation
       ============================================ */
    function initCounters() {
        if (!dom.counters.length) return;

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                io.unobserve(entry.target);
                animateCounter(entry.target);
            });
        }, { threshold: 0.5 });

        dom.counters.forEach(function (el) { io.observe(el); });
    }

    function animateCounter(el) {
        var target   = parseInt(el.getAttribute('data-target'), 10);
        var duration = 1800;
        var start    = performance.now();

        function tick(now) {
            var progress = Math.min((now - start) / duration, 1);
            var ease     = 1 - Math.pow(1 - progress, 3);
            el.textContent = Math.floor(target * ease);
            if (progress < 1) requestAnimationFrame(tick);
            else el.textContent = target;
        }

        requestAnimationFrame(tick);
    }

    /* ============================================
       Reveal Animation System
       Single observer, class toggle, no setTimeout
       ============================================ */
    function initReveal() {
        if (!dom.revealEls.length) return;

        // Apply CSS delay via custom property to avoid computed-style reads
        dom.revealEls.forEach(function (el) {
            var delay = parseInt(el.getAttribute('data-delay') || '0', 10);
            if (delay) el.style.setProperty('--reveal-delay', delay + 'ms');
        });

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                io.unobserve(entry.target);
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -48px 0px' });

        dom.revealEls.forEach(function (el) { io.observe(el); });
    }

    /* ============================================
       Services Fetch & Render
       Strict pipeline: fetch → build string → single inject → rAF → ready
       ============================================ */
    function buildCardHTML(service, index) {
        var cat   = classifyService(service.name);
        var price = formatPrice(service.price);
        var url   = waUrl(service.message);
        var delay = (index % 4) * 80; // stagger per row

        return (
            '<div class="layanan-card reveal" data-anim="fade-up"' +
            '     data-category="' + esc(cat.cls) + '"' +
            (delay ? ' style="--reveal-delay:' + delay + 'ms"' : '') + '>' +
                '<span class="layanan-context-label">Layanan Jasa</span>' +
                '<span class="layanan-label ' + esc(cat.cls) + '">' + esc(cat.label) + '</span>' +
                '<h3 class="layanan-name">' + esc(service.name) + '</h3>' +
                '<p class="layanan-desc">' + esc(service.desc) + '</p>' +
                '<div class="layanan-price">' +
                    '<span class="layanan-price-label">Estimasi mulai</span>' +
                    '<span class="layanan-price-value">' + esc(price) + '</span>' +
                '</div>' +
                '<a href="' + url + '"' +
                '   class="layanan-cta"' +
                '   target="_blank"' +
                '   rel="noopener noreferrer"' +
                '   aria-label="Konsultasikan ' + esc(service.name) + '">' +
                    '<i class="material-icons" aria-hidden="true">chat</i>' +
                    'Konsultasikan' +
                '</a>' +
            '</div>'
        );
    }

    function renderServices(services) {
        appState = 'rendering';

        if (!Array.isArray(services) || services.length === 0) {
            setErrorState();
            return;
        }

        servicesData = services;
        currentPage = 1;
        currentFilter = 'all';

        // Reset filter buttons
        if (dom.layananFilter) {
            dom.layananFilter.querySelectorAll('.btn-filter').forEach(function (b) {
                b.classList.remove('active');
            });
            var allBtn = dom.layananFilter.querySelector('[data-filter="all"]');
            if (allBtn) allBtn.classList.add('active');
        }

        // Build full HTML string in memory
        var html = '';
        for (var i = 0; i < services.length; i++) {
            if (!services[i] || typeof services[i] !== 'object') continue;
            html += buildCardHTML(services[i], i);
        }

        // Single DOM inject
        if (dom.layananGrid) {
            dom.layananGrid.innerHTML = html;
        }

        // Wait for browser to paint before revealing skeleton→grid transition
        requestAnimationFrame(function () {
            document.body.classList.add('services-loaded');
            appState = 'ready';

            // Initialize pagination
            updatePagination();

            // Wire up reveal observer for newly injected cards
            var newRevealEls = dom.layananGrid
                ? dom.layananGrid.querySelectorAll('.reveal')
                : [];

            if (newRevealEls.length) {
                var io = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (!entry.isIntersecting) return;
                        entry.target.classList.add('is-visible');
                        io.unobserve(entry.target);
                    });
                }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

                newRevealEls.forEach(function (el) { io.observe(el); });
            }
        });
    }

    function setErrorState() {
        appState = 'error';
        document.body.classList.add('services-error');
    }

    /* ============================================
       Pagination
       ============================================ */
    function getFilteredCards() {
        if (!dom.layananGrid) return [];
        var allCards = dom.layananGrid.querySelectorAll('.layanan-card');
        var filtered = [];
        allCards.forEach(function (card) {
            var cardCategory = card.getAttribute('data-category');
            var isMatch = currentFilter === 'all' || cardCategory === currentFilter;
            if (isMatch) {
                filtered.push(card);
            }
        });
        return filtered;
    }

    function updatePagination() {
        var filteredCards = getFilteredCards();
        var totalItems = filteredCards.length;
        totalPages = Math.ceil(totalItems / CONFIG.ITEMS_PER_PAGE) || 1;

        // Ensure current page is valid
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Show/hide cards based on current page
        var startIndex = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
        var endIndex = startIndex + CONFIG.ITEMS_PER_PAGE;

        filteredCards.forEach(function (card, index) {
            var isVisible = index >= startIndex && index < endIndex;
            card.setAttribute('data-paginated', isVisible ? 'true' : 'false');
        });

        // Hide cards that don't match current filter (for compatibility with existing filter)
        if (dom.layananGrid) {
            var allCards = dom.layananGrid.querySelectorAll('.layanan-card');
            allCards.forEach(function (card) {
                var cardCategory = card.getAttribute('data-category');
                var isMatch = currentFilter === 'all' || cardCategory === currentFilter;
                if (!isMatch) {
                    card.setAttribute('data-hidden', 'true');
                } else {
                    card.setAttribute('data-hidden', 'false');
                }
            });
        }

        // Show/hide pagination based on total pages
        if (dom.layananPagination) {
            dom.layananPagination.hidden = totalPages <= 1;
        }

        renderPaginationControls();
    }

    function renderPaginationControls() {
        if (!dom.paginationPages) return;

        var html = '';
        var maxVisible = 5; // Max visible page buttons
        var startPage, endPage;

        if (totalPages <= maxVisible) {
            startPage = 1;
            endPage = totalPages;
        } else {
            var half = Math.floor(maxVisible / 2);
            if (currentPage <= half + 1) {
                startPage = 1;
                endPage = maxVisible;
            } else if (currentPage >= totalPages - half) {
                startPage = totalPages - maxVisible + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - half;
                endPage = currentPage + half;
            }
        }

        // First page + ellipsis
        if (startPage > 1) {
            html += '<button class="pagination-page" data-page="1">1</button>';
            if (startPage > 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Page numbers
        for (var i = startPage; i <= endPage; i++) {
            var activeClass = i === currentPage ? ' active' : '';
            html += '<button class="pagination-page' + activeClass + '" data-page="' + i + '">' + i + '</button>';
        }

        // Ellipsis + last page
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
            html += '<button class="pagination-page" data-page="' + totalPages + '">' + totalPages + '</button>';
        }

        dom.paginationPages.innerHTML = html;

        // Update prev/next button states
        var prevBtn = dom.layananPagination ? dom.layananPagination.querySelector('.pagination-prev') : null;
        var nextBtn = dom.layananPagination ? dom.layananPagination.querySelector('.pagination-next') : null;
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage) return;
        currentPage = page;
        updatePagination();

        // Scroll to top of layanan section smoothly
        var layananSection = document.getElementById('layanan');
        if (layananSection) {
            var offset = dom.navbar ? dom.navbar.offsetHeight : 0;
            var top = layananSection.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }
    }

    function initPagination() {
        if (!dom.layananPagination) return;

        dom.layananPagination.addEventListener('click', function (e) {
            var btn = e.target.closest('button');
            if (!btn) return;

            var action = btn.getAttribute('data-action');
            var page = btn.getAttribute('data-page');

            if (action === 'prev') {
                goToPage(currentPage - 1);
            } else if (action === 'next') {
                goToPage(currentPage + 1);
            } else if (page) {
                goToPage(parseInt(page, 10));
            }
        });
    }

    async function fetchServices() {
        appState = 'loading';

        try {
            var controller = new AbortController();
            var timer = setTimeout(function () { controller.abort(); }, CONFIG.FETCH_TIMEOUT);

            var res = await fetch(CONFIG.API_URL, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                signal: controller.signal
            });

            clearTimeout(timer);

            if (!res.ok) throw new Error('HTTP ' + res.status);

            var data = await res.json();

            if (!Array.isArray(data)) throw new Error('Unexpected data format');

            renderServices(data);

        } catch (err) {
            console.error('[SIFORTECH] Services fetch failed:', err.message);
            setErrorState();
        }
    }

    /* ============================================
       Filter – event delegation (no per-button listener)
       ============================================ */
    function initFilter() {
        if (!dom.layananFilter) return;

        dom.layananFilter.addEventListener('click', function (e) {
            var btn = e.target.closest('.btn-filter');
            if (!btn) return;

            // Update active class
            dom.layananFilter.querySelectorAll('.btn-filter').forEach(function (b) {
                b.classList.remove('active');
            });
            btn.classList.add('active');

            var category = btn.getAttribute('data-filter');
            filterCards(category);
        });
    }

    function filterCards(category) {
        currentFilter = category;
        currentPage = 1; // Reset to first page when filter changes
        updatePagination();
    }

    /* ============================================
       Smooth Scroll
       ============================================ */
    function initSmoothScroll() {
        document.addEventListener('click', function (e) {
            var anchor = e.target.closest('a[href^="#"]');
            if (!anchor) return;
            var href = anchor.getAttribute('href');
            if (href === '#') return;
            var target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            var offset = dom.navbar ? dom.navbar.offsetHeight : 0;
            var top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: top, behavior: 'smooth' });
        });
    }

    /* ============================================
       Visibility — pause non-essential when hidden
       ============================================ */
    function initVisibility() {
        document.addEventListener('visibilitychange', function () {
            document.body.classList.toggle('tab-hidden', document.hidden);
        });
    }

    /* ============================================
       Init
       ============================================ */
    function init() {
        cacheDOM();
        initTheme();
        bindThemeToggle();
        initMaterialize();
        initNavbar();
        initParticles();
        initCounters();
        initReveal();
        initFilter();
        initPagination();
        initSmoothScroll();
        initVisibility();
        fetchServices();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();

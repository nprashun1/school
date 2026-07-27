/* =============================================
   VJ CONCEPT SCHOOL — 4D Animated JavaScript
   ============================================= */

(function () {
    'use strict';

    /* ---- Utilities ---- */
    function qs(s)  { return document.querySelector(s); }
    function qsa(s) { return document.querySelectorAll(s); }

    /* ---- Dynamic Copyright Year ---- */
    var yearEl = document.getElementById('footer-year');
    if (yearEl) { yearEl.textContent = new Date().getFullYear(); }

    const isMobile   = () => window.innerWidth <= 900;
    const prefersRed = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ===================================================
       1. CUSTOM CURSOR
       =================================================== */
    var cursorDot  = qs('#cursor-dot');
    var cursorRing = qs('#cursor-ring');

    if (cursorDot && cursorRing && !isMobile()) {
        var mouseX = 0, mouseY = 0;
        var ringX  = 0, ringY  = 0;

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = 'translate(' + (mouseX - 4) + 'px, ' + (mouseY - 4) + 'px)';
        });

        (function animateCursor() {
            ringX += (mouseX - ringX) * 0.12;
            ringY += (mouseY - ringY) * 0.12;
            cursorRing.style.transform = 'translate(' + (ringX - 18) + 'px, ' + (ringY - 18) + 'px)';
            requestAnimationFrame(animateCursor);
        })();

        /* Grow ring on interactive elements */
        var hoverTargets = qsa('a, button, .feature-card, .gallery-item, .notice-item, .stat-card');
        hoverTargets.forEach(function (el) {
            el.addEventListener('mouseenter', function () { cursorRing.classList.add('hovered'); });
            el.addEventListener('mouseleave', function () { cursorRing.classList.remove('hovered'); });
        });
    }

    /* ===================================================
       2. NAVBAR — scroll + active links
       =================================================== */
    var navbar    = qs('#navbar');
    var hamburger = qs('#hamburger');
    var navLinks  = qs('#nav-links');
    var navOverlay= qs('#nav-overlay');
    var allLinks  = qsa('.nav-link');

    function onNavScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    }

    function toggleMenu(close) {
        var opening = close ? false : !hamburger.classList.contains('open');
        hamburger.classList.toggle('open', opening);
        hamburger.setAttribute('aria-expanded', String(opening));
        navLinks.classList.toggle('open', opening);
        navOverlay.classList.toggle('active', opening);
        document.body.style.overflow = opening ? 'hidden' : '';
    }

    hamburger.addEventListener('click', function () { toggleMenu(false); });
    navOverlay.addEventListener('click', function () { toggleMenu(true); });
    allLinks.forEach(function (l) { l.addEventListener('click', function () { toggleMenu(true); }); });

    /* Active link tracking via sections */
    var sections = ['home','stats','about','features','notice','admission','gallery','director','contact'];
    var secObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) {
                allLinks.forEach(function (l) {
                    l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id);
                });
            }
        });
    }, { threshold: 0.3 });

    sections.forEach(function (id) {
        var el = qs('#' + id);
        if (el) secObs.observe(el);
    });

    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();

    /* ===================================================
       3. SMOOTH SCROLLING
       =================================================== */
    qsa('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var target = qs(this.getAttribute('href'));
            if (!target) return;
            e.preventDefault();
            window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - navbar.offsetHeight, behavior: 'smooth' });
        });
    });

    /* ===================================================
       4. SCROLL REVEAL
       =================================================== */
    var revObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            var siblings = Array.from(entry.target.parentElement.querySelectorAll('.reveal'));
            var idx = siblings.indexOf(entry.target);
            setTimeout(function () { entry.target.classList.add('visible'); }, Math.min(idx * 90, 450));
            revObs.unobserve(entry.target);
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    qsa('.reveal').forEach(function (el) { revObs.observe(el); });

    /* ===================================================
       5. HERO CANVAS PARTICLE SYSTEM
       =================================================== */
    var canvas = qs('#hero-canvas');
    if (canvas && !prefersRed) {
        var ctx = canvas.getContext('2d');
        var particles = [];
        var PARTICLE_COUNT = isMobile() ? 40 : 90;

        function resizeCanvas() {
            canvas.width  = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        }

        function Particle() { this.reset(true); }
        Particle.prototype.reset = function (init) {
            this.x       = Math.random() * canvas.width;
            this.y       = init ? Math.random() * canvas.height : canvas.height + 10;
            this.vx      = (Math.random() - 0.5) * 0.6;
            this.vy      = -(Math.random() * 1.2 + 0.3);
            this.size    = Math.random() * 2.5 + 0.5;
            this.maxLife = Math.random() * 180 + 80;
            this.life    = init ? Math.random() * this.maxLife : 0;
            this.type    = Math.random(); /* 0-0.5 dots, 0.5-0.75 stars, 0.75-1 rings */
            this.color   = this.type < 0.5 ? '255,255,255' : (this.type < 0.75 ? '240,165,0' : '184,33,50');
        };
        Particle.prototype.update = function () {
            this.x += this.vx;
            this.y += this.vy;
            this.life++;
            if (this.life > this.maxLife || this.y < -10) this.reset(false);
        };
        Particle.prototype.draw = function () {
            var prog = this.life / this.maxLife;
            var alpha = Math.sin(prog * Math.PI) * 0.7;
            ctx.save();
            ctx.globalAlpha = alpha;
            if (this.type < 0.5) {
                /* Circle */
                ctx.fillStyle = 'rgba(' + this.color + ',1)';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else if (this.type < 0.75) {
                /* 4-pointed star */
                ctx.fillStyle = 'rgba(' + this.color + ',1)';
                var s = this.size * 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y - s);
                ctx.lineTo(this.x + s*0.3, this.y - s*0.3);
                ctx.lineTo(this.x + s, this.y);
                ctx.lineTo(this.x + s*0.3, this.y + s*0.3);
                ctx.lineTo(this.x, this.y + s);
                ctx.lineTo(this.x - s*0.3, this.y + s*0.3);
                ctx.lineTo(this.x - s, this.y);
                ctx.lineTo(this.x - s*0.3, this.y - s*0.3);
                ctx.closePath();
                ctx.fill();
            } else {
                /* Ring */
                ctx.strokeStyle = 'rgba(' + this.color + ',1)';
                ctx.lineWidth   = 1;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.restore();
        };

        /* Connection lines between close particles */
        function drawConnections() {
            for (var i = 0; i < particles.length; i++) {
                for (var j = i + 1; j < particles.length; j++) {
                    var dx   = particles[i].x - particles[j].x;
                    var dy   = particles[i].y - particles[j].y;
                    var dist = Math.sqrt(dx*dx + dy*dy);
                    if (dist < 80) {
                        ctx.save();
                        ctx.globalAlpha = (1 - dist/80) * 0.12;
                        ctx.strokeStyle = '#ffffff';
                        ctx.lineWidth   = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        ctx.restore();
                    }
                }
            }
        }

        for (var i = 0; i < PARTICLE_COUNT; i++) { particles.push(new Particle()); }

        function animateParticles() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            if (!isMobile()) drawConnections();
            particles.forEach(function (p) { p.update(); p.draw(); });
            requestAnimationFrame(animateParticles);
        }

        resizeCanvas();
        animateParticles();
        window.addEventListener('resize', resizeCanvas, { passive: true });
    }

    /* ===================================================
       6. TYPEWRITER EFFECT
       =================================================== */
    var tyEl = qs('#typewriter');
    if (tyEl) {
        var phrases = [
            'Nurturing minds, shaping futures.',
            'CBSE affiliated — Class 1 to 10.',
            'Located in BiharSharif, Nalanda.',
            'Excellence in Education since day one.'
        ];
        var pIdx = 0, cIdx = 0, deleting = false;
        var typeDelay = 1200;

        function typeLoop() {
            var current = phrases[pIdx];
            if (!deleting) {
                tyEl.textContent = current.slice(0, ++cIdx);
                if (cIdx === current.length) { deleting = true; setTimeout(typeLoop, typeDelay); return; }
                setTimeout(typeLoop, 55);
            } else {
                tyEl.textContent = current.slice(0, --cIdx);
                if (cIdx === 0) {
                    deleting = false;
                    pIdx = (pIdx + 1) % phrases.length;
                    setTimeout(typeLoop, 400);
                    return;
                }
                setTimeout(typeLoop, 28);
            }
        }
        setTimeout(typeLoop, 1800);
    }

    /* ===================================================
       7. COUNTER ANIMATION
       =================================================== */
    function animateCounter(el) {
        var target   = parseInt(el.getAttribute('data-target'), 10);
        var duration = 2000;
        var step     = 16;
        var inc      = target / (duration / step);
        var current  = 0;
        var timer    = setInterval(function () {
            current += inc;
            if (current >= target) { current = target; clearInterval(timer); }
            el.textContent = Math.floor(current);
        }, step);
    }

    var cntObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
            if (e.isIntersecting) { animateCounter(e.target); cntObs.unobserve(e.target); }
        });
    }, { threshold: 0.5 });
    qsa('.stat-number').forEach(function (el) { cntObs.observe(el); });

    /* ===================================================
       8. 3D TILT EFFECT (gallery + director card)
       =================================================== */
    function initTilt(elements, maxTilt, perspective) {
        if (prefersRed || isMobile()) return;
        elements.forEach(function (el) {
            var rect;
            el.addEventListener('mousemove', function (e) {
                rect = el.getBoundingClientRect();
                var cx = rect.left + rect.width  / 2;
                var cy = rect.top  + rect.height / 2;
                var rx = ((e.clientY - cy) / (rect.height / 2)) * -maxTilt;
                var ry = ((e.clientX - cx) / (rect.width  / 2)) *  maxTilt;
                el.style.transform = 'perspective(' + perspective + 'px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(10px)';
                el.style.boxShadow = '0 ' + (20 + Math.abs(ry)*2) + 'px ' + (40 + Math.abs(rx)*3) + 'px rgba(0,0,0,.25)';
                el.style.transition = 'transform 0.1s ease, box-shadow 0.1s ease';
            });
            el.addEventListener('mouseleave', function () {
                el.style.transform  = 'perspective(' + perspective + 'px) rotateX(0) rotateY(0) translateZ(0)';
                el.style.boxShadow  = '';
                el.style.transition = 'transform 0.6s ease, box-shadow 0.6s ease';
            });
        });
    }

    initTilt(qsa('.gallery-item.tilt-card'), 12, 800);
    initTilt(qsa('.director-card.tilt-card'), 6, 1200);

    /* ===================================================
       9. FEATURE CARDS — flip on touch (mobile fallback)
       =================================================== */
    qsa('.feature-card').forEach(function (card) {
        card.addEventListener('click', function () {
            card.classList.toggle('flipped');
        });
    });

    /* ===================================================
       10. GALLERY — LOAD MORE
       =================================================== */
    var loadMoreBtn  = qs('#load-more-btn');
    var hiddenItems  = qsa('.gallery-hidden');

    if (loadMoreBtn) {
        if (hiddenItems.length === 0) {
            loadMoreBtn.style.display = 'none';
        } else {
            loadMoreBtn.addEventListener('click', function () {
                hiddenItems.forEach(function (item) {
                    item.classList.remove('gallery-hidden');
                    revObs.observe(item);
                    /* re-apply tilt */
                    initTilt([item], 12, 800);
                });
                loadMoreBtn.style.display = 'none';
            });
        }
    }

    /* ===================================================
       11. GALLERY LIGHTBOX
       =================================================== */
    var lightbox    = qs('#lightbox');
    var lbImg       = qs('#lightbox-img');
    var lbClose     = qs('#lightbox-close');
    var lbPrev      = qs('#lightbox-prev');
    var lbNext      = qs('#lightbox-next');
    var lbBg        = qs('#lightbox-backdrop');
    var lbCounter   = qs('#lightbox-counter');
    var lbImages    = [];
    var lbIndex     = 0;

    function buildLbImages() {
        lbImages = Array.from(qsa('.gallery-item:not(.gallery-hidden)')).map(function (i) {
            return i.getAttribute('data-src');
        });
    }

    function openLb(index) {
        buildLbImages();
        lbIndex = index;
        lbImg.style.opacity = '0';
        lbImg.src = lbImages[lbIndex];
        lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
        lbImg.onload = function () { lbImg.style.opacity = '1'; };
    }

    function closeLb() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
        setTimeout(function () { lbImg.src = ''; }, 400);
    }

    function lbNavigate(dir) {
        lbIndex = (lbIndex + dir + lbImages.length) % lbImages.length;
        lbImg.style.opacity = '0';
        setTimeout(function () {
            lbImg.src = lbImages[lbIndex];
            lbCounter.textContent = (lbIndex + 1) + ' / ' + lbImages.length;
            lbImg.onload = function () { lbImg.style.opacity = '1'; };
        }, 200);
    }

    qsa('.gallery-item').forEach(function (item) {
        item.addEventListener('click', function () {
            var visible = Array.from(qsa('.gallery-item:not(.gallery-hidden)'));
            var idx = visible.indexOf(item);
            if (idx !== -1) openLb(idx);
        });
    });

    lbClose.addEventListener('click', closeLb);
    lbBg.addEventListener('click', closeLb);
    lbPrev.addEventListener('click', function () { lbNavigate(-1); });
    lbNext.addEventListener('click', function () { lbNavigate(1); });

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape')     closeLb();
        if (e.key === 'ArrowLeft')  lbNavigate(-1);
        if (e.key === 'ArrowRight') lbNavigate(1);
    });

    /* Touch swipe for lightbox */
    var tsX = 0;
    lightbox.addEventListener('touchstart', function (e) { tsX = e.changedTouches[0].screenX; }, { passive:true });
    lightbox.addEventListener('touchend',   function (e) {
        var diff = tsX - e.changedTouches[0].screenX;
        if (Math.abs(diff) > 50) lbNavigate(diff > 0 ? 1 : -1);
    }, { passive:true });

    /* ===================================================
       12. NOTICE BOARD AUTO-SCROLL
       =================================================== */
    var noticeArea = qs('.notice-scroll-area');
    if (noticeArea) {
        var paused = false;
        var scrollInterval = setInterval(function () {
            if (!paused) {
                noticeArea.scrollTop += 0.8;
                if (noticeArea.scrollTop + noticeArea.clientHeight >= noticeArea.scrollHeight) {
                    noticeArea.scrollTop = 0;
                }
            }
        }, 25);
        noticeArea.addEventListener('mouseenter', function () { paused = true; });
        noticeArea.addEventListener('mouseleave', function () { paused = false; });
        noticeArea.addEventListener('touchstart', function () { paused = true; }, { passive:true });
        noticeArea.addEventListener('touchend',   function () {
            setTimeout(function () { paused = false; }, 2500);
        }, { passive:true });
    }

    /* ===================================================
       13. HERO PARALLAX
       =================================================== */
    var heroBgImg = qs('.hero-bg-img');
    if (heroBgImg && !prefersRed && !isMobile()) {
        window.addEventListener('scroll', function () {
            var sy = window.pageYOffset;
            if (sy < window.innerHeight) {
                heroBgImg.style.transform = 'translateY(' + sy * 0.22 + 'px)';
            }
        }, { passive:true });
    }

    /* ===================================================
       14. ADMISSION SECTION PARALLAX
       =================================================== */
    var admImg = qs('.admission-parallax-img');
    if (admImg && !prefersRed && !isMobile()) {
        var admSection = qs('.admission-section');
        window.addEventListener('scroll', function () {
            if (!admSection) return;
            var r = admSection.getBoundingClientRect();
            if (r.top < window.innerHeight && r.bottom > 0) {
                admImg.style.transform = 'translateY(' + r.top * 0.15 + 'px)';
            }
        }, { passive:true });
    }

    /* ===================================================
       15. BUTTON RIPPLE EFFECT
       =================================================== */
    qsa('.btn-ripple').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            var rect = btn.getBoundingClientRect();
            var ripple = document.createElement('span');
            ripple.style.cssText = [
                'position:absolute',
                'border-radius:50%',
                'background:rgba(255,255,255,0.4)',
                'width:8px', 'height:8px',
                'top:' + (e.clientY - rect.top - 4)  + 'px',
                'left:' + (e.clientX - rect.left - 4) + 'px',
                'transform:scale(0)',
                'animation:rippleAnim 0.55s ease-out forwards',
                'pointer-events:none'
            ].join(';');
            btn.appendChild(ripple);
            setTimeout(function () { ripple.remove(); }, 600);
        });
    });

    /* Inject ripple keyframe dynamically (only once) */
    if (!qs('#ripple-style')) {
        var st = document.createElement('style');
        st.id = 'ripple-style';
        st.textContent = '@keyframes rippleAnim { to { transform:scale(40); opacity:0; } }';
        document.head.appendChild(st);
    }

    /* ===================================================
       16. BACK TO TOP
       =================================================== */
    var btt = qs('#back-to-top');
    window.addEventListener('scroll', function () {
        btt.classList.toggle('show', window.scrollY > 400);
    }, { passive:true });
    btt.addEventListener('click', function () {
        window.scrollTo({ top:0, behavior:'smooth' });
    });

    /* ===================================================
       17. WINDOW RESIZE — close menu
       =================================================== */
    window.addEventListener('resize', function () {
        if (window.innerWidth > 860) toggleMenu(true);
    });

})();

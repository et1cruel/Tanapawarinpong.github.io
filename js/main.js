// ===== Scroll progress bar (injected) =====
const progressBar = document.createElement('div');
progressBar.id = 'scrollProgress';
document.body.prepend(progressBar);
window.addEventListener('scroll', () => {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    progressBar.style.width = scrolled + '%';
    // shrink navbar
    const nav = document.getElementById('navbar');
    if (window.scrollY > 50) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
}, { passive: true });

// ===== Hero blobs & CTA (injected) =====
const hero = document.querySelector('.hero');
if (hero) {
    const b1 = document.createElement('div'); b1.className = 'blob blob1';
    const b2 = document.createElement('div'); b2.className = 'blob blob2';
    hero.prepend(b1, b2);
    // Add CTA button if not present
    if (!hero.querySelector('.hero-cta')) {
        const cta = document.createElement('a');
        cta.href = '#projects'; cta.className = 'hero-cta';
        cta.textContent = 'View My Work →';
        hero.querySelector('div').appendChild(cta);
    }
    // Parallax on mouse move
    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        hero.querySelector('h1').style.transform = `translate(${x * 18}px, ${y * 12}px)`;
        hero.querySelector('.subtitle').style.transform = `translate(${x * 12}px, ${y * 8}px)`;
        const cta = hero.querySelector('.hero-cta');
        if (cta) cta.style.transform = `translate(${x * 8}px, ${y * 6}px)`;
    });
    hero.addEventListener('mouseleave', () => {
        hero.querySelector('h1').style.transform = '';
        hero.querySelector('.subtitle').style.transform = '';
        const cta = hero.querySelector('.hero-cta');
        if (cta) cta.style.transform = '';
    });
    // Subtle parallax on scroll
    window.addEventListener('scroll', () => {
        const offset = window.scrollY * 0.22;
        hero.style.backgroundPosition = `center ${-offset}px`;
    }, { passive: true });
}

// ===== Typewriter for subtitle =====
const subtitleEl = document.querySelector('.hero .subtitle');
if (subtitleEl) {
    const fullText = subtitleEl.textContent.trim();
    subtitleEl.textContent = '';
    subtitleEl.classList.add('typing');
    let i = 0;
    function type() {
        if (i <= fullText.length) {
            subtitleEl.textContent = fullText.slice(0, i);
            i++;
            setTimeout(type, 32);
        } else {
            setTimeout(() => subtitleEl.classList.remove('typing'), 1200);
        }
    }
    setTimeout(type, 1100);
}

// ===== Enhanced reveal observer (all sections) =====
const reveals = document.querySelectorAll('section');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            // stagger children
            const staggerables = entry.target.querySelectorAll('.skill-card, .project-card, .contact-item');
            staggerables.forEach((el, idx) => {
                el.style.animationDelay = (idx * 0.08) + 's';
                el.classList.add('stagger');
                // remove stagger class after animation so hover still works
                setTimeout(() => el.classList.remove('stagger'), 900 + idx * 80);
            });
        }
    });
}, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

reveals.forEach(sec => {
    sec.classList.add('reveal');
    // stagger delay already handled via children
    revealObserver.observe(sec);
});

// Also observe timelines for line draw
document.querySelectorAll('.timeline').forEach(tl => revealObserver.observe(tl));

// ===== Skill bars — animated width + counting % (replaces old observer) =====
const skillBars = document.querySelectorAll('.skill-bar-fill');
const skillCards = document.querySelectorAll('.skill-card');

// inject % counter inside each skill card
skillCards.forEach(card => {
    const bar = card.querySelector('.skill-bar-fill');
    const h3 = card.querySelector('h3');
    if (bar && h3 && !h3.querySelector('.pct')) {
        const span = document.createElement('span');
        span.className = 'pct';
        span.textContent = ' 0%';
        span.style.opacity = '0.0';
        h3.appendChild(span);
    }
});

const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const bar = entry.target;
            const targetW = parseInt(bar.dataset.width, 10);
            bar.style.width = targetW + '%';
            bar.classList.add('is-animated');

            // count up number
            const pctEl = bar.closest('.skill-card')?.querySelector('.pct');
            if (pctEl) {
                pctEl.style.transition = 'opacity 0.3s';
                pctEl.style.opacity = '1';
                let cur = 0;
                const step = Math.max(1, Math.round(targetW / 40));
                const timer = setInterval(() => {
                    cur = Math.min(cur + step, targetW);
                    pctEl.textContent = ' ' + cur + '%';
                    if (cur >= targetW) clearInterval(timer);
                }, 22);
            }
            skillObserver.unobserve(bar);
        }
    });
}, { threshold: 0.5 });
skillBars.forEach(bar => skillObserver.observe(bar));

// ===== Active nav link on scroll =====
const sections = document.querySelectorAll('section, .hero');
const navLinks = document.querySelectorAll('nav a');
window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
        const top = sec.offsetTop - 130;
        if (window.scrollY >= top) current = sec.getAttribute('id');
    });
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
}, { passive: true });

// Smooth scroll for nav + hero CTA with offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                const top = target.getBoundingClientRect().top + window.scrollY - 70;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }
    });
});

// ===== 3D Tilt for project cards =====
document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rx = ((y / rect.height) - 0.5) * -8;
        const ry = ((x / rect.width) - 0.5) * 10;
        card.style.transform = `perspective(700px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
        card.style.transform = '';
    });
});

// ===== Download button =====
const dlBtn = document.getElementById('downloadBtn');
if (dlBtn) {
    dlBtn.addEventListener('click', function(e) {
        e.preventDefault();
        // little confetti burst
        dlBtn.animate([
            { transform: 'scale(1)' },
            { transform: 'scale(0.96)' },
            { transform: 'scale(1.03)' },
            { transform: 'scale(1)' }
        ], { duration: 420, easing: 'cubic-bezier(0.34,1.56,0.64,1)' });
        // keep original placeholder behavior but softer
        const toast = document.createElement('div');
        toast.textContent = 'Please replace this with your actual resume PDF link!';
        Object.assign(toast.style, {
            position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%) translateY(20px)',
            background: '#1a5c2a', color: '#fff', padding: '12px 20px', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.2)', fontSize: '0.92rem', zIndex: '9999',
            opacity: '0', transition: 'opacity 0.3s, transform 0.3s', pointerEvents: 'none'
        });
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(10px)';
            setTimeout(() => toast.remove(), 300);
        }, 2600);
    });
}

// ===== Respect prefers-reduced-motion =====
if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('is-visible'));
}

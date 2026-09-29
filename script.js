/* =========================================================
   DREAM DIAMOND — SUNIL VISHWAKARMA — SCRIPT.JS
   Shared by index.html and products.html
========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* =====================================================
     0. CONFIG — EDIT THESE VALUES
  ===================================================== */
  const CONFIG = {
    // WhatsApp number: country code + number, NO + sign, NO spaces
    whatsappNumber: '7470701265', // TODO: replace with real WhatsApp number

    // Web3Forms access key (free) — https://web3forms.com
    web3formsAccessKey: '440a2610-e1d5-4669-b000-3b2b6fca9c1f' // TODO: replace
  };


  /* =====================================================
     1. MOBILE NAVIGATION TOGGLE
  ===================================================== */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('main-nav');

  function closeNav() {
    if (!mainNav || !hamburger) return;
    mainNav.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', () => {
      const isActive = mainNav.classList.toggle('active');
      hamburger.classList.toggle('active');
      hamburger.setAttribute('aria-expanded', String(isActive));
    });
    document.querySelectorAll('.nav-link, .nav-cta').forEach(link => {
      link.addEventListener('click', closeNav);
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 860) closeNav();
    });
  }


  /* =====================================================
     2. PRODUCT CARD 3D TILT EFFECT
  ===================================================== */
  const MAX_TILT = 8;
  const isTouch = window.matchMedia('(hover: none)').matches;

  if (!isTouch) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      const inner = card.querySelector('.product-card-inner');
      if (!inner) return;

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateY = ((x - centerX) / centerX) * MAX_TILT;
        const rotateX = -((y - centerY) / centerY) * MAX_TILT;
        inner.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.03, 1.03, 1.03)`;
      });

      card.addEventListener('mouseleave', () => {
        inner.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      });
    });
  }


  /* =====================================================
     3. CONTACT MODAL (only on index.html)
  ===================================================== */
  const floatingCta = document.getElementById('floatingCta');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');

  function openModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (floatingCta && modalOverlay) {
    floatingCta.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modalOverlay.classList.contains('active')) closeModal();
    });
  }


  /* =====================================================
     4. FORM SUBMISSION — WEB3FORMS (only on index.html)
  ===================================================== */
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm && formStatus) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      formStatus.textContent = '';
      formStatus.className = 'form-status';

      if (!CONFIG.web3formsAccessKey || CONFIG.web3formsAccessKey === 'wrong') {
        formStatus.textContent = 'Form not yet configured. Add your Web3Forms access key in script.js.';
        formStatus.classList.add('error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry';
        return;
      }

      const formData = new FormData(contactForm);
      formData.append('access_key', CONFIG.web3formsAccessKey);

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });
        const result = await response.json();

        if (result.success) {
          formStatus.textContent = 'Thank you! We\'ll contact you shortly.';
          formStatus.classList.add('success');
          contactForm.reset();
          setTimeout(closeModal, 2000);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (error) {
        formStatus.textContent = 'Something went wrong. Please try WhatsApp instead.';
        formStatus.classList.add('error');
        console.error('Form submission error:', error);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit Enquiry';
      }
    });
  }


  /* =====================================================
     5. "BUY VIA WHATSAPP" — works on both pages
  ===================================================== */
  function openWhatsAppOrder(productName) {
    const message = `Hi! I'm interested in *${productName}* from Dream Diamond - Sunil Vishwakarma. Could you share more details and pricing?`;
    const url = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener');
  }

  document.querySelectorAll('.btn-whatsapp').forEach((btn) => {
    btn.addEventListener('click', () => {
      openWhatsAppOrder(btn.getAttribute('data-product') || 'your products');
    });
  });

  // Floating WhatsApp button on products.html (direct chat)
  const floatingWhatsApp = document.getElementById('floatingWhatsApp');
  if (floatingWhatsApp) {
    floatingWhatsApp.addEventListener('click', () => {
      const msg = 'Hi! I visited your website and I would like to know more about the products.';
      window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    });
  }


  /* =====================================================
     6. CATALOG CATEGORY TABS (products.html)
  ===================================================== */
  const catTabs = document.querySelectorAll('.cat-tab');
  const catGrids = document.querySelectorAll('[data-cat-panel]');

  if (catTabs.length && catGrids.length) {
    function showCategory(name) {
      catTabs.forEach(t => t.classList.toggle('active', t.getAttribute('data-cat') === name));
      catGrids.forEach(g => { g.hidden = g.getAttribute('data-cat-panel') !== name; });
    }
    catTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        showCategory(tab.getAttribute('data-cat'));
        history.replaceState(null, '', '#' + tab.getAttribute('data-cat'));
      });
    });
    // Open the category from the URL hash if present (e.g. products.html#personal)
    const initial = location.hash.replace('#', '');
    if (initial && document.querySelector(`[data-cat-panel="${initial}"]`)) showCategory(initial);
  }


  /* =====================================================
     7. IMAGE LIGHTBOX (products.html) — tap a card to zoom
  ===================================================== */
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    const lightboxImg = lightbox.querySelector('img');
    document.querySelectorAll('.catalog-card-img').forEach(btn => {
      btn.addEventListener('click', () => {
        lightboxImg.src = btn.getAttribute('data-full');
        lightbox.classList.add('active');
      });
    });
    lightbox.addEventListener('click', () => lightbox.classList.remove('active'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') lightbox.classList.remove('active');
    });
  }


  /* =====================================================
     8. FOOTER YEAR + HEADER SHADOW
  ===================================================== */
  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 4px 20px rgba(20,50,42,0.08)' : 'none';
    });
  }

});

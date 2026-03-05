document.addEventListener('DOMContentLoaded', () => {

  // Sticky Navbar
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile Menu Toggle
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  mobileToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Click outside to close mobile menu
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-container') && navLinks.classList.contains('active')) {
      navLinks.classList.remove('active');
    }
  });

  // Smooth Scroll Behavior for Nav links
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(link => {
    link.addEventListener('click', function (e) {
      // Don't act on non-hash links
      if (this.getAttribute('href') === '#') return;

      e.preventDefault();
      const targetId = this.getAttribute('href');
      const targetElement = document.querySelector(targetId);

      navLinks.classList.remove('active'); // Close mobile menu

      if (targetElement) {
        // Offset for sticky header
        const offsetTop = targetElement.getBoundingClientRect().top + window.scrollY - 80;

        window.scrollTo({
          top: offsetTop,
          behavior: 'smooth'
        });
      }
    });
  });

  // Scroll Reveal Animations setup using IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

  const revealCallback = (entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Stop observing once animated to prevent repeating un-reveal
        observer.unobserve(entry.target);
      }
    });
  };

  const revealOptions = {
    threshold: 0.1, // Trigger when 10% of element is visible
    rootMargin: "0px 0px -50px 0px"
  };

  const revealObserver = new IntersectionObserver(revealCallback, revealOptions);

  revealElements.forEach(el => {
    revealObserver.observe(el);
  });

  // Parallax effect for Hero background
  const parallaxBg = document.querySelector('.parallax-bg');
  window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    // Simple parallax translateY matching scroll speed faintly
    if (parallaxBg) {
      parallaxBg.style.transform = `translateY(${scrollPos * 0.4}px)`;
    }
  });

  // Language Translation Logic
  const languageSelector = document.querySelector('.language-selector');
  if (languageSelector) {
    languageSelector.addEventListener('change', (e) => {
      const selectedLanguage = e.target.value;
      const googleTranslateCombo = document.querySelector('.goog-te-combo');
      if (googleTranslateCombo) {
        googleTranslateCombo.value = selectedLanguage;
        googleTranslateCombo.dispatchEvent(new Event('change'));
      }
    });

    // Automatic Language Selection based on Location
    const setLanguageByLocation = async () => {
      // Only auto-translate if the user hasn't manually set a preference
      if (document.cookie.indexOf('googtrans=') === -1) {
        try {
          const response = await fetch('https://ipapi.co/json/');
          const data = await response.json();
          let lang = 'en';

          if (data.country_code === 'IN') {
            const region = data.region ? data.region.toLowerCase() : '';
            if (region.includes('tamil')) lang = 'ta';
            else if (region.includes('karnataka')) lang = 'kn';
            else if (region.includes('kerala')) lang = 'ml';
            else if (region.includes('andhra') || region.includes('telangana')) lang = 'te';
            else if (region.includes('gujarat')) lang = 'gu';
            else if (region.includes('maharashtra')) lang = 'mr';
            else if (region.includes('bengal')) lang = 'bn';
            else if (region.includes('punjab')) lang = 'pa';
            else lang = 'hi'; // Default to Hindi for other Indian states
          } else if (['ES', 'MX', 'AR', 'CO', 'PE', 'VE', 'CL'].includes(data.country_code)) {
            lang = 'es';
          } else if (['FR', 'BE', 'CH', 'CA'].includes(data.country_code)) {
            lang = 'fr';
          } else if (['CN', 'TW', 'HK', 'SG'].includes(data.country_code)) {
            lang = 'zh-CN';
          } else if (data.country_code === 'JP') {
            lang = 'ja';
          }

          if (lang !== 'en') {
            const langNames = {
              'ta': 'Tamil', 'kn': 'Kannada', 'ml': 'Malayalam', 'te': 'Telugu',
              'gu': 'Gujarati', 'mr': 'Marathi', 'bn': 'Bengali', 'pa': 'Punjabi',
              'hi': 'Hindi', 'es': 'Español', 'fr': 'Français', 'zh-CN': 'Chinese',
              'ja': 'Japanese'
            };
            const langName = langNames[lang] || lang;

            // Ask the user before translating
            const userWantsTranslation = confirm("Do you want to change the site in local language?");

            if (userWantsTranslation) {
              languageSelector.value = lang;

              // Periodically check if Google Translate widget is loaded before triggering
              const tryTranslate = setInterval(() => {
                const googleTranslateCombo = document.querySelector('.goog-te-combo');
                if (googleTranslateCombo) {
                  googleTranslateCombo.value = lang;
                  googleTranslateCombo.dispatchEvent(new Event('change'));
                  clearInterval(tryTranslate);
                }
              }, 500);

              // Stop trying after 5 seconds to prevent infinite looping
              setTimeout(() => clearInterval(tryTranslate), 5000);
            }
          }
        } catch (error) {
          console.error("Could not fetch location for auto-translation:", error);
        }
      } else {
        // If a cookie exists, update the selector UI to match the saved language
        let match = document.cookie.match(/googtrans=\/[a-z]{2,2}\/([a-zA-Z\-]+)/);
        if (match && match[1]) {
          let savedLang = match[1];
          if (savedLang === 'zh-CN') savedLang = 'zh-CN';
          languageSelector.value = savedLang;
        }
      }
    };

    setLanguageByLocation();
  }

  // Gallery Modal Popup
  const modal = document.getElementById("imageModal");
  if (modal) {
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.querySelector(".close-modal");

    // Add click to all gallery images
    document.querySelectorAll('.gallery-img').forEach(img => {
      img.addEventListener('click', function () {
        modal.classList.add('show');
        modalImg.src = this.src;
      });
    });

    // Close when clicking X
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('show');
    });

    // Close when clicking outside image
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('show');
      }
    });
    // Prevent dragging or right clicking the images
    document.querySelectorAll('.gallery-img, #modalImg').forEach(img => {
      img.addEventListener('contextmenu', e => e.preventDefault());
      img.addEventListener('dragstart', e => e.preventDefault());
    });
  }
});

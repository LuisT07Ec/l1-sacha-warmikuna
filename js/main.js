/* ==========================================================================
   SACHA WARMIKUNA - MAIN CONVERSION & A/B TESTING ENGINE
   Integración estricta con sacha-warmikuna-copy-deck.md y sacha-warmikuna-visual-guide.md
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------------------------
    // 1. ESTADO DE PRUEBAS A/B (PROTOCOL TESTING)
    // ----------------------------------------------------------------------
    const abState = {
        headline: localStorage.getItem('sw_ab_headline') || 'variant_a',
        ctaColor: localStorage.getItem('sw_ab_cta') || 'red',
        formFields: localStorage.getItem('sw_ab_form') || 'full'
    };

    const headlines = {
        variant_a: 'Vive la cultura Cayambi: Desconéctate del ruido y conecta con la sabiduría ancestral de las Mamas en Sacha Warmikuna.',
        variant_b: 'Tours en Otavalo con Sacha Warmikuna: Inmersión cultural, bordados y medicina ancestral en Pijal.'
    };

    const puvTitleElement = document.getElementById('puvTitle');
    const leadForm = document.getElementById('leadForm');
    const emailGroup = document.getElementById('emailGroup');
    const travelDateGroup = document.getElementById('travelDateGroup');
    const thankYouModal = document.getElementById('thankYouModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const userNameSpan = document.getElementById('userNameSpan');

    // Panel A/B Elements
    const abToggleBtn = document.getElementById('abToggleBtn');
    const abPanel = document.getElementById('abPanel');
    const abSelectHeadline = document.getElementById('abSelectHeadline');
    const abSelectCta = document.getElementById('abSelectCta');
    const abSelectForm = document.getElementById('abSelectForm');

    // ----------------------------------------------------------------------
    // 2. APLICAR VARIANTES A/B
    // ----------------------------------------------------------------------
    function applyABVariants() {
        // Actualizar Titular PUV
        if (puvTitleElement && headlines[abState.headline]) {
            puvTitleElement.innerHTML = headlines[abState.headline];
        }

        // Actualizar Clase de Color de CTA en el Body
        document.body.classList.remove('cta-variant-green', 'cta-variant-terracota');
        if (abState.ctaColor === 'green') {
            document.body.classList.add('cta-variant-green');
        } else if (abState.ctaColor === 'terracota') {
            document.body.classList.add('cta-variant-terracota');
        }

        // Actualizar Campos del Formulario (3 campos vs 4 campos)
        if (travelDateGroup) {
            if (abState.formFields === 'extended') {
                travelDateGroup.style.display = 'block';
            } else {
                travelDateGroup.style.display = 'none';
            }
        }

        // Sincronizar Selects del Panel A/B
        if (abSelectHeadline) abSelectHeadline.value = abState.headline;
        if (abSelectCta) abSelectCta.value = abState.ctaColor;
        if (abSelectForm) abSelectForm.value = abState.formFields;
    }

    applyABVariants();

    // Event Listeners Panel A/B
    if (abToggleBtn && abPanel) {
        abToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            abPanel.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!abPanel.contains(e.target) && e.target !== abToggleBtn) {
                abPanel.classList.remove('active');
            }
        });
    }

    if (abSelectHeadline) {
        abSelectHeadline.addEventListener('change', (e) => {
            abState.headline = e.target.value;
            localStorage.setItem('sw_ab_headline', abState.headline);
            applyABVariants();
        });
    }

    if (abSelectCta) {
        abSelectCta.addEventListener('change', (e) => {
            abState.ctaColor = e.target.value;
            localStorage.setItem('sw_ab_cta', abState.ctaColor);
            applyABVariants();
        });
    }

    if (abSelectForm) {
        abSelectForm.addEventListener('change', (e) => {
            abState.formFields = e.target.value;
            localStorage.setItem('sw_ab_form', abState.formFields);
            applyABVariants();
        });
    }

    // ----------------------------------------------------------------------
    // 3. VALIDACIÓN Y CAPTURA DE LEADS
    // ----------------------------------------------------------------------
    const inputName = document.getElementById('fullName');
    const inputPhone = document.getElementById('phone');
    const inputEmail = document.getElementById('email');
    const inputTravelDate = document.getElementById('travelDate');
    const countryCodeSelect = document.getElementById('countryCode');

    function showError(inputElement, message) {
        inputElement.classList.add('error');
        const parent = inputElement.closest('.form-group');
        let errorDiv = parent.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            parent.appendChild(errorDiv);
        }
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function clearError(inputElement) {
        inputElement.classList.remove('error');
        const parent = inputElement.closest('.form-group');
        const errorDiv = parent.querySelector('.error-message');
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    [inputName, inputPhone, inputEmail].forEach(input => {
        if (input) {
            input.addEventListener('input', () => clearError(input));
        }
    });

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    if (leadForm) {
        leadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            let isValid = true;

            // Validar Nombre
            const nameVal = inputName.value.trim();
            if (!nameVal || nameVal.length < 3) {
                showError(inputName, 'Por favor ingresa tu nombre completo.');
                isValid = false;
            }

            // Validar WhatsApp
            const phoneVal = inputPhone.value.trim();
            if (!phoneVal || phoneVal.length < 7 || !/^\d+$/.test(phoneVal.replace(/\s+/g, ''))) {
                showError(inputPhone, 'Ingresa un número de WhatsApp válido.');
                isValid = false;
            }

            // Validar Email
            const emailVal = inputEmail.value.trim();
            if (!emailVal || !validateEmail(emailVal)) {
                showError(inputEmail, 'Por favor ingresa un correo electrónico válido.');
                isValid = false;
            }

            if (!isValid) return;

            const countryCode = countryCodeSelect ? countryCodeSelect.value : '+593';
            const fullPhone = `${countryCode} ${phoneVal}`;
            const leadData = {
                name: nameVal,
                phone: fullPhone,
                email: emailVal,
                travelDate: inputTravelDate && abState.formFields === 'extended' ? inputTravelDate.value : 'No especificada',
                abVariant: `Headline: ${abState.headline} | CTA Color: ${abState.ctaColor} | Form: ${abState.formFields}`,
                timestamp: new Date().toISOString()
            };

            console.log('🚀 [LEAD REGISTRADO]:', leadData);

            // Disparo de Píxeles de Rastreo (Meta Pixel / GA4)
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Reserva Sacha Warmikuna',
                    currency: 'USD',
                    value: 0.00
                });
            } else {
                console.log('📌 [META PIXEL MOCK] fbq("track", "Lead")');
            }

            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    'event_category': 'Engagement',
                    'event_label': 'Form Lead Sacha Warmikuna'
                });
            } else {
                console.log('📌 [GA4 MOCK] gtag("event", "generate_lead")');
            }

            // Actualizar Modal Thank You Page
            const firstName = nameVal.split(' ')[0];
            if (userNameSpan) {
                userNameSpan.textContent = firstName;
            }

            // Enlace de WhatsApp directo para confirmación inmediata (Thank You Page Action)
            const directWaBtn = document.getElementById('directWaBtn');
            if (directWaBtn) {
                const waMessage = encodeURIComponent(`¡Hola Rocío! Acabo de registrarme en la web. Mi nombre es ${nameVal}. Quisiera confirmar mi visita a la Experiencia Sacha Warmikuna.`);
                directWaBtn.href = `https://wa.me/593984745329?text=${waMessage}`;
            }

            // Abrir Modal de Agradecimiento
            if (thankYouModal) {
                thankYouModal.classList.add('active');
            }

            leadForm.reset();
        });
    }

    if (modalCloseBtn && thankYouModal) {
        modalCloseBtn.addEventListener('click', () => {
            thankYouModal.classList.remove('active');
        });

        thankYouModal.addEventListener('click', (e) => {
            if (e.target === thankYouModal) {
                thankYouModal.classList.remove('active');
            }
        });
    }

    // Reproductor de Video Modal
    const videoHeroCard = document.getElementById('videoHeroCard');
    const videoModal = document.getElementById('videoModal');
    const videoCloseBtn = document.getElementById('videoCloseBtn');
    const iframePlayer = document.getElementById('iframePlayer');

    if (videoHeroCard && videoModal) {
        videoHeroCard.addEventListener('click', () => {
            if (iframePlayer) {
                iframePlayer.src = "https://www.youtube-nocookie.com/embed/ScMzIvxBSi4?autoplay=1&rel=0";
            }
            videoModal.classList.add('active');
            console.log('🎥 [PIXEL TRACKING] Video Play Event');
        });
    }

    if (videoCloseBtn && videoModal) {
        videoCloseBtn.addEventListener('click', () => {
            videoModal.classList.remove('active');
            if (iframePlayer) iframePlayer.src = "";
        });

        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                videoModal.classList.remove('active');
                if (iframePlayer) iframePlayer.src = "";
            }
        });
    }
});

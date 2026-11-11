/* ==========================================================================
   SACHA WARMIKUNA - MOTOR DE CONVERSIÓN & LÓGICA DE NEGOCIO (VERSIÓN 02)
   Diseñado para el sistema Andean Heritage, validación LOPDP y rastreo analítico
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------------------------------------------------
    // 1. SELECTOR DINÁMICO DE TARIFAS Y FECHA MÍNIMA
    // ----------------------------------------------------------------------
    const leadGroupSize = document.getElementById('leadGroupSize');
    const leadDate = document.getElementById('leadDate');

    // Establecer fecha mínima como hoy para el datepicker
    if (leadDate) {
        const today = new Date().toISOString().split('T')[0];
        leadDate.setAttribute('min', today);
    }

    // Función global accesible desde las tarjetas de tarifas
    window.selectPricingTier = function(tierValue) {
        if (leadGroupSize) {
            leadGroupSize.value = tierValue;
        }
        const bookingSection = document.getElementById('reservar');
        if (bookingSection) {
            bookingSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // ----------------------------------------------------------------------
    // 2. CONTROL DEL MENÚ MÓVIL (DRAWER)
    // ----------------------------------------------------------------------
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (mobileMenuBtn && mobileDrawer) {
        mobileMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            mobileDrawer.classList.toggle('hidden');
        });

        // Cerrar menú al hacer clic en cualquier enlace
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileDrawer.classList.add('hidden');
            });
        });

        // Cerrar al hacer clic fuera del menú
        document.addEventListener('click', (e) => {
            if (!mobileDrawer.contains(e.target) && e.target !== mobileMenuBtn) {
                mobileDrawer.classList.add('hidden');
            }
        });
    }

    // ----------------------------------------------------------------------
    // 3. REPRODUCTOR DE VIDEO COMUNITARIO (MODAL)
    // ----------------------------------------------------------------------
    const openVideoBtn = document.getElementById('openVideoBtn');
    const videoModal = document.getElementById('videoModal');
    const closeVideoBtn = document.getElementById('closeVideoBtn');
    const videoPlayer = document.getElementById('communityVideoPlayer');

    window.openVideoModal = function() {
        if (videoModal) {
            videoModal.classList.remove('hidden');
            if (videoPlayer) {
                videoPlayer.play().catch(() => {});
            }
        }
    };

    function closeVideo() {
        if (videoModal) {
            videoModal.classList.add('hidden');
            if (videoPlayer) {
                videoPlayer.pause();
                videoPlayer.currentTime = 0;
            }
        }
    }

    if (openVideoBtn) {
        openVideoBtn.addEventListener('click', window.openVideoModal);
    }

    if (closeVideoBtn) {
        closeVideoBtn.addEventListener('click', closeVideo);
    }

    if (videoModal) {
        videoModal.addEventListener('click', (e) => {
            if (e.target === videoModal) {
                closeVideo();
            }
        });
    }

    // ----------------------------------------------------------------------
    // 4. CAPTURA DE LEADS & VALIDACIÓN RIGUROSA (LOPDP)
    // ----------------------------------------------------------------------
    const bookingForm = document.getElementById('bookingLeadForm');
    const inputName = document.getElementById('leadFullName');
    const inputPhone = document.getElementById('leadPhone');
    const inputEmail = document.getElementById('leadEmail');
    const inputDate = document.getElementById('leadDate');
    const inputGroup = document.getElementById('leadGroupSize');
    const inputConsent = document.getElementById('leadConsent');

    // Elementos de error
    const errName = document.getElementById('errorName');
    const errPhone = document.getElementById('errorPhone');
    const errEmail = document.getElementById('errorEmail');
    const errDate = document.getElementById('errorDate');
    const errConsent = document.getElementById('errorConsent');

    // Modal de Agradecimiento
    const thankYouModal = document.getElementById('thankYouModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const userNameSpan = document.getElementById('userNameSpan');
    const modalWhatsAppDirect = document.getElementById('modalWhatsAppDirect');

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function clearErrors() {
        [errName, errPhone, errEmail, errDate, errConsent].forEach(el => {
            if (el) el.classList.add('hidden');
        });
        [inputName, inputPhone, inputEmail, inputDate].forEach(input => {
            if (input) input.classList.remove('border-red-500', 'ring-1', 'ring-red-500');
        });
    }

    // Limpiar errores en tiempo real
    if (inputName) inputName.addEventListener('input', () => { if (errName) errName.classList.add('hidden'); inputName.classList.remove('border-red-500'); });
    if (inputPhone) inputPhone.addEventListener('input', () => { if (errPhone) errPhone.classList.add('hidden'); inputPhone.classList.remove('border-red-500'); });
    if (inputEmail) inputEmail.addEventListener('input', () => { if (errEmail) errEmail.classList.add('hidden'); inputEmail.classList.remove('border-red-500'); });
    if (inputDate) inputDate.addEventListener('change', () => { if (errDate) errDate.classList.add('hidden'); inputDate.classList.remove('border-red-500'); });
    if (inputConsent) inputConsent.addEventListener('change', () => { if (errConsent) errConsent.classList.add('hidden'); });

    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            clearErrors();

            let isValid = true;

            // Validar Nombre
            const nameVal = inputName ? inputName.value.trim() : '';
            if (!nameVal || nameVal.length < 3) {
                if (errName) errName.classList.remove('hidden');
                if (inputName) inputName.classList.add('border-red-500');
                isValid = false;
            }

            // Validar Teléfono (WhatsApp)
            const rawPhone = inputPhone ? inputPhone.value.trim().replace(/\s+/g, '') : '';
            if (!rawPhone || rawPhone.length < 7 || !/^\d+$/.test(rawPhone)) {
                if (errPhone) errPhone.classList.remove('hidden');
                if (inputPhone) inputPhone.classList.add('border-red-500');
                isValid = false;
            }

            // Validar Email
            const emailVal = inputEmail ? inputEmail.value.trim() : '';
            if (!emailVal || !validateEmail(emailVal)) {
                if (errEmail) errEmail.classList.remove('hidden');
                if (inputEmail) inputEmail.classList.add('border-red-500');
                isValid = false;
            }

            // Validar Fecha
            const dateVal = inputDate ? inputDate.value : '';
            if (!dateVal) {
                if (errDate) errDate.classList.remove('hidden');
                if (inputDate) inputDate.classList.add('border-red-500');
                isValid = false;
            }

            // Validar Consentimiento LOPDP
            if (inputConsent && !inputConsent.checked) {
                if (errConsent) errConsent.classList.remove('hidden');
                isValid = false;
            }

            if (!isValid) return;

            const groupVal = inputGroup ? inputGroup.value : '1-3';
            const fullPhone = `+593 ${rawPhone}`;

            const leadData = {
                nombre: nameVal,
                telefono: fullPhone,
                email: emailVal,
                fecha: dateVal,
                grupo: groupVal,
                consentimientoLOPDP: true,
                fechaRegistro: new Date().toISOString()
            };

            console.log('🚀 [LEAD REGISTRADO EN SACHA WARMIKUNA V02]:', leadData);

            // Disparo de Eventos de Analítica y Pauta
            if (typeof fbq === 'function') {
                fbq('track', 'Lead', {
                    content_name: 'Experiencia Sacha Warmikuna Pijal',
                    currency: 'USD',
                    value: 40.00
                });
            }

            if (typeof gtag === 'function') {
                gtag('event', 'generate_lead', {
                    event_category: 'Reservas',
                    event_label: `Grupo ${groupVal} - ${nameVal}`
                });
            }

            // Construir enlace directo a WhatsApp personalizado para Rocío Inlago
            const firstName = nameVal.split(' ')[0];
            const groupLabels = {
                '1-3': '1 a 3 personas ($40 / p)',
                '4-9': '4 a 9 personas ($36 / p)',
                '10-19': '10 a 19 personas ($32 / p)',
                '20+': '20+ personas ($28 / p)'
            };
            const groupText = groupLabels[groupVal] || groupVal;

            const whatsappMessage = encodeURIComponent(
                `¡Hola Rocío! Acabo de registrar mi interés en la web para la Experiencia Sacha Warmikuna en Pijal:\n\n` +
                `👤 Nombre: ${nameVal}\n` +
                `📅 Fecha tentativa: ${dateVal}\n` +
                `👥 Grupo: ${groupText}\n` +
                `📱 Teléfono: ${fullPhone}\n` +
                `📧 Correo: ${emailVal}\n\n` +
                `Quisiera confirmar la disponibilidad para vivir esta experiencia comunitaria. ¡Muchas gracias!`
            );

            const directWhatsAppUrl = `https://wa.me/593984745329?text=${whatsappMessage}`;

            // Configurar Modal Thank You
            if (userNameSpan) {
                userNameSpan.textContent = firstName;
            }
            if (modalWhatsAppDirect) {
                modalWhatsAppDirect.href = directWhatsAppUrl;
            }

            // Mostrar Modal
            if (thankYouModal) {
                thankYouModal.classList.remove('hidden');
            }

            bookingForm.reset();
        });
    }

    // Cerrar Modal Thank You
    if (modalCloseBtn && thankYouModal) {
        modalCloseBtn.addEventListener('click', () => {
            thankYouModal.classList.add('hidden');
        });

        thankYouModal.addEventListener('click', (e) => {
            if (e.target === thankYouModal) {
                thankYouModal.classList.add('hidden');
            }
        });
    }

    // Cerrar modales con tecla Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeVideo();
            if (thankYouModal) thankYouModal.classList.add('hidden');
            if (mobileDrawer) mobileDrawer.classList.add('hidden');
        }
    });

});

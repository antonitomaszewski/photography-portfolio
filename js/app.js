// Treść strony jest już w HTML (generuje ją build.js).
// Ten plik obsługuje tylko lightbox galerii i wysyłkę formularza kontaktowego.

function initLightbox() {
    GLightbox({
        touchNavigation: true,
        loop: true,
        slideEffect: 'slide',
        moreLength: 0
    });

    // Kliknięcie w kategorię otwiera jej galerię od pierwszego zdjęcia
    document.querySelectorAll('.series-item').forEach(item => {
        item.addEventListener('click', () => {
            const seriesIndex = item.dataset.series;
            const seriesGallery = document.querySelector(`#series-${seriesIndex}`);
            const firstLink = seriesGallery.querySelector('a');
            firstLink.click();
        });
    });
}

// Formularz wysyłamy w tle do Web3Forms, żeby nie przenosić na ich stronę z potwierdzeniem.
// Bez JS formularz działa jako zwykły POST.
function initContactForms() {
    document.querySelectorAll('.contact-form').forEach(form => {
        const status = form.querySelector('.form-status');
        const button = form.querySelector('button');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            button.disabled = true;
            status.className = 'form-status';
            status.textContent = 'Wysyłam…';

            try {
                const response = await fetch(form.action, {
                    method: 'POST',
                    headers: { 'Accept': 'application/json' },
                    body: new FormData(form),
                });
                const result = await response.json();
                if (!result.success) throw new Error(result.message);
                form.reset();
                status.classList.add('form-status--ok');
                status.textContent = 'Dziękuję! Odezwę się najszybciej, jak to możliwe.';
            } catch (error) {
                status.classList.add('form-status--error');
                status.textContent = 'Nie udało się wysłać. Spróbuj ponownie albo napisz bezpośrednio na e-mail.';
            } finally {
                button.disabled = false;
            }
        });
    });
}

function init() {
    initLightbox();
    initContactForms();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

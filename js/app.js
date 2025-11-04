const THEME_PATH = `data`;

// Główna funkcja inicjalizująca
async function init() {
    try {
        // Załaduj dane tematu
        const response = await fetch(`${THEME_PATH}/content.json`);
        
        const data = await response.json();
        
        // Renderuj stronę
        renderFirstImage(data.backgrounds);
        renderSiteTitle(data.title, data.subtitle);
        renderNavigation(data.navigation);
        renderSections(data);
        initPhotoSwipe();
        
        // Ustaw tytuł strony
        document.title = data.title || 'Portfolio';
        
    } catch (error) {
        console.error('Błąd ładowania danych:', error);
        document.body.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h1>Błąd ładowania</h1>
                <p>Nie można załadować danych tematu "${CONFIG.theme}"</p>
            </div>
        `;
    }
}


function renderFirstImage(backgrounds) {
    const hero = document.getElementById('hero');
    hero.style.backgroundImage = `url('${THEME_PATH}/images/${backgrounds[2]}')`;
}
function renderSiteTitle(title, subtitle) {
    document.getElementById('main-title').textContent = title;
    document.getElementById('subtitle').textContent = subtitle;
}

// Renderuj nawigację
function renderNavigation(items) {
    const nav = document.getElementById('main-nav');
    nav.innerHTML = items.map(item => 
        `<a href="#${item.toLowerCase()}">${item}</a>`
    ).join('');
}

// Renderuj sekcje z treścią i tłami
function renderSections(data) {
    const content = document.getElementById('content');
    let html = '';
    
    let bgIndex = 0;
    
    for (const [key, section] of Object.entries(data.sections)) {
        if (key === 'about') {
            html += renderAbout(section);
        } else if (key === 'portfolio') {
            html += renderPortfolio(section, data.portfolio_images);
        } else if (key === 'series') {
            html += renderSeries(section, data.series);
        } else {
            html += `
                <section class="content-section" id="${key}">
                    <h2>${section.title}</h2>
                    <div>${section.content}</div>
                </section>
            `;
        }
        if (bgIndex < data.backgrounds.length) {
            const bgPath = `${THEME_PATH}/images/${data.backgrounds[bgIndex]}`;
            html += `
                <div class="background-section" style="background-image: url('${bgPath}')"></div>
            `;
            bgIndex++;
        }
    }
    
    content.innerHTML = html;
}

function renderAbout(section) {
    return `
        <section class="content-section" id="about">
            <h2>${section.title}</h2>
            <div class="about-content">
                <div class="profile-image">
                    <img src="${THEME_PATH}/images/profile.jpg" alt="Antoni Tomaszewski">
                </div>
                <div>${section.content}</div>
            </div>
        </section>
    `;
}

function renderPortfolio(section, portfolioImages) {
    const imagesGrid = portfolioImages.map((image, index) => 
        `<a href="${THEME_PATH}/images/${image.src}" class="glightbox">
            <img src="${THEME_PATH}/images/${image.src}" alt="${image.caption}">
        </a>`
    ).join('');

    return `
        <section class="content-section" id="portfolio">
            <h2>${section.title}</h2>
            <div class="portfolio-content">
                <div>${section.content}</div>
                <div class="lightbox-gallery">${imagesGrid}</div>
            </div>
        </section>
    `;
}

function renderSeries(section, seriesData) {
    const seriesGrid = seriesData.map((serie, index) => 
        `<div class="series-item" data-series="${index}">
            <img src="${THEME_PATH}/images/${serie.thumbnail}" alt="${serie.title}">
            <h3>${serie.title}</h3>
            <div class="series-gallery" id="series-${index}" style="display: none;">
                ${serie.images.map(image => 
                    `<a href="${THEME_PATH}/images/${image.src}" class="glightbox" data-gallery="series-${index}">
                        <img src="${THEME_PATH}/images/${image.src}" alt="${image.caption}">
                    </a>`
                ).join('')}
            </div>
        </div>`
    ).join('');

    return `
        <section class="content-section" id="series">
            <h2>${section.title}</h2>
            <div class="series-content">
                <div>${section.content}</div>
                <div class="series-grid">
                    ${seriesGrid}
                </div>
            </div>
        </section>
    `;
}

 function initPhotoSwipe() {
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        slideEffect: 'slide',
        moreLength: 0
    });
    
    // Event listeners dla series
    document.querySelectorAll('.series-item').forEach(item => {
        item.addEventListener('click', () => {
            const seriesIndex = item.dataset.series;
            const seriesGallery = document.querySelector(`#series-${seriesIndex}`);
            const firstLink = seriesGallery.querySelector('a');
            firstLink.click();
        });
    });
}



// Uruchom aplikację gdy DOM jest gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
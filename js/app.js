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
        renderSections(data.sections, data.backgrounds);
        
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
function renderSections(sections, backgrounds) {
    const content = document.getElementById('content');
    let html = '';
    
    let bgIndex = 0;
    
    for (const [key, section] of Object.entries(sections)) {
        // Specjalne renderowanie dla About
        if (key === 'about') {
            html += renderAbout(section);
        } else {
            // Sekcja z treścią (40:60)
            html += `
                <section class="content-section" id="${key}">
                    <h2>${section.title}</h2>
                    <div>${section.content}</div>
                </section>
            `;
        }
        
        // Sekcja ze zdjęciem (jeśli są jeszcze backgrounds)
        if (bgIndex < backgrounds.length) {
            const bgPath = `${THEME_PATH}/images/${backgrounds[bgIndex]}`;
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

// Uruchom aplikację gdy DOM jest gotowy
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
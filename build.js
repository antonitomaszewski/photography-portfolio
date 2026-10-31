// Generuje gotowy index.html z template.html + data/content.json.
// Dzięki temu cała treść jest w HTML (dobre dla Google), a JS obsługuje tylko lightbox.
//
// Użycie: node build.js

const fs = require('fs');

const IMAGES = 'data/images';
const data = JSON.parse(fs.readFileSync('data/content.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');

// Escapowanie tekstu wstawianego do atrybutów (alt, title)
const esc = text => String(text)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const img = path => `${IMAGES}/${path}`;

function renderNavigation(sections) {
    return sections.map(section =>
        `        <a href="#${section.id}">${section.nav}</a>`
    ).join('\n');
}

function renderAbout(section) {
    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="about-content">
                <div class="profile-image">
                    <img src="${img(section.photo)}" alt="${esc(section.photo_alt)}">
                </div>
                <div>${section.content}</div>
            </div>
        </section>`;
}

// Portfolio: każda kategoria to folder data/images/portfolio/<folder>/ (webp + thumbs/).
// Zdjęcia czytamy z folderu, więc wystarczy je wrzucić – pusta kategoria się nie pokazuje.
function portfolioCategories(categories) {
    return categories.map(category => {
        const dir = `${IMAGES}/portfolio/${category.folder}`;
        const files = fs.existsSync(dir)
            ? fs.readdirSync(dir).filter(file => file.endsWith('.webp')).sort()
            : [];
        const cover = category.cover || files[0];
        return {
            title: category.title,
            thumbnail: `portfolio/${category.folder}/thumbs/${cover}`,
            images: files.map(file => ({
                src: `portfolio/${category.folder}/${file}`,
                alt: `${category.title} – fot. Antoni Tomaszewski`,
            })),
        };
    }).filter(category => category.images.length);
}

function renderPortfolio(section) {
    return renderSeries({ ...section, series: portfolioCategories(section.categories) });
}

function renderSeries(section) {
    const seriesGrid = section.series.map((serie, index) =>
        `<div class="series-item" data-series="${index}">
                        <img src="${img(serie.thumbnail)}" alt="${esc(serie.title)}" loading="lazy">
                        <h3>${serie.title}</h3>
                        <div class="series-gallery" id="series-${index}" style="display: none;">
                            ${serie.images.map(image =>
                                `<a href="${img(image.src)}" class="glightbox" data-gallery="series-${index}" data-title="${esc(image.alt)}" aria-label="${esc(image.alt)}"></a>`
                            ).join('\n                            ')}
                        </div>
                    </div>`
    ).join('\n                    ');

    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="series-content">
                <div>${section.content}</div>
                <div class="series-grid">
                    ${seriesGrid}
                </div>
            </div>
        </section>`;
}

function renderText(section) {
    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div>${section.content}</div>
        </section>`;
}

const renderers = {
    about: renderAbout,
    portfolio: renderPortfolio,
    text: renderText,
};

// Sekcje z tłami pomiędzy – tło po każdej sekcji, dopóki starczy zdjęć
function renderSections(sections, backgrounds) {
    return sections.map((section, index) => {
        let html = renderers[section.type](section);
        if (index < backgrounds.length) {
            html += `
        <div class="background-section" style="background-image: url('${img(backgrounds[index])}')"></div>`;
        }
        return html;
    }).join('\n');
}

// Dane strukturalne schema.org – kto stoi za stroną
function renderStructuredData(person) {
    const json = {
        '@context': 'https://schema.org',
        '@type': 'Person',
        image: img('profile.webp'),
        ...person,
    };
    return `<script type="application/ld+json">\n${JSON.stringify(json, null, 4)}\n    </script>`;
}

// Wszystkie zdjęcia z content.json muszą istnieć – łapie literówki przed publikacją
function checkImages(html) {
    const missing = [...html.matchAll(/(?:src|href)="(data\/images\/[^"]+)"|url\('(data\/images\/[^']+)'\)/g)]
        .map(match => match[1] || match[2])
        .filter(path => !fs.existsSync(path));
    if (missing.length) {
        console.error('Brakujące zdjęcia:\n  ' + [...new Set(missing)].join('\n  '));
        process.exit(1);
    }
}

// Funkcja w .replace, żeby znaki "$" w treści nie były traktowane specjalnie
const html = template
    .replace('{{structured_data}}', () => renderStructuredData(data.person))
    .replace('{{hero}}', () => img(data.hero))
    .replace('{{title}}', () => data.title)
    .replace('{{subtitle}}', () => data.subtitle)
    .replace('{{nav}}', () => renderNavigation(data.sections))
    .replace('{{content}}', () => renderSections(data.sections, data.backgrounds));

checkImages(html);
fs.writeFileSync('index.html', html);
console.log('✓ index.html wygenerowany');

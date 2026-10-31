// Generuje gotowe strony HTML z template.html + danych w data/.
//   data/content.json            → index.html (strona główna, wizytówka)
//   data/podstrony/<slug>.json   → <slug>/index.html (podstrony pod SEO, np. /tatry/)
//   data/opisy-zdjec.json        → opisy zdjęć (alt) dla Google Grafiki
// Dzięki temu cała treść jest w HTML (dobre dla Google), a JS obsługuje tylko lightbox i formularz.
//
// Użycie: node build.js

const fs = require('fs');
const path = require('path');

const IMAGES = 'data/images';
const site = JSON.parse(fs.readFileSync('data/content.json', 'utf8'));
const descriptions = JSON.parse(fs.readFileSync('data/opisy-zdjec.json', 'utf8'));
const template = fs.readFileSync('template.html', 'utf8');
const subpages = fs.readdirSync('data/podstrony')
    .filter(file => file.endsWith('.json'))
    .map(file => JSON.parse(fs.readFileSync(`data/podstrony/${file}`, 'utf8')))
    .sort((a, b) => a.order - b.order);

// Ścieżka do katalogu głównego strony: "" na stronie głównej, "../" na podstronie.
// Ścieżki są względne, więc strona działa i pod domeną, i na GitHub Pages, i lokalnie.
let base = '';

// Escapowanie tekstu wstawianego do atrybutów (alt, title)
const esc = text => String(text)
    .replace(/&/g, '&amp;').replace(/"/g, '&quot;')
    .replace(/</g, '&lt;').replace(/>/g, '&gt;');

const img = path => `${base}${IMAGES}/${path}`;
const absoluteImg = path => `${site.site_url}/${IMAGES}/${path}`;

// Zdjęcia kategorii czytamy z folderu data/images/portfolio/<folder>/ (webp + thumbs/),
// więc wystarczy je wrzucić. Opis z opisy-zdjec.json, a gdy go brak – nazwa kategorii.
function folderPhotos(folder, fallbackTitle) {
    const dir = `${IMAGES}/portfolio/${folder}`;
    const files = fs.existsSync(dir)
        ? fs.readdirSync(dir).filter(file => file.endsWith('.webp')).sort()
        : [];
    return files.map(file => ({
        src: `portfolio/${folder}/${file}`,
        thumb: `portfolio/${folder}/thumbs/${file}`,
        alt: descriptions[`${folder}/${file}`]?.opis || `${fallbackTitle} – fot. Antoni Tomaszewski`,
    }));
}

function renderNavigation(sections, isHome) {
    // Na podstronie menu prowadzi do sekcji strony głównej, poza sekcjami tej podstrony (np. kontakt)
    const localIds = new Set(sections.map(section => section.id));
    return site.sections.map(section => {
        const href = isHome || localIds.has(section.id) ? `#${section.id}` : `${base}#${section.id}`;
        return `        <a href="${href}">${section.nav}</a>`;
    }).join('\n');
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

// Portfolio na stronie głównej: karty kategorii, kliknięcie otwiera galerię w lightboxie
function renderPortfolio(section) {
    const categories = section.categories
        .map(category => {
            const images = folderPhotos(category.folder, category.title);
            const cover = images.find(image => image.src.endsWith(`/${category.cover}`)) || images[0];
            return { title: category.title, thumbnail: cover?.thumb, images };
        })
        .filter(category => category.images.length);

    const grid = categories.map((category, index) =>
        `<div class="series-item" data-series="${index}">
                        <img src="${img(category.thumbnail)}" alt="${esc(category.title)}" loading="lazy">
                        <h3>${category.title}</h3>
                        <div class="series-gallery" id="series-${index}" style="display: none;">
                            ${category.images.map(image =>
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
                    ${grid}
                </div>
            </div>
        </section>`;
}

// Galeria zdjęć z jednego folderu, widoczna od razu (podstrony) – Google indeksuje każde zdjęcie z opisem
function renderPhotos(section) {
    const images = folderPhotos(section.folder, section.fallback_alt || section.title)
        .slice(0, section.limit || undefined);
    const grid = images.map(image =>
        `<a href="${img(image.src)}" class="glightbox" data-gallery="${section.id}" data-title="${esc(image.alt)}">
                        <img src="${img(image.thumb)}" alt="${esc(image.alt)}" loading="lazy">
                    </a>`
    ).join('\n                    ');

    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div class="portfolio-content">
                <div>${section.content || ''}</div>
                <div class="lightbox-gallery lightbox-gallery--large">
                    ${grid}
                </div>
            </div>
        </section>`;
}

// Formularz: wysyłka przez Web3Forms (GitHub Pages nie ma serwera, który by go obsłużył).
// Bez JS formularz też działa – zwykły POST do Web3Forms.
function renderContactForm(pageTitle) {
    return `
                <form class="contact-form" action="https://api.web3forms.com/submit" method="POST">
                    <h3>Zostaw kontakt, odezwę się</h3>
                    <input type="hidden" name="access_key" value="${esc(site.web3forms_key)}">
                    <input type="hidden" name="subject" value="Nowe zapytanie ze strony – ${esc(pageTitle)}">
                    <input type="hidden" name="from_name" value="antonitomaszewski.pl">
                    <input type="checkbox" name="botcheck" class="honeypot" tabindex="-1" autocomplete="off" aria-hidden="true">
                    <label>
                        E-mail lub telefon
                        <input type="text" name="kontakt" required minlength="5" autocomplete="email" placeholder="np. jan@example.com lub 600 000 000">
                    </label>
                    <label>
                        <span>Wiadomość <span class="optional">(opcjonalnie)</span></span>
                        <textarea name="wiadomosc" rows="4" placeholder="Czego potrzebujesz? Termin, miejsce, pomysł…"></textarea>
                    </label>
                    <label class="consent">
                        <input type="checkbox" name="zgoda" value="tak" required>
                        <span>Zgadzam się na kontakt w sprawie mojego zapytania. Szczegóły w <a href="${base}polityka-prywatnosci/">polityce prywatności</a>.</span>
                    </label>
                    <button type="submit">Wyślij</button>
                    <p class="form-status" role="status" aria-live="polite"></p>
                </form>`;
}

function renderContact(section, pageTitle) {
    return `
        <section class="content-section" id="${section.id}">
            <h2>${section.title}</h2>
            <div>
                ${section.content}
                ${renderContactForm(pageTitle)}
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
    photos: renderPhotos,
    contact: renderContact,
    text: renderText,
};

// Tło to ścieżka do zdjęcia albo {src, position}, gdy trzeba pokazać inny fragment niż środek
function renderBackground(background) {
    const { src, position } = typeof background === 'string' ? { src: background } : background;
    const positionStyle = position ? `; background-position: ${position}` : '';
    return `
        <div class="background-section" style="background-image: url('${img(src)}')${positionStyle}"></div>`;
}

// Sekcje z tłami pomiędzy – tło po każdej sekcji, dopóki starczy zdjęć
function renderSections(sections, backgrounds, pageTitle) {
    return sections.map((section, index) => {
        let html = renderers[section.type](section, pageTitle);
        if (index < (backgrounds || []).length) {
            html += renderBackground(backgrounds[index]);
        }
        return html;
    }).join('\n');
}

// Stopka z linkami do podstron – pomaga Google je znaleźć i powiązać ze stroną główną
function renderFooter() {
    const links = subpages.map(page =>
        `<a href="${base}${page.slug}/">${page.footer_label || page.h1}</a>`
    ).join('\n            ');
    return `
            ${links}
            <span>© ${new Date().getFullYear()} Antoni Tomaszewski</span>`;
}

// Dane strukturalne schema.org: kto stoi za stroną + gdzie jesteśmy w serwisie
function renderStructuredData(page, url) {
    const scripts = [{
        '@context': 'https://schema.org',
        '@type': 'Person',
        image: absoluteImg('profile.webp'),
        url: site.site_url + '/',
        ...site.person,
    }];
    if (page) {
        scripts.push({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Antoni Tomaszewski – fotograf', item: site.site_url + '/' },
                { '@type': 'ListItem', position: 2, name: page.h1, item: url },
            ],
        });
    }
    return scripts.map(json =>
        `<script type="application/ld+json">\n${JSON.stringify(json, null, 4)}\n    </script>`
    ).join('\n    ');
}

// Wszystkie zdjęcia muszą istnieć – łapie literówki przed publikacją
function checkImages(html, dir) {
    const missing = [...html.matchAll(/(?:src|href)="((?:\.\.\/)?data\/images\/[^"]+)"|url\('((?:\.\.\/)?data\/images\/[^']+)'\)/g)]
        .map(match => path.normalize(`${dir}/${match[1] || match[2]}`))
        .filter(file => !fs.existsSync(file));
    if (missing.length) {
        console.error('Brakujące zdjęcia:\n  ' + [...new Set(missing)].join('\n  '));
        process.exit(1);
    }
}

function renderPage(page) {
    const isHome = !page;
    base = isHome ? '' : '../';
    const p = page || site;
    const url = isHome ? `${site.site_url}/` : `${site.site_url}/${page.slug}/`;
    const meta = p.meta;
    const sections = p.sections;

    // Funkcja w .replace, żeby znaki "$" w treści nie były traktowane specjalnie
    const values = {
        base,
        meta_title: esc(meta.title),
        meta_description: esc(meta.description),
        og_title: esc(meta.og_title || meta.title),
        og_description: esc(meta.og_description || meta.description),
        og_image: absoluteImg(p.hero),
        canonical: url,
        structured_data: renderStructuredData(page, url),
        hero: img(p.hero),
        hero_class: isHome ? '' : 'hero-sub',
        hero_title: isHome ? site.title : page.h1,
        hero_subtitle: isHome ? site.subtitle : page.subtitle,
        nav: renderNavigation(sections, isHome),
        content: renderSections(sections, p.backgrounds, isHome ? site.title : page.h1),
        footer: renderFooter(),
    };
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        if (!(key in values)) throw new Error(`Nieznane pole w szablonie: ${match}`);
        return values[key];
    });
}

function writePage(dir, html) {
    checkImages(html, dir);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(`${dir}/index.html`, html);
}

writePage('.', renderPage(null));
console.log('✓ index.html');
for (const page of subpages) {
    writePage(page.slug, renderPage(page));
    console.log(`✓ ${page.slug}/index.html`);
}

// Mapa strony dla Google – generowana, żeby zawsze zgadzała się z podstronami
const urls = [`${site.site_url}/`, ...subpages.map(page => `${site.site_url}/${page.slug}/`)];
fs.writeFileSync('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `    <url>\n        <loc>${url}</loc>\n    </url>`).join('\n')}
</urlset>
`);
console.log(`✓ sitemap.xml (${urls.length} adresów)`);

// Przypomnienia – nie blokują budowania
const photoKeys = Object.keys(descriptions);
const missingDescriptions = photoKeys.filter(key => !descriptions[key].opis).length;
if (missingDescriptions) {
    console.log(`ℹ ${missingDescriptions} z ${photoKeys.length} zdjęć bez opisu – uzupełnij data/opisy-zdjec.json`);
}
if (!site.web3forms_key || site.web3forms_key.startsWith('WKLEJ')) {
    console.log('ℹ formularz nie wyśle wiadomości – wklej klucz Web3Forms do "web3forms_key" w data/content.json');
}

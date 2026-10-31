Strona ma wyglądać tak jak siga-czarter.pl

Struktura plików:
portfolio-template/
├── index.html
├── config.js              ← theme: "photography"
├── css/
│   ├── colors.css         ← Globalne kolory (CSS variables)
│   ├── layout.css         ← Układ strony
│   └── components.css     ← Style komponentów
├── js/
│   └── app.js             ← Ładuje data/[theme]/content.json
└── data/
    ├── photography/
    │   ├── content.json   ← Wszystkie dane tekstowe
    │   └── images/
    │       ├── bg1.webp
    │       ├── bg2.webp
    │       └── ...
    ├── climbing/
    ├── sailing/
    ├── podcast/
    └── sculpture/

Ma to być szablon dla 5 (lub w przyszłości więcej) stron.
Działa to tak, że w pliku config.js zmieniamy nazwę tematu
// config.js
const CONFIG = { theme: "photography" };  // lub climbing, sailing...
app.js ładuje kontent, renderuje html, ładuje zdjęcia


FUNKCJONALNOŚĆ (wzór: siga-czarter.pl)
Menu: Poziome, wyśrodkowane na środku → scroll down → sticky na górze (CSS only)
Tła: Zdjęcia jeden pod drugim, widoczne między sekcjami z tekstem (CSS only)
Nawigacja: Kotwice (#about, #portfolio) + smooth scroll (CSS: scroll-behavior: smooth)
Responsywność: Mobile + Desktop
Kolorystyka: Jasna, biała, minimalistyczna

TODO:
trzeba dodać konwersję zdjęć z jpg -> webP
obecnie folder data waży 180mb,
może należałoby także zastanowić się nad usunięciem części zdjęć
portfolio thumbnails -> full resolution dopiero po kliknięciu


┌─────────────────────────────────────────┐
│ [Nav items równo rozmieszczone]         │ ← sticky nav (max-width: 1200px)
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │ ← białe tło
│  │ ABOUT    │ Tekst o mnie...      │   │ ← ramka (max-width: 1200px)
│  │  (40%)   │      (60%)           │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│         [Zdjęcie fullwidth]             │ ← tło bez ograniczenia
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────┐   │
│  │ PORTFOLIO│ Galeria zdjęć...     │   │
│  │  (40%)   │      (60%)           │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘



JAK PRACOWAĆ ZE STRONĄ
======================
Treść:   edytuj data/content.json (sekcje, zdjęcia, alt-y)
         <head> (title, meta description) jest w template.html
Budowa:  node build.js   → generuje index.html (NIE edytuj index.html ręcznie)
Podgląd: python3 -m http.server 8080  → http://localhost:8080
Zdjęcia: wrzuć JPG do zdjecia-oryginalne/<kategoria>/  (tatry, morze, zwierzeta, miasta, ludzie)
         ./scripts/convert-images.sh && node build.js
         kategoria pojawia się na stronie sama, pusta jest ukryta
         nowa kategoria = nowy folder + wpis w "categories" w data/content.json

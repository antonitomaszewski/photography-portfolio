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
    │       ├── bg1.jpg
    │       ├── bg2.jpg
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


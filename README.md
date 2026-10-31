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
Strona główna:  data/content.json  (sekcje, oferta, kontakt)
Podstrony SEO:  data/podstrony/<slug>.json  → strona pod adresem /<slug>/
                (tatry, zdjecia-dla-pensjonatow, sesja-zdjeciowa-wroclaw, polityka-prywatnosci)
                nowa podstrona = nowy plik json, sama trafi do stopki i sitemap.xml
Wygląd <head>:  template.html (wspólny dla wszystkich stron)
Budowa:         node build.js   → index.html, <slug>/index.html, sitemap.xml
                NIE edytuj wygenerowanych index.html ręcznie
Podgląd:        python3 -m http.server 8080  → http://localhost:8080

Zdjęcia:  wrzuć JPG do zdjecia-oryginalne/<kategoria>/  (tatry, morze, zwierzeta, miasta, ludzie)
          ./scripts/convert-images.sh && node build.js
          kategoria pojawia się na stronie sama, pusta jest ukryta

Opisy zdjęć (SEO, Google Grafika):
          data/opisy-zdjec.json – dla każdego zdjęcia:
            "opis":  co i gdzie, np. "Morskie Oko zimą, Tatry"  → tekst alternatywny (alt)
            "nazwa": krótko do nazwy pliku, np. "Morskie Oko zima"  → 01-morskie-oko-zima.webp
          python3 scripts/nazwy-zdjec.py && node build.js

Formularz kontaktowy (Web3Forms):
          1. wejdź na web3forms.com, wpisz swój e-mail → klucz przyjdzie mailem
          2. wklej go do "web3forms_key" w data/content.json i node build.js

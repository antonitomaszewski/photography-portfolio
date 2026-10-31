"""Nadaje zdjęciom nazwy opisowe na podstawie pola "nazwa" w data/opisy-zdjec.json.

    tatry/01-dscf0276.webp  + nazwa "Morskie Oko zimą"  →  tatry/01-morskie-oko-zima.webp

Zmienia nazwę: wersji na stronę, miniatury, oryginału w zdjecia-oryginalne/
oraz klucza w opisy-zdjec.json i odwołań w content.json / podstronach.
Numer na początku zostaje, bo ustala kolejność w galerii.

Użycie: python3 scripts/nazwy-zdjec.py && node build.js
"""
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PHOTOS = ROOT / 'data/images/portfolio'
ORIGINALS = ROOT / 'zdjecia-oryginalne'
DESCRIPTIONS = ROOT / 'data/opisy-zdjec.json'
DATA_FILES = [ROOT / 'data/content.json', *sorted((ROOT / 'data/podstrony').glob('*.json'))]


def slugify(text):
    text = text.lower().replace('ł', 'l')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode()
    return re.sub(r'[^a-z0-9]+', '-', text).strip('-')


def rename(old, new):
    if old.exists():
        old.rename(new)


descriptions = json.loads(DESCRIPTIONS.read_text())
data_texts = {path: path.read_text() for path in DATA_FILES}
renamed = {}

for key, entry in list(descriptions.items()):
    if not entry.get('nazwa'):
        continue
    folder, file = key.split('/')
    number = file.split('-')[0]
    new_file = f"{number}-{slugify(entry['nazwa'])}.webp"
    if new_file == file:
        continue
    if (PHOTOS / folder / new_file).exists():
        print(f'✗ {key}: {new_file} już istnieje – zmień nazwę na inną')
        continue

    rename(PHOTOS / folder / file, PHOTOS / folder / new_file)
    rename(PHOTOS / folder / 'thumbs' / file, PHOTOS / folder / 'thumbs' / new_file)
    # oryginał: ta sama nazwa bez rozszerzenia, wielkość liter dowolna (01-DSCF0276.JPG)
    stem = Path(file).stem
    for original in (ORIGINALS / folder).glob('*'):
        if original.stem.lower() == stem:
            rename(original, original.with_name(Path(new_file).stem + original.suffix))

    # klucz w opisach (zachowując kolejność)
    descriptions = {(f'{folder}/{new_file}' if k == key else k): v for k, v in descriptions.items()}
    # odwołania w danych: pełna ścieżka i "cover" (sama nazwa pliku)
    for path, text in data_texts.items():
        text = text.replace(f'portfolio/{folder}/{file}', f'portfolio/{folder}/{new_file}')
        text = re.sub(rf'("folder": "{folder}",\s*"cover": "){re.escape(file)}"', rf'\g<1>{new_file}"', text)
        data_texts[path] = text
    renamed[key] = new_file
    print(f'✓ {key} → {new_file}')

DESCRIPTIONS.write_text(json.dumps(descriptions, ensure_ascii=False, indent=4) + '\n')
for path, text in data_texts.items():
    path.write_text(text)
print(f'Zmieniono nazwy: {len(renamed)}. Teraz: node build.js')

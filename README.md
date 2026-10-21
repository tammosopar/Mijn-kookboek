# Mijn Kookboek

[Open het kookboek](https://tammosopar.github.io/Mijn-kookboek/)

Eén centrale bron voor recepten en websitecode. GitHub Actions controleert en
publiceert de stabiele versie op `main`. Lees vóór wijzigingen **AGENTS.md**.

## Werkwijze

- **Recept toevoegen:** vraag in ChatGPT “voeg dit recept toe en publiceer”. Na
  validatie kan het recept rechtstreeks naar main; productie werkt automatisch bij.
- **Website verbeteren:** aparte ontwikkelbranch, pull request, controles en preview.
  Na jouw akkoord op de testversie wordt de PR samengevoegd en productie gepubliceerd.
- **Acceptatie:** de aparte repository `Mijn-kookboek-preview` publiceert dezelfde
  broncode op basis van een exacte commitverwijzing. Deze is actief op
  https://tammosopar.github.io/Mijn-kookboek-preview/.

De testsite krijgt een ACCEPTATIE-balk. `version.json` toont per omgeving de exacte
broncommit. Website-artifacts blijven 30 dagen beschikbaar in GitHub Actions.

## Bestanden

| Pad | Inhoud |
| --- | --- |
| recipes/*.json | één bronbestand per recept |
| site/ | HTML, CSS en JavaScript |
| scripts/build.py | valideren en productie/acceptatie bouwen |
| scripts/add_recipe.py | veilig een JSON-recept toevoegen |
| scripts/prepare_preview_repository.py | previewrepository voorbereiden |
| .github/workflows/pages.yml | PR-controles en productiepublicatie |
| ops/preview-repository/ | beheerde inrichting van de previewrepository |
| tests/ | recepten- en publicatietests |
| AGENTS.md | vaste instructies voor schrijvende assistenten |
| docs/werkwijze.md | accepteren, vrijgeven en herstellen |
| docs/chatgpt-project.md | inrichting en instructies van het ChatGPT-project |
| docs/backlog.md | besproken wensen en voortgang |
| docs/projectstatus.md | gereed versus nog te activeren |

`dist/` en `.preview-repository/` zijn gegenereerde uitvoer en staan niet in Git.
De drie standaardrecepten komen uit de eerdere proefversie en zijn voorbeelden.
Eigen browserrecepten uit die versie moeten apart worden geëxporteerd.

## Lokaal controleren en proberen

Vereist Python 3.10+ en Node voor JavaScript-syntaxcontrole. Geen extra Python-pakketten.

```bash
python3 -m unittest discover -s tests -v
node --check site/assets/app.js
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Voor acceptatie:

```bash
python3 scripts/build.py --environment acceptance --source-sha VOLLEDIGE_COMMIT_SHA
```

## Receptcontract

Gebruik een bestaand bestand als voorbeeld. Vereist: id (slug), name, type, minutes
(positief geheel getal), portions (positief geheel getal), emoji, ingredients (lijst),
instructions (lijst), notes (tekst, eventueel leeg). Bestandsnaam: `<id>.json`.
Optioneel: `cover` met `src` (lokaal pad `assets/images/<naam>.webp`, `.jpg` of `.png`)
en een beschrijvende `alt`. Plaats de foto in `site/assets/images/`; de build
controleert of deze bestaat. Gebruik bij nieuwe recepten een passende cover.
Recepten zonder cover blijven werken met hun emoji.
De gezamenlijke catalogus wordt automatisch gebouwd. De website bevat geen GitHub-token.

## Publicatie

Productie en preview gebruiken ieder Settings → Pages → Source: GitHub Actions.
Een PR bouwt en bewaart een artifact maar publiceert nooit productie. Alleen main
kan de productie-deploy uitvoeren. De preview publiceert uitsluitend haar eigen site.
Zie docs/werkwijze.md voor de automatische preview na het bijwerken van source.json.

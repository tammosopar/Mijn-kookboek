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
  broncode op basis van een exacte commitverwijzing. De repository en Pages-publicatie zijn ingericht;
  zie docs/projectstatus.md.

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

Vereist Python 3.10+, Node 24+ en Chromium voor de browsertests. Geen extra pakketten.
Stel eventueel CHROME_BIN in op het pad naar Chrome of Chromium.

```bash
python3 -m unittest discover -s tests -v
node --check site/assets/app.js
python3 scripts/build.py
node --test tests/browser.test.mjs
python3 scripts/check_preview_sync.py
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
De gezamenlijke catalogus wordt automatisch gebouwd. De website bevat geen GitHub-token.

## Publicatie

Productie en preview gebruiken ieder Settings → Pages → Source: GitHub Actions.
Een PR bouwt en bewaart een artifact maar publiceert nooit productie. Alleen main
kan de productie-deploy uitvoeren. De preview publiceert uitsluitend haar eigen site.
Zie docs/werkwijze.md voor de automatische preview na het bijwerken van source.json.


## Koken met het kookboek

Recepten hebben een deelbare URL, bijvoorbeeld `#gamba-bao-buns`. Pas porties aan
om bekende hoeveelheden om te rekenen; tijden en hoeveelheden zonder getal blijven
gelijk. Ingrediënten en stappen zijn afvinkbaar en worden op dit apparaat bewaard.
Met “Vinkjes wissen” begin je opnieuw; “Print recept” print alleen het geopende recept.

Ingrediënten gebruiken `{"quantity": 200, "unit": "g", "name": "pasta"}`.
Gebruik `null` voor een onbekende hoeveelheid. Oude tekstingrediënten blijven
ondersteund en worden niet omgerekend. Positieve gehele en decimale hoeveelheden
zijn toegestaan. Het oorspronkelijke portieaantal blijft de basis voor elke berekening.

De workflow controleert de preview-inrichting tegen `ops/preview-repository/`;
alleen de kandidaat-SHA mag verschillen. Werk bij een bewuste inrichtingswijziging
de template en de previewrepository samen bij.

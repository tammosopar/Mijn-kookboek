# Mijn Kookboek

Een eenvoudige basis voor `tammosopar/Mijn-kookboek` op GitHub Pages.
Repository: `https://github.com/tammosopar/Mijn-kookboek`. De bestanden zijn lokaal gecontroleerd; Pages moet eenmalig op GitHub Actions worden ingesteld. Livegang is pas bevestigd na een geslaagde deployment.

## Keuze

Een statische HTML/CSS/JavaScript-site met één JSON-bestand per recept.
GitHub is de centrale opslag. Python (alleen de standaardbibliotheek) controleert
de recepten en maakt automatisch de gezamenlijke catalogus. GitHub Actions voert
dat na elke wijziging aan `main` uit en publiceert uitsluitend `dist/`.
Geen database, server of JavaScript-framework nodig.

De drie beginrecepten zijn overgenomen uit de eerdere proefversie. Ze zijn voorbeelden,
geen complete of opnieuw gevalideerde versies van alle eerder besproken gerechten.
Eigen wijzigingen die alleen in de browser van die proefversie staan, zijn niet toegankelijk
vanuit dit pakket. Exporteer die eerst vanuit de oude versie; zie `docs/architectuur.md`.

## Structuur

```text
mijn-kookboek/
  .github/workflows/pages.yml   # controleren, bouwen, publiceren
  recipes/                     # één JSON-bestand per recept: bronbestanden
  site/
    index.html                 # pagina
    assets/app.js              # zoeken, keukenfilter, receptdetails
    assets/style.css           # vormgeving
  scripts/
    build.py                   # controleren + dist/ genereren
    add_recipe.py              # veilig één JSON-recept toevoegen
  tests/test_recipes.py
  docs/
    architectuur.md
    chatgpt-toevoegen.md
  README.md
```

`dist/` wordt gegenereerd en niet in Git opgeslagen. De site leest
`dist/data/recipes.json`; je hoeft geen inhoudsopgave handmatig bij te houden.
De relatieve URL's werken ook onder `/mijn-kookboek/`.

## Lokaal proberen

Vereist Python 3.10 of nieuwer. Voer uit in de projectmap:

```bash
python3 -m unittest discover -s tests -v
python3 scripts/build.py
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`. Openen via een dubbelklik op `index.html` werkt
niet voor het laden van de JSON-catalogus; gebruik de lokale server.

## Repository en GitHub Pages activeren

1. Maak op GitHub een repository `mijn-kookboek` met standaardbranch `main`.
   Voor GitHub Free kies je een **public** repository voor gratis Pages.
   De site en receptinhoud zijn dan publiek. Voeg geen gevoelige notities toe.
2. Upload de **inhoud** van deze projectmap, inclusief `.github/workflows/pages.yml`,
   naar de hoofdmap van de repository. Upload niet alleen de ZIP en zet er geen extra
   map `mijn-kookboek/` boven. Een Git-push bewaart de volledige structuur het betrouwbaarst.
3. Kies in de repository **Settings → Pages → Build and deployment → Source → GitHub Actions**.
4. Open **Actions → Controleer en publiceer kookboek → Run workflow** op `main`.
   Latere wijzigingen aan `main` starten dit vanzelf.
5. Controleer de groene deployment. De verwachte URL is
   `https://tammosopar.github.io/Mijn-kookboek/`; deze is nu nog niet geactiveerd of geverifieerd.

Als de GitHub-koppeling alleen geselecteerde repositories mag zien, geef haar daarna
ook toegang tot `mijn-kookboek`. De beschikbare koppeling kon tijdens voorbereiding
geen repository aanmaken of Pages-instellingen aanpassen.

## Vanuit ChatGPT toevoegen

Zeg bijvoorbeeld: **“Voeg dit recept toe aan mijn kookboek en publiceer het.”**
ChatGPT kan dan met de GitHub-koppeling één receptbestand naar deze repository
schrijven. De Pages-workflow controleert en publiceert het. Er is geen extra app nodig.
Dit werkt zodra de repository bestaat, de koppeling schrijftoegang heeft en Pages
eenmalig is ingesteld. Zie `docs/chatgpt-toevoegen.md`.

## Nieuw recept

Kopieer een recept uit `recipes/`, kies een nieuwe `id` en sla het op als
`recipes/<id>.json`. `ingredients` en `instructions` zijn lijsten met tekst,
de overige velden staan in het voorbeeld. Gebruik voor lege notities `""`.

Of ontvang één JSON-bestand van een toekomstige integratie:

```bash
python3 scripts/add_recipe.py /pad/naar/nieuw-recept.json
python3 scripts/build.py
```

Commit en push het nieuwe bronbestand. De website wordt daarna opnieuw gebouwd.
Een pull request krijgt dezelfde controles, maar wordt pas gepubliceerd na samenvoegen
naar `main`. Er is bewust geen browserformulier dat alleen lokaal lijkt op te slaan.

## Documentatie en bronnen

- `docs/architectuur.md`: keuzes, beperkingen, migratie, stappen naar livegang.
- `docs/chatgpt-toevoegen.md`: recepten vanuit dit gesprek opslaan en publiceren.
- GitHub-documentatie (geraadpleegd 21 oktober 2026):
  https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages

De workflow gebruikt de daar gedocumenteerde Pages-actions en beperkte
deployrechten. Er is geen periodieke recepttaak ingesteld. Recepten worden toegevoegd wanneer je daar in ChatGPT om vraagt.

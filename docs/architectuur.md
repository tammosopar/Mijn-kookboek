# Architectuur en afspraken

## Van recept naar site

1. Een mens of later een gekoppelde app maakt één JSON-recept.
2. Dat wordt `recipes/<id>.json` in GitHub, bij voorkeur eerst als pull request.
3. GitHub Actions draait de tests en `scripts/build.py`.
4. De build valideert alle recepten en maakt `dist/data/recipes.json`.
5. Alleen een geldige build op `main` wordt op GitHub Pages gepubliceerd.
6. De browser haalt de catalogus op, toont kaarten en filtert op naam,
   ingrediënt en keuken. Een kaart opent ingrediënten, stappen en notities.

Een recept heeft een vaste, unieke `id`. De bestandsnaam is dezelfde id plus `.json`.
De bronbestanden in `recipes/` zijn leidend; de catalogus is afgeleid.
Velden: `id`, `name`, `type`, `minutes`, `portions`, `emoji`,
`ingredients`, `instructions`, `notes`. Het script valideert dit contract zonder
extra pakketten. Bij een onbekend of ontbrekend veld faalt de build.

## Waarom deze keuze

De eerdere versie gebruikte `localStorage`. Dat is per browser en is niet de
centrale opslag die nodig is om via een externe app recepten toe te voegen.
Git-bestanden geven gedeelde opslag, wijzigingsgeschiedenis en herstel via commits.
JSON voorkomt een Markdown-parser of extra metadataformaat in de eerste versie.
GitHub Pages dient de gegenereerde bestanden uit. Er draait daar geen applicatieserver.
De tekstvelden worden in de browser als tekst getoond, niet als uitvoerbare HTML.

## Recepten vanuit ChatGPT toevoegen

Je maakt of verfijnt een recept in ChatGPT en vraagt daarna expliciet om het
in je kookboek op te slaan en te publiceren. ChatGPT zet het recept om naar het
vaste JSON-formaat en schrijft via de gekoppelde GitHub-tools één bestand naar
`recipes/<id>.json` op `main`. De bestaande workflow controleert en publiceert het.
Er is geen extra integratie-app, webhookserver of database nodig.

Voorwaarden: de kookboekrepository bestaat, de GitHub-koppeling heeft toegang en
schrijfrechten, en GitHub Pages is ingesteld op GitHub Actions. ChatGPT controleert
voor een bestaande id eerst de huidige inhoud en voorkomt stilzwijgend overschrijven.
De website zelf bevat geen GitHub-token en heeft geen schrijfformulier nodig.
Zie `chatgpt-toevoegen.md` voor de werkwijze en het publicatiecriterium.

## Migratie van de proefversie

De drie standaardrecepten uit de bestaande `index.html` zijn overgenomen.
Eigen browserrecepten moeten vanuit die versie worden geëxporteerd. Dat exportbestand
is een lijst. Per object wordt `ingredients` op regeleinden gesplitst naar een lijst;
hetzelfde geldt voor `instructions`. Kies een vaste slug als nieuwe id, maak de
bestandsnaam gelijk aan die id en behoud naam, keuken, tijd, porties, emoji en notities.
De nieuwe importtool verwacht één nieuw-formaat recept per bestand; hij importeert
de oude exportlijst niet rechtstreeks. Er zijn geen browsergegevens stilzwijgend gemigreerd.

## Bewuste grenzen van deze eerste versie

- Eén eigenaar en een publiek kookboek; geen accounts of besloten notities.
- Recepten lezen en zoeken werkt; bewerken verloopt via GitHub of ChatGPT met de gekoppelde GitHub-tools.
- Geen afbeeldingenopslag, voedingsberekeningen, boodschappenlijst of weekplanner.
- Geen eigen domein nodig voor de verwachte github.io-URL.
- Een fout recept stopt de nieuwe publicatie; een bestaande live versie wordt niet vervangen.
- Een toekomstige zondagtaak moet recepten echt naar GitHub schrijven; alleen een
  herinnering publiceren verandert de site niet. Zo'n taak is hier niet ingesteld.

## Opgeleverd en nog te doen

Opgeleverd: bronstructuur, werkende statische lezer, drie overgenomen voorbeelden,
validerende build, importcommando, tests en Pages-workflow.

De remote repository bestaat en de GitHub-koppeling heeft schrijfrechten.
Voor livegang moeten de projectbestanden aanwezig zijn, GitHub Pages op Actions staan
en de eerste deployment slagen.
Voor toevoegen vanuit ChatGPT moet de GitHub-koppeling toegang hebben tot de kookboekrepository.
Er zijn geen commits of wijzigingen gemaakt in `master_thesis`.

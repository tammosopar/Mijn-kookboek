# Recepten vanuit ChatGPT opslaan en publiceren

## Gewenste ervaring

1. Vraag in ChatGPT om een recept of verfijn een bestaand recept.
2. Zeg: **“Voeg dit recept toe aan mijn kookboek en publiceer het.”**
3. ChatGPT zet de definitieve tekst om naar één JSON-recept en schrijft dit met
   de GitHub-koppeling naar `tammosopar/Mijn-kookboek`, op branch `main`.
4. GitHub Actions controleert en bouwt de volledige site en publiceert die op Pages.
5. ChatGPT controleert waar mogelijk de workflow/deployment en geeft de site-URL.

Een recept alleen in het gesprek genereren verandert de website nog niet. De
expliciete opdracht om toe te voegen is het moment waarop het recept wordt opgeslagen.
Het schrijven van het bestand en het slagen van de deployment zijn afzonderlijke stappen.
Zonder bevestigde deployment meldt ChatGPT dat de publicatie nog niet is bevestigd.

## Eenmalige inrichting

- Maak de repository `mijn-kookboek` aan. Voor gratis Pages via GitHub Free: publiek.
- Geef de ChatGPT GitHub-koppeling toegang en schrijfrechten tot die repository.
- Zet de projectbestanden inclusief `.github/workflows/pages.yml` op `main`.
- Kies Settings → Pages → Source: GitHub Actions en voer de workflow eenmaal uit.
- Controleer de live URL die de deployment teruggeeft.

De repository bestaat en de GitHub-koppeling heeft schrijfrechten. Pages moet nog worden gecontroleerd. De beschikbare GitHub-tools kunnen bestanden
schrijven, maar bieden geen actie om een repository aan te maken of Pages in te stellen.
De verwachte URL na inrichting is `https://tammosopar.github.io/Mijn-kookboek/`.

## Werkwijze voor de schrijvende assistent

1. Controleer de actuele repository, default branch, workflow en receptstructuur.
2. Gebruik het definitieve recept uit het gesprek; verzin geen persoonlijke notities.
3. Maak een vaste slug, bijvoorbeeld `pasta-puttanesca`, en zoek naar een bestaand
   gelijk of vergelijkbaar recept. Lees een bestaand bestand voor een eventuele wijziging.
4. Gebruik precies de velden hieronder. Valideer met `scripts/build.py` waar lokaal
   mogelijk. Maak daarna `recipes/<id>.json` via de GitHub create-file-actie.
   Gebruik voor een bewuste wijziging de update-file-actie met de actuele blob-SHA.
5. Schrijf rechtstreeks op `main` wanneer de gebruiker om toevoegen en publiceren
   vraagt en de branch dit toestaat. Vereist de repository een pull request, volg
   die route en meld dat publicatie op de merge wacht.
6. Controleer de workflow voor de gemaakte commit en de deploymentstatus waar de
   beschikbare tools dat toelaten. Meld fouten en bevestig livegang pas na verificatie.

## Receptformaat

Gebruik een bestaand bestand uit `recipes/` als voorbeeld. Verplichte velden:

| Veld | Type |
| --- | --- |
| id | vaste slug met kleine letters, cijfers en verbindingsstreepjes |
| name | naam van het gerecht |
| type | keuken, bijvoorbeeld Italiaans |
| minutes | positief geheel getal |
| portions | positief geheel getal |
| emoji | tekst |
| ingredients | niet-lege lijst met ingrediënten als tekst |
| instructions | niet-lege lijst met stappen als tekst |
| notes | tekst; leeg wanneer er geen notities zijn |

De bestandsnaam moet dezelfde id hebben, met `.json` erachter. De catalogus hoeft
niet handmatig te worden bijgewerkt; de build vindt alle recepten vanzelf.
Een GitHub-token komt nooit in de publieke website of in receptbestanden.

## Huidige status

De bronbestanden en publicatieworkflow zijn voorbereid en lokaal getest.
De kookboekrepository is bereikbaar met schrijfrechten. De eerste Pages-deployment moet nog worden bevestigd.

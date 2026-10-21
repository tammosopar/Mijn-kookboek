# Werken aan Mijn Kookboek

Lees dit bestand, README.md en docs/werkwijze.md vóór iedere wijziging. Lees de
actuele GitHub-bestanden; oude chats en ZIP-bestanden zijn geen actuele broncode.

## Bron en omgevingen

- Enige bronrepository: `tammosopar/Mijn-kookboek`.
- Productie: branch `main`, https://tammosopar.github.io/Mijn-kookboek/.
- Acceptatie: publicatierepository `tammosopar/Mijn-kookboek-preview`.
  Ga pas van beschikbaarheid uit nadat de repository en deployment zijn gecontroleerd.
- `ops/preview-repository/` is de beheerde template; de echte previewrepository
  bevat alleen deze inrichting en een `source.json` met de te testen commit.
- De branch `acceptatie` bewaart de laatst aangeboden testcommit. Ontwikkel
  wijzigingen op een aparte `feature/...`- of `fix/...`-branch vanaf actuele `main`.

## Nieuwe recepten

Een expliciete opdracht om een recept toe te voegen en te publiceren autoriseert
het opslaan op `main` na validatie. Gebruik één `recipes/<id>.json`, behoud het
contract van scripts/build.py en voorkom duplicaten. Lees een bestaand recept
vóór bewerken; verzin geen persoonlijke notities. Combineer dit niet met nog
niet goedgekeurde wijzigingen aan websitecode. Controleer de productie-deployment.

## Website en inrichting

1. Werk op een aparte branch en open een pull request; nooit stilzwijgend op main.
2. Voer Python-tests, JavaScript-syntaxcontrole en productie- en acceptatiebuild uit.
3. Publiceer een preview van de exacte head-commit via de previewrepository:
   controleer de actuele bron-SHA en update daar source.json. Werk acceptatie bij.
4. Geef de preview-URL en benoem wat getest moet worden. Wacht op gebruikersakkoord
   voor die versie voordat een wijziging aan het gedrag of uiterlijk naar main gaat.
5. Lees vóór merge de actuele main en PR-head. Controleer dat tests nog groen zijn.
   Een wijziging van de kandidaat na akkoord vereist opnieuw beoordeling als gedrag
   of uiterlijk verandert. Bewaar recente receptwijzigingen op main.
6. Merge zonder force-push. Controleer de productie-deployment en version.json;
   een opgeslagen commit is nog geen bevestigde livegang.

De initiële workflow-inrichting is expliciet goedgekeurd op 21 oktober 2026 en mag
na geslaagde controles worden samengevoegd. Toekomstige sitefuncties vereisen wel
het hierboven beschreven preview-akkoord. Als preview nog ontbreekt, meld dat
concreet en publiceer nieuwe sitefuncties niet als vervangende stap rechtstreeks.

## Vrijgave en herstel

Leg gebruikersakkoord, geteste broncommit en doel kort vast in de pull request.
Bewaar broncode en gegenereerde website afzonderlijk. Workflow-artifacts vervallen
na 30 dagen; Git-geschiedenis blijft leidend. Geen geschiedenis herschrijven.
Bij een fout: maak een herstelcommit/PR die de bedoelde wijziging terugdraait,
met behoud van latere recepten. Zie docs/werkwijze.md. Maak nooit de claim dat
branchbescherming of een ChatGPT-project is ingesteld zonder dat te verifiëren.

# Architectuur

De huidige werkwijze staat in werkwijze.md en de inrichting in projectstatus.md.

## Bron en productie

Eén JSON-bestand per recept in recipes/. HTML/CSS/JavaScript in site/.
Python valideert de inhoud, bouwt dist/data/recipes.json en kopieert de website.
GitHub Actions publiceert dist/ na geslaagde controles op main.
Geen database, extra server of browseropslag nodig voor gepubliceerde recepten.
De browser toont receptvelden als tekst, niet als uitvoerbare HTML.

## Acceptatie

Een aparte publicatierepository bevat een workflow en source.json. Deze verwijst
naar een volledige broncommit in Mijn-kookboek, meestal de head van een feature-PR.
De workflow haalt de bron op, test en bouwt met environment acceptance en publiceert
op de eigen Pages-site. Productie en acceptatie hebben een eigen deployment.
Beide bevatten version.json. De preview heeft een zichtbare acceptatiebalk.
De broncode wordt alleen in de bronrepository onderhouden.

## Recepten en wijzigingen

Recepten kunnen na expliciete toevoegopdracht en validatie naar main. Wijzigingen
aan de site gaan via branch, PR en gebruikersakkoord op de preview. AGENTS.md
legt dit vast; branchbescherming is daarmee niet automatisch ingesteld.

## Migratie van de oorspronkelijke proefversie

De drie standaardrecepten uit index.html zijn overgenomen. Eigen browserrecepten
moeten vanuit de oude versie worden geëxporteerd. De export is een lijst; splits
per recept ingredients en instructions op regeleinden naar lijsten. Kies een vaste
slug als id en bestandsnaam. De importtool accepteert één nieuw-formaat recept
per bestand, niet rechtstreeks de oude exportlijst. Er zijn geen persoonlijke
browsergegevens stilzwijgend gemigreerd.

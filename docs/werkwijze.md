# Iteratief werken, acceptatie en productie

## Dagelijks gebruik

- **Recept:** vraag in ChatGPT om een recept; na “voeg toe en publiceer” wordt
  uitsluitend het recept gevalideerd en op main opgeslagen. De site bouwt vanzelf.
- **Sitewijziging:** beschrijf een verbetering. ChatGPT maakt een ontwikkelbranch,
  pull request en preview. Test die op je telefoon en geef akkoord of feedback.
- **Vrijgave:** pas na akkoord op de geteste versie wordt de PR samengevoegd.
  Productie bouwt dan opnieuw, inclusief de actuele recepten op main.

## Inrichting

| Onderdeel | Functie |
| --- | --- |
| Mijn-kookboek/main | stabiele bron voor productie |
| feature/... en fix/... | één afzonderlijke wijziging |
| Mijn-kookboek/acceptatie | laatst aangeboden testcommit |
| Mijn-kookboek-preview/main | vaste workflow en source.json; geen tweede codebase |
| Productie-URL | https://tammosopar.github.io/Mijn-kookboek/ |
| Verwachte acceptatie-URL | https://tammosopar.github.io/Mijn-kookboek-preview/ |

Een testversie krijgt een opvallende ACCEPTATIE-balk. Beide omgevingen krijgen
`version.json` met omgeving, bronrepository, volledige broncommit en receptaantal.
De preview is openbaar, net als productie; de URL is geen toegangsbeveiliging.
Er is bewust één gedeelde acceptatieomgeving: bied één kandidaat tegelijk aan.

## Automatisch publiceren van acceptatie

ChatGPT zet in de previewrepository `source.json` op de te testen commit in de
bronrepository. Die commit moet bestaan en de volledige SHA moet worden gebruikt.
Daarna start automatisch de workflow in de previewrepository. Deze haalt de
exacte openbare broncode op, test, bouwt en publiceert alleen haar eigen Pages-site.
De eerste inrichting wordt voorbereid met:

```bash
python3 scripts/prepare_preview_repository.py --source-sha VOLLEDIGE_COMMIT_SHA
```

Dit maakt `.preview-repository/` met README.md, source.json en de Pages-workflow.
Plaats de inhoud daarvan op main van de previewrepository. Geef de GitHub-koppeling
ook toegang tot deze repository. Zet daar eenmalig Pages op GitHub Actions.

Dit proces vereist geen extra persoonlijk token, automatische polling of kopie van
de broncode. Het updaten van de bronverwijzing wordt door ChatGPT tijdens de opdracht
uitgevoerd. Een losse push buiten ChatGPT bouwt de PR-controles, maar verandert niet
vanzelf de gedeelde acceptatiesite: de bronverwijzing moet ook worden bijgewerkt.

## Controles

Elke pull request naar main voert uit:

1. Python-tests voor recepten, duplicaten en bouw/publicatie-inrichting.
2. JavaScript-syntaxcontrole.
3. Een build met alle receptbestanden en een controleerbaar website-artifact.

De PR publiceert nooit productie. Een push naar main doorloopt dezelfde controles
voordat de bestaande productie-workflow publiceert. PR-artifacts gebruiken de
GitHub test-mergeboom; de gehoste preview gebruikt expliciet de kandidaat-head-SHA.
Het artifact van een PR is daardoor een controlehulpmiddel, geen bewijs van exact
hetzelfde bestandspakket als de gehoste preview.

Controleer op acceptatie handmatig: zoeken, keukenfilter, recept openen/sluiten,
leesbaarheid op mobiel, bestaande recepten en het bedoelde nieuwe gedrag. Controleer
ook fouten bij het laden. Automatische tests vervangen deze visuele controle niet.

## Akkoord en bescherming

Gebruikersakkoord wordt in de PR bij de exacte geteste bron-SHA vastgelegd.
De afspraken in AGENTS.md sturen de assistent. Ze blokkeren een handmatige push of
merge via GitHub niet technisch. Branchregels en verplichte reviews zijn niet via
de beschikbare koppeling ingesteld. Met één eigenaar en een directe receptenroute
is deze werkwijze de lichte basis. Verplicht alle wijzigingen via PR als later ook
technische branchbescherming gewenst is; dat verandert de directe receptenroute.

Als main tijdens de beoordeling verandert, controleer dan opnieuw op conflicten,
receptbehoud en relevante testresultaten. Voeg geen onbeoordeelde functiewijzigingen
toe aan een akkoord gegeven kandidaat. De mergecommit verschilt meestal van de
preview-SHA; de PR legt de relatie vast en productie version.json toont de merge-SHA.

## Vorige versie herstellen

- GitHub Actions bewaart de gebouwde website van elke bronworkflow 30 dagen.
- Git bewaart de code en wijzigingen; noteer de laatst geslaagde deployment en SHA.
- Draai bij een fout bij voorkeur alleen de foutieve wijziging terug met een
  herstelcommit/PR. Zet niet de hele branch terug: dan zouden latere recepten verdwijnen.
- Controleer tests en wijzigingen; publiceer het herstel op expliciete opdracht en
  controleer de nieuwe deployment. De historische baseline is commit
  `d9bf7b162b5db534932fd3b45dc888b7e9344a90` (eerste geslaagde site).
- Een artifact downloaden herstelt de live site niet vanzelf. Er is geen aparte
  onbeproefde éénknops-rollback ingericht.

## Nog handmatig nodig

De tweede repository moet bestaan, toegankelijk zijn en Pages ingeschakeld hebben.
Een ChatGPT-project kan niet vanuit de GitHub-tools worden aangemaakt. Zie
`chatgpt-project.md`. Zie `projectstatus.md` voor de actuele afrondingsstatus.

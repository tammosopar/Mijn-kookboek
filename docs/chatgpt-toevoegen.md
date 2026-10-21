# Recepten toevoegen vanuit ChatGPT

1. Maak of verfijn een recept in het gesprek.
2. Zeg: **“Voeg dit recept toe aan mijn kookboek en publiceer het.”**
3. ChatGPT leest actuele AGENTS.md, receptcontract en bestaande recepten uit
   tammosopar/Mijn-kookboek en voorkomt duplicaten.
4. ChatGPT valideert en maakt recipes/<id>.json op main, of wijzigt een bestaand
   recept bewust met de actuele GitHub-blob-SHA.
5. De productie-workflow test, bouwt en publiceert automatisch.
6. ChatGPT controleert de deployment en geeft de productielink.

Alleen een recept genereren in het gesprek publiceert nog niets. Deze snelle route
is bedoeld voor receptinhoud. Nieuwe sitefuncties gaan via acceptatie en akkoord;
combineer een recepttoevoeging niet met onbeoordeelde codewijzigingen.

Als de repository technisch een PR vereist, volg die route en meld dat publicatie
op samenvoegen wacht. Schrijf geen tokens in de site en verzin geen persoonlijke
notities. De velden en lokale commando's staan in README.md.

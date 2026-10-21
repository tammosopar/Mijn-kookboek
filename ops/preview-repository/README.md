# Mijn Kookboek — acceptatie

Deze repository publiceert alleen de testomgeving. De broncode en recepten staan
in [Mijn-kookboek](https://github.com/tammosopar/Mijn-kookboek).

`source.json` wijst naar één exacte commit in die repository. Als ChatGPT dit
bestand bijwerkt, controleert en publiceert de workflow de nieuwe acceptatieversie.
Er zijn geen extra tokens, webhookserver of periodieke taken nodig.

Voor de eerste inrichting: zet Settings → Pages → Source op GitHub Actions.
De workflow vereist een bestaande broncommit in plaats van het nulvoorbeeld.
Dit voorbeeld wordt ingevuld door `scripts/prepare_preview_repository.py` in de bronrepository.

De testsite is openbaar en herkenbaar aan de acceptatiebalk. Een geslaagde preview
publiceert nooit naar productie. Er wordt hier geen broncode handmatig onderhouden.

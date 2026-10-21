"""Validate source recipes and build a dependency-free static website."""
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def validate(recipe):
    if not isinstance(recipe, dict):
        raise ValueError('Recept moet een JSON-object zijn')
    required = {'id', 'name', 'type', 'minutes', 'portions', 'emoji', 'ingredients', 'instructions', 'notes'}
    if set(recipe) != required:
        raise ValueError(f'Verwachte velden: {sorted(required)}')
    if not isinstance(recipe['id'], str) or not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', recipe['id']):
        raise ValueError('id moet een slug zijn, zoals pasta-puttanesca')
    for key in ('name', 'type', 'emoji'):
        if not isinstance(recipe[key], str) or not recipe[key].strip():
            raise ValueError(f'{key} moet tekst bevatten')
    if not isinstance(recipe['notes'], str):
        raise ValueError('notes moet tekst zijn')
    for key in ('minutes', 'portions'):
        if type(recipe[key]) is not int or recipe[key] < 1:
            raise ValueError(f'{key} moet een positief geheel getal zijn')
    for key in ('ingredients', 'instructions'):
        if not isinstance(recipe[key], list) or not recipe[key] or not all(isinstance(x, str) and x.strip() for x in recipe[key]):
            raise ValueError(f'{key} moet een niet-lege lijst met tekst zijn')
    return recipe


def load_recipes(directory):
    recipes = []
    for path in sorted(directory.glob('*.json')):
        try:
            recipe = validate(json.loads(path.read_text(encoding='utf-8')))
            if path.stem != recipe['id']:
                raise ValueError('Bestandsnaam moet overeenkomen met id')
            recipes.append(recipe)
        except (ValueError, TypeError) as exc:
            raise ValueError(f'{path.name}: {exc}') from exc
    return sorted(recipes, key=lambda r: r['name'].casefold())


def build(root=ROOT):
    recipes = load_recipes(root / 'recipes')
    output = root / 'dist'
    if output.exists():
        shutil.rmtree(output)
    shutil.copytree(root / 'site', output)
    (output / 'data').mkdir()
    (output / 'data' / 'recipes.json').write_text(json.dumps(recipes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    (output / '.nojekyll').touch()
    print(f'Gebouwd: {len(recipes)} recepten in {output}')


if __name__ == '__main__':
    build()

"""Add one validated recipe; exact retries are safe and edits never overwrite."""
import argparse
import json
from build import ROOT, validate


def add_recipe(recipe, directory):
    validate(recipe)
    directory.mkdir(parents=True, exist_ok=True)
    target = directory / f"{recipe['id']}.json"
    if target.exists():
        if json.loads(target.read_text(encoding='utf-8')) == recipe:
            return target, False
        raise ValueError(f'{target.name} bestaat al met andere inhoud; wijzig bewust of kies een ander id')
    with target.open('x', encoding='utf-8') as handle:
        handle.write(json.dumps(recipe, ensure_ascii=False, indent=2) + '\n')
    return target, True


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('input', help='Pad naar één JSON-recept')
    args = parser.parse_args()
    try:
        with open(args.input, encoding='utf-8') as handle:
            target, created = add_recipe(json.load(handle), ROOT / 'recipes')
        print(f"{'Toegevoegd' if created else 'Al aanwezig'}: {target}")
    except (OSError, ValueError) as exc:
        parser.exit(1, f'Fout: {exc}\n')

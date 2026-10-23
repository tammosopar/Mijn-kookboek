"""Controleer of de preview-inrichting overeenkomt met de beheerde template."""
import argparse
import json
from pathlib import Path
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
PREVIEW = 'tammosopar/Mijn-kookboek-preview'


def check(read):
    template = ROOT / 'ops' / 'preview-repository'
    for path in sorted(template.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(template).as_posix()
        expected = path.read_bytes()
        actual = read(relative)
        if relative == 'source.json':
            # De kandidaat-SHA verschilt bewust van de template.
            expected = json.loads(expected)['source_repository']
            actual = json.loads(actual)['source_repository']
        if actual != expected:
            raise ValueError(f'Preview-inrichting wijkt af: {relative}. Werk de template en previewrepository samen bij.')


def remote_read(path):
    request = Request(f'https://raw.githubusercontent.com/{PREVIEW}/main/{path}', headers={'User-Agent': 'Mijn-kookboek-sync-check'})
    with urlopen(request, timeout=30) as response:
        return response.read()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--directory', type=Path, help='Controleer een lokale preview-inrichting in plaats van GitHub')
    args = parser.parse_args()
    check((lambda path: (args.directory / path).read_bytes()) if args.directory else remote_read)
    print('Preview-inrichting komt overeen met de template.')

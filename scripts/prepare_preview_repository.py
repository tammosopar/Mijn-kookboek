"""Prepare the publication-only preview repository for a pinned source commit."""
import argparse
import json
import re
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def prepare(source_sha, output=None):
    if not re.fullmatch(r'[0-9a-f]{40}', source_sha) or source_sha == '0' * 40:
        raise ValueError('Geef een bestaande, volledige Git-commit-SHA op')
    output = Path(output) if output is not None else ROOT / '.preview-repository'
    if output.exists():
        raise ValueError(f'Uitvoermap bestaat al: {output}; gebruik een nieuwe lege locatie')
    shutil.copytree(ROOT / 'ops' / 'preview-repository', output)
    (output / 'source.json').write_text(json.dumps({
        'source_repository': 'tammosopar/Mijn-kookboek', 'source_sha': source_sha
    }, indent=2) + '\n', encoding='utf-8')
    return output


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source-sha', required=True)
    parser.add_argument('--output', type=Path)
    args = parser.parse_args()
    print(prepare(args.source_sha, args.output))

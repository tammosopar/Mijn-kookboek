import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build import ROOT, build, load_recipes, validate


class CoverTests(unittest.TestCase):
    def test_rejects_unsafe_paths_and_missing_description(self):
        recipe = load_recipes(ROOT / 'recipes')[0]
        for cover in [None, {'src': 'https://example.com/photo.jpg', 'alt': 'Foto'},
                      {'src': 'assets/images/../photo.webp', 'alt': 'Foto'},
                      {'src': 'assets/images/photo.webp', 'alt': ''}]:
            with self.subTest(cover=cover), self.assertRaises(ValueError):
                validate(dict(recipe, cover=cover))

    def test_missing_cover_does_not_destroy_existing_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'recipes').mkdir()
            (root / 'site').mkdir()
            (root / 'site/index.html').write_text('<body></body>')
            build(root)
            recipe = copy.deepcopy(load_recipes(ROOT / 'recipes')[0])
            (root / 'recipes' / f"{recipe['id']}.json").write_text(json.dumps(recipe))
            with self.assertRaisesRegex(ValueError, 'Coverfoto ontbreekt'):
                build(root)
            self.assertTrue((root / 'dist/index.html').exists())
            target = root / 'site' / recipe['cover']['src']
            target.parent.mkdir(parents=True)
            target.write_bytes(b'photo-fixture')
            build(root, 'acceptance', 'a' * 40)
            self.assertEqual((root / 'dist' / recipe['cover']['src']).read_bytes(), b'photo-fixture')
            self.assertEqual(json.loads((root / 'dist/data/recipes.json').read_text())[0]['cover'], recipe['cover'])

import copy
import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build import ROOT, build, load_recipes, validate
from add_recipe import add_recipe


class RecipeTests(unittest.TestCase):
    def setUp(self):
        self.recipe = dict(load_recipes(ROOT / 'recipes')[0])
        self.recipe.pop('cover', None)

    def test_invalid_recipe_is_rejected(self):
        for key, bad in [('id', '../escape'), ('minutes', True), ('portions', 0), ('ingredients', []), ('instructions', 'geen lijst')]:
            with self.subTest(key=key), self.assertRaises(ValueError):
                validate(dict(self.recipe, **{key: bad}))

    def test_structured_ingredient_quantities(self):
        for bad in [True, 0, -1, float('nan'), float('inf'), '200']:
            with self.subTest(quantity=bad), self.assertRaises(ValueError):
                validate(dict(self.recipe, ingredients=[{'quantity': bad, 'unit': 'g', 'name': 'pasta'}]))
        for quantity in [None, 0.5, 200]:
            validate(dict(self.recipe, ingredients=[{'quantity': quantity, 'unit': 'g', 'name': 'pasta'}]))
        validate(dict(self.recipe, ingredients=['200 g pasta']))

    def test_retry_is_safe_and_overwrite_is_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            self.assertTrue(add_recipe(self.recipe, directory)[1])
            self.assertFalse(add_recipe(self.recipe, directory)[1])
            changed = dict(self.recipe, name='Andere naam')
            with self.assertRaises(ValueError):
                add_recipe(changed, directory)
            self.assertEqual(json.loads(next(directory.glob('*.json')).read_text()), self.recipe)

    def test_filename_must_match_id(self):
        with tempfile.TemporaryDirectory() as tmp:
            directory = Path(tmp)
            (directory / 'wrong-name.json').write_text(json.dumps(self.recipe))
            with self.assertRaises(ValueError):
                load_recipes(directory)

    def test_new_recipe_is_automatically_included_in_build(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            (root / 'site').mkdir()
            (root / 'site' / 'index.html').write_text('<!doctype html>')
            add_recipe(self.recipe, root / 'recipes')
            second = copy.deepcopy(self.recipe)
            second['id'] = 'extra-recept'
            second['name'] = 'Extra recept'
            add_recipe(second, root / 'recipes')
            build(root)
            result = json.loads((root / 'dist' / 'data' / 'recipes.json').read_text())
            self.assertEqual({r['id'] for r in result}, {self.recipe['id'], 'extra-recept'})
            self.assertTrue((root / 'dist' / '.nojekyll').exists())


if __name__ == '__main__':
    unittest.main()


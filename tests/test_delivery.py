import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from build import ROOT, build
from prepare_preview_repository import prepare


class DeliveryTests(unittest.TestCase):
    def fixture(self, root):
        (root / 'site').mkdir()
        (root / 'site' / 'index.html').write_text('<!doctype html><body><h1>Kookboek</h1></body>')
        (root / 'recipes').mkdir()

    def test_acceptance_has_banner_and_exact_provenance(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.fixture(root)
            sha = 'a' * 40
            build(root, 'acceptance', sha)
            html = (root / 'dist/index.html').read_text()
            self.assertIn('ACCEPTATIE', html)
            self.assertIn(sha[:8], html)
            self.assertEqual(json.loads((root / 'dist/version.json').read_text())['source_sha'], sha)
            build(root, 'production', sha)
            self.assertNotIn('ACCEPTATIE', (root / 'dist/index.html').read_text())
            self.assertEqual(json.loads((root / 'dist/version.json').read_text())['environment'], 'production')

    def test_invalid_provenance_fails_before_existing_build_changes(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self.fixture(root)
            build(root)
            original = (root / 'dist/index.html').read_bytes()
            for sha in ['main', '<script>', 'a' * 39]:
                with self.assertRaises(ValueError):
                    build(root, 'acceptance', sha)
            self.assertEqual((root / 'dist/index.html').read_bytes(), original)

    def test_prepare_pins_commit_without_copying_source_code(self):
        with tempfile.TemporaryDirectory() as tmp:
            output = prepare('b' * 40, Path(tmp) / 'preview')
            self.assertEqual(json.loads((output / 'source.json').read_text())['source_sha'], 'b' * 40)
            self.assertTrue((output / '.github/workflows/pages.yml').is_file())
            self.assertFalse((output / 'site').exists())
            with self.assertRaises(ValueError):
                prepare('c' * 40, output)

    def test_prepare_rejects_unpinned_or_placeholder_source(self):
        for sha in ['main', '0' * 40, 'a' * 40 + '\necho bad']:
            with self.assertRaises(ValueError):
                prepare(sha)

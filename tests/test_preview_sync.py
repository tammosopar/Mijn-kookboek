import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'scripts'))
from check_preview_sync import ROOT, check


class PreviewSyncTests(unittest.TestCase):
    def read(self, path):
        return (ROOT / 'ops/preview-repository' / path).read_bytes()

    def test_candidate_sha_may_differ(self):
        def read(path):
            if path == 'source.json':
                return b'{"source_repository":"tammosopar/Mijn-kookboek","source_sha":"candidate"}'
            return self.read(path)
        check(read)

    def test_workflow_drift_is_reported(self):
        def read(path):
            return b'changed' if path.endswith('.yml') else self.read(path)
        with self.assertRaisesRegex(ValueError, 'pages.yml'):
            check(read)

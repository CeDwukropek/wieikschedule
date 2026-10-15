import importlib.util
from pathlib import Path
import tempfile
import unittest

spec = importlib.util.spec_from_file_location('staging_setup', Path(__file__).with_name('setup.py'))
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


class ConfigIsolation(unittest.TestCase):
    def test_vercel_secrets_are_filtered_and_local_keys_remain_stable(self):
        with tempfile.TemporaryDirectory() as folder:
            root = Path(folder)
            supplied = root / 'vercel.env'
            supplied.write_text('REACT_APP_SUPABASE_URL="https://production.invalid"\n'
                                'SUPABASE_SERVICE_ROLE_KEY="production-secret"\n'
                                'REACT_APP_N8N_CHAT_WEBHOOK="https://production.invalid/chat"\n'
                                'REACT_APP_FIREBASE_API_KEY="synthetic-public-key"\n'
                                'FIREBASE_PRIVATE_KEY="synthetic\\nprivate"\n'
                                'UNRELATED_SECRET="must-not-be-copied"\n')
            previous = setup.STATE
            try:
                setup.STATE = root / 'state'
                args = type('Args', (), {'env_file': str(supplied), 'n8n_url': 'http://localhost:5678'})()
                setup.prepare(args)
                first = (setup.STATE / 'secrets.json').read_text()
                setup.prepare(args)
                self.assertEqual(first, (setup.STATE / 'secrets.json').read_text())
                client = (setup.STATE / 'client.env').read_text()
                server = (setup.STATE / 'server.env').read_text()
                self.assertIn('synthetic-public-key', client)
                self.assertNotIn('FIREBASE_PRIVATE_KEY', client)
                for value in ('production.invalid', 'production-secret', 'must-not-be-copied'):
                    self.assertNotIn(value, client + server)
                self.assertIn('FIREBASE_PRIVATE_KEY', server)
                self.assertIn('REACT_APP_LOCAL_STAGING="true"', client)
            finally:
                setup.STATE = previous


if __name__ == '__main__':
    unittest.main()

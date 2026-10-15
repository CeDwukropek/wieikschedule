#!/usr/bin/env python3
"""Prepare an isolated native Odysseus integration, never its running checkout."""
import argparse
import json
from pathlib import Path
import secrets
import shutil
import sqlite3
import subprocess

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / '.staging'


def private_file(path, text):
    path.write_text(text)
    path.chmod(0o600)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--worktree', type=Path, required=True)
    parser.add_argument('--origin', required=True)
    parser.add_argument('--endpoint-id', default='')
    parser.add_argument('--model', default='')
    args = parser.parse_args()
    if args.source.resolve() == args.worktree.resolve():
        raise ValueError('A separate integration worktree is required')
    if not (args.worktree / 'routes/schedule_routes.py').is_file():
        raise ValueError('The worktree has no native schedule integration')
    for folder in ('data', 'logs'):
        (args.worktree / folder).mkdir(exist_ok=True)
    target = STATE / 'odysseus-data'
    target.mkdir(mode=0o700, exist_ok=True)
    (STATE / 'odysseus-logs').mkdir(mode=0o700, exist_ok=True)
    data = args.source / 'data'
    if not (target / 'app.db').exists():
        # SQLite backup API gives a consistent snapshot without stopping main Odysseus.
        with sqlite3.connect('file:' + str(data / 'app.db') + '?mode=ro', uri=True) as original:
            with sqlite3.connect(target / 'app.db') as copy:
                original.backup(copy)
        (target / 'app.db').chmod(0o600)
        for name in ('auth.json', '.app_key', '.key', 'memory.json'):
            if (data / name).is_file():
                shutil.copyfile(data / name, target / name)
                (target / name).chmod(0o600)
    config = {
        'ODYSSEUS_INTEGRATION_ROOT': str(args.worktree.resolve()), 'STAGING_APP_ORIGIN': args.origin,
        'SCHEDULE_MODEL_ENDPOINT_IDS': args.endpoint_id, 'SCHEDULE_DEFAULT_MODEL': args.model,
    }
    private_file(STATE / 'local-ai.env', ''.join(key + '=' + json.dumps(value) + '\n' for key, value in config.items()))
    token_file = STATE / 'odysseus-access-token.txt'
    if not token_file.exists():
        # Create one new scoped token IN THE COPY using the original image's native libraries.
        token = 'ody_' + secrets.token_urlsafe(32)
        script = '''import sys, json, uuid, bcrypt
from core.database import SessionLocal, ApiToken
from core.auth import AuthManager
token=sys.stdin.readline().strip()
auth=AuthManager('/app/data/auth.json')
owners=[name for name in auth._config.get('users',{}) if auth.is_admin(name)]
if not owners: raise RuntimeError('No admin in copied auth config')
with SessionLocal() as db:
 db.add(ApiToken(id=str(uuid.uuid4()),owner=owners[0],name='Schedule staging integration',token_hash=bcrypt.hashpw(token.encode(),bcrypt.gensalt()).decode(),token_prefix=token[:8],scopes='chat',is_active=True))
 db.commit()
'''
        command = ['docker','run','--rm','-i','--network','none','--entrypoint','python',
                   '--mount',f'type=bind,src={args.worktree.resolve()},dst=/app,readonly',
                   '--mount',f'type=bind,src={target.resolve()},dst=/app/data',
                   '-e','DATABASE_URL=sqlite:////app/data/app.db','-e','ODYSSEUS_DATA_DIR=/app/data',
                   'odysseus-custom:local','-c',script]
        subprocess.run(command, input=token+'\n', text=True, check=True, stdout=subprocess.DEVNULL)
        private_file(token_file, token+'\n')
    print('Isolated native Odysseus configuration prepared; access token remains in .staging/odysseus-access-token.txt')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Local integration setup failed:', type(error).__name__)
        raise SystemExit(1)

#!/usr/bin/env python3
"""Local staging manager. Never executes or imports the user's Vercel env file."""
import argparse
import base64
import hashlib
import hmac
import json
import os
from pathlib import Path
import secrets
import shlex
import shutil
import subprocess
import sys
import time
import urllib.request
import http.cookiejar

ROOT = Path(__file__).resolve().parents[2]
STATE = ROOT / '.staging'
COMPOSE = ['docker', 'compose', '--env-file', str(STATE / 'compose.env'),
           '-f', str(ROOT / 'ops/staging/compose.yml')]
CLIENT_KEYS = ['REACT_APP_FIREBASE_' + suffix for suffix in (
    'API_KEY', 'AUTH_DOMAIN', 'PROJECT_ID', 'APP_ID', 'MESSAGING_SENDER_ID', 'STORAGE_BUCKET', 'MEASUREMENT_ID')]
ADMIN_KEYS = ['FIREBASE_PROJECT_ID', 'FIREBASE_CLIENT_EMAIL', 'FIREBASE_PRIVATE_KEY']


def private_file(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)
    path.chmod(0o600)


def read_vercel_env(path):
    if not path.exists():
        return {}
    lexer = shlex.shlex(path.read_text(), posix=True)
    lexer.whitespace_split = True
    lexer.commenters = '#'
    values = {}
    for item in lexer:
        if item == 'export':
            continue
        if '=' not in item:
            raise ValueError('Invalid env assignment; use a standard Vercel dotenv export')
        key, value = item.split('=', 1)
        values[key] = value
    return values


def env_text(values):
    # Compose handles double-quoted escapes; escape interpolation explicitly.
    return ''.join(key + '=' + json.dumps(str(value), ensure_ascii=True).replace('$', '$$') + '\n'
                   for key, value in values.items())


def jwt(role, secret):
    def part(value):
        return base64.urlsafe_b64encode(json.dumps(value, separators=(',', ':')).encode()).rstrip(b'=')
    body = part({'alg': 'HS256', 'typ': 'JWT'}) + b'.' + part({
        'role': role, 'iss': 'local-staging', 'iat': int(time.time()), 'exp': int(time.time()) + 31536000})
    signature = base64.urlsafe_b64encode(hmac.new(secret.encode(), body, hashlib.sha256).digest()).rstrip(b'=')
    return (body + b'.' + signature).decode()


def prepare(args):
    STATE.mkdir(mode=0o700, exist_ok=True)
    STATE.chmod(0o700)
    secret_file = STATE / 'secrets.json'
    if secret_file.exists():
        local = json.loads(secret_file.read_text())
    else:
        local = {key: secrets.token_hex(32) for key in (
            'postgres', 'authenticator', 'jwt_secret', 'n8n_encryption', 'n8n_owner_password')}
        local['anon_jwt'] = jwt('anon', local['jwt_secret'])
        local['service_jwt'] = jwt('service_role', local['jwt_secret'])
        local['n8n_owner_password'] = 'StagingA1-' + local['n8n_owner_password'][:48]
        private_file(secret_file, json.dumps(local, indent=2) + '\n')
    supplied = read_vercel_env(Path(args.env_file))
    client = {key: supplied.get(key, '') for key in CLIENT_KEYS}
    client.update(REACT_APP_LOCAL_STAGING='true', REACT_APP_ENABLE_AI_CHAT='true',
                  REACT_APP_API_BASE_URL='', REACT_APP_SUPABASE_URL='http://localhost:3100/supabase',
                  REACT_APP_SUPABASE_ANON_KEY=local['anon_jwt'], REACT_APP_N8N_CHAT_WEBHOOK='/staging/chat')
    # Never copy production Supabase credentials, webhook URLs or unrelated secrets.
    server = {key: supplied[key] for key in ADMIN_KEYS if supplied.get(key)}
    server['SUPABASE_SERVICE_ROLE_KEY'] = local['service_jwt']
    client_content = env_text(client)
    private_file(STATE / 'client.env', client_content)
    private_file(STATE / 'server.env', env_text(server))
    private_file(STATE / 'compose.env', env_text({
        'STAGING_POSTGRES_PASSWORD': local['postgres'], 'STAGING_AUTHENTICATOR_PASSWORD': local['authenticator'],
        'STAGING_JWT_SECRET': local['jwt_secret'], 'STAGING_N8N_ENCRYPTION_KEY': local['n8n_encryption'],
        'STAGING_N8N_PUBLIC_URL': args.n8n_url, 'CLIENT_CONFIG_HASH': hashlib.sha256(client_content.encode()).hexdigest()}))
    private_file(STATE / 'n8n-owner.txt', 'Local test editor only\nEmail: staging@example.invalid\nPassword: ' + local['n8n_owner_password'] + '\n')
    workflow_dir = STATE / 'workflows'
    workflow_dir.mkdir(mode=0o700, exist_ok=True)
    preview = json.loads((ROOT / 'integrations/schedule-import/n8n-preview.json').read_text())
    preview['id'] = 'wksStageImport01'
    private_file(workflow_dir / 'import-preview.json', json.dumps(preview, ensure_ascii=False) + '\n')
    print('Local credentials/config prepared; Firebase web config:',
          all(client.get(key) for key in CLIENT_KEYS[:4]), '; Firebase API config:', all(server.get(key) for key in ADMIN_KEYS))


def pg(sql=None, *, file=None, capture=True):
    command = COMPOSE + ['exec', '-T', 'postgres', 'psql', '-X', '-v', 'ON_ERROR_STOP=1',
                         '-U', 'postgres', '-d', 'schedule_staging']
    if file:
        with Path(file).open('rb') as stream:
            subprocess.run(command, stdin=stream, check=True)
        return ''
    return subprocess.check_output(command + ['-Atc', sql], text=True).strip() if capture else subprocess.run(command + ['-c', sql], check=True)


def node_cli(arguments, destination):
    with Path(destination).open('wb') as stream:
        subprocess.run(['docker', 'run', '--rm', '--network', 'none', '--read-only',
                        '--mount', f'type=bind,src={ROOT},dst=/work,readonly',
                        '--workdir', '/work', '--entrypoint', 'node', 'node:22-bookworm-slim',
                        'integrations/schedule-import/cli.cjs'] + arguments, stdout=stream, check=True)
    Path(destination).chmod(0o600)


def seed(args):
    marker = pg("SELECT name FROM public.staging_marker")
    if marker != 'wieikschedule-local-staging':
        raise ValueError('Refusing to seed an unmarked database')
    for function, migration in [('apply_wieik_import', '20261014_wieik_import.sql'),
                                ('bootstrap_wieik_import', '20261015_unlinked_bootstrap.sql')]:
        initialized = pg("SELECT to_regprocedure('public." + function + "(jsonb,jsonb)') IS NOT NULL") == 't'
        if not initialized:
            pg(file=ROOT / 'DB/migrations' / migration)
    pg("NOTIFY pgrst, 'reload schema'")
    if int(pg('SELECT count(*) FROM public.events WHERE source_system IS NOT NULL')):
        print('Source identities already initialized; seed skipped without changing data')
        return
    source = Path(args.events_csv)
    if not source.is_file():
        raise ValueError('Provide the events CSV via --events-csv')
    folder = STATE / 'seed'
    folder.mkdir(mode=0o700, exist_ok=True)
    shutil.copyfile(source, folder / 'events.csv')
    if int(pg('SELECT count(*) FROM public.events')) == 0:
        command = COMPOSE + ['exec', '-T', 'postgres', 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-d', 'schedule_staging', '-c',
                            'COPY public.events (id,faculty,date,start_time,duration_min,subject,instructor,room,"group",type,status) FROM STDIN WITH (FORMAT csv, HEADER true)']
        with source.open('rb') as stream:
            subprocess.run(command, stdin=stream, check=True)
    for db in ('stac', 'block'):
        with urllib.request.urlopen('https://plany.wieik.pk.edu.pl/lib/tpl/kiwiki/wk_plan_api.php?action=load&db=' + db, timeout=30) as response:
            private_file(folder / (db + '.json'), response.read().decode())
    node_cli(['transform', '/work/.staging/seed/stac.json', '/work/.staging/seed/block.json'], folder / 'normalized.json')
    node_cli(['bootstrap', '/work/.staging/seed/normalized.json', '/work/.staging/seed/events.csv', '--confirm-no-personal-event-data'], folder / 'bootstrap.json')
    plan = json.loads((folder / 'bootstrap.json').read_text())
    literal = lambda value: "'" + json.dumps(value, ensure_ascii=False).replace("'", "''") + "'::jsonb"
    # Fixed trusted function and SQL quoting; no shell evaluation of source data.
    private_file(folder / 'apply.sql', "SET standard_conforming_strings=on;\nSET ROLE service_role;\nSELECT public.bootstrap_wieik_import(" +
                 literal(plan['rpc']['p_expected']) + ',' + literal(plan['rpc']['p_changes']) + ');\n')
    pg(file=folder / 'apply.sql')
    print('Staging seeded:', pg('SELECT count(*) FROM public.events'), 'rows; production not accessed')


def n8n_setup(args):
    local = json.loads((STATE / 'secrets.json').read_text())
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
    def request(path, body=None):
        data = json.dumps(body).encode() if body is not None else None
        req = urllib.request.Request('http://127.0.0.1:5678/rest/' + path, data=data,
                                     headers={'Content-Type': 'application/json'})
        with opener.open(req, timeout=20) as response:
            return json.load(response)
    settings = None
    for attempt in range(30):
        try:
            settings = request('settings')['data']
            break
        except OSError:
            if attempt == 29:
                raise
            time.sleep(2)
    if settings['userManagement']['showSetupOnFirstLoad']:
        if len(local['n8n_owner_password']) > 64 or not any(char.isupper() for char in local['n8n_owner_password']):
            local['n8n_owner_password'] = 'StagingA1-' + local['n8n_owner_password'][-48:]
            private_file(STATE / 'secrets.json', json.dumps(local, indent=2) + '\n')
            private_file(STATE / 'n8n-owner.txt', 'Local test editor only\nEmail: staging@example.invalid\nPassword: ' + local['n8n_owner_password'] + '\n')
        owner = request('owner/setup', {'email': 'staging@example.invalid', 'firstName': 'Schedule',
                                        'lastName': 'Staging', 'password': local['n8n_owner_password']})['data']
        private_file(STATE / 'n8n-state.json', json.dumps({'owner_id': owner['id']}) + '\n')
        print('Local n8n owner initialized; credentials are stored in .staging/n8n-owner.txt')
    state_file = STATE / 'n8n-state.json'
    if not state_file.exists():
        raise ValueError('Existing n8n owner differs from this setup; keep instance intact')
    owner_id = json.loads(state_file.read_text())['owner_id']
    for file in ('/workflows/generated/import-preview.json', '/workflows/staging/staging-chat.json'):
        subprocess.run(COMPOSE + ['exec', '-T', 'n8n', 'n8n', 'import:workflow', '--input=' + file,
                                  '--userId=' + owner_id], check=True)
    subprocess.run(COMPOSE + ['exec', '-T', 'n8n', 'n8n', 'publish:workflow', '--id=wksStageChat0001'], check=True)
    subprocess.run(COMPOSE + ['restart', 'n8n'], check=True)
    print('Read-only connection workflow published; source preview remains manual/inactive')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['prepare', 'seed', 'n8n'])
    parser.add_argument('--env-file', default=str(ROOT / '.env.local'))
    parser.add_argument('--n8n-url', default='http://localhost:5678')
    parser.add_argument('--events-csv', default='')
    args = parser.parse_args()
    if args.command == 'prepare':
        prepare(args)
    elif args.command == 'seed':
        seed(args)
    else:
        n8n_setup(args)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        # Avoid printing config/keys via exception payloads or subprocess arguments.
        print('Staging setup failed:', type(error).__name__, file=sys.stderr)
        sys.exit(1)

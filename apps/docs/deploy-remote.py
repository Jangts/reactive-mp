"""Validate and replace only the selected Pages directories; CONFIG arrives over SSH stdin."""
import contextlib
import fcntl
import hashlib
import json
import pathlib
import re
import shutil
import tarfile
import tempfile

root = pathlib.Path(CONFIG['pagesRoot'])
archive = pathlib.Path(CONFIG['upload'])
sites = sorted(CONFIG['sites'])
if not root.is_absolute() or not root.is_dir() or root.is_symlink():
    raise ValueError('Invalid Pages root')
if not (root / '.shared/404.html').is_file():
    raise ValueError('Pages must be configured before publishing')
if not sites or any(not re.fullmatch(r'reactive-mp(?:-[a-z0-9]+)*-docs', s) for s in sites):
    raise ValueError('Invalid Reactive MP site name')

with contextlib.ExitStack() as locks:
    for site in sites:
        lock = locks.enter_context((root / ('.deploy-' + site + '.lock')).open('a'))
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
    stage = pathlib.Path(tempfile.mkdtemp(prefix='.deploy-reactive-mp-', dir=root))
    backup = pathlib.Path(tempfile.mkdtemp(prefix='.backup-reactive-mp-', dir=root))
    installed = []
    moved = []
    try:
        if hashlib.sha256(archive.read_bytes()).hexdigest() != CONFIG['digest']:
            raise ValueError('Upload checksum mismatch')
        with tarfile.open(archive, 'r:gz') as bundle:
            for member in bundle.getmembers():
                name = pathlib.PurePosixPath(member.name)
                if (not (member.isfile() or member.isdir()) or name.is_absolute()
                        or '..' in name.parts or (name.parts and name.parts[0] not in sites)):
                    raise ValueError('Archive entry is outside the selected sites or not regular')
            bundle.extractall(stage)
        actual = {}
        for entry in stage.rglob('*'):
            if entry.is_file():
                actual[str(entry.relative_to(stage))] = hashlib.sha256(entry.read_bytes()).hexdigest()
            entry.chmod(0o755 if entry.is_dir() else 0o644)
        if actual != CONFIG['files']:
            raise ValueError('Published files differ from the build')
        for site in sites:
            if not (stage / site / 'index.html').stat().st_size:
                raise ValueError('Missing site homepage')
            target = root / site
            if target.is_symlink() or (target.exists() and not target.is_dir()):
                raise ValueError('Refusing to replace a non-directory site')
        try:
            for site in sites:
                target = root / site
                if target.exists():
                    target.rename(backup / site)
                    moved.append(site)
                (stage / site).rename(target)
                installed.append(site)
        except BaseException:
            for site in reversed(installed):
                shutil.rmtree(root / site)
            for site in reversed(moved):
                (backup / site).rename(root / site)
            raise
        print(json.dumps({'published': sites, 'verifiedFiles': len(actual)}), flush=True)
    finally:
        shutil.rmtree(stage)
        # Keep any backup that could not be restored after a filesystem failure.
        if not any(backup.iterdir()) or len(installed) == len(sites):
            shutil.rmtree(backup)
        archive.unlink(missing_ok=True)

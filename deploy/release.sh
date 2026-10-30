#!/usr/bin/env bash
set -Eeuo pipefail
artifact=${1:?artifact required}
sha=${2:?commit SHA required}
public_url=${FRONTEND_PUBLIC_URL:?FRONTEND_PUBLIC_URL is required}
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || exit 2
[[ "$public_url" =~ ^https://[^/]+$ ]] || { echo "FRONTEND_PUBLIC_URL must be an exact HTTPS origin" >&2; exit 2; }
root=/opt/ecgrhythmia-frontend
exec 9>"$root/.release.lock"
flock -n 9 || { echo "Another deployment is running"; exit 2; }
release="$root/releases/$sha"
[[ ! -e "$release" ]] || { echo "Immutable release exists"; exit 2; }
mkdir -p "$release"
python3 - "$artifact" <<'PY'
import sys,tarfile,pathlib
with tarfile.open(sys.argv[1]) as archive:
 members=archive.getmembers()
 assert sum(member.size for member in members)<400*1024*1024, "Oversized artifact"
 for member in members:
  path=pathlib.PurePosixPath(member.name)
  assert not path.is_absolute() and '..' not in path.parts, "Unsafe artifact path"
  assert member.isfile() or member.isdir(), "Artifact links/devices prohibited"
  assert not member.mode & 0o7000, "Unsafe artifact permissions"
PY
tar -xzf "$artifact" -C "$release" --no-same-owner --no-same-permissions
(cd "$release"; sha256sum -c SHA256SUMS)
python3 -c 'import json,sys; assert json.load(open(sys.argv[1]))["release"]==sys.argv[2]' "$release/version.json" "$sha"
previous=$(readlink -f "$root/current" || true)
ln -s "$release" "$root/current.next"
mv -Tf "$root/current.next" "$root/current"
if ! curl --max-time 10 --fail --silent "$public_url/version.json" | python3 -c 'import json,sys; assert json.load(sys.stdin)["release"]==sys.argv[1]' "$sha"; then
 if [[ -n "$previous" && "$previous" == "$root/releases/"* ]]; then
  ln -s "$previous" "$root/current.rollback"; mv -Tf "$root/current.rollback" "$root/current"
 fi
 echo "Frontend readiness failed; previous artifact restored" >&2
 exit 1
fi

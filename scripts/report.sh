#!/usr/bin/env bash
# Saves a short build report (status + the end of the log) on the "build-reports" branch, so the result can be read
# without opening the Actions page. Never contains secrets: the log is the build output only.
set -u
PLATFORM="$1"; STATUS="$2"
LOG="${RUNNER_TEMP:-/tmp}/build.log"
DIR="$(mktemp -d)"
git config --global user.name "VooSquare build bot"
git config --global user.email "build-bot@users.noreply.github.com"
REPO_URL="$(git config --get remote.origin.url)"
# Reuse the checkout's auth (private repository) for the clone and the push
git config --global http.https://github.com/.extraheader "$(git -C "${GITHUB_WORKSPACE:-.}" config --get http.https://github.com/.extraheader)"
cd "$DIR"
if git clone --quiet --depth 1 --branch build-reports "$REPO_URL" r 2>/dev/null; then cd r; else mkdir r && cd r && git init --quiet && git checkout --quiet -b build-reports && git remote add origin "$REPO_URL"; fi
{
  echo "platform: $PLATFORM"
  echo "status: $STATUS"
  echo "run: $GITHUB_RUN_NUMBER ($GITHUB_SHA)"
  echo "date: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "----- last 250 lines of the build log -----"
  tail -n 250 "$LOG" 2>/dev/null | grep -v -i -E 'password|secret|token|p8' || true
} > "$PLATFORM.txt"
git add "$PLATFORM.txt"
git commit --quiet -m "$PLATFORM build $GITHUB_RUN_NUMBER: $STATUS" || exit 0
git push --quiet origin build-reports || git push --quiet -u origin build-reports || true

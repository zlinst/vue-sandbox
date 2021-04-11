#!/usr/bin/env bash

set -e

REPO_URL="$(git config --get remote.origin.url)"
AUTHOR_NAME="$(git config --get user.name)"
AUTHOR_EMAIL="$(git config --get user.email)"

cd dist

rm -rf .git
git init
git remote add origin "$REPO_URL"
git config user.name "$AUTHOR_NAME"
git config user.email "$AUTHOR_EMAIL"
git checkout -b gh-pages
git add index.html js/*
git commit -m "Update github pages"
git push -f --set-upstream origin gh-pages

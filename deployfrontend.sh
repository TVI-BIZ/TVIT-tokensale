rsync -r src/ docs/
rsync build/contracts/* docs/
git aff .
git add -A
git commit -m "Compile assets for the github pages"
git push -u origin2 master

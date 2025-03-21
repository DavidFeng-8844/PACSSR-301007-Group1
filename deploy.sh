npm run build
cd dist
git init
git add -A
git commit -m "deploy"
git push -f https://github.com/DavidFeng-8844/PACSSR-301007-Group5.git main:gh-pages
cd ..

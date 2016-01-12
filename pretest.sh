mkdir -p ./spec/fauxgitaboudit
cd ./spec/fauxgitaboudit
git init
echo "{\"version\": \"0.1.0\"}" > ./package.json
git add .
git commit -m "initial commit"
echo 1 > change.log
git add .
git commit -m "commit 1"
echo 2 >> change.log
git add .
git commit -m "commit 2"
echo 3 > change.log
git add .
git commit -m "commit 3"
echo 4 > change.log
git add .
git commit -m "commit 4"
echo 5 > change.log
git add .
git commit -m "commit 5"
echo "{\"version\": \"0.1.1\"}" > ./package.json
echo 6 > change.log
git add .
git commit -m "commit 6"
echo 7 > change.log
git add .
git commit -m "commit 7"
echo 8 > change.log
git add .
git commit -m "commit 8"
echo "{\"version\":\"0.1.1\",\"name\":\"test\"}" > ./package.json
echo 9 > change.log
git add .
git commit -m "commit 9"
echo 10 > change.log
git add .
git commit -m "commit 10"

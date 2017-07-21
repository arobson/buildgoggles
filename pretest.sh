mkdir -p ./spec/fauxgitaboudit
mkdir ./spec/fauxgitaboudit/alpha
mkdir ./spec/fauxgitaboudit/subdir
cd ./spec/fauxgitaboudit
git init
echo "{\"version\": \"4.5.4\"}" > ./package.json
echo "{\"version\": \"2.0.0\"}" > ./alpha/package.json
echo "{\"version\": \"1.0.0\"}" > ./subdir/package.json
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
echo "{\"version\": \"4.5.5\"}" > ./package.json
echo 6 > change.log
git add .
git commit -m "commit 6"
echo 7 > change.log
git add .
git commit -m "commit 7"
echo 8 > change.log
git add .
git commit -m "commit 8"
echo "{\"version\": \"4.5.6\",\"name\":\"test\",\"dependencies\":{\"standard-version\":\"2.1.2\"}}" > ./package.json
echo 9 > change.log
git add .
git commit -m "commit 9"
echo 10 > change.log
git add .
git commit -m "commit 10"

## buildgoggles
A way to capture git repository information for CI builds.

[![npm version][npm-image]][npm-url]
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

### Rationale
buildgoggles was created to solve the challenge of collecting metadata about a particular commit consistently despite the build context. Doing this allows build tooling to uniquely and consistently identify built artifacts in a way that ties them to the commit and allows for reliable ordering of artifacts by delivery tooling. buildgoggles collects this information primarily from git and environment information from build environment contexts when available (Travis/Drone environment variables) and then writes it in a json file (or returns it via a promise).

### How build number is calculated
To get a consistent build number without tracking builds in a centralized store, buildgoggles counts the number of commits that have occurred since the latest version was put in place.

### How The LTS Check is determined
The version is pulled from the process and then compared against a set of dates published by the Node team. Since it was subject to change, it might be out of date. Open an issue (or better yet a PR) if you believe this is incorrect.

### Installation

```bash
npm install buildgoggles -g
```

### CLI
Running the command will either write `.buildinfo.json` or exit with a non-zero code.

__If run from the repository__
```bash
buildgoggles
```

__If run outside the repository__
```bash
buildgoggles /path/to/repo
```

__sample output__

> Note: the slug is the abbreviated commit sha

```json
{
	"owner": "arobson",
	"repository": "build-goggles",
	"branch": "master",
	"version": "0.1.0",
	"build": 1,
	"slug": "a1b2c3d4",
	"tag": "arobson_build-goggles_master_0.1.0_1_a1b2c3d4",
  "isLTS": true,
  "commitMessage": "the commit message",
  "ci": {
    "inCI": "true",
    "tagged": false,
    "pullRequest": false
  }
}
```

### Tag Options
You can change the format of the tag by providing a spec composed of segment abbreviations delimited by `_`s. You can even supply multiple tag specifications delimited by `,`s.

 * lm - will conditionally add `latest` tag to master branch builds
 * lt - will conditionally add `latest` tag to tagged builds
 * o - repository owner name
 * r - repository name
 * b - branch name
 * v - full semantic version
 * c - commit count since last semantic version change
 * s - commit sha slug
 * ma - major version number
 * mi - minor version number
 * p - patch number
 * miv - semantic version (major.minor, excludes patch)

### Examples

__Default Tag Format__
```bash
buildgoggles --tag=o_r_b_v_c_s
```

Resulting json (abbreviated): 
```json
{
	"tag": "owner_repo_branch_version_count_sha"
}
```

__Abbreviated Tag__
```bash
buildgoggles --tag=v_c_s
```

Resulting json (abbreviated): 
```json
{
	"tag": "version_count_sha"
}
```

__Multiple Tags__
```bash
buildgoggles --tag=v_c_s,miv,ma
```

Resulting json (abbreviated): 
```json
{
	"tag": [ "version_count_sha", "major.minor", "major" ]
}
```

### API
Using the API produces the same results and takes the same input and produces the same output.

```js
const goggles = require('buildgoggles')

// all calls write to ./.buildinfo.json on success

// defaults - repo at './' and tag format 'o_r_b_v_c_s'
goggles.getInfo()
  .then(info => {})

// repo at '/custom/repo/path' and default tag format 'o_r_b_v_c_s'
goggles.getInfo({ repo: '/custom/repo/path' })
  .then(info => {})

// default repo at './' and default tag format 'v_c_s,v,miv,ma'
goggles.getInfo({ tags: [ 'v_c_s', 'v', 'miv', 'ma' ] })
  .then(info > {})
```

[npm-url]: https://www.npmjs.com/package/buildGoggles
[npm-image]: https://img.shields.io/npm/v/buildGoggles.svg

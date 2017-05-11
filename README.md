## build-goggles
A way to capture git repository information for CI builds.

[![Build Status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![NPM version][npm-image]][npm-url]

### Rationale
Our dev team has the ability to deploy code from all forks and branches. That means we need to include information as part of any build artifact to uniquely identify where a particular build came from. build-goggles is a simple command line utilty that will get 6 pieces of information about a build and write it to a JSON file for use by other processes.

### How build number is calculated
To get a consistent build number without tracking builds in a centralized store, we count the number of commits that have occurred since the latest version was put in place.

### Installation

```bash
npm install buildgoggles -g
```

### Use
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
	"tag": "arobson_build-goggles_master_0.1.0_1_a1b2c3d4"
}
```

### Tag Options
You can change the format of the tag by providing a spec composed of segment abbreviations delimited by `_`s. You can even supply multiple tag specifications delimited by `,`s.

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

[travis-url]: https://travis-ci.org/arobson/buildGoggles
[travis-image]: https://travis-ci.org/arobson/buildgoggles.svg?branch=master
[coveralls-url]: https://coveralls.io/github/arobson/buildgoggles?branch=master
[coveralls-image]: https://coveralls.io/repos/github/arobson/buildgoggles/badge.svg?branch=master
[npm-url]: https://www.npmjs.com/package/buildGoggles
[npm-image]: https://img.shields.io/npm/v/buildGoggles.svg

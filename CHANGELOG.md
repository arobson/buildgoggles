# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.2.3"></a>
## [0.2.3](https://github.com/arobson/buildgoggles/compare/v0.2.0...v0.2.3) (2017-05-17)


### Bug Fixes

* add before_script to travis build to address git config ([425574a](https://github.com/arobson/buildgoggles/commit/425574a))
* change to test script arg ordering ([4f99874](https://github.com/arobson/buildgoggles/commit/4f99874))
* correct implicit path detection when specifying tag format ([69ba470](https://github.com/arobson/buildgoggles/commit/69ba470))
* pull owner, repo and branch from envirnment variables for Travis or Drone when detected ([41382d6](https://github.com/arobson/buildgoggles/commit/41382d6))
* remove bad require from git module ([cb6cc4e](https://github.com/arobson/buildgoggles/commit/cb6cc4e))

### 0.2.1

* Bugfix - remove errant require from git module 

### 0.2.0

* Adds support for custom tag format
* Adds support for multiple tags
* Removes lodash dependency

## 0.1.x

### 0.1.5
Adds an underscore delimited tag to the `.buildinfo.json` file.

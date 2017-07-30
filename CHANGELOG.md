# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="0.5.1"></a>
## [0.5.1](https://github.com/arobson/buildgoggles/compare/v0.5.0...v0.5.1) (2017-07-30)



<a name="0.5.0"></a>
# [0.5.0](https://github.com/arobson/buildgoggles/compare/v0.4.1...v0.5.0) (2017-07-28)


### Features

* add lt and lm flags to support adding conditional latest tags to builds ([eefb5ed](https://github.com/arobson/buildgoggles/commit/eefb5ed))



<a name="0.4.1"></a>
## [0.4.1](https://github.com/arobson/buildgoggles/compare/v0.4.0...v0.4.1) (2017-07-21)


### Bug Fixes

* repositories with multiple version sources now pick the highest available in the directory structure ([732e823](https://github.com/arobson/buildgoggles/commit/732e823))



<a name="0.4.0"></a>
# [0.4.0](https://github.com/arobson/buildgoggles/compare/v0.3.0...v0.4.0) (2017-05-24)


### Features

* add additional metadata to build information ([dd558cc](https://github.com/arobson/buildgoggles/commit/dd558cc))



<a name="0.3.0"></a>
# [0.3.0](https://github.com/arobson/buildgoggles/compare/v0.2.0...v0.3.0) (2017-05-19)


### Bug Fixes

* add before_script to travis build to address git config ([425574a](https://github.com/arobson/buildgoggles/commit/425574a))
* change to test script arg ordering ([4f99874](https://github.com/arobson/buildgoggles/commit/4f99874))
* correct implicit path detection when specifying tag format ([69ba470](https://github.com/arobson/buildgoggles/commit/69ba470))
* pull owner, repo and branch from envirnment variables for Travis or Drone when detected ([41382d6](https://github.com/arobson/buildgoggles/commit/41382d6))
* remove bad require from git module ([cb6cc4e](https://github.com/arobson/buildgoggles/commit/cb6cc4e))


### Features

* support programmatic use ([28d5efa](https://github.com/arobson/buildgoggles/commit/28d5efa))



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

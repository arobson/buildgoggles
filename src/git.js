const when = require('when')
const exec = require('./command')
const versions = require('./version')
const fs = require('fs')
const syspath = require('path')
const format = require('util').format

function checkLTS () {
  const version = /v([0-9]+)/.exec(process.version)[ 1 ]
  const schedule = {
    '6': new Date('2016-10-18'),
    '8': new Date('2017-10-01'),
    '10': new Date('2018-10-01')
  }
  const startDate = schedule[ version ]
  if (startDate) {
    const today = new Date()
    return today >= startDate
  } else {
    return false
  }
}

function checkForCIPR () {
  if (process.env.TRAVIS) {
    return process.env.TRAVIS_PULL_REQUEST_BRANCH !== ''
  } else if (process.env.DRONE) {
    return process.env.DRONE_BUILD_EVENT === 'pull_request'
  }
}

function checkForCITag () {
  if (process.env.TRAVIS) {
    return process.env.TRAVIS_TAG !== ''
  } else if (process.env.DRONE) {
    return process.env.DRONE_BUILD_EVENT === 'tag'
  }
}

function createInfo (path, branch, build, commit, owner, repo, format, message) {
  const verionParts = build.version ? build.version.split('.') : [ '0', '0', '0' ]
  const major = verionParts[ 0 ]
  const minor = verionParts.length > 1 ? verionParts[ 1 ] : '0'
  const patch = verionParts.length > 2 ? verionParts[ 2 ] : '0'
  const tag = getTags(branch, build, commit, owner, repo, major, minor, patch, format)
  return {
    ci: {
      inCI: !!((process.env.DRONE || process.env.TRAVIS)),
      tagged: checkForCITag(),
      pullRequest: checkForCIPR()
    },
    isLTS: checkLTS(),
    commitMessage: message,
    branch: branch,
    version: build.version,
    build: build.count,
    commit: commit,
    owner: owner,
    path: syspath.resolve(path),
    repository: repo,
    major: major,
    minor: minor,
    patch: patch,
    major_version: major,
    minor_version: [ major, minor ].join('.'),
    tag: tag,
    slug: commit.slice(0, 8)
  }
}

function filter (list) {
  if (!list) {
    return []
  } else {
    return list.reduce((acc, x) => {
      if (x) {
        acc.push(x)
      }
      return acc
    }, [])
  }
}

function getBranch (path) {
  if (process.env.DRONE) {
    return when.resolve(process.env.DRONE_BRANCH)
  } else if (process.env.TRAVIS) {
    return when.resolve(process.env.TRAVIS_BRANCH)
  } else {
    return exec('git rev-parse --abbrev-ref HEAD', path)
      .then(
        branch => {
          return branch.trim()
        },
        () => {
          return 'master'
        }
      )
  }
}

function getBuildNumber (path) {
  return versions.getFile(path)
    .then((file) => {
      return getCommitsSinceCurrentVersion(path, file)
    })
}

function getCommit (path) {
  return exec('git rev-parse HEAD', path)
    .then(
      commit => {
        return commit.trim()
      },
      () => {
        return 'none'
      }
    )
}

function getHeadComment (path) {
  const command = "git log -n 1 --pretty='%B'"
  return exec(command, path)
    .then(
      list => {
        return list.split('\n').reduce((acc, line) => {
          if (line && line !== '') {
            acc.push(line)
          }
          return acc
        }, []).join(' ')
      },
      () => {
        return ''
      })
}

function getCommitCount (path, version, sha, time) {
  const command = format('git log --since=%s %s..HEAD --pretty=%H', time, sha)
  return exec(command, path)
    .then(
      list => {
        return {
          version: version,
          count: filter(list.split('\n')).length + 1
        }
      },
      () => {
        return 0
      })
}

function getCommitsSinceCurrentVersion (path, filePath) {
  const currentVersion = getCurrentVersion(path, filePath)
  return getCommitsSinceVersion(path, filePath, currentVersion)
}

function getCommitsSinceVersion (path, filePath, version) {
  return getFirstCommitForVersion(path, filePath, version)
    .then(firstCommitAndDate => {
      if (firstCommitAndDate) {
        return getCommitCount(path, version, firstCommitAndDate[0], firstCommitAndDate[1])
      } else {
        return {
          version: version,
          count: 0
        }
      }
    })
}

function getCurrentVersion (path, filePath) {
  if (filePath) {
    const relativePath = syspath.resolve(path, filePath)
    const fileContent = fs.readFileSync(relativePath).toString()
    return versions.getVersion(filePath, fileContent)
  } else {
    return versions.getFile(path)
      .then(filePath => {
        return getCurrentVersion(path, filePath)
      })
  }
}

function getFirstCommitForVersion (path, filePath, version) {
  const regex = versions.getTemplate(filePath, version)
  const command = format("git log -S'%s' --pickaxe-regex --pretty='%H|%ct' %s", regex, filePath)
  return exec(command, path)
    .then(
      list => {
        if (list) {
          const items = filter(list.split('\n'))
          return getLast(items).split('|')
        } else {
          return 0
        }
      },
      () => {
        return 'none'
      })
}

function getLast (list) {
  if (!list || list.length === 0) {
    return undefined
  }
  return list[ list.length - 1 ]
}

function getOwner (path) {
  const regex = /(https:\/\/|git@|git:\/\/)[^:/]*[:/]([^/]*).*/
  return exec("git remote show origin -n | grep 'Fetch URL: .*'", path)
    .then(
      line => {
        return regex.test(line) ? regex.exec(line)[ 2 ] : 'anonymous'
      },
      () => {
        return 'anonymous'
      })
    .then(owner => {
      if (owner === 'anonymous') {
        if (process.env.DRONE) {
          owner = process.env.DRONE_REPO_OWNER || process.env.DRONE_REPO_SLUG.split('/')[ 1 ]
        } else if (process.env.TRAVIS) {
          owner = process.env.TRAVIS_REPO_SLUG.split('/')[ 0 ]
        }
        return owner
      } else {
        return owner
      }
    })
}

function getRepository (path) {
  const regex = /(https:\/\/|git@|git:\/\/)[^:/]*[:/][^/]*\/(.*)/
  const dirname = syspath.basename(syspath.resolve(path))
  if (process.env.DRONE) {
    return when.resolve(process.env.DRONE_REPO_NAME || process.env.DRONE_REPO_SLUG.split('/')[ 2 ])
  } else if (process.env.TRAVIS) {
    return when.resolve(process.env.TRAVIS_REPO_SLUG.split('/')[ 1 ])
  } else {
    return exec("git remote show origin -n | grep 'Fetch URL: .*'", path)
      .then(
        line => {
          return regex.test(line) ? regex.exec(line)[ 2 ] : dirname
        },
        () => {
          return dirname
        })
  }
}

function getSlug (path) {
  return getCommit(path)
    .then(sha => {
      return sha.slice(0, 8)
    })
}

function getTags (branch, build, commit, owner, repo, major, minor, patch, specs) {
  const list = [].concat(specs)
  const tags = list.reduce((acc, spec) => {
    const segments = spec.split('_').reduce((t, abbr) => {
      switch (abbr) {
        case 'o':
          t.push(owner)
          break
        case 'r':
          t.push(repo)
          break
        case 'b':
          t.push(branch)
          break
        case 'v':
          t.push(build.version)
          break
        case 'c':
          t.push(build.count)
          break
        case 's':
          t.push(commit.slice(0, 8))
          break
        case 'ma':
          t.push(major)
          break
        case 'mi':
          t.push(minor)
          break
        case 'p':
          t.push(patch)
          break
        case 'miv':
          t.push([ major, minor ].join('.'))
          break
      }
      return t
    }, [])
    acc.push(segments.join('_'))
    return acc
  }, [])
  return tags.length === 1 ? tags[ 0 ] : tags
}

function readRepository (path, specs) {
  const fullPath = syspath.resolve(path)
  if (fs.existsSync(fullPath)) {
    return when.try(createInfo, path, getBranch(path), getBuildNumber(path), getCommit(path), getOwner(path), getRepository(path), specs, getHeadComment(path))
  } else {
    return when.reject(new Error('Cannot load repository information for invalid path "' + fullPath + '"'))
  }
}

module.exports = {
  checkLTS: checkLTS,
  checkForCIPR: checkForCIPR,
  checkForCITag: checkForCITag,
  getBranch: getBranch,
  getBuildNumber: getBuildNumber,
  getCommit: getCommit,
  getCommitCount: getCommitCount,
  getCommitsSinceVersion: getCommitsSinceVersion,
  getCommitsSinceCurrentVersion: getCommitsSinceCurrentVersion,
  getCurrentVersion: getCurrentVersion,
  getFirstCommitForVersion: getFirstCommitForVersion,
  getHeadComment: getHeadComment,
  getOwner: getOwner,
  getRepository: getRepository,
  getSlug: getSlug,
  getTags: getTags,
  repo: readRepository
}

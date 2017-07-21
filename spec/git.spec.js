require('./setup')
const path = require('path')
const git = require('../src/git.js')
const repoPath = path.resolve('./spec/fauxgitaboudit')

describe('Git', function () {
  var owner
  var repo
  var branch

  before(function () {
    owner = 'anonymous'
    repo = 'fauxgitaboudit'
    branch = 'master'
    if (process.env.TRAVIS && process.env.TRAVIS_TAG) {
      owner = process.env.TRAVIS_REPO_SLUG.split('/')[ 0 ]
      repo = process.env.TRAVIS_REPO_SLUG.split('/')[ 1 ]
      branch = process.env.TRAVIS_BRANCH
    }
  })

  describe('when checking for LTS', function () {
    it('should detect LTS correctly based on version and date', function () {
      var version = /v([0-9]+)/.exec(process.version)[ 1 ]
      var today = new Date()
      var lts = git.checkLTS()
      if (version === '6' && today < new Date('10-01-2017')) {
        lts.should.equal(true)
      } else if (version === '8' && today >= new Date('10-01-2017') && today < new Date('10-01-2018')) {
        lts.should.equal(true)
      } else if (version === '10' && today >= new Date('10-01-2018')) {
        lts.should.equal(true)
      } else {
        lts.should.equal(false)
      }
    })
  })

  describe('when building tags from specifications', function () {
    it('should build correct tags according to specs', function () {
      git.getTags('c', { version: '1.2.3', count: 'd' }, 'e', 'a', 'b', '1', '2', '3', [ 'o_r_b_c_s', 'v_miv_ma_mi_p' ])
        .should.eql([
          'a_b_c_d_e',
          '1.2.3_1.2_1_2_3'
        ])
    })
  })

  describe('when checking for PR', function () {
    describe('for Travis', function () {
      before(function () {
        process.env.TRAVIS = true
        process.env.TRAVIS_PULL_REQUEST_BRANCH = 'master'
      })

      it('should correctly flag PR', function () {
        git.checkForCIPR().should.equal(true)
      })

      after(function () {
        delete process.env.TRAVIS
        delete process.env.TRAVIS_PULL_REQUEST_BRANCH
      })
    })

    describe('for Drone', function () {
      before(function () {
        process.env.DRONE = true
        process.env.DRONE_BUILD_EVENT = 'pull_request'
      })

      it('should correctly flag PR', function () {
        git.checkForCIPR().should.equal(true)
      })

      after(function () {
        delete process.env.DRONE
        delete process.env.DRONE_BUILD_EVENT
      })
    })
  })

  describe('when checking for Tag', function () {
    describe('for Travis', function () {
      before(function () {
        process.env.TRAVIS = true
        process.env.TRAVIS_TAG = 'v1.0.0'
      })

      it('should correctly mark as CI TAG', function () {
        git.checkForCITag().should.equal(true)
      })

      after(function () {
        delete process.env.TRAVIS
        delete process.env.TRAVIS_TAG
      })
    })

    describe('for Drone', function () {
      before(function () {
        process.env.DRONE = true
        process.env.DRONE_BUILD_EVENT = 'tag'
      })

      it('should correctly mark as CI TAG', function () {
        git.checkForCITag().should.equal(true)
      })

      after(function () {
        delete process.env.DRONE
        delete process.env.DRONE_BUILD_EVENT
      })
    })
  })

  describe('when getting basic information with default tag', function () {
    var repoInfo

    before(function (done) {
      git.repo(repoPath, 'o_r_b_v_c_s')
        .then(function (info) {
          repoInfo = info
          done()
        })
    })

    it('should retrieve necessary repository data from environment', function () {
      repoInfo.owner.should.equal(owner)
      repoInfo.commitMessage.should.equal('commit 10')
      repoInfo.repository.should.equal(repo)
      repoInfo.branch.should.equal(branch)
      repoInfo.path.should.equal(repoPath)
      repoInfo.build.should.equal(2)
      repoInfo.commit.length.should.equal(40)
      repoInfo.major.should.equal('4')
      repoInfo.minor.should.equal('5')
      repoInfo.patch.should.equal('6')
      repoInfo.major_version.should.equal('4')
      repoInfo.minor_version.should.equal('4.5')
      repoInfo.tag.should.equal(owner + '_' + repo + '_master_' + repoInfo.version + '_2_' + repoInfo.commit.slice(0, 8))
    })
  })

  describe('when getting basic information with multiple tags', function () {
    var repoInfo

    before(function (done) {
      git.repo(repoPath, [ 'v_c_s', 'miv', 'ma' ])
        .then(function (info) {
          repoInfo = info
          done()
        })
    })

    it('should retrieve necessary repository data from environment', function () {
      repoInfo.owner.should.equal(owner)
      repoInfo.repository.should.equal(repo)
      repoInfo.branch.should.equal(branch)
      repoInfo.path.should.equal(repoPath)
      repoInfo.build.should.equal(2)
      repoInfo.commit.length.should.equal(40)
      repoInfo.major.should.equal('4')
      repoInfo.minor.should.equal('5')
      repoInfo.patch.should.equal('6')
      repoInfo.major_version.should.equal('4')
      repoInfo.minor_version.should.equal('4.5')
      repoInfo.tag.should.eql([
        repoInfo.version + '_2_' + repoInfo.commit.slice(0, 8),
        '4.5',
        '4'
      ])
    })
  })

  describe('when getting build details from Drone', function () {
    var repoInfo

    before(function () {
      process.env.DRONE = true
      process.env.DRONE_BRANCH = 'testing'
      process.env.DRONE_REPO_OWNER = 'me'
      process.env.DRONE_REPO_NAME = 'test'
      return git.repo(repoPath, 'o_r_b_v_c_s')
        .then(function (info) {
          repoInfo = info
        })
    })

    it('should retrieve expected repository data from environment', function () {
      repoInfo.owner.should.equal('me')
      repoInfo.repository.should.equal('test')
      repoInfo.branch.should.equal('testing')
      repoInfo.path.should.equal(path.resolve(repoPath))
      repoInfo.build.should.equal(2)
      repoInfo.commit.length.should.equal(40)
    })

    after(function () {
      delete process.env.DRONE
      delete process.env.DRONE_BRANCH
      delete process.env.DRONE_REPO_OWNER
      delete process.env.DRONE_REPO_NAME
    })
  })

  describe('when getting build details from Travis', function () {
    var repoInfo

    before(function () {
      process.env.TRAVIS = true
      process.env.TRAVIS_BRANCH = 'testing'
      process.env.TRAVIS_REPO_SLUG = 'me/test'
      return git.repo(repoPath, 'o_r_b_v_c_s')
        .then(function (info) {
          repoInfo = info
        })
    })

    it('should retrieve expected repository data from environment', function () {
      repoInfo.owner.should.equal('me')
      repoInfo.repository.should.equal('test')
      repoInfo.branch.should.equal('testing')
      repoInfo.path.should.equal(path.resolve(repoPath))
      repoInfo.build.should.equal(2)
      repoInfo.commit.length.should.equal(40)
    })

    after(function () {
      delete process.env.TRAVIS
      delete process.env.TRAVIS_BRANCH
      delete process.env.TRAVIS_REPO_SLUG
    })
  })
})

require('./setup')
const fs = require('fs')
const path = require('path')
const goggles = require('../src/index.js')

describe('Goggles', function () {
  describe('with no options', function () {
    it('should use default repository path and tag format', function () {
      return goggles.getInfo()
        .then(function (info) {
          info.repository.toLowerCase().should.equal('buildgoggles')
          info.path.should.equal(process.cwd())
          info.tag.should.equal([
            info.owner,
            info.repository,
            info.branch,
            info.version,
            info.build,
            info.slug
          ].join('_'))
        })
    })

    after(function () {
      fs.unlinkSync(path.resolve('./.buildinfo.json'))
    })
  })

  describe('with custom repo and tag formats', function () {
    var owner
    var repo

    before(function () {
      owner = 'anonymous'
      repo = 'fauxgitaboudit'
      if (process.env.TRAVIS) {
        owner = process.env.TRAVIS_REPO_SLUG.split('/')[ 0 ]
        repo = process.env.TRAVIS_REPO_SLUG.split('/')[ 1 ]
      }
    })

    it('should use target repo and custom tags', function () {
      return goggles.getInfo({ repo: './spec/fauxgitaboudit', tags: [ 'v', 'miv' ] })
        .then(function (info) {
          info.repository.should.equal(repo)
          info.owner.should.equal(owner)
          info.path.should.equal(path.resolve('./spec/fauxgitaboudit'))
          info.tag.should.eql([
            info.version,
            [ info.major, info.minor ].join('.')
          ])
        })
    })

    after(function () {
      fs.unlinkSync(path.resolve('./spec/fauxgitaboudit/.buildinfo.json'))
    })
  })
})

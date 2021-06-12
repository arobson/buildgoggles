const fs = require('fs')
const path = require('path')
const format = require('util').format
const git = require('./git')

function getInfo (options) {
  const args = options || {}
  const repo = args.repo || process.cwd()
  const tag = args.tags || [ 'o_r_b_v_c_s' ]
  console.log(format("Getting build information for repository at '%s'", repo))
  return git.repo(repo, tag)
    .then(onInfo, onError)
}

function onInfo (info) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(info.path, '.buildinfo.json')
    fs.writeFile(filePath, JSON.stringify(info), err => {
      if (err) {
        console.error('Failed to write to', filePath)
        reject(err)
      } else {
        console.log(filePath, 'written successfully')
        resolve(info)
      }
    })
  })
}

function onError (err) {
  const message = err.error ? err.error.message : err.stack
  console.error('Could not get build information due to', message)
}

module.exports = {
  getInfo: getInfo
}

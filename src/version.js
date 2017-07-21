const glob = require('globulesce')
const path = require('path')
const fs = require('fs')
const format = require('util').format

function parseErlangVersion (content) {
  const regex = /[{]\W?vsn[,]\W?"([0-9.]+)"/
  const matches = regex.exec(content)
  return matches[ 1 ] ? matches[ 1 ] : undefined
}

function parseNodeVersion (content) {
  const json = JSON.parse(content)
  return json.version.split('-')[ 0 ]
}

function parseDotNetVersion (content) {
  const regex = /^\[assembly:\W?[aA]ssemblyVersion(Attribute)?\W?\(\W?"([0-9.]*)"\W*$/m
  const matches = regex.exec(content)
  return matches[ 2 ] ? matches[ 2 ] : undefined
}

const parsers = {
  '.src': parseErlangVersion,
  '.json': parseNodeVersion,
  '.cs': parseDotNetVersion
}

const searchPaths = [
  '{.,**}/package.json',
  '{.,**}/*.app.src',
  '{.,**}/AssemblyInfo.cs'
]

const searchTemplates = {
  '.src': '[{]\\W?vsn[,]\\W?"%s"',
  '.json': '"version"\\s*[:]\\s*"%s"',
  '.cs': '^\\[assembly:\\W?[aA]ssemblyVersion(Attribute)?\\W?\\(\\W?"%s"\\W*$'
}

function getTemplate (filePath, version) {
  const ext = path.extname(filePath)
  return format(searchTemplates[ ext ], version)
}

function getVersionFile (projectPath) {
  const resolvedPath = path.resolve(projectPath)
  return glob(resolvedPath, searchPaths)
    .then(
      x => {
        if (x === undefined || x === null || x === {} || x === []) {
          return new Error('None of the supported version specifiers could be found in ' + resolvedPath)
        } else {
          x.sort((a, b) => {
            const aDepth = a.split(path.sep).length
            const bDepth = b.split(path.sep).length
            return aDepth - bDepth
          })
          return x[0]
        }
      },
      () => {
        throw new Error('Cannot search for version files in bad path "' + projectPath + '"')
      }
    )
}

function getVersion (filePath, content) {
  if (!content) {
    content = fs.readFileSync(filePath).toString()
  }
  const ext = path.extname(filePath)
  return parsers[ ext ](content)
}

module.exports = {
  getFile: getVersionFile,
  getTemplate: getTemplate,
  getVersion: getVersion
}

const exec = require('child_process').exec

function executeCommand (line, path) {
  path = path || __dirname
  return new Promise((resolve, reject) => {
    const command = Array.isArray(line) ? line.join(' ') : line
    exec(command,
      { cwd: path },
      (err, stdout /*, stderr */) => {
        if (err) {
          reject({ error: err, output: stdout })
        } else {
          resolve(stdout)
        }
      })
  })
}

module.exports = executeCommand

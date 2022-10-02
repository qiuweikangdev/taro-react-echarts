// generate version/tags

const { execSync } = require('child_process')
const pkg = require('../packages/echarts/package.json')
const { program } = require('commander')

program.option('-r, --release <version>', 'package version')
program.parse()

const { release } = program.opts()
const tag = `${pkg.name}-v${release}`
try {
  if (release) {
    const value = execSync(`git tag -l ${tag}`).toString('utf8')
    if (!value) {
      execSync(
        `cd packages/echarts && standard-version -r ${release} -t ${pkg.name}-v --infile ../../CHANGELOG.md`,
      )
      execSync(`git push origin ${tag}`)
      execSync(`git push origin HEAD`)
    } else {
      throw `${tag} already exists`
    }
  } else {
    throw 'release does not exist'
  }
} catch (e) {
  console.log(e)
}

// recover published files (echarts/package.json)

const { execSync } = require('child_process')
const pkg = require('../packages/echarts/package.json')

try {
    if (pkg.main.includes('dist')) {
      execSync('git checkout packages/echarts/package.json')
    }
} catch (e) {
  console.error(e)
}

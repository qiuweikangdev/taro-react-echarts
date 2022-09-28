// update echarts package.json

const pkg = require('../packages/echarts/package.json')
const { writeFileSync } = require('fs')
const path = require('path')
if (process.env.NODE_ENV === 'prod') {
  Object.assign(pkg, {
    main: 'dist/index.js',
    module: 'dist/index.esm.js',
  })
} else {
  Object.assign(pkg, {
    main: 'src/index.ts',
    module: 'src/index.ts',
  })
}

writeFileSync(
  path.resolve(process.cwd(), 'packages/echarts/package.json'),
  JSON.stringify(pkg, null, 2),
)

const fs = require('fs-extra')
const { createHash } = require('crypto')

export default function buildConfig() {
  return {
    name: 'version-plugin',
    writeBundle(_, bundle) {
      const buildId = createHash('md5')
        .update(new Date().getTime().toString())
        .digest('hex')
        .substr(0, 8)
      const version = { buildId }
      const versionPath = './dist/version.json'
      fs.outputJsonSync(versionPath, version)
    }
  }
}

const { join } = require('path')

module.exports = {
  operator: 'attach',
  password: 'baixing!123',
  tasks: [
    {
      prefix: 'chato-fe/',
      bucket: 'attachments',
      rename: (origin) => join('static', origin),
      directory: join(__dirname, '../dist')
    }
  ]
}

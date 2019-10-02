const ambients = require('./src')
const output = ambients.fromJS(process.argv[2])
console.log(output)

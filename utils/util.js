// core module
const path = require('path');
const Hashids = require('hashids');

exports.rootdir = require.main && require.main.filename ? path.dirname(require.main.filename) : process.cwd();

const hashids = new Hashids(process.env.hash_key || 'bfabfsjnvasjbgvsafajfaewjf', 8);
exports.hashids = hashids;

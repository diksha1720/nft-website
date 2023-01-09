require('dotenv').config()
const baseuri = `https://ipfs.io/ipfs/${[process.env.METADATA_CID]}/`
module.exports = [
    baseuri
];
// This file is run at build time and generates the current Backstage2 version based on the version
// number specified in the currentVersion-file, the current git hash, and the date. The generated
// description is stored in the environment variable NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION which
// can be accessed by the client and shown to the user. Since this file is run by node.js at build
// time it is written in plain Javascript and uses CommonJS-require to import modules.

/* eslint-disable @typescript-eslint/no-var-requires */
const versionNumber = JSON.parse(require('fs').readFileSync('package.json').toString()).version;
const gitHash = require('child_process').execSync('git rev-parse HEAD').toString().trim().substring(0, 10);
const currentDate = new Date().toLocaleString('sv-SE', { year: 'numeric', month: 'numeric', day: 'numeric' });

const versionName = `${versionNumber} / ${gitHash} / ${currentDate}`;
console.log('[Backstage2] Version ' + versionName);

module.exports = {
    env: {
        NEXT_PUBLIC_BACKSTAGE2_CURRENT_VERSION: versionName,
    },
};

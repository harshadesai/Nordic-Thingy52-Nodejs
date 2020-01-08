
'use strict';

// eslint-disable-next-line max-len
const LairdAdapter = require('./laird');

module.exports =
    // eslint-disable-next-line max-len
    (addonManager, manifest) => new LairdAdapter(addonManager, manifest);

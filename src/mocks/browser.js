const { setupWorker } = require('msw');
const { handlers } = require('./handlers');

// This configures a Service Worker with the given request handlers.
exports.worker = setupWorker(...handlers)


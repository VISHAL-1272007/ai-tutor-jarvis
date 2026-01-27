// Lightweight logger used by JARVIS proxy
// Falls back to console methods
const levels = ['info', 'warn', 'error', 'debug'];

const logger = {};
levels.forEach((level) => {
  logger[level] = (...args) => {
    const prefix = level.toUpperCase();
    console[level === 'warn' ? 'warn' : level === 'error' ? 'error' : 'log'](
      `[${prefix}]`,
      ...args
    );
  };
});

module.exports = logger;

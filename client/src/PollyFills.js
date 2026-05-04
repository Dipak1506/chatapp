

if (typeof window !== 'undefined' && !window.process) {
  window.process = {
    env: { NODE_ENV: 'development' },
    browser: true,
    // readable-stream calls process.nextTick heavily; map it to setTimeout
    nextTick: function nextTick(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      setTimeout(function () { fn.apply(null, args); }, 0);
    },
    version: '',
    versions: {},
    on: function () {},
    addListener: function () {},
    once: function () {},
    off: function () {},
    removeListener: function () {},
    removeAllListeners: function () {},
    emit: function () {},
    binding: function () { throw new Error('process.binding not supported'); },
    cwd: function () { return '/'; },
    chdir: function () {},
    umask: function () { return 0; },
  };
}
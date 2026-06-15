const Module = require('module');
Module._resolveFilename = (original => function(request, parent, isMain) {
  if (request === 'server-only') {
    return __filename;
  }
  return original.apply(this, arguments);
})(Module._resolveFilename);

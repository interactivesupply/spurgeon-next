import { setConfig } from '@faustwp/core';

// experimentalToolbar requires Faust auth endpoints (/api/faust/login, etc.)
// and direct browser→WP access. We don't have those wired here, and the WP
// Engine basic-auth gate would block browser-side calls anyway. Re-enable
// once auth + the public WP origin are in place.
setConfig({
  experimentalToolbar: false,
  plugins: [],
});

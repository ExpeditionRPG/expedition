const Cors = require('cors');

export const limitCors = Cors({
  credentials: true,
  // Allow:
  // - expedition domains (for web apps)
  // - file (for mobile apps)
  // - localhost (for local dev)
  // - *.local (for dev on mobile)
  origin: /(expedition(game|rpg)\.com$)|(^file:\/\/)|(localhost(:[0-9]+)?$)|(.*\.local(:[0-9]+)?$)/i,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
});

import { a as patchBrowser, b as globals, c as bootstrapLazy } from './findmyservice-825d74a2.js';

patchBrowser().then(resourcesUrl => {
  globals();
  return bootstrapLazy([["find-my-service",[[0,"find-my-service",{"categories":[1],"webmaps":[32],"maps":[32]}]]]], { resourcesUrl });
});

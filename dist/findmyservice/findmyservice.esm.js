import { a as patchBrowser, b as globals, c as bootstrapLazy } from './findmyservice-a4aa38f7.js';

patchBrowser().then(resourcesUrl => {
  globals();
  return bootstrapLazy([["find-my-service",[[0,"find-my-service",{"categories":[1],"layers":[1],"council":[4],"webmaps":[32],"maps":[32],"councilInfo":[32]}]]]], { resourcesUrl });
});

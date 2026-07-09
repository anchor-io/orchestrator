import { defineConfig } from 'jsrepo';

export default defineConfig({
  // configure where stuff comes from here
  registries: ['https://kura.gfdc.dev/r'],
  // configure where stuff goes here
  paths: {
    ui: 'src/lib/components/ui',
    hook: 'src/lib/hooks',
    lib: 'src/lib'
  }
});

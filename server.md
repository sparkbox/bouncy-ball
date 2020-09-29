# Server Options
You can pass the following options to the server on start up.
```
npm start -- --option [value]
```
Typically, the default server configuration will be all you need. Options are shown below with their defaults.

  - **Option:** `-w`, `--watch`
  **Default** `true`
  If you would like to watch for file changes and reload the browser add this flag.

  - **Option:** `-x`, `--proxy`
  **Default** `bouncyball.dev`
  This option's default is to to  `bouncyball.dev`. This means that Browsersync will serve up the site if you have apache running with a virtual host set up for this project. If you're using a different name for your vhost, set the value with this flag e.g. `-x your-v-host.dev`

  - **Option:** `-o`, `--static`
  **Default** `true`
  This option is used by default so that if you don't have apache set up to serve the project, you can develop locally. You can include this flag if you only want to serve static pages. e.g. `--static`

  - **Option:** `-p`, `--port`
  **Default** `5000`
  You can change it if you want. e.g. `-p 3000`

  - **Option:** `-s`, `--ssl`
  **Default** `false`
  Set to `true` to serve over `https`. When proxying, this will defer protocol to the server that is being proxied, so this may only work with the server in static mode. e.g. `--ssl --static`

  - **Option:** `-t`, `--tunnel`
  **Default** `false`
  If you need a local tunnel, set this to an alphanumeric value. e.g. `-t b0uncyba11`. This would open a tunnel at `http://b0uncyba11.localtunnel.me`.

Fully qualified example:
```
npm start -- --proxy my-local-apache.whatever --port 3000 --tunnel b0uncyba11
```

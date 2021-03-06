<h1 align="center">pull-configs</h1>

<p align="center">
pulls configuration files from a remote location and merges them with local
</p>

<p align="center">
   <a href="#install">        馃敡 <strong>Install</strong></a>
 路 <a href="#example">        馃З <strong>Example</strong></a>
 路 <a href="#api">            馃摐 <strong>API docs</strong></a>
 路 <a href="https://github.com/stagas/pull-configs/releases"> 馃敟 <strong>Releases</strong></a>
 路 <a href="#contribute">     馃挭馃徏 <strong>Contribute</strong></a>
 路 <a href="https://github.com/stagas/pull-configs/issues">   馃枑锔? <strong>Help</strong></a>
</p>

---

## Install

```sh
$ npm i pull-configs
```

## Example

`.pull-configs.js` :

```js
const { pullConfigs } = require('pull-configs')

const local = __dirname + '/'
const remote = 'https://github.com/stagas/typescript-minimal-template/raw/main/'

const { assign, omit, sort, merge, replace } = pullConfigs(remote, local)

merge('package.json', (prev, next) => {
  assign(prev.scripts, omit(next.scripts, ['build:min']))
  sort(assign(prev.devDependencies, next.devDependencies))
})
replace('.eslintrc.js')
replace('.prettierrc')
replace('jest.config.js')
replace('tsconfig.json')
replace('web-test-runner.config.js')
merge('.vscode/settings.json')
```

```sh
node .pull-configs.js
```

Result:

```diff
merging: package.json
 {
   scripts: {
-    prepush: "npm run lint"
+    prepush: "npm run lint && npm run test"
-    prepack: "npm run build"
+    prepack: "npm run clean && npm run build"
   }
 }

replacing: .eslintrc.js
adding: .prettierrc
```

To automate this process you could add it in the `"prepare"` script in `package.json`:

```json
"prepare": "node .pull-configs.js"
```

This way it will run after every fresh `npm install`.

## Contribute

[Fork](https://github.com/stagas/pull-configs/fork) or
[edit](https://github.dev/stagas/pull-configs) and submit a PR.

All contributions are welcome!

## License

MIT &copy; 2022
[stagas](https://github.com/stagas)

# native-messaging-workerd


### Synopsis

Create, read, and write files and directories in local filesystem from the browser with `workerd` and `fetch()`.

Use a modified version of Cloudflare's [static-files-from-disk](https://github.com/cloudflare/workerd/tree/main/samples/static-files-from-disk).

Use Web extension `debugger` API to intercept `fetch()` requests from Web pages.

Start `workerd` server using Native Messaging API in `debugger.onEvent` handler on `Fetch.requestPaused` event.

Continue `fetch()` `GET` or `PUT` request that writes files and directories, or reads files, to and 
from the local directory set to `local` in `config.capnp` and set dynamically in `nm_workerd.sh` to
`--directory-path=site-files="$HOME/Downloads"`.

Terminate `workerd`, until next `fetch()` request to `http://localhost:8081`.

### Configuration

Adjust `config.capnp` and parameters passed to `workerd` in `nm_workerd.sh` accordingly for local folder to read and write to.

Launch `chrome` with `--silent-debugger-extension-api` to disable showing infobar on Web pages where `chrome.debugger` is attached.

Set JSON accessible to `ServiceWorker` in `fetch` event in `static.js` in `json` of `bindings` of `config.capnp`. 

Compile `config.capnp` to binary format with `workerd compile --config-only ~/native-messaging-workerd/config.capnp > ~/native-messaging-workerd/config`.


### Installation on Chrome and Chromium

Fetch `workerd`

```
cd $HOME
mkdir bin
wget --show-progress --progress=bar --output-document -H -O workerd.gz 'https://github.com/cloudflare/workerd/releases/download/v1.20240903.0/workerd-linux-64.gz' && gzip -d workerd.gz
chmod +x workerd
export "$PWD:$PATH"
```
Load GitHub repository as unpacked extension and install Native Messaging host

1. Navigate to `chrome://extensions`.
2. Toggle `Developer mode`.
3. Click `Load unpacked`.
4. Select `native-messaging-workerd` folder.
5. Note the generated extension ID.
6. Open `nm_workerd.json` in a text editor, set `"path"` to absolute path of `nm_workerd.sh` and `chrome-extension://<ID>/` using ID from 5 in `"allowed_origins"` array. 
7. Copy the file to Chrome or Chromium configuration folder, e.g., Chromium on \*nix `~/.config/chromium/NativeMessagingHosts`; Chrome dev channel on \*nix `~/.config/google-chrome-unstable/NativeMessagingHosts`.
8. Make sure `workerd` executable and `nm_workerd.sh` are executable.

### Examples

Run in DevTools `console`, or Snippets, or in Web pages other than `chrome:` URL's - except for
`chrome:` URL's controlled by an extension, e.g., a custom `chrome://newtab` page.

Write file `script.js` to `~/Downloads`
```
fetch(new Request("http://localhost:8081/script.js", {
  method: "put",
  body: new Blob(["console.log(123)"]),
}))
.then((r) => r.text())
.then(console.log) // File written to ~/Downloads/script.js
.catch(console.error);
```

Read file `script.js` to `~/Downloads`

```
fetch("http://localhost:8081/script.js")
.then((r) => r.text())
.then(console.log) // console.log(123)
.catch(console.error);
```

Create subdirectory `scripts` and write `config.json` file

```
var request = await fetch("http://localhost:8081/config/config.json", {
  method: "put",
  body: new Blob([JSON.stringify({abc: 123})]),
})
var file = await request.text();
console.log(file); // File written to ~/Downloads/config/config.json
```

Read `config.json` in `~/Downloads/condig` subdirectory

```
var request = await fetch("http://localhost:8081/config/config.json")
var file = await request.json();
console.log(file); // var request = await fetch("http://localhost:8081/config/config.json")
var file = await request.json();
console.log(file);
```
 
Get directory listing of `~/Downloads`

```
var request = await fetch("http://localhost:8081")
var file = await request.json();
console.log(JSON.stringify(file, null, 2));
/*
[
  {
    "name": "config",
    "type": "directory"
  },
  {
    "name": "script.js",
    "type": "file"
  }
]
*
```

### TODO

Implement standard streams (reading `stdin` and writing to `stdout`) for `workerd`.

### Compatibility

For differences between OS and browser implementations see [Chrome incompatibilities](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Chrome_incompatibilities#native_messaging).

# License
Do What the Fuck You Want to Public License [WTFPLv2](http://www.wtfpl.net/about/)

# stars-scope
Ubuntu Touch scope to get access to starred, bookmarked pages.

## Run mode

Use ubuntu-sdk and the unity-js-scopes-tool, as described on this [tutorial](https://developer.ubuntu.com/en/phone/scopes/tutorials/developing-scopes-javascript/)

## Unit/Integration Test mode

The test mode is disconnected from the usual mode in order to run in the usual node.js env.
This mode contradicts the run mode, so you cannot run both mode, you'll have to switch from one to the other and setup again.

### Set up

```sh
cd src
rm -rf node_modules/*
npm install
```

### Lint the code

```sh
npm run lint
```

### Run the tests

```sh
npm test
```

## License

Made by Bertrand Chevrier - The source code is licensed under the [GPL v3](http://www.gnu.org/licenses/gpl-3.0.txt)

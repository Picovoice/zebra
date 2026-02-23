# Zebra Binding for Web

## Zebra Translate

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Zebra is a lightweight, on-device neural machine translation engine. Zebra is:

- Private; All processing runs locally.
- Cross-Platform:
  - Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64, arm64)
  - Raspberry Pi (3, 4, 5)
  - Chrome, Safari, Firefox, and Edge

## Compatibility

- Chrome / Edge
- Firefox
- Safari

## Requirements

The Zebra Web Binding uses [SharedArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/SharedArrayBuffer).

Include the following headers in the response to enable the use of `SharedArrayBuffers`:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Refer to our [Web demo](../../demo/web) for an example on creating a server with the corresponding response headers.

Browsers that don't support `SharedArrayBuffers` or applications that don't include the required headers will fall back to using standard `ArrayBuffers`. This will disable multithreaded processing.

### Restrictions

IndexedDB is required to use `Zebra` in a worker thread. Browsers without IndexedDB support
(i.e. Firefox Incognito Mode) should use `Zebra` in the main thread.

Multi-threading is only enabled for `Zebra` when using on a web worker.

## Installation

Using `yarn`:

```console
yarn add @picovoice/zebra-web
```

or using `npm`:

```console
npm install --save @picovoice/zebra-web
```

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

For the web packages, there are two methods to initialize Zebra.

### Public Directory

**NOTE**: Due to modern browser limitations of using a file URL, this method does __not__ work if used without hosting a server.

This method fetches the model file from the public directory and feeds it to Zebra. Copy the model file into the public directory:

```console
cp ${ZEBRA_MODEL_FILE} ${PATH_TO_PUBLIC_DIRECTORY}
```

### Base64

**NOTE**: This method works without hosting a server, but increases the size of the model file roughly by 33%.

This method uses a base64 string of the model file and feeds it to Zebra. Use the built-in script `pvbase64` to
base64 your model file:

```console
npx pvbase64 -i ${ZEBRA_MODEL_FILE} -o ${OUTPUT_DIRECTORY}/${MODEL_NAME}.js
```

The output will be a js file which you can import into any file of your project. For detailed information about `pvbase64`,
run:

```console
npx pvbase64 -h
```

### Language Model

Zebra saves and caches your model file in IndexedDB to be used by WebAssembly. Use a different `customWritePath` variable
to hold multiple models and set the `forceWrite` value to true to force re-save a model file.

Either `base64` or `publicPath` must be set to instantiate Zebra. If both are set, Zebra will use the `base64` model.

```typescript
const zebraModel = {
  publicPath: ${MODEL_RELATIVE_PATH},
  // or
  base64: ${MODEL_BASE64_STRING},

  // Optionals
  customWritePath: "zebra_model",
  forceWrite: false,
  version: 1,
}
```

### Translation Models

Zebra translation models are located [here](../../lib/common/). The selected model decides the source and target translation languages.

The format of the model follows:

```console
pv_zebra_params_${SOURCE}_${TARGET}.pv
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.

### Initialize Zebra

Create an instance of `Zebra` in the main thread:

```typescript
const zebra = await Zebra.create(
  "${ACCESS_KEY}",
  zebraModel
);
```

Or create an instance of `Zebra` in a worker thread:

```typescript
const zebra = await ZebraWorker.create(
  "${ACCESS_KEY}",
  zebraModel
);
```

### Translating Text

```typescript
const translation = await zebra.translate(`${TEXT_TO_TRANSLATE}`);
console.log(translation);
```

### Clean Up

Clean up used resources by `Zebra` or `ZebraWorker`:

```typescript
await zebra.release();
```

Terminate `ZebraWorker` instance:

```typescript
await zebra.terminate();
```

## Demo

For example usage refer to our [Web demo application](https://github.com/Picovoice/zebra/tree/main/demo/web).

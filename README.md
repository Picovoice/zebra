# Zebra

[![GitHub release](https://img.shields.io/github/release/Picovoice/Zebra.svg)](https://github.com/Picovoice/Zebra/releases)
[![GitHub](https://img.shields.io/github/license/Picovoice/zebra)](https://github.com/Picovoice/zebra/)

[![Maven Central](https://img.shields.io/maven-central/v/ai.picovoice/zebra-android?label=maven-central%20%5Bandroid%5D)](https://repo1.maven.org/maven2/ai/picovoice/zebra-android/)
[![npm](https://img.shields.io/npm/v/@picovoice/zebra-web?label=npm%20%5Bweb%5D)](https://www.npmjs.com/package/@picovoice/zebra-web) <!-- markdown-link-check-disable-line -->
[![CocoaPods](https://img.shields.io/cocoapods/v/Zebra-iOS)](https://cocoapods.org/pods/Zebra-iOS) <!-- markdown-link-check-disable-line -->
[![PyPI](https://img.shields.io/pypi/v/pvzebra)](https://pypi.org/project/pvzebra/)

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

[![Twitter URL](https://img.shields.io/twitter/url?label=%40AiPicovoice&style=social&url=https%3A%2F%2Ftwitter.com%2FAiPicovoice)](https://twitter.com/AiPicovoice)<!-- markdown-link-check-disable-line -->
[![YouTube Channel Views](https://img.shields.io/youtube/channel/views/UCAdi9sTCXLosG1XeqDwLx7w?label=YouTube&style=social)](https://www.youtube.com/channel/UCAdi9sTCXLosG1XeqDwLx7w)

Zebra is a lightweight, on-device neural machine translation engine.

## Table of Contents

- [Zebra](#zebra)
  - [Table of Contents](#table-of-contents)
  - [Demos](#demos)
    - [Python](#python-demos)
    - [C](#c-demos)
    - [Android](#android-demos)
    - [iOS](#ios-demos)
    - [Web](#web-demos)
  - [SDKs](#sdks)
    - [Python](#python)
    - [C](#c)
    - [Android](#android)
    - [iOS](#ios)
    - [Web](#web)
  - [Releases](#releases)

## Demos

### Python Demos

### C Demos

### Android Demos

### iOS Demos

### Web Demos

From [demo/web](./demo/web) run the following in the terminal:

```console
yarn
yarn start [${SOURCE}] [${TARGET}]
```

(or)

```console
npm install
npm run start [${SOURCE}] [${TARGET}]
```

Replace `${SOURCE}` and `${TARGET}` with the source/target language you would like to run the demo in.

Open `http://localhost:5000` in your browser to try the demo.

For more information about Web demos go to [demo/web](./demo/web).

## SDKs

### Python

### C

### Android

### iOS

### Web

Install the web SDK using yarn:

```console
yarn add @picovoice/zebra-web
```

or using npm:

```console
npm install --save @picovoice/zebra-web
```

Create an instance of the engine using `ZebraWorker` and translate text:

```typescript
import { ZebraWorker } from "@picovoice/zebra-web";
import zebraParams from "${PATH_TO_BASE64_ZEBRA_PARAMS}";

const zebra = await ZebraWorker.create(
  "${ACCESS_KEY}",
  { base64: zebraParams },
);

const translation = await zebra.translate("${TEXT}");
console.log(translation);
```

Replace `${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/). Finally, when done release the resources using `zebra.release()`.

For more details, see the [Web SDK](./binding/web/).

## Releases

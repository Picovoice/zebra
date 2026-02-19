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

Build the demo:

```console
cmake -S demo/c/ -B demo/c/build && cmake --build demo/c/build
```

Run the demo:

```console
./demo/c/build/zebra_demo -a ${ACCESS_KEY} -l ${LIBRARY_PATH} -m ${MODEL_PATH} -t ${TEXT}
```

Replace `${LIBRARY_PATH}` with path to appropriate library available under [lib](../../lib),
`${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/),
`${MODEL_PATH}` with a supported translation model located [here](../../lib/common/) and
`${TEXT}` with the text to translate.

### Android Demos

### iOS Demos

### Web Demos

## SDKs

### Python

### C

### Android

### iOS

### Web

## Releases

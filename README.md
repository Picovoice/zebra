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

1. Open [ZebraDemo.xcodeproj](demo/ios/ZebraDemo/ZebraDemo.xcodeproj) in XCode.
2. Replace `${YOUR_ACCESS_KEY_HERE}` in the file [`ViewModel.swift`](demo/ios/ZebraDemo/ZebraDemo/ViewModel.swift) with your `AccessKey`.
3. Go to `Product > Scheme` and select the scheme for the language you would like to run the demo in (e.g. `enfrDemo` -> English to French translation demo).
4. Run the demo with a simulator or connected iOS device.
5. Once the demo app has started, enter the text you wish to translate in the text box area, and press the `Translate` button to translate the text.

For more information about iOS demos go to [demo/ios](demo/ios).

### Web Demos

## SDKs

### Python

### C

### Android

### iOS

Create an instance of the engine:

```swift
import Zebra

let modelPath = Bundle(for: type(of: self)).path(
        forResource: "${MODEL_FILE}", // Name of the model file name for Zebra
        ofType: "pv")!

do {
  let zebra = try Zebra(accessKey: "${ACCESS_KEY}", modelPath: modelPath)
} catch {}
```

Replace `${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/) and `${MODEL_FILE}`
with the model file name for Zebra.

#### Translate

```swift
do {
    let translation = try zebra.translate(text: "${TEXT}")
} catch {}
```

Replace `${TEXT}` with the text to be translated.

#### Release resources

When done be sure to explicitly release the resources using `zebra.delete()`.

For more details, see the [iOS SDK](./binding/ios/).

### Web

## Releases

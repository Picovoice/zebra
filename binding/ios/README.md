# Zebra Translate

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Zebra is a lightweight, on-device neural machine translation engine. Zebra is:

- Private; All processing runs locally.
- Cross-Platform:
    - Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64)
    - Android and iOS
    - Chrome, Safari, Firefox, and Edge
    - Raspberry Pi (3, 4, 5)

## Compatibility

- iOS 16.0 or higher

## Installation

<!-- markdown-link-check-disable -->
The Zebra iOS binding is available via [Swift Package Manager](https://www.swift.org/documentation/package-manager/) or [CocoaPods](https://cocoapods.org/pods/Zebra-iOS).
<!-- markdown-link-check-enable -->

To import the package using SPM, open up your project's Package Dependencies in XCode and add:
```
https://github.com/Picovoice/zebra.git
```
To import it into your iOS project using CocoaPods, add the following line to your Podfile:

```ruby
pod 'Zebra-iOS'
```

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra
SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

Create an instance of the Zebra engine:

```swift
import Zebra

let accessKey : String = // .. accessKey provided by Picovoice Console (https://console.picovoice.ai/)

let modelPath = Bundle(for: type(of: self)).path(
        forResource: "${MODEL_FILE}", // Name of the model file name for Zebra
        ofType: "pv")!

do {
    let zebra = try Zebra(accessKey: accessKey, modelPath: modelPath)
} catch { }
```

Replace `${MODEL_FILE}` with a supported translation model located [here](../../lib/common/).
Alternatively, you can provide `modelPath` as an absolute path to the model file on device.

Translate text:

```swift
let translation = try zebra.translate(text: "${TEXT}")
```

Replace `${TEXT}` with the text to translate.

When done, resources have to be released explicitly:

```swift
zebra.delete()
```

### Translation Models

Zebra translation models are located [here](../../lib/common/). The selected model decides the source and target translation languages.

The format of the model follows:

```console
zebra_params_${SOURCE}_${TARGET}.pv
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.

## Running Unit Tests

Copy your `AccessKey` into the `accessKey` variable in [`ZebraAppTestUITests.swift`](ZebraAppTest/ZebraAppTestUITests/ZebraAppTestUITests.swift). Open [`ZebraAppTest.xcodeproj`](ZebraAppTest/ZebraAppTest.xcodeproj) with XCode and run the tests with `Product > Test`.

## Demo App

For example usage refer to our [iOS demo application](../../demo/ios).

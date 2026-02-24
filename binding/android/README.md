# Zebra Binding for Android

## Zebra Translate

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

Zebra is a lightweight, on-device neural machine translation engine. Zebra is:

- Private; All processing runs locally.
- Cross-Platform:
    - Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64)
    - Android and iOS
    - Chrome, Safari, Firefox, and Edge
    - Raspberry Pi (3, 4, 5)

## Compatibility

- Android 5.0+ (API 21+)

## Installation

Zebra can be found on Maven Central. To include the package in your Android project, ensure you have
included `mavenCentral()` in your top-level `build.gradle` file and then add the following to your app's `build.gradle`:

```groovy
dependencies {
    // ...
    implementation 'ai.picovoice:zebra-android:${LATEST_VERSION}'
}
```

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra
SDKs. You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Permissions

To enable AccessKey validation, you must add the following line to your `AndroidManifest.xml` file:

```xml

<uses-permission android:name="android.permission.INTERNET"/>
```

## Usage

Create an instance of the engine with the Zebra Builder class by passing in the `accessKey`, `modelPath` and Android app context:

```java
import ai.picovoice.zebra.*;

final String accessKey = "${ACCESS_KEY}";
final String modelPath = "${MODEL_PATH}";

try {
    Zebra zebra = new Zebra.Builder()
        .setAccessKey(accessKey)
        .setModelPath(modelPath)
        .build(appContext);
} catch (ZebraException ex) { }
```

Check [Translation Models](#translation-models) to read more about how to select the translation model of your choice.

Translate Text:

```java
String translation = zebra.translate("${TEXT_TO_TRANSLATE}");
```

When done, release resources explicitly:

```java
zebra.delete();
```

## Translation Models

Zebra translation models are located [here](../../lib/common/). The selected model decides the source and target translation languages.

The format of the model follows:

```console
zebra_params_${SOURCE}_${TARGET}.pv
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.

## Demos

To see Zebra used in an app, refer to our [Android demo app](../../demo/android/ZebraDemo).

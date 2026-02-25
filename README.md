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

Install the demo package:

```console
pip3 install pvzebrademo
```

Run the following in the terminal:

```console
zebra_demo --access_key ${ACCESS_KEY} --model_path ${MODEL_PATH} --text ${TEXT}
```

Replace `${ACCESS_KEY}` with yours obtained from Picovoice Console, `${MODEL_PATH}` with
a supported translation model located [here](../../lib/common/) and `${TEXT}` with the text to translate.

For more information about Python demos go to [demo/python](./demo/python).

### C Demos

### Android Demos

Using Android Studio, open [demo/android/ZebraDemo](./demo/android/ZebraDemo) as an Android project.

Replace `"${YOUR_ACCESS_KEY_HERE}"` in the
file [MainActivity.java](./demo/android/ZebraDemo/zebra-demo-app/src/main/java/ai/picovoice/zebrademo/MainActivity.java)
with your `AccessKey`.

Go to `Build > Select Build Variant...` and select the language you would like to run the demo in (e.g. `enfrDebug` -> English to French translation demo)

Build and run on an installed simulator or a connected Android device.

For more information about Android demos go to [demo/android](demo/android).

### iOS Demos

### Web Demos

## SDKs

### Python

Install the Python SDK:

```console
pip3 install pvzebra
```

Create an instance of the engine and perform text translation:

```python
import pvzebra

zebra = pvzebra.create(access_key='${ACCESS_KEY}', model_path='${MODEL_PATH}')

print(zebra.translate('${TEXT}'))
```

Replace `${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/), `${MODEL_PATH}` with
a supported translation model located [here](../../lib/common/) and `${TEXT}` with the text to translate.

Finally, when done be sure to explicitly release the resources:

```python
zebra.delete()
```

### C

### Android

To include the Zebra package in your Android project, ensure you have included `mavenCentral()` in your
top-level `build.gradle` file and then add the following to your app's `build.gradle`:

```groovy
dependencies {
    implementation 'ai.picovoice:zebra-android:${LATEST_VERSION}'
}
```

Create an instance of the engine and translate text:

```java
import ai.picovoice.zebra.*;

final String accessKey = "${ACCESS_KEY}"; // AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
final String modelPath = "${MODEL_FILE_PATH}";
try {
    Zebra zebra = new Zebra.Builder()
        .setAccessKey(accessKey)
        .setModelPath(modelPath)
        .build(appContext);
    String translation = zebra.translate("${TEXT}");
} catch (ZebraException e) { }
```

Replace `${ACCESS_KEY}` with yours obtained from Picovoice Console, `${MODEL_FILE_PATH}` with a
Zebra [model file](./lib/common) and `${TEXT}` with the text to be translated.

### iOS

### Web

## Releases

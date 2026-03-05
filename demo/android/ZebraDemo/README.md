# Zebra Demo

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra
SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Setup

1. Open the project in Android Studio
2. Replace `${YOUR_ACCESS_KEY_HERE}` in the file [MainActivity.java](./zebra-demo-app/src/main/java/ai/picovoice/zebrademo/MainActivity.java) with your `AccessKey`.
3. Go to `Build > Select Build Variant...` and select the language you would like to run the demo in (e.g. `enfrDebug` -> English to French translation demo)
4. Build and run on an installed simulator or a connected Android device

## Usage

1. Type a phrase that you'd like to translate into the textbox.
2. Press the `Translate` button to get the translated text.
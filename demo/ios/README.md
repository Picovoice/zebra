# Zebra iOS Demo

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Running the Demo

1. Open [ZebraDemo.xcodeproj](./ZebraDemo/ZebraDemo.xcodeproj/) in XCode.
2. Replace `${YOUR_ACCESS_KEY_HERE}` in the file [`ViewModel.swift`](./ZebraDemo/ZebraDemo/ViewModel.swift) with your `AccessKey`.
3. Go to `Product > Scheme` and select the scheme for the language you would like to run the demo in (e.g. `enfrDemo` -> English to French translation demo).
4. Run the demo with a simulator or connected iOS device.
5. Once the demo app has started, enter the text you wish to translate in the text box area, and press the `Translate` button to translate the text.

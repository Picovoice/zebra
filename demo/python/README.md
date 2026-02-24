# Zebra Translate Demo

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

## Zebra

Zebra is a lightweight, on-device neural machine translation engine. Zebra is:

- Private; All processing runs locally.
- Cross-Platform:
  - Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64, arm64)
  - Raspberry Pi (3, 4, 5)

## Compatibility

- Python 3.9+
- Runs on Linux (x86_64), macOS (x86_64, arm64), Windows (x86_64, arm64), and Raspberry Pi (3, 4, 5).

## Installation

```console
pip3 install pvzebrademo
```

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

Run the following in the terminal:

```console
zebra_demo --access_key ${ACCESS_KEY} --model_path ${MODEL_PATH} --text ${TEXT}
```

Replace `${ACCESS_KEY}` with yours obtained from Picovoice Console, `${MODEL_PATH}` with
a supported translation model located [here](../../lib/common/) and `${TEXT}` with the text to translate.

### Translation Models

The Zebra model decides the source and target languages:

```console
zebra_params_${SOURCE}_${TARGET}.pv
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.

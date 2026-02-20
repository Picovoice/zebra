# Zebra Binding for Python

## Zebra Translate

Made in Vancouver, Canada by [Picovoice](https://picovoice.ai)

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
pip3 install pvzebra
```

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

### Usage

Create an instance of the engine and translate some text:

```python
import pvzebra

handle = pvzebra.create(access_key='${ACCESS_KEY}', model_path='${MODEL_PATH}')

translation = handle.translate('${TEXT}')
print(translation)
```

Replace `${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/), `${MODEL_PATH}` with
a supported translation model located [here](../../lib/common/) and`${TEXT}` with the text to translate.
Finally, when done be sure to explicitly release the resources using `handle.delete()`.

### Translation Models

Zebra translation models are located [here](../../lib/common/). The selected model decides the source and target translation languages.

The format of the model follows:

```console
pv_zebra_params_${SOURCE}_${TARGET}.pv
```

where `${SOURCE}` is the source language and `${TARGET}` is the target language for the translation.

## Demos

[pvzebrademo](https://pypi.org/project/pvzebrademo/) provides command-line utilities for translating text using Zebra.

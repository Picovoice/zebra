# C Demo

## Compatibility

- C99-compatible compiler

## Requirements

- [CMake](https://cmake.org/) version 3.13 or higher
- [MinGW](https://mingw-w64.org/) (**Windows Only**)

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Usage

### Build Linux/MacOS

Build the demo by running this from the root of the repository:

```console
cmake -S demo/c/ -B demo/c/build
cmake --build demo/c/build
```

### Build Windows

Build the demo by running this from the root of the repository:

```console
cmake -S demo/c/ -B demo/c/build -G "MinGW Makefiles"
cmake --build demo/c/build
```

### Run

Running the demo without arguments prints the usage:

```console
usage: ./demo/c/build/zebra_demo -a ACCESS_KEY -l LIBRARY_PATH -m MODEL_PATH -t TEXT
```

Run the command corresponding to your platform from the root of the repository.

Replace `${LIBRARY_PATH}` with path to appropriate library available under [lib](../../lib),
`${ACCESS_KEY}` with yours obtained from [Picovoice Console](https://console.picovoice.ai/),
`${MODEL_PATH}` with a supported translation model located [here](../../lib/common/) and
`${TEXT}` with the text to translate.

### Translation Models

Zebra translation models are located [here](../../lib/common/). The selected model decides the source and target translation languages.

The format of the model follows:

```console
zebra_params_${SOURCE}_${TARGET}.pv
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.


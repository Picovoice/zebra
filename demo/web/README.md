# zebra-web-demo

This is a basic demo to show how to use Zebra for web browsers, using the IIFE version of the library (i.e. an HTML script tag).

## AccessKey

Zebra requires a valid Picovoice `AccessKey` at initialization. `AccessKey` acts as your credentials when using Zebra SDKs.
You can get your `AccessKey` for free. Make sure to keep your `AccessKey` secret.
Signup or Login to [Picovoice Console](https://console.picovoice.ai/) to get your `AccessKey`.

## Install & run

Use `yarn` or `npm` to install the dependencies, and the `start` script with two language codes
to start a local web server hosting the demo of your choice (e.g. `en` -> English, `fr` -> French).
To see a list of available language pairs, run `start` without a language code.

```console
yarn
yarn start ${SOURCE} ${TARGET}
```

(or)

```console
npm install
npm run start ${SOURCE} ${TARGET}
```

Where `${SOURCE}` is the language code of the source language and `${TARGET}` is the language code of the target language for the translation.

Open `localhost:5000` in your web browser, as hinted at in the output:

```console
Available on:
  http://localhost:5000
Hit CTRL-C to stop the server
```

Wait until Zebra has initialized. Enter text and press the translate button to translate the input text.

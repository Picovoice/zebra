/*
  Copyright 2026 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

/* eslint camelcase: 0 */

import { Mutex } from 'async-mutex';

import { simd } from 'wasm-feature-detect';

import {
  arrayBufferToStringAtIndex,
  base64ToUint8Array,
  isAccessKeyValid,
  loadModel,
} from '@picovoice/web-utils';

import createModuleSimd from "./lib/pv_zebra_simd";
import createModulePThread from "./lib/pv_zebra_pthread";

import { ZebraModel, PvStatus } from './types';
import { pvStatusToException } from './zebra_errors';
import * as ZebraErrors from './zebra_errors';

/**
 * WebAssembly function types
 */

type pv_zebra_init_type = (
  accessKey: number,
  modelPath: number,
  device: number,
  object: number
) => Promise<number>;
type pv_zebra_translate_type = (
  object: number,
  text: number,
  translation: number,
) => Promise<number>;
type pv_zebra_translation_delete_type = (object: number, translation: number) => void;
type pv_zebra_delete_type = (object: number) => void;
type pv_zebra_max_character_limit_type = (object: number, maxCharacterLimit: number) => number;
type pv_zebra_version_type = () => number;
type pv_zebra_list_hardware_devices_type = (
  hardwareDevices: number,
  numHardwareDevices: number
) => number;
type pv_zebra_free_hardware_devices_type = (
  hardwareDevices: number,
  numHardwareDevices: number
) => number;
type pv_set_sdk_type = (sdk: number) => void;
type pv_get_error_stack_type = (messageStack: number, messageStackDepth: number) => number;
type pv_free_error_stack_type = (messageStack: number) => void;

type ZebraModule = EmscriptenModule & {
  _pv_free: (address: number) => void;

  _pv_zebra_translation_delete: pv_zebra_translation_delete_type;
  _pv_zebra_max_character_limit: pv_zebra_max_character_limit_type;
  _pv_zebra_version: pv_zebra_version_type;

  _pv_zebra_list_hardware_devices: pv_zebra_list_hardware_devices_type;
  _pv_zebra_free_hardware_devices: pv_zebra_free_hardware_devices_type;

  _pv_set_sdk: pv_set_sdk_type;
  _pv_get_error_stack: pv_get_error_stack_type;
  _pv_free_error_stack: pv_free_error_stack_type;

  // em default functions
  addFunction: typeof addFunction;
  ccall: typeof ccall;
  cwrap: typeof cwrap;
}

type ZebraWasmOutput = {
  module: ZebraModule;

  pv_zebra_translate: pv_zebra_translate_type;
  pv_zebra_translation_delete: pv_zebra_translation_delete_type;
  pv_zebra_delete: pv_zebra_delete_type;

  version: string;
  maxCharacterLimit: number;

  objectAddress: number;
  translationAddressAddress: number;
  messageStackAddressAddressAddress: number;
  messageStackDepthAddress: number;
};

export class Zebra {
  private _module?: ZebraModule;

  private readonly _pv_zebra_translate: pv_zebra_translate_type;
  private readonly _pv_zebra_delete: pv_zebra_delete_type;

  private readonly _maxCharacterLimit: number;
  private readonly _version: string;

  private readonly _functionMutex: Mutex;

  private readonly _objectAddress: number;
  private readonly _translationAddressAddress: number;
  private readonly _messageStackAddressAddressAddress: number;
  private readonly _messageStackDepthAddress: number;

  private static _wasmSimd: string;
  private static _wasmSimdLib: string;
  private static _wasmPThread: string;
  private static _wasmPThreadLib: string;
  private static _sdk: string = 'web';

  private static _zebraMutex = new Mutex();

  private constructor(handleWasm: ZebraWasmOutput) {
    this._module = handleWasm.module;

    this._pv_zebra_translate = handleWasm.pv_zebra_translate;
    this._pv_zebra_delete = handleWasm.pv_zebra_delete;

    this._version = handleWasm.version;
    this._maxCharacterLimit = handleWasm.maxCharacterLimit;

    this._objectAddress = handleWasm.objectAddress;
    this._translationAddressAddress = handleWasm.translationAddressAddress;
    this._messageStackAddressAddressAddress =
      handleWasm.messageStackAddressAddressAddress;
    this._messageStackDepthAddress = handleWasm.messageStackDepthAddress;

    this._functionMutex = new Mutex();
  }

  /**
   * Maximum number of characters that can be translated at once.
   */
  get maxCharacterLimit(): number {
    return this._maxCharacterLimit;
  }

  /**
   * Get Zebra engine version.
   */
  get version(): string {
    return this._version;
  }

  /**
   * Set base64 wasm file with SIMD feature.
   * @param wasmSimd Base64'd wasm file to use to initialize wasm.
   */
  public static setWasmSimd(wasmSimd: string): void {
    if (this._wasmSimd === undefined) {
      this._wasmSimd = wasmSimd;
    }
  }

  /**
   * Set base64 SIMD wasm file in text format.
   * @param wasmSimdLib Base64'd wasm file in text format.
   */
  public static setWasmSimdLib(wasmSimdLib: string): void {
    if (this._wasmSimdLib === undefined) {
      this._wasmSimdLib = wasmSimdLib;
    }
  }

  /**
   * Set base64 wasm file with SIMD and pthread feature.
   * @param wasmPThread Base64'd wasm file to use to initialize wasm.
   */
  public static setWasmPThread(wasmPThread: string): void {
    if (this._wasmPThread === undefined) {
      this._wasmPThread = wasmPThread;
    }
  }

  /**
   * Set base64 SIMD and thread wasm file in text format.
   * @param wasmPThreadLib Base64'd wasm file in text format.
   */
  public static setWasmPThreadLib(wasmPThreadLib: string): void {
    if (this._wasmPThreadLib === undefined) {
      this._wasmPThreadLib = wasmPThreadLib;
    }
  }

  public static setSdk(sdk: string): void {
    Zebra._sdk = sdk;
  }

  /**
   * Creates an instance of the Picovoice Zebra Translate engine.
   * Behind the scenes, it requires the WebAssembly code to load and initialize before
   * it can create an instance.
   *
   * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
   * @param model Zebra model options.
   * @param model.base64 The model in base64 string to initialize Zebra.
   * @param model.publicPath The model path relative to the public directory.
   * @param model.customWritePath Custom path to save the model in storage.
   * Set to a different name to use multiple models across `zebra` instances.
   * @param model.forceWrite Flag to overwrite the model in storage even if it exists.
   * @param model.version Version of the model file. Increment to update the model file in storage.
   * @param device String representation of the device (e.g., CPU or GPU) to use. If set to `best`, the most
   * suitable device is selected automatically. If set to `gpu`, the engine uses the first available GPU device. To select a specific
   * GPU device, set this argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}` is the index of the target GPU. If set to
   * `cpu`, the engine will run on the CPU with the default number of threads. To specify the number of threads, set this
   * argument to `cpu:${NUM_THREADS}`, where `${NUM_THREADS}` is the desired number of threads.
   *
   * @returns An instance of the Zebra engine.
   */
  public static async create(
    accessKey: string,
    model: ZebraModel,
    device?: string
  ): Promise<Zebra> {
    const customWritePath = model.customWritePath
      ? model.customWritePath
      : 'zebra_model';
    const modelPath = await loadModel({ ...model, customWritePath });

    return await Zebra._init(accessKey, modelPath, device);
  }

  public static async _init(
    accessKey: string,
    modelPath: string,
    device?: string
  ): Promise<Zebra> {
    if (!isAccessKeyValid(accessKey)) {
      throw new ZebraErrors.ZebraInvalidArgumentError('Invalid AccessKey');
    }

    const isSimd = await simd();
    if (!isSimd) {
      throw new ZebraErrors.ZebraRuntimeError('Browser not supported.');
    }

    let deviceArg = device ? device : 'best';
    const isWorkerScope =
      typeof WorkerGlobalScope !== 'undefined' &&
      self instanceof WorkerGlobalScope;
    if (
      !isWorkerScope &&
      (deviceArg === 'best' ||
        (deviceArg.startsWith('cpu') && deviceArg !== 'cpu:1'))
    ) {
      // eslint-disable-next-line no-console
      console.warn('Multi-threading is not supported on main thread.');
      deviceArg = 'cpu:1';
    }

    const sabDefined =
      typeof SharedArrayBuffer !== 'undefined' && deviceArg !== 'cpu:1';

    return new Promise<Zebra>((resolve, reject) => {
      Zebra._zebraMutex
        .runExclusive(async () => {
          const wasmOutput = await Zebra.initWasm(
            accessKey.trim(),
            modelPath.trim(),
            deviceArg,
            sabDefined ? this._wasmPThread : this._wasmSimd,
            sabDefined ? this._wasmPThreadLib : this._wasmSimdLib,
            sabDefined ? createModulePThread : createModuleSimd
          );
          return new Zebra(wasmOutput);
        })
        .then((result: Zebra) => {
          resolve(result);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Translates text. The maximum number of characters that can be translated at once
   * is given by `.maxCharacterLimit`.
   *
   * @param text Text to translate.
   * @return Translated text.
   */
  public async translate(text: string): Promise<string> {
    if (typeof text !== 'string') {
      throw new ZebraErrors.ZebraInvalidArgumentError(
        `The argument 'text' must be provided as a string`,
      );
    }

    if (text.trim().length > this._maxCharacterLimit) {
      throw new ZebraErrors.ZebraInvalidArgumentError(`
        'text' length must be smaller than ${this._maxCharacterLimit}
      `);
    }

    return new Promise<string>((resolve, reject) => {
      this._functionMutex
        .runExclusive(async () => {
          if (this._module === undefined) {
            throw new ZebraErrors.ZebraInvalidStateError(
              'Attempted to call Zebra process after release.'
            );
          }

          const encodedText = new TextEncoder().encode(text);
          const textAddress = this._module._malloc(
            (encodedText.length + 1) * Uint8Array.BYTES_PER_ELEMENT,
          );
          if (textAddress === 0) {
            throw new ZebraErrors.ZebraOutOfMemoryError(
              'malloc failed: Cannot allocate memory for text',
            );
          }
          this._module.HEAPU8.set(encodedText, textAddress);
          this._module.HEAPU8[textAddress + encodedText.length] = 0;

          const status = await this._pv_zebra_translate(
            this._objectAddress,
            textAddress,
            this._translationAddressAddress
          );
          this._module._pv_free(textAddress);

          if (status !== PvStatus.SUCCESS) {
            const messageStack = Zebra.getMessageStack(
              this._module._pv_get_error_stack,
              this._module._pv_free_error_stack,
              this._messageStackAddressAddressAddress,
              this._messageStackDepthAddress,
              this._module.HEAP32,
              this._module.HEAPU8
            );

            throw pvStatusToException(status, 'Process failed', messageStack);
          }

          const translationAddress = this._module.HEAP32[
            this._translationAddressAddress / Int32Array.BYTES_PER_ELEMENT
          ];

          const translation = arrayBufferToStringAtIndex(this._module.HEAPU8, translationAddress);
          this._module._pv_zebra_translation_delete(this._objectAddress, translationAddress);

          return translation;
        })
        .then((result: string) => {
          resolve(result);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  /**
   * Releases resources acquired by WebAssembly module.
   */
  public async release(): Promise<void> {
    if (!this._module) {
      return;
    }
    this._pv_zebra_delete(this._objectAddress);
    this._module._pv_free(this._translationAddressAddress);
    this._module._pv_free(this._messageStackAddressAddressAddress);
    this._module._pv_free(this._messageStackDepthAddress);
    this._module = undefined;
  }

  /**
   * Lists all available devices that Zebra can use for inference.
   * Each entry in the list can be the used as the `device` argument for the `.create` method.
   *
   * @returns List of all available devices that Zebra can use for inference.
   */
  public static async listAvailableDevices(): Promise<string[]> {
    return new Promise<string[]>((resolve, reject) => {
      Zebra._zebraMutex
        .runExclusive(async () => {
          const isSimd = await simd();
          if (!isSimd) {
            throw new ZebraErrors.ZebraRuntimeError('Unsupported Browser');
          }

          const blob = new Blob([base64ToUint8Array(this._wasmSimdLib)], {
            type: 'application/javascript',
          });
          const module: ZebraModule = await createModuleSimd({
            mainScriptUrlOrBlob: blob,
            wasmBinary: base64ToUint8Array(this._wasmSimd),
          });

          const hardwareDevicesAddressAddress = module._malloc(
            Int32Array.BYTES_PER_ELEMENT
          );
          if (hardwareDevicesAddressAddress === 0) {
            throw new ZebraErrors.ZebraOutOfMemoryError(
              'malloc failed: Cannot allocate memory for hardwareDevices'
            );
          }

          const numHardwareDevicesAddress = module._malloc(
            Int32Array.BYTES_PER_ELEMENT
          );
          if (numHardwareDevicesAddress === 0) {
            throw new ZebraErrors.ZebraOutOfMemoryError(
              'malloc failed: Cannot allocate memory for numHardwareDevices'
            );
          }

          const status: PvStatus = module._pv_zebra_list_hardware_devices(
            hardwareDevicesAddressAddress,
            numHardwareDevicesAddress
          );

          const messageStackDepthAddress = module._malloc(
            Int32Array.BYTES_PER_ELEMENT
          );
          if (!messageStackDepthAddress) {
            throw new ZebraErrors.ZebraOutOfMemoryError(
              'malloc failed: Cannot allocate memory for messageStackDepth'
            );
          }

          const messageStackAddressAddressAddress = module._malloc(
            Int32Array.BYTES_PER_ELEMENT
          );
          if (!messageStackAddressAddressAddress) {
            throw new ZebraErrors.ZebraOutOfMemoryError(
              'malloc failed: Cannot allocate memory messageStack'
            );
          }

          if (status !== PvStatus.SUCCESS) {
            const messageStack = Zebra.getMessageStack(
              module._pv_get_error_stack,
              module._pv_free_error_stack,
              messageStackAddressAddressAddress,
              messageStackDepthAddress,
              module.HEAP32,
              module.HEAPU8
            );
            module._pv_free(messageStackAddressAddressAddress);
            module._pv_free(messageStackDepthAddress);

            throw pvStatusToException(
              status,
              'List devices failed',
              messageStack
            );
          }
          module._pv_free(messageStackAddressAddressAddress);
          module._pv_free(messageStackDepthAddress);

          const numHardwareDevices: number =
            module.HEAP32[
              numHardwareDevicesAddress / Int32Array.BYTES_PER_ELEMENT
            ];
          module._pv_free(numHardwareDevicesAddress);

          const hardwareDevicesAddress =
            module.HEAP32[
              hardwareDevicesAddressAddress / Int32Array.BYTES_PER_ELEMENT
            ];

          const hardwareDevices: string[] = [];
          for (let i = 0; i < numHardwareDevices; i++) {
            const deviceAddress =
              module.HEAP32[
                hardwareDevicesAddress / Int32Array.BYTES_PER_ELEMENT + i
              ];
            hardwareDevices.push(
              arrayBufferToStringAtIndex(module.HEAPU8, deviceAddress)
            );
          }
          module._pv_zebra_free_hardware_devices(
            hardwareDevicesAddress,
            numHardwareDevices
          );
          module._pv_free(hardwareDevicesAddressAddress);

          return hardwareDevices;
        })
        .then((result: string[]) => {
          resolve(result);
        })
        .catch((error: any) => {
          reject(error);
        });
    });
  }

  private static async initWasm(
    accessKey: string,
    modelPath: string,
    device: string,
    wasmBase64: string,
    wasmLibBase64: string,
    createModuleFunc: any
  ): Promise<any> {
    const blob = new Blob([base64ToUint8Array(wasmLibBase64)], {
      type: 'application/javascript',
    });
    const module: ZebraModule = await createModuleFunc({
      mainScriptUrlOrBlob: blob,
      wasmBinary: base64ToUint8Array(wasmBase64),
    });

    const pv_zebra_init: pv_zebra_init_type = this.wrapAsyncFunction(
      module,
      'pv_zebra_init',
      4
    );
    const pv_zebra_translate: pv_zebra_translate_type = this.wrapAsyncFunction(
      module,
      'pv_zebra_translate',
      3
    );
    const pv_zebra_delete: pv_zebra_delete_type = this.wrapAsyncFunction(
      module,
      'pv_zebra_delete',
      1
    );

    const objectAddressAddress = module._malloc(Int32Array.BYTES_PER_ELEMENT);
    if (objectAddressAddress === 0) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }

    const accessKeyAddress = module._malloc(
      (accessKey.length + 1) * Uint8Array.BYTES_PER_ELEMENT
    );
    if (accessKeyAddress === 0) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }
    for (let i = 0; i < accessKey.length; i++) {
      module.HEAPU8[accessKeyAddress + i] = accessKey.charCodeAt(i);
    }
    module.HEAPU8[accessKeyAddress + accessKey.length] = 0;

    const modelPathEncoded = new TextEncoder().encode(modelPath);
    const modelPathAddress = module._malloc(
      (modelPathEncoded.length + 1) * Uint8Array.BYTES_PER_ELEMENT
    );
    if (modelPathAddress === 0) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }
    module.HEAPU8.set(modelPathEncoded, modelPathAddress);
    module.HEAPU8[modelPathAddress + modelPathEncoded.length] = 0;

    const deviceAddress = module._malloc(
      (device.length + 1) * Uint8Array.BYTES_PER_ELEMENT
    );
    if (deviceAddress === 0) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }
    for (let i = 0; i < device.length; i++) {
      module.HEAPU8[deviceAddress + i] = device.charCodeAt(i);
    }
    module.HEAPU8[deviceAddress + device.length] = 0;

    const sdkEncoded = new TextEncoder().encode(this._sdk);
    const sdkAddress = module._malloc(
      (sdkEncoded.length + 1) * Uint8Array.BYTES_PER_ELEMENT
    );
    if (!sdkAddress) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }
    module.HEAPU8.set(sdkEncoded, sdkAddress);
    module.HEAPU8[sdkAddress + sdkEncoded.length] = 0;
    module._pv_set_sdk(sdkAddress);
    module._pv_free(sdkAddress);

    const messageStackDepthAddress = module._malloc(
      Int32Array.BYTES_PER_ELEMENT
    );
    if (!messageStackDepthAddress) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }

    const messageStackAddressAddressAddress = module._malloc(
      Int32Array.BYTES_PER_ELEMENT
    );
    if (!messageStackAddressAddressAddress) {
      throw new ZebraErrors.ZebraOutOfMemoryError(
        'malloc failed: Cannot allocate memory'
      );
    }

    let status = await pv_zebra_init(
      accessKeyAddress,
      modelPathAddress,
      deviceAddress,
      objectAddressAddress
    );
    module._pv_free(accessKeyAddress);
    module._pv_free(modelPathAddress);
    module._pv_free(deviceAddress);
    if (status !== PvStatus.SUCCESS) {
      const messageStack = Zebra.getMessageStack(
        module._pv_get_error_stack,
        module._pv_free_error_stack,
        messageStackAddressAddressAddress,
        messageStackDepthAddress,
        module.HEAP32,
        module.HEAPU8
      );

      throw pvStatusToException(status, 'Initialization failed', messageStack);
    }

    const objectAddress =
      module.HEAP32[objectAddressAddress / Int32Array.BYTES_PER_ELEMENT];
    module._pv_free(objectAddressAddress);

    const maxCharacterLimitAddress = module._malloc(Int32Array.BYTES_PER_ELEMENT);
    status = module._pv_zebra_max_character_limit(objectAddress, maxCharacterLimitAddress);
    if (status !== PvStatus.SUCCESS) {
      const messageStack = Zebra.getMessageStack(
        module._pv_get_error_stack,
        module._pv_free_error_stack,
        messageStackAddressAddressAddress,
        messageStackDepthAddress,
        module.HEAP32,
        module.HEAPU8
      );

      throw pvStatusToException(status, 'Failed to get max character limit', messageStack);
    }

    const maxCharacterLimit = module.HEAP32[maxCharacterLimitAddress / Int32Array.BYTES_PER_ELEMENT];
    module._pv_free(maxCharacterLimitAddress);

    const versionAddress = module._pv_zebra_version();
    const version = arrayBufferToStringAtIndex(module.HEAPU8, versionAddress);

    const translationAddressAddress = module._malloc(Int32Array.BYTES_PER_ELEMENT);
    if (translationAddressAddress === 0) {
      throw new ZebraErrors.ZebraOutOfMemoryError('malloc failed: Cannot allocate memory');
    }

    return {
      module: module,

      pv_zebra_translate: pv_zebra_translate,
      pv_zebra_delete: pv_zebra_delete,

      maxCharacterLimit: maxCharacterLimit,
      version: version,

      objectAddress: objectAddress,
      translationAddressAddress: translationAddressAddress,
      messageStackAddressAddressAddress: messageStackAddressAddressAddress,
      messageStackDepthAddress: messageStackDepthAddress,
    };
  }

  private static getMessageStack(
    pv_get_error_stack: pv_get_error_stack_type,
    pv_free_error_stack: pv_free_error_stack_type,
    messageStackAddressAddressAddress: number,
    messageStackDepthAddress: number,
    memoryBufferInt32: Int32Array,
    memoryBufferUint8: Uint8Array
  ): string[] {
    const status = pv_get_error_stack(
      messageStackAddressAddressAddress,
      messageStackDepthAddress
    );
    if (status !== PvStatus.SUCCESS) {
      throw new Error(`Unable to get error state: ${status}`);
    }

    const messageStackAddressAddress =
      memoryBufferInt32[
        messageStackAddressAddressAddress / Int32Array.BYTES_PER_ELEMENT
      ];

    const messageStackDepth =
      memoryBufferInt32[
        messageStackDepthAddress / Int32Array.BYTES_PER_ELEMENT
      ];
    const messageStack: string[] = [];
    for (let i = 0; i < messageStackDepth; i++) {
      const messageStackAddress =
        memoryBufferInt32[
          messageStackAddressAddress / Int32Array.BYTES_PER_ELEMENT + i
        ];
      const message = arrayBufferToStringAtIndex(
        memoryBufferUint8,
        messageStackAddress
      );
      messageStack.push(message);
    }

    pv_free_error_stack(messageStackAddressAddress);

    return messageStack;
  }

  private static wrapAsyncFunction(
    module: ZebraModule,
    functionName: string,
    numArgs: number
  ): (...args: any[]) => any {
    // @ts-ignore
    return module.cwrap(functionName, 'number', Array(numArgs).fill('number'), {
      async: true,
    });
  }
}

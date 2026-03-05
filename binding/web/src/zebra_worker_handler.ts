/*
  Copyright 2026 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

/// <reference no-default-lib="false"/>
/// <reference lib="webworker" />

import { Zebra } from './zebra';
import {
  ZebraWorkerInitRequest,
  ZebraWorkerTranslateRequest,
  ZebraWorkerRequest,
  PvStatus,
} from './types';
import { ZebraError } from './zebra_errors';

let zebra: Zebra | null = null;

const initRequest = async (request: ZebraWorkerInitRequest): Promise<any> => {
  if (zebra !== null) {
    return {
      command: 'error',
      status: PvStatus.INVALID_STATE,
      shortMessage: 'Zebra already initialized',
    };
  }
  try {
    Zebra.setWasmSimd(request.wasmSimd);
    Zebra.setWasmSimdLib(request.wasmSimdLib);
    Zebra.setWasmPThread(request.wasmPThread);
    Zebra.setWasmPThreadLib(request.wasmPThreadLib);
    Zebra.setSdk(request.sdk);
    zebra = await Zebra._init(request.accessKey, request.modelPath, request.device);
    return {
      command: 'ok',
      version: zebra.version,
      maxCharacterLimit: zebra.maxCharacterLimit,
    };
  } catch (e: any) {
    if (e instanceof ZebraError) {
      return {
        command: 'error',
        status: e.status,
        shortMessage: e.shortMessage,
        messageStack: e.messageStack,
      };
    }
    return {
      command: 'error',
      status: PvStatus.RUNTIME_ERROR,
      shortMessage: e.message,
    };
  }
};

const translateRequest = async (
  request: ZebraWorkerTranslateRequest
): Promise<any> => {
  if (zebra === null) {
    return {
      command: 'error',
      status: PvStatus.INVALID_STATE,
      shortMessage: 'Zebra not initialized',
    };
  }
  try {
    return {
      command: 'ok',
      translation: await zebra.translate(request.text),
    };
  } catch (e: any) {
    if (e instanceof ZebraError) {
      return {
        command: 'error',
        status: e.status,
        shortMessage: e.shortMessage,
        messageStack: e.messageStack,
      };
    }
    return {
      command: 'error',
      status: PvStatus.RUNTIME_ERROR,
      shortMessage: e.message,
    };
  }
};

const releaseRequest = async (): Promise<any> => {
  if (zebra !== null) {
    await zebra.release();
    zebra = null;
    close();
  }
  return {
    command: 'ok',
  };
};

/**
 * Zebra worker handler.
 */
self.onmessage = async function (
  event: MessageEvent<ZebraWorkerRequest>
): Promise<void> {
  switch (event.data.command) {
    case 'init':
      self.postMessage(await initRequest(event.data));
      break;
    case 'translate':
      self.postMessage(await translateRequest(event.data));
      break;
    case 'release':
      self.postMessage(await releaseRequest());
      break;
    default:
      self.postMessage({
        command: 'failed',
        status: PvStatus.RUNTIME_ERROR,
        // @ts-ignore
        shortMessage: `Unrecognized command: ${event.data.command}`,
      });
  }
};

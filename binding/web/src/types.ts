/*
  Copyright 2026 Picovoice Inc.

  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
  file accompanying this source.

  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import { PvModel } from '@picovoice/web-utils';

export enum PvStatus {
  SUCCESS = 10000,
  OUT_OF_MEMORY,
  IO_ERROR,
  INVALID_ARGUMENT,
  STOP_ITERATION,
  KEY_ERROR,
  INVALID_STATE,
  RUNTIME_ERROR,
  ACTIVATION_ERROR,
  ACTIVATION_LIMIT_REACHED,
  ACTIVATION_THROTTLED,
  ACTIVATION_REFUSED,
}

/**
 * ZebraModel types
 */
export type ZebraModel = PvModel;

export type ZebraWorkerInitRequest = {
  command: 'init';
  accessKey: string;
  modelPath: string;
  device?: string;
  wasmSimd: string;
  wasmSimdLib: string;
  wasmPThread: string;
  wasmPThreadLib: string;
  sdk: string;
};

export type ZebraWorkerTranslateRequest = {
  command: 'translate';
  text: string;
};

export type ZebraWorkerReleaseRequest = {
  command: 'release';
};

export type ZebraWorkerRequest =
  | ZebraWorkerInitRequest
  | ZebraWorkerTranslateRequest
  | ZebraWorkerReleaseRequest;

export type ZebraWorkerFailureResponse = {
  command: 'failed' | 'error';
  status: PvStatus;
  shortMessage: string;
  messageStack: string[];
};

export type ZebraWorkerInitResponse =
  | ZebraWorkerFailureResponse
  | {
      command: 'ok';
      maxCharacterLimit: number;
      version: string;
    };

export type ZebraWorkerTranslateResponse =
  | ZebraWorkerFailureResponse
  | {
      command: 'ok';
      translation: string;
    };

export type ZebraWorkerReleaseResponse =
  | ZebraWorkerFailureResponse
  | {
      command: 'ok';
    };

export type ZebraWorkerResponse =
  | ZebraWorkerInitResponse
  | ZebraWorkerTranslateResponse
  | ZebraWorkerReleaseResponse;

import { Zebra } from './zebra';
import { ZebraWorker } from './zebra_worker';
import * as ZebraErrors from './zebra_errors';

import {
  ZebraModel,
  ZebraWorkerInitRequest,
  ZebraWorkerTranslateRequest,
  ZebraWorkerReleaseRequest,
  ZebraWorkerRequest,
  ZebraWorkerInitResponse,
  ZebraWorkerTranslateResponse,
  ZebraWorkerReleaseResponse,
  ZebraWorkerFailureResponse,
  ZebraWorkerResponse,
} from './types';

import zebraWasmSimd from './lib/pv_zebra_simd.wasm';
import zebraWasmSimdLib from './lib/pv_zebra_simd.txt';
import zebraWasmPThread from './lib/pv_zebra_pthread.wasm';
import zebraWasmPThreadLib from './lib/pv_zebra_pthread.txt';

Zebra.setWasmSimd(zebraWasmSimd);
Zebra.setWasmSimdLib(zebraWasmSimdLib);
Zebra.setWasmPThread(zebraWasmPThread);
Zebra.setWasmPThreadLib(zebraWasmPThreadLib);
ZebraWorker.setWasmSimd(zebraWasmSimd);
ZebraWorker.setWasmSimdLib(zebraWasmSimdLib);
ZebraWorker.setWasmPThread(zebraWasmPThread);
ZebraWorker.setWasmPThreadLib(zebraWasmPThreadLib);

export {
  Zebra,
  ZebraErrors,
  ZebraModel,
  ZebraWorker,
  ZebraWorkerInitRequest,
  ZebraWorkerTranslateRequest,
  ZebraWorkerReleaseRequest,
  ZebraWorkerRequest,
  ZebraWorkerInitResponse,
  ZebraWorkerTranslateResponse,
  ZebraWorkerReleaseResponse,
  ZebraWorkerFailureResponse,
  ZebraWorkerResponse,
};

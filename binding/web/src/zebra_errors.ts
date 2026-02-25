//
// Copyright 2026 Picovoice Inc.
//
// You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
// file accompanying this source.
//
// Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
// an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
// specific language governing permissions and limitations under the License.
//

import { PvError } from '@picovoice/web-utils';
import { PvStatus } from './types';

class ZebraError extends Error {
  private readonly _status: PvStatus;
  private readonly _shortMessage: string;
  private readonly _messageStack: string[];

  constructor(
    status: PvStatus,
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(ZebraError.errorToString(message, messageStack, pvError));
    this._status = status;
    this.name = 'ZebraError';
    this._shortMessage = message;
    this._messageStack = messageStack;
  }

  get status(): PvStatus {
    return this._status;
  }

  get shortMessage(): string {
    return this._shortMessage;
  }

  get messageStack(): string[] {
    return this._messageStack;
  }

  private static errorToString(
    initial: string,
    messageStack: string[],
    pvError: PvError | null = null
  ): string {
    let msg = initial;

    if (pvError) {
      const pvErrorMessage = pvError.getErrorString();
      if (pvErrorMessage.length > 0) {
        msg += `\nDetails: ${pvErrorMessage}`;
      }
    }

    if (messageStack.length > 0) {
      msg += `: ${messageStack.reduce(
        (acc, value, index) => acc + '\n  [' + index + '] ' + value,
        ''
      )}`;
    }

    return msg;
  }
}

class ZebraOutOfMemoryError extends ZebraError {
  constructor(
    message: string,
    messageStack?: string[],
    pvError: PvError | null = null
  ) {
    super(PvStatus.OUT_OF_MEMORY, message, messageStack, pvError);
    this.name = 'ZebraOutOfMemoryError';
  }
}

class ZebraIOError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.IO_ERROR, message, messageStack, pvError);
    this.name = 'ZebraIOError';
  }
}

class ZebraInvalidArgumentError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.INVALID_ARGUMENT, message, messageStack, pvError);
    this.name = 'ZebraInvalidArgumentError';
  }
}

class ZebraStopIterationError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.STOP_ITERATION, message, messageStack, pvError);
    this.name = 'ZebraStopIterationError';
  }
}

class ZebraKeyError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.KEY_ERROR, message, messageStack, pvError);
    this.name = 'ZebraKeyError';
  }
}

class ZebraInvalidStateError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.INVALID_STATE, message, messageStack, pvError);
    this.name = 'ZebraInvalidStateError';
  }
}

class ZebraRuntimeError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.RUNTIME_ERROR, message, messageStack, pvError);
    this.name = 'ZebraRuntimeError';
  }
}

class ZebraActivationError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.ACTIVATION_ERROR, message, messageStack, pvError);
    this.name = 'ZebraActivationError';
  }
}

class ZebraActivationLimitReachedError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.ACTIVATION_LIMIT_REACHED, message, messageStack, pvError);
    this.name = 'ZebraActivationLimitReachedError';
  }
}

class ZebraActivationThrottledError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.ACTIVATION_THROTTLED, message, messageStack, pvError);
    this.name = 'ZebraActivationThrottledError';
  }
}

class ZebraActivationRefusedError extends ZebraError {
  constructor(
    message: string,
    messageStack: string[] = [],
    pvError: PvError | null = null
  ) {
    super(PvStatus.ACTIVATION_REFUSED, message, messageStack, pvError);
    this.name = 'ZebraActivationRefusedError';
  }
}

export {
  ZebraError,
  ZebraOutOfMemoryError,
  ZebraIOError,
  ZebraInvalidArgumentError,
  ZebraStopIterationError,
  ZebraKeyError,
  ZebraInvalidStateError,
  ZebraRuntimeError,
  ZebraActivationError,
  ZebraActivationLimitReachedError,
  ZebraActivationThrottledError,
  ZebraActivationRefusedError,
};

export function pvStatusToException(
  pvStatus: PvStatus,
  errorMessage: string,
  messageStack: string[] = [],
  pvError: PvError | null = null
): ZebraError {
  switch (pvStatus) {
    case PvStatus.OUT_OF_MEMORY:
      return new ZebraOutOfMemoryError(errorMessage, messageStack, pvError);
    case PvStatus.IO_ERROR:
      return new ZebraIOError(errorMessage, messageStack, pvError);
    case PvStatus.INVALID_ARGUMENT:
      return new ZebraInvalidArgumentError(
        errorMessage,
        messageStack,
        pvError
      );
    case PvStatus.STOP_ITERATION:
      return new ZebraStopIterationError(errorMessage, messageStack, pvError);
    case PvStatus.KEY_ERROR:
      return new ZebraKeyError(errorMessage, messageStack, pvError);
    case PvStatus.INVALID_STATE:
      return new ZebraInvalidStateError(errorMessage, messageStack, pvError);
    case PvStatus.RUNTIME_ERROR:
      return new ZebraRuntimeError(errorMessage, messageStack, pvError);
    case PvStatus.ACTIVATION_ERROR:
      return new ZebraActivationError(errorMessage, messageStack, pvError);
    case PvStatus.ACTIVATION_LIMIT_REACHED:
      return new ZebraActivationLimitReachedError(
        errorMessage,
        messageStack,
        pvError
      );
    case PvStatus.ACTIVATION_THROTTLED:
      return new ZebraActivationThrottledError(
        errorMessage,
        messageStack,
        pvError
      );
    case PvStatus.ACTIVATION_REFUSED:
      return new ZebraActivationRefusedError(
        errorMessage,
        messageStack,
        pvError
      );
    default:
      // eslint-disable-next-line no-console
      console.warn(`Unmapped error code: ${pvStatus}`);
      return new ZebraError(pvStatus, errorMessage);
  }
}

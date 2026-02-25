//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import Foundation

public class ZebraError: LocalizedError {
    private let message: String
    private let messageStack: [String]

    public init (_ message: String, _ messageStack: [String] = []) {
        self.message = message
        self.messageStack = messageStack
    }

    public var errorDescription: String? {
        var messageString = message
        if messageStack.count > 0 {
            messageString += ":"
            for i in 0..<messageStack.count {
                messageString += "\n  [\(i)] \(messageStack[i])"
            }
        }
        return messageString
    }

    public var name: String {
        get {
            return String(describing: type(of: self))
        }
    }
}

public class ZebraMemoryError: ZebraError {}

public class ZebraIOError: ZebraError {}

public class ZebraInvalidArgumentError: ZebraError {}

public class ZebraStopIterationError: ZebraError {}

public class ZebraKeyError: ZebraError {}

public class ZebraInvalidStateError: ZebraError {}

public class ZebraRuntimeError: ZebraError {}

public class ZebraActivationError: ZebraError {}

public class ZebraActivationLimitError: ZebraError {}

public class ZebraActivationThrottledError: ZebraError {}

public class ZebraActivationRefusedError: ZebraError {}

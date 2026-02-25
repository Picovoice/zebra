//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import Combine
import Foundation
import Zebra

enum UIState {
    case INIT
    case READY
    case TRANSLATING
    case TRANSLATED
    case ERROR
}

class ViewModel: ObservableObject {
    private let ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}" // Obtained from Picovoice Console (https://console.picovoice.ai)
    private let model = ProcessInfo.processInfo.environment["MODEL"] ?? "en_fr"

    private var zebra: Zebra!

    @Published var state = UIState.INIT
    @Published var maxCharacterLimit: Int32 = 0
    @Published var errorMessage = ""
    @Published var translation = ""

    init() {
        initialize()
    }

    public func initialize() {
        state = UIState.INIT
        do {
            try zebra = Zebra(accessKey: ACCESS_KEY, modelPath: "zebra_params_\(model).pv")
            maxCharacterLimit = zebra.maxCharacterLimit!
            state = UIState.READY
            return
        } catch is ZebraActivationError {
            errorMessage = "ACCESS_KEY activation error"
        } catch is ZebraActivationRefusedError {
            errorMessage = "ACCESS_KEY activation refused"
        } catch is ZebraActivationLimitError {
            errorMessage = "ACCESS_KEY reached its limit"
        } catch is ZebraActivationThrottledError {
            errorMessage = "ACCESS_KEY is throttled"
        } catch {
            errorMessage = "\(error.localizedDescription)"
        }

        state = UIState.ERROR
    }

    public func destroy() {
        zebra.delete()
    }
    
    public func translate(text: String) {
        self.state = UIState.TRANSLATING
        DispatchQueue.global().async { [self] in
            do {
                let translation = try self.zebra.translate(text: text)
                DispatchQueue.main.async {
                    self.translation = translation
                    self.state = UIState.TRANSLATED
                }
            } catch {
                DispatchQueue.main.async {
                    self.errorMessage = "\(error.localizedDescription)"
                    self.state = UIState.TRANSLATED
                }
            }
        }
    }
}

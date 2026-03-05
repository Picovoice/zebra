//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import Foundation

import PvZebra

private func swapQuotes(_ text: String) -> String {
    var output = text
    output = output.replacingOccurrences(of: "’", with: "'")
    output = output.replacingOccurrences(of: "‘", with: "'")
    output = output.replacingOccurrences(of: "“", with: "\"")
    output = output.replacingOccurrences(of: "”", with: "\"")
    return output
}

/// iOS (Swift) binding for Zebra Translation engine. Provides a Swift interface to the Zebra library.
public class Zebra {

    private var handle: OpaquePointer?

    /// Maximum number of characters allowed in a single translation request.
    private var _maxCharacterLimit: Int32?
    /// Zebra version string
    public static let version = String(cString: pv_zebra_version())

    private static var sdk = "ios"

    public static func setSdk(sdk: String) {
        self.sdk = sdk
    }

    /// Lists all available devices that Zebra can use for inference.
    /// Entries in the list can be used as the `device` argument when initializing Zebra.
    ///
    /// - Throws: ZebraError
    /// - Returns: Array of available devices that Zebra can be used for inference.
    public static func getAvailableDevices() throws -> [String] {
        var cHardwareDevices: UnsafeMutablePointer<UnsafeMutablePointer<Int8>?>?
        var numHardwareDevices: Int32 = 0
        let status = pv_zebra_list_hardware_devices(&cHardwareDevices, &numHardwareDevices)
        if status != PV_STATUS_SUCCESS {
            let messageStack = try Zebra.getMessageStack()
            throw Zebra.pvStatusToZebraError(status, "Zebra getAvailableDevices failed", messageStack)
        }

        var hardwareDevices: [String] = []
        for i in 0..<numHardwareDevices {
            hardwareDevices.append(String(cString: cHardwareDevices!.advanced(by: Int(i)).pointee!))
        }

        pv_zebra_free_hardware_devices(cHardwareDevices, numHardwareDevices)

        return hardwareDevices
    }

    /// Maximum number of characters allowed per call to `translate()`.
    public var maxCharacterLimit: Int32? {
        return self._maxCharacterLimit
    }

    /// Constructor.
    ///
    /// - Parameters:
    ///   - accessKey: AccessKey obtained from the Picovoice Console (https://console.picovoice.ai/)
    ///   - modelPath: Absolute path to the file containing model parameters (`.pv`).
    ///     Sets the source and target translation languages.
    ///   - device: String representation of the device (e.g., CPU or GPU) to use. If set to `best`, the most
    ///     suitable device is selected automatically. If set to `gpu`, the engine uses the first available GPU
    ///     device. To select a specific GPU device, set this argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}`
    ///     is the index of the target GPU. If set to `cpu`, the engine will run on the CPU with the default
    ///     number of threads. To specify the number of threads, set this argument to `cpu:${NUM_THREADS}`,
    ///     where `${NUM_THREADS}` is the desired number of threads.
    /// - Throws: ZebraError
    public init(
        accessKey: String,
        modelPath: String,
        device: String? = nil) throws {

        var modelPathArg = modelPath
        if !FileManager().fileExists(atPath: modelPathArg) {
            modelPathArg = try getResourcePath(modelPathArg)
        }

        var deviceArg = device
        if device == nil {
            deviceArg = "best"
        }

        pv_set_sdk(Zebra.sdk)

        let initStatus = pv_zebra_init(
                accessKey,
                modelPathArg,
                deviceArg,
                &handle)
        if initStatus != PV_STATUS_SUCCESS {
            let messageStack = try Zebra.getMessageStack()
            throw Zebra.pvStatusToZebraError(initStatus, "Zebra init failed", messageStack)
        }

        var cMaxCharacterLimit: Int32 = 0
        let maxCharacterLimitStatus = pv_zebra_max_character_limit(handle, &cMaxCharacterLimit)
        if maxCharacterLimitStatus != PV_STATUS_SUCCESS {
            let messageStack = try Zebra.getMessageStack()
            throw Zebra.pvStatusToZebraError(
                    maxCharacterLimitStatus,
                    "Zebra failed to get max character limit",
                    messageStack)
        }
        self._maxCharacterLimit = cMaxCharacterLimit
    }

    /// Constructor.
    ///
    /// - Parameters:
    ///   - accessKey: The AccessKey obtained from Picovoice Console (https://console.picovoice.ai).
    ///   - modelURL: URL to file containing model parameters (`.pv`). Sets the source and target translation languages.
    ///   - device: String representation of the device (e.g., CPU or GPU) to use. If set to `best`, the most
    ///     suitable device is selected automatically. If set to `gpu`, the engine uses the first available GPU
    ///     device. To select a specific GPU device, set this argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}`
    ///     is the index of the target GPU. If set to `cpu`, the engine will run on the CPU with the default
    ///     number of threads. To specify the number of threads, set this argument to `cpu:${NUM_THREADS}`,
    ///     where `${NUM_THREADS}` is the desired number of threads.
    /// - Throws: ZebraError
    public convenience init(
            accessKey: String,
            modelURL: URL,
            device: String? = nil) throws {

        try self.init(
                accessKey: accessKey,
                modelPath: modelURL.path,
                device: device)
    }

    deinit {
        self.delete()
    }

    /// Releases native resources that were allocated to Zebra
    public func delete() {
        if handle != nil {
            pv_zebra_delete(handle)
            handle = nil
            _maxCharacterLimit = 0
        }
    }

    /// Translates text. The maximum number of characters that can be translated at once 
    //  is given by `.maxCharacterLimit`.
    ///
    /// - Parameters:
    ///   - text: Text to translate.
    /// - Returns: Translated text.
    /// - Throws: ZebraError
    public func translate(text: String) throws -> String {
        if handle == nil {
            throw ZebraInvalidStateError("Unable to translate - resources have been released")
        }

        if text.isEmpty {
            throw ZebraInvalidArgumentError(
                "Text cannot be empty")
        }

        if text.count > self._maxCharacterLimit! {
            throw ZebraInvalidArgumentError(
                "Text length (\(text.count)) must be smaller than \(self._maxCharacterLimit!)")
        }

        let formattedText = swapQuotes(text)
        var cTranslation: UnsafeMutablePointer<Int8>?

        let status = pv_zebra_translate(
            handle,
            formattedText,
            &cTranslation)
        if status != PV_STATUS_SUCCESS {
            let messageStack = try Zebra.getMessageStack()
            throw Zebra.pvStatusToZebraError(status, "Unable to translate", messageStack)
        }

        let translation = String(cString: cTranslation!)
        pv_zebra_translation_delete(handle, cTranslation)

        return translation
    }

    /// Given a path, return the full path to the resource.
    ///
    /// - Parameters:
    ///   - filePath: relative path of a file in the bundle.
    /// - Throws: ZebraIOError
    /// - Returns: The full path of the resource.
    private func getResourcePath(_ filePath: String) throws -> String {
        if let resourcePath = Bundle(for: type(of: self)).resourceURL?.appendingPathComponent(filePath).path {
            if FileManager.default.fileExists(atPath: resourcePath) {
                return resourcePath
            }
        }

        throw ZebraIOError("Could not find file at path '\(filePath)'. " +
            "If this is a packaged asset, ensure you have added it to your xcode project.")
    }

    private static func pvStatusToZebraError(
        _ status: pv_status_t,
        _ message: String,
        _ messageStack: [String] = []) -> ZebraError {
        switch status {
        case PV_STATUS_OUT_OF_MEMORY:
            return ZebraMemoryError(message, messageStack)
        case PV_STATUS_IO_ERROR:
            return ZebraIOError(message, messageStack)
        case PV_STATUS_INVALID_ARGUMENT:
            return ZebraInvalidArgumentError(message, messageStack)
        case PV_STATUS_STOP_ITERATION:
            return ZebraStopIterationError(message, messageStack)
        case PV_STATUS_KEY_ERROR:
            return ZebraKeyError(message, messageStack)
        case PV_STATUS_INVALID_STATE:
            return ZebraInvalidStateError(message, messageStack)
        case PV_STATUS_RUNTIME_ERROR:
            return ZebraRuntimeError(message, messageStack)
        case PV_STATUS_ACTIVATION_ERROR:
            return ZebraActivationError(message, messageStack)
        case PV_STATUS_ACTIVATION_LIMIT_REACHED:
            return ZebraActivationLimitError(message, messageStack)
        case PV_STATUS_ACTIVATION_THROTTLED:
            return ZebraActivationThrottledError(message, messageStack)
        case PV_STATUS_ACTIVATION_REFUSED:
            return ZebraActivationRefusedError(message, messageStack)
        default:
            let pvStatusString = String(cString: pv_status_to_string(status))
                return ZebraError("\(pvStatusString): \(message)", messageStack)
        }
    }

    private static func getMessageStack() throws -> [String] {
        var messageStackRef: UnsafeMutablePointer<UnsafeMutablePointer<Int8>?>?
        var messageStackDepth: Int32 = 0
        let status = pv_get_error_stack(&messageStackRef, &messageStackDepth)
        if status != PV_STATUS_SUCCESS {
            throw Zebra.pvStatusToZebraError(status, "Unable to get Zebra error state")
        }

        var messageStack: [String] = []
        for i in 0..<messageStackDepth {
            messageStack.append(String(cString: messageStackRef!.advanced(by: Int(i)).pointee!))
        }

        pv_free_error_stack(messageStackRef)

        return messageStack
    }
}

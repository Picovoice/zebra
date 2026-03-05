//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import XCTest
import Zebra

class ZebraAppTestUITests: BaseTest {

    override func setUpWithError() throws {
        continueAfterFailure = true
    }

    func runTestTranslate(zebra: Zebra, text: String, translation: String) throws {
        let res = try zebra.translate(text: text)
        XCTAssertGreaterThan(res.count, 0)
        XCTAssertEqual(res, translation)
    }

    func testTranslate() throws {
        for testCase in self.testData!.tests.translation_tests {
            for (target, translation) in testCase.translations {
                let model = "zebra_params_\(testCase.source)_\(target).pv"
                let zebra = try Zebra.init(
                        accessKey: self.accessKey,
                        modelPath: self.getModelPath(model: model),
                        device: device)
                try runTestTranslate(zebra: zebra, text: testCase.text, translation: translation)
                zebra.delete()
            }
        }
    }

    func runTestMaxCharacterLimit(zebra: Zebra) {
        XCTAssertGreaterThan(zebra.maxCharacterLimit!, 0)
    }

    func testMaxCharacterLimit() throws {
        for testCase in self.testData!.tests.translation_tests {
            for (target, _) in testCase.translations {
                let model = "zebra_params_\(testCase.source)_\(target).pv"
                let zebra = try Zebra.init(
                        accessKey: self.accessKey,
                        modelPath: self.getModelPath(model: model),
                        device: device)
                runTestMaxCharacterLimit(zebra: zebra)
                zebra.delete()
            }
        }
    }

    func testTranslateQuotes() throws {
        let textQuotes = "iOS uses different quotation marks for ‘single’ and “double” quotes."
        let model = "zebra_params_en_fr.pv"
        let zebra = try Zebra.init(
                accessKey: self.accessKey,
                modelPath: self.getModelPath(model: model),
                device: device)
        let translation = try zebra.translate(text: textQuotes)
        XCTAssertGreaterThan(translation.count, 0)
        zebra.delete()
    }

    func testVersion() throws {
        XCTAssertGreaterThan(Zebra.version.count, 0)
    }

    func testGetAvailableDevices() throws {
        let devices = try Zebra.getAvailableDevices()
        XCTAssert(!devices.isEmpty)
        for device in devices {
            XCTAssert(!device.isEmpty)
        }
    }

    func testMessageStack() throws {
        let bundle = Bundle(for: type(of: self))
        let modelPath: String = bundle.path(
                forResource: "zebra_params_en_fr",
                ofType: "pv",
                inDirectory: "test_resources/model_files")!

        var first_error: String = ""
        do {
            let zebra: Zebra = try Zebra(accessKey: "invalid", modelPath: modelPath, device: device)
            XCTAssertNil(zebra)
        } catch {
            first_error = "\(error.localizedDescription)"
            XCTAssert(first_error.count < 1024)
        }

        do {
            let zebra: Zebra = try Zebra(accessKey: "invalid", modelPath: modelPath, device: device)
            XCTAssertNil(zebra)
        } catch {
            XCTAssert("\(error.localizedDescription)".count == first_error.count)
        }
    }

    func testTranslateMessageStack() throws {
        let bundle = Bundle(for: type(of: self))
        let modelPath: String = bundle.path(
                forResource: "zebra_params_en_fr",
                ofType: "pv",
                inDirectory: "test_resources/model_files")!

        let zebra: Zebra = try Zebra(accessKey: accessKey, modelPath: modelPath, device: device)
        zebra.delete()

        do {
            let translation = try zebra.translate(text: "Hello my name is")
            XCTAssertNil(translation)
        } catch {
            XCTAssert("\(error.localizedDescription)".count > 0)
        }
    }
}

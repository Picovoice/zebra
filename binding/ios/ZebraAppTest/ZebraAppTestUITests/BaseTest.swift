//
//  Copyright 2026 Picovoice Inc.
//  You may not use this file except in compliance with the license. A copy of the license is located in the "LICENSE"
//  file accompanying this source.
//  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//  specific language governing permissions and limitations under the License.
//

import AVFoundation
import XCTest

import Zebra

struct TestData: Decodable {
    var tests: TestsData
}

struct TestsData: Decodable {
    var translation_tests: [TranslationTests]
}

struct TranslationTests: Decodable {
    var source: String
    var text: String
    var translations: [String: String]
}

extension String {
    subscript(index: Int) -> Character {
        return self[self.index(self.startIndex, offsetBy: index)]
    }
}

class BaseTest: XCTestCase {

    let accessKey: String = "{TESTING_ACCESS_KEY_HERE}"
    let device: String = "{TESTING_DEVICE_HERE}"

    var testData: TestData?

    override func setUp() async throws {
        try await super.setUp()

        testData = try getTestData()
    }

    func getTestData() throws -> TestData {
        let bundle = Bundle(for: type(of: self))
        let testDataJsonUrl = bundle.url(
            forResource: "test_data",
            withExtension: "json",
            subdirectory: "test_resources")!

        let testDataJsonData = try Data(contentsOf: testDataJsonUrl)
        let testData = try JSONDecoder().decode(TestData.self, from: testDataJsonData)

        return testData
    }

    func getModelPath(model: String) -> String {
        let model_name = model.replacingOccurrences(of: ".pv", with: "")
        return Bundle(for: type(of: self)).path(
                forResource: model_name,
                ofType: "pv",
                inDirectory: "test_resources/model_files")!
    }
}

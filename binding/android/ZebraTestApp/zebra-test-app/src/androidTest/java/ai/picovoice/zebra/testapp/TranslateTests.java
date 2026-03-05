/*
    Copyright 2026 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.zebra.testapp;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertNotEquals;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.assertTrue;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;

import ai.picovoice.zebra.Zebra;
import ai.picovoice.zebra.ZebraException;

@RunWith(Parameterized.class)
public class TranslateTests extends BaseTest {

    @Parameterized.Parameter(value = 0)
    public String source;

    @Parameterized.Parameter(value = 1)
    public String text;

    @Parameterized.Parameter(value = 2)
    public String target;

    @Parameterized.Parameter(value = 3)
    public String translation;

    @Parameterized.Parameters(name = "{0} {2}")
    public static Collection<Object[]> initParameters() throws IOException {
        String testDataJsonString = getTestDataString();

        JsonObject testDataJson = JsonParser.parseString(testDataJsonString).getAsJsonObject();

        final JsonArray testCases = testDataJson.getAsJsonObject("tests").get("translation_tests").getAsJsonArray();

        List<Object[]> parameters = new ArrayList<>();
        for (JsonElement testCaseElem : testCases) {
            JsonObject testCase = testCaseElem.getAsJsonObject();

            String source = testCase.get("source").getAsString();
            String text = testCase.get("text").getAsString();
            Map<String, JsonElement> translations = testCase.get("translations").getAsJsonObject().asMap();

            for (Map.Entry<String, JsonElement> entry : translations.entrySet()) {
                String translation = entry.getValue().getAsString();
                parameters.add(new Object[]{source, text, entry.getKey(), translation});
            }
        }

        return parameters;
    }

    Zebra zebra;

    @Before
    public void Setup() throws Exception {
        String modelFilename = String.format("zebra_params_%s_%s.pv", source, target);
        zebra = new Zebra.Builder()
                .setAccessKey(accessKey)
                .setDevice(device)
                .setModelPath(getModelFilepath(modelFilename))
                .build(appContext);
    }

    @After
    public void TearDown() {
        if (zebra != null) {
            zebra.delete();
        }
    }

    @Test
    public void testTranslate() throws ZebraException {
        String res = zebra.translate(text);
        assertEquals(translation, res);
    }
}

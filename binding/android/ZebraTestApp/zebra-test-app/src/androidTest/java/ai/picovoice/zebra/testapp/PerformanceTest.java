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

import static org.junit.Assert.assertTrue;

import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import org.junit.Assume;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.junit.runners.Parameterized;

import ai.picovoice.zebra.Zebra;

@RunWith(Parameterized.class)
public class PerformanceTest extends BaseTest {
    final String modelFile = "zebra_params_en_fr.pv";
    final String testString = "I've seen things you people would not believe.";

    int numTestIterations = 30;

    @Before
    public void Setup() {
        String iterationString = appContext.getString(R.string.numTestIterations);

        try {
            numTestIterations = Integer.parseInt(iterationString);
        } catch (NumberFormatException ignored) {
        }
    }

    @Test
    public void testProcPerformance() throws Exception {
        final String procThresholdString = appContext.getString(R.string.procPerformanceThresholdSec);
        Assume.assumeNotNull(procThresholdString);
        Assume.assumeFalse(procThresholdString.equals(""));

        final double procPerformanceThresholdSec = Double.parseDouble(procThresholdString);
        final Zebra zebra = new Zebra.Builder()
                .setAccessKey(accessKey)
                .setDevice(device)
                .setModelPath(getModelFilepath(modelFile))
                .build(appContext);

        long totalNSec = 0;
        for (int i = 0; i < numTestIterations + 1; i++) {
            long before = System.nanoTime();
            zebra.translate(testString);
            long after = System.nanoTime();

            // throw away first run to account for cold start
            if (i > 0) {
                totalNSec += (after - before);
            }
        }
        zebra.delete();

        double avgNSec = totalNSec / (double) numTestIterations;
        double avgSec = ((double) Math.round(avgNSec * 1e-6)) / 1000.0;
        assertTrue(
                String.format(
                        "Expected threshold (%.3fs), translate took (%.3fs)",
                        procPerformanceThresholdSec,
                        avgSec),
                avgSec <= procPerformanceThresholdSec
        );
    }
}

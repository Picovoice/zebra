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

import androidx.test.ext.junit.runners.AndroidJUnit4;

import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;

import ai.picovoice.zebra.Zebra;
import ai.picovoice.zebra.ZebraException;

@RunWith(AndroidJUnit4.class)
public class StandardTests extends BaseTest {

    String modelFile;
    Zebra zebra;

    @Before
    public void Setup() throws Exception {
        String modelFilename = "zebra_params_en_fr.pv";
        modelFile = getModelFilepath(modelFilename);
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
    public void testVersion() {
        final String version = zebra.getVersion();
        assertNotNull(version);
        assertNotEquals("", version);
    }

    @Test
    public void testMaxCharacterLimit() {
        assertTrue(zebra.getMaxCharacterLimit() > 0);
    }

    @Test
    public void testGetAvailableDevices() throws ZebraException {
        String[] availableDevices = Zebra.getAvailableDevices();
        assertTrue(availableDevices.length > 0);
        for (String d : availableDevices) {
            assertTrue(d != null && !d.isEmpty());
        }
    }

    @Test
    public void testErrorStack() {
        String[] error = {};
        try {
            new Zebra.Builder()
                    .setAccessKey("invalid")
                    .setDevice(device)
                    .setModelPath(modelFile)
                    .build(appContext);
        } catch (ZebraException e) {
            error = e.getMessageStack();
        }

        assertTrue(0 < error.length);
        assertTrue(error.length <= 8);

        try {
            new Zebra.Builder()
                    .setAccessKey("invalid")
                    .setDevice(device)
                    .setModelPath(modelFile)
                    .build(appContext);
        } catch (ZebraException e) {
            for (int i = 0; i < error.length; i++) {
                assertEquals(e.getMessageStack()[i], error[i]);
            }
        }
    }
}

/*
    Copyright 2026 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.zebra;

import android.content.Context;

import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Android binding for Zebra Translate.
 */
public class Zebra {

    private static String _sdk = "android";

    static {
        System.loadLibrary("pv_zebra");
    }

    private long handle;

    private int maxCharacterLimit;

    /**
     * Constructor.
     *
     * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
     * @param modelPath Absolute path to the file containing model parameters (`.pv`).
     *                  Sets the source and target translation languages.
     * @param device    String representation of the device (e.g., CPU or GPU) to use for inference.
     *                  If set to `best`, the most suitable device is selected automatically. If set to `gpu`,
     *                  the engine uses the first available GPU device. To select a specific GPU device, set this
     *                  argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}` is the index of the target GPU. If
     *                  set to `cpu`, the engine will run on the CPU with the default number of threads. To specify
     *                  the number of threads, set this argument to `cpu:${NUM_THREADS}`, where `${NUM_THREADS}`
     *                  is the desired number of threads.
     * @throws ZebraException if there is an error while initializing Zebra.
     */
    private Zebra(String accessKey, String modelPath, String device) throws ZebraException {
        ZebraNative.setSdk(Zebra._sdk);
        handle = ZebraNative.init(
                accessKey,
                modelPath,
                device);
        maxCharacterLimit = ZebraNative.getMaxCharacterLimit(handle);
    }

    public static void setSdk(String sdk) {
        Zebra._sdk = sdk;
    }

    /**
     * Lists all available devices that Zebra can use for inference.
     * Each entry in the list can be used as the `device` argument when initializing Zebra.
     *
     * @return Array of all available devices that Zebra can be used for inference.
     * @throws ZebraException if getting available devices fails.
     */
    public static String[] getAvailableDevices() throws ZebraException {
        return ZebraNative.listHardwareDevices();
    }

    private static String extractResource(Context context, InputStream srcFileStream, String dstFilename) throws IOException {
        InputStream is = new BufferedInputStream(
                srcFileStream,
                256);
        OutputStream os = new BufferedOutputStream(
                context.openFileOutput(dstFilename, Context.MODE_PRIVATE),
                256);
        int r;
        while ((r = is.read()) != -1) {
            os.write(r);
        }
        os.flush();

        is.close();
        os.close();
        return new File(
                context.getFilesDir(),
                dstFilename).getAbsolutePath();
    }

    /**
     * Releases resources acquired by Zebra.
     */
    public void delete() {
        if (handle != 0) {
            ZebraNative.delete(handle);
            handle = 0;
        }
    }

    /**
     * Translates text. The maximum number of characters that can be translated at once
     * is given by `.maxCharacterLimit`.
     *
     * @param text Text to translate.
     * @return Translated text.
     * @throws ZebraException if there is an error while translating text.
     */
    public String translate(String text) throws ZebraException {
        if (handle == 0) {
            throw new ZebraInvalidStateException(
                    "Attempted to call Zebra translate after delete."
            );
        }

        if (text == null) {
            throw new ZebraInvalidArgumentException("Passed null text to Zebra translate.");
        }

        if (text.isEmpty()) {
            throw new ZebraInvalidArgumentException("Zebra translate requires a non empty text.");
        }

        if (text.length() > maxCharacterLimit) {
            throw new ZebraInvalidArgumentException(
                    String.format("Zebra requires text length smaller than %d, "
                            + "received %d.", maxCharacterLimit, text.length()));
        }

        return ZebraNative.translate(
                handle,
                text);
    }

    /**
     * Getter for version.
     *
     * @return Version.
     */
    public String getVersion() {
        return ZebraNative.getVersion();
    }

    /**
     * Getter for the maximum number of characters that can be translated at once.
     *
     * @return The maximum number of characters that can be translated at once.
     */
    public int getMaxCharacterLimit() {
        return maxCharacterLimit;
    }

    /**
     * Builder for creating instance of Zebra.
     */
    public static class Builder {

        private String accessKey = null;
        private String modelPath = null;
        private String device = null;

        /**
         * Sets the AccessKey.
         *
         * @param accessKey AccessKey obtained from Picovoice Console (https://console.picovoice.ai/)
         * @return Modified builder object.
         */
        public Builder setAccessKey(String accessKey) {
            this.accessKey = accessKey;
            return this;
        }

        /**
         * Sets the path to the model file (`.pv`). Sets the source and target translation languages.
         *
         * @param modelPath Absolute path to the file (`.pv`) containing Zebra model parameters.
         * @return Modified builder object.
         */
        public Builder setModelPath(String modelPath) {
            this.modelPath = modelPath;
            return this;
        }

        /**
         * Sets the device to use for inference.
         *
         * @param device String representation of the device (e.g., CPU or GPU) to use for inference.
         *               If set to `best`, the most suitable device is selected automatically. If set to `gpu`,
         *               the engine uses the first available GPU device. To select a specific GPU device, set this
         *               argument to `gpu:${GPU_INDEX}`, where `${GPU_INDEX}` is the index of the target GPU. If
         *               set to `cpu`, the engine will run on the CPU with the default number of threads. To specify
         *               the number of threads, set this argument to `cpu:${NUM_THREADS}`, where `${NUM_THREADS}`
         *               is the desired number of threads.
         * @return Modified builder object.
         */
        public Builder setDevice(String device) {
            this.device = device;
            return this;
        }

        /**
         * Validates properties and creates an instance of the Zebra Translate engine.
         *
         * @return An instance Zebra Translate engine.
         * @throws ZebraException if there is an error while initializing Zebra.
         */
        public Zebra build(Context context) throws ZebraException {
            if (accessKey == null || this.accessKey.equals("")) {
                throw new ZebraInvalidArgumentException("No AccessKey was provided to Zebra");
            }

            if (modelPath == null) {
                throw new ZebraInvalidArgumentException("ModelPath must not be null");
            } else {
                File modelFile = new File(modelPath);
                String modelFilename = modelFile.getName();
                if (!modelFile.exists() && !modelFilename.equals("")) {
                    try {
                        modelPath = extractResource(
                                context,
                                context.getAssets().open(modelPath),
                                modelFilename);
                    } catch (IOException ex) {
                        throw new ZebraIOException(ex);
                    }
                }
            }

            if (device == null) {
                device = "best";
            }

            return new Zebra(
                    accessKey,
                    modelPath,
                    device);
        }
    }

}

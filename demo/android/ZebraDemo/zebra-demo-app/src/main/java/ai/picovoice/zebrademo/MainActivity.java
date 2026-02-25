/*
    Copyright 2026 Picovoice Inc.

    You may not use this file except in compliance with the license. A copy of the license is
    located in the "LICENSE" file accompanying this source.

    Unless required by applicable law or agreed to in writing, software distributed under the
    License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either
    express or implied. See the License for the specific language governing permissions and
    limitations under the License.
*/

package ai.picovoice.zebrademo;

import android.annotation.SuppressLint;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.text.method.ScrollingMovementMethod;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import ai.picovoice.zebra.Zebra;
import ai.picovoice.zebra.ZebraActivationException;
import ai.picovoice.zebra.ZebraActivationLimitException;
import ai.picovoice.zebra.ZebraActivationRefusedException;
import ai.picovoice.zebra.ZebraActivationThrottledException;
import ai.picovoice.zebra.ZebraException;
import ai.picovoice.zebra.ZebraInvalidArgumentException;


public class MainActivity extends AppCompatActivity {
    private static final String ACCESS_KEY = "${YOUR_ACCESS_KEY_HERE}";

    private static final String source = BuildConfig.FLAVOR.substring(0, 2);
    private static final String target = BuildConfig.FLAVOR.substring(2);

    private Zebra zebra;

    TextView errorTextView;
    TextView infoTextView;
    EditText textView;
    TextView numCharsTextView;
    TextView translateView;
    Button clearButton;
    Button translateButton;

    @SuppressLint("DefaultLocale")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.zebra_demo);

        errorTextView = findViewById(R.id.errorTextView);
        infoTextView = findViewById(R.id.infoTextView);
        textView = findViewById(R.id.textView);
        numCharsTextView = findViewById(R.id.numCharsTextView);
        translateView = findViewById(R.id.translateView);
        clearButton = findViewById(R.id.clearButton);
        translateButton = findViewById(R.id.translateButton);

        translateView.setMovementMethod(new ScrollingMovementMethod());
        errorTextView.setMovementMethod(new ScrollingMovementMethod());
        try {
            String modelName = "zebra_params_" + source + "_" + target + ".pv";

            zebra = new Zebra.Builder()
                    .setAccessKey(ACCESS_KEY)
                    .setModelPath("models/" + modelName)
                    .build(getApplicationContext());
            numCharsTextView.setText(String.format("0/%d", zebra.getMaxCharacterLimit()));
        } catch (ZebraException e) {
            onZebraException(e);
        }

        textView.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void afterTextChanged(Editable s) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String text = s.toString();
                runOnUiThread(() -> {
                    numCharsTextView.setText(String.format(
                            "%d/%d",
                            text.length(),
                            zebra.getMaxCharacterLimit()));
                    clearButton.setEnabled(!text.isEmpty());
                    translateButton.setEnabled(!text.isEmpty());
                });
            }
        });
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        zebra.delete();
    }

    @SuppressLint("SetTextI18n")
    private void setUIState(UIState state) {
        runOnUiThread(() -> {
            switch (state) {
                case TRANSLATING:
                    errorTextView.setVisibility(View.INVISIBLE);
                    textView.setEnabled(false);
                    clearButton.setEnabled(false);
                    translateButton.setEnabled(false);
                    break;
                case RESULTS:
                    textView.setEnabled(true);
                    clearButton.setEnabled(true);
                    translateButton.setEnabled(true);
                    break;
                case ERROR:
                    errorTextView.setVisibility(View.VISIBLE);
                    infoTextView.setVisibility(View.INVISIBLE);
                    textView.setEnabled(true);
                    clearButton.setEnabled(true);
                    translateButton.setEnabled(true);
                    break;
                case FATAL_ERROR:
                    errorTextView.setVisibility(View.VISIBLE);
                    infoTextView.setVisibility(View.INVISIBLE);
                    textView.setEnabled(false);
                    clearButton.setEnabled(false);
                    translateButton.setEnabled(false);
                    break;
                default:
                    break;
            }
        });
    }

    private void onZebraException(ZebraException e) {
        if (e instanceof ZebraInvalidArgumentException) {
            displayError(e.getMessage());
        } else if (e instanceof ZebraActivationException) {
            displayError("AccessKey activation error");
        } else if (e instanceof ZebraActivationLimitException) {
            displayError("AccessKey reached its device limit");
        } else if (e instanceof ZebraActivationRefusedException) {
            displayError("AccessKey refused");
        } else if (e instanceof ZebraActivationThrottledException) {
            displayError("AccessKey has been throttled");
        } else {
            displayError("Failed to initialize Zebra " + e.getMessage());
        }
    }

    private void displayError(String message) {
        setUIState(UIState.FATAL_ERROR);
        errorTextView.setText(message);
    }

    private void runTranslate(final String text) {
        runOnUiThread(() -> {
            setUIState(UIState.TRANSLATING);
            infoTextView.setText("Translating...");
            errorTextView.setText("");
            translateView.setText("");
        });

        new Thread(() -> {
            try {
                String translation = zebra.translate(text);

                runOnUiThread(() -> {
                    infoTextView.setText("");
                    translateView.setText(translation);
                    setUIState(UIState.RESULTS);
                });
            } catch (ZebraException e) {
                runOnUiThread(() -> {
                    displayError(e.getMessage());
                    setUIState(UIState.ERROR);
                });
            }
        }).start();
    }

    public void onResetClick(View view) {
        textView.setText("");
    }

    public void onTranslateClick(View view) {
        if (zebra == null) {
            displayError("Zebra is not initialized");
            translateButton.setEnabled(false);
            return;
        }

        String text = textView.getText().toString();
        runTranslate(text);
    }

    private enum UIState {
        TRANSLATING,
        RESULTS,
        ERROR,
        FATAL_ERROR,
    }
}

let zebra = null;

window.onload = function () {
  const textarea = document.getElementById('text');
  const translateButton = document.getElementById('translate');
  const result = document.getElementById('result');
  const characters = document.getElementById('characters');

  translateButton.addEventListener('click', async () => {
    const text = textarea.value;

    translateButton.disabled = true;
    result.innerText = await zebra.translate(text);
    translateButton.disabled = false;
  });

  textarea.addEventListener('input', () => {
    if (!zebra) {
      return;
    }

    const text = textarea.value;
    if (text.length > zebra.maxCharacterLimit) {
      textarea.value = text.substring(0, zebra.maxCharacterLimit);
    }
    characters.innerText = textarea.value.length;
  });
};

function writeMessage(message) {
  console.log(message);
  document.getElementById("status").innerHTML = message;
}

async function startZebra(accessKey) {
  writeMessage("Zebra is loading. Please wait...");
  try {
    zebra = await ZebraWeb.ZebraWorker.create(accessKey, zebraModel);
    document.getElementById("control").style.display = "block";
    document.getElementById('characterLimit').innerText = zebra.maxCharacterLimit;
    writeMessage("Zebra worker ready!");
  } catch (err) {
    writeMessage(err);
  }
}

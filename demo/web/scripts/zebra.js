let zebra = null;

window.onload = function () {
  const textarea = document.getElementById('text');
  const translateButton = document.getElementById('translate');
  const result = document.getElementById('result');

  translateButton.addEventListener('click', async () => {
    const text = textarea.value;

    translateButton.disabled = true;
    result.innerText = await zebra.translate(text);
    translateButton.disabled = false;
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
    writeMessage("Zebra worker ready!");
  } catch (err) {
    writeMessage(err);
  }
}

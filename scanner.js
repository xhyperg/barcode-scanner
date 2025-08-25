const codeReader = new ZXing.BrowserMultiFormatReader();
const video = document.getElementById("video");
const resultDiv = document.getElementById("result");
const retryBtn = document.getElementById("retryBtn");

async function startScanner() {
  try {
    retryBtn.style.display = "none"; // hide retry button when starting

    // Request camera access explicitly
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop()); // close temp stream

    const devices = await ZXing.BrowserMultiFormatReader.listVideoInputDevices();
    if (!devices.length) {
      resultDiv.textContent = "No camera found";
      return;
    }
    const backCam = devices.find(d => /back|rear/i.test(d.label));
    const deviceId = backCam ? backCam.deviceId : devices[0].deviceId;

    await codeReader.decodeFromVideoDevice(deviceId, video, (result, err) => {
      if (result) {
        resultDiv.textContent = `Scanned Code: ${result.text}`;
        codeReader.reset();
        if (navigator.vibrate) navigator.vibrate(200);

        setTimeout(() => {
          if (confirm(`Scanned: ${result.text}\nDo you want to scan more?`)) {
            resultDiv.textContent = "";
            startScanner();
          }
        }, 500);
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === "NotAllowedError") {
      alert("Camera access was denied. Please enable camera permissions in your browser settings.");
      retryBtn.style.display = "block"; // show retry button
    }
    resultDiv.textContent = "Camera access error: " + error.message;
  }
}

retryBtn.addEventListener("click", startScanner);
window.addEventListener("load", startScanner);

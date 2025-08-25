const codeReader = new ZXing.BrowserMultiFormatReader();
const video = document.getElementById('video');
const resultDiv = document.getElementById('result');

async function startScanner() {
  try {
    // Request camera permission
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    stream.getTracks().forEach(t => t.stop());

    // Get video input devices using standard MediaDevices API
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(device => device.kind === 'videoinput');
    if (!videoDevices.length) {
      resultDiv.textContent = 'No camera found';
      return;
    }

    // Prefer back camera if available
    const backCam = videoDevices.find(d => /back|rear/i.test(d.label));
    const deviceId = backCam ? backCam.deviceId : videoDevices[0].deviceId;

    // Start scanning
    await codeReader.decodeFromVideoDevice(deviceId, video, (result, err) => {
      if (result) {
        resultDiv.textContent = `Scanned Code: ${result.text}`;
        codeReader.reset();
        if (navigator.vibrate) navigator.vibrate(200);
        setTimeout(() => {
          if (confirm(`Scanned: ${result.text}\nDo you want to scan more?`)) {
            resultDiv.textContent = '';
            startScanner();
          }
        }, 500);
      }
    });
  } catch (error) {
    console.error(error);
    if (error.name === 'NotAllowedError') {
      alert('Camera access denied. Please enable camera permissions in browser settings.');
    }
    resultDiv.textContent = 'Camera access error: ' + error.message;
  }
}

window.addEventListener('load', startScanner);

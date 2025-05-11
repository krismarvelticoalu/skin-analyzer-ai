// Open the camera
function openCamera() {
  const video = document.getElementById("cameraView");
  const captureBtn = document.getElementById("captureButton");
  const analyzeBtn = document.getElementById("analyzeButton");
  const previewImage = document.getElementById("previewImage");

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      video.classList.remove("hidden");
      captureBtn.classList.remove("hidden");
      analyzeBtn.classList.add("hidden");
      previewImage.classList.add("hidden");
    })
    .catch(error => {
      alert("Camera access denied or not available.");
      console.error(error);
    });
}

// Capture photo from video stream
function capturePhoto() {
  const video = document.getElementById("cameraView");
  const canvas = document.getElementById("canvas");
  const previewImage = document.getElementById("previewImage");
  const analyzeBtn = document.getElementById("analyzeButton");

  const context = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const dataURL = canvas.toDataURL("image/jpeg");
  previewImage.src = dataURL;

  // Show preview image and analyze button
  previewImage.classList.remove("hidden");
  analyzeBtn.classList.remove("hidden");

  // Stop the video stream
  const stream = video.srcObject;
  const tracks = stream.getTracks();
  tracks.forEach(track => track.stop());

  video.srcObject = null;
  video.classList.add("hidden");
  document.getElementById("captureButton").classList.add("hidden");
}

// Preview uploaded image
function previewImage(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      const preview = document.getElementById("previewImage");
      preview.src = e.target.result;
      preview.classList.remove("hidden");
      document.getElementById("analyzeButton").classList.remove("hidden");
    };
    reader.readAsDataURL(file);
  }
}

// Analyze skin using the preview image
function analyzeSkin() {
  const previewImage = document.getElementById("previewImage");
  const dataURL = previewImage.src;

  if (!dataURL || dataURL === window.location.href) {
    alert("No image available for analysis.");
    return;
  }

  document.getElementById("loadingOverlay").classList.remove("hidden");

  fetch(dataURL)
    .then(res => res.blob())
    .then(blob => {
      const formData = new FormData();
      formData.append("image", blob, "captured.jpg");

      return fetch("/analyze", {
        method: "POST",
        body: formData
      });
    })
    .then(response => response.json())
    .then(data => {
      document.getElementById("loadingOverlay").classList.add("hidden");

      if (data.error) {
        alert(data.error);
        return;
      }

      document.getElementById("skinTypeText").innerText = data.skin_type;
      const list = document.getElementById("recommendationList");
      list.innerHTML = "";

      data.recommendations.forEach(item => {
        const li = document.createElement("li");
        li.innerText = item;
        list.appendChild(li);
      });

      document.getElementById("resultSection").classList.remove("hidden");
    })
    .catch(err => {
      document.getElementById("loadingOverlay").classList.add("hidden");
      alert("Error analyzing skin.");
      console.error(err);
    });
}

// Close the result section
function closeResult() {
  document.getElementById("resultSection").classList.add("hidden");
}
let videoStream = null;

function previewImage(event) {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const previewImage = document.getElementById('previewImage');
    previewImage.src = e.target.result;
    previewImage.classList.remove('hidden');

    document.getElementById('cameraView').classList.add('hidden');
    document.getElementById('captureButton').classList.add('hidden');
    document.getElementById('analyzeButton').classList.remove('hidden');
  };

  if (file) {
    reader.readAsDataURL(file);
  }
}

function openCamera() {
  const video = document.getElementById('cameraView');
  const previewImage = document.getElementById('previewImage');
  const captureButton = document.getElementById('captureButton');
  const analyzeButton = document.getElementById('analyzeButton');

  previewImage.classList.add('hidden');
  analyzeButton.classList.add('hidden');

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      videoStream = stream;
      video.srcObject = stream;
      video.classList.remove('hidden');
      captureButton.classList.remove('hidden');
    })
    .catch(err => {
      alert('Could not access camera. Error: ' + err.message);
    });
}

function capturePhoto() {
  const video = document.getElementById('cameraView');
  const canvas = document.getElementById('canvas');
  const previewImage = document.getElementById('previewImage');
  const captureButton = document.getElementById('captureButton');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const context = canvas.getContext('2d');
  context.drawImage(video, 0, 0, canvas.width, canvas.height);

  const imageDataUrl = canvas.toDataURL('image/png');
  previewImage.src = imageDataUrl;
  previewImage.classList.remove('hidden');

  video.classList.add('hidden');
  captureButton.classList.add('hidden');
  document.getElementById('analyzeButton').classList.remove('hidden');

  if (videoStream) {
    videoStream.getTracks().forEach(track => track.stop());
    video.srcObject = null;
  }
}

function analyzeSkin() {
  // Show loading overlay
  document.getElementById("loadingOverlay").classList.remove("hidden");

  // Simulate delay
  setTimeout(() => {
    document.getElementById("loadingOverlay").classList.add("hidden");
    showResult();
  }, 2000);
}

function showResult() {
  const skinTypes = ["Dry", "Normal", "Oily"];
  const skinType = skinTypes[Math.floor(Math.random() * skinTypes.length)];

  const recommendations = {
    Dry: [
      "Use a hydrating cleanser with **hyaluronic acid** and **glycerin** to retain moisture. Look for products that don’t strip natural oils from your skin.",
      "Apply a rich moisturizer with **ceramides** to restore and protect the skin's barrier, preventing water loss and keeping skin hydrated.",
      "Use a **humidifier** at night to add moisture to the air and prevent your skin from becoming dry, especially in winter.",
      "Avoid harsh scrubs and opt for enzyme-based exfoliators or **AHA (Alpha Hydroxy Acid)** products that are gentle on dry skin."
    ],
    Normal: [
      "Cleanse your face with a gentle **gel or cream cleanser** that helps to maintain your skin’s natural moisture balance without over-drying or adding excess oil.",
      "Use a **lightweight moisturizer** containing **hyaluronic acid** or **glycerin** for daily hydration. These ingredients help lock in moisture without making your skin greasy.",
      "Always apply **broad-spectrum sunscreen** (SPF 30 or higher) to protect your skin from harmful UV rays. Consider one that contains **Vitamin C** for additional antioxidant protection.",
      "Incorporate a **peptide-rich night cream** to help boost collagen production, keeping skin elastic and youthful."
    ],
    Oily: [
      "Use a **salicylic acid-based cleanser** to control oil production and prevent acne breakouts. Salicylic acid helps to clean pores and reduce inflammation.",
      "Choose an **oil-free moisturizer** that contains **niacinamide** or **hyaluronic acid** to hydrate without clogging pores or adding excess oil.",
      "Exfoliate **twice a week** with a **BHA (Beta Hydroxy Acid)** exfoliant to prevent pores from becoming clogged, promoting clearer skin.",
      "Once a week, apply a **clay mask** to absorb excess oil and detoxify the skin, leaving your face feeling refreshed and clean."
    ]
  };

  document.getElementById("skinTypeText").innerText = skinType;
  const list = document.getElementById("recommendationList");
  list.innerHTML = "";

  recommendations[skinType].forEach(item => {
    const li = document.createElement("li");
    li.innerHTML = formatRecommendation(item);  // Format the recommendation text
    list.appendChild(li);
  });

  document.getElementById("resultSection").classList.remove("hidden");
}

function formatRecommendation(text) {
  // This function will find and bold the portions of text surrounded by `**`
  return text.replace(/\*\*(.*?)\*\*/g, '<span class="font-bold">$1</span>');
}

function closeResult() {
  document.getElementById("resultSection").classList.add("hidden");
}
    
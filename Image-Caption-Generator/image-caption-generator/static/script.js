

// Drag & Drop Upload
let dropArea = document.getElementById("dropArea");

dropArea.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "#007BFF";
});

dropArea.addEventListener("dragleave", () => {
    dropArea.style.borderColor = "#ccc";
});

dropArea.addEventListener("drop", (event) => {
    event.preventDefault();
    dropArea.style.borderColor = "#ccc";
    let file = event.dataTransfer.files[0];
    handleFileUpload(file);
});

// Update button text when an image is selected
document.getElementById("imageUpload").addEventListener("change", function (event) {
    if (this.files.length > 0) {
        document.querySelector(".upload-btn").innerText = "Image Chosen";
        handleImageUpload(event); // Call function to preview image
    }
});

// Keep track of the uploaded image globally
let uploadedImageUrl = "";

// Handle File Upload (Click + Drag & Drop)
function handleFileUpload(file) {
    if (!file) {
        alert("Please select an image!");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    document.getElementById("loading").style.display = "block";

    fetch("/upload", { 
        method: "POST", 
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("loading").style.display = "none";

        if (data.error) {
            alert(data.error);
        } else {
            displayImage(data.image_url);
            displayCaption(data.caption);
        }
    })
    .catch(error => {
        document.getElementById("loading").style.display = "none";
        console.error("Error:", error);
        alert("Failed to generate caption. Please try again.");
    });
}

// Upload Button Click
function uploadImage() {
    let fileInput = document.getElementById("imageUpload");
    let file = fileInput.files[0];
    handleFileUpload(file);
}

// Display Image on Page
function displayImage(imageUrl) {
    let imgElement = document.getElementById("uploadedImage");
    let imageContainer = document.getElementById("imageContainer");

    uploadedImageUrl = imageUrl; // Store image URL globally

    imgElement.src = imageUrl;
    imgElement.style.display = "block";  // Make sure the image is visible
    imageContainer.style.display = "block"; // Show the image container
}

// Function to restore image when running any function
function restoreImageIfMissing() {
    let imgElement = document.getElementById("uploadedImage");
    if (!imgElement.src || imgElement.src === "") {
        imgElement.src = uploadedImageUrl; // Restore the image URL
        imgElement.style.display = "block";
        document.getElementById("imageContainer").style.display = "block";
    }
}

// Show image preview after upload
function handleImageUpload(event) {
    const file = event.target.files[0];  // Get the first file from the input
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imgElement = document.getElementById('uploadedImage');
            imgElement.src = e.target.result;  // Set the source to the uploaded image
            imgElement.style.display = 'block';  // Show the image
            document.getElementById('imageContainer').style.display = 'block';
            imgElement.style.display = "block";  // Ensure image is visible
  // Display the image container
        };
        reader.readAsDataURL(file);  // Convert the image to a base64 URL
    } else {
        alert("Please upload a valid image file!");
    }
}



// Function to Show Image Even After Captioning
function keepImageVisible() {
    const imagePreviewContainer = document.getElementById("imagePreview");
    const imageElement = imagePreviewContainer.querySelector("img");

    if (imageElement) {
        imageElement.style.display = "block"; // Ensure the image is visible
    }
}


// Display Caption
function displayCaption(text) {
    let captionElement = document.getElementById("caption");
    captionElement.innerText = "Caption: " + text;
    captionElement.style.animation = "fadeIn 1s ease-in-out";

    // Restore image if missing
    let imgElement = document.getElementById("uploadedImage");
    if (!imgElement.src || imgElement.src === "") {
        imgElement.src = uploadedImageUrl; // Restore the image URL
        imgElement.style.display = "block";
        document.getElementById("imageContainer").style.display = "block";
    }
}


// Translate Caption
function translateCaption() {
    let captionText = document.getElementById("caption").innerText.replace("Caption: ", "");
    let language = document.getElementById("languageSelect").value;

    if (!captionText) {
        alert("No caption available to translate!");
        return;
    }

    fetch("/translate", {
        method: "POST",
        body: JSON.stringify({ caption: captionText, language: language }),
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        let translatedCaptionElement = document.getElementById("translatedCaption");
        translatedCaptionElement.innerText = "Translated: " + data.translated_caption;
        translatedCaptionElement.style.animation = "fadeIn 1s ease-in-out";
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Translation failed. Please try again.");
    });
}

// Speak the translated caption
function speakTranslatedCaption() {
    let translatedText = document.getElementById("translatedCaption").innerText.replace("Translated: ", "");

    if (!translatedText) {
        alert("No translated caption available!");
        return;
    }

    let speech = new SpeechSynthesisUtterance();
    speech.text = translatedText;

    // Get the selected language
    let language = document.getElementById("languageSelect").value;

    // Set appropriate language voices
    let voiceMap = {
        "en": "en-US",
        "hi": "hi-IN",
        "ta": "ta-IN", 
        "te": "te-IN",
        "bn": "bn-IN",
        "mr": "mr-IN",
        "gu": "gu-IN",
        "pa": "pa-IN",
        "ml": "ml-IN",
        "kn": "kn-IN",
        "ur": "ur-IN",
        "fr": "fr-FR",
        "es": "es-ES",
        "de": "de-DE",
        "zh": "zh-CN",
        "ja": "ja-JP",
        "ko": "ko-KR",
        "ru": "ru-RU",
        "it": "it-IT",
        "pt": "pt-PT",
        "ar": "ar-SA" 
    };

    speech.lang = voiceMap[language] || "en-US"; // Default to English if language not found

    // Adjust voice settings
    speech.rate = 1;  // Normal speed
    speech.pitch = 1; // Normal pitch

    // Speak the text
    window.speechSynthesis.speak(speech);
}


// Function to Download Translated Caption
function downloadTranslatedCaption() {
    const translatedTextElement = document.getElementById("translatedCaption");

    if (translatedTextElement && translatedTextElement.innerText.trim() !== "") {
        const translatedText = translatedTextElement.innerText;
        const blob = new Blob([translatedText], { type: "text/plain" });
        const link = document.createElement("a");

        link.href = URL.createObjectURL(blob);
        link.download = "translated_caption.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } else {
        alert("No translated caption available to download.");
    }
}

// Function to Share Translated Caption
function shareTranslatedCaption() {
    const translatedTextElement = document.getElementById("translatedCaption");

    if (translatedTextElement && translatedTextElement.innerText.trim() !== "") {
        const translatedText = translatedTextElement.innerText;

        if (navigator.share) {
            navigator.share({
                title: "Translated Caption",
                text: translatedText
            })
            .then(() => console.log("Translated caption shared successfully!"))
            .catch(error => console.error("Error sharing:", error));
        } else {
            alert("Sharing not supported on this browser. You can copy and share manually.");
        }
    } else {
        alert("No translated caption available to share.");
    }
}

// Attach Event Listeners to Buttons
document.getElementById("downloadTranslatedCaption").addEventListener("click", downloadTranslatedCaption);
document.getElementById("shareTranslatedCaption").addEventListener("click", shareTranslatedCaption);

document.querySelectorAll(".animated-button").forEach(button => {
    button.addEventListener("click", () => {
        button.style.transform = "scale(0.9)";
        setTimeout(() => {
            button.style.transform = "scale(1)";
        }, 150);
    });
});
const toggleSwitch = document.getElementById("darkModeToggle");
        const body = document.body;
        const modeText = document.getElementById("modeText");

        // Check user preference in local storage
        if (localStorage.getItem("darkMode") === "enabled") {
            body.classList.add("dark-mode");
            toggleSwitch.checked = true;
            modeText.textContent = "Dark Mode";
        }

        // Toggle Dark Mode
        toggleSwitch.addEventListener("change", () => {
            if (toggleSwitch.checked) {
                body.classList.add("dark-mode");
                modeText.textContent = "Dark Mode";
                localStorage.setItem("darkMode", "enabled");
            } else {
                body.classList.remove("dark-mode");
                modeText.textContent = "Light Mode";
                localStorage.setItem("darkMode", "disabled");
            }
        });
        document.addEventListener("DOMContentLoaded", function() {
            const selectBox = document.getElementById("languageSelect");
        
            selectBox.addEventListener("mouseenter", function() {
                selectBox.classList.add("glowing");
            });
        
            selectBox.addEventListener("mouseleave", function() {
                selectBox.classList.remove("glowing");
            });
        });
        
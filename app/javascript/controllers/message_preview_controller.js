import { Controller } from "@hotwired/stimulus";
import { DirectUpload } from  "@rails/activestorage";

/**
 * This controller is responsible for displaying the message preview(s).
 * @class MessagePreviewController
 */
export default class extends Controller {
  connect() {
    this.audio();
  }
  /**
   * Creates the preview panel displayed above the message input.
   * This panel is used to display the file(s) that is/are being uploaded.
   */
  preview() {
    this.clearPreviews();
    for (let i = 0; i < this.targets.element.files.length; i++) {
      let file = this.targets.element.files[i];
      const reader = new FileReader();
      this.createAndDisplayFilePreviewElements(file, reader);
    }
    this.toggleVisibility();
  }
  /**
   * Toggles the visibility of the preview div.
   */

  toggleVisibility() {
    let preview = document.getElementById("attachment-previews");
    preview.classList.toggle("d-none");
  }
  /**
   * Creates and displays the preview elements for the file.
   * This is used to display the file in the message preview.
   *
   * @param {*} file - The file to be previewed
   * @param {*} reader - The FileReader object
   */
  createAndDisplayFilePreviewElements(file, reader) {
    reader.onload = () => {
      let element = this.constructPreviews(file, reader);
      element.src = reader.result;
      element.setAttribute("href", reader.result);
      element.setAttribute("target", "_blank");
      element.classList.add("attachment-preview");

      document.getElementById("attachment-previews").appendChild(element);
    };
    reader.readAsDataURL(file);
  }
  /**
   * Constructs the preview element for the file.
   * These elements are used to display the file in the message preview.
   * Supported file types are:
   * - Audio: mp3, wav
   * - Video: mp4, quicktime
   * - Image: jpg, png, gif
   * - Default: anything else
   * @param {*} file - The file to be previewed
   * @param {*} reader - The FileReader object
   * @returns {HTMLElement} - The element to be added to the DOM
   */
  constructPreviews(file, reader) {
    let element;
    let cancelFunction = (e) => this.removePreview(e);
    switch (file.type) {
      case "image/jpeg":
      case "image/png":
      case "image/gif":
        element = this.createImageElement(cancelFunction, reader);
        break;
      case "video/mp4":
      case "video/quicktime":
        element = this.createVideoElement(cancelFunction);
        break;
      case "audio/mpeg":
      case "audio/mp3":
      case "audio/wav":
      case "audio/webm":
      case "audio/x-wav":
        element = this.createAudioElement(cancelFunction);
        break;
      default:
        element = this.createDefaultElement(cancelFunction);
    }
    element.dataset.filename = file.name;
    return element;
  }
  /**
   * Create an image preview element. This is used for images that are
   * of type: jpg, png, or gif.
   * @param {*} cancelFunction - The function to be called when the cancel button is clicked
   * @param {*} reader - The FileReader object
   * @returns {HTMLElement} - The element to be added to the DOM
   */
  createImageElement(cancelFunction, reader) {
    let cancelUploadButton, element;
    const image = document.createElement("img");
    image.setAttribute("style", "background-image: url(" + reader.result + ")");
    image.classList.add("preview-image");
    element = document.createElement("div");
    element.classList.add("attachment-image-container", "file-removal");
    element.appendChild(image);
    cancelUploadButton = document.createElement("i");
    cancelUploadButton.classList.add(
      "bi",
      "bi-x-circle-fill",
      "cancel-upload-button"
    );
    cancelUploadButton.onclick = cancelFunction;
    element.appendChild(cancelUploadButton);
    return element;
  }
  /**
   * Creates a preview element for audio files.
   * This is used for audio files that are of type: mp3, or wav.
   * @param {*} cancelFunction - The function to be called when the cancel button is clicked
   * @returns {HTMLElement} - The element to be added to the DOM
   */
  createAudioElement(cancelFunction) {
    let cancelUploadButton, element;
    element = document.createElement("i");
    element.classList.add(
      "bi",
      "bi-file-earmark-music-fill",
      "audio-preview-icon",
      "file-removal"
    );
    cancelUploadButton = document.createElement("i");
    cancelUploadButton.classList.add(
      "bi",
      "bi-x-circle-fill",
      "cancel-upload-button"
    );
    cancelUploadButton.onclick = cancelFunction;
    element.appendChild(cancelUploadButton);
    return element;
  }
  /**
   * Creates a video preview element. This is used for videos that are
   * of type: mp4, or quicktime.
   * @param {*} cancelFunction - The function to be called when the cancel button is clicked
   * @returns {HTMLElement} - The element to be added to the DOM
   */
  createVideoElement(cancelFunction) {
    let cancelUploadButton, element;
    element = document.createElement("i");
    element.classList.add(
      "bi",
      "bi-file-earmark-play-fill",
      "video-preview-icon",
      "file-removal"
    );
    cancelUploadButton = document.createElement("i");
    cancelUploadButton.classList.add(
      "bi",
      "bi-x-circle-fill",
      "cancel-upload-button"
    );
    cancelUploadButton.onclick = cancelFunction;
    element.appendChild(cancelUploadButton);
    return element;
  }
  /**
   * Creates the element for a default file type. This is used for files that
   * are (probably) not images, videos, or audio.
   * @param {*} cancelFunction - The function to be called when the cancel button is clicked
   * @returns {HTMLElement} - The element to be added to the DOM
   */
  createDefaultElement(cancelFunction) {
    let cancelUploadButton, element;
    element = document.createElement("i");
    element.classList.add(
      "bi",
      "bi-file-check-fill",
      "file-preview-icon",
      "file-removal"
    );
    cancelUploadButton = document.createElement("i");
    cancelUploadButton.classList.add(
      "bi",
      "bi-x-circle-fill",
      "cancel-upload-button"
    );
    cancelUploadButton.onclick = cancelFunction;
    element.appendChild(cancelUploadButton);
    return element;
  }
  /**
   * Remove the selected preview element.
   * Uses a dataTransfer to circumvent fileList limitations
   * @param {Event} e - The event object
   */
  removePreview(event) {
    const target = event.target.parentNode.closest(".attachment-preview");
    const dataTransfer = new DataTransfer();
    let fileInput = document.getElementById("message_attachments");
    let files = fileInput.files;
    let filesArray = Array.from(files);

    filesArray = filesArray.filter((file) => {
      let filename = target.dataset.filename;
      return file.name !== filename;
    });
    target.parentNode.removeChild(target);
    filesArray.forEach((file) => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;

    if (filesArray.length === 0) {
      this.toggleVisibility();
    }
  }
  /**
   * Clear all the preview elements after submit
   */
  clearPreviews() {
    document.getElementById("attachment-previews").innerHTML = "";
    let preview = document.getElementById("attachment-previews");
    preview.classList.add("d-none");
  }
  audio() {
    let record = document.getElementById("audio-record-button");
    let messageAttachments = document.getElementById("message_attachments");

    let recording = false;

    if (navigator.mediaDevices.getUserMedia) {
      const constraints = { audio: true };
      let chunks = [];

      let onSuccess = function (stream) {
        const mediaRecorder = new MediaRecorder(stream);

        record.onclick = function (event) {
          event.preventDefault();
          if (recording) {
            mediaRecorder.stop();
            record.style.color = "";
          } else {
            mediaRecorder.start();
            record.style.color = "red";
          }
          recording =!recording;
        };

        mediaRecorder.onstop = function (event) {
          const audioType = "audio/webm; codecs=opus";
          const blob = new Blob(chunks, { type: audioType });
          chunks = [];
          const uniqueFileName = "audio-message.webm"; 

          let file = new File([blob], uniqueFileName, {
            type: audioType,
            lastModified: new Date().getTime(),
          });
          let container = new DataTransfer();
          container.items.add(file);
          uploadFile(file);
          messageAttachments.files = container.files;
          messageAttachments.dispatchEvent(new Event("change"));
        };

        mediaRecorder.ondataavailable = function (e) {
          chunks.push(e.data);
        };
      };
      let onError = function (err) {
        console.log("The following error occured: " + err);
      };

      navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
    } else {
      console.log("getUserMedia not supported on your browser!");
    }
  }
}

const uploadFile = (file) => {
  // Your form needs the file_field direct_upload: true, which
  // provides data-direct-upload-url
  const input = document.getElementById("message_attachments");
  const url = input.dataset.directUploadUrl;
  const upload = new DirectUpload(file, url);

  upload.create((error, blob) => {
    if (error) {
      // idk, do something
    } else {
      // Add an appropriately-named hidden input to the form with a
      //  value of blob.signed_id so that the blob ids will be
      //  transmitted in the normal upload flow
      const hiddenField = document.createElement("input");
      hiddenField.setAttribute("type", "hidden");
      hiddenField.setAttribute("value", blob.signed_id);
      hiddenField.name = input.name;
      let messageForm = document.getElementById("message-form");
      messageForm.appendChild(hiddenField);
    }
  });
};

 

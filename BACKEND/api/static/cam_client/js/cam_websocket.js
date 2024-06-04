const IMAGE_INTERVAL_MS = 250;
const SNAP_IMAGE_SCALE = 4;
const ADAPTIVE_FACTOR = 1.15;
let isStreaming = false; // Flag to track streaming state

function getWebSocketUrl(path = "") {
  const currentUrl = new URL(window.location.href);

  // Ensure protocol is 'ws:' (unencrypted)
  if (currentUrl.protocol == "https:") {
    currentUrl.protocol = "wss:";
  } else {
    currentUrl.protocol = "ws:";
  }
  // Append the path if provided
  if (path) {
    currentUrl.pathname = path.trim(); // Trim leading/trailing slashes
  }
  return currentUrl.toString();
}

function debug(msg, level = "danger") {
  const debug_div = document.getElementById("debug");
  if (debug_div) {
    debug_div.className = "";
    debug_div.classList.add("alert");
    debug_div.classList.add("alert-" + level);
    debug_div.innerText = msg;
  }
}

function info(msg, level = "info") {
  const info_div = document.getElementById("info");
  if (info_div) {
    //    info_div.className = "";
    //    info_div.classList.add("alert");
    //    info_div.classList.add("alert-"+level);
    info_div.innerText = msg;
  }
}

function info_toggle() {
  const info_div = document.getElementById("info");
  info_div.classList.toggle("d-none");
  info_div.innerText = "";
}

function resize_canvas(video, canvas){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
//    canvas.style.position = 'absolute';
//    canvas.style.top = '0';
//    canvas.style.left = '0';
//    canvas.width = video.videoHeight;
//    canvas.height = video.videoWidth;
//    canvas.style.left = video.style.left;
//    canvas.style.top = video.style.top;

}

function isFirefoxMobile() {
    const userAgent = navigator.userAgent?.toLowerCase();
    return userAgent?.includes('firefox') && userAgent?.includes('mobile');
}

function handleOrientationChange(video, canvas) {
  let angle = screen.orientation.angle || window.orientation;
  if (angle !== undefined ){
    const skip_rotate = !isFirefoxMobile();
    if (skip_rotate) {
     angle = 0;
    }
    video.setAttribute("skip_rotate", skip_rotate);
    video.style.transform = `rotate(${angle}deg)`;
  }
  resize_canvas(video, canvas);
  setTimeout(() =>{resize_canvas(video, canvas)}, 600);
}


const startFaceDetection = (video, canvas, deviceId) => {
  if (!WS_URL) {
    console.error("WS_URL:", WS_URL);
    return;
  }
  const ws_connect = getWebSocketUrl(WS_URL);
  console.log("ws_connect:", ws_connect);
  try {
    info_toggle();
    const socket = new WebSocket(ws_connect);
    socket.onopen = () => {
      msg = "WebSocket connection opened!";
      console.log(msg);
      debug(msg, "info");
    };
    socket.onerror = (error) => {
      const msg = "WebSocket connection error. " + ws_connect;
      debug(msg);
    };
    let intervalId;
    let interval_measure;
    let is_answered = true;
    let skipped_frames = 0;
    let sent_frames = 0;
    let total_frames = 0;
    let adaptive_interval_ms = IMAGE_INTERVAL_MS;
    let average_duration = 0;
    let average_duration_time = 0;
    let average_duration_fps = 0;
    let avg_duration = 0;
    let average_duration_calc = 0;
    let avg_duration_calc = 0;
    let max_queue = 0;
    // Connection opened
    socket.addEventListener("open", function () {
      // Start reading video from device
      navigator.mediaDevices
        .getUserMedia({
          audio: false,
          video: {
            deviceId,
            width: { max: 640 },
            height: { max: 480 },
          },
        })
        .then(function (stream) {
          video.srcObject = stream;
          handleOrientationChange(video, canvas);
          video.play().then(() => {
            // Adapt overlay canvas size to the video size
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            isStreaming = true;

            // Send an image in the WebSocket every DEFINED ms
            const sendImage = () => {
              total_frames += 1;
              intervalId = setTimeout(sendImage, adaptive_interval_ms);
              if (!is_answered) {
                skipped_frames += 1;
                const sk_perc = ((skipped_frames / total_frames) * 100).toFixed(2);
                const currentTime = new Date().toLocaleTimeString();
                debug(
                  `At ${currentTime}: skipped for the sending frame, not received in time. Total frames was skipped: ${skipped_frames} (${sk_perc}%) of ${total_frames}`,
                  "info"
                );
                return;
              }
              is_answered = false;
              // On canvas to draw current video image
              if (!canvas) {
                console.error("No Canvas...");
                return;
              }
              const canvas_video_snap = document.createElement("canvas");
              const ctx = canvas_video_snap.getContext("2d");
              const scaledWidth = video.videoWidth / SNAP_IMAGE_SCALE;
              const scaledHeight = video.videoHeight / SNAP_IMAGE_SCALE;

              const angle = screen.orientation.angle || window.orientation;
              if (angle === 90 || angle === 270) {
                  if (video.getAttribute("skip_rotate") === "true") {
                    canvas_video_snap.width = scaledWidth;
                    canvas_video_snap.height = scaledHeight;
                    ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas_video_snap.width, canvas_video_snap.height);
                  }else{
                    canvas_video_snap.height = scaledWidth;
                    canvas_video_snap.width = scaledHeight;
                    const radians = ((angle) * Math.PI) / 180;
                    ctx.translate(scaledWidth/2, scaledHeight/2);
                    ctx.rotate(radians);
                    ctx.drawImage(video, 0,0, video.videoWidth, video.videoHeight,  -scaledWidth/2, - scaledHeight/2,scaledWidth, scaledHeight);
                  }
              }else{
                canvas_video_snap.width = scaledWidth;
                canvas_video_snap.height = scaledHeight;
                ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, scaledWidth, scaledHeight);
              }
              // Convert it to JPEG and send it to the WebSocket
              interval_measure = performance.now();
              canvas_video_snap.toBlob((blob) => socket.send(blob), "image/jpeg");
              sent_frames += 1;
            }; // sendImage
            intervalId = setTimeout(sendImage, IMAGE_INTERVAL_MS);
          });
        });
    });
    // Listen for messages
    const MEASURE_FRAMES = 100;
    socket.addEventListener("message", function (event) {
      is_answered = true;
      let avg_correction = 1;
      const duration = Math.round(performance.now() - interval_measure);
      average_duration += duration;
      message_data = JSON.parse(event.data);
      average_duration_calc += message_data?.duration_ms;
      if (sent_frames % MEASURE_FRAMES == 0) {
        if (average_duration > 0) {
          avg_duration = Math.round(average_duration / MEASURE_FRAMES);
          if (avg_duration < 75) avg_correction = 2;
          else if (avg_duration < 30) avg_correction = 3;
          adaptive_interval_ms = Math.round(avg_duration * ADAPTIVE_FACTOR * avg_correction);
          average_duration = 0;
          average_duration_fps = (MEASURE_FRAMES / ((performance.now() - average_duration_time) / 1000.0)).toFixed(1);
          average_duration_time = performance.now();
        }
        if (average_duration_calc > 0) {
          avg_duration_calc = Math.round(average_duration_calc / MEASURE_FRAMES);
          average_duration_calc = 0;
        }
      }
      if (draw_detected) draw_detected(video, canvas, message_data, SNAP_IMAGE_SCALE);
      max_queue = Math.max(message_data.queue_id, max_queue);
      const angle = screen.orientation.angle || window.orientation;
//      const sr = video.getAttribute("skip_rotate");
      info(
        `Queue: ${message_data?.queue_id}(max:${max_queue}). Sending adaptive interval: ${adaptive_interval_ms} ms, Answer time: ${duration} (avr: ${avg_duration}) ms. ${average_duration_fps} fps. Calculated API method duration: ${message_data?.duration_ms} (avg:${avg_duration_calc}) ms. A:${angle}.`
      );
    });
    // Stop the interval and video reading on close
    socket.addEventListener("close", function () {
      window.clearInterval(intervalId);
      video.pause();
    });
    return socket;
  } catch (error) {
    if (error instanceof SyntaxError) {
      debug("Invalid WebSocket URL format:" + error.message);
      console.error("Invalid WebSocket URL format:", error.message);
    } else {
      debug("WebSocket connection error:" + error.message);
      console.error("WebSocket connection error:", error);
    }
  }
};

// Function to stop the video stream and turn off the LED (if possible)
const stopFaceDetection = (video, canvas) => {
  if (1) {
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    const mediaStream = video.srcObject;
    if (mediaStream) {
      const tracks = mediaStream.getTracks();
      tracks.forEach(function (track) {
        track.stop(); // Stop individual media track
      });
      video.srcObject = null; // Clear video source
      isStreaming = false;
      //      console.log("Video stream stopped");
      setTimeout(() => {
        debug("Video stream stopped", "info");
      }, 2000);
    }
    info_toggle();
  } else {
    console.log("Video stream already stopped");
  }
};

const cam_detect = (cameraSelect) => {
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then((stream) => {
      // stop LED use.
      stream.getTracks().forEach((track) => track.stop());
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          // Check for available cameras
          // console.log('Check for available cameras',devices);
          if (!devices.some((device) => device.kind === "videoinput")) {
            const noCameraOption = document.createElement("option");
            noCameraOption.value = ""; // Set an empty value to avoid potential selection issues
            noCameraOption.innerText = "No cameras detected";
            console.log("No cameras detected", noCameraOption.innerText);
            cameraSelect.appendChild(noCameraOption);
            return; // Exit if no cameras are found
          }

          // Filter and populate options
          for (const device of devices) {
            if (device.kind === "videoinput") {
              const deviceOption = document.createElement("option");
              if (device.deviceId) {
                deviceOption.value = device.deviceId;
                deviceOption.innerText = device.label || `Camera ${devices.indexOf(device) + 1}`; // Use label or fallback
                console.log("cameras detected");
                cameraSelect.appendChild(deviceOption);
              } else {
                console.log("cameras detected but empty");
                deviceOption.value = "";
                deviceOption.innerText = "WARNING: Cameras detected but with empty names";
                cameraSelect.appendChild(deviceOption);
              }
            }
          }
        })
        .catch((error) => {
          console.error("Error listing cameras:", error);
          // Handle errors gracefully (e.g., display an error message to the user)
        });
    })
    .catch((err) => {
      const noCameraOption = document.createElement("option");
      noCameraOption.value = ""; // Set an empty value to avoid potential selection issues
      noCameraOption.innerText = "No cameras detected. Permission required.";
      console.error("No cameras detected", err);
      cameraSelect.appendChild(noCameraOption);
    });
};

// Add event listeners for resize and orientation change
window.addEventListener("resize", (event) => {
    const video = document.getElementById('video')
    const canvas = document.getElementById("canvas");

//    video.pause();
    handleOrientationChange(video,canvas);
});


// DOMContentLoaded
window.addEventListener("DOMContentLoaded", (event) => {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  const cameraSelect = document.getElementById("camera-select");
  let socket;
  cam_detect(cameraSelect);
  const button_start = document.getElementById("button-start");
  const button_stop = document.getElementById("button-stop");
  if (button_stop) {
    button_stop.addEventListener("click", (event) => {
      event.preventDefault();
      // Close the WebSocket connection (if it exists)
      if (socket) {
        stopFaceDetection(video, canvas);
        socket.close();
        setTimeout(() => {
          debug("WebSocket connection closed", "info");
        }, 600);
        socket = null; // Clear the socket reference
      } else {
        console.log("No WebSocket connection to close");
      }
      if (button_stop) {
        button_start.classList.toggle("d-none");
      }
      if (button_stop) {
        button_stop.classList.toggle("d-none");
      }
    });
  }

  // Start face detection on the selected camera on submit
  document.getElementById("form-connect")?.addEventListener("submit", (event) => {
    event.preventDefault();

    // Close previous socket is there is one
    if (socket) {
      socket.close();
    }

    const deviceId = cameraSelect.selectedOptions[0]?.value;
    if (deviceId) {
      socket = startFaceDetection(video, canvas, deviceId);
      if (socket) {
        if (button_start) {
          button_start.classList.toggle("d-none");
        }
        if (button_stop) {
          button_stop.classList.toggle("d-none");
        }
      }
    } else {
      debug("Not detected device ID");
    }
  });

  video.addEventListener('loadedmetadata', function() {
//    console.log("loadedmetadata");
    resize_canvas(video, canvas);
});

});
// DOMContentLoaded
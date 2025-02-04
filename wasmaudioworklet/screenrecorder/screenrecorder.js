
import { showCamViewer } from './cameraviewer.js';

let mediaRecorder;
let captureStream;
let audioStreamDestination;

export async function startVideoRecording(audioContext) {
    try {
        const videostream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: false
        });

        audioStreamDestination = audioContext.createMediaStreamDestination();

        // need at least one node connected in order to keep in sync with the video
        audioContext.createGain().connect(audioStreamDestination);

        if (sessionStorage.getItem('capturemic') === 'true') {
            const micstream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
            const micsource = audioContext.createMediaStreamSource(new MediaStream(micstream.getAudioTracks()));
            micsource.connect(audioStreamDestination);
        }

        const tracks = [
            ...videostream.getVideoTracks(),
            ...audioStreamDestination.stream.getAudioTracks()
        ];
        captureStream = new MediaStream(tracks);

        mediaRecorder = new MediaRecorder(captureStream);
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                var blob = new Blob([event.data], {
                    type: "video/webm"
                });
                var url = URL.createObjectURL(blob);
                var a = document.createElement("a");
                document.body.appendChild(a);
                a.style = "display: none";
                a.href = url;
                a.download = "test.webm";
                a.click();
                window.URL.revokeObjectURL(url);
            }
        };
        mediaRecorder.start();
    } catch (err) {
        console.error("Error: " + err);
    }
}

export function recordAudioNode(audioNodeToRecord) {
    if (audioStreamDestination) {
        audioNodeToRecord.connect(audioStreamDestination);
    }
}

export function stopVideoRecording() {
    captureStream.getVideoTracks().forEach(t => t.stop());
    mediaRecorder.stop();
    audioStreamDestination = null;
}

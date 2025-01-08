import { Component } from '@angular/core';

@Component({
  selector: 'app-video-recorder',
  templateUrl: './video-recorder.component.html',
  styleUrls: ['./video-recorder.component.scss'],
  standalone: true
})
export class VideoRecorderComponent {
  private mediaRecorder!: MediaRecorder;
  private recordedChunks: Blob[] = [];
  private screenStream!: MediaStream;
  isRecording = false;

  // Starts the recording
  async startRecording() {
    try {
      // Get screen stream (includes the iframe where Jitsi is displayed)
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {  }, // Include cursor if needed
        audio: true, // Include system audio
      });

      // Set up MediaRecorder to record the stream
      this.mediaRecorder = new MediaRecorder(this.screenStream);
      this.recordedChunks = [];

      // Collect data chunks
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // When recording stops, save the video
      this.mediaRecorder.onstop = () => {
        this.saveRecording();
        this.cleanup();
      };

      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      console.log('Recording started.');
    } catch (error) {
      console.error('Error accessing display media:', error);
    }
  }

  // Stops the recording
  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
      this.isRecording = false;
      console.log('Recording stopped.');
    }
  }

  // Save the recording as a downloadable file
  private saveRecording() {
    const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);

    // Create a downloadable link
    const a = document.createElement('a');
    a.href = url;
    a.download = `jitsi-meeting-recording-${new Date().toISOString()}.webm`;
    a.click();

    // Optionally display the video in a <video> element
    const videoElement = document.querySelector('video#recordedVideo') as HTMLVideoElement;
    if (videoElement) {
      videoElement.src = url;
      videoElement.style.display = 'block';
    }
  }

  // Clean up resources
  private cleanup() {
    this.screenStream.getTracks().forEach((track) => track.stop());
  }
}

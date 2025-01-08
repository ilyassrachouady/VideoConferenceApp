import { Component, OnInit, ElementRef, ViewChildren, QueryList } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {VideoRecorderComponent} from './video-recorder/video-recorder.component';

declare var JitsiMeetExternalAPI: any;

interface Participant {
  id: string;
  name: string;
  avatar: string;
  isMuted: boolean;
  videoElement?: HTMLVideoElement;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatSliderModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    VideoRecorderComponent
  ]
})
export class AppComponent implements OnInit {
  @ViewChildren('participantVideo') participantVideos!: QueryList<ElementRef>;

  title = 'Video Conference App';
  jitsiUrl: SafeResourceUrl;
  private jitsiMeet: any;

  participants: Participant[] = [
    {
      id: '1',
      name: 'Alberto Josh',
      avatar: 'https://i.pravatar.cc/150?img=1',
      isMuted: false
    },
    {
      id: '2',
      name: 'Julien Damian',
      avatar: 'https://i.pravatar.cc/150?img=2',
      isMuted: true
    },
    {
      id: '3',
      name: 'Mark Smith',
      avatar: 'https://i.pravatar.cc/150?img=3',
      isMuted: false
    },
    {
      id: '4',
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=4',
      isMuted: true
    }
  ];

  isAudioMuted = false;
  isVideoMuted = false;

  constructor(private sanitizer: DomSanitizer) {
    const roomName = 'TeamsMeeting_' + Math.random().toString(36).substring(7);
    const url = `https://meet.jit.si/${roomName}`;
    this.jitsiUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit() {
    this.initJitsiMeet();
  }

  ngAfterViewInit() {
    this.setupParticipantVideoElements();
  }

  private initJitsiMeet() {
    const domain = 'meet.jit.si';
    const options = {
      roomName: this.extractRoomName(this.jitsiUrl),
      width: '100%',
      height: '100%',
      parentNode: null,
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: true,
        startWithVideoMuted: true
      }
    };

    this.jitsiMeet = new JitsiMeetExternalAPI(domain, options);

    this.jitsiMeet.addEventListeners({
      participantJoined: this.onParticipantJoined.bind(this),
      participantLeft: this.onParticipantLeft.bind(this),
      audioMuteStatusChanged: this.onAudioMuteChanged.bind(this),
      videoMuteStatusChanged: this.onVideoMuteChanged.bind(this)
    });
  }

  private setupParticipantVideoElements() {
    this.participantVideos.forEach((videoRef, index) => {
      if (this.participants[index]) {
        this.participants[index].videoElement = videoRef.nativeElement;
      }
    });
  }

  private extractRoomName(url: SafeResourceUrl): string {
    const urlString = url.toString();
    const matches = urlString.match(/\/([^\/]+)$/);
    return matches ? matches[1] : 'DefaultRoom';
  }

  private onParticipantJoined(event: any) {
    console.log('Participant joined:', event);
    // You might want to update participants list or handle new participants
  }

  private onParticipantLeft(event: any) {
    console.log('Participant left:', event);
    // Remove participant from list if needed
  }

  private onAudioMuteChanged(event: any) {
    const participantIndex = this.participants.findIndex(p => p.id === event.id);
    if (participantIndex !== -1) {
      this.participants[participantIndex].isMuted = event.muted;
    }
  }

  private onVideoMuteChanged(event: any) {
    // Implement video mute logic if needed
  }

  // Meeting control methods
  toggleAudio() {
    this.isAudioMuted = !this.isAudioMuted;
    this.jitsiMeet.executeCommand('toggleAudio');
  }

  toggleVideo() {
    this.isVideoMuted = !this.isVideoMuted;
    this.jitsiMeet.executeCommand('toggleVideo');
  }

  toggleShareScreen() {
    this.jitsiMeet.executeCommand('toggleShareScreen');
  }

  hangup() {
    this.jitsiMeet.executeCommand('hangup');
  }
}

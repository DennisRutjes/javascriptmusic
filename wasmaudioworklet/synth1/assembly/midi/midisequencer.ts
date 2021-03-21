import { SAMPLERATE } from "../environment";
import { MidiSequencerPart } from "./midisequencerpart";
import { fillSampleBuffer, sampleBufferFrames } from "./midisynth";

export const midiparts: MidiSequencerPart[] = new Array<MidiSequencerPart>();
const PLAY_EVENT_INTERVAL = ((sampleBufferFrames * 1000) as f64 / SAMPLERATE);
export class MidiSequencerPartSchedule {
    public endTime: i32;

    constructor(public midipartindex: i32,
        public startTime: i32) {
        this.endTime = midiparts[midipartindex].lastEventTime + startTime;
    }
}

export const midipartschedule: MidiSequencerPartSchedule[] = new Array<MidiSequencerPartSchedule>();

export let currentTimeMillis: f64 = 0;

export function seek(time: i32): void {
    currentTimeMillis = time as f64;

    for (let ndx = 0;
        ndx < midipartschedule.length;
        ndx++) {
        const scheduleEntry = midipartschedule[ndx];
        const midiSequencerPart = midiparts[scheduleEntry.midipartindex];
        if (scheduleEntry.endTime >= currentTimeMillis && scheduleEntry.startTime <= currentTimeMillis) {
            midiSequencerPart.seek(Math.round(currentTimeMillis) as i32 - scheduleEntry.startTime);
        } else {
            midiSequencerPart.seek(0);
        }
    }
}

export function playMidiPartEvents(): void {
    for (let ndx = 0;
        ndx < midipartschedule.length;
        ndx++) {
        const scheduleEntry = midipartschedule[ndx];
        const midiSequencerPart = midiparts[scheduleEntry.midipartindex];
        if (scheduleEntry.startTime > currentTimeMillis) {
            break;
        }
        if (currentTimeMillis <= (scheduleEntry.endTime + PLAY_EVENT_INTERVAL)) {
            midiSequencerPart.playEvents(Math.round(currentTimeMillis) as i32 - scheduleEntry.startTime);
        }
    }
}

export function playEventsAndFillSampleBuffer(): void {
    playMidiPartEvents();
    fillSampleBuffer();
    currentTimeMillis += PLAY_EVENT_INTERVAL;
}
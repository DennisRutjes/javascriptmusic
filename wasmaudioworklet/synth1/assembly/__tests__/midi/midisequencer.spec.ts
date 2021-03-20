import { SAMPLERATE } from "../../environment";
import { seek, playEventsAndFillSampleBuffer, midiparts, midipartschedule, MidiSequencerPartSchedule, currentTimeMillis } from "../../midi/midisequencer";
import { samplebuffer } from "../../midi/midisynth";
import { MidiSequencerPart } from "../../midi/midisequencerpart";

describe("midisequencer", () => {
    it("should play the sequencer", () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80
            0x40, 0x90, 0x40, 0x64, // time = 0xc0
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140
        ];
        const midiSequencerPart = new MidiSequencerPart(eventlist);
        
        midiSequencerPart.playEvents(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.playEvents(0x80);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.playEvents(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.playEvents(0xc0);
        expect(midiSequencerPart.currentEventTime).toBe(0xc0);
        expect(midiSequencerPart.currentEventIndex).toBe(13);

        midiSequencerPart.playEvents(0x141);
        expect(midiSequencerPart.currentEventTime).toBe(0x140);
        expect(midiSequencerPart.currentEventIndex).toBe(18);

    });

    it("should seek", () => {
        const bpm = 70;
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80, ndx 4
            0x40, 0x90, 0x40, 0x64, // time = 0xc0, ndx 9
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140, ndx 13
        ]; // ndx = 18

        const midiSequencerPart = new MidiSequencerPart(eventlist);

        midiSequencerPart.seek(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0x80);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0x40);

        expect(midiSequencerPart.currentEventTime).toBe(0);
        expect(midiSequencerPart.currentEventIndex).toBe(4);

        midiSequencerPart.seek(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0xc0);
        expect(midiSequencerPart.currentEventTime).toBe(0xc0);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0x140);
        expect(midiSequencerPart.currentEventTime).toBe(0x140);
        expect(midiSequencerPart.currentEventIndex).toBe(13);

        midiSequencerPart.seek(0xa0);
        expect(midiSequencerPart.currentEventTime).toBe(0x80);
        expect(midiSequencerPart.currentEventIndex).toBe(9);

        midiSequencerPart.seek(0x0);
        expect(midiSequencerPart.currentEventIndex).toBe(0);
        expect(midiSequencerPart.currentEventTime).toBe(0);
    });
    it('should play the song and fill the samplebuffer', () => {
        const eventlist: u8[] = [
            0x00, 0x90, 0x40, 0x64,
            0x80, 0x01, 0x80, 0x40, 0x00, // time = 0x80, ndx 4
            0x40, 0x90, 0x40, 0x64, // time = 0xc0, ndx 9
            0x80, 0x01, 0x80, 0x40, 0x00 // time = 0x140, ndx 13
        ]; // ndx = 18

        const midiSequencerPart = new MidiSequencerPart(eventlist);
        midiparts.push(midiSequencerPart);
        midipartschedule.push(new MidiSequencerPartSchedule(0, 0));
        expect(midiparts.length).toBe(1);
        expect(midipartschedule.length).toBe(1);

        seek(0x0);
        expect(currentTimeMillis).toBe(0);
        expect(samplebuffer[1]).toBe(0);
        playEventsAndFillSampleBuffer();
        expect(currentTimeMillis).toBeCloseTo(128 * 1000 / SAMPLERATE);
        expect(samplebuffer[1]).not.toBe(0);
    });
    it('should play 8 metronome clicks', () => {
        const eventlist: u8[] = [
            0, 145, 66, 100,
            217, 6, 129, 66, 0, // 857 msecs
            0, 145, 66, 100,
            217, 6, 129, 66, 0, // 857 msecs
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            0, 145, 66, 100,
            217, 6, 129, 66, 0,
            1, 145, 66, 100,
            217, 6, 129, 66, 0
        ];
        const millisecondsBetweenEvents = 857;
        const midiSequencerPart = new MidiSequencerPart(eventlist);
        midiparts[0] = midiSequencerPart;
        midipartschedule[0] = new MidiSequencerPartSchedule(0, 0);
        expect(midiparts.length).toBe(1);
        expect(midipartschedule.length).toBe(1);
        expect(midipartschedule[0].endTime).toBe(midiSequencerPart.lastEventTime);
        expect(midiSequencerPart.lastEventTime).toBe(millisecondsBetweenEvents * 8 + 1);

        seek(0x0);
        for (let n = 0; n < 300; n++) {
            expect(currentTimeMillis).toBeCloseTo((((n * 128.0) / SAMPLERATE) * 1000.0));
            playEventsAndFillSampleBuffer();
            expect(midiSequencerPart.currentEventIndex)
                .toBe(((Math.floor((currentTimeMillis - 2.9) / 857) * 9) + 4) as i32);
        }
    });
});
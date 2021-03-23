import { compileSong, createMultipatternSequence } from '../midisequencer/songcompiler.js';
import { compileWebAssemblySynth } from './browsersynthcompiler.js';

describe.only('browsersynthcompiler', function () {
    this.timeout(20000);
    it('should compile to wasm midi multipart module', async ()=> {
        const synthsource = ``;
        const bpm = 110;
        const songsource = `
        setBPM(${bpm});
    
        const kickbeat = () => createTrack(1).steps(4, [
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,,
              [c5],,,,
              c5,,,c5(1/8,30),
              [c5],,,,        
            ]);
        
        const blabla = () => createTrack(0).steps(4, [
           c1,c2,c3    
            ]);
        
        const tralala = () => createTrack(0).steps(4, [
                d4,c3,c1,f6    
                 ]);
             
        const hohoho = () => createTrack(0).steps(4, [
            c3,c2,c1   
        ]);
        blabla();
        await kickbeat();
        tralala();
        await kickbeat();
        hohoho();
        await kickbeat();
        loopHere();
        `;
        await compileSong(songsource);

        const multiPatternSequence = createMultipatternSequence();
        const wasmbytes = await (await fetch(await compileWebAssemblySynth(synthsource,
                        multiPatternSequence, 44100,
                        'midimultipartmodule', true))).arrayBuffer();
        console.log('wasm file length is '+wasmbytes.byteLength);
        const SAMPLERATE = 44100;
        const wasminstance = (await WebAssembly.instantiate(wasmbytes, {
            environment: {
                SAMPLERATE: SAMPLERATE
            }
        })).instance.exports;

        assert.equal(wasminstance.currentTimeMillis.value, 0);
        wasminstance.playEventsAndFillSampleBuffer();
        assert.equal(wasminstance.currentTimeMillis.value, 128 * 1000 / SAMPLERATE);        
    });
});
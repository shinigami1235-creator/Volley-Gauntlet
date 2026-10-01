# Renders single-note instrument samples from FluidR3 GM for the in-game sampler.
import subprocess, numpy as np, json, os, wave
import mido
SF=os.environ.get('SF2','/usr/share/sounds/sf2/FluidR3_GM.sf2'); SR=24000; OUT=os.path.dirname(os.path.abspath(__file__))
# key: (program or 'drum', [notes], seconds, velocity)
INST={
 'sqlead':(80,[72,84],1.0,100),'sawlead':(81,[60,72,84],1.0,105),'pluck':(84,[60,72],.8,100),'synbass':(38,[36,48],.6,110),'pad':(89,[55,67],2.4,95),'glock':(9,[84],1.2,90),
}
DRUM={'kick808':(36,.8,120,25),'clap808':(39,.5,110,25),'hat808':(42,.2,100,25),'ohat808':(46,.5,100,25),'esnare':(38,.4,115,24),'crash':(49,1.8,110,0),'tom808':(45,.5,110,25)}
def render(name,prog,note,dur,vel,drum=False,kit=0):
    ch=9 if drum else 0;mf=mido.MidiFile(ticks_per_beat=480);tr=mido.MidiTrack();mf.tracks.append(tr)
    tr.append(mido.MetaMessage('set_tempo',tempo=1000000))
    tr.append(mido.Message('program_change',channel=ch,program=(kit if drum else prog),time=0))
    tr.append(mido.Message('note_on',channel=ch,note=note,velocity=vel,time=24))
    tr.append(mido.Message('note_off',channel=ch,note=note,velocity=0,time=int(dur*480)))
    tr.append(mido.MetaMessage('end_of_track',time=480))
    mid=f'{OUT}/wav/{name}.mid';wav=f'{OUT}/wav/{name}.wav';mf.save(mid)
    subprocess.run(['fluidsynth','-ni','-q','-R','0','-C','0','-g','0.8','-r',str(SR),'-F',wav,SF,mid],check=True,capture_output=True)
    with wave.open(wav) as w:
        ch_=w.getnchannels();x=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16).astype(np.float32)/32768
    x=x.reshape(-1,ch_).mean(1)
    pk=np.abs(x).max()
    if pk<1e-4:print('SILENT',name);return None
    th=pk*.004;i0=max(0,np.argmax(np.abs(x)>th)-8)
    tail=int(SR*(dur+(0.3 if not drum else 0.15)));x=x[i0:i0+tail]
    fl=int(SR*.12);x[-fl:]*=np.linspace(1,0,fl)**2
    x=x/pk*.89
    rms=float(np.sqrt(np.mean(x[:int(SR*.3)]**2)))
    with wave.open(wav,'wb') as w:w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR);w.writeframes((x*32767).astype(np.int16).tobytes())
    mp3=f'{OUT}/mp3/{name}.mp3'
    subprocess.run(['ffmpeg','-y','-loglevel','error','-i',wav,'-ac','1','-ar',str(SR),'-b:a','48k',mp3],check=True)
    return {'rms':round(rms,4),'len':round(len(x)/SR,3)}
meta={}
for k,(prog,notes,dur,vel) in INST.items():
    for n in notes:
        r=render(f'{k}_{n}',prog,n,dur,vel)
        if r: meta[f'{k}_{n}']=dict(r,inst=k,note=n)
for k,(n,dur,vel,kit) in DRUM.items():
    r=render(f'd_{k}',0,n,dur,vel,True,kit)
    if r: meta[f'd_{k}']=dict(r,inst=k,note=n,drum=1)
json.dump(meta,open(f'{OUT}/samples.json','w'),indent=0)
tot=sum(os.path.getsize(f'{OUT}/mp3/{k}.mp3') for k in meta)
print(len(meta),'samples',tot,'bytes mp3')

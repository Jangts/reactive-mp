"""Generate three original motion clips and a Mini Program sandbox-media payload."""
from pathlib import Path
import base64
import hashlib
import json
import math
import shutil
import struct
import subprocess
import wave
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / 'artifacts/demo-media'
ASSETS = ROOT / 'examples/integration/assets/video'
WIDTH, HEIGHT, FPS, DURATION = 960, 540, 30, 12
SCENES = [
    dict(id='orbit', title='ORBIT', label='轨道', bg=(242, 246, 253), accent=(242, 121, 78), tone=523.25),
    dict(id='bounce', title='BOUNCE', label='弹跳', bg=(249, 244, 237), accent=(73, 115, 211), tone=329.63),
    dict(id='wave', title='WAVE', label='波浪', bg=(233, 246, 240), accent=(39, 141, 119), tone=392.00),
]

def font(size, bold=False):
    names = [
        '/System/Library/Fonts/Supplemental/Arial Bold.ttf' if bold else '/System/Library/Fonts/Supplemental/Arial.ttf',
        '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf' if bold else '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
        'C:/Windows/Fonts/arialbd.ttf' if bold else 'C:/Windows/Fonts/arial.ttf',
    ]
    return ImageFont.truetype(next(name for name in names if Path(name).exists()), size)

FONTS = {size: font(size, size in (44, 36)) for size in (16, 20, 36, 44)}

def mix(first, second, amount):
    return tuple(round(a * (1 - amount) + b * amount) for a, b in zip(first, second))

def orb(draw, x, y, radius, color):
    draw.ellipse((x-radius, y-radius, x+radius, y+radius), fill=mix(color, (30, 40, 65), .15))
    for step in range(24, 0, -1):
        r = radius * step / 25
        shift = (1 - step / 25) * radius * .22
        draw.ellipse((x-r-shift, y-r-shift, x+r-shift, y+r-shift), fill=mix(color, (255, 241, 218), (1-step/25)*.65))

def render(scene, index, t):
    image = Image.new('RGB', (WIDTH, HEIGHT), scene['bg'])
    draw = ImageDraw.Draw(image)
    ink, muted, accent = (32, 49, 76), (104, 121, 140), scene['accent']
    draw.text((52, 28), f'MOTION STUDY  /  0{index + 1}', font=FONTS[16], fill=muted)
    draw.text((50, 64), scene['title'], font=FONTS[44], fill=ink)
    draw.text((785, 74), f'{t:04.1f} s', font=FONTS[36], fill=ink)
    if scene['id'] == 'orbit':
        cx, cy, rx, ry = 480, 293, 264, 105
        draw.ellipse((cx-rx, cy-ry, cx+rx, cy+ry), outline=(203, 216, 235), width=3)
        draw.ellipse((cx-110, cy-44, cx+110, cy+44), outline=(220, 229, 242), width=2)
        angle = t * math.tau / 4
        for k in range(12, 0, -1):
            a = angle - k * .12
            x, y = cx + rx * math.cos(a), cy + ry * math.sin(a)
            r = 7 + (12-k) * .5
            draw.ellipse((x-r, y-r, x+r, y+r), fill=mix(accent, scene['bg'], k/14))
        orb(draw, cx+rx*math.cos(angle), cy+ry*math.sin(angle), 34, accent)
        orb(draw, cx-95*math.cos(angle*.7), cy-35*math.sin(angle*.7), 17, (84, 136, 201))
    elif scene['id'] == 'bounce':
        draw.rounded_rectangle((70, 396, 890, 410), radius=7, fill=(222, 215, 206))
        for k in range(9):
            x = 108 + k * 91
            draw.line((x, 419, x, 428), fill=(197, 189, 181), width=2)
        x = 110 + 740 * (.5 - .5 * math.cos(t*math.tau/6))
        bounce = abs(math.sin(t*math.tau/2))
        y = 361 - 170 * bounce
        shadow = 30 - 13*bounce
        draw.ellipse((x-shadow, 389-4*(1-bounce), x+shadow, 397+4*(1-bounce)), fill=(211, 205, 198))
        orb(draw, x, y, 34, accent)
        for k in range(3):
            a = t*3+k*math.tau/3
            r = 3
            draw.ellipse((x+17*math.cos(a)-r, y+17*math.sin(a)-r, x+17*math.cos(a)+r, y+17*math.sin(a)+r), fill=(220, 233, 255))
    else:
        phase = t * math.tau/4
        for layer in range(3):
            points = [(x, 310 + layer*35 + 50*math.sin(x/130-phase+layer*.7)) for x in range(50, 911, 4)]
            draw.polygon(points+[(910,428),(50,428)], fill=mix(accent, scene['bg'], .76-layer*.16))
            draw.line(points, fill=mix(accent, (255,255,255), .30+layer*.18), width=3)
        x = 480+310*math.sin(t*math.tau/8)
        y = 310+50*math.sin(x/130-phase)
        orb(draw, x, y-24, 28, (233, 173, 74))
        for k in range(5):
            bx=130+k*165; by=198+18*math.sin(t*2+k)
            draw.ellipse((bx-5,by-5,bx+5,by+5), fill=(157,198,181))
    draw.rounded_rectangle((52, 474, 908, 480), radius=3, fill=mix(accent, scene['bg'], .82))
    draw.rounded_rectangle((52, 474, 52+max(6,856*t/DURATION), 480), radius=3, fill=accent)
    draw.text((52, 496), '12 SECOND MOTION LOOP', font=FONTS[16], fill=muted)
    draw.text((735, 496), 'RMP  /  VIDEO', font=FONTS[16], fill=muted)
    return image

def make_audio(scene, filename):
    rate=44100
    with wave.open(str(filename), 'wb') as out:
        out.setparams((1,2,rate,0,'NONE','not compressed'))
        audio=bytearray()
        for n in range(rate*DURATION):
            t=n/rate; age=t%1.5; note=int(t/1.5)
            frequency=scene['tone'] * [1,1.25,1.5,1.25][note%4]
            envelope=min(1,age/.025)*math.exp(-4.2*age)
            sample=(math.sin(math.tau*frequency*age)+.22*math.sin(math.tau*frequency*2*age))*.10*envelope
            audio.extend(struct.pack('<h', int(sample*32767)))
        out.writeframes(audio)

def main():
    if not shutil.which('ffmpeg'):
        raise SystemExit('FFmpeg is required')
    OUTPUT.mkdir(parents=True,exist_ok=True);ASSETS.mkdir(parents=True,exist_ok=True)
    entries=[]
    for index,scene in enumerate(SCENES):
        audio=OUTPUT/(scene['id']+'.wav');video=OUTPUT/(scene['id']+'.mp4')
        make_audio(scene,audio)
        command=['ffmpeg','-hide_banner','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{WIDTH}x{HEIGHT}','-r',str(FPS),'-i','pipe:0','-i',str(audio),'-t',str(DURATION),'-c:v','libx264','-profile:v','baseline','-level:v','3.1','-pix_fmt','yuv420p','-crf','25','-preset','medium','-g','60','-bf','0','-c:a','aac','-ar','44100','-ac','1','-b:a','48k','-movflags','+faststart',str(video)]
        process=subprocess.Popen(command,stdin=subprocess.PIPE)
        for frame in range(FPS*DURATION):
            process.stdin.write(render(scene,index,frame/FPS).tobytes())
        process.stdin.close()
        if process.wait():raise SystemExit('Video encoding failed')
        render(scene,index,.5).save(ASSETS/(scene['id']+'.jpg'),quality=92)
        payload=video.read_bytes();digest=hashlib.sha256(payload).hexdigest()[:12]
        entries.append(dict(id=scene['id'],title=scene['label'],filename=f'rmp-demo-{scene["id"]}-{digest}.mp4',poster=f'/assets/video/{scene["id"]}.jpg',duration=DURATION,bytes=len(payload),base64=base64.b64encode(payload).decode()))
        print(f'{scene["title"]}: {len(payload):,} bytes',flush=True)
    target=ASSETS/'clips.js'
    target.write_text('/** Generated demo media bytes. Rebuild with npm run examples:media; never enters library packages. */\nexport const demoClips = '+json.dumps(entries,ensure_ascii=False,indent=2)+';\n')
    subprocess.run(['node',str(ROOT/'node_modules/prettier/bin/prettier.cjs'),'--write',str(target)],check=True)
    (OUTPUT/'manifest.json').write_text(json.dumps([{k:v for k,v in e.items() if k!='base64'} for e in entries],ensure_ascii=False,indent=2))

if __name__=='__main__':main()

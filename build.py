#!/usr/bin/env python3
"""Build the game: join the source parts and embed the music samples.
Usage: python build.py [output.html]   (default: volley-gauntlet.html)"""
import base64, json, os
H = os.path.dirname(os.path.abspath(__file__))
PARTS = ['0_shell.html','1_core.js','2_data.js','3_sys.js','3b_boss.js','3c_set.js','5_meta.js','6_music.js','4b_bossart.js','4_ui.js']
src = ''.join(open(os.path.join(H,'src',p),encoding='utf-8').read() for p in PARTS)
def b64(p): return base64.b64encode(open(os.path.join(H,p),'rb').read()).decode()
# No embedded fonts: Nioret World's game policy asks for system fonts.
assert '/*FONTS*/' not in src
meta = json.load(open(os.path.join(H,'music/samples.json')))
samp = {k: b64('music/mp3/%s.mp3' % k) for k in meta}
assert src.count('/*SAMPLES*/{}')==1 and src.count('/*SMETA*/{}')==1
src = src.replace('/*SAMPLES*/{}', json.dumps(samp, separators=(',',':')))
src = src.replace('/*SMETA*/{}', json.dumps(meta, separators=(',',':')))
notice = open(os.path.join(H,'assets/NOTICES.txt'),encoding='utf-8').read()
head, sep, body = src.partition('</style>')
assert sep, 'shell must have a </style>'
# Nioret World only accepts a file that starts with <!doctype html> or <html>, so nothing may come before the doctype.
src = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n'
       '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
       '<!--\n' + notice.replace('--','- -') + '\n-->\n' + head + sep + '\n</head>\n<body>' + body + '\n</body>\n</html>\n')
assert src.lower().startswith('<!doctype html>')
import sys
out = os.path.join(H, sys.argv[1] if len(sys.argv) > 1 else 'volley-gauntlet.html')
open(out,'w',encoding='utf-8').write(src)
n = os.path.getsize(out)
print('wrote %s: %d bytes (%.2f MiB), limit 2 MiB %s' % (out, n, n/1048576, 'OK' if n < 2*1048576 else 'TOO BIG'))

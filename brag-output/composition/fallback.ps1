$ffmpeg = 'C:\Users\ASUS\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe'
$workspace = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$out = Split-Path -Parent $PSScriptRoot
$music = "$PSScriptRoot\assets\music\music.mp3"
$f = "[0:v]scale=-1:1920,crop=1080:1920:1260:0,trim=duration=4.4,setpts=PTS-STARTPTS[a];[1:v]scale=-1:1920,crop=1080:1920:980:0,trim=duration=4.7,setpts=PTS-STARTPTS[b];[2:v]scale=-1:1920,crop=1080:1920:1160:0,trim=duration=4.6,setpts=PTS-STARTPTS[c];[3:v]scale=-1:1920,crop=1080:1920:1130:0,trim=duration=3.8,setpts=PTS-STARTPTS[d];[4:v]scale=-1:1920,crop=1080:1920:1260:0,trim=duration=2.5,setpts=PTS-STARTPTS[e];[a][b][c][d][e]concat=n=5:v=1:a=0[v];[5:a]atrim=0:20,volume=0.34,afade=t=out:st=19:d=1[a]"
& $ffmpeg -y -loop 1 -i "$workspace\screenshots\dashboard.png" -loop 1 -i "$workspace\screenshots\analytics.png" -loop 1 -i "$workspace\screenshots\pricing.png" -loop 1 -i "$workspace\screenshots\ai-assistant.png" -loop 1 -i "$workspace\screenshots\dashboard.png" -i $music -filter_complex $f -map '[v]' -map '[a]' -t 20 -r 30 -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a aac -movflags +faststart "$out\brag.mp4"
& $ffmpeg -y -i "$out\brag.mp4" -ss 18 -frames:v 1 "$out\brag.jpg"
& $ffmpeg -y -i "$out\brag.mp4" -i "$out\brag.jpg" -filter_complex '[0:v][1:v]overlay=0:0:enable=eq(n\,0)[v]' -map '[v]' -map '0:a?' -c:v libx264 -crf 18 -pix_fmt yuv420p -c:a copy -movflags +faststart "$out\brag.poster.mp4"
Move-Item -Force "$out\brag.poster.mp4" "$out\brag.mp4"

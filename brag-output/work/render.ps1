$ErrorActionPreference = 'Stop'

$ffmpeg = 'C:\Users\ASUS\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe'
$font = 'C\:/Windows/Fonts/segoeuib.ttf'
$regularFont = 'C\:/Windows/Fonts/segoeui.ttf'

$filter = @"
[0:v]scale=960:430:force_original_aspect_ratio=decrease,pad=960:430:(ow-iw)/2:(oh-ih)/2:color=0x0f172a[ui0];
color=c=0x0b1220:s=1080x1920:d=3[bg0];[bg0][ui0]overlay=60:930,drawbox=x=60:y=930:w=960:h=430:color=0x38bdf8@0.45:t=3,drawtext=fontfile='$font':text='BIZNET':fontcolor=0x38bdf8:fontsize=32:x=60:y=180,drawtext=fontfile='$font':text='A clearer view':fontcolor=white:fontsize=78:x=60:y=250,drawtext=fontfile='$font':text='of your business.':fontcolor=white:fontsize=78:x=60:y=345,drawtext=fontfile='$regularFont':text='Business intelligence and operations in one workspace.':fontcolor=0xcbd5e1:fontsize=29:x=60:y=470,fade=t=out:st=2.7:d=0.3[s0];
[1:v]scale=960:430:force_original_aspect_ratio=decrease,pad=960:430:(ow-iw)/2:(oh-ih)/2:color=0x0f172a[ui1];
color=c=0x0b1220:s=1080x1920:d=3.5[bg1];[bg1][ui1]overlay=60:980,drawbox=x=60:y=980:w=960:h=430:color=0x38bdf8@0.45:t=3,drawtext=fontfile='$font':text='OPERATIONS, CONNECTED.':fontcolor=0x38bdf8:fontsize=30:x=60:y=180,drawtext=fontfile='$font':text='Sales. Stock.':fontcolor=white:fontsize=76:x=60:y=255,drawtext=fontfile='$font':text='Customers.':fontcolor=white:fontsize=76:x=60:y=345,drawtext=fontfile='$regularFont':text='One focused workspace for the work that moves your business.':fontcolor=0xcbd5e1:fontsize=27:x=60:y=470,fade=t=in:st=0:d=0.3,fade=t=out:st=3.2:d=0.3[s1];
[2:v]scale=960:430:force_original_aspect_ratio=decrease,pad=960:430:(ow-iw)/2:(oh-ih)/2:color=0x0f172a[ui2];
color=c=0x0b1220:s=1080x1920:d=4[bg2];[bg2][ui2]overlay=60:970,drawbox=x=60:y=970:w=960:h=430:color=0x38bdf8@0.45:t=3,drawtext=fontfile='$font':text='THE SIGNAL BEHIND THE NEXT MOVE.':fontcolor=0x38bdf8:fontsize=26:x=60:y=180,drawtext=fontfile='$font':text='See the numbers.':fontcolor=white:fontsize=72:x=60:y=250,drawtext=fontfile='$font':text='Then act on them.':fontcolor=white:fontsize=72:x=60:y=340,drawtext=fontfile='$regularFont':text='Revenue, margin, inventory health, and pricing experiments — in context.':fontcolor=0xcbd5e1:fontsize=25:x=60:y=470,fade=t=in:st=0:d=0.3,fade=t=out:st=3.7:d=0.3[s2];
[3:v]scale=960:430:force_original_aspect_ratio=decrease,pad=960:430:(ow-iw)/2:(oh-ih)/2:color=0x0f172a[ui3];
color=c=0x0b1220:s=1080x1920:d=2.5[bg3];[bg3][ui3]overlay=60:970,drawbox=x=60:y=970:w=960:h=430:color=0x38bdf8@0.45:t=3,drawtext=fontfile='$font':text='BUILT-IN BUSINESS GUIDANCE.':fontcolor=0x38bdf8:fontsize=28:x=60:y=190,drawtext=fontfile='$font':text='Ask. Understand. Act.':fontcolor=white:fontsize=61:x=60:y=275,drawtext=fontfile='$regularFont':text='Bring your operating questions to the AI Assistant.':fontcolor=0xcbd5e1:fontsize=27:x=60:y=385,fade=t=in:st=0:d=0.3,fade=t=out:st=2.2:d=0.3[s3];
[4:v]scale=960:430:force_original_aspect_ratio=decrease,pad=960:430:(ow-iw)/2:(oh-ih)/2:color=0x0f172a[ui4];
color=c=0x0b1220:s=1080x1920:d=2[bg4];[bg4][ui4]overlay=60:1010,drawbox=x=60:y=1010:w=960:h=430:color=0x38bdf8@0.45:t=3,drawtext=fontfile='$font':text='BizNet':fontcolor=white:fontsize=104:x=60:y=310,drawtext=fontfile='$regularFont':text='Business intelligence, in one focused workspace.':fontcolor=0xcbd5e1:fontsize=30:x=60:y=450,drawtext=fontfile='$regularFont':text='biznet-nine.vercel.app':fontcolor=0x38bdf8:fontsize=27:x=60:y=530,fade=t=in:st=0:d=0.3[s4];
[s0][s1][s2][s3][s4]concat=n=5:v=1:a=0[video]
"@ -replace "`r?`n", ''

$ffmpegArgs = @(
  '-y',
  '-loop', '1', '-t', '3', '-i', '..\..\screenshots\dashboard.png',
  '-loop', '1', '-t', '3.5', '-i', '..\..\screenshots\sales.png',
  '-loop', '1', '-t', '4', '-i', '..\..\screenshots\analytics.png',
  '-loop', '1', '-t', '2.5', '-i', '..\..\screenshots\ai-assistant.png',
  '-loop', '1', '-t', '2', '-i', '..\..\screenshots\dashboard.png',
  '-f', 'lavfi', '-t', '15', '-i', 'sine=frequency=110:sample_rate=48000',
  '-filter_complex', $filter,
  '-map', '[video]', '-map', '5:a',
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', '30',
  '-c:a', 'aac', '-b:a', '128k', '-af', 'volume=0.08,afade=t=out:st=14.5:d=0.5',
  '-shortest', '..\brag.mp4'
)

& $ffmpeg @ffmpegArgs
& $ffmpeg -y -i '..\brag.mp4' -frames:v 1 -q:v 2 '..\brag.jpg'

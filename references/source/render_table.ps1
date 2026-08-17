Add-Type -AssemblyName System.Drawing
$rows = @(
@('여포의 방천화극','고행자의 부채','각성 가네샤'),@('','뇌전의 염주','각성 뇌공'),@('','수도승의 봉','각성 하누만'),@('','부총병의 별운검','각성 오행기'),
@('노부츠나의 창','구암의 뇌전침','개량된 뇌전차'),@('','부총병의 별운검','각성 오행기'),@('','홍련의 거울','개량된 봉황비조'),
@('최무선의 화포','충무공의 대력궁','개량된 거북차'),@('','구암의 뇌전침','개량된 뇌전차'),@('','밀사의 목탁','각성 서산대사'),@('','광휘의 수포','개량된 불랑기포'),
@('치요메의 지팡이','닌자의 조도','각성 아즈미'),@('','추격자의 대검','각성 파쇄차'),@('','선봉장의 쌍검','각성 세쓰노카미'),@('','마오의 팔찌','각성 동방은아'),
@('초선의 부채','충무공의 대력궁','개량된 거북차'),@('','칠본창의 화승총','개량된 지진차'),@('','여전사의 사냥돌','각성 크라슈미'),
@('마조의 홀판','여전사의 사냥돌','각성 크라슈미'),@('','홍련의 거울','개량된 봉황비조'),@('','닌자의 조도','각성 아즈미'),@('','원시의 사모','개량된 화룡차'),
@('맹획의 도끼','밀사의 목탁','각성 서산대사'),@('','선인의 부적','개량된 발석거'),@('','설호의 방울','개량된 흑룡차'),
@('보쿠텐의 대도','침략자의 쌍검','각성 도라노스케'),@('','칠본창의 화승총','개량된 지진차'),@('','선봉장의 쌍검','각성 세쓰노카미'),@('','흑기군의 협객봉','각성 유민'),
@('홍길동의 봉','시호충장의 대력궁','각성 시호충장'),@('','충장의 검','각성 선무공신'),@('','설호의 방울','개량된 흑룡차'),@('','명사수의 석궁','각성 아르주나'),
@('주몽의 각궁','원시의 사모','개량된 화룡차'),@('','침략자의 쌍검','각성 도라노스케'),@('','광휘의 수포','개량된 불랑기포'),
@('화목란의 활','마오의 팔찌','각성 동방은아'),@('','고행자의 부채','각성 가네샤'),@('','선인의 부적','개량된 발석거'),@('','시호충장의 대력궁','각성 시호충장'),
@('만선야의 지팡이','흑기군의 협객봉','각성 유민'),@('','충장의 검','각성 선무공신'),@('','뇌전의 염주','각성 뇌공'),@('','구원자의 구슬','각성 라시야'),
@('바지라오의 검','시크교의 차크람','각성 구흐야카'),@('','추격자의 대검','각성 파쇄차'),@('','용병대장의 대검','각성 나라야나'),@('','암흑술사의 지팡이','각성 쿠베라마차'),
@('악바르의 지휘봉','수비대장의 화포','각성 슈크라'),@('','구원자의 구슬','각성 라시야'),@('','뱀조련사의 뱀 목줄','각성 난다데비'),@('','수도승의 봉','각성 하누만'),
@('레지나의 채찍','수비대장의 화포','각성 슈크라'),@('','명사수의 석궁','각성 아르주나'),@('','시크교의 차크람','각성 구흐야카'),@('','암흑술사의 지팡이','각성 쿠베라마차'))
$icons=Get-Content -Raw -Encoding UTF8 'work\item_icons\map.json'|ConvertFrom-Json
$w=1440;$margin=60;$titleH=125;$headH=64;$rowH=58;$h=$titleH+$headH+($rows.Count*$rowH)+90
$bmp=New-Object Drawing.Bitmap($w,$h);$g=[Drawing.Graphics]::FromImage($bmp);$g.SmoothingMode='AntiAlias';$g.TextRenderingHint='ClearTypeGridFit'
$g.Clear([Drawing.Color]::FromArgb(16,21,29));$white=[Drawing.Brushes]::White;$muted=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(178,188,202));$dark=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(37,48,68));$cell=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(250,251,252));$alt=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(241,244,247));$text=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(29,38,49));$owner=New-Object Drawing.SolidBrush([Drawing.Color]::FromArgb(68,84,105));$line=New-Object Drawing.Pen([Drawing.Color]::FromArgb(210,217,226),1)
$titleFont=New-Object Drawing.Font('Malgun Gothic',34,[Drawing.FontStyle]::Bold);$subFont=New-Object Drawing.Font('Malgun Gothic',15);$headFont=New-Object Drawing.Font('Malgun Gothic',18,[Drawing.FontStyle]::Bold);$bodyFont=New-Object Drawing.Font('Malgun Gothic',16);$ownerFont=New-Object Drawing.Font('Malgun Gothic',16,[Drawing.FontStyle]::Bold)
$g.DrawString('거상 전설장수 무기 하위 재료',$titleFont,$white,$margin,35);$g.DrawString('기본 무기·봉인된 힘의 조각 제외',$subFont,$muted,$margin,88)
$x1=$margin;$x2=470;$x3=920;$right=$w-$margin;$y=$titleH;$g.FillRectangle($dark,$x1,$y,$right-$x1,$headH)
$g.DrawString('전설장수 무기',$headFont,$white,$x1+22,$y+18);$g.DrawString('하위 장비',$headFont,$white,$x2+22,$y+18);$g.DrawString('장비 주인',$headFont,$white,$x3+22,$y+18)
$y += $headH;$last='';for($i=0;$i -lt $rows.Count;$i++){if($i%2 -eq 0){$g.FillRectangle($cell,$x1,$y,$right-$x1,$rowH)}else{$g.FillRectangle($alt,$x1,$y,$right-$x1,$rowH)};$weapon=$rows[$i][0];if($weapon){$last=$weapon;$wp=$icons.$weapon;if($wp){$im=[Drawing.Image]::FromFile((Resolve-Path $wp));$g.DrawImage($im,$x1+14,$y+7,44,44);$im.Dispose()};$g.DrawString($weapon,$ownerFont,$text,$x1+70,$y+16)};$item=$rows[$i][1];$ip=$icons.$item;if($ip){$im=[Drawing.Image]::FromFile((Resolve-Path $ip));$g.DrawImage($im,$x2+14,$y+7,44,44);$im.Dispose()};$g.DrawString($item,$bodyFont,$text,$x2+70,$y+16);$g.DrawString($rows[$i][2],$ownerFont,$owner,$x3+22,$y+16);$g.DrawLine($line,$x1,$y,$right,$y);$g.DrawLine($line,$x2,$y,$x2,$y+$rowH);$g.DrawLine($line,$x3,$y,$x3,$y+$rowH);$y+=$rowH}
$out='C:\Users\lwn11\Documents\Codex\2026-08-17\new-chat\outputs\거상_전설장수_무기_하위재료.png';[IO.Directory]::CreateDirectory([IO.Path]::GetDirectoryName($out))|Out-Null;$bmp.Save($out,[Drawing.Imaging.ImageFormat]::Png);$g.Dispose();$bmp.Dispose()

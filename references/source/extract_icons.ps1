$ErrorActionPreference='Stop'
$base='https://www.gersangjjang.com/item/'
$out='work\item_icons\png'; New-Item -ItemType Directory -Force -Path $out|Out-Null
$items=@{
'고행자의 부채'='고행자의부채';'뇌전의 염주'='뇌전의염주';'수도승의 봉'='수도승의지팡이';'부총병의 별운검'='조승훈의별운검';'구암의 뇌전침'='구암의뇌전침';'홍련의 거울'='홍련의거울';'충무공의 대력궁'='충무공의대력궁';'밀사의 목탁'='밀사의목탁';'광휘의 수포'='광휘의수포';'닌자의 조도'='닌자의조도';'추격자의 대검'='추격자의대검';'선봉장의 쌍검'='선봉장의쌍검';'마오의 팔찌'='마오의팔찌';'칠본창의 화승총'='칠본창의화승총';'여전사의 사냥돌'='여전사의사냥돌';'원시의 사모'='원시의사모';'선인의 부적'='선인의부적';'설호의 방울'='설호의방울';'침략자의 쌍검'='침략자의쌍검';'흑기군의 협객봉'='흑기군의협객봉';'시호충장의 대력궁'='시호충장의대력궁';'충장의 검'='충장의검';'명사수의 석궁'='명사수의석궁';'구원자의 구슬'='구원자의구슬';'시크교의 차크람'='시크교의차크람';'용병대장의 대검'='용병대장의대검';'암흑술사의 지팡이'='암흑술사의지팡이';'수비대장의 화포'='수비대장의화포';'뱀조련사의 뱀 목줄'='뱀조련사의뱀목줄'
}
$weapons=@{
'여포의 방천화극'='여포의방천화극';'노부츠나의 창'='노부츠나의창';'최무선의 화포'='최무선의화포';'치요메의 지팡이'='치요메의지팡이';'초선의 부채'='초선의부채';'마조의 홀판'='마조의홀판';'맹획의 도끼'='맹획의도끼';'보쿠텐의 대도'='보쿠텐의대도';'홍길동의 봉'='홍길동의봉';'주몽의 각궁'='주몽의각궁';'화목란의 활'='화목란의활';'만선야의 지팡이'='만선야의지팡이';'바지라오의 검'='바지라오의검';'악바르의 지휘봉'='악바르의지휘봉';'레지나의 채찍'='레지나의채찍'
}
$pages=Get-ChildItem 'work\item_icons\*.html'
function Find-Icon($needle){foreach($p in $pages){$lines=Get-Content -Encoding UTF8 $p.FullName;for($i=0;$i-lt$lines.Count;$i++){if((($lines[$i]-replace '\s+','').Contains($needle))){for($j=$i;$j-ge[Math]::Max(0,$i-8);$j--){$m=[regex]::Match($lines[$j],'<img[^>]+src=["'']([^"'']+)["'']');if($m.Success){$src=$m.Groups[1].Value;if($src-notmatch '^https?://'){$src=$base+$src};return $src}}}}};return $null}
$map=@{};$pages=Get-ChildItem 'work\item_icons\lower*.html';foreach($pair in $items.GetEnumerator()){$src=Find-Icon $pair.Value;if($src){$safe=($pair.Key-replace '[\\/:*?"<>| ]','_')+'.gif';Invoke-WebRequest -Uri $src -OutFile (Join-Path $out $safe);$map[$pair.Key]=(Join-Path $out $safe)}else{Write-Output ('MISS '+$pair.Key)}};$pages=Get-ChildItem 'work\item_icons\*.html'|Where-Object{$_.Name-notlike'lower*'};foreach($pair in $weapons.GetEnumerator()){$src=Find-Icon $pair.Value;if($src){$safe=($pair.Key-replace '[\\/:*?"<>| ]','_')+'.gif';Invoke-WebRequest -Uri $src -OutFile (Join-Path $out $safe);$map[$pair.Key]=(Join-Path $out $safe)}else{Write-Output ('MISS '+$pair.Key)}}
$map|ConvertTo-Json|Set-Content -Encoding UTF8 'work\item_icons\map.json'

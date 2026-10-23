function expression(n){
  if(n===0)return '도옹ㅠ';
  if(n<0)return 'ㅠ '+expression(-n);
  if(n<=10)return '도'+'오'.repeat(n-1)+'옹';
  for(let a=10;a>=2;a--)if(n%a===0)return expression(a)+' '+expression(n/a);
  return '도'+'오'.repeat(n-1)+'옹';
}
const output=(...ns)=>ns.map(n=>'뿡뿡 '+expression(n)+'~뿡뿡뿡~').join('');
const block=(label,...ns)=>'ㅋㅋ '+label+'\n'+output(...ns);
const wrap=a=>['나는 동현이냐?','',...a,'동현이구나',''].join('\n');
const reset=block('같은 시드로 실험을 초기화한다',1,7);
const wait=ms=>block('반응을 관찰한다',3,ms);
const hit=(type,power,position,label,hand=1)=>block(label,2,type,hand,power,position);
const examples=[
 {id:'jab',title:'01 · 잽 / 앞쪽 촉각',note:'짧은 잽으로 앞쪽을 건드린다. ALM·AVM 입력 뒤 후진 회로가 켜지고 몸이 움츠러드는 순서를 보자.',code:wrap([reset,hit(1,45,20,'잽 · 세기 45 · 앞쪽 20%'),wait(1600),hit(1,45,20,'같은 위치에 한 번 더'),wait(2000)])},
 {id:'uppercut',title:'02 · 어퍼컷 / 아래에서 위로',note:'왼손 글러브가 아래에서 올라온다. 앞·뒤 접촉 후 회로 출력과 선충의 밀림·꿈틀거림을 비교하자.',code:wrap([reset,hit(2,55,28,'왼손 어퍼컷 · 앞쪽',2),wait(1800),hit(2,55,78,'왼손으로 뒤쪽을 접촉',2),wait(2000)])},
 {id:'straight',title:'03 · 스트레이트 / 뒤쪽 촉각',note:'뒤쪽을 건드리면 PLM과 전진 회로가 우세해지는지 보자. 주먹 이름이 아니라 접촉 위치가 바뀐 실험이다.',code:wrap([reset,hit(3,50,80,'스트레이트 · 뒤쪽 80%'),wait(2000),hit(3,50,20,'같은 세기 · 앞쪽 20%'),wait(2000)])},
 {id:'hook',title:'04 · 훅 / 감각 출력을 막으면',note:'몸통 앞부분으로 내려오는 훅의 반응을 보고, 앞쪽 감각 뉴런의 출력을 막아 반복한다. 발은 버티고 글러브의 충격 표현은 남아도 회로 출력은 작아지는지 관찰하자.',code:wrap([reset,hit(4,45,45,'몸통 앞부분 훅 · 위치 45%'),wait(1800),block('앞쪽 촉각 뉴런 출력 차단',4,1,1),hit(4,45,45,'같은 훅을 반복'),wait(1800),block('앞쪽 촉각 출력 복원',4,1,0)])},
 {id:'body',title:'05 · 바디블로우 / 몸 중간',note:'몸 중간을 약하게, 다음에는 더 세게 건드린다. 높은 세기에서 추가되는 PVD 계열 입력은 임계값을 둔 단순화이며 실제 힘 단위가 아니다.',code:wrap([reset,hit(5,40,58,'몸 중간 · 약한 접촉'),wait(1800),hit(5,85,58,'같은 자리 · 높은 접촉 세기'),wait(2200)])},
 {id:'swing',title:'06 · 스윙 / 반복과 회복',note:'큰 궤적의 스윙을 연속해서 시행한 뒤 쉬었다가 반복한다. 회로 입력의 회복은 이 앱의 적응 모델이며 학습이나 실제 습관화를 입증하지 않는다.',code:wrap([reset,hit(6,48,22,'첫 스윙'),hit(6,48,22,'곧바로 두 번째 스윙'),wait(3500),hit(6,48,22,'쉬었다가 세 번째 스윙'),wait(2000)])},
 {id:'overhand',title:'07 · 오버핸드 / 위에서 아래로',note:'앞쪽의 가벼운 접촉과 높은 세기를 비교한다. 높은 세기에서는 FLP 계열도 활성화되지만 통증·손상·기절을 판정하는 모델은 아니다.',code:wrap([reset,hit(7,40,12,'가벼운 오버핸드'),wait(2000),hit(7,88,12,'높은 세기의 오버핸드'),wait(2200)])},
 {id:'shovel',title:'08 · 쇼벨 훅 / MEC-4 입력 계수',note:'MEC-4 관련 촉각 입력 계수를 0으로 둔 대조와 복원을 비교한다. 유전자를 편집하는 기능이나 실제 돌연변이의 완전한 재현은 아니다.',code:wrap([reset,block('MEC-4 관련 입력 계수 0%',5,0),hit(8,45,22,'입력 계수를 낮춘 쇼벨 훅'),wait(1800),block('입력 계수 100% 복원',5,100),hit(8,45,22,'같은 쇼벨 훅'),wait(2200)])},
 {id:'onetwo',title:'09 · 연속기 / 오른잽·왼어퍼',note:'오른손 잽 → 왼손 어퍼컷 → 오른손 스트레이트 → 왼손 바디블로우. 첫 반응을 읽고, 양손 기술을 이어서 강한 과장 효과와 신경 출력을 함께 관찰한다.',code:wrap([reset,hit(1,48,20,'오른손 잽',1),block('후진 회로를 입력 큐로',6,4),'ㅋㅋ 꽥꽥으로 관측값을 읽고 기록한다\n동현아 꽥꽥\n'+output(7)+'뿡뿡 동현~뿡뿡뿡~',hit(2,68,30,'왼손 어퍼컷',2),hit(3,72,78,'오른손 스트레이트',1),hit(5,88,58,'왼손 바디블로우',2),wait(2600)])},
 {id:'blank',title:'20 · 빈 코드 / 직접 작성',note:'시작·끝 선언만 있는 빈 코드다. 시간도 흐르지 않고 접촉도 없다. 그 사이에 나만의 동현랭 연속기를 써 보자.',code:wrap([])}
];
const comboSpecs=[
 ['one-two','원투 / 잽 → 스트레이트',[[1,1,40,22],[3,2,65,22]]],
 ['double-jab','더블 잽 → 스트레이트',[[1,1,35,20],[1,1,40,20],[3,2,70,20]]],
 ['jab-upper','잽 → 반대손 어퍼컷',[[1,1,42,25],[2,2,68,25]]],
 ['jab-cross-hook','잽 → 스트레이트 → 훅',[[1,1,38,22],[3,2,60,22],[4,1,70,22]]],
 ['body-head','아래에서 위로 / 바디 → 훅',[[5,2,55,70],[4,1,65,22],[3,2,72,22]]],
 ['upper-hook-cross','어퍼컷 → 훅 → 스트레이트',[[2,2,60,35],[4,1,64,25],[3,2,74,25]]],
 ['double-hook','더블 훅 / 몸통 → 앞쪽',[[4,1,50,62],[4,1,66,22],[2,2,70,30]]],
 ['overhand-body','잽 → 오버핸드 → 바디',[[1,1,40,20],[7,2,75,18],[5,1,65,66]]],
 ['shovel-finish','바디 → 쇼벨 훅 → 어퍼컷',[[5,2,52,65],[8,1,65,42],[2,2,78,30]]],
 ['eight-punch','8연타 / 여덟 가지 궤적',[[1,1,35,25],[3,2,48,25],[4,1,55,25],[2,2,60,30],[5,1,65,66],[6,2,68,35],[7,1,72,20],[8,2,75,45]]]
];
examples.splice(9,0,...comboSpecs.map(([id,title,moves],i)=>({
  id,title:String(i+10).padStart(2,'0')+' · '+title,
  note:'양손·표적 높이를 바꾸며 기술을 이어 쓴다. 직선 잽, 위로 솟는 어퍼컷, 원호를 그리는 훅을 구별하고 확대된 신경 반응을 관찰하자.',
  code:wrap([reset,...moves.map(([type,hand,power,position])=>hit(type,power,position,(hand===1?'오른손':'왼손')+' · 기술 '+type+' · 세기 '+power+' · 위치 '+position+'%',hand)),wait(2400)])
})));
const punches={
  1:{name:'잽',duration:820,contact:.53,window:.12},
  2:{name:'어퍼컷',duration:1050,contact:.6,window:.13},
  3:{name:'스트레이트',duration:950,contact:.57,window:.13},
  4:{name:'훅',duration:1050,contact:.58,window:.14},
  5:{name:'바디블로우',duration:1100,contact:.6,window:.15},
  6:{name:'스윙',duration:1350,contact:.64,window:.16},
  7:{name:'오버핸드',duration:1180,contact:.61,window:.14},
  8:{name:'쇼벨 훅',duration:1080,contact:.6,window:.14}
};
if(typeof module!=='undefined')module.exports={examples,punches,expression};

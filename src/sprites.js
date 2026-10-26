// Hand-placed pixel artwork: 1 cell = 1 layer pixel = 2 canvas units, 95% of v0.3.
// v0.6: round buns, a small bow between them, an H-line mini skirt and big red sneakers.
// Lean, stretch, after-images and sparkle exaggerate the punch on screen only.
// Elastic arms alone bridge the distance to the specimen. No simulation input here.
const spriteLayer=document.createElement('canvas');spriteLayer.width=320;spriteLayer.height=240;
const spriteContext=spriteLayer.getContext('2d');
const GIRL_ROWS=["............................", "....ooo..............ooo....", "...oHHHo............oHHHo...", "..oHhHHHo..oooooo..oHhHHHo..", "..oHhHHHo.oHHHHHHo.oHhHHHo..", "..oHHHHHooHHhhHBqHqoHHHHHo..", "...oHHHooHhhHHHBBkBBoHHHo...", "....ooooHHHHHHHrHHHroooo....", "......oHHHHHHHHHHHHHHo......", ".....oHHHHHHHHHHHHHHHHo.....", ".....oHHHHHHHHHHHHHHHHo.....", "....oHHHHHHHHHHHHHHHHHHo....", "....oHHHsssHHHssssHHHHHo....", "....oHsswesssswessssHHHo....", ".....osseesssseessssHHo.....", ".....oHseesssseessssHHo.....", ".....obbssssssssbbssHHo.....", "......ossssmmssssssHHo......", ".......osssssssssssHo.......", "........ossssssssHHo........", ".........ooHsssHHoo.........", "...........osssso...........", "..........oossssoo..........", ".........oDccccccDo.........", ".........oDDDccDDDo.........", ".........oDDDDDDDDo.........", ".........oDDDDDDDDo.........", ".........oDDDDDDDDo.........", ".........oDDDDDDDDo.........", "........oDyyyyyyyyyo........", "........oDDDDDDDDDDo........", "........oDDdDDDDdDDo........", "........oDDdDDDDdDDo........", "........oDDdDDDDdDDo........", "........oDDdDDDDdDDo........", ".........ossoooosso.........", ".........osso..osso.........", ".........osso..osso.........", ".........osso..osso.........", ".........osso..osso.........", ".........osso..osso.........", ".......ooRLLRooRLLRoo.......", "......orRRRRRoorRRRRRo......", "......oWWWWWWooWWWWWWWo.....", ".......ooooooo.ooooooo......"];
const GLOVE_ROWS=["...oooooo....", ".ooLLLLFFoooo", "oFLLFFFFFKoCo", "oFKKKFFFFKoCo", "oFFFFFFFFKoCo", "oFFFFFFFFKoCo", ".oFFFFFFKKoCo", "..oKKKKKKoooo", "...oooooo...."];
const GIRL_COLORS={o:'#63483a',H:'#4b382e',h:'#775242',s:'#efc7a6',e:'#49392f',w:'#fbf4db',b:'#dc9c83',m:'#a87362',c:'#f5ead1',D:'#d48a78',d:'#ad6e62',y:'#edc776',S:'#f4e8cd',R:'#cf6157',r:'#a64b44',L:'#f4e8cd',W:'#f4e8cd',B:'#cf6157',k:'#a64b44',q:'#ef9a8b'};
function pixelCanvas(rows,colors,x0=0,y0=0,w=rows[0].length-x0,h=rows.length-y0){
  const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');
  for(let r=0;r<h;r++)for(let k=0;k<w;k++){const color=colors[rows[y0+r]?.[x0+k]];if(color){g.fillStyle=color;g.fillRect(k,r,1,1);}}
  return c;
}
const girlParts={upper:pixelCanvas(GIRL_ROWS,GIRL_COLORS,0,0,28,29),skirt:pixelCanvas(GIRL_ROWS,GIRL_COLORS,0,29,28,6),
  legFront:pixelCanvas(GIRL_ROWS,GIRL_COLORS,0,35,14,10),legBack:pixelCanvas(GIRL_ROWS,GIRL_COLORS,14,35,14,10)};
const gloveSprites=['#d98072','#dea47f'].map(F=>pixelCanvas(GLOVE_ROWS,{o:'#63483a',F,L:'#f5c4ab',K:'#b86b5d',C:'#f4e7ce'}));
function drawPixelGirl(main,s,punches,wormPoint,glovePath){
  const g=spriteContext;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,320,240);g.imageSmoothingEnabled=false;
  const a=s.action,t=a?.progress||0,active=!!a&&t<1,type=a?.type||1,env=active?Math.sin(Math.PI*t)**2:0;
  const drive=active&&type===3?(t<.22?t/.22:t<.87?1:(1-t)/.13):0,K=.95,ground=351;
  const cx=352-(type===4?0:type===3?10*drive:type===6?9*env:4*env),crouch=([2,5,8].includes(type)?(type===2?7:type===5?9:4):1)*env;
  const contact=punches[type].contact,hand=(a?.hand||1)-1,ink='#63483a',skin='#efc7a6';
  // Wind back, then throw the shoulders toward the target and settle again.
  let lean=0;
  if(active){
    if(t<.22)lean=-1.6*smooth(t/.22);
    else if(t<contact)lean=mix(-1.6,3.2,smooth((t-.22)/Math.max(.01,contact-.22)));
    else lean=3.2*Math.pow(Math.max(0,1-(t-contact)/Math.max(.01,1-contact)),1.4);
  }
  const P=v=>Math.round(v),bx=P(cx/2)-14,top=P(ground/2)-44,dy=P(crouch*K/2),lx=P(lean),step=type===4?0:P(env*2.4);
  const sc=p=>({x:cx+(p.x-cx)*K,y:ground+(p.y-ground)*K});
  const sy=306+crouch,shoulders=[{x:cx-5,y:sy},{x:cx+5,y:sy}].map(sc).map(p=>({x:p.x-lx*2,y:p.y}));
  const rest=[{x:cx-23,y:sy-5},{x:cx-7,y:sy-9}].map(sc).map(p=>({x:p.x-lx*2,y:p.y}));
  const at=wormPoint(a?.position??.2,s),target={x:at.x+at.r+7,y:at.y};
  const ends=rest.map((p,i)=>active&&i===hand?glovePath(type,t,p,target,contact):p);
  const brush=(pts,size,color)=>{g.fillStyle=color;for(let i=1;i<pts.length;i++){const p=pts[i-1],q=pts[i],n=Math.max(1,Math.ceil(Math.hypot(q.x-p.x,q.y-p.y)/2));
    for(let j=0;j<=n;j++){const x=mix(p.x,q.x,j/n)/2,y=mix(p.y,q.y,j/n)/2;g.fillRect(P(x-size/2),P(y-size/2),size,size);}}};
  function glove(index,end,strike,alpha=1,ghost=false){
    const rotation=strike&&[2,8].includes(type)?Math.PI/2:strike&&[4,7].includes(type)?-.55:0;
    const linger=[3,4,5].includes(type)&&t>contact&&t<.85;
    const swell=strike&&!ghost?1+1.15*(linger?1:Math.exp(-Math.pow((t-contact)/(type===1?.09:.16),2))):1;
    let stretch=1,angle=0;
    if(strike&&t>.22&&t<contact){const p=glovePath(type,Math.max(0,t-.03),rest[index],target,contact),speed=Math.hypot(end.x-p.x,end.y-p.y);
      angle=Math.atan2(end.y-p.y,end.x-p.x);stretch=1+Math.min(.42,speed/120);} // Stretch along the flight.
    else if(strike&&t>=contact&&t<contact+.05)stretch=.82; // A brief squash on contact.
    g.save();g.globalAlpha=alpha;g.translate(end.x/2,end.y/2);g.rotate(angle);g.scale(stretch,1/Math.sqrt(stretch));g.rotate(rotation-angle);g.scale(swell*K,swell*K);
    g.drawImage(gloveSprites[index],-6.5,-4.5);g.restore();
  }
  function arm(index){
    const start=shoulders[index],end=ends[index],strike=active&&index===hand;
    let elbow=sc({x:cx+(index?8:-9),y:sy+12});elbow.x-=lx*2;
    if(strike){
      const extension=Math.min(1,Math.hypot(end.x-rest[index].x,end.y-rest[index].y)/40),d=Math.hypot(end.x-start.x,end.y-start.y);
      let pose;
      if([1,3].includes(type))pose={x:end.x+Math.min(72,d*.43),y:end.y+2}; // Straight forearm.
      else if(type===5)pose={x:end.x+Math.min(45,d*.4),y:end.y+20};
      else if([2,8].includes(type))pose={x:end.x+10,y:end.y+Math.min(66,d*.45)}; // Fist above elbow.
      else if(type===7)pose={x:end.x+30,y:end.y-52}; // Overhand drops from above.
      else{
        const bend=type===4?.5:.12,dx=end.x-start.x,dy=end.y-start.y;
        pose={x:(start.x+end.x)/2-dy*bend,y:(start.y+end.y)/2+dx*bend};
      } // Hook keeps a 90-degree elbow; swing uses a wider, straighter arm.
      elbow={x:elbow.x+(pose.x-elbow.x)*extension,y:elbow.y+(pose.y-elbow.y)*extension};
    }
    brush([start,elbow,end],4,ink);brush([start,elbow,end],2,skin);
    glove(index,end,strike);
  }
  // Legs stay planted; the front foot steps in and the upper body leans into the punch.
  g.drawImage(girlParts.legFront,bx-step,top+35);g.drawImage(girlParts.legBack,bx+14,top+35);
  arm(1);
  g.drawImage(girlParts.upper,bx-lx,top+dy);g.drawImage(girlParts.skirt,bx-P(lean/2),top+29);
  const face=(c,r,color,w=1,h=1)=>{g.fillStyle=color;g.fillRect(bx-lx+c,top+dy+r,w,h);};
  const expression=()=>{
    if(active&&Math.abs(t-contact)<.07){ // Effort face: > <
      face(8,13,skin,2,3);face(14,13,skin,2,3);
      for(const [c,r]of [[8,13],[9,14],[8,15],[15,13],[14,14],[15,15]])face(c,r,'#49392f');
    }
    if(active&&t>.18&&t<contact+.12){face(11,17,'#a87362',2,2);face(11,18,'#7d5546',2,1);} // Small shout.
  };
  expression();
  arm(0);if(active&&hand===1)arm(1);
  if(!active||hand===0){g.drawImage(girlParts.upper,bx-lx,top+dy);g.drawImage(girlParts.skirt,bx-P(lean/2),top+29);expression();} // Ready pose and right-hand punch: the far right arm stays behind her head and body.
  // After-images and short speed lines show the direction without becoming a control.
  if(active&&t>.24&&t<contact+.1){
    if(t<contact)for(let i=3;i>=1;i--){const u=t-i*.035;if(u<.22)continue;glove(hand,glovePath(type,u,rest[hand],target,contact),true,.34-i*.08,true);}
    for(let i=0;i<4;i++){const u=t-.1+i*.025,v=u+.025;if(u<.22)continue;
      const p=glovePath(type,u,rest[hand],target,contact),q=glovePath(type,v,rest[hand],target,contact);
      brush([p,q],1+(i>1),`rgba(179,119,55,${.25+i*.16})`);
      if(i>1){const n=Math.hypot(q.x-p.x,q.y-p.y)||1,ox=-(q.y-p.y)/n*14,oy=(q.x-p.x)/n*14,line=`rgba(179,119,55,${.12+i*.08})`;
        brush([{x:p.x+ox,y:p.y+oy},{x:q.x+ox,y:q.y+oy}],1,line);brush([{x:p.x-ox,y:p.y-oy},{x:q.x-ox,y:q.y-oy}],1,line);}
    }
  }
  // A small pixel sparkle at the moment of contact.
  if(active&&t>=contact&&t<contact+.09){
    const e=ends[hand],age=(t-contact)/.09,r=P(3+age*5),x=P(e.x/2-7),y=P(e.y/2);
    g.globalAlpha=1-age*.7;g.fillStyle='#edc776';
    for(let i=2;i<=r;i++){g.fillRect(x-i,y,1,1);g.fillRect(x,y-i,1,1);g.fillRect(x,y+i,1,1);}
    for(let i=2;i<=P(r*.6);i++){g.fillRect(x-i,y-i,1,1);g.fillRect(x-i,y+i,1,1);}
    g.fillStyle='#fff3c4';g.fillRect(x-1,y-1,2,2);g.globalAlpha=1;
  }
  if(!active||hand===0){ // Ready pose and right-hand punch: the left arm stays folded against the chest, nearest to us, so it is drawn last and never covered.
    const fold=q=>{const v=sc(q);return {x:v.x-lx*2,y:v.y};},start=shoulders[1],elbow=fold({x:cx-1,y:sy+15}),end=fold({x:cx-13,y:sy+4});
    brush([start,elbow,end],4,ink);brush([start,elbow,end],2,skin);glove(1,end,false);
  }
  main.save();main.imageSmoothingEnabled=false;main.drawImage(spriteLayer,0,0,640,480);main.restore();
}

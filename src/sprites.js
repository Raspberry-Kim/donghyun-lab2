// Original chibi pixel artwork. Body 25%, head 62%, gloves 70% of v0.1.
// Elastic arms alone bridge the distance to the specimen. No simulation input here.
const spriteLayer=document.createElement('canvas');spriteLayer.width=320;spriteLayer.height=240;
const spriteContext=spriteLayer.getContext('2d');
function drawPixelGirl(main,s,punches,wormPoint,glovePath){
  const g=spriteContext;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,320,240);g.setTransform(.5,0,0,.5,0,0);g.imageSmoothingEnabled=false;
  const a=s.action,t=a?.progress||0,active=!!a&&t<1,type=a?.type||1,env=active?Math.sin(Math.PI*t)**2:0;
  const drive=active&&type===3?(t<.22?t/.22:t<.87?1:(1-t)/.13):0;
  const cx=352-(type===4?0:type===3?10*drive:type===6?9*env:4*env),crouch=([2,5,8].includes(type)?(type===2?7:type===5?9:4):1)*env,sy=306+crouch,hy=282+crouch;
  const ink='#63483a',hair='#4b382e',skin='#efc7a6',dress='#d48a78';
  const poly=(pts,fill,stroke=ink,w=2)=>{g.beginPath();pts.forEach((p,i)=>i?g.lineTo(...p):g.moveTo(...p));g.closePath();g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=w;g.lineJoin='miter';g.stroke();}};
  const rect=(x,y,w,h,color)=>{g.fillStyle=color;g.fillRect(Math.round(x/2)*2,Math.round(y/2)*2,w,h);};
  const shoulders=[{x:cx-5,y:sy},{x:cx+5,y:sy}],rest=[{x:cx-23,y:sy-5},{x:cx-7,y:sy-9}],hand=(a?.hand||1)-1;
  const at=wormPoint(a?.position??.2,s),target={x:at.x+at.r+7,y:at.y};
  const ends=rest.map((p,i)=>active&&i===hand?glovePath(type,t,p,target,punches[type].contact):p);
  function arm(index){
    const start=shoulders[index],end=ends[index],strike=active&&index===hand;
    let elbow={x:cx+(index?8:-9),y:sy+12};
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
    g.lineJoin='round';g.lineCap='round';g.strokeStyle=ink;g.lineWidth=7;g.beginPath();g.moveTo(start.x,start.y);g.lineTo(elbow.x,elbow.y);g.lineTo(end.x,end.y);g.stroke();g.strokeStyle=skin;g.lineWidth=4;g.stroke();
    const rotation=strike&&[2,8].includes(type)?Math.PI/2:strike&&[4,7].includes(type)?-.55:0;
    g.save();g.translate(end.x,end.y);g.rotate(rotation);
    const contact=punches[type].contact,linger=[3,4,5].includes(type)&&t>contact&&t<.85;
    const swell=strike?1+1.15*(linger?1:Math.exp(-Math.pow((t-contact)/(type===1?.09:.16),2))):1;
    g.scale(swell,swell);
    poly([[-10,-8],[5,-8],[10,-4],[10,5],[5,9],[-9,9],[-12,4],[-12,-4]],index===0?'#d98072':'#dea47f');
    rect(-9,-6,10,3,'#f5c4ab');rect(7,-3,3,8,'#b86b5d');rect(10,-5,5,11,'#f4e7ce');g.restore();
  }
  // Leg and dress dimensions are one quarter of the original.
  for(const [side,x]of [[-1,cx-9-(type===4?0:env*3)],[1,cx+9]]){
    g.strokeStyle=ink;g.lineWidth=5;g.beginPath();g.moveTo(cx+side*4,326);g.lineTo(x+side*2,339);g.lineTo(x,349);g.stroke();g.strokeStyle=skin;g.lineWidth=3;g.stroke();
    poly([[x-5,347],[x+3,347],[x+5,351],[x-6,351]],'#f4e8cd');
  }
  arm(1);
  poly([[cx-6,304+crouch],[cx+6,304+crouch],[cx+6,315],[cx+10,329],[cx+7,332],[cx-9,332],[cx-11,329],[cx-6,315]],dress);
  rect(cx-6,316,12,2,'#edc776');rect(cx-6,322,2,8,'#ad6e62');rect(cx+4,323,2,7,'#ad6e62');
  rect(cx-3,298+crouch,6,8,skin);poly([[cx-5,306+crouch],[cx,310+crouch],[cx+3,306+crouch]],'#f5ead1',null);
  const bun=(x,y)=>{rect(x-8,y-6,18,14,hair);rect(x-5,y-9,12,20,hair);rect(x-5,y-6,8,4,'#775242');};
  bun(cx-18,hy-16);bun(cx+18,hy-16);
  poly([[cx-15,hy-12],[cx-10,hy-17],[cx+10,hy-17],[cx+15,hy-12],[cx+15,hy+10],[cx+10,hy+15],[cx-10,hy+15],[cx-15,hy+10]],hair);
  poly([[cx-12,hy-5],[cx-7,hy-10],[cx+10,hy-7],[cx+12,hy-2],[cx+12,hy+8],[cx+7,hy+13],[cx-7,hy+13],[cx-12,hy+8]],skin,null);
  rect(cx-12,hy-10,22,5,hair);rect(cx-12,hy-5,5,8,hair);rect(cx-2,hy-8,5,8,hair);rect(cx+10,hy-8,5,12,hair);
  rect(cx-7,hy+3,3,5,'#49392f');rect(cx+3,hy+3,3,5,'#49392f');rect(cx-7,hy+3,2,2,'#fbf4db');
  rect(cx-12,hy+8,5,3,'#dc9c83');rect(cx+7,hy+8,5,3,'#dc9c83');rect(cx-1,hy+9,3,2,'#a87362');
  arm(0);if(active&&hand===1)arm(1);
  // A short trajectory tail differentiates direction without becoming a control.
  if(active&&t>.24&&t<punches[type].contact+.1){
    const spec=punches[type];g.save();g.lineCap='round';
    for(let i=0;i<4;i++){const u=t-.1+i*.025,v=u+.025;if(u<.22)continue;
      const p=glovePath(type,u,rest[hand],target,spec.contact),q=glovePath(type,v,rest[hand],target,spec.contact);
      g.strokeStyle=`rgba(179,119,55,${.25+i*.16})`;g.lineWidth=3+i;g.beginPath();g.moveTo(p.x,p.y);g.lineTo(q.x,q.y);g.stroke();
    }g.restore();
  }
  main.save();main.imageSmoothingEnabled=false;main.drawImage(spriteLayer,0,0,640,480);main.restore();
}

'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';

function Core({risk}:{risk:string}){
  const ref=useRef<THREE.Mesh>(null);
  const material=useMemo(()=>new THREE.ShaderMaterial({
    transparent:true,
    uniforms:{uTime:{value:0},uRisk:{value:risk==='prohibited-review'?1:risk==='high-risk-candidate'?.7:risk==='transparency'?.45:.18}},
    vertexShader:`varying vec3 vN;varying vec3 vP;uniform float uTime;void main(){vN=normal;vec3 p=position;float w=sin(p.y*4.0+uTime)*0.06+cos(p.x*3.0-uTime*.8)*0.04+sin((p.x+p.z)*5.0+uTime*.55)*.025;p+=normal*w;vP=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec3 vN;varying vec3 vP;uniform float uTime;uniform float uRisk;void main(){float fres=pow(1.0-abs(dot(normalize(vN),vec3(0.,0.,1.))),2.0);float band=.5+.5*sin(vP.y*7.0+uTime*1.3);float scan=.5+.5*cos((vP.x-vP.z)*5.0-uTime*.8);vec3 safe=vec3(.05,.95,.65),warn=vec3(1.,.46,.32),violet=vec3(.42,.34,1.);vec3 base=mix(mix(safe,violet,.35),warn,uRisk);vec3 c=base*(.36+band*.38+scan*.12)+fres*.65;gl_FragColor=vec4(c,.97);}`
  }),[risk]);
  useEffect(()=>()=>material.dispose(),[material]);
  useFrame(({clock})=>{material.uniforms.uTime.value=clock.getElapsedTime();if(ref.current){ref.current.rotation.y+=.004;ref.current.rotation.x=Math.sin(clock.getElapsedTime()*.35)*.08}});
  return <mesh ref={ref}><icosahedronGeometry args={[1.08,6]}/><primitive object={material} attach="material"/></mesh>
}

function OrbitNode({position,index}:{position:[number,number,number];index:number}){
  const ref=useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{if(ref.current){const t=clock.getElapsedTime();ref.current.scale.setScalar(1+Math.sin(t*1.35+index)*.11);ref.current.position.z=Math.sin(t*.65+index)*.08}});
  return <group position={position}><mesh ref={ref}><sphereGeometry args={[.14,24,24]}/><meshStandardMaterial color="#d8ffef" emissive={index%2?'#8f7cff':'#31e6a1'} emissiveIntensity={1.8}/></mesh><mesh scale={2.1}><sphereGeometry args={[.14,16,16]}/><meshBasicMaterial color={index%2?'#8f7cff':'#31e6a1'} transparent opacity={.08}/></mesh></group>
}

const labels=['Owner','Vendor','Model','Controls','Evidence','Approval','Value'];
const nodes:[number,number,number][]=[[2.15,0,0],[1.3,1.7,0],[-.8,2.05,0],[-2.1,.5,0],[-1.6,-1.45,0],[.8,-2.0,0],[2.0,-.8,0]];

function Network(){
 const group=useRef<THREE.Group>(null);
 const lineGeometry=useMemo(()=>{
   const pts:number[]=[];
   nodes.forEach((p,i)=>{const n=nodes[(i+1)%nodes.length];pts.push(0,0,0,...p,...p,...n)});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;
 },[]);
 const particles=useMemo(()=>{
   const arr=new Float32Array(75*3);
   for(let i=0;i<75;i++){const r=2.6+Math.random()*1.6;const a=Math.random()*Math.PI*2;const y=(Math.random()-.5)*4.6;arr[i*3]=Math.cos(a)*r;arr[i*3+1]=y;arr[i*3+2]=Math.sin(a)*r*.55}
   return arr;
 },[]);
 useEffect(()=>()=>lineGeometry.dispose(),[lineGeometry]);
 useFrame(({clock,pointer})=>{if(group.current){group.current.rotation.y=clock.getElapsedTime()*.055+pointer.x*.12;group.current.rotation.x=pointer.y*-.08}});
 return <group ref={group}>
   <lineSegments geometry={lineGeometry}><lineBasicMaterial color="#63f3bb" transparent opacity={.16}/></lineSegments>
   <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial size={.025} color="#b8ffe4" transparent opacity={.45} sizeAttenuation/></points>
   <Core risk="minimal"/>
   {nodes.map((p,i)=><OrbitNode key={labels[i]} position={p} index={i}/>)}
 </group>
}

function Scene({risk}:{risk:string}){
 const group=useRef<THREE.Group>(null);
 useFrame(({clock,pointer})=>{if(group.current){group.current.rotation.y=pointer.x*.11+Math.sin(clock.getElapsedTime()*.18)*.025;group.current.rotation.x=-pointer.y*.07}});
 return <group ref={group}><Core risk={risk}/><NetworkNodes/></group>
}

function NetworkNodes(){
 const lineGeometry=useMemo(()=>{
   const pts:number[]=[];
   nodes.forEach((p,i)=>{const n=nodes[(i+1)%nodes.length];pts.push(0,0,0,...p,...p,...n)});
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));return g;
 },[]);
 const particles=useMemo(()=>{
   const arr=new Float32Array(80*3);
   for(let i=0;i<80;i++){const r=2.5+Math.random()*1.7;const a=Math.random()*Math.PI*2;arr[i*3]=Math.cos(a)*r;arr[i*3+1]=(Math.random()-.5)*4.8;arr[i*3+2]=Math.sin(a)*r*.45}
   return arr;
 },[]);
 useEffect(()=>()=>lineGeometry.dispose(),[lineGeometry]);
 return <>
  <lineSegments geometry={lineGeometry}><lineBasicMaterial color="#63f3bb" transparent opacity={.15}/></lineSegments>
  <points><bufferGeometry><bufferAttribute attach="attributes-position" args={[particles,3]}/></bufferGeometry><pointsMaterial size={.026} color="#b8ffe4" transparent opacity={.48} sizeAttenuation/></points>
  {nodes.map((p,i)=><OrbitNode key={labels[i]} position={p} index={i}/>)}
 </>
}

export function EvidenceScene({risk='minimal'}:{risk?:string}){
  const [mode,setMode]=useState<'checking'|'webgl'|'fallback'>('checking');
  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
    setMode(!reduced&&gl?'webgl':'fallback');
  },[]);
  if(mode!=='webgl')return <div className="scene-shell scene-fallback" aria-label="Evidence graph static fallback"><div className={`fallback-core ${risk}`}>policy</div><div className="scene-legend">{labels.map(x=><span key={x}>{x}</span>)}</div><div className="scene-label">evidence graph · static accessible mode</div></div>;
  return <div className="scene-shell" aria-label="Interactive evidence graph visualization"><Canvas camera={{position:[0,0,6.2],fov:42}} dpr={[1,1.5]}><fog attach="fog" args={['#07100e',5.5,9]}/><ambientLight intensity={.62}/><pointLight position={[3,4,5]} intensity={9}/><pointLight position={[-4,-2,3]} intensity={4} color="#8f7cff"/><Scene risk={risk}/></Canvas><div className="scene-legend">{labels.map(x=><span key={x}>{x}</span>)}</div><div className="scene-label">drag your pointer · evidence graph · policy core</div></div>
}

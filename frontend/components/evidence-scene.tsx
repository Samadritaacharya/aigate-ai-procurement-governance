'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';

function Core({risk}:{risk:string}){
  const ref=useRef<THREE.Mesh>(null);
  const material=useMemo(()=>new THREE.ShaderMaterial({
    transparent:true,
    uniforms:{uTime:{value:0},uRisk:{value:risk==='prohibited-review'?1:risk==='high-risk-candidate'?.7:.25}},
    vertexShader:`varying vec3 vN;varying vec3 vP;uniform float uTime;void main(){vN=normal;vec3 p=position;float w=sin(p.y*4.0+uTime)*0.06+cos(p.x*3.0-uTime*.8)*0.04;p+=normal*w;vP=p;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader:`varying vec3 vN;varying vec3 vP;uniform float uTime;uniform float uRisk;void main(){float fres=pow(1.0-abs(dot(normalize(vN),vec3(0.,0.,1.))),2.0);float band=.5+.5*sin(vP.y*7.0+uTime*1.3);vec3 safe=vec3(.05,.95,.65),warn=vec3(1.,.46,.32),violet=vec3(.42,.34,1.);vec3 base=mix(mix(safe,violet,.35),warn,uRisk);vec3 c=base*(.45+band*.45)+fres*.55;gl_FragColor=vec4(c,.96);}`
  }),[risk]);
  useEffect(()=>()=>material.dispose(),[material]);
  useFrame(({clock})=>{material.uniforms.uTime.value=clock.getElapsedTime();if(ref.current)ref.current.rotation.y+=.004});
  return <mesh ref={ref}><icosahedronGeometry args={[1.1,5]}/><primitive object={material} attach="material"/></mesh>
}

function OrbitNode({position}:{position:[number,number,number]}){
  const ref=useRef<THREE.Mesh>(null);
  useFrame(({clock})=>{if(ref.current)ref.current.scale.setScalar(1+Math.sin(clock.getElapsedTime()*1.4+position[0])*.05)});
  return <group position={position}><mesh ref={ref}><sphereGeometry args={[.16,24,24]}/><meshStandardMaterial color="#d8ffef" emissive="#3ae6a4" emissiveIntensity={1.6}/></mesh></group>
}

const labels=['Owner','Vendor','Model','Controls','Evidence','Approval','Value'];
const nodes:[number,number,number][]=[[2.15,0,0],[1.3,1.7,0],[-.8,2.05,0],[-2.1,.5,0],[-1.6,-1.45,0],[.8,-2.0,0],[2.0,-.8,0]];

export function EvidenceScene({risk='minimal'}:{risk?:string}){
  const [mode,setMode]=useState<'checking'|'webgl'|'fallback'>('checking');
  useEffect(()=>{
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas=document.createElement('canvas');
    const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
    setMode(!reduced&&gl?'webgl':'fallback');
  },[]);
  if(mode!=='webgl')return <div className="scene-shell scene-fallback" aria-label="Evidence graph static fallback"><div className={`fallback-core ${risk}`}>policy</div><div className="scene-legend">{labels.map(x=><span key={x}>{x}</span>)}</div><div className="scene-label">evidence graph · static accessible mode</div></div>;
  return <div className="scene-shell" aria-label="Interactive evidence graph visualization"><Canvas camera={{position:[0,0,6],fov:42}} dpr={[1,1.5]}><ambientLight intensity={.7}/><pointLight position={[3,4,5]} intensity={8}/><Core risk={risk}/>{nodes.map((p,i)=><OrbitNode key={labels[i]} position={p}/>)}</Canvas><div className="scene-legend">{labels.map(x=><span key={x}>{x}</span>)}</div><div className="scene-label">evidence graph · policy core</div></div>
}

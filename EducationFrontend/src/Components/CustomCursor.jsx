import React from 'react';
import * as ReactAll from 'react';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

if (typeof window !== 'undefined' && !window.React) {
  window.React = ReactAll;
}

const e = { jsx: _jsx, jsxs: _jsxs, Fragment: _Fragment };
const C = ReactAll;
const je = motion;
const Z = Link;
const gs = useNavigate;
const Hi = useLocation;
const Et = AnimatePresence;

function L0(n){return n&&n.__esModule&&Object.prototype.hasOwnProperty.call(n,"default")?n.default:n}
const di = L0(C);
const Z0 = {color:void 0,size:void 0,className:void 0,style:void 0,attr:void 0};
const Gx = di.createContext&&di.createContext(Z0);
const Sb = ["attr","size","title"];
function Cb(n,a){if(n==null)return{};var r,o,c=kb(n,a);if(Object.getOwnPropertySymbols){var u=Object.getOwnPropertySymbols(n);for(o=0;o<u.length;o++)r=u[o],a.indexOf(r)===-1&&{}.propertyIsEnumerable.call(n,r)&&(c[r]=n[r])}return c}
function kb(n,a){if(n==null)return{};var r={};for(var o in n)if({}.hasOwnProperty.call(n,o)){if(a.indexOf(o)!==-1)continue;r[o]=n[o]}return r}
function ou(){return ou=Object.assign?Object.assign.bind():function(n){for(var a=1;a<arguments.length;a++){var r=arguments[a];for(var o in r)({}).hasOwnProperty.call(r,o)&&(n[o]=r[o])}return n},ou.apply(null,arguments)}
function Ux(n,a){var r=Object.keys(n);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(n);a&&(o=o.filter(function(c){return Object.getOwnPropertyDescriptor(n,c).enumerable})),r.push.apply(r,o)}return r}
function cu(n){for(var a=1;a<arguments.length;a++){var r=arguments[a]!=null?arguments[a]:{};a%2?Ux(Object(r),!0).forEach(function(o){Ab(n,o,r[o])}):Object.getOwnPropertyDescriptors?Object.defineProperties(n,Object.getOwnPropertyDescriptors(r)):Ux(Object(r)).forEach(function(o){Object.defineProperty(n,o,Object.getOwnPropertyDescriptor(r,o))})}return n}
function Ab(n,a,r){return(a=Eb(a))in n?Object.defineProperty(n,a,{value:r,enumerable:!0,configurable:!0,writable:!0}):n[a]=r,n}
function Eb(n){var a=Mb(n,"string");return typeof a=="symbol"?a:a+""}
function Mb(n,a){if(typeof n!="object"||!n)return n;var r=n[Symbol.toPrimitive];if(r!==void 0){var o=r.call(n,a);if(typeof o!="object")return o;throw new TypeError("@@toPrimitive must return a primitive value.")}return(a==="string"?String:Number)(n)}
function e4(n){return n&&n.map((a,r)=>di.createElement(a.tag,cu({key:r},a.attr),e4(a.child)))}
function _(n){return a=>di.createElement(Tb,ou({attr:cu({},n.attr)},a),e4(n.child))}
function Tb(n){var a=r=>{var{attr:o,size:c,title:u}=n,g=Cb(n,Sb),f=c||r.size||"1em",p;return r.className&&(p=r.className),n.className&&(p=(p?p+" ":"")+n.className),di.createElement("svg",ou({stroke:"currentColor",fill:"currentColor",strokeWidth:"0"},r.attr,o,g,{className:p,style:cu(cu({color:n.color||r.color},r.style),n.style),height:f,width:f,xmlns:"http://www.w3.org/2000/svg"}),u&&di.createElement("title",null,u),n.children)};return Gx!==void 0?di.createElement(Gx.Consumer,null,r=>a(r)):a(Z0)}
function id(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"},child:[]}]})(n)}

const CustomCursor = ()=>{const n=C.useRef({x:window.innerWidth/2,y:window.innerHeight/2}),a=C.useRef({x:0,y:0}),r=C.useRef({x:0,y:0}),o=C.useRef(),[c,u]=C.useState(""),[g,f]=C.useState(!1),[p,v]=C.useState(!1),[y,x]=C.useState([]),j=C.useRef(null),S=C.useRef(null),M=C.useRef(null);return C.useEffect(()=>(document.body.classList.add("custom-cursor-active"),()=>{document.body.classList.remove("custom-cursor-active")}),[]),C.useEffect(()=>{const D=I=>{n.current={x:I.clientX,y:I.clientY},Math.random()>.85&&!g&&x(G=>{const z={id:Date.now()+Math.random(),x:I.clientX+(Math.random()*20-10),y:I.clientY+(Math.random()*20-10)};return[...G,z].slice(-8)})},T=()=>v(!0),O=()=>v(!1),U=I=>{const G=I.target;if(!G||!G.closest)return;const z=G.closest("button, .btn, .premium-btn, .explore-btn, input, textarea, a:not(.menu-item):not(.navbar-logo a):not(.mobile-nav-link)"),Q=G.closest(".school-card, .program-card, .premium-course-card"),q=G.closest("img"),ae=G.closest("video"),we=G.closest(".testimonial-card");let le=!1;if(z)if(u(""),le=!1,G.tagName==="BUTTON"||G.classList.contains("btn")||G.tagName==="A"){G.classList.add("magnet-active");const oe=G.getBoundingClientRect();r.current={x:oe.left+oe.width/2,y:oe.top+oe.height/2}}else r.current=null,document.querySelectorAll(".magnet-active").forEach(oe=>{oe.style.transform="translate(0px, 0px)",oe.classList.remove("magnet-active")});else Q?(u("Explore"),le=!0,r.current=null):we?(u("Read"),le=!0,r.current=null):ae?(u("Watch"),le=!0,r.current=null):q?(u("View"),le=!0,r.current=null):(u(""),r.current=null,document.querySelectorAll(".magnet-active").forEach(oe=>{oe.style.transform="translate(0px, 0px)",oe.classList.remove("magnet-active")}));f(le)};return window.addEventListener("mousemove",D),window.addEventListener("mousedown",T),window.addEventListener("mouseup",O),document.addEventListener("mouseover",U),()=>{window.removeEventListener("mousemove",D),window.removeEventListener("mousedown",T),window.removeEventListener("mouseup",O),document.removeEventListener("mouseover",U)}},[g]),C.useEffect(()=>{const D=()=>{let T=n.current.x,O=n.current.y;r.current&&(T=T+(r.current.x-T)*.3,O=O+(r.current.y-O)*.3),a.current.x+=(T-a.current.x)*.25,a.current.y+=(O-a.current.y)*.25,j.current&&(j.current.style.setProperty("--x",`${T}px`),j.current.style.setProperty("--y",`${O}px`)),S.current&&(S.current.style.setProperty("--x",`${a.current.x}px`),S.current.style.setProperty("--y",`${a.current.y}px`)),M.current&&(M.current.style.setProperty("--x",`${a.current.x}px`),M.current.style.setProperty("--y",`${a.current.y}px`)),r.current&&document.querySelectorAll(".magnet-active").forEach(I=>{const G=I.getBoundingClientRect();if(Math.hypot(T-(G.left+G.width/2),O-(G.top+G.height/2))<100){const Q=(T-(G.left+G.width/2))*.1,q=(O-(G.top+G.height/2))*.1;I.style.transform=`translate(${Q}px, ${q}px)`}else I.style.transform="translate(0px, 0px)"}),o.current=requestAnimationFrame(D)};return o.current=requestAnimationFrame(D),()=>cancelAnimationFrame(o.current)},[g]),C.useEffect(()=>{if(y.length>0){const D=setTimeout(()=>{x(T=>T.slice(1))},600);return()=>clearTimeout(D)}},[y]),e.jsxs("div",{className:"custom-cursor-container",children:[e.jsx("div",{className:"cursor-spotlight",ref:M}),y.map(D=>e.jsx("div",{className:"cursor-particle",style:{left:D.x,top:D.y}},D.id)),e.jsx("div",{className:`cursor-outer-ring ${g?"hovering":""} ${p?"clicking":""}`,ref:S,children:e.jsx("span",{className:"cursor-text",children:c})}),e.jsx("div",{className:`cursor-inner-dot ${g?"hovering":""}`,ref:j})]})};

export default CustomCursor;

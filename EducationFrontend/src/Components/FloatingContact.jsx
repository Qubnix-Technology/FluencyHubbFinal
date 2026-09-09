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
function Tu(n){return _({attr:{viewBox:"0 0 448 512"},child:[{tag:"path",attr:{d:"M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"},child:[]}]})(n)}
function lg(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M497.39 361.8l-112-48a24 24 0 0 0-28 6.9l-49.6 60.6A370.66 370.66 0 0 1 130.6 204.11l60.6-49.6a23.94 23.94 0 0 0 6.9-28l-48-112A24.16 24.16 0 0 0 122.6.61l-104 24A24 24 0 0 0 0 48c0 256.5 207.9 464 464 464a24 24 0 0 0 23.4-18.6l24-104a24.29 24.29 0 0 0-14.01-27.6z"},child:[]}]})(n)}

const FloatingContact = ()=>e.jsxs("div",{className:"floating-contact-container",children:[e.jsx("a",{href:"https://wa.me/918282092763",target:"_blank",rel:"noopener noreferrer",className:"floating-btn whatsapp-btn",title:"Chat with us on WhatsApp",children:e.jsx(Tu,{className:"floating-icon"})}),e.jsx("a",{href:"tel:+918282092763",className:"floating-btn call-btn",title:"Call us now",children:e.jsx(lg,{className:"floating-icon"})})]});

export default FloatingContact;

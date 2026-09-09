import React from 'react';
import * as ReactAll from 'react';
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from 'react/jsx-runtime';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import ClassChat from './Shared/ClassChat';
import ZoomMeetingSection from './Shared/ZoomMeetingSection';
import { classChatApi } from '../api/classChatApi';
import '../CSS/TeacherPortal.css';



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
function Ce(n){return _({attr:{viewBox:"0 0 640 512"},child:[{tag:"path",attr:{d:"M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z"},child:[]}]})(n)}
function c1(n){return _({attr:{viewBox:"0 0 448 512"},child:[{tag:"path",attr:{d:"M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"},child:[]}]})(n)}
function Bb(n){return _({attr:{viewBox:"0 0 640 512"},child:[{tag:"path",attr:{d:"M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h274.9c-2.4-6.8-3.4-14-2.6-21.3l6.8-60.9 1.2-11.1 7.9-7.9 77.3-77.3c-24.5-27.7-60-45.5-99.9-45.5zm45.3 145.3l-6.8 61c-1.1 10.2 7.5 18.8 17.6 17.6l60.9-6.8 137.9-137.9-71.7-71.7-137.9 137.8zM633 268.9L595.1 231c-9.3-9.3-24.5-9.3-33.8 0l-37.8 37.8-4.1 4.1 71.8 71.7 41.8-41.8c9.3-9.4 9.3-24.5 0-33.9z"},child:[]}]})(n)}
function ao(n){return _({attr:{viewBox:"0 0 352 512"},child:[{tag:"path",attr:{d:"M242.72 256l100.07-100.07c12.28-12.28 12.28-32.19 0-44.48l-22.24-22.24c-12.28-12.28-32.19-12.28-44.48 0L176 189.28 75.93 89.21c-12.28-12.28-32.19-12.28-44.48 0L9.21 111.45c-12.28 12.28-12.28 32.19 0 44.48L109.28 256 9.21 356.07c-12.28 12.28-12.28 32.19 0 44.48l22.24 22.24c12.28 12.28 32.2 12.28 44.48 0L176 322.72l100.07 100.07c12.28 12.28 32.2 12.28 44.48 0l22.24-22.24c12.28-12.28 12.28-32.19 0-44.48L242.72 256z"},child:[]}]})(n)}
function a4(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M497 273L329 441c-15 15-41 4.5-41-17v-96H152c-13.3 0-24-10.7-24-24v-96c0-13.3 10.7-24 24-24h136V88c0-21.4 25.9-32 41-17l168 168c9.3 9.4 9.3 24.6 0 34zM192 436v-40c0-6.6-5.4-12-12-12H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h84c6.6 0 12-5.4 12-12V76c0-6.6-5.4-12-12-12H96c-53 0-96 43-96 96v192c0 53 43 96 96 96h84c6.6 0 12-5.4 12-12z"},child:[]}]})(n)}
function id(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M466.5 83.7l-192-80a48.15 48.15 0 0 0-36.9 0l-192 80C27.7 91.1 16 108.6 16 128c0 198.5 114.5 335.7 221.5 380.3 11.8 4.9 25.1 4.9 36.9 0C360.1 472.6 496 349.3 496 128c0-19.4-11.7-36.9-29.5-44.3zM256.1 446.3l-.1-381 175.9 73.3c-3.3 151.4-82.1 261.1-175.8 307.7z"},child:[]}]})(n)}
function qc(n){return _({attr:{viewBox:"0 0 448 512"},child:[{tag:"path",attr:{d:"M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z"},child:[]}]})(n)}
function Ic(n){return _({attr:{viewBox:"0 0 640 512"},child:[{tag:"path",attr:{d:"M621.16 54.46C582.37 38.19 543.55 32 504.75 32c-123.17-.01-246.33 62.34-369.5 62.34-30.89 0-61.76-3.92-92.65-13.72-3.47-1.1-6.95-1.62-10.35-1.62C15.04 79 0 92.32 0 110.81v317.26c0 12.63 7.23 24.6 18.84 29.46C57.63 473.81 96.45 480 135.25 480c123.17 0 246.34-62.35 369.51-62.35 30.89 0 61.76 3.92 92.65 13.72 3.47 1.1 6.95 1.62 10.35 1.62 17.21 0 32.25-13.32 32.25-31.81V83.93c-.01-12.64-7.24-24.6-18.85-29.47zM48 132.22c20.12 5.04 41.12 7.57 62.72 8.93C104.84 170.54 79 192.69 48 192.69v-60.47zm0 285v-47.78c34.37 0 62.18 27.27 63.71 61.4-22.53-1.81-43.59-6.31-63.71-13.62zM320 352c-44.19 0-80-42.99-80-96 0-53.02 35.82-96 80-96s80 42.98 80 96c0 53.03-35.83 96-80 96zm272 27.78c-17.52-4.39-35.71-6.85-54.32-8.44 5.87-26.08 27.5-45.88 54.32-49.28v57.72zm0-236.11c-30.89-3.91-54.86-29.7-55.81-61.55 19.54 2.17 38.09 6.23 55.81 12.66v48.89z"},child:[]}]})(n)}
function rl(n){return _({attr:{viewBox:"0 0 576 512"},child:[{tag:"path",attr:{d:"M572.52 241.4C518.29 135.59 410.93 64 288 64S57.68 135.64 3.48 241.41a32.35 32.35 0 0 0 0 29.19C57.71 376.41 165.07 448 288 448s230.32-71.64 284.52-177.41a32.35 32.35 0 0 0 0-29.19zM288 400a144 144 0 1 1 144-144 143.93 143.93 0 0 1-144 144zm0-240a95.31 95.31 0 0 0-25.31 3.79 47.85 47.85 0 0 1-66.9 66.9A95.78 95.78 0 1 0 288 160z"},child:[]}]})(n)}
function Yc(n){return _({attr:{viewBox:"0 0 640 512"},child:[{tag:"path",attr:{d:"M320 400c-75.85 0-137.25-58.71-142.9-133.11L72.2 185.82c-13.79 17.3-26.48 35.59-36.72 55.59a32.35 32.35 0 0 0 0 29.19C89.71 376.41 197.07 448 320 448c26.91 0 52.87-4 77.89-10.46L346 397.39a144.13 144.13 0 0 1-26 2.61zm313.82 58.1l-110.55-85.44a331.25 331.25 0 0 0 81.25-102.07 32.35 32.35 0 0 0 0-29.19C550.29 135.59 442.93 64 320 64a308.15 308.15 0 0 0-147.32 37.7L45.46 3.37A16 16 0 0 0 23 6.18L3.37 31.45A16 16 0 0 0 6.18 53.9l588.36 454.73a16 16 0 0 0 22.46-2.81l19.64-25.27a16 16 0 0 0-2.82-22.45zm-183.72-142l-39.3-30.38A94.75 94.75 0 0 0 416 256a94.76 94.76 0 0 0-121.31-92.21A47.65 47.65 0 0 1 304 192a46.64 46.64 0 0 1-1.54 10l-73.61-56.89A142.31 142.31 0 0 1 320 112a143.92 143.92 0 0 1 144 144c0 21.63-5.29 41.79-13.9 60.11z"},child:[]}]})(n)}
function pu(n){return _({attr:{viewBox:"0 0 576 512"},child:[{tag:"path",attr:{d:"M402.6 83.2l90.2 90.2c3.8 3.8 3.8 10 0 13.8L274.4 405.6l-92.8 10.3c-12.4 1.4-22.9-9.1-21.5-21.5l10.3-92.8L388.8 83.2c3.8-3.8 10-3.8 13.8 0zm162-22.9l-48.8-48.8c-15.2-15.2-39.9-15.2-55.2 0l-35.4 35.4c-3.8 3.8-3.8 10 0 13.8l90.2 90.2c3.8 3.8 10 3.8 13.8 0l35.4-35.4c15.2-15.3 15.2-40 0-55.2zM384 346.2V448H64V128h229.8c3.2 0 6.2-1.3 8.5-3.5l40-40c7.6-7.6 2.2-20.5-8.5-20.5H48C21.5 64 0 85.5 0 112v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V306.2c0-10.7-12.9-16-20.5-8.5l-40 40c-2.2 2.3-3.5 5.3-3.5 8.5z"},child:[]}]})(n)}
function L(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M504 256c0 136.967-111.033 248-248 248S8 392.967 8 256 119.033 8 256 8s248 111.033 248 248zM227.314 387.314l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.249-16.379-6.249-22.628 0L216 308.118l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.249 16.379 6.249 22.628.001z"},child:[]}]})(n)}
function _u(n){return _({attr:{viewBox:"0 0 544 512"},child:[{tag:"path",attr:{d:"M527.79 288H290.5l158.03 158.03c6.04 6.04 15.98 6.53 22.19.68 38.7-36.46 65.32-85.61 73.13-140.86 1.34-9.46-6.51-17.85-16.06-17.85zm-15.83-64.8C503.72 103.74 408.26 8.28 288.8.04 279.68-.59 272 7.1 272 16.24V240h223.77c9.14 0 16.82-7.68 16.19-16.8zM224 288V50.71c0-9.55-8.39-17.4-17.84-16.06C86.99 51.49-4.1 155.6.14 280.37 4.5 408.51 114.83 513.59 243.03 511.98c50.4-.63 96.97-16.87 135.26-44.03 7.9-5.6 8.42-17.23 1.57-24.08L224 288z"},child:[]}]})(n)}
function Ou(n){return _({attr:{viewBox:"0 0 512 512"},child:[{tag:"path",attr:{d:"M512 144v288c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V144c0-26.5 21.5-48 48-48h88l12.3-32.9c7-18.7 24.9-31.1 44.9-31.1h125.5c20 0 37.9 12.4 44.9 31.1L376 96h88c26.5 0 48 21.5 48 48zM376 288c0-66.2-53.8-120-120-120s-120 53.8-120 120 53.8 120 120 120 120-53.8 120-120zm-32 0c0 48.5-39.5 88-88 88s-88-39.5-88-88 39.5-88 88-88 88 39.5 88 88z"},child:[]}]})(n)}
function y4(n){return _({attr:{viewBox:"0 0 448 512"},child:[{tag:"path",attr:{d:"M400 64h-48V12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v52H160V12c0-6.627-5.373-12-12-12h-40c-6.627 0-12 5.373-12 12v52H48C21.49 64 0 85.49 0 112v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm-6 400H54a6 6 0 0 1-6-6V160h352v298a6 6 0 0 1-6 6zm-52.849-200.65L198.842 404.519c-4.705 4.667-12.303 4.637-16.971-.068l-75.091-75.699c-4.667-4.705-4.637-12.303.068-16.971l22.719-22.536c4.705-4.667 12.303-4.637 16.97.069l44.104 44.461 111.072-110.181c4.705-4.667 12.303-4.637 16.971.068l22.536 22.718c4.667 4.705 4.636 12.303-.069 16.97z"},child:[]}]})(n)}
const D4 = (import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/').replace(/\/+$/, '');
const g1 = "fluencyhubb_admin_token";
const f1 = "fluencyhubb_teacher_token";
const z4 = ()=>localStorage.getItem(g1);
const B4 = ()=>localStorage.getItem(f1);
const Fp = n=>{n?localStorage.setItem(f1,n):localStorage.removeItem(f1)};
const W7 = (n=!1)=>{const a=n?B4():z4();return a?{Authorization:`Bearer ${a}`}:{}};
async function Mt(n,a={}){let r;try{r=await fetch(`${D4}${n}`,{...a,headers:{...a.body instanceof FormData?{}:{"Content-Type":"application/json"},...a.auth?W7(a.isTeacher):{},...a.headers||{}}})}catch(err){if(err.message==='Failed to fetch'||err.name==='TypeError'){throw new Error(`Unable to connect to backend server (${D4}). Please ensure PHP backend is running.`)}throw err}const o=await r.json().catch(()=>({}));if(!r.ok||o.success===!1)throw new Error(o.message||"Something went wrong.");return o}
const bt = {apiBaseUrl:D4,login:n=>Mt("/auth/login.php",{method:"POST",body:JSON.stringify(n)}),teacherLogin:n=>Mt("/auth/teacher_login.php",{method:"POST",body:JSON.stringify(n)}),me:()=>Mt("/auth/me.php",{auth:!0}),teacherMe:()=>Mt("/auth/teacher_me.php",{auth:!0,isTeacher:!0}),teacherUpdateProfile:n=>Mt("/auth/teacher_update_profile.php",{method:"POST",body:n,auth:!0,isTeacher:!0}),teacherUpdateStudent:n=>Mt("/auth/teacher_update_student.php",{method:"POST",body:JSON.stringify(n),auth:!0,isTeacher:!0}),logout:()=>Mt("/auth/logout.php",{method:"POST",auth:!0}),teacherLogout:()=>Mt("/auth/teacher_logout.php",{method:"POST",auth:!0,isTeacher:!0}),listBlogs:({admin:n=!1,category:a=""}={})=>{const r=new URLSearchParams;return n&&r.set("admin","1"),a&&a!=="All"&&r.set("category",a),Mt(`/blogs/list.php${r.toString()?`?${r}`:""}`,{auth:n})},createBlog:n=>Mt("/blogs/create.php",{method:"POST",body:n,auth:!0}),updateBlog:n=>Mt("/blogs/update.php",{method:"POST",body:n,auth:!0}),deleteBlog:n=>Mt("/blogs/delete.php",{method:"DELETE",body:JSON.stringify({id:n}),auth:!0}),getSettings:()=>Mt("/admin/settings.php"),updateSettings:n=>Mt("/admin/settings.php",{method:"POST",body:JSON.stringify(n),auth:!0}),listComments:({publicMode:n=!1,blogId:a=""}={})=>{const r=new URLSearchParams;return n&&r.set("public","1"),a&&r.set("blog_id",a),Mt(`/comments/list.php${r.toString()?`?${r}`:""}`,{auth:!n})},createComment:n=>Mt("/comments/create.php",{method:"POST",body:JSON.stringify(n)}),updateCommentStatus:(n,a)=>Mt("/comments/update_status.php",{method:"POST",body:JSON.stringify({id:n,status:a}),auth:!0}),deleteComment:n=>Mt("/comments/delete.php",{method:"DELETE",body:JSON.stringify({id:n}),auth:!0}),createEnquiry:n=>Mt("/enquiries/create.php",{method:"POST",body:JSON.stringify(n)}),listEnquiries:()=>Mt("/enquiries/list.php",{auth:!0}),updateEnquiryStatus:(n,a)=>Mt("/enquiries/update_status.php",{method:"POST",body:JSON.stringify({id:n,status:a}),auth:!0}),deleteEnquiry:n=>Mt("/enquiries/delete.php",{method:"DELETE",body:JSON.stringify({id:n}),auth:!0}),listTeacherManagement:()=>Mt("/teacher-management/list.php",{auth:!0}),saveTeacherManagement:n=>Mt("/teacher-management/save.php",{method:"POST",body:JSON.stringify(n),auth:!0}),uploadTeacherPhoto:n=>Mt("/teacher-management/upload_photo.php",{method:"POST",body:n,auth:!0}),deleteTeacherManagement:(n,a)=>Mt("/teacher-management/delete.php",{method:"DELETE",body:JSON.stringify({type:n,id:a}),auth:!0})};
const nN = ({loginForm:n,setLoginForm:a,handleLogin:r,loginError:o,loading:c})=>{const[u,g]=C.useState(!1);return e.jsx("main",{className:"admin-login-page",children:e.jsxs("form",{className:"admin-login-box",onSubmit:r,children:[e.jsx("h1",{children:"Teacher Login"}),e.jsxs("label",{children:["Email",e.jsx("input",{type:"email",value:n.email,onChange:f=>a({...n,email:f.target.value}),required:!0,placeholder:"Enter your email"})]}),e.jsxs("label",{children:["Password",e.jsxs("div",{className:"password-input-wrapper",children:[e.jsx("input",{type:u?"text":"password",value:n.password,onChange:f=>a({...n,password:f.target.value}),required:!0,placeholder:"Enter your password"}),e.jsx("button",{type:"button",className:"password-toggle-btn",onClick:()=>g(!u),"aria-label":u?"Hide password":"Show password",children:u?e.jsx(Yc,{}):e.jsx(rl,{})})]})]}),o&&e.jsx("div",{className:"admin-error shake-animation",children:o}),e.jsx("button",{type:"submit",disabled:c,className:"admin-login-btn",children:c?"Logging in...":"Login"})]})})};
const Vp = D4;
const M0 = n => n ? (n.startsWith("data:") || n.startsWith("http") ? n : `${Vp}/${n.replace(/^\/+/, "")}`) : null;
const iN = ({teacher:n,onUpdate:a})=>{const[r,o]=C.useState(!1),[c,u]=C.useState({...n,password:n.password||""}),[g,f]=C.useState(!1),[p,v]=C.useState(""),[y,x]=C.useState(!1),[j,S]=C.useState(null),[M,D]=C.useState(M0(n.photo)),T=G=>{const{name:z,value:Q}=G.target;u(q=>({...q,[z]:Q}))},O=G=>{const z=G.target.files[0];if(z){S(z);const Q=new FileReader;Q.onloadend=()=>{D(Q.result)},Q.readAsDataURL(z)}},U=async G=>{G.preventDefault(),f(!0),v("");try{const z=new FormData;z.append("name",c.name),z.append("email",c.email||""),z.append("phone",c.phone||""),z.append("gender",c.gender||""),z.append("dob",c.dob||""),z.append("address",c.address||""),z.append("city",c.city||""),z.append("country",c.country||""),z.append("qualification",c.qualification||""),z.append("experience",c.experience||""),z.append("specialization",c.specialization||""),c.password&&z.append("password",c.password),j&&z.append("photo",j);const Q=await bt.teacherUpdateProfile(z);Q.success?(o(!1),a(Q.teacher)):v(Q.message||"Failed to update profile.")}catch(z){v(z.message||"An error occurred while saving.")}finally{f(!1)}},I=()=>{u({...n,password:n.password||""}),D(M0(n.photo)),S(null),o(!1),v("")};return e.jsxs("div",{className:"teacher-dashboard-card",children:[e.jsxs("div",{className:"teacher-card-heading",children:[e.jsxs("div",{children:[e.jsx("h3",{children:"My Profile"}),e.jsx("p",{children:"Manage your personal information and profile photo."})]}),!r&&e.jsxs("button",{className:"teacher-outline-btn",onClick:()=>o(!0),children:[e.jsx(Bb,{})," Edit Profile"]})]}),p&&e.jsx("div",{className:"admin-error shake-animation",style:{margin:"0 24px 24px"},children:p}),r?e.jsxs("form",{className:"teacher-form-card",onSubmit:U,style:{boxShadow:"none",border:"none",padding:"0",margin:"0"},children:[e.jsxs("div",{className:"teacher-photo-upload full",style:{marginBottom:"16px",display:"flex",alignItems:"center",gap:"20px",paddingBottom:"20px",borderBottom:"1px solid #e4ebf5"},children:[e.jsx("div",{className:"teacher-photo-preview",style:{width:"100px",height:"100px",borderRadius:"50%",backgroundColor:"#e8f1ff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"3px solid #0d6efd"},children:M?e.jsx("img",{src:M,alt:"Preview",style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsx("span",{style:{color:"#0d6efd",fontSize:"2.5rem",fontWeight:"bold"},children:c.name.charAt(0).toUpperCase()})}),e.jsxs("div",{children:[e.jsxs("label",{htmlFor:"photo-upload",className:"teacher-outline-btn",style:{cursor:"pointer",display:"inline-flex",marginBottom:"8px"},children:[e.jsx(Ou,{})," Change Photo"]}),e.jsx("input",{type:"file",id:"photo-upload",accept:"image/*",onChange:O,style:{display:"none"}}),e.jsx("p",{style:{margin:"0",fontSize:"0.85rem",color:"#6c757d"},children:"Recommended: Square image, max 2MB."})]})]}),e.jsxs("label",{children:["Full Name *",e.jsx("input",{type:"text",name:"name",value:c.name,onChange:T,required:!0})]}),e.jsxs("label",{children:["Email Address",e.jsx("input",{type:"email",name:"email",value:c.email,onChange:T})]}),e.jsxs("label",{children:["Phone Number",e.jsx("input",{type:"tel",name:"phone",value:c.phone,onChange:T})]}),e.jsxs("label",{children:["Gender",e.jsxs("select",{name:"gender",value:c.gender,onChange:T,children:[e.jsx("option",{value:"",children:"Select Gender"}),e.jsx("option",{value:"Male",children:"Male"}),e.jsx("option",{value:"Female",children:"Female"}),e.jsx("option",{value:"Other",children:"Other"})]})]}),e.jsxs("label",{children:["Date of Birth",e.jsx("input",{type:"date",name:"dob",value:c.dob,onChange:T})]}),e.jsxs("label",{style:{position:"relative"},children:["Your Password",e.jsxs("div",{style:{display:"flex",alignItems:"center",position:"relative"},children:[e.jsx("input",{type:y?"text":"password",name:"password",value:c.password,readOnly:!0,style:{backgroundColor:"#f8fafc",color:"#64748b",paddingRight:"40px"}}),e.jsx("button",{type:"button",onClick:()=>x(!y),style:{position:"absolute",right:"10px",background:"none",border:"none",color:"#64748b",cursor:"pointer",padding:"0",display:"flex",alignItems:"center",justifyContent:"center"},"aria-label":"Toggle password visibility",children:y?e.jsx(Yc,{size:18}):e.jsx(rl,{size:18})})]})]}),e.jsxs("label",{className:"full",children:["Address",e.jsx("input",{type:"text",name:"address",value:c.address,onChange:T})]}),e.jsxs("label",{children:["City",e.jsx("input",{type:"text",name:"city",value:c.city,onChange:T})]}),e.jsxs("label",{children:["Country",e.jsx("input",{type:"text",name:"country",value:c.country,onChange:T})]}),e.jsxs("label",{children:["Highest Qualification",e.jsx("input",{type:"text",name:"qualification",value:c.qualification,onChange:T})]}),e.jsxs("label",{children:["Experience (Years)",e.jsx("input",{type:"text",name:"experience",value:c.experience,onChange:T})]}),e.jsxs("label",{className:"full",children:["Specialization",e.jsx("input",{type:"text",name:"specialization",value:c.specialization,onChange:T})]}),e.jsxs("div",{className:"teacher-form-actions",style:{marginTop:"16px",display:"flex",gap:"12px"},children:[e.jsxs("button",{type:"submit",className:"teacher-primary-btn",disabled:g,children:[e.jsx(qc,{})," ",g?"Saving...":"Save Changes"]}),e.jsxs("button",{type:"button",className:"teacher-outline-btn",onClick:I,disabled:g,children:[e.jsx(ao,{})," Cancel"]})]})]}):e.jsxs("div",{className:"teacher-profile-view",style:{padding:"0 24px 24px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"24px",marginBottom:"32px"},children:[e.jsx("div",{className:"teacher-photo-preview",style:{width:"120px",height:"120px",borderRadius:"50%",backgroundColor:"#e8f1ff",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"3px solid #0d6efd"},children:M0(n.photo)?e.jsx("img",{src:M0(n.photo),alt:"Profile",style:{width:"100%",height:"100%",objectFit:"cover"}}):e.jsx("span",{style:{color:"#0d6efd",fontSize:"3rem",fontWeight:"bold"},children:n.name.charAt(0).toUpperCase()})}),e.jsxs("div",{children:[e.jsx("h2",{style:{fontSize:"1.8rem",color:"#0a2a5e",margin:"0 0 8px"},children:n.name}),e.jsxs("p",{style:{margin:0,color:"#495057",fontSize:"1.1rem"},children:[n.role," | ",n.teachingMode]}),n.employeeId&&e.jsxs("p",{style:{margin:"4px 0 0",color:"#6c757d",fontSize:"0.9rem"},children:["Employee ID: ",n.employeeId]})]})]}),e.jsxs("div",{className:"teacher-profile-grid",children:[e.jsxs("p",{children:[e.jsx("strong",{children:"Email"}),e.jsx("span",{children:n.email||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Phone"}),e.jsx("span",{children:n.phone||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Gender"}),e.jsx("span",{children:n.gender||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"DOB"}),e.jsx("span",{children:n.dob||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Address"}),e.jsx("span",{children:[n.address,n.city,n.country].filter(Boolean).join(", ")||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Qualification"}),e.jsx("span",{children:n.qualification||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Experience"}),e.jsx("span",{children:n.experience||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Specialization"}),e.jsx("span",{children:n.specialization||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Languages"}),e.jsx("span",{children:n.languages||"-"})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Joining Date"}),e.jsx("span",{children:n.joiningDate||"-"})]})]})]})]})};
const gv = new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:0});
const ll = n=>Number(n)||0;
const aN = n=>{const a=ll(n.packageClasses),r=ll(n.completedBeforeWeek),o=ll(n.thisWeekClasses),c=r+o;return{...n,packageClasses:a,completedBeforeWeek:r,thisWeekClasses:o,duration:ll(n.duration),rate:ll(n.rate),totalFeesPaid:ll(n.totalFeesPaid),remainingFees:ll(n.remainingFees),completedClasses:c,remainingClasses:Math.max(a-c,0),weeklyPayment:o*ll(n.rate)}};
const lN = ({teacher:n,handleLogout:a,handleUpdateTeacher:r,defaultTab:dt})=>{
  const loc=Hi();
  const initTab=dt||(loc.pathname.includes('/chat')?"chat":"dashboard");
  const[o,c]=C.useState(initTab);
  const[u,g]=C.useState(null);
  const[f,p]=C.useState({completedClasses:0,thisWeekClasses:0,packageClasses:0});
  const [unreadCount, setUnreadCount] = C.useState(0);
  const [liveToast, setLiveToast] = C.useState(null);

  const fetchUnread = async () => {
    try {
      const res = await classChatApi.unread('teacher');
      setUnreadCount(res.total_unread || 0);
    } catch {}
  };

  C.useEffect(() => {
    fetchUnread();
    const interval = setInterval(() => {
      if (!document.hidden) fetchUnread();
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  C.useEffect(() => {
    let ws = null;
    let isMounted = true;
    try {
      const wsHost = window.location.hostname || '127.0.0.1';
      ws = new WebSocket(`ws://${wsHost}:8085`);
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          if (!isMounted || !data) return;
          if (data.event === 'new_message' && data.message) {
            const msg = data.message;
            // Only count if message is relevant to THIS teacher:
            // 1. Either broadcast announcement (reaches all)
            // 2. Or sent specifically to this teacher's class (msg.teacher_id === n.id)
            const isForThisTeacher = msg.is_broadcast || (Number(msg.teacher_id) === Number(n?.id));
            
            if (isForThisTeacher && msg.sender_role !== 'teacher') {
              setUnreadCount(prev => prev + 1);
              if (o !== 'chat') {
                const sender = msg.sender_name || (msg.sender_role === 'admin' ? 'Admin' : 'Student');
                setLiveToast({
                  title: `Message from ${sender}`,
                  text: msg.content.length > 80 ? msg.content.slice(0, 77) + '...' : msg.content
                });
              }
            }
          }
        } catch {}
      };
    } catch {}
    return () => {
      isMounted = false;
      if (ws) { try { ws.close(); } catch {} }
    };
  }, [o, n?.id]);

  const handleOpenChat = () => {
    c("chat");
    setLiveToast(null);
    setUnreadCount(0);
  };

  const v=D=>{g(D.id),p({completedBeforeWeek:D.completedBeforeWeek,completedClasses:D.completedClasses,thisWeekClasses:D.thisWeekClasses,packageClasses:D.packageClasses,originalCompletedClasses:D.completedClasses})};
  const y=async()=>{try{const D=await bt.teacherUpdateStudent({student_id:u,...f,completedClasses:f.completedBeforeWeek+f.thisWeekClasses});r(D.teacher),g(null)}catch(D){alert(D.message)}};
  const x=()=>{g(null)};
  const j=C.useMemo(()=>(n?.students||[]).map(aN),[n]);
  const S=C.useMemo(()=>j.reduce((D,T)=>({totalStudents:j.length,packageClasses:D.packageClasses+T.packageClasses,completedClasses:D.completedClasses+T.completedClasses,remainingClasses:D.remainingClasses+T.remainingClasses,classesThisWeek:D.classesThisWeek+T.thisWeekClasses,weeklyPayment:D.weeklyPayment+T.weeklyPayment}),{totalStudents:0,packageClasses:0,completedClasses:0,remainingClasses:0,classesThisWeek:0,weeklyPayment:0}),[j]);
  const M=S.weeklyPayment*4;

  return e.jsx("main",{className:"teacher-panel-page",children:e.jsxs("section",{className:"teacher-main-shell",children:[
    liveToast && e.jsxs("div", { className: "admin-live-toast-banner", role: "alert", children: [
      e.jsx("div", { className: "admin-live-toast-icon", children: "💬" }),
      e.jsxs("div", { className: "admin-live-toast-content", children: [
        e.jsx("strong", { children: liveToast.title }),
        e.jsx("p", { children: liveToast.text })
      ]}),
      e.jsx("button", { type: "button", className: "admin-live-toast-btn", onClick: handleOpenChat, children: "Open Chat" }),
      e.jsx("button", { type: "button", className: "admin-live-toast-close", onClick: () => setLiveToast(null), children: "✕" })
    ]}),
    e.jsxs("header",{className:"teacher-portal-topbar",children:[
      e.jsxs("div",{className:"teacher-portal-title",children:[e.jsx("span",{children:"Teacher Portal"}),e.jsxs("h1",{children:["Welcome, ",n.name]})]}),
      e.jsx("div",{className:"teacher-portal-actions",children:e.jsxs("button",{className:"teacher-ghost-btn",onClick:a,children:[e.jsx(a4,{})," Logout"]})})
    ]}),
    e.jsxs("div",{className:"admin-tabs",style:{marginBottom:"24px",justifyContent:"flex-start",display:"flex",flexWrap:"wrap",gap:"8px"},children:[
      e.jsxs("button",{className:o==="dashboard"?"active":"",onClick:()=>c("dashboard"),children:[e.jsx(_u,{})," Dashboard"]}),
      e.jsxs("button",{className:o==="profile"?"active":"",onClick:()=>c("profile"),children:[e.jsx(c1,{})," My Profile"]}),
      e.jsxs("button",{className:o==="chat"?"active":"",onClick:handleOpenChat,style:{display:"inline-flex",alignItems:"center",gap:"6px"},children:[
        e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsx("path",{d:"M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"})}),
        " Chat",
        unreadCount > 0 && e.jsx("span", { className: "group-unread-badge", style:{marginLeft:"6px"}, children: unreadCount > 99 ? '99+' : unreadCount })
      ]}),
      e.jsxs("button",{className:o==="zoom"?"active":"",onClick:()=>c("zoom"),style:{display:"inline-flex",alignItems:"center",gap:"6px"},children:[
        e.jsx("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",children:e.jsxs(e.Fragment,{children:[e.jsx("polygon",{points:"23 7 16 12 23 17 23 7"}),e.jsx("rect",{x:"1",y:"5",width:"15",height:"14",rx:"2",ry:"2"})]})}),
        " Live Classes"
      ]})
    ]}),
    o==="dashboard"?e.jsxs("section",{className:"teacher-management-page",children:[
      e.jsxs("div",{className:"teacher-summary-grid",children:[
        e.jsxs("div",{children:[e.jsx(Ce,{}),e.jsx("span",{children:"Total Students"}),e.jsx("strong",{children:S.totalStudents})]}),
        e.jsxs("div",{children:[e.jsx(y4,{}),e.jsx("span",{children:"Total Classes This Week"}),e.jsx("strong",{children:S.classesThisWeek})]}),
        e.jsxs("div",{children:[e.jsx(L,{}),e.jsx("span",{children:"Total Remaining Classes"}),e.jsx("strong",{children:S.remainingClasses})]}),
        e.jsxs("div",{children:[e.jsx(Ic,{}),e.jsx("span",{children:"Total Weekly Payment"}),e.jsx("strong",{children:gv.format(S.weeklyPayment)})]}),
        e.jsxs("div",{children:[e.jsx(Ic,{}),e.jsx("span",{children:"Total Monthly Payment"}),e.jsx("strong",{children:gv.format(M)})]})
      ]}),
      e.jsxs("div",{className:"teacher-dashboard-card",children:[
        e.jsx("div",{className:"teacher-card-heading",children:e.jsxs("div",{children:[e.jsx("h3",{children:"Your Students"}),e.jsx("p",{children:"View your assigned students and their current status."})]})}),
        e.jsx("div",{className:"teacher-table-wrap",children:e.jsxs("table",{className:"teacher-management-table",children:[
          e.jsx("thead",{children:e.jsxs("tr",{children:[
            e.jsx("th",{children:"Student Name"}),
            e.jsx("th",{children:"Course"}),
            e.jsx("th",{children:"Duration"}),
            e.jsx("th",{children:"Class Type"}),
            e.jsx("th",{children:"Total Classes"}),
            e.jsx("th",{children:"Completed Classes"}),
            e.jsx("th",{children:"Remaining Classes"}),
            e.jsx("th",{children:"This Week Classes"}),
            e.jsx("th",{children:"Status"}),
            e.jsx("th",{children:"Actions"})
          ]})}),
          e.jsxs("tbody",{children:[
            j.map(D=>{
              const T=u===D.id;
              return e.jsxs("tr",{children:[
                e.jsx("td",{children:e.jsx("strong",{children:D.name})}),
                e.jsx("td",{children:D.course}),
                e.jsxs("td",{children:[D.duration," min"]}),
                e.jsx("td",{children:D.classType}),
                e.jsx("td",{children:D.packageClasses}),
                e.jsx("td",{children:T?e.jsx("div",{style:{fontWeight:800},children:f.originalCompletedClasses}):D.completedClasses}),
                e.jsx("td",{children:T?e.jsx("div",{style:{fontWeight:800},children:Math.max(f.packageClasses-(f.completedBeforeWeek+f.thisWeekClasses),0)}):D.remainingClasses}),
                e.jsx("td",{children:T?e.jsx("input",{type:"number",style:{width:"60px",padding:"4px",border:"1px solid #ccc",borderRadius:"4px"},value:f.thisWeekClasses,onChange:O=>p(U=>({...U,thisWeekClasses:parseInt(O.target.value)||0}))}):D.thisWeekClasses}),
                e.jsx("td",{children:e.jsx("span",{className:`teacher-status ${D.status.toLowerCase().replace(/\s+/g,"-")}`,children:D.status})}),
                e.jsx("td",{children:T?e.jsxs("div",{style:{display:"flex",gap:"8px",justifyContent:"center"},children:[
                  e.jsx(qc,{onClick:y,style:{cursor:"pointer",color:"#16a34a",fontSize:"1.2rem"},title:"Save"}),
                  e.jsx(ao,{onClick:x,style:{cursor:"pointer",color:"#dc2626",fontSize:"1.2rem"},title:"Cancel"})
                ]}):e.jsx("div",{style:{display:"flex",justifyContent:"center"},children:e.jsx(pu,{onClick:()=>v(D),style:{cursor:"pointer",color:"#2563eb",fontSize:"1.1rem"},title:"Edit Classes"})})})
              ]},D.id);
            }),
            e.jsxs("tr",{className:"teacher-total-row",children:[
              e.jsx("td",{colSpan:"4",children:"Total"}),
              e.jsx("td",{children:S.packageClasses}),
              e.jsx("td",{children:S.completedClasses}),
              e.jsx("td",{children:S.remainingClasses}),
              e.jsx("td",{children:S.classesThisWeek}),
              e.jsx("td",{}),
              e.jsx("td",{})
            ]})
          ]})
        ]})})
      ]})
    ]}):
    o==="profile"?e.jsx(iN,{teacher:n,onUpdate:r}):
    o==="zoom"?e.jsx("section",{style:{marginTop:"12px"},children:e.jsx(ZoomMeetingSection,{role:"teacher",title:"My Live Classes"})}):
    e.jsx("section",{className:"teacher-chat-section-wrap",style:{marginTop:"12px"},children:e.jsx(ClassChat,{role:"teacher",title:"Class chat",teacher:n,initialStudents:n?.students})})
  ]})})};

const TeacherPortal = ({defaultTab})=>{const[n,a]=C.useState(null),[r,o]=C.useState({email:"",password:""}),[c,u]=C.useState(""),[g,f]=C.useState(!1),[p,v]=C.useState(!0);const navigate=gs();C.useEffect(()=>{(async()=>{if(!B4()){navigate('/login',{replace:true});v(!1);return}try{const M=await bt.teacherMe();a(M.teacher)}catch{Fp("");navigate('/login',{replace:true})}finally{v(!1)}})()},[navigate]);const y=async S=>{S.preventDefault(),u(""),f(!0);try{const M=await bt.teacherLogin(r);Fp(M.token),a(M.teacher)}catch(M){u(M.message)}finally{f(!1)}},x=async()=>{try{await bt.teacherLogout()}catch{}Fp(""),a(null);navigate('/login',{replace:true})},j=S=>{a(S)};return p?e.jsx("div",{style:{minHeight:"100vh",display:"grid",placeItems:"center",background:"#f8fafc",color:"#0a2a5e",fontWeight:800},children:"Loading Portal..."}):n?e.jsx(lN,{teacher:n,handleLogout:x,handleUpdateTeacher:j,defaultTab:defaultTab}):e.jsx(nN,{loginForm:r,setLoginForm:o,handleLogin:y,loginError:c,loading:g})};

export default TeacherPortal;

if(!self.define){let e,s={};const a=(a,n)=>(a=new URL(a+".js",n).href,s[a]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=a,e.onload=s,document.head.appendChild(e)}else e=a,importScripts(a),s()})).then((()=>{let e=s[a];if(!e)throw new Error(`Module ${a} didn’t register its module`);return e})));self.define=(n,i)=>{const t=e||("document"in self?document.currentScript.src:"")||location.href;if(s[t])return;let c={};const o=e=>a(e,t),r={module:{uri:t},exports:c,require:o};s[t]=Promise.all(n.map((e=>r[e]||o(e)))).then((e=>(i(...e),c)))}}define(["./workbox-4754cb34"],(function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"29801d6d37e902a19905e2ec3e2445d0"},{url:"/_next/static/chunks/19-401fbcaf9513a57a.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/20-3296941b0e1fae95.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/280-0d3b770f2e452a6f.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/31-8473485be435c46b.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/377-6419bc4df6f9840b.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/4bd1b696-76ecc8f2711f0ed4.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/517-109e3aa3602586fa.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/562-d6f4c40eb6bb4e17.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/61-226d716df8ba9e78.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/621-3974008b3ba5ec0d.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/799-93e0ef751395f54a.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/9081a741-d9a054ca57ff3ae0.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/943-c71e0586447df030.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/_not-found/page-8bddb17e9dc182a9.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/auth/login/page-a25732c9e14f3ae6.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/auth/signup/page-0521a040a3ea7a5d.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/dashboard/page-ad2c589fd7a39190.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/layout-aaa2d245760d51e7.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/app/page-ab8e45943eb608de.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/framework-c76864a09627f16c.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/main-aba5b4b48dc35dfa.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/main-app-007dc2fab3dc9d4e.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/pages/_app-abffdcde9d309a0c.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/pages/_error-94b8133dd8229633.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-8e0b574132e026f0.js",revision:"zqSRAV6MzUpZEG2oTKTgj"},{url:"/_next/static/css/4df78f2cd73d6b26.css",revision:"4df78f2cd73d6b26"},{url:"/_next/static/css/c9affc07501b309c.css",revision:"c9affc07501b309c"},{url:"/_next/static/media/ajax-loader.0b80f665.gif",revision:"0b80f665"},{url:"/_next/static/media/slick.25572f22.eot",revision:"25572f22"},{url:"/_next/static/media/slick.653a4cbb.woff",revision:"653a4cbb"},{url:"/_next/static/media/slick.6aa1ee46.ttf",revision:"6aa1ee46"},{url:"/_next/static/media/slick.f895cfdf.svg",revision:"f895cfdf"},{url:"/_next/static/zqSRAV6MzUpZEG2oTKTgj/_buildManifest.js",revision:"1a5eaef4b20ed8cb3e514873afc44cde"},{url:"/_next/static/zqSRAV6MzUpZEG2oTKTgj/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/bat.svg",revision:"60fb29b5b43b1c2ce33e2af332753c75"},{url:"/file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"/globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"/icons/icon-192x192.png",revision:"751280cc697317d621123896ae9c6e7b"},{url:"/locales/en/translation.json",revision:"5b4a4861c15c6d80aab5d9737df569aa"},{url:"/locales/he/translation.json",revision:"5b4a4861c15c6d80aab5d9737df569aa"},{url:"/manifest.json",revision:"07123b8d06d0f6d1328eba995a0cd44d"},{url:"/next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"/vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"/window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:s,event:a,state:n})=>s&&"opaqueredirect"===s.type?new Response(s.body,{status:200,statusText:"OK",headers:s.headers}):s}]}),"GET"),e.registerRoute(/^\/icons\/.*\.(png|jpg|jpeg|svg|gif)$/i,new e.CacheFirst({cacheName:"static-images",plugins:[new e.ExpirationPlugin({maxEntries:50,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/^\/splash\/.*\.(png|jpg|jpeg|svg|gif)$/i,new e.CacheFirst({cacheName:"splash-images",plugins:[new e.ExpirationPlugin({maxEntries:10,maxAgeSeconds:2592e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;const s=e.pathname;return!s.startsWith("/api/auth/")&&!!s.startsWith("/api/")}),new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")}),new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute((({url:e})=>!(self.origin===e.origin)),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")}));

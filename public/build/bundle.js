var app=function(){"use strict";function e(){}function t(e,t){for(const n in t)e[n]=t[n];return e}function n(e){return e()}function r(){return Object.create(null)}function i(e){e.forEach(n)}function a(e){return"function"==typeof e}function s(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function o(e,t,n){e.$$.on_destroy.push(function(e,t){const n=e.subscribe(t);return n.unsubscribe?()=>n.unsubscribe():n}(t,n))}function c(e,n,r){return e[1]?t({},t(n.$$scope.ctx,e[1](r?r(n):{}))):n.$$scope.ctx}function l(e){return null==e?"":e}function u(e,t){e.appendChild(t)}function d(e,t,n){e.insertBefore(t,n||null)}function f(e){e.parentNode.removeChild(e)}function m(e){return document.createElement(e)}function g(e){return document.createTextNode(e)}function p(){return g(" ")}function h(){return g("")}function v(e,t,n,r){return e.addEventListener(t,n,r),()=>e.removeEventListener(t,n,r)}function $(e,t,n){null==n?e.removeAttribute(t):e.setAttribute(t,n)}function x(e,t){t=""+t,e.data!==t&&(e.data=t)}function w(e,t,n){e.style.setProperty(t,n)}function y(e,t,n){e.classList[n?"add":"remove"](t)}let _;function P(e){_=e}function b(){if(!_)throw new Error("Function called outside component initialization");return _}function z(e){b().$$.before_update.push(e)}function T(){const e=_;return(t,n)=>{const r=e.$$.callbacks[t];if(r){const i=function(e,t){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,!1,!1,t),n}(t,n);r.slice().forEach(t=>{t.call(e,i)})}}}const E=[],k=[],M=[],W=[],O=Promise.resolve();let A=!1;function L(e){M.push(e)}function I(){const e=new Set;do{for(;E.length;){const e=E.shift();P(e),S(e.$$)}for(;k.length;)k.pop()();for(let t=0;t<M.length;t+=1){const n=M[t];e.has(n)||(n(),e.add(n))}M.length=0}while(E.length);for(;W.length;)W.pop()();A=!1}function S(e){e.fragment&&(e.update(e.dirty),i(e.before_update),e.fragment.p(e.dirty,e.ctx),e.dirty=null,e.after_update.forEach(L))}const C=new Set;let D;function j(){D={r:0,c:[],p:D}}function H(){D.r||i(D.c),D=D.p}function X(e,t){e&&e.i&&(C.delete(e),e.i(t))}function Y(e,t,n,r){if(e&&e.o){if(C.has(e))return;C.add(e),D.c.push(()=>{C.delete(e),r&&(n&&e.d(1),r())}),e.o(t)}}const N="undefined"!=typeof window?window:global;function R(e,t){Y(e,1,1,()=>{t.delete(e.key)})}function B(e,t,r){const{fragment:s,on_mount:o,on_destroy:c,after_update:l}=e.$$;s.m(t,r),L(()=>{const t=o.map(n).filter(a);c?c.push(...t):i(t),e.$$.on_mount=[]}),l.forEach(L)}function q(e,t){e.$$.fragment&&(i(e.$$.on_destroy),e.$$.fragment.d(t),e.$$.on_destroy=e.$$.fragment=null,e.$$.ctx={})}function F(e,t){e.$$.dirty||(E.push(e),A||(A=!0,O.then(I)),e.$$.dirty=r()),e.$$.dirty[t]=!0}function G(t,n,a,s,o,c){const l=_;P(t);const u=n.props||{},d=t.$$={fragment:null,ctx:null,props:c,update:e,not_equal:o,bound:r(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(l?l.$$.context:[]),callbacks:r(),dirty:null};let f=!1;d.ctx=a?a(t,u,(e,n)=>{d.ctx&&o(d.ctx[e],d.ctx[e]=n)&&(d.bound[e]&&d.bound[e](n),f&&F(t,e))}):u,d.update(),f=!0,i(d.before_update),d.fragment=s(d.ctx),n.target&&(n.hydrate?d.fragment.l(function(e){return Array.from(e.childNodes)}(n.target)):d.fragment.c(),n.intro&&X(t.$$.fragment),B(t,n.target,n.anchor),I()),P(l)}class J{$destroy(){q(this,1),this.$destroy=e}$on(e,t){const n=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return n.push(t),()=>{const e=n.indexOf(t);-1!==e&&n.splice(e,1)}}$set(){}}const K=[];function Q(t,n=e){let r;const i=[];function a(e){if(s(t,e)&&(t=e,r)){const e=!K.length;for(let e=0;e<i.length;e+=1){const n=i[e];n[1](),K.push(n,t)}if(e){for(let e=0;e<K.length;e+=2)K[e][0](K[e+1]);K.length=0}}}return{set:a,update:function(e){a(e(t))},subscribe:function(s,o=e){const c=[s,o];return i.push(c),1===i.length&&(r=n(a)||e),s(t),()=>{const e=i.indexOf(c);-1!==e&&i.splice(e,1),0===i.length&&(r(),r=null)}}}}const U=new Map,V=Symbol(),Z=()=>U.get(V),ee=e=>Z().widgets.get(e),te=e=>{try{const t={type:e,sizeAndPos:{w:2,h:2,x:0,y:0},_title:Q(""),_data:Q("")};Z().widgets.set(Symbol(),t),Z()._widgetsCount.update(e=>e+1)}catch(e){}};function ne(t){var n;return{c(){(n=m("button")).innerHTML='<img src="/images/arrowRightIcon.svg" alt="prev">',$(n,"class","svelte-1l6716q")},m(e,t){d(e,n,t)},p:e,i:e,o:e,d(e){e&&f(n)}}}((e,t=Symbol())=>{try{const n={_title:Q(e),widgets:new Map,_widgetsCount:Q(0)};U.set(t,n)}catch(e){}})("default dash",V),te("Sticky");class re extends J{constructor(e){super(),G(this,e,null,ne,s,[])}}function ie(t){var n;return{c(){(n=m("button")).innerHTML='<img src="/images/arrowRightIcon.svg" alt="next">',$(n,"class","svelte-1bwa45r")},m(e,t){d(e,n,t)},p:e,i:e,o:e,d(e){e&&f(n)}}}class ae extends J{constructor(e){super(),G(this,e,null,ie,s,[])}}function se(e){var t,n;return{c(){$(t=m("img"),"class","cancel"),$(t,"src","/images/cancelIcon.svg"),$(t,"alt","x"),n=v(t,"click",e.trash)},m(e,n){d(e,t,n)},d(e){e&&f(t),n()}}}function oe(t){var n,r,i,a,s,o=t.active&&se(t);return{c(){o&&o.c(),n=p(),r=m("button"),$(i=m("img"),"src","/images/TrashIcon.svg"),$(i,"alt","-"),$(r,"class",a=l(t.active?"active":"")+" svelte-9jl02c"),s=v(r,"click",t.trash)},m(e,t){o&&o.m(e,t),d(e,n,t),d(e,r,t),u(r,i)},p(e,t){t.active?o||((o=se(t)).c(),o.m(n.parentNode,n)):o&&(o.d(1),o=null),e.active&&a!==(a=l(t.active?"active":"")+" svelte-9jl02c")&&$(r,"class",a)},i:e,o:e,d(e){o&&o.d(e),e&&(f(n),f(r)),s()}}}function ce(e,t,n){let{active:r}=t;const i=T();return e.$set=e=>{"active"in e&&n("active",r=e.active)},{active:r,trash:()=>{i("trash",{active:!r})}}}class le extends J{constructor(e){super(),G(this,e,ce,oe,s,["active"])}}function ue(t){var n,r,i,a;return{c(){n=m("button"),$(r=m("img"),"src","/images/addIcon.svg"),$(r,"alt","+"),$(n,"class",i=l(t.active?"active":"")+" svelte-9b9csn"),a=v(n,"click",t.add)},m(e,t){d(e,n,t),u(n,r)},p(e,t){e.active&&i!==(i=l(t.active?"active":"")+" svelte-9b9csn")&&$(n,"class",i)},i:e,o:e,d(e){e&&f(n),a()}}}function de(e,t,n){let{active:r}=t;const i=T();return e.$set=e=>{"active"in e&&n("active",r=e.active)},{active:r,add:()=>i("add")}}class fe extends J{constructor(e){super(),G(this,e,de,ue,s,["active"])}}function me(e){var t,n,r;return{c(){t=m("a"),n=g(e.$_title),$(t,"class","active-dash-title svelte-1i0u2mm"),r=v(t,"click",e.click_handler)},m(e,r){d(e,t,r),u(t,n)},p(e,t){e.$_title&&x(n,t.$_title)},d(e){e&&f(t),r()}}}function ge(e){var t,n;return{c(){$(t=m("input"),"type","text"),t.autofocus=!0,$(t,"class","svelte-1i0u2mm"),n=[v(t,"input",e.input_input_handler),v(t,"blur",e.blur_handler)]},m(n,r){d(n,t,r),t.value=e.$_title,t.focus()},p(e,n){e.$_title&&t.value!==n.$_title&&(t.value=n.$_title)},d(e){e&&f(t),i(n)}}}function pe(e){var t,n,r,i,a,s,o,c=new re({}),l=new le({});function g(e){return e.editingTitle?ge:me}var h=g(e),v=h(e),x=new fe({}),w=new ae({});return{c(){t=m("nav"),c.$$.fragment.c(),n=p(),l.$$.fragment.c(),r=p(),i=m("div"),v.c(),a=p(),x.$$.fragment.c(),s=p(),w.$$.fragment.c(),$(i,"class","svelte-1i0u2mm"),$(t,"class","svelte-1i0u2mm")},m(e,f){d(e,t,f),B(c,t,null),u(t,n),B(l,t,null),u(t,r),u(t,i),v.m(i,null),u(t,a),B(x,t,null),u(t,s),B(w,t,null),o=!0},p(e,t){h===(h=g(t))&&v?v.p(e,t):(v.d(1),(v=h(t))&&(v.c(),v.m(i,null)))},i(e){o||(X(c.$$.fragment,e),X(l.$$.fragment,e),X(x.$$.fragment,e),X(w.$$.fragment,e),o=!0)},o(e){Y(c.$$.fragment,e),Y(l.$$.fragment,e),Y(x.$$.fragment,e),Y(w.$$.fragment,e),o=!1},d(e){e&&f(t),q(c),q(l),v.d(),q(x),q(w)}}}function he(e,t,n){let r,i=Z()._title;o(e,i,e=>{r=e,n("$_title",r)});let a=!1;return{_title:i,editingTitle:a,$_title:r,input_input_handler:function(){i.set(this.value)},blur_handler:function(){const e=a=!1;return n("editingTitle",a),e},click_handler:function(){const e=a=!0;return n("editingTitle",a),e}}}class ve extends J{constructor(e){super(),G(this,e,he,pe,s,[])}}function $e(e){var t,n,r;return{c(){t=m("article"),n=g(e.$_data),$(t,"class","svelte-1ovrvdo"),r=v(t,"click",e.click_handler)},m(e,r){d(e,t,r),u(t,n)},p(e,t){e.$_data&&x(n,t.$_data)},d(e){e&&f(t),r()}}}function xe(e){var t,n;return{c(){(t=m("textarea")).autofocus=!0,$(t,"class","svelte-1ovrvdo"),n=[v(t,"input",e.textarea_input_handler),v(t,"blur",e.blur_handler)]},m(n,r){d(n,t,r),t.value=e.$_data,t.focus()},p(e,n){e.$_data&&(t.value=n.$_data)},d(e){e&&f(t),i(n)}}}function we(t){var n;function r(e){return e.editing?xe:$e}var i=r(t),a=i(t);return{c(){a.c(),n=h()},m(e,t){a.m(e,t),d(e,n,t)},p(e,t){i===(i=r(t))&&a?a.p(e,t):(a.d(1),(a=i(t))&&(a.c(),a.m(n.parentNode,n)))},i:e,o:e,d(e){a.d(e),e&&f(n)}}}function ye(e,t,n){let r,{_data:i}=t;o(e,i,e=>{r=e,n("$_data",r)});let a=!0;return e.$set=e=>{"_data"in e&&n("_data",i=e._data)},{_data:i,editing:a,$_data:r,textarea_input_handler:function(){i.set(this.value)},blur_handler:function(){const e=a=!1;return n("editing",a),e},click_handler:function(){const e=a=!0;return n("editing",a),e}}}class _e extends J{constructor(e){super(),G(this,e,ye,we,s,["_data"])}}function Pe(t){var n,r;return{c(){$(n=m("textarea"),"class","svelte-1jhz1zv"),r=v(n,"input",t.textarea_input_handler)},m(e,r){d(e,n,r),n.value=t.$_data},p(e,t){e.$_data&&(n.value=t.$_data)},i:e,o:e,d(e){e&&f(n),r()}}}function be(e){var t,n=new _e({props:{_data:e._data}});return{c(){n.$$.fragment.c()},m(e,r){B(n,e,r),t=!0},p(e,t){var r={};e._data&&(r._data=t._data),n.$set(r)},i(e){t||(X(n.$$.fragment,e),t=!0)},o(e){Y(n.$$.fragment,e),t=!1},d(e){q(n,e)}}}function ze(e){var t,n,r,i,a=[be,Pe],s=[];function o(e){return"Text"===e.type?0:1}return t=o(e),n=s[t]=a[t](e),{c(){n.c(),r=h()},m(e,n){s[t].m(e,n),d(e,r,n),i=!0},p(e,i){var c=t;(t=o(i))===c?s[t].p(e,i):(j(),Y(s[c],1,1,()=>{s[c]=null}),H(),(n=s[t])||(n=s[t]=a[t](i)).c(),X(n,1),n.m(r.parentNode,r))},i(e){i||(X(n),i=!0)},o(e){Y(n),i=!1},d(e){s[t].d(e),e&&f(r)}}}function Te(e,t,n){let r,i,{_data:a}=t;return o(e,a,e=>{r=e,n("$_data",r)}),z(()=>{var e;n("type",i=(e=r)&&e.length>0?"Text":void 0)}),e.$set=e=>{"_data"in e&&n("_data",a=e._data)},{_data:a,type:i,$_data:r,textarea_input_handler:function(){a.set(this.value)}}}class Ee extends J{constructor(e){super(),G(this,e,Te,ze,s,["_data"])}}function ke(e){var t,n,r;return{c(){t=m("h2"),n=g(e.$_title),$(t,"class","svelte-18zfcs4"),r=v(t,"click",e.click_handler)},m(e,r){d(e,t,r),u(t,n)},p(e,t){e.$_title&&x(n,t.$_title)},d(e){e&&f(t),r()}}}function Me(e){var t,n;return{c(){$(t=m("input"),"type","text"),t.autofocus=!0,$(t,"class","svelte-18zfcs4"),n=[v(t,"input",e.input_input_handler),v(t,"blur",e.blur_handler)]},m(n,r){d(n,t,r),t.value=e.$_title,t.focus()},p(e,n){e.$_title&&t.value!==n.$_title&&(t.value=n.$_title)},d(e){e&&f(t),i(n)}}}function We(t){var n,r,i;return{c(){n=m("div"),r=g(t.type),i=g(" Widget type not yet implemented"),$(n,"class","svelte-18zfcs4")},m(e,t){d(e,n,t),u(n,r),u(n,i)},p:e,i:e,o:e,d(e){e&&f(n)}}}function Oe(e){var t,n=new Ee({props:{_data:e._data}});return{c(){n.$$.fragment.c()},m(e,r){B(n,e,r),t=!0},p(e,t){var r={};e._data&&(r._data=t._data),n.$set(r)},i(e){t||(X(n.$$.fragment,e),t=!0)},o(e){Y(n.$$.fragment,e),t=!1},d(e){q(n,e)}}}function Ae(e){var t,n,r,i,a,s,o;function c(e){return e.editingTitle?Me:ke}var l=c(e),g=l(e),h=[Oe,We],v=[];function x(e){return"Sticky"===e.type?0:1}r=x(e),i=v[r]=h[r](e);var w=new le({});return w.$on("trash",e.removeSelf),{c(){t=m("div"),g.c(),n=p(),i.c(),a=p(),s=m("span"),w.$$.fragment.c(),$(s,"class","svelte-18zfcs4"),$(t,"class","svelte-18zfcs4")},m(e,i){d(e,t,i),g.m(t,null),u(t,n),v[r].m(t,null),u(t,a),u(t,s),B(w,s,null),o=!0},p(e,s){l===(l=c(s))&&g?g.p(e,s):(g.d(1),(g=l(s))&&(g.c(),g.m(t,n)));var o=r;(r=x(s))===o?v[r].p(e,s):(j(),Y(v[o],1,1,()=>{v[o]=null}),H(),(i=v[r])||(i=v[r]=h[r](s)).c(),X(i,1),i.m(t,a))},i(e){o||(X(i),X(w.$$.fragment,e),o=!0)},o(e){Y(i),Y(w.$$.fragment,e),o=!1},d(e){e&&f(t),g.d(),v[r].d(),q(w)}}}function Le(e,t,n){let r,{ref:i}=t,{_title:a,_data:s,type:c}=ee(i);o(e,a,e=>{r=e,n("$_title",r)});let l=!1;return e.$set=e=>{"ref"in e&&n("ref",i=e.ref)},{ref:i,_title:a,_data:s,type:c,editingTitle:l,removeSelf:()=>{((e,t=V)=>{try{U.get(t).widgets.delete(e)&&U.get(t)._widgetsCount.update(e=>e-1)}catch(e){}})(i)},$_title:r,input_input_handler:function(){a.set(this.value)},blur_handler:function(){const e=l=!1;return n("editingTitle",l),e},click_handler:function(){const e=l=!0;return n("editingTitle",l),e}}}class Ie extends J{constructor(e){super(),G(this,e,Le,Ae,s,["ref"])}}const Se=(e,t=0)=>{let n;return function(...r){clearTimeout(n),n=setTimeout(()=>e.apply(this,r),t)}};function Ce(e){return{pageX:e.changedTouches?e.changedTouches[0].pageX:e.pageX,pageY:e.changedTouches?e.changedTouches[0].pageY:e.pageY}}function De(e){return Math.max(...e.map(e=>e.y+e.h),1)}const je=(e,t,n,r)=>{var i=!1,a=n;if(e)for(var s=e.length-1;s>=0;s--){const[n,r]=e[s];if(t<=n){i=!0,a=r;break}}return i||(a=r),a},He=(e,t)=>Array.from(Array(e),()=>new Array(t));function Xe(e,t,n,r){let i=He(n,r);for(var a=0;a<e.length;a++){const n=e[a],{x:r,y:c,w:l,h:u,id:d,responsive:{valueW:f}}=n;if(-1===t.indexOf(d))for(var s=c;s<c+u;s++){const e=i[s];if(e)for(var o=r;o<r+(l-f);o++)e[o]=n}}return i}function Ye(e,t,n=De(e)){let r=He(n,t);return e.forEach((n,i)=>{let a=e.slice(i+1).map(e=>e.id),s=function(e,t,n=[],r){const{w:i}=t;let a=t.responsive.valueW;for(var s=0;s<e.length;s++){const t=e[s];for(var o=0;o<t.length;o++){const e=t.findIndex(e=>void 0===e);if(-1!==e){for(var c=t.slice(e),l=c.length,u=0;u<c.length;u++)if(void 0!==c[u]){l=u;break}return a=Math.max(i-l,0),{y:s,x:e,responsive:{valueW:a}}}}}return a=Math.max(i-r,0),{y:De(n),x:0,responsive:{valueW:a}}}(r,n,e,t);e=e.map(e=>e.id===n.id?{...n,...s}:e),r=Xe(e,a,De(e),t)}),e}function Ne(e,t){const n=t.findIndex(t=>t.id===e);return{index:n,item:t[n]}}function Re(e,t,n=[]){let r=e[0].length-(t.w-t.responsive.valueW);for(var i=0;i<e.length;i++){const n=e[i];for(var a=0;a<r+1;a++){if(n.slice(a,a+(t.w-t.responsive.valueW)).every(e=>void 0===e)){if(e.slice(i,i+t.h).every(e=>e.slice(a,a+(t.w-t.responsive.valueW)).every(e=>void 0===e)))return{y:i,x:a}}}}return{y:De(n),x:0}}function Be(e,t,n){return n.id===e.id?{...e,...t}:n}const qe=(e,t,n)=>n.id===e.id?t:n;function Fe(e,t){return Math.max(De(e),2)*t}const{window:Ge}=N,Je=({item:e,items:t,i:n})=>({item:t,index:t}),Ke=({item:e,items:t,i:n})=>({item:e,index:n});function Qe(e,t,n){const r=Object.create(e);return r.item=t[n],r.i=n,r}function Ue(e){var t,n;return{c(){$(t=m("div"),"class","svlt-grid-resizer svelte-14tbpr7"),n=[v(t,"touchstart",e.resizeOnMouseDown.bind(this,e.item.id)),v(t,"mousedown",e.resizeOnMouseDown.bind(this,e.item.id))]},m(e,n){d(e,t,n)},p(t,n){e=n},d(e){e&&f(t),i(n)}}}function Ve(e,n){var r,a,s,o,l;const g=n.$$slots.default,h=function(e,t,n){if(e){const r=c(e,t,n);return e[0](r)}}(g,n,Ke);var x=n.item.resizable&&Ue(n);return{key:e,first:null,c(){r=m("div"),h&&h.c(),a=p(),x&&x.c(),$(r,"class","svlt-grid-item svelte-14tbpr7"),$(r,"style",s=(n.useTransform?`transform: translate(${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px, ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px);`:"")+";\n        "+(n.useTransform?"":`top: ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px`)+";\n        "+(n.useTransform?"":`left: ${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px`)+";\n        width: "+(n.item.resize.resizing?n.item.resize.width:n.item.w*n.xPerPx-2*n.gap-n.item.responsive.valueW*n.xPerPx)+"px;\n        height: "+(n.item.resize.resizing?n.item.resize.height:n.item.h*n.yPerPx-2*n.gap)+"px;\n        z-index: "+(n.item.drag.dragging||n.item.resize.resizing?3:1)+";\n        opacity: "+(n.item.resize.resizing?.5:1)),l=[v(r,"mousedown",n.item.draggable?n.dragOnMouseDown.bind(this,n.item.id):null),v(r,"touchstart",n.item.draggable?n.dragOnMouseDown.bind(this,n.item.id):null)],this.first=r},l(e){h&&h.l(div_nodes)},m(e,t){d(e,r,t),h&&h.m(r,null),u(r,a),x&&x.m(r,null),o=!0},p(e,i){n=i,h&&h.p&&(e.$$scope||e.items)&&h.p(function(e,n,r,i){return e[1]?t({},t(n.$$scope.changed||{},e[1](i?i(r):{}))):n.$$scope.changed||{}}(g,n,e,Je),c(g,n,Ke)),n.item.resizable?x||((x=Ue(n)).c(),x.m(r,null)):x&&(x.d(1),x=null),(!o||e.useTransform||e.items||e.xPerPx||e.gap)&&s!==(s=(n.useTransform?`transform: translate(${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px, ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px);`:"")+";\n        "+(n.useTransform?"":`top: ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px`)+";\n        "+(n.useTransform?"":`left: ${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px`)+";\n        width: "+(n.item.resize.resizing?n.item.resize.width:n.item.w*n.xPerPx-2*n.gap-n.item.responsive.valueW*n.xPerPx)+"px;\n        height: "+(n.item.resize.resizing?n.item.resize.height:n.item.h*n.yPerPx-2*n.gap)+"px;\n        z-index: "+(n.item.drag.dragging||n.item.resize.resizing?3:1)+";\n        opacity: "+(n.item.resize.resizing?.5:1))&&$(r,"style",s)},i(e){o||(X(h,e),o=!0)},o(e){Y(h,e),o=!1},d(e){e&&f(r),h&&h.d(e),x&&x.d(),i(l)}}}function Ze(e){var t,n;return{c(){$(t=m("div"),"class","svlt-grid-shadow svelte-14tbpr7"),$(t,"style",n=(e.useTransform?`transform: translate(${e.shadow.drag.dragging?e.shadow.drag.left:e.shadow.x*e.xPerPx+e.gap}px, ${e.shadow.drag.dragging?e.shadow.drag.top:e.shadow.y*e.yPerPx+e.gap}px);`:"")+";\n        "+(e.useTransform?"":`top: ${e.shadow.drag.dragging?e.shadow.drag.top:e.shadow.y*e.yPerPx+e.gap}px`)+";\n        "+(e.useTransform?"":`left: ${e.shadow.drag.dragging?e.shadow.drag.left:e.shadow.x*e.xPerPx+e.gap}px`)+";\n    width:"+(e.shadow.w*e.xPerPx-2*e.gap-e.shadow.responsive.valueW*e.xPerPx)+"px;\n    height:"+(e.shadow.h*e.yPerPx-2*e.gap)+"px;")},m(e,n){d(e,t,n)},p(e,r){(e.useTransform||e.shadow||e.xPerPx||e.gap)&&n!==(n=(r.useTransform?`transform: translate(${r.shadow.drag.dragging?r.shadow.drag.left:r.shadow.x*r.xPerPx+r.gap}px, ${r.shadow.drag.dragging?r.shadow.drag.top:r.shadow.y*r.yPerPx+r.gap}px);`:"")+";\n        "+(r.useTransform?"":`top: ${r.shadow.drag.dragging?r.shadow.drag.top:r.shadow.y*r.yPerPx+r.gap}px`)+";\n        "+(r.useTransform?"":`left: ${r.shadow.drag.dragging?r.shadow.drag.left:r.shadow.x*r.xPerPx+r.gap}px`)+";\n    width:"+(r.shadow.w*r.xPerPx-2*r.gap-r.shadow.responsive.valueW*r.xPerPx)+"px;\n    height:"+(r.shadow.h*r.yPerPx-2*r.gap)+"px;")&&$(t,"style",n)},d(e){e&&f(t)}}}function et(e){var t,n,r,i,a=[],s=new Map,o=e.items;const c=e=>e.item.id;for(var l=0;l<o.length;l+=1){let t=Qe(e,o,l),n=c(t);s.set(n,a[l]=Ve(n,t))}var g=e.shadow.active&&Ze(e);return{c(){for(t=m("div"),l=0;l<a.length;l+=1)a[l].c();n=p(),g&&g.c(),$(t,"class","svlt-grid-container svelte-14tbpr7"),w(t,"height",e.ch+"px"),y(t,"svlt-grid-transition",!e.focuesdItem),i=v(Ge,"resize",Se(e.onResize,300))},m(i,s){for(d(i,t,s),l=0;l<a.length;l+=1)a[l].m(t,null);u(t,n),g&&g.m(t,null),e.div_binding(t),r=!0},p(e,i){const o=i.items;j(),a=function(e,t,n,r,i,a,s,o,c,l,u,d){let f=e.length,m=a.length,g=f;const p={};for(;g--;)p[e[g].key]=g;const h=[],v=new Map,$=new Map;for(g=m;g--;){const e=d(i,a,g),o=n(e);let c=s.get(o);c?r&&c.p(t,e):(c=l(o,e),c.c()),v.set(o,h[g]=c),o in p&&$.set(o,Math.abs(g-p[o]))}const x=new Set,w=new Set;function y(e){X(e,1),e.m(o,u),s.set(e.key,e),u=e.first,m--}for(;f&&m;){const t=h[m-1],n=e[f-1],r=t.key,i=n.key;t===n?(u=t.first,f--,m--):v.has(i)?!s.has(r)||x.has(r)?y(t):w.has(i)?f--:$.get(r)>$.get(i)?(w.add(r),y(t)):(x.add(i),f--):(c(n,s),f--)}for(;f--;){const t=e[f];v.has(t.key)||c(t,s)}for(;m;)y(h[m-1]);return h}(a,e,c,1,i,o,s,t,R,Ve,n,Qe),H(),i.shadow.active?g?g.p(e,i):((g=Ze(i)).c(),g.m(t,null)):g&&(g.d(1),g=null),r&&!e.ch||w(t,"height",i.ch+"px"),e.focuesdItem&&y(t,"svlt-grid-transition",!i.focuesdItem)},i(e){if(!r){for(var t=0;t<o.length;t+=1)X(a[t]);r=!0}},o(e){for(l=0;l<a.length;l+=1)Y(a[l]);r=!1},d(n){for(n&&f(t),l=0;l<a.length;l+=1)a[l].d();g&&g.d(),e.div_binding(null),i()}}}function tt(e,t,n){let r,i,a,s,o,c,l,u,{useTransform:d=!1,items:f=[],cols:m=0,dragDebounceMs:g=350,gap:p=0,rowHeight:h=150,breakpoints:v,fillEmpty:$=!0}=t,x=h,w=m,y={w:0,h:0,x:0,y:0,active:!1,id:null,responsive:{valueW:0},min:{},max:{}},_=Fe(f,x);const P=T(),E=()=>document.documentElement.clientWidth;var M;let W,O,A,L;function I(e){let{pageX:t,pageY:r}=Ce(e);t-=a.x,r-=a.y;const l=L+r-O,d=A+(t-W),{responsive:{valueW:m}}=i;let g=Math.round(d/s)+m;const{h:p=1,w:h=1}=i.min,{h:v,w:$=c-i.x+m}=i.max;g=Math.min(Math.max(g,h),$);let w=Math.round(l/x);v&&(w=Math.min(w,v)),w=Math.max(w,p),n("shadow",y={...y,w:g,h:w});let _=f[o];f[o]={..._,resize:{resizing:!0,width:d,height:l},w:g,h:w},n("items",f),u||j()}function S(e){e.stopPropagation();let t=f[o];f[o]={...t,resize:{resizing:!1,width:0,height:0}},n("items",f),window.removeEventListener("mousemove",I,!1),window.removeEventListener("touchmove",I,!1),window.removeEventListener("mouseup",S,!1),window.removeEventListener("touchend",S,!1),n("shadow",y={...y,w:0,h:0,x:0,y:0,active:!1,id:null,responsive:{valueW:0},min:{},max:{}}),N(),n("focuesdItem",i=void 0),u=!1}M=()=>{a=r.getBoundingClientRect();let e=je(v,E(),m,w);c=e,l=document.documentElement.clientWidth,v&&n("items",f=Ye(f,e)),n("xPerPx",s=a.width/e),P("mount",{cols:e,xPerPx:s,yPerPx:x})},b().$$.on_mount.push(M);let C=0,D=0;const j=Se(N,g);let H={};function X(e){e.stopPropagation();let{pageX:t,pageY:r}=Ce(e);const l=r-a.y,u=t-a.x;let d=Math.round((u-C)/s),m=Math.round((l-D)/x);d=Math.max(Math.min(d,c-(i.w-i.responsive.valueW)),0),m=Math.max(m,0);let g=f[o];f[o]={...g,drag:{dragging:!0,top:l-D,left:u-C},x:d,y:m},n("items",f),n("shadow",y={...y,x:d,y:m}),j()}function Y(e){window.removeEventListener("mousemove",X,!1),window.removeEventListener("touchmove",X,!1),window.removeEventListener("mouseup",Y,!1),window.removeEventListener("touchend",Y,!1);let t=f[o];f[o]={...t,drag:{dragging:!1,top:0,left:0}},n("items",f),C=0,D=0,n("shadow",y={...y,w:0,h:0,x:0,y:0,active:!1,id:null}),N(),n("focuesdItem",i=void 0)}function N(e){const t=f[o];let r=je(v,E(),m,w),i=function(e,t,n,r){let i=Xe(t,[e.id],De(t),n);const a=function(e,t,n){const{w:r,h:i,x:a,y:s,responsive:{valueW:o}}=n,c=t.slice(s,s+i);let l=[];for(var u=0;u<c.length;u++){let e=c[u].slice(a,a+(r-o));l=[...l,...e.map(e=>e&&e.id).filter(e=>e)]}return[...l.filter((e,t)=>l.indexOf(e)==t)]}(0,i,e);let s=function(e,t){return t.filter(t=>-1!==e.indexOf(t.id))}(a,t);if(s.find(e=>e.static)&&r)return t.map(qe.bind(null,e,r));i=Xe(t,a,De(t),n);let o=t,c=a,l=[];return s.forEach(e=>{let r=Re(i,e,o);if(l.push(e.id),r){o=o.map(Be.bind(null,e,r));let a=c.filter(e=>-1===l.indexOf(e));i=Xe(o,a,De(t),n)}}),o}(t,f,r,H);$&&i.forEach(e=>{e.id!==t.id&&(i=i.map(t=>t.id===e.id?{...t,...Re(Xe(i,[e.id],De(i),r),e,i)}:t))}),n("items",f=i),P("adjust",{focuesdItem:t})}z(()=>{i||(n("ch",_=Fe(f,x)),m!==w&&a&&(n("xPerPx",s=a.width/m),w=m))});let{$$slots:R={},$$scope:B}=t;return e.$set=e=>{"useTransform"in e&&n("useTransform",d=e.useTransform),"items"in e&&n("items",f=e.items),"cols"in e&&n("cols",m=e.cols),"dragDebounceMs"in e&&n("dragDebounceMs",g=e.dragDebounceMs),"gap"in e&&n("gap",p=e.gap),"rowHeight"in e&&n("rowHeight",h=e.rowHeight),"breakpoints"in e&&n("breakpoints",v=e.breakpoints),"fillEmpty"in e&&n("fillEmpty",$=e.fillEmpty),"$$scope"in e&&n("$$scope",B=e.$$scope)},{useTransform:d,items:f,cols:m,dragDebounceMs:g,gap:p,rowHeight:h,breakpoints:v,fillEmpty:$,container:r,focuesdItem:i,xPerPx:s,yPerPx:x,shadow:y,ch:_,onResize:function(){let e=document.documentElement.clientWidth;if(e!==l){l=e,a=r.getBoundingClientRect();let t=je(v,e,m,w);c=t,n("xPerPx",s=a.width/t),P("resize",{cols:t,xPerPx:s,yPerPx:x}),v&&n("items",f=Ye(f,t))}},resizeOnMouseDown:function(e,t){t.stopPropagation();let{pageX:r,pageY:l}=Ce(t);const{item:d,index:g}=Ne(e,f);o=g,n("focuesdItem",i=d),H={...d},u=d.h+d.y===De(f),n("shadow",y={...y,...i,active:!0}),W=r-a.x,O=l-a.y,A=d.w*s-2*p-i.responsive.valueW*s,L=d.h*x-2*p,c=je(v,E(),m,w),window.addEventListener("mousemove",I,!1),window.addEventListener("touchmove",I,!1),window.addEventListener("mouseup",S,!1),window.addEventListener("touchend",S,!1)},dragOnMouseDown:function(e,t){t.stopPropagation();let{pageX:r,pageY:s}=Ce(t);const{item:l,index:u}=Ne(e,f);o=u,n("focuesdItem",i=l),H={...l},n("shadow",y={...y,...l,active:!0});let g,p,{currentTarget:h}=t;if(d){const{x:e,y:t}=($=h.style.transform,x=($=$.slice(10,-3)).indexOf("px, "),{x:+$.slice(0,x),y:+$.slice(x+4)});g=e,p=t}else g=h.offsetLeft,p=h.offsetTop;var $,x;r-=a.x,s-=a.y,C=r-g,D=s-p,c=je(v,E(),m,w),l?(window.addEventListener("mousemove",X,!1),window.addEventListener("touchmove",X,!1),window.addEventListener("mouseup",Y,!1),window.addEventListener("touchend",Y,!1)):console.warn("Can not get item")},div_binding:function(e){k[e?"unshift":"push"](()=>{n("container",r=e)})},$$slots:R,$$scope:B}}class nt extends J{constructor(e){super(),G(this,e,tt,et,s,["useTransform","items","cols","dragDebounceMs","gap","rowHeight","breakpoints","fillEmpty"])}}function rt(e){return Math.max(...e.map(e=>e.y+e.h),1)}const it=(e,t)=>Array.from(Array(e),()=>new Array(t));function at(e,t,n,r){let i=it(n,r);for(var a=0;a<e.length;a++){const n=e[a],{x:r,y:c,w:l,h:u,id:d,responsive:{valueW:f}}=n;if(-1===t.indexOf(d))for(var s=c;s<c+u;s++){const e=i[s];if(e)for(var o=r;o<r+(l-f);o++)e[o]=n}}return i}function st(e,t,n=rt(e)){let r=it(n,t);return e.forEach((n,i)=>{let a=e.slice(i+1).map(e=>e.id),s=function(e,t,n=[],r){const{w:i}=t;let a=t.responsive.valueW;for(var s=0;s<e.length;s++){const t=e[s];for(var o=0;o<t.length;o++){const e=t.findIndex(e=>void 0===e);if(-1!==e){for(var c=t.slice(e),l=c.length,u=0;u<c.length;u++)if(void 0!==c[u]){l=u;break}return a=Math.max(i-l,0),{y:s,x:e,responsive:{valueW:a}}}}}return a=Math.max(i-r,0),{y:rt(n),x:0,responsive:{valueW:a}}}(r,n,e,t);e=e.map(e=>e.id===n.id?{...n,...s}:e),r=at(e,a,rt(e),t)}),e}function ot(e,t,n=[]){let r=e[0].length-(t.w-t.responsive.valueW);for(var i=0;i<e.length;i++){const n=e[i];for(var a=0;a<r+1;a++){if(n.slice(a,a+(t.w-t.responsive.valueW)).every(e=>void 0===e)){if(e.slice(i,i+t.h).every(e=>e.slice(a,a+(t.w-t.responsive.valueW)).every(e=>void 0===e)))return{y:i,x:a}}}}return{y:rt(n),x:0}}function ct(e,t,n){return n.id===e.id?{...e,...t}:n}const lt=(e,t,n)=>n.id===e.id?t:n;const ut={findSpaceForItem:(e,t,n)=>ot(function(e,t=rt(e),n){let r=it(t,n);for(var i=0;i<e.length;i++){const t=e[i],{x:n,y:o,w:c,h:l,responsive:{valueW:u}}=t;for(var a=o;a<o+l;a++){const e=r[a];for(var s=n;s<n+(c-u);s++)e[s]=t}}return r}(t,rt(t),n),e,t),appendItem:(e,t,n)=>function(e,t,n,r){let i=at(t,[e.id],rt(t),n);const a=function(e,t,n){const{w:r,h:i,x:a,y:s,responsive:{valueW:o}}=n,c=t.slice(s,s+i);let l=[];for(var u=0;u<c.length;u++){let e=c[u].slice(a,a+(r-o));l=[...l,...e.map(e=>e&&e.id).filter(e=>e)]}return[...l.filter((e,t)=>l.indexOf(e)==t)]}(0,i,e);let s=function(e,t){return t.filter(t=>-1!==e.indexOf(t.id))}(a,t);if(s.find(e=>e.static)&&r)return t.map(lt.bind(null,e,r));i=at(t,a,rt(t),n);let o=t,c=a,l=[];return s.forEach(e=>{let r=ot(i,e,o);if(l.push(e.id),r){o=o.map(ct.bind(null,e,r));let a=c.filter(e=>-1===l.indexOf(e));i=at(o,a,rt(t),n)}}),o}(e,[...t,e],n),resizeItems:(e,t,n)=>st(e,t,n),item(e){return{drag:{top:null,left:null,dragging:!1},resize:{width:null,height:null,resizing:!1},responsive:{valueW:0},static:!1,resizable:!(t=e).static,draggable:!t.static,min:{...t.min},max:{...t.max},...t};var t}};function dt(e){var t,n,r=new Ie({props:{ref:e.item.id}});return{c(){t=m("div"),r.$$.fragment.c(),$(t,"class","content svelte-h8m2o2")},m(e,i){d(e,t,i),B(r,t,null),n=!0},p(e,t){var n={};e.item&&(n.ref=t.item.id),r.$set(n)},i(e){n||(X(r.$$.fragment,e),n=!0)},o(e){Y(r.$$.fragment,e),n=!1},d(e){e&&f(t),q(r)}}}function ft(e){var t,n,r;function i(t){var r;e.grid_items_binding.call(null,t),n=!0,r=()=>n=!1,W.push(r)}let a={fillEmpty:!1,items:e.items_arr,cols:mt,rowHeight:100,gap:20,$$slots:{default:[dt,({item:e})=>({item:e})]},$$scope:{ctx:e}};void 0!==e.items_arr&&(a.items=e.items_arr);var s=new nt({props:a});return k.push(()=>{return t="items",n=i,void(-1!==(e=s).$$.props.indexOf(t)&&(e.$$.bound[t]=n,n(e.$$.ctx[t])));var e,t,n}),s.$on("adjust",e.adjust_handler),{c(){t=m("div"),s.$$.fragment.c(),$(t,"class","grid-container svelte-h8m2o2")},m(e,n){d(e,t,n),B(s,t,null),r=!0},p(e,t){var r={};e.items_arr&&(r.items=t.items_arr),e.cols&&(r.cols=mt),e.$$scope&&(r.$$scope={changed:e,ctx:t}),!n&&e.items_arr&&(r.items=t.items_arr),s.$set(r)},i(e){r||(X(s.$$.fragment,e),r=!0)},o(e){Y(s.$$.fragment,e),r=!1},d(e){e&&f(t),q(s)}}}let mt=10;function gt(e,t,n){let r,i=[],a=Z()._widgetsCount;o(e,a,e=>{r=e,n("$_widgetsCount",r)});const s=e=>{const{w:t,h:n,x:r,y:i}=e;((e,t)=>{try{Z().widgets.get(e).sizeAndPos=t}catch(e){}})(e.id,{w:t,h:n,x:r,y:i})};let c=[];return z(()=>{r!==c.length&&(n("items_arr",i=[]),c=Array.from(Z().widgets.keys()),c.forEach(e=>{let{w:t,h:r,x:a,y:s}=ee(e).sizeAndPos,o=ut.item({w:t,h:r,x:a,y:s,id:e});n("items_arr",i=ut.appendItem(o,i,mt))}),i.forEach(e=>{s(e)}))}),{items_arr:i,_widgetsCount:a,updateWidgetSizeAndPos:s,grid_items_binding:function(e){i=e,n("items_arr",i)},adjust_handler:function(e){return s(e.detail.focuesdItem)}}}class pt extends J{constructor(e){super(),G(this,e,gt,ft,s,[])}}function ht(e){var t,n,r,i,a;return{c(){t=m("img"),n=p(),r=m("div"),(i=m("button")).innerHTML='<h3 class="svelte-f9anrd">Sticky</h3> <img src="/images/addIcon.svg" alt="+">',$(t,"class","cancel svelte-f9anrd"),$(t,"src","/images/cancelIcon.svg"),$(t,"alt","x"),$(i,"class","svelte-f9anrd"),$(r,"class","menu svelte-f9anrd"),a=v(i,"click",e.click_handler)},m(e,a){d(e,t,a),d(e,n,a),d(e,r,a),u(r,i)},d(e){e&&(f(t),f(n),f(r)),a()}}}function vt(e){var t,n,r,i,a,s,o,c=new le({props:{active:e.trashActive}});c.$on("trash",e.toggleTrash),c.$on("trash",e.trash_handler);var l=e.menuOpen&&ht(e),g=new fe({props:{active:e.menuOpen}});return g.$on("add",e.toggleMenu),{c(){t=m("div"),n=m("nav"),c.$$.fragment.c(),r=p(),l&&l.c(),i=p(),(a=m("h2")).textContent="Widgets",s=p(),g.$$.fragment.c(),$(a,"class","svelte-f9anrd"),$(n,"class","svelte-f9anrd"),$(t,"class","menuArea svelte-f9anrd")},m(e,f){d(e,t,f),u(t,n),B(c,n,null),u(n,r),l&&l.m(n,null),u(n,i),u(n,a),u(n,s),B(g,n,null),o=!0},p(e,t){var r={};e.trashActive&&(r.active=t.trashActive),c.$set(r),t.menuOpen?l||((l=ht(t)).c(),l.m(n,i)):l&&(l.d(1),l=null);var a={};e.menuOpen&&(a.active=t.menuOpen),g.$set(a)},i(e){o||(X(c.$$.fragment,e),X(g.$$.fragment,e),o=!0)},o(e){Y(c.$$.fragment,e),Y(g.$$.fragment,e),o=!1},d(e){e&&f(t),q(c),l&&l.d(),q(g)}}}function $t(e,t,n){let r=!1,i=!1;const a=()=>{setTimeout(()=>{r&&n("menuOpen",r=!1)},0),window.removeEventListener("click",a,{capture:!0})},s=e=>{te(e),a()};return{menuOpen:r,trashActive:i,toggleMenu:()=>{r?a():(n("menuOpen",r=!0),window.addEventListener("click",a,{capture:!0}))},toggleTrash:()=>{n("trashActive",i=!i)},add:s,trash_handler:function(t){!function(e,t){const n=e.$$.callbacks[t.type];n&&n.slice().forEach(e=>e(t))}(e,t)},click_handler:function(){return s("Sticky")}}}class xt extends J{constructor(e){super(),G(this,e,$t,vt,s,[])}}function wt(e){var t,n,r,i,a,s=new ve({}),o=new pt({}),c=new xt({});return c.$on("trash",e.activateTrash),{c(){t=m("main"),s.$$.fragment.c(),n=p(),o.$$.fragment.c(),r=p(),c.$$.fragment.c(),$(t,"class",i=e.trashActive?"trash":"")},m(e,i){d(e,t,i),B(s,t,null),u(t,n),B(o,t,null),u(t,r),B(c,t,null),a=!0},p(e,n){a&&!e.trashActive||i===(i=n.trashActive?"trash":"")||$(t,"class",i)},i(e){a||(X(s.$$.fragment,e),X(o.$$.fragment,e),X(c.$$.fragment,e),a=!0)},o(e){Y(s.$$.fragment,e),Y(o.$$.fragment,e),Y(c.$$.fragment,e),a=!1},d(e){e&&f(t),q(s),q(o),q(c)}}}function yt(e,t,n){let r=!1;return{trashActive:r,activateTrash:e=>{n("trashActive",r=e.detail.active)}}}return new class extends J{constructor(e){super(),G(this,e,yt,wt,s,[])}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map

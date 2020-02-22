var app=function(){"use strict";function t(){}function e(t,e){for(const n in e)t[n]=e[n];return t}function n(t){return t()}function r(){return Object.create(null)}function i(t){t.forEach(n)}function a(t){return"function"==typeof t}function s(t,e){return t!=t?e==e:t!==e||t&&"object"==typeof t||"function"==typeof t}function o(t,e,n){t.$$.on_destroy.push(function(t,e){const n=t.subscribe(e);return n.unsubscribe?()=>n.unsubscribe():n}(e,n))}function c(t,n,r){return t[1]?e({},e(n.$$scope.ctx,t[1](r?r(n):{}))):n.$$scope.ctx}function l(t){return null==t?"":t}function d(t,e){t.appendChild(e)}function u(t,e,n){t.insertBefore(e,n||null)}function f(t){t.parentNode.removeChild(t)}function m(t){return document.createElement(t)}function h(t){return document.createTextNode(t)}function p(){return h(" ")}function g(){return h("")}function v(t,e,n,r){return t.addEventListener(e,n,r),()=>t.removeEventListener(e,n,r)}function w(t,e,n){null==n?t.removeAttribute(e):t.setAttribute(e,n)}function $(t,e){e=""+e,t.data!==e&&(t.data=e)}function y(t,e,n){t.style.setProperty(e,n)}function x(t,e,n){t.classList[n?"add":"remove"](e)}let _;function b(t){_=t}function P(){if(!_)throw new Error("Function called outside component initialization");return _}function k(t){P().$$.before_update.push(t)}function A(){const t=_;return(e,n)=>{const r=t.$$.callbacks[e];if(r){const i=function(t,e){const n=document.createEvent("CustomEvent");return n.initCustomEvent(t,!1,!1,e),n}(e,n);r.slice().forEach(e=>{e.call(t,i)})}}}const z=[],E=[],I=[],T=[],M=Promise.resolve();let W=!1;function O(t){I.push(t)}function L(){const t=new Set;do{for(;z.length;){const t=z.shift();b(t),C(t.$$)}for(;E.length;)E.pop()();for(let e=0;e<I.length;e+=1){const n=I[e];t.has(n)||(n(),t.add(n))}I.length=0}while(z.length);for(;T.length;)T.pop()();W=!1}function C(t){t.fragment&&(t.update(t.dirty),i(t.before_update),t.fragment.p(t.dirty,t.ctx),t.dirty=null,t.after_update.forEach(O))}const D=new Set;let S;function N(){S={r:0,c:[],p:S}}function j(){S.r||i(S.c),S=S.p}function H(t,e){t&&t.i&&(D.delete(t),t.i(e))}function Y(t,e,n,r){if(t&&t.o){if(D.has(t))return;D.add(t),S.c.push(()=>{D.delete(t),r&&(n&&t.d(1),r())}),t.o(e)}}const R="undefined"!=typeof window?window:global;function X(t,e){Y(t,1,1,()=>{e.delete(t.key)})}function F(t,e,r){const{fragment:s,on_mount:o,on_destroy:c,after_update:l}=t.$$;s.m(e,r),O(()=>{const e=o.map(n).filter(a);c?c.push(...e):i(e),t.$$.on_mount=[]}),l.forEach(O)}function B(t,e){t.$$.fragment&&(i(t.$$.on_destroy),t.$$.fragment.d(e),t.$$.on_destroy=t.$$.fragment=null,t.$$.ctx={})}function q(t,e){t.$$.dirty||(z.push(t),W||(W=!0,M.then(L)),t.$$.dirty=r()),t.$$.dirty[e]=!0}function G(e,n,a,s,o,c){const l=_;b(e);const d=n.props||{},u=e.$$={fragment:null,ctx:null,props:c,update:t,not_equal:o,bound:r(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(l?l.$$.context:[]),callbacks:r(),dirty:null};let f=!1;u.ctx=a?a(e,d,(t,n)=>{u.ctx&&o(u.ctx[t],u.ctx[t]=n)&&(u.bound[t]&&u.bound[t](n),f&&q(e,t))}):d,u.update(),f=!0,i(u.before_update),u.fragment=s(u.ctx),n.target&&(n.hydrate?u.fragment.l(function(t){return Array.from(t.childNodes)}(n.target)):u.fragment.c(),n.intro&&H(e.$$.fragment),F(e,n.target,n.anchor),L()),b(l)}class J{$destroy(){B(this,1),this.$destroy=t}$on(t,e){const n=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return n.push(e),()=>{const t=n.indexOf(e);-1!==t&&n.splice(t,1)}}$set(){}}const K=[];function Q(e,n=t){let r;const i=[];function a(t){if(s(e,t)&&(e=t,r)){const t=!K.length;for(let t=0;t<i.length;t+=1){const n=i[t];n[1](),K.push(n,e)}if(t){for(let t=0;t<K.length;t+=2)K[t][0](K[t+1]);K.length=0}}}return{set:a,update:function(t){a(t(e))},subscribe:function(s,o=t){const c=[s,o];return i.push(c),1===i.length&&(r=n(a)||t),s(e),()=>{const t=i.indexOf(c);-1!==t&&i.splice(t,1),0===i.length&&(r(),r=null)}}}}const U=new Map,V=Symbol(),Z=()=>U.get(V),tt=t=>Z().widgets.get(t),et=()=>Array.from(Z().widgets.values()),nt=(t,e=Symbol())=>{try{const n={_title:Q(t),widgets:new Map,_widgetsCount:Q(0)};U.set(e,n)}catch(t){}},rt=(t,e="",n="",r={w:4,h:5})=>{const i=Math.max(...et().map(t=>t.sizeAndPos.y+t.sizeAndPos.h))-1;if(void 0===r.x){const t=et(),e=Math.max(...t.map(t=>t.sizeAndPos.x+t.sizeAndPos.w))-1,n=Math.max(...t.filter(({sizeAndPos:t})=>t.y===i+1-t.h).map(({sizeAndPos:t})=>t.x+t.w));r.x=r.w<e-n?n:0}void 0===r.y&&(r.y=r.x>0?i-r.h+1:i+1);try{const i={type:t,sizeAndPos:r,_title:Q(e),_data:Q(n)};Z().widgets.set(Symbol(),i),Z()._widgetsCount.update(t=>t+1)}catch(t){}};function it(e){var n,r;return{c(){(n=m("button")).innerHTML='<img src="/images/arrowRightIcon.svg" alt="prev">',w(n,"class","svelte-1l6716q"),r=v(n,"click",e.left)},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&f(n),r()}}}function at(t){const e=A();return{left:()=>{e("left")}}}nt("Prototype",V),rt("Sticky","Welcome","This is currently only a prototype. The concept is a personal dash space for organising activities. At the moment functionality is limited.",{w:8,h:5,x:0,y:0}),rt("Sticky","Widgets","These are the building block. Each has an editiable title. You can resize and drag and drop them.",{w:8,h:6,x:8,y:4}),rt("Sticky","Sticky","A type of Widget. Currently the only type available for the prototype. It accepts a text input. Future versions will accept and automatically convert image urls, dates, links, and todo lists.",{w:8,h:5,x:0,y:6}),rt("Sticky","Add Widget","You may add more widgets using the widgets menu in the bottom right corner.",{w:8,h:5,x:0,y:8}),rt("Sticky","Delete Widgets","You can remove widgets by activating the trash from the widgets menu and clicking the trash icon within each widget to be removed.",{w:8,h:5,x:16,y:8});class st extends J{constructor(t){super(),G(this,t,at,it,s,[])}}function ot(e){var n,r;return{c(){(n=m("button")).innerHTML='<img src="/images/arrowRightIcon.svg" alt="next">',w(n,"class","svelte-1bwa45r"),r=v(n,"click",e.right)},m(t,e){u(t,n,e)},p:t,i:t,o:t,d(t){t&&f(n),r()}}}function ct(t){const e=A();return{right:()=>{e("right")}}}class lt extends J{constructor(t){super(),G(this,t,ct,ot,s,[])}}function dt(t){var e,n,r;return{c(){w(e=m("img"),"class",n="cancel "+t.cancelPos+" svelte-1gmxc8e"),w(e,"src","/images/cancelIcon.svg"),w(e,"alt","x"),r=v(e,"click",t.trash)},m(t,n){u(t,e,n)},p(t,r){t.cancelPos&&n!==(n="cancel "+r.cancelPos+" svelte-1gmxc8e")&&w(e,"class",n)},d(t){t&&f(e),r()}}}function ut(e){var n,r,i,a,s,o=e.active&&dt(e);return{c(){n=m("button"),o&&o.c(),r=p(),w(i=m("img"),"src","/images/TrashIcon.svg"),w(i,"alt","-"),w(n,"class",a=l(e.active?"active":"")+" svelte-1gmxc8e"),s=v(n,"click",e.trash)},m(t,e){u(t,n,e),o&&o.m(n,null),d(n,r),d(n,i)},p(t,e){e.active?o?o.p(t,e):((o=dt(e)).c(),o.m(n,r)):o&&(o.d(1),o=null),t.active&&a!==(a=l(e.active?"active":"")+" svelte-1gmxc8e")&&w(n,"class",a)},i:t,o:t,d(t){t&&f(n),o&&o.d(),s()}}}function ft(t,e,n){let{active:r,cancelPos:i="top"}=e;const a=A();return t.$set=t=>{"active"in t&&n("active",r=t.active),"cancelPos"in t&&n("cancelPos",i=t.cancelPos)},{active:r,cancelPos:i,trash:()=>{a("trash",{active:!r})}}}class mt extends J{constructor(t){super(),G(this,t,ft,ut,s,["active","cancelPos"])}}function ht(e){var n,r,i,a;return{c(){n=m("button"),w(r=m("img"),"src","/images/addIcon.svg"),w(r,"alt","+"),w(n,"class",i=l(e.active?"active":"")+" svelte-9b9csn"),a=v(n,"click",e.add)},m(t,e){u(t,n,e),d(n,r)},p(t,e){t.active&&i!==(i=l(e.active?"active":"")+" svelte-9b9csn")&&w(n,"class",i)},i:t,o:t,d(t){t&&f(n),a()}}}function pt(t,e,n){let{active:r}=e;const i=A();return t.$set=t=>{"active"in t&&n("active",r=t.active)},{active:r,add:()=>i("add")}}class gt extends J{constructor(t){super(),G(this,t,pt,ht,s,["active"])}}function vt(t,e=!1){this.isOpen=e,this.update=t,this.close=this.close.bind(this),this.open=this.open.bind(this),this.toggle=this.toggle.bind(this)}function wt(t,e,n){const r=Object.create(t);return r.dash=e[n],r}function $t(t){var e,n,r,a,s,o,c,l,g,y,x,_,b,P,k,A,z,E,I,T,M,W,O,L,C,D=t.displayArr[1].title,S=t.displayArr[2].title,N=t.displayArr[3].title,j=t.displayArr[5].title,H=t.displayArr[6].title,Y=t.displayArr[7].title,R=t.displayArr[7].title,X=!t.showNewDashInput&&xt(t);function F(t){return t.showNewDashInput?bt:_t}var B=F(t),q=B(t);return{c(){e=m("div"),X&&X.c(),n=p(),r=m("button"),a=h(D),s=p(),o=m("button"),c=h(S),l=p(),g=m("button"),y=h(N),x=p(),q.c(),_=p(),b=m("button"),P=h(j),k=p(),A=m("button"),z=h(H),E=p(),I=m("button"),T=h(Y),M=p(),W=m("button"),O=h(R),w(r,"class","prev-3 svelte-2amvy6"),w(o,"class","prev-2 svelte-2amvy6"),w(g,"class","prev svelte-2amvy6"),w(b,"class","next svelte-2amvy6"),w(A,"class","next-2 svelte-2amvy6"),w(I,"class","next-3 svelte-2amvy6"),w(W,"class","next-4 svelte-2amvy6"),w(e,"class",L="carousel "+t.animationClass+" svelte-2amvy6"),C=[v(o,"click",t.click_handler_1),v(g,"click",t.click_handler_2),v(b,"click",t.click_handler_4),v(A,"click",t.click_handler_5)]},m(t,i){u(t,e,i),X&&X.m(e,null),d(e,n),d(e,r),d(r,a),d(e,s),d(e,o),d(o,c),d(e,l),d(e,g),d(g,y),d(e,x),q.m(e,null),d(e,_),d(e,b),d(b,P),d(e,k),d(e,A),d(A,z),d(e,E),d(e,I),d(I,T),d(e,M),d(e,W),d(W,O)},p(t,r){r.showNewDashInput?X&&(X.d(1),X=null):X?X.p(t,r):((X=xt(r)).c(),X.m(e,n)),t.displayArr&&D!==(D=r.displayArr[1].title)&&$(a,D),t.displayArr&&S!==(S=r.displayArr[2].title)&&$(c,S),t.displayArr&&N!==(N=r.displayArr[3].title)&&$(y,N),B===(B=F(r))&&q?q.p(t,r):(q.d(1),(q=B(r))&&(q.c(),q.m(e,_))),t.displayArr&&j!==(j=r.displayArr[5].title)&&$(P,j),t.displayArr&&H!==(H=r.displayArr[6].title)&&$(z,H),t.displayArr&&Y!==(Y=r.displayArr[7].title)&&$(T,Y),t.displayArr&&R!==(R=r.displayArr[7].title)&&$(O,R),t.animationClass&&L!==(L="carousel "+r.animationClass+" svelte-2amvy6")&&w(e,"class",L)},d(t){t&&f(e),X&&X.d(),q.d(),i(C)}}}function yt(t){for(var e,n=t.dashList,r=[],i=0;i<n.length;i+=1)r[i]=At(wt(t,n,i));return{c(){e=m("div");for(var t=0;t<r.length;t+=1)r[t].c();w(e,"class","trashMenu svelte-2amvy6")},m(t,n){u(t,e,n);for(var i=0;i<r.length;i+=1)r[i].m(e,null)},p(t,i){if(t.dashList){n=i.dashList;for(var a=0;a<n.length;a+=1){const s=wt(i,n,a);r[a]?r[a].p(t,s):(r[a]=At(s),r[a].c(),r[a].m(e,null))}for(;a<r.length;a+=1)r[a].d(1);r.length=n.length}},d(t){t&&f(e),function(t,e){for(let n=0;n<t.length;n+=1)t[n]&&t[n].d(e)}(r,t)}}}function xt(t){var e,n,r=t.displayArr[0].title;return{c(){e=m("button"),n=h(r),w(e,"class","prev-4 svelte-2amvy6")},m(t,r){u(t,e,r),d(e,n)},p(t,e){t.displayArr&&r!==(r=e.displayArr[0].title)&&$(n,r)},d(t){t&&f(e)}}}function _t(t){var e;function n(t){return t.editingTitle?kt:Pt}var r=n(t),i=r(t);return{c(){e=m("div"),i.c(),w(e,"class","current svelte-2amvy6")},m(t,n){u(t,e,n),i.m(e,null)},p(t,a){r===(r=n(a))&&i?i.p(t,a):(i.d(1),(i=r(a))&&(i.c(),i.m(e,null)))},d(t){t&&f(e),i.d()}}}function bt(t){var e,n,r,i,a,s,o=t.displayArr[4].title;return{c(){e=m("button"),n=h(o),r=p(),i=m("div"),a=m("input"),w(e,"class","prev svelte-2amvy6"),a.autofocus=!0,w(a,"class","svelte-2amvy6"),w(i,"class","current svelte-2amvy6"),s=v(a,"change",t.change_handler)},m(t,s){u(t,e,s),d(e,n),u(t,r,s),u(t,i,s),d(i,a),a.focus()},p(t,e){t.displayArr&&o!==(o=e.displayArr[4].title)&&$(n,o)},d(t){t&&(f(e),f(r),f(i)),s()}}}function Pt(t){var e,n,r,i=t.displayArr[4].title;return{c(){e=m("button"),n=h(i),w(e,"class","active-dash-title svelte-2amvy6"),r=v(e,"click",t.click_handler_3)},m(t,r){u(t,e,r),d(e,n)},p(t,e){t.displayArr&&i!==(i=e.displayArr[4].title)&&$(n,i)},d(t){t&&f(e),r()}}}function kt(t){var e,n;return{c(){w(e=m("input"),"type","text"),e.autofocus=!0,w(e,"class","svelte-2amvy6"),n=[v(e,"input",t.input_input_handler),v(e,"blur",t.blur_handler)]},m(n,r){u(n,e,r),e.value=t.$_title,e.focus()},p(t,n){t.$_title&&e.value!==n.$_title&&(e.value=n.$_title)},d(t){t&&f(e),i(n)}}}function At(t){var e,n,r,i,a,s,o,c=t.dash.title;function l(){return t.click_handler(t)}return{c(){e=m("button"),n=m("h3"),r=h(c),i=p(),a=m("img"),s=p(),w(n,"class","svelte-2amvy6"),w(a,"src","/images/trashIcon.svg"),w(a,"alt","-"),w(a,"class","svelte-2amvy6"),w(e,"class","svelte-2amvy6"),o=v(e,"click",l)},m(t,o){u(t,e,o),d(e,n),d(n,r),d(e,i),d(e,a),d(e,s)},p(e,n){t=n},d(t){t&&f(e),o()}}}function zt(t){var e,n,r,i,a,s,o,c=new st({});c.$on("left",t.left_handler);var l=new mt({props:{active:t.trashIsOpen,cancelPos:"right"}});function h(t){return t.trashIsOpen?yt:$t}l.$on("trash",t.trash.toggle);var g=h(t),v=g(t),$=new gt({props:{active:t.showNewDashInput}});$.$on("add",t.newDashInput.toggle);var y=new lt({});return y.$on("right",t.right_handler),{c(){e=m("nav"),c.$$.fragment.c(),n=p(),l.$$.fragment.c(),r=p(),i=m("div"),v.c(),a=p(),$.$$.fragment.c(),s=p(),y.$$.fragment.c(),w(i,"class","container svelte-2amvy6"),w(e,"class","svelte-2amvy6")},m(t,f){u(t,e,f),F(c,e,null),d(e,n),F(l,e,null),d(e,r),d(e,i),v.m(i,null),d(e,a),F($,e,null),d(e,s),F(y,e,null),o=!0},p(t,e){var n={};t.trashIsOpen&&(n.active=e.trashIsOpen),l.$set(n),g===(g=h(e))&&v?v.p(t,e):(v.d(1),(v=g(e))&&(v.c(),v.m(i,null)));var r={};t.showNewDashInput&&(r.active=e.showNewDashInput),$.$set(r)},i(t){o||(H(c.$$.fragment,t),H(l.$$.fragment,t),H($.$$.fragment,t),H(y.$$.fragment,t),o=!0)},o(t){Y(c.$$.fragment,t),Y(l.$$.fragment,t),Y($.$$.fragment,t),Y(y.$$.fragment,t),o=!1},d(t){t&&f(e),B(c),B(l),v.d(),B($),B(y)}}}function Et(t,e,n){let r,i=!1;const a=new vt(t=>{const e=i=t;return n("trashIsOpen",i),e});let s=!1;const c=new vt(t=>{const e=s=t;return n("showNewDashInput",s),e});let l=Z()._title;o(t,l,t=>{r=t,n("$_title",r)});let d=!1;const u=[{title:"one",ref:1},{title:"two",ref:2},{title:"three",ref:3},{title:r,ref:V},{title:"five",ref:5},{title:"six",ref:6},{title:"seven",ref:7},{title:"eight",ref:8}],f=t=>{const e=u.findIndex(e=>e.ref===t);if(e<0)throw"Can not find active dash";const n=new Set;let r=[],i=[];for(let t=0;t<9;t++){let a=e-4+t,s=(u.length+a)%u.length;if(e===s)continue;let o=n.has(s);n.add(s);let c=u.length>=5||!o?u[s]:{title:"",ref:null};a<e?o?i.unshift(c):i.push(c):r.push(c)}const a=u[e];return[...i,a,...r]};let m=f(V);const h=t=>{!s&&nt(t)};let p="";const g=(t,e)=>{if(t){switch(n("animationClass",p=""),e){case"fwd":n("animationClass",p="forward-animation");break;case"fwd-fwd":n("animationClass",p="forward-forward-animation");break;case"bck":n("animationClass",p="backward-animation");break;case"bck-bck":n("animationClass",p="backward-backward-animation")}setTimeout(()=>{n("displayArr",m=f(t)),n("animationClass",p="")},500)}};return{trashIsOpen:i,trash:a,showNewDashInput:s,newDashInput:c,_title:l,editingTitle:d,dashList:u,displayArr:m,createDash:h,animationClass:p,setActiveDash:g,$_title:r,left_handler:function(){return g(m[3].ref,"bck")},click_handler:function({dash:t}){return(t=>{try{U.delete(t)}catch(t){}})(t.ref)},click_handler_1:function(){return g(m[2].ref,"bck-bck")},click_handler_2:function(){return g(m[3].ref,"bck")},change_handler:function(){return h(event.target.value)},input_input_handler:function(){l.set(this.value)},blur_handler:function(){const t=d=!1;return n("editingTitle",d),t},click_handler_3:function(){const t=d=!0;return n("editingTitle",d),t},click_handler_4:function(){return g(m[5].ref,"fwd")},click_handler_5:function(){return g(m[6].ref,"fwd-fwd")},right_handler:function(){return g(m[5].ref,"fwd")}}}vt.prototype.close=function(){setTimeout(()=>{this.isOpen&&(this.isOpen=!1,this.update(this.isOpen))},0),window.removeEventListener("click",this.close,{capture:!0})},vt.prototype.open=function(){this.isOpen=!0,window.addEventListener("click",this.close,{capture:!0}),this.update(this.isOpen)},vt.prototype.toggle=function(){this.isOpen?this.close():this.open()};class It extends J{constructor(t){super(),G(this,t,Et,zt,s,[])}}function Tt(t){var e,n,r;return{c(){e=m("article"),n=h(t.$_data),w(e,"class","svelte-1ovrvdo"),r=v(e,"click",t.click_handler)},m(t,r){u(t,e,r),d(e,n)},p(t,e){t.$_data&&$(n,e.$_data)},d(t){t&&f(e),r()}}}function Mt(t){var e,n;return{c(){(e=m("textarea")).autofocus=!0,w(e,"class","svelte-1ovrvdo"),n=[v(e,"input",t.textarea_input_handler),v(e,"change",t.disableEditIfNoFocus),v(e,"blur",t.blur_handler)]},m(n,r){u(n,e,r),e.value=t.$_data,e.focus()},p(t,n){t.$_data&&(e.value=n.$_data)},d(t){t&&f(e),i(n)}}}function Wt(e){var n;function r(t){return t.editing?Mt:Tt}var i=r(e),a=i(e);return{c(){a.c(),n=g()},m(t,e){a.m(t,e),u(t,n,e)},p(t,e){i===(i=r(e))&&a?a.p(t,e):(a.d(1),(a=i(e))&&(a.c(),a.m(n.parentNode,n)))},i:t,o:t,d(t){a.d(t),t&&f(n)}}}function Ot(t,e,n){let r,{_data:i}=e;o(t,i,t=>{r=t,n("$_data",r)});let a=!0;return t.$set=t=>{"_data"in t&&n("_data",i=t._data)},{_data:i,editing:a,disableEditIfNoFocus:()=>{this!==document.activeElement&&n("editing",a=!1)},$_data:r,textarea_input_handler:function(){i.set(this.value)},blur_handler:function(){const t=a=!1;return n("editing",a),t},click_handler:function(){const t=a=!0;return n("editing",a),t}}}class Lt extends J{constructor(t){super(),G(this,t,Ot,Wt,s,["_data"])}}function Ct(e){var n,r;return{c(){w(n=m("textarea"),"class","svelte-1jhz1zv"),r=v(n,"input",e.textarea_input_handler)},m(t,r){u(t,n,r),n.value=e.$_data},p(t,e){t.$_data&&(n.value=e.$_data)},i:t,o:t,d(t){t&&f(n),r()}}}function Dt(t){var e,n=new Lt({props:{_data:t._data}});return{c(){n.$$.fragment.c()},m(t,r){F(n,t,r),e=!0},p(t,e){var r={};t._data&&(r._data=e._data),n.$set(r)},i(t){e||(H(n.$$.fragment,t),e=!0)},o(t){Y(n.$$.fragment,t),e=!1},d(t){B(n,t)}}}function St(t){var e,n,r,i,a=[Dt,Ct],s=[];function o(t){return"Text"===t.type?0:1}return e=o(t),n=s[e]=a[e](t),{c(){n.c(),r=g()},m(t,n){s[e].m(t,n),u(t,r,n),i=!0},p(t,i){var c=e;(e=o(i))===c?s[e].p(t,i):(N(),Y(s[c],1,1,()=>{s[c]=null}),j(),(n=s[e])||(n=s[e]=a[e](i)).c(),H(n,1),n.m(r.parentNode,r))},i(t){i||(H(n),i=!0)},o(t){Y(n),i=!1},d(t){s[e].d(t),t&&f(r)}}}function Nt(t,e,n){let r,i,{_data:a}=e;return o(t,a,t=>{r=t,n("$_data",r)}),k(()=>{var t;n("type",i=(t=r)&&t.length>0?"Text":void 0)}),t.$set=t=>{"_data"in t&&n("_data",a=t._data)},{_data:a,type:i,$_data:r,textarea_input_handler:function(){a.set(this.value)}}}class jt extends J{constructor(t){super(),G(this,t,Nt,St,s,["_data"])}}function Ht(t){var e,n,r;return{c(){e=m("h2"),n=h(t.$_title),w(e,"class","svelte-1w89jgw"),r=v(e,"click",t.click_handler)},m(t,r){u(t,e,r),d(e,n)},p(t,e){t.$_title&&$(n,e.$_title)},d(t){t&&f(e),r()}}}function Yt(t){var e,n;return{c(){w(e=m("input"),"type","text"),e.autofocus=!0,w(e,"class","svelte-1w89jgw"),n=[v(e,"input",t.input_input_handler),v(e,"blur",t.blur_handler)]},m(n,r){u(n,e,r),e.value=t.$_title,e.focus()},p(t,n){t.$_title&&e.value!==n.$_title&&(e.value=n.$_title)},d(t){t&&f(e),i(n)}}}function Rt(e){var n,r,i;return{c(){n=m("div"),r=h(e.type),i=h(" Widget type not yet implemented"),w(n,"class","svelte-1w89jgw")},m(t,e){u(t,n,e),d(n,r),d(n,i)},p:t,i:t,o:t,d(t){t&&f(n)}}}function Xt(t){var e,n=new jt({props:{_data:t._data}});return{c(){n.$$.fragment.c()},m(t,r){F(n,t,r),e=!0},p(t,e){var r={};t._data&&(r._data=e._data),n.$set(r)},i(t){e||(H(n.$$.fragment,t),e=!0)},o(t){Y(n.$$.fragment,t),e=!1},d(t){B(n,t)}}}function Ft(t){var e,n,r,i,a,s,o;function c(t){return t.editingTitle?Yt:Ht}var l=c(t),h=l(t),g=[Xt,Rt],v=[];function $(t){return"Sticky"===t.type?0:1}r=$(t),i=v[r]=g[r](t);var y=new mt({});return y.$on("trash",t.removeSelf),{c(){e=m("div"),h.c(),n=p(),i.c(),a=p(),s=m("span"),y.$$.fragment.c(),w(s,"class","svelte-1w89jgw"),w(e,"class","svelte-1w89jgw")},m(t,i){u(t,e,i),h.m(e,null),d(e,n),v[r].m(e,null),d(e,a),d(e,s),F(y,s,null),o=!0},p(t,s){l===(l=c(s))&&h?h.p(t,s):(h.d(1),(h=l(s))&&(h.c(),h.m(e,n)));var o=r;(r=$(s))===o?v[r].p(t,s):(N(),Y(v[o],1,1,()=>{v[o]=null}),j(),(i=v[r])||(i=v[r]=g[r](s)).c(),H(i,1),i.m(e,a))},i(t){o||(H(i),H(y.$$.fragment,t),o=!0)},o(t){Y(i),Y(y.$$.fragment,t),o=!1},d(t){t&&f(e),h.d(),v[r].d(),B(y)}}}function Bt(t,e,n){let r,{ref:i}=e,{_title:a,_data:s,type:c}=tt(i);o(t,a,t=>{r=t,n("$_title",r)});let l=!1;return t.$set=t=>{"ref"in t&&n("ref",i=t.ref)},{ref:i,_title:a,_data:s,type:c,editingTitle:l,removeSelf:()=>{((t,e=V)=>{try{U.get(e).widgets.delete(t)&&U.get(e)._widgetsCount.update(t=>t-1)}catch(t){}})(i)},$_title:r,input_input_handler:function(){a.set(this.value)},blur_handler:function(){const t=l=!1;return n("editingTitle",l),t},click_handler:function(){const t=l=!0;return n("editingTitle",l),t}}}class qt extends J{constructor(t){super(),G(this,t,Bt,Ft,s,["ref"])}}const Gt=(t,e=0)=>{let n;return function(...r){clearTimeout(n),n=setTimeout(()=>t.apply(this,r),e)}};function Jt(t){return{pageX:t.changedTouches?t.changedTouches[0].pageX:t.pageX,pageY:t.changedTouches?t.changedTouches[0].pageY:t.pageY}}function Kt(t){return Math.max(...t.map(t=>t.y+t.h),1)}const Qt=(t,e,n,r)=>{var i=!1,a=n;if(t)for(var s=t.length-1;s>=0;s--){const[n,r]=t[s];if(e<=n){i=!0,a=r;break}}return i||(a=r),a},Ut=(t,e)=>Array.from(Array(t),()=>new Array(e));function Vt(t,e,n,r){let i=Ut(n,r);for(var a=0;a<t.length;a++){const n=t[a],{x:r,y:c,w:l,h:d,id:u,responsive:{valueW:f}}=n;if(-1===e.indexOf(u))for(var s=c;s<c+d;s++){const t=i[s];if(t)for(var o=r;o<r+(l-f);o++)t[o]=n}}return i}function Zt(t,e,n=Kt(t)){let r=Ut(n,e);return t.forEach((n,i)=>{let a=t.slice(i+1).map(t=>t.id),s=function(t,e,n=[],r){const{w:i}=e;let a=e.responsive.valueW;for(var s=0;s<t.length;s++){const e=t[s];for(var o=0;o<e.length;o++){const t=e.findIndex(t=>void 0===t);if(-1!==t){for(var c=e.slice(t),l=c.length,d=0;d<c.length;d++)if(void 0!==c[d]){l=d;break}return a=Math.max(i-l,0),{y:s,x:t,responsive:{valueW:a}}}}}return a=Math.max(i-r,0),{y:Kt(n),x:0,responsive:{valueW:a}}}(r,n,t,e);t=t.map(t=>t.id===n.id?{...n,...s}:t),r=Vt(t,a,Kt(t),e)}),t}function te(t,e){const n=e.findIndex(e=>e.id===t);return{index:n,item:e[n]}}function ee(t,e,n=[]){let r=t[0].length-(e.w-e.responsive.valueW);for(var i=0;i<t.length;i++){const n=t[i];for(var a=0;a<r+1;a++){if(n.slice(a,a+(e.w-e.responsive.valueW)).every(t=>void 0===t)){if(t.slice(i,i+e.h).every(t=>t.slice(a,a+(e.w-e.responsive.valueW)).every(t=>void 0===t)))return{y:i,x:a}}}}return{y:Kt(n),x:0}}function ne(t,e,n){return n.id===t.id?{...t,...e}:n}const re=(t,e,n)=>n.id===t.id?e:n;function ie(t,e){return Math.max(Kt(t),2)*e}const{window:ae}=R,se=({item:t,items:e,i:n})=>({item:e,index:e}),oe=({item:t,items:e,i:n})=>({item:t,index:n});function ce(t,e,n){const r=Object.create(t);return r.item=e[n],r.i=n,r}function le(t){var e,n;return{c(){w(e=m("div"),"class","svlt-grid-resizer svelte-14tbpr7"),n=[v(e,"touchstart",t.resizeOnMouseDown.bind(this,t.item.id)),v(e,"mousedown",t.resizeOnMouseDown.bind(this,t.item.id))]},m(t,n){u(t,e,n)},p(e,n){t=n},d(t){t&&f(e),i(n)}}}function de(t,n){var r,a,s,o,l;const h=n.$$slots.default,g=function(t,e,n){if(t){const r=c(t,e,n);return t[0](r)}}(h,n,oe);var $=n.item.resizable&&le(n);return{key:t,first:null,c(){r=m("div"),g&&g.c(),a=p(),$&&$.c(),w(r,"class","svlt-grid-item svelte-14tbpr7"),w(r,"style",s=(n.useTransform?`transform: translate(${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px, ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px);`:"")+";\n        "+(n.useTransform?"":`top: ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px`)+";\n        "+(n.useTransform?"":`left: ${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px`)+";\n        width: "+(n.item.resize.resizing?n.item.resize.width:n.item.w*n.xPerPx-2*n.gap-n.item.responsive.valueW*n.xPerPx)+"px;\n        height: "+(n.item.resize.resizing?n.item.resize.height:n.item.h*n.yPerPx-2*n.gap)+"px;\n        z-index: "+(n.item.drag.dragging||n.item.resize.resizing?3:1)+";\n        opacity: "+(n.item.resize.resizing?.5:1)),l=[v(r,"mousedown",n.item.draggable?n.dragOnMouseDown.bind(this,n.item.id):null),v(r,"touchstart",n.item.draggable?n.dragOnMouseDown.bind(this,n.item.id):null)],this.first=r},l(t){g&&g.l(div_nodes)},m(t,e){u(t,r,e),g&&g.m(r,null),d(r,a),$&&$.m(r,null),o=!0},p(t,i){n=i,g&&g.p&&(t.$$scope||t.items)&&g.p(function(t,n,r,i){return t[1]?e({},e(n.$$scope.changed||{},t[1](i?i(r):{}))):n.$$scope.changed||{}}(h,n,t,se),c(h,n,oe)),n.item.resizable?$||(($=le(n)).c(),$.m(r,null)):$&&($.d(1),$=null),(!o||t.useTransform||t.items||t.xPerPx||t.gap)&&s!==(s=(n.useTransform?`transform: translate(${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px, ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px);`:"")+";\n        "+(n.useTransform?"":`top: ${n.item.drag.dragging?n.item.drag.top:n.item.y*n.yPerPx+n.gap}px`)+";\n        "+(n.useTransform?"":`left: ${n.item.drag.dragging?n.item.drag.left:n.item.x*n.xPerPx+n.gap}px`)+";\n        width: "+(n.item.resize.resizing?n.item.resize.width:n.item.w*n.xPerPx-2*n.gap-n.item.responsive.valueW*n.xPerPx)+"px;\n        height: "+(n.item.resize.resizing?n.item.resize.height:n.item.h*n.yPerPx-2*n.gap)+"px;\n        z-index: "+(n.item.drag.dragging||n.item.resize.resizing?3:1)+";\n        opacity: "+(n.item.resize.resizing?.5:1))&&w(r,"style",s)},i(t){o||(H(g,t),o=!0)},o(t){Y(g,t),o=!1},d(t){t&&f(r),g&&g.d(t),$&&$.d(),i(l)}}}function ue(t){var e,n;return{c(){w(e=m("div"),"class","svlt-grid-shadow svelte-14tbpr7"),w(e,"style",n=(t.useTransform?`transform: translate(${t.shadow.drag.dragging?t.shadow.drag.left:t.shadow.x*t.xPerPx+t.gap}px, ${t.shadow.drag.dragging?t.shadow.drag.top:t.shadow.y*t.yPerPx+t.gap}px);`:"")+";\n        "+(t.useTransform?"":`top: ${t.shadow.drag.dragging?t.shadow.drag.top:t.shadow.y*t.yPerPx+t.gap}px`)+";\n        "+(t.useTransform?"":`left: ${t.shadow.drag.dragging?t.shadow.drag.left:t.shadow.x*t.xPerPx+t.gap}px`)+";\n    width:"+(t.shadow.w*t.xPerPx-2*t.gap-t.shadow.responsive.valueW*t.xPerPx)+"px;\n    height:"+(t.shadow.h*t.yPerPx-2*t.gap)+"px;")},m(t,n){u(t,e,n)},p(t,r){(t.useTransform||t.shadow||t.xPerPx||t.gap)&&n!==(n=(r.useTransform?`transform: translate(${r.shadow.drag.dragging?r.shadow.drag.left:r.shadow.x*r.xPerPx+r.gap}px, ${r.shadow.drag.dragging?r.shadow.drag.top:r.shadow.y*r.yPerPx+r.gap}px);`:"")+";\n        "+(r.useTransform?"":`top: ${r.shadow.drag.dragging?r.shadow.drag.top:r.shadow.y*r.yPerPx+r.gap}px`)+";\n        "+(r.useTransform?"":`left: ${r.shadow.drag.dragging?r.shadow.drag.left:r.shadow.x*r.xPerPx+r.gap}px`)+";\n    width:"+(r.shadow.w*r.xPerPx-2*r.gap-r.shadow.responsive.valueW*r.xPerPx)+"px;\n    height:"+(r.shadow.h*r.yPerPx-2*r.gap)+"px;")&&w(e,"style",n)},d(t){t&&f(e)}}}function fe(t){var e,n,r,i,a=[],s=new Map,o=t.items;const c=t=>t.item.id;for(var l=0;l<o.length;l+=1){let e=ce(t,o,l),n=c(e);s.set(n,a[l]=de(n,e))}var h=t.shadow.active&&ue(t);return{c(){for(e=m("div"),l=0;l<a.length;l+=1)a[l].c();n=p(),h&&h.c(),w(e,"class","svlt-grid-container svelte-14tbpr7"),y(e,"height",t.ch+"px"),x(e,"svlt-grid-transition",!t.focuesdItem),i=v(ae,"resize",Gt(t.onResize,300))},m(i,s){for(u(i,e,s),l=0;l<a.length;l+=1)a[l].m(e,null);d(e,n),h&&h.m(e,null),t.div_binding(e),r=!0},p(t,i){const o=i.items;N(),a=function(t,e,n,r,i,a,s,o,c,l,d,u){let f=t.length,m=a.length,h=f;const p={};for(;h--;)p[t[h].key]=h;const g=[],v=new Map,w=new Map;for(h=m;h--;){const t=u(i,a,h),o=n(t);let c=s.get(o);c?r&&c.p(e,t):(c=l(o,t),c.c()),v.set(o,g[h]=c),o in p&&w.set(o,Math.abs(h-p[o]))}const $=new Set,y=new Set;function x(t){H(t,1),t.m(o,d),s.set(t.key,t),d=t.first,m--}for(;f&&m;){const e=g[m-1],n=t[f-1],r=e.key,i=n.key;e===n?(d=e.first,f--,m--):v.has(i)?!s.has(r)||$.has(r)?x(e):y.has(i)?f--:w.get(r)>w.get(i)?(y.add(r),x(e)):($.add(i),f--):(c(n,s),f--)}for(;f--;){const e=t[f];v.has(e.key)||c(e,s)}for(;m;)x(g[m-1]);return g}(a,t,c,1,i,o,s,e,X,de,n,ce),j(),i.shadow.active?h?h.p(t,i):((h=ue(i)).c(),h.m(e,null)):h&&(h.d(1),h=null),r&&!t.ch||y(e,"height",i.ch+"px"),t.focuesdItem&&x(e,"svlt-grid-transition",!i.focuesdItem)},i(t){if(!r){for(var e=0;e<o.length;e+=1)H(a[e]);r=!0}},o(t){for(l=0;l<a.length;l+=1)Y(a[l]);r=!1},d(n){for(n&&f(e),l=0;l<a.length;l+=1)a[l].d();h&&h.d(),t.div_binding(null),i()}}}function me(t,e,n){let r,i,a,s,o,c,l,d,{useTransform:u=!1,items:f=[],cols:m=0,dragDebounceMs:h=350,gap:p=0,rowHeight:g=150,breakpoints:v,fillEmpty:w=!0}=e,$=g,y=m,x={w:0,h:0,x:0,y:0,active:!1,id:null,responsive:{valueW:0},min:{},max:{}},_=ie(f,$);const b=A(),z=()=>document.documentElement.clientWidth;var I;let T,M,W,O;function L(t){let{pageX:e,pageY:r}=Jt(t);e-=a.x,r-=a.y;const l=O+r-M,u=W+(e-T),{responsive:{valueW:m}}=i;let h=Math.round(u/s)+m;const{h:p=1,w:g=1}=i.min,{h:v,w:w=c-i.x+m}=i.max;h=Math.min(Math.max(h,g),w);let y=Math.round(l/$);v&&(y=Math.min(y,v)),y=Math.max(y,p),n("shadow",x={...x,w:h,h:y});let _=f[o];f[o]={..._,resize:{resizing:!0,width:u,height:l},w:h,h:y},n("items",f),d||N()}function C(t){t.stopPropagation();let e=f[o];f[o]={...e,resize:{resizing:!1,width:0,height:0}},n("items",f),window.removeEventListener("mousemove",L,!1),window.removeEventListener("touchmove",L,!1),window.removeEventListener("mouseup",C,!1),window.removeEventListener("touchend",C,!1),n("shadow",x={...x,w:0,h:0,x:0,y:0,active:!1,id:null,responsive:{valueW:0},min:{},max:{}}),R(),n("focuesdItem",i=void 0),d=!1}I=()=>{a=r.getBoundingClientRect();let t=Qt(v,z(),m,y);c=t,l=document.documentElement.clientWidth,v&&n("items",f=Zt(f,t)),n("xPerPx",s=a.width/t),b("mount",{cols:t,xPerPx:s,yPerPx:$})},P().$$.on_mount.push(I);let D=0,S=0;const N=Gt(R,h);let j={};function H(t){t.stopPropagation();let{pageX:e,pageY:r}=Jt(t);const l=r-a.y,d=e-a.x;let u=Math.round((d-D)/s),m=Math.round((l-S)/$);u=Math.max(Math.min(u,c-(i.w-i.responsive.valueW)),0),m=Math.max(m,0);let h=f[o];f[o]={...h,drag:{dragging:!0,top:l-S,left:d-D},x:u,y:m},n("items",f),n("shadow",x={...x,x:u,y:m}),N()}function Y(t){window.removeEventListener("mousemove",H,!1),window.removeEventListener("touchmove",H,!1),window.removeEventListener("mouseup",Y,!1),window.removeEventListener("touchend",Y,!1);let e=f[o];f[o]={...e,drag:{dragging:!1,top:0,left:0}},n("items",f),D=0,S=0,n("shadow",x={...x,w:0,h:0,x:0,y:0,active:!1,id:null}),R(),n("focuesdItem",i=void 0)}function R(t){const e=f[o];let r=Qt(v,z(),m,y),i=function(t,e,n,r){let i=Vt(e,[t.id],Kt(e),n);const a=function(t,e,n){const{w:r,h:i,x:a,y:s,responsive:{valueW:o}}=n,c=e.slice(s,s+i);let l=[];for(var d=0;d<c.length;d++){let t=c[d].slice(a,a+(r-o));l=[...l,...t.map(t=>t&&t.id).filter(t=>t)]}return[...l.filter((t,e)=>l.indexOf(t)==e)]}(0,i,t);let s=function(t,e){return e.filter(e=>-1!==t.indexOf(e.id))}(a,e);if(s.find(t=>t.static)&&r)return e.map(re.bind(null,t,r));i=Vt(e,a,Kt(e),n);let o=e,c=a,l=[];return s.forEach(t=>{let r=ee(i,t,o);if(l.push(t.id),r){o=o.map(ne.bind(null,t,r));let a=c.filter(t=>-1===l.indexOf(t));i=Vt(o,a,Kt(e),n)}}),o}(e,f,r,j);w&&i.forEach(t=>{t.id!==e.id&&(i=i.map(e=>e.id===t.id?{...e,...ee(Vt(i,[t.id],Kt(i),r),t,i)}:e))}),n("items",f=i),b("adjust",{focuesdItem:e})}k(()=>{i||(n("ch",_=ie(f,$)),m!==y&&a&&(n("xPerPx",s=a.width/m),y=m))});let{$$slots:X={},$$scope:F}=e;return t.$set=t=>{"useTransform"in t&&n("useTransform",u=t.useTransform),"items"in t&&n("items",f=t.items),"cols"in t&&n("cols",m=t.cols),"dragDebounceMs"in t&&n("dragDebounceMs",h=t.dragDebounceMs),"gap"in t&&n("gap",p=t.gap),"rowHeight"in t&&n("rowHeight",g=t.rowHeight),"breakpoints"in t&&n("breakpoints",v=t.breakpoints),"fillEmpty"in t&&n("fillEmpty",w=t.fillEmpty),"$$scope"in t&&n("$$scope",F=t.$$scope)},{useTransform:u,items:f,cols:m,dragDebounceMs:h,gap:p,rowHeight:g,breakpoints:v,fillEmpty:w,container:r,focuesdItem:i,xPerPx:s,yPerPx:$,shadow:x,ch:_,onResize:function(){let t=document.documentElement.clientWidth;if(t!==l){l=t,a=r.getBoundingClientRect();let e=Qt(v,t,m,y);c=e,n("xPerPx",s=a.width/e),b("resize",{cols:e,xPerPx:s,yPerPx:$}),v&&n("items",f=Zt(f,e))}},resizeOnMouseDown:function(t,e){e.stopPropagation();let{pageX:r,pageY:l}=Jt(e);const{item:u,index:h}=te(t,f);o=h,n("focuesdItem",i=u),j={...u},d=u.h+u.y===Kt(f),n("shadow",x={...x,...i,active:!0}),T=r-a.x,M=l-a.y,W=u.w*s-2*p-i.responsive.valueW*s,O=u.h*$-2*p,c=Qt(v,z(),m,y),window.addEventListener("mousemove",L,!1),window.addEventListener("touchmove",L,!1),window.addEventListener("mouseup",C,!1),window.addEventListener("touchend",C,!1)},dragOnMouseDown:function(t,e){e.stopPropagation();let{pageX:r,pageY:s}=Jt(e);const{item:l,index:d}=te(t,f);o=d,n("focuesdItem",i=l),j={...l},n("shadow",x={...x,...l,active:!0});let h,p,{currentTarget:g}=e;if(u){const{x:t,y:e}=(w=g.style.transform,$=(w=w.slice(10,-3)).indexOf("px, "),{x:+w.slice(0,$),y:+w.slice($+4)});h=t,p=e}else h=g.offsetLeft,p=g.offsetTop;var w,$;r-=a.x,s-=a.y,D=r-h,S=s-p,c=Qt(v,z(),m,y),l?(window.addEventListener("mousemove",H,!1),window.addEventListener("touchmove",H,!1),window.addEventListener("mouseup",Y,!1),window.addEventListener("touchend",Y,!1)):console.warn("Can not get item")},div_binding:function(t){E[t?"unshift":"push"](()=>{n("container",r=t)})},$$slots:X,$$scope:F}}class he extends J{constructor(t){super(),G(this,t,me,fe,s,["useTransform","items","cols","dragDebounceMs","gap","rowHeight","breakpoints","fillEmpty"])}}function pe(t){return Math.max(...t.map(t=>t.y+t.h),1)}const ge=(t,e)=>Array.from(Array(t),()=>new Array(e));function ve(t,e,n,r){let i=ge(n,r);for(var a=0;a<t.length;a++){const n=t[a],{x:r,y:c,w:l,h:d,id:u,responsive:{valueW:f}}=n;if(-1===e.indexOf(u))for(var s=c;s<c+d;s++){const t=i[s];if(t)for(var o=r;o<r+(l-f);o++)t[o]=n}}return i}function we(t,e,n=pe(t)){let r=ge(n,e);return t.forEach((n,i)=>{let a=t.slice(i+1).map(t=>t.id),s=function(t,e,n=[],r){const{w:i}=e;let a=e.responsive.valueW;for(var s=0;s<t.length;s++){const e=t[s];for(var o=0;o<e.length;o++){const t=e.findIndex(t=>void 0===t);if(-1!==t){for(var c=e.slice(t),l=c.length,d=0;d<c.length;d++)if(void 0!==c[d]){l=d;break}return a=Math.max(i-l,0),{y:s,x:t,responsive:{valueW:a}}}}}return a=Math.max(i-r,0),{y:pe(n),x:0,responsive:{valueW:a}}}(r,n,t,e);t=t.map(t=>t.id===n.id?{...n,...s}:t),r=ve(t,a,pe(t),e)}),t}function $e(t,e,n=[]){let r=t[0].length-(e.w-e.responsive.valueW);for(var i=0;i<t.length;i++){const n=t[i];for(var a=0;a<r+1;a++){if(n.slice(a,a+(e.w-e.responsive.valueW)).every(t=>void 0===t)){if(t.slice(i,i+e.h).every(t=>t.slice(a,a+(e.w-e.responsive.valueW)).every(t=>void 0===t)))return{y:i,x:a}}}}return{y:pe(n),x:0}}function ye(t,e,n){return n.id===t.id?{...t,...e}:n}const xe=(t,e,n)=>n.id===t.id?e:n;const _e={findSpaceForItem:(t,e,n)=>$e(function(t,e=pe(t),n){let r=ge(e,n);for(var i=0;i<t.length;i++){const e=t[i],{x:n,y:o,w:c,h:l,responsive:{valueW:d}}=e;for(var a=o;a<o+l;a++){const t=r[a];for(var s=n;s<n+(c-d);s++)t[s]=e}}return r}(e,pe(e),n),t,e),appendItem:(t,e,n)=>function(t,e,n,r){let i=ve(e,[t.id],pe(e),n);const a=function(t,e,n){const{w:r,h:i,x:a,y:s,responsive:{valueW:o}}=n,c=e.slice(s,s+i);let l=[];for(var d=0;d<c.length;d++){let t=c[d].slice(a,a+(r-o));l=[...l,...t.map(t=>t&&t.id).filter(t=>t)]}return[...l.filter((t,e)=>l.indexOf(t)==e)]}(0,i,t);let s=function(t,e){return e.filter(e=>-1!==t.indexOf(e.id))}(a,e);if(s.find(t=>t.static)&&r)return e.map(xe.bind(null,t,r));i=ve(e,a,pe(e),n);let o=e,c=a,l=[];return s.forEach(t=>{let r=$e(i,t,o);if(l.push(t.id),r){o=o.map(ye.bind(null,t,r));let a=c.filter(t=>-1===l.indexOf(t));i=ve(o,a,pe(e),n)}}),o}(t,[...e,t],n),resizeItems:(t,e,n)=>we(t,e,n),item(t){return{drag:{top:null,left:null,dragging:!1},resize:{width:null,height:null,resizing:!1},responsive:{valueW:0},static:!1,resizable:!(e=t).static,draggable:!e.static,min:{...e.min},max:{...e.max},...e};var e}};function be(t){var e,n=new qt({props:{ref:t.item.id}});return{c(){n.$$.fragment.c()},m(t,r){F(n,t,r),e=!0},p(t,e){var r={};t.item&&(r.ref=e.item.id),n.$set(r)},i(t){e||(H(n.$$.fragment,t),e=!0)},o(t){Y(n.$$.fragment,t),e=!1},d(t){B(n,t)}}}function Pe(t){var e,n,r;function i(e){var r;t.grid_items_binding.call(null,e),n=!0,r=()=>n=!1,T.push(r)}let a={fillEmpty:t.fillEmpty,items:t.items_arr,cols:t.$cols,rowHeight:50,gap:20,$$slots:{default:[be,({item:t})=>({item:t})]},$$scope:{ctx:t}};void 0!==t.items_arr&&(a.items=t.items_arr);var s=new he({props:a});return E.push(()=>{return e="items",n=i,void(-1!==(t=s).$$.props.indexOf(e)&&(t.$$.bound[e]=n,n(t.$$.ctx[e])));var t,e,n}),s.$on("adjust",t.adjust_handler),s.$on("resize",t.handleWindowResize),s.$on("mount",t.handleWindowResize),{c(){e=m("div"),s.$$.fragment.c(),w(e,"id","gridContainer"),w(e,"class","grid-container svelte-6ymfld")},m(t,n){u(t,e,n),F(s,e,null),r=!0},p(t,e){var r={};t.fillEmpty&&(r.fillEmpty=e.fillEmpty),t.items_arr&&(r.items=e.items_arr),t.$cols&&(r.cols=e.$cols),t.$$scope&&(r.$$scope={changed:t,ctx:e}),!n&&t.items_arr&&(r.items=e.items_arr),s.$set(r)},i(t){r||(H(s.$$.fragment,t),r=!0)},o(t){Y(s.$$.fragment,t),r=!1},d(t){t&&f(e),B(s)}}}function ke(t,e,n){let r,i,a=[],s=[],c=!1;const l=Q(40);o(t,l,t=>{r=t,n("$cols",r)});const d=()=>{const t=document.getElementById("gridContainer").clientWidth,e=Math.round(t/50);return e-e%2};let u=Z()._widgetsCount;o(t,u,t=>{i=t,n("$_widgetsCount",i)});const f=t=>{const{w:e,h:n,x:r,y:i}=t;((t,e)=>{try{Z().widgets.get(t).sizeAndPos=e}catch(t){}})(t.id,{w:e,h:n,x:r,y:i})},m=()=>{n("items_arr",a=[]),s=Array.from(Z().widgets.keys()),s.forEach((t,e)=>{let{w:i,h:s,x:o,y:l}=tt(t).sizeAndPos;i>r?(i=r,n("fillEmpty",c=!0)):n("fillEmpty",c=!1);let d=_e.item({w:i,h:s,x:o,y:l,id:t});o+i>=r&&(d={...d,..._e.findSpaceForItem(d,a,r)}),n("items_arr",a=_e.appendItem(d,a,r))}),(()=>{const t=Math.max(...a.map(t=>t.x+t.w)),e=Math.floor((r-t)/2);n("items_arr",a=a.map(t=>({...t,x:t.x+e})))})()};k(()=>{i!==s.length&&m()});return{items_arr:a,fillEmpty:c,cols:l,_widgetsCount:u,storeWidgetSizeAndPos:f,handleWindowResize:()=>{l.update(d),m()},$cols:r,grid_items_binding:function(t){a=t,n("items_arr",a)},adjust_handler:function(t){return f(t.detail.focuesdItem)}}}class Ae extends J{constructor(t){super(),G(this,t,ke,Pe,s,[])}}function ze(t){var e,n,r,i,a;return{c(){e=m("img"),n=p(),r=m("div"),(i=m("button")).innerHTML='<h3 class="svelte-hyummf">Sticky</h3> <img src="/images/addIcon.svg" alt="+">',w(e,"class","cancel svelte-hyummf"),w(e,"src","/images/cancelIcon.svg"),w(e,"alt","x"),w(i,"class","svelte-hyummf"),w(r,"class","menu svelte-hyummf"),a=v(i,"click",t.click_handler)},m(t,a){u(t,e,a),u(t,n,a),u(t,r,a),d(r,i)},d(t){t&&(f(e),f(n),f(r)),a()}}}function Ee(t){var e,n,r,i,a,s,o,c=new mt({props:{active:t.trashActive}});c.$on("trash",t.toggleTrash),c.$on("trash",t.trash_handler);var l=t.menuIsOpen&&ze(t),h=new gt({props:{active:t.menuIsOpen}});return h.$on("add",t.menu.toggle),{c(){e=m("div"),n=m("nav"),c.$$.fragment.c(),r=p(),l&&l.c(),i=p(),(a=m("h2")).textContent="Widgets",s=p(),h.$$.fragment.c(),w(a,"class","svelte-hyummf"),w(n,"class","svelte-hyummf"),w(e,"class","menuArea svelte-hyummf")},m(t,f){u(t,e,f),d(e,n),F(c,n,null),d(n,r),l&&l.m(n,null),d(n,i),d(n,a),d(n,s),F(h,n,null),o=!0},p(t,e){var r={};t.trashActive&&(r.active=e.trashActive),c.$set(r),e.menuIsOpen?l||((l=ze(e)).c(),l.m(n,i)):l&&(l.d(1),l=null);var a={};t.menuIsOpen&&(a.active=e.menuIsOpen),h.$set(a)},i(t){o||(H(c.$$.fragment,t),H(h.$$.fragment,t),o=!0)},o(t){Y(c.$$.fragment,t),Y(h.$$.fragment,t),o=!1},d(t){t&&f(e),B(c),l&&l.d(),B(h)}}}function Ie(t,e,n){let r=!1;const i=new vt(t=>{const e=r=t;return n("menuIsOpen",r),e});let a=!1;const s=t=>{rt(t)};return{menuIsOpen:r,menu:i,trashActive:a,toggleTrash:()=>{n("trashActive",a=!a)},add:s,trash_handler:function(e){!function(t,e){const n=t.$$.callbacks[e.type];n&&n.slice().forEach(t=>t(e))}(t,e)},click_handler:function(){return s("Sticky")}}}class Te extends J{constructor(t){super(),G(this,t,Ie,Ee,s,[])}}function Me(t){var e,n,r,i,a,s=new It({}),o=new Ae({}),c=new Te({});return c.$on("trash",t.activateTrash),{c(){e=m("main"),s.$$.fragment.c(),n=p(),o.$$.fragment.c(),r=p(),c.$$.fragment.c(),w(e,"class",i=l(t.trashActive?"trash":"")+" svelte-1y72nzg")},m(t,i){u(t,e,i),F(s,e,null),d(e,n),F(o,e,null),d(e,r),F(c,e,null),a=!0},p(t,n){a&&!t.trashActive||i===(i=l(n.trashActive?"trash":"")+" svelte-1y72nzg")||w(e,"class",i)},i(t){a||(H(s.$$.fragment,t),H(o.$$.fragment,t),H(c.$$.fragment,t),a=!0)},o(t){Y(s.$$.fragment,t),Y(o.$$.fragment,t),Y(c.$$.fragment,t),a=!1},d(t){t&&f(e),B(s),B(o),B(c)}}}function We(t,e,n){let r=!1;return{trashActive:r,activateTrash:t=>{n("trashActive",r=t.detail.active)}}}return new class extends J{constructor(t){super(),G(this,t,We,Me,s,[])}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map

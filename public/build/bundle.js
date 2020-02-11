var app=function(){"use strict";function t(){}function n(t){return t()}function e(){return Object.create(null)}function r(t){t.forEach(n)}function o(t){return"function"==typeof t}function u(t,n){return t!=t?n==n:t!==n||t&&"object"==typeof t||"function"==typeof t}function c(n,...e){if(null==n)return t;const r=n.subscribe(...e);return r.unsubscribe?()=>r.unsubscribe():r}function i(t,n,e){t.$$.on_destroy.push(c(n,e))}function s(t,n){t.appendChild(n)}function l(t,n,e){t.insertBefore(n,e||null)}function f(t){t.parentNode.removeChild(t)}function a(t){return document.createElement(t)}function d(t){return document.createTextNode(t)}function p(){return d(" ")}function $(t,n,e,r){return t.addEventListener(n,e,r),()=>t.removeEventListener(n,e,r)}function m(t,n){n=""+n,t.data!==n&&(t.data=n)}function g(t,n){(null!=n||t.value)&&(t.value=n)}let h;function _(t){h=t}function y(t){(function(){if(!h)throw new Error("Function called outside component initialization");return h})().$$.before_update.push(t)}const x=[],b=[],w=[],v=[],E=Promise.resolve();let S=!1;function k(t){w.push(t)}const C=new Set;function A(){do{for(;x.length;){const t=x.shift();_(t),N(t.$$)}for(;b.length;)b.pop()();for(let t=0;t<w.length;t+=1){const n=w[t];C.has(n)||(C.add(n),n())}w.length=0}while(x.length);for(;v.length;)v.pop()();S=!1,C.clear()}function N(t){if(null!==t.fragment){t.update(),r(t.before_update);const n=t.dirty;t.dirty=[-1],t.fragment&&t.fragment.p(t.ctx,n),t.after_update.forEach(k)}}const M=new Set;let O;function T(){O={r:0,c:[],p:O}}function j(){O.r||r(O.c),O=O.p}function B(t,n){t&&t.i&&(M.delete(t),t.i(n))}function L(t,n,e,r){if(t&&t.o){if(M.has(t))return;M.add(t),O.c.push(()=>{M.delete(t),r&&(e&&t.d(1),r())}),t.o(n)}}function W(t){t&&t.c()}function q(t,e,u){const{fragment:c,on_mount:i,on_destroy:s,after_update:l}=t.$$;c&&c.m(e,u),k(()=>{const e=i.map(n).filter(o);s?s.push(...e):r(e),t.$$.on_mount=[]}),l.forEach(k)}function z(t,n){const e=t.$$;null!==e.fragment&&(r(e.on_destroy),e.fragment&&e.fragment.d(n),e.on_destroy=e.fragment=null,e.ctx=[])}function F(t,n){-1===t.$$.dirty[0]&&(x.push(t),S||(S=!0,E.then(A)),t.$$.dirty.fill(0)),t.$$.dirty[n/31|0]|=1<<n%31}function P(n,o,u,c,i,s,l=[-1]){const f=h;_(n);const a=o.props||{},d=n.$$={fragment:null,ctx:null,props:s,update:t,not_equal:i,bound:e(),on_mount:[],on_destroy:[],before_update:[],after_update:[],context:new Map(f?f.$$.context:[]),callbacks:e(),dirty:l};let p=!1;d.ctx=u?u(n,a,(t,e,...r)=>{const o=r.length?r[0]:e;return d.ctx&&i(d.ctx[t],d.ctx[t]=o)&&(d.bound[t]&&d.bound[t](o),p&&F(n,t)),e}):[],d.update(),p=!0,r(d.before_update),d.fragment=!!c&&c(d.ctx),o.target&&(o.hydrate?d.fragment&&d.fragment.l(function(t){return Array.from(t.childNodes)}(o.target)):d.fragment&&d.fragment.c(),o.intro&&B(n.$$.fragment),q(n,o.target,o.anchor),A()),_(f)}class D{$destroy(){z(this,1),this.$destroy=t}$on(t,n){const e=this.$$.callbacks[t]||(this.$$.callbacks[t]=[]);return e.push(n),()=>{const t=e.indexOf(n);-1!==t&&e.splice(t,1)}}$set(){}}const G=[];function H(n,e=t){let r;const o=[];function c(t){if(u(n,t)&&(n=t,r)){const t=!G.length;for(let t=0;t<o.length;t+=1){const e=o[t];e[1](),G.push(e,n)}if(t){for(let t=0;t<G.length;t+=2)G[t][0](G[t+1]);G.length=0}}}return{set:c,update:function(t){c(t(n))},subscribe:function(u,i=t){const s=[u,i];return o.push(s),1===o.length&&(r=e(c)||t),u(n),()=>{const t=o.indexOf(s);-1!==t&&o.splice(t,1),0===o.length&&(r(),r=null)}}}}const I=new Map,J=Symbol(),K=()=>I.get(J);function Q(n){let e,r,o;return{c(){e=a("nav"),r=a("h1"),o=d(n[0])},m(t,n){l(t,e,n),s(e,r),s(r,o)},p(t,[n]){1&n&&m(o,t[0])},i:t,o:t,d(t){t&&f(e)}}}function R(t,n,e){let r,o=K()._title;return i(t,o,t=>e(0,r=t)),[r,o]}((t,n=Symbol())=>{const e={_title:H(t),widgets:new Map};I.set(n,e)})("default dash",J),(t=>{const n={type:t,_title:H(""),_data:H("")};K().widgets.set(Symbol(),n)})("Sticky");class U extends D{constructor(t){super(),P(this,t,R,Q,u,{})}}function V(n){let e,r;return{c(){e=a("textarea")},m(t,o){l(t,e,o),g(e,n[1]),r=$(e,"input",n[2])},p(t,[n]){2&n&&g(e,t[1])},i:t,o:t,d(t){t&&f(e),r()}}}function X(n,e,r){let o,u=t,i=()=>(u(),u=c(s,t=>r(1,o=t)),s);n.$$.on_destroy.push(()=>u());let{_data:s}=e;return i(),n.$set=t=>{"_data"in t&&i(r(0,s=t._data))},[s,o,function(){o=this.value,s.set(o)}]}class Y extends D{constructor(t){super(),P(this,t,X,V,u,{_data:0})}}function Z(n){let e,r;return{c(){var t,n,r;e=a("input"),t=e,n="type",null==(r="text")?t.removeAttribute(n):t.getAttribute(n)!==r&&t.setAttribute(n,r)},m(t,o){l(t,e,o),g(e,n[2]),r=$(e,"input",n[3])},p(t,n){4&n&&e.value!==t[2]&&g(e,t[2])},i:t,o:t,d(t){t&&f(e),r()}}}function tt(t){let n;const e=new Y({props:{_data:t[0]}});return{c(){W(e.$$.fragment)},m(t,r){q(e,t,r),n=!0},p(t,n){const r={};1&n&&(r._data=t[0]),e.$set(r)},i(t){n||(B(e.$$.fragment,t),n=!0)},o(t){L(e.$$.fragment,t),n=!1},d(t){z(e,t)}}}function nt(t){let n,e,r,o;const u=[tt,Z],c=[];function i(t,n){return"Text"===t[1]?0:1}return n=i(t),e=c[n]=u[n](t),{c(){e.c(),r=d("")},m(t,e){c[n].m(t,e),l(t,r,e),o=!0},p(t,[o]){let s=n;n=i(t),n===s?c[n].p(t,o):(T(),L(c[s],1,1,()=>{c[s]=null}),j(),e=c[n],e||(e=c[n]=u[n](t),e.c()),B(e,1),e.m(r.parentNode,r))},i(t){o||(B(e),o=!0)},o(t){L(e),o=!1},d(t){c[n].d(t),t&&f(r)}}}function et(n,e,r){let o,u=t,i=()=>(u(),u=c(l,t=>r(2,o=t)),l);n.$$.on_destroy.push(()=>u());let s,{_data:l}=e;return i(),y(()=>{var t;r(1,s=(t=o)&&t.length>0?"Text":void 0)}),n.$set=t=>{"_data"in t&&i(r(0,l=t._data))},[l,s,o,function(){o=this.value,l.set(o)}]}class rt extends D{constructor(t){super(),P(this,t,et,nt,u,{_data:0})}}function ot(n){let e;return{c(){e=a("div"),e.textContent=`${n[3]} Widget type not yet implemented`},m(t,n){l(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}function ut(n){let e;const r=new rt({props:{_data:n[2]}});return{c(){W(r.$$.fragment)},m(t,n){q(r,t,n),e=!0},p:t,i(t){e||(B(r.$$.fragment,t),e=!0)},o(t){L(r.$$.fragment,t),e=!1},d(t){z(r,t)}}}function ct(t){let n,e,r,o,u,c,i;const $=[ut,ot],g=[];return u=function(t,n){return"Sticky"===t[3]?0:1}(t),c=g[u]=$[u](t),{c(){n=a("div"),e=a("h2"),r=d(t[0]),o=p(),c.c()},m(t,c){l(t,n,c),s(n,e),s(e,r),s(n,o),g[u].m(n,null),i=!0},p(t,[n]){(!i||1&n)&&m(r,t[0]),c.p(t,n)},i(t){i||(B(c),i=!0)},o(t){L(c),i=!1},d(t){t&&f(n),g[u].d()}}}function it(t,n,e){let r,{ref:o}=n,{_title:u,_data:c,type:s}=(t=>K().widgets.get(t))(o);return i(t,u,t=>e(0,r=t)),t.$set=t=>{"ref"in t&&e(4,o=t.ref)},[r,u,c,s,o]}class st extends D{constructor(t){super(),P(this,t,it,ct,u,{ref:4})}}function lt(t,n,e){const r=t.slice();return r[2]=n[e],r}function ft(n){let e;const r=new st({props:{ref:n[2]}});return{c(){W(r.$$.fragment)},m(t,n){q(r,t,n),e=!0},p:t,i(t){e||(B(r.$$.fragment,t),e=!0)},o(t){L(r.$$.fragment,t),e=!1},d(t){z(r,t)}}}function at(t){let n,e,r=t[0],o=[];for(let n=0;n<r.length;n+=1)o[n]=ft(lt(t,r,n));const u=t=>L(o[t],1,1,()=>{o[t]=null});return{c(){n=a("section");for(let t=0;t<o.length;t+=1)o[t].c()},m(t,r){l(t,n,r);for(let t=0;t<o.length;t+=1)o[t].m(n,null);e=!0},p(t,[e]){if(1&e){let c;for(r=t[0],c=0;c<r.length;c+=1){const u=lt(t,r,c);o[c]?(o[c].p(u,e),B(o[c],1)):(o[c]=ft(u),o[c].c(),B(o[c],1),o[c].m(n,null))}for(T(),c=r.length;c<o.length;c+=1)u(c);j()}},i(t){if(!e){for(let t=0;t<r.length;t+=1)B(o[t]);e=!0}},o(t){o=o.filter(Boolean);for(let t=0;t<o.length;t+=1)L(o[t]);e=!1},d(t){t&&f(n),function(t,n){for(let e=0;e<t.length;e+=1)t[e]&&t[e].d(n)}(o,t)}}}function dt(t){let n=K();return[n?Array.from(n.widgets.keys()):[]]}class pt extends D{constructor(t){super(),P(this,t,dt,at,u,{})}}function $t(n){let e;return{c(){e=a("button"),e.textContent="+"},m(t,n){l(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}class mt extends D{constructor(t){super(),P(this,t,null,$t,u,{})}}function gt(n){let e;return{c(){e=a("button"),e.textContent="-"},m(t,n){l(t,e,n)},p:t,i:t,o:t,d(t){t&&f(e)}}}class ht extends D{constructor(t){super(),P(this,t,null,gt,u,{})}}function _t(n){let e,r,o,u,c;const i=new mt({}),d=new ht({});return{c(){e=a("nav"),W(i.$$.fragment),r=p(),o=a("h2"),o.textContent="Widgets",u=p(),W(d.$$.fragment)},m(t,n){l(t,e,n),q(i,e,null),s(e,r),s(e,o),s(e,u),q(d,e,null),c=!0},p:t,i(t){c||(B(i.$$.fragment,t),B(d.$$.fragment,t),c=!0)},o(t){L(i.$$.fragment,t),L(d.$$.fragment,t),c=!1},d(t){t&&f(e),z(i),z(d)}}}class yt extends D{constructor(t){super(),P(this,t,null,_t,u,{})}}function xt(n){let e,r,o,u;const c=new U({}),i=new pt({}),d=new yt({});return{c(){e=a("main"),W(c.$$.fragment),r=p(),W(i.$$.fragment),o=p(),W(d.$$.fragment)},m(t,n){l(t,e,n),q(c,e,null),s(e,r),q(i,e,null),s(e,o),q(d,e,null),u=!0},p:t,i(t){u||(B(c.$$.fragment,t),B(i.$$.fragment,t),B(d.$$.fragment,t),u=!0)},o(t){L(c.$$.fragment,t),L(i.$$.fragment,t),L(d.$$.fragment,t),u=!1},d(t){t&&f(e),z(c),z(i),z(d)}}}return new class extends D{constructor(t){super(),P(this,t,null,xt,u,{})}}({target:document.body,props:{name:"world"}})}();
//# sourceMappingURL=bundle.js.map

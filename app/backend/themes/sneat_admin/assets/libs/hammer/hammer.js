/*! For license information please see hammer.js.LICENSE.txt */
!function(t, e) {
    if ("object" == typeof exports && "object" == typeof module)
        module.exports = e();
    else if ("function" == typeof define && define.amd)
        define([], e);
    else {
        var n = e();
        for (var i in n)
            ("object" == typeof exports ? exports : t)[i] = n[i]
    }
}(self, (function() {
    return function() {
        var t = {
            50840: function(t, e, n) {
                var i;
                !function(r, s, o, a) {
                    "use strict";
                    var u, h = ["", "webkit", "Moz", "MS", "ms", "o"], c = s.createElement("div"), l = "function", p = Math.round, f = Math.abs, v = Date.now;
                    function d(t, e, n) {
                        return setTimeout(I(t, n), e)
                    }
                    function m(t, e, n) {
                        return !!Array.isArray(t) && (g(t, n[e], n),
                        !0)
                    }
                    function g(t, e, n) {
                        var i;
                        if (t)
                            if (t.forEach)
                                t.forEach(e, n);
                            else if (t.length !== a)
                                for (i = 0; i < t.length; )
                                    e.call(n, t[i], i, t),
                                    i++;
                            else
                                for (i in t)
                                    t.hasOwnProperty(i) && e.call(n, t[i], i, t)
                    }
                    function y(t, e, n) {
                        var i = "DEPRECATED METHOD: " + e + "\n" + n + " AT \n";
                        return function() {
                            var e = new Error("get-stack-trace")
                              , n = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, "").replace(/^\s+at\s+/gm, "").replace(/^Object.<anonymous>\s*\(/gm, "{anonymous}()@") : "Unknown Stack Trace"
                              , s = r.console && (r.console.warn || r.console.log);
                            return s && s.call(r.console, i, n),
                            t.apply(this, arguments)
                        }
                    }
                    u = "function" != typeof Object.assign ? function(t) {
                        if (t === a || null === t)
                            throw new TypeError("Cannot convert undefined or null to object");
                        for (var e = Object(t), n = 1; n < arguments.length; n++) {
                            var i = arguments[n];
                            if (i !== a && null !== i)
                                for (var r in i)
                                    i.hasOwnProperty(r) && (e[r] = i[r])
                        }
                        return e
                    }
                    : Object.assign;
                    var T = y((function(t, e, n) {
                        for (var i = Object.keys(e), r = 0; r < i.length; )
                            (!n || n && t[i[r]] === a) && (t[i[r]] = e[i[r]]),
                            r++;
                        return t
                    }
                    ), "extend", "Use `assign`.")
                      , E = y((function(t, e) {
                        return T(t, e, !0)
                    }
                    ), "merge", "Use `assign`.");
                    function b(t, e, n) {
                        var i, r = e.prototype;
                        (i = t.prototype = Object.create(r)).constructor = t,
                        i._super = r,
                        n && u(i, n)
                    }
                    function I(t, e) {
                        return function() {
                            return t.apply(e, arguments)
                        }
                    }
                    function A(t, e) {
                        return typeof t == l ? t.apply(e && e[0] || a, e) : t
                    }
                    function S(t, e) {
                        return t === a ? e : t
                    }
                    function _(t, e, n) {
                        g(D(e), (function(e) {
                            t.addEventListener(e, n, !1)
                        }
                        ))
                    }
                    function P(t, e, n) {
                        g(D(e), (function(e) {
                            t.removeEventListener(e, n, !1)
                        }
                        ))
                    }
                    function x(t, e) {
                        for (; t; ) {
                            if (t == e)
                                return !0;
                            t = t.parentNode
                        }
                        return !1
                    }
                    function C(t, e) {
                        return t.indexOf(e) > -1
                    }
                    function D(t) {
                        return t.trim().split(/\s+/g)
                    }
                    function O(t, e, n) {
                        if (t.indexOf && !n)
                            return t.indexOf(e);
                        for (var i = 0; i < t.length; ) {
                            if (n && t[i][n] == e || !n && t[i] === e)
                                return i;
                            i++
                        }
                        return -1
                    }
                    function w(t) {
                        return Array.prototype.slice.call(t, 0)
                    }
                    function M(t, e, n) {
                        for (var i = [], r = [], s = 0; s < t.length; ) {
                            var o = e ? t[s][e] : t[s];
                            O(r, o) < 0 && i.push(t[s]),
                            r[s] = o,
                            s++
                        }
                        return n && (i = e ? i.sort((function(t, n) {
                            return t[e] > n[e]
                        }
                        )) : i.sort()),
                        i
                    }
                    function R(t, e) {
                        for (var n, i, r = e[0].toUpperCase() + e.slice(1), s = 0; s < h.length; ) {
                            if ((i = (n = h[s]) ? n + r : e)in t)
                                return i;
                            s++
                        }
                        return a
                    }
                    var z = 1;
                    function N(t) {
                        var e = t.ownerDocument || t;
                        return e.defaultView || e.parentWindow || r
                    }
                    var X = "ontouchstart"in r
                      , Y = R(r, "PointerEvent") !== a
                      , F = X && /mobile|tablet|ip(ad|hone|od)|android/i.test(navigator.userAgent)
                      , W = "touch"
                      , q = "mouse"
                      , j = 25
                      , k = 1
                      , L = 2
                      , H = 4
                      , U = 8
                      , V = 1
                      , G = 2
                      , Z = 4
                      , B = 8
                      , $ = 16
                      , J = G | Z
                      , K = B | $
                      , Q = J | K
                      , tt = ["x", "y"]
                      , et = ["clientX", "clientY"];
                    function nt(t, e) {
                        var n = this;
                        this.manager = t,
                        this.callback = e,
                        this.element = t.element,
                        this.target = t.options.inputTarget,
                        this.domHandler = function(e) {
                            A(t.options.enable, [t]) && n.handler(e)
                        }
                        ,
                        this.init()
                    }
                    function it(t, e, n) {
                        var i = n.pointers.length
                          , r = n.changedPointers.length
                          , s = e & k && i - r == 0
                          , o = e & (H | U) && i - r == 0;
                        n.isFirst = !!s,
                        n.isFinal = !!o,
                        s && (t.session = {}),
                        n.eventType = e,
                        function(t, e) {
                            var n = t.session
                              , i = e.pointers
                              , r = i.length;
                            n.firstInput || (n.firstInput = rt(e));
                            r > 1 && !n.firstMultiple ? n.firstMultiple = rt(e) : 1 === r && (n.firstMultiple = !1);
                            var s = n.firstInput
                              , o = n.firstMultiple
                              , u = o ? o.center : s.center
                              , h = e.center = st(i);
                            e.timeStamp = v(),
                            e.deltaTime = e.timeStamp - s.timeStamp,
                            e.angle = ht(u, h),
                            e.distance = ut(u, h),
                            function(t, e) {
                                var n = e.center
                                  , i = t.offsetDelta || {}
                                  , r = t.prevDelta || {}
                                  , s = t.prevInput || {};
                                e.eventType !== k && s.eventType !== H || (r = t.prevDelta = {
                                    x: s.deltaX || 0,
                                    y: s.deltaY || 0
                                },
                                i = t.offsetDelta = {
                                    x: n.x,
                                    y: n.y
                                });
                                e.deltaX = r.x + (n.x - i.x),
                                e.deltaY = r.y + (n.y - i.y)
                            }(n, e),
                            e.offsetDirection = at(e.deltaX, e.deltaY);
                            var c = ot(e.deltaTime, e.deltaX, e.deltaY);
                            e.overallVelocityX = c.x,
                            e.overallVelocityY = c.y,
                            e.overallVelocity = f(c.x) > f(c.y) ? c.x : c.y,
                            e.scale = o ? (l = o.pointers,
                            p = i,
                            ut(p[0], p[1], et) / ut(l[0], l[1], et)) : 1,
                            e.rotation = o ? function(t, e) {
                                return ht(e[1], e[0], et) + ht(t[1], t[0], et)
                            }(o.pointers, i) : 0,
                            e.maxPointers = n.prevInput ? e.pointers.length > n.prevInput.maxPointers ? e.pointers.length : n.prevInput.maxPointers : e.pointers.length,
                            function(t, e) {
                                var n, i, r, s, o = t.lastInterval || e, u = e.timeStamp - o.timeStamp;
                                if (e.eventType != U && (u > j || o.velocity === a)) {
                                    var h = e.deltaX - o.deltaX
                                      , c = e.deltaY - o.deltaY
                                      , l = ot(u, h, c);
                                    i = l.x,
                                    r = l.y,
                                    n = f(l.x) > f(l.y) ? l.x : l.y,
                                    s = at(h, c),
                                    t.lastInterval = e
                                } else
                                    n = o.velocity,
                                    i = o.velocityX,
                                    r = o.velocityY,
                                    s = o.direction;
                                e.velocity = n,
                                e.velocityX = i,
                                e.velocityY = r,
                                e.direction = s
                            }(n, e);
                            var l, p;
                            var d = t.element;
                            x(e.srcEvent.target, d) && (d = e.srcEvent.target);
                            e.target = d
                        }(t, n),
                        t.emit("hammer.input", n),
                        t.recognize(n),
                        t.session.prevInput = n
                    }
                    function rt(t) {
                        for (var e = [], n = 0; n < t.pointers.length; )
                            e[n] = {
                                clientX: p(t.pointers[n].clientX),
                                clientY: p(t.pointers[n].clientY)
                            },
                            n++;
                        return {
                            timeStamp: v(),
                            pointers: e,
                            center: st(e),
                            deltaX: t.deltaX,
                            deltaY: t.deltaY
                        }
                    }
                    function st(t) {
                        var e = t.length;
                        if (1 === e)
                            return {
                                x: p(t[0].clientX),
                                y: p(t[0].clientY)
                            };
                        for (var n = 0, i = 0, r = 0; r < e; )
                            n += t[r].clientX,
                            i += t[r].clientY,
                            r++;
                        return {
                            x: p(n / e),
                            y: p(i / e)
                        }
                    }
                    function ot(t, e, n) {
                        return {
                            x: e / t || 0,
                            y: n / t || 0
                        }
                    }
                    function at(t, e) {
                        return t === e ? V : f(t) >= f(e) ? t < 0 ? G : Z : e < 0 ? B : $
                    }
                    function ut(t, e, n) {
                        n || (n = tt);
                        var i = e[n[0]] - t[n[0]]
                          , r = e[n[1]] - t[n[1]];
                        return Math.sqrt(i * i + r * r)
                    }
                    function ht(t, e, n) {
                        n || (n = tt);
                        var i = e[n[0]] - t[n[0]]
                          , r = e[n[1]] - t[n[1]];
                        return 180 * Math.atan2(r, i) / Math.PI
                    }
                    nt.prototype = {
                        handler: function() {},
                        init: function() {
                            this.evEl && _(this.element, this.evEl, this.domHandler),
                            this.evTarget && _(this.target, this.evTarget, this.domHandler),
                            this.evWin && _(N(this.element), this.evWin, this.domHandler)
                        },
                        destroy: function() {
                            this.evEl && P(this.element, this.evEl, this.domHandler),
                            this.evTarget && P(this.target, this.evTarget, this.domHandler),
                            this.evWin && P(N(this.element), this.evWin, this.domHandler)
                        }
                    };
                    var ct = {
                        mousedown: k,
                        mousemove: L,
                        mouseup: H
                    }
                      , lt = "mousedown"
                      , pt = "mousemove mouseup";
                    function ft() {
                        this.evEl = lt,
                        this.evWin = pt,
                        this.pressed = !1,
                        nt.apply(this, arguments)
                    }
                    b(ft, nt, {
                        handler: function(t) {
                            var e = ct[t.type];
                            e & k && 0 === t.button && (this.pressed = !0),
                            e & L && 1 !== t.which && (e = H),
                            this.pressed && (e & H && (this.pressed = !1),
                            this.callback(this.manager, e, {
                                pointers: [t],
                                changedPointers: [t],
                                pointerType: q,
                                srcEvent: t
                            }))
                        }
                    });
                    var vt = {
                        pointerdown: k,
                        pointermove: L,
                        pointerup: H,
                        pointercancel: U,
                        pointerout: U
                    }
                      , dt = {
                        2: W,
                        3: "pen",
                        4: q,
                        5: "kinect"
                    }
                      , mt = "pointerdown"
                      , gt = "pointermove pointerup pointercancel";
                    function yt() {
                        this.evEl = mt,
                        this.evWin = gt,
                        nt.apply(this, arguments),
                        this.store = this.manager.session.pointerEvents = []
                    }
                    r.MSPointerEvent && !r.PointerEvent && (mt = "MSPointerDown",
                    gt = "MSPointerMove MSPointerUp MSPointerCancel"),
                    b(yt, nt, {
                        handler: function(t) {
                            var e = this.store
                              , n = !1
                              , i = t.type.toLowerCase().replace("ms", "")
                              , r = vt[i]
                              , s = dt[t.pointerType] || t.pointerType
                              , o = s == W
                              , a = O(e, t.pointerId, "pointerId");
                            r & k && (0 === t.button || o) ? a < 0 && (e.push(t),
                            a = e.length - 1) : r & (H | U) && (n = !0),
                            a < 0 || (e[a] = t,
                            this.callback(this.manager, r, {
                                pointers: e,
                                changedPointers: [t],
                                pointerType: s,
                                srcEvent: t
                            }),
                            n && e.splice(a, 1))
                        }
                    });
                    var Tt = {
                        touchstart: k,
                        touchmove: L,
                        touchend: H,
                        touchcancel: U
                    };
                    function Et() {
                        this.evTarget = "touchstart",
                        this.evWin = "touchstart touchmove touchend touchcancel",
                        this.started = !1,
                        nt.apply(this, arguments)
                    }
                    function bt(t, e) {
                        var n = w(t.touches)
                          , i = w(t.changedTouches);
                        return e & (H | U) && (n = M(n.concat(i), "identifier", !0)),
                        [n, i]
                    }
                    b(Et, nt, {
                        handler: function(t) {
                            var e = Tt[t.type];
                            if (e === k && (this.started = !0),
                            this.started) {
                                var n = bt.call(this, t, e);
                                e & (H | U) && n[0].length - n[1].length == 0 && (this.started = !1),
                                this.callback(this.manager, e, {
                                    pointers: n[0],
                                    changedPointers: n[1],
                                    pointerType: W,
                                    srcEvent: t
                                })
                            }
                        }
                    });
                    var It = {
                        touchstart: k,
                        touchmove: L,
                        touchend: H,
                        touchcancel: U
                    }
                      , At = "touchstart touchmove touchend touchcancel";
                    function St() {
                        this.evTarget = At,
                        this.targetIds = {},
                        nt.apply(this, arguments)
                    }
                    function _t(t, e) {
                        var n = w(t.touches)
                          , i = this.targetIds;
                        if (e & (k | L) && 1 === n.length)
                            return i[n[0].identifier] = !0,
                            [n, n];
                        var r, s, o = w(t.changedTouches), a = [], u = this.target;
                        if (s = n.filter((function(t) {
                            return x(t.target, u)
                        }
                        )),
                        e === k)
                            for (r = 0; r < s.length; )
                                i[s[r].identifier] = !0,
                                r++;
                        for (r = 0; r < o.length; )
                            i[o[r].identifier] && a.push(o[r]),
                            e & (H | U) && delete i[o[r].identifier],
                            r++;
                        return a.length ? [M(s.concat(a), "identifier", !0), a] : void 0
                    }
                    b(St, nt, {
                        handler: function(t) {
                            var e = It[t.type]
                              , n = _t.call(this, t, e);
                            n && this.callback(this.manager, e, {
                                pointers: n[0],
                                changedPointers: n[1],
                                pointerType: W,
                                srcEvent: t
                            })
                        }
                    });
                    var Pt = 2500;
                    function xt() {
                        nt.apply(this, arguments);
                        var t = I(this.handler, this);
                        this.touch = new St(this.manager,t),
                        this.mouse = new ft(this.manager,t),
                        this.primaryTouch = null,
                        this.lastTouches = []
                    }
                    function Ct(t, e) {
                        t & k ? (this.primaryTouch = e.changedPointers[0].identifier,
                        Dt.call(this, e)) : t & (H | U) && Dt.call(this, e)
                    }
                    function Dt(t) {
                        var e = t.changedPointers[0];
                        if (e.identifier === this.primaryTouch) {
                            var n = {
                                x: e.clientX,
                                y: e.clientY
                            };
                            this.lastTouches.push(n);
                            var i = this.lastTouches;
                            setTimeout((function() {
                                var t = i.indexOf(n);
                                t > -1 && i.splice(t, 1)
                            }
                            ), Pt)
                        }
                    }
                    function Ot(t) {
                        for (var e = t.srcEvent.clientX, n = t.srcEvent.clientY, i = 0; i < this.lastTouches.length; i++) {
                            var r = this.lastTouches[i]
                              , s = Math.abs(e - r.x)
                              , o = Math.abs(n - r.y);
                            if (s <= 25 && o <= 25)
                                return !0
                        }
                        return !1
                    }
                    b(xt, nt, {
                        handler: function(t, e, n) {
                            var i = n.pointerType == W
                              , r = n.pointerType == q;
                            if (!(r && n.sourceCapabilities && n.sourceCapabilities.firesTouchEvents)) {
                                if (i)
                                    Ct.call(this, e, n);
                                else if (r && Ot.call(this, n))
                                    return;
                                this.callback(t, e, n)
                            }
                        },
                        destroy: function() {
                            this.touch.destroy(),
                            this.mouse.destroy()
                        }
                    });
                    var wt = R(c.style, "touchAction")
                      , Mt = wt !== a
                      , Rt = "compute"
                      , zt = "auto"
                      , Nt = "manipulation"
                      , Xt = "none"
                      , Yt = "pan-x"
                      , Ft = "pan-y"
                      , Wt = function() {
                        if (!Mt)
                            return !1;
                        var t = {}
                          , e = r.CSS && r.CSS.supports;
                        return ["auto", "manipulation", "pan-y", "pan-x", "pan-x pan-y", "none"].forEach((function(n) {
                            t[n] = !e || r.CSS.supports("touch-action", n)
                        }
                        )),
                        t
                    }();
                    function qt(t, e) {
                        this.manager = t,
                        this.set(e)
                    }
                    qt.prototype = {
                        set: function(t) {
                            t == Rt && (t = this.compute()),
                            Mt && this.manager.element.style && Wt[t] && (this.manager.element.style[wt] = t),
                            this.actions = t.toLowerCase().trim()
                        },
                        update: function() {
                            this.set(this.manager.options.touchAction)
                        },
                        compute: function() {
                            var t = [];
                            return g(this.manager.recognizers, (function(e) {
                                A(e.options.enable, [e]) && (t = t.concat(e.getTouchAction()))
                            }
                            )),
                            function(t) {
                                if (C(t, Xt))
                                    return Xt;
                                var e = C(t, Yt)
                                  , n = C(t, Ft);
                                if (e && n)
                                    return Xt;
                                if (e || n)
                                    return e ? Yt : Ft;
                                if (C(t, Nt))
                                    return Nt;
                                return zt
                            }(t.join(" "))
                        },
                        preventDefaults: function(t) {
                            var e = t.srcEvent
                              , n = t.offsetDirection;
                            if (this.manager.session.prevented)
                                e.preventDefault();
                            else {
                                var i = this.actions
                                  , r = C(i, Xt) && !Wt[Xt]
                                  , s = C(i, Ft) && !Wt[Ft]
                                  , o = C(i, Yt) && !Wt[Yt];
                                if (r) {
                                    var a = 1 === t.pointers.length
                                      , u = t.distance < 2
                                      , h = t.deltaTime < 250;
                                    if (a && u && h)
                                        return
                                }
                                if (!o || !s)
                                    return r || s && n & J || o && n & K ? this.preventSrc(e) : void 0
                            }
                        },
                        preventSrc: function(t) {
                            this.manager.session.prevented = !0,
                            t.preventDefault()
                        }
                    };
                    var jt = 1
                      , kt = 2
                      , Lt = 4
                      , Ht = 8
                      , Ut = Ht
                      , Vt = 16
                      , Gt = 32;
                    function Zt(t) {
                        this.options = u({}, this.defaults, t || {}),
                        this.id = z++,
                        this.manager = null,
                        this.options.enable = S(this.options.enable, !0),
                        this.state = jt,
                        this.simultaneous = {},
                        this.requireFail = []
                    }
                    function Bt(t) {
                        return t & Vt ? "cancel" : t & Ht ? "end" : t & Lt ? "move" : t & kt ? "start" : ""
                    }
                    function $t(t) {
                        return t == $ ? "down" : t == B ? "up" : t == G ? "left" : t == Z ? "right" : ""
                    }
                    function Jt(t, e) {
                        var n = e.manager;
                        return n ? n.get(t) : t
                    }
                    function Kt() {
                        Zt.apply(this, arguments)
                    }
                    function Qt() {
                        Kt.apply(this, arguments),
                        this.pX = null,
                        this.pY = null
                    }
                    function te() {
                        Kt.apply(this, arguments)
                    }
                    function ee() {
                        Zt.apply(this, arguments),
                        this._timer = null,
                        this._input = null
                    }
                    function ne() {
                        Kt.apply(this, arguments)
                    }
                    function ie() {
                        Kt.apply(this, arguments)
                    }
                    function re() {
                        Zt.apply(this, arguments),
                        this.pTime = !1,
                        this.pCenter = !1,
                        this._timer = null,
                        this._input = null,
                        this.count = 0
                    }
                    function se(t, e) {
                        return (e = e || {}).recognizers = S(e.recognizers, se.defaults.preset),
                        new oe(t,e)
                    }
                    Zt.prototype = {
                        defaults: {},
                        set: function(t) {
                            return u(this.options, t),
                            this.manager && this.manager.touchAction.update(),
                            this
                        },
                        recognizeWith: function(t) {
                            if (m(t, "recognizeWith", this))
                                return this;
                            var e = this.simultaneous;
                            return e[(t = Jt(t, this)).id] || (e[t.id] = t,
                            t.recognizeWith(this)),
                            this
                        },
                        dropRecognizeWith: function(t) {
                            return m(t, "dropRecognizeWith", this) || (t = Jt(t, this),
                            delete this.simultaneous[t.id]),
                            this
                        },
                        requireFailure: function(t) {
                            if (m(t, "requireFailure", this))
                                return this;
                            var e = this.requireFail;
                            return -1 === O(e, t = Jt(t, this)) && (e.push(t),
                            t.requireFailure(this)),
                            this
                        },
                        dropRequireFailure: function(t) {
                            if (m(t, "dropRequireFailure", this))
                                return this;
                            t = Jt(t, this);
                            var e = O(this.requireFail, t);
                            return e > -1 && this.requireFail.splice(e, 1),
                            this
                        },
                        hasRequireFailures: function() {
                            return this.requireFail.length > 0
                        },
                        canRecognizeWith: function(t) {
                            return !!this.simultaneous[t.id]
                        },
                        emit: function(t) {
                            var e = this
                              , n = this.state;
                            function i(n) {
                                e.manager.emit(n, t)
                            }
                            n < Ht && i(e.options.event + Bt(n)),
                            i(e.options.event),
                            t.additionalEvent && i(t.additionalEvent),
                            n >= Ht && i(e.options.event + Bt(n))
                        },
                        tryEmit: function(t) {
                            if (this.canEmit())
                                return this.emit(t);
                            this.state = Gt
                        },
                        canEmit: function() {
                            for (var t = 0; t < this.requireFail.length; ) {
                                if (!(this.requireFail[t].state & (Gt | jt)))
                                    return !1;
                                t++
                            }
                            return !0
                        },
                        recognize: function(t) {
                            var e = u({}, t);
                            if (!A(this.options.enable, [this, e]))
                                return this.reset(),
                                void (this.state = Gt);
                            this.state & (Ut | Vt | Gt) && (this.state = jt),
                            this.state = this.process(e),
                            this.state & (kt | Lt | Ht | Vt) && this.tryEmit(e)
                        },
                        process: function(t) {},
                        getTouchAction: function() {},
                        reset: function() {}
                    },
                    b(Kt, Zt, {
                        defaults: {
                            pointers: 1
                        },
                        attrTest: function(t) {
                            var e = this.options.pointers;
                            return 0 === e || t.pointers.length === e
                        },
                        process: function(t) {
                            var e = this.state
                              , n = t.eventType
                              , i = e & (kt | Lt)
                              , r = this.attrTest(t);
                            return i && (n & U || !r) ? e | Vt : i || r ? n & H ? e | Ht : e & kt ? e | Lt : kt : Gt
                        }
                    }),
                    b(Qt, Kt, {
                        defaults: {
                            event: "pan",
                            threshold: 10,
                            pointers: 1,
                            direction: Q
                        },
                        getTouchAction: function() {
                            var t = this.options.direction
                              , e = [];
                            return t & J && e.push(Ft),
                            t & K && e.push(Yt),
                            e
                        },
                        directionTest: function(t) {
                            var e = this.options
                              , n = !0
                              , i = t.distance
                              , r = t.direction
                              , s = t.deltaX
                              , o = t.deltaY;
                            return r & e.direction || (e.direction & J ? (r = 0 === s ? V : s < 0 ? G : Z,
                            n = s != this.pX,
                            i = Math.abs(t.deltaX)) : (r = 0 === o ? V : o < 0 ? B : $,
                            n = o != this.pY,
                            i = Math.abs(t.deltaY))),
                            t.direction = r,
                            n && i > e.threshold && r & e.direction
                        },
                        attrTest: function(t) {
                            return Kt.prototype.attrTest.call(this, t) && (this.state & kt || !(this.state & kt) && this.directionTest(t))
                        },
                        emit: function(t) {
                            this.pX = t.deltaX,
                            this.pY = t.deltaY;
                            var e = $t(t.direction);
                            e && (t.additionalEvent = this.options.event + e),
                            this._super.emit.call(this, t)
                        }
                    }),
                    b(te, Kt, {
                        defaults: {
                            event: "pinch",
                            threshold: 0,
                            pointers: 2
                        },
                        getTouchAction: function() {
                            return [Xt]
                        },
                        attrTest: function(t) {
                            return this._super.attrTest.call(this, t) && (Math.abs(t.scale - 1) > this.options.threshold || this.state & kt)
                        },
                        emit: function(t) {
                            if (1 !== t.scale) {
                                var e = t.scale < 1 ? "in" : "out";
                                t.additionalEvent = this.options.event + e
                            }
                            this._super.emit.call(this, t)
                        }
                    }),
                    b(ee, Zt, {
                        defaults: {
                            event: "press",
                            pointers: 1,
                            time: 251,
                            threshold: 9
                        },
                        getTouchAction: function() {
                            return [zt]
                        },
                        process: function(t) {
                            var e = this.options
                              , n = t.pointers.length === e.pointers
                              , i = t.distance < e.threshold
                              , r = t.deltaTime > e.time;
                            if (this._input = t,
                            !i || !n || t.eventType & (H | U) && !r)
                                this.reset();
                            else if (t.eventType & k)
                                this.reset(),
                                this._timer = d((function() {
                                    this.state = Ut,
                                    this.tryEmit()
                                }
                                ), e.time, this);
                            else if (t.eventType & H)
                                return Ut;
                            return Gt
                        },
                        reset: function() {
                            clearTimeout(this._timer)
                        },
                        emit: function(t) {
                            this.state === Ut && (t && t.eventType & H ? this.manager.emit(this.options.event + "up", t) : (this._input.timeStamp = v(),
                            this.manager.emit(this.options.event, this._input)))
                        }
                    }),
                    b(ne, Kt, {
                        defaults: {
                            event: "rotate",
                            threshold: 0,
                            pointers: 2
                        },
                        getTouchAction: function() {
                            return [Xt]
                        },
                        attrTest: function(t) {
                            return this._super.attrTest.call(this, t) && (Math.abs(t.rotation) > this.options.threshold || this.state & kt)
                        }
                    }),
                    b(ie, Kt, {
                        defaults: {
                            event: "swipe",
                            threshold: 10,
                            velocity: .3,
                            direction: J | K,
                            pointers: 1
                        },
                        getTouchAction: function() {
                            return Qt.prototype.getTouchAction.call(this)
                        },
                        attrTest: function(t) {
                            var e, n = this.options.direction;
                            return n & (J | K) ? e = t.overallVelocity : n & J ? e = t.overallVelocityX : n & K && (e = t.overallVelocityY),
                            this._super.attrTest.call(this, t) && n & t.offsetDirection && t.distance > this.options.threshold && t.maxPointers == this.options.pointers && f(e) > this.options.velocity && t.eventType & H
                        },
                        emit: function(t) {
                            var e = $t(t.offsetDirection);
                            e && this.manager.emit(this.options.event + e, t),
                            this.manager.emit(this.options.event, t)
                        }
                    }),
                    b(re, Zt, {
                        defaults: {
                            event: "tap",
                            pointers: 1,
                            taps: 1,
                            interval: 300,
                            time: 250,
                            threshold: 9,
                            posThreshold: 10
                        },
                        getTouchAction: function() {
                            return [Nt]
                        },
                        process: function(t) {
                            var e = this.options
                              , n = t.pointers.length === e.pointers
                              , i = t.distance < e.threshold
                              , r = t.deltaTime < e.time;
                            if (this.reset(),
                            t.eventType & k && 0 === this.count)
                                return this.failTimeout();
                            if (i && r && n) {
                                if (t.eventType != H)
                                    return this.failTimeout();
                                var s = !this.pTime || t.timeStamp - this.pTime < e.interval
                                  , o = !this.pCenter || ut(this.pCenter, t.center) < e.posThreshold;
                                if (this.pTime = t.timeStamp,
                                this.pCenter = t.center,
                                o && s ? this.count += 1 : this.count = 1,
                                this._input = t,
                                0 === this.count % e.taps)
                                    return this.hasRequireFailures() ? (this._timer = d((function() {
                                        this.state = Ut,
                                        this.tryEmit()
                                    }
                                    ), e.interval, this),
                                    kt) : Ut
                            }
                            return Gt
                        },
                        failTimeout: function() {
                            return this._timer = d((function() {
                                this.state = Gt
                            }
                            ), this.options.interval, this),
                            Gt
                        },
                        reset: function() {
                            clearTimeout(this._timer)
                        },
                        emit: function() {
                            this.state == Ut && (this._input.tapCount = this.count,
                            this.manager.emit(this.options.event, this._input))
                        }
                    }),
                    se.VERSION = "2.0.7",
                    se.defaults = {
                        domEvents: !1,
                        touchAction: Rt,
                        enable: !0,
                        inputTarget: null,
                        inputClass: null,
                        preset: [[ne, {
                            enable: !1
                        }], [te, {
                            enable: !1
                        }, ["rotate"]], [ie, {
                            direction: J
                        }], [Qt, {
                            direction: J
                        }, ["swipe"]], [re], [re, {
                            event: "doubletap",
                            taps: 2
                        }, ["tap"]], [ee]],
                        cssProps: {
                            userSelect: "none",
                            touchSelect: "none",
                            touchCallout: "none",
                            contentZooming: "none",
                            userDrag: "none",
                            tapHighlightColor: "rgba(0,0,0,0)"
                        }
                    };
                    function oe(t, e) {
                        var n;
                        this.options = u({}, se.defaults, e || {}),
                        this.options.inputTarget = this.options.inputTarget || t,
                        this.handlers = {},
                        this.session = {},
                        this.recognizers = [],
                        this.oldCssProps = {},
                        this.element = t,
                        this.input = new ((n = this).options.inputClass || (Y ? yt : F ? St : X ? xt : ft))(n,it),
                        this.touchAction = new qt(this,this.options.touchAction),
                        ae(this, !0),
                        g(this.options.recognizers, (function(t) {
                            var e = this.add(new t[0](t[1]));
                            t[2] && e.recognizeWith(t[2]),
                            t[3] && e.requireFailure(t[3])
                        }
                        ), this)
                    }
                    function ae(t, e) {
                        var n, i = t.element;
                        i.style && (g(t.options.cssProps, (function(r, s) {
                            n = R(i.style, s),
                            e ? (t.oldCssProps[n] = i.style[n],
                            i.style[n] = r) : i.style[n] = t.oldCssProps[n] || ""
                        }
                        )),
                        e || (t.oldCssProps = {}))
                    }
                    oe.prototype = {
                        set: function(t) {
                            return u(this.options, t),
                            t.touchAction && this.touchAction.update(),
                            t.inputTarget && (this.input.destroy(),
                            this.input.target = t.inputTarget,
                            this.input.init()),
                            this
                        },
                        stop: function(t) {
                            this.session.stopped = t ? 2 : 1
                        },
                        recognize: function(t) {
                            var e = this.session;
                            if (!e.stopped) {
                                var n;
                                this.touchAction.preventDefaults(t);
                                var i = this.recognizers
                                  , r = e.curRecognizer;
                                (!r || r && r.state & Ut) && (r = e.curRecognizer = null);
                                for (var s = 0; s < i.length; )
                                    n = i[s],
                                    2 === e.stopped || r && n != r && !n.canRecognizeWith(r) ? n.reset() : n.recognize(t),
                                    !r && n.state & (kt | Lt | Ht) && (r = e.curRecognizer = n),
                                    s++
                            }
                        },
                        get: function(t) {
                            if (t instanceof Zt)
                                return t;
                            for (var e = this.recognizers, n = 0; n < e.length; n++)
                                if (e[n].options.event == t)
                                    return e[n];
                            return null
                        },
                        add: function(t) {
                            if (m(t, "add", this))
                                return this;
                            var e = this.get(t.options.event);
                            return e && this.remove(e),
                            this.recognizers.push(t),
                            t.manager = this,
                            this.touchAction.update(),
                            t
                        },
                        remove: function(t) {
                            if (m(t, "remove", this))
                                return this;
                            if (t = this.get(t)) {
                                var e = this.recognizers
                                  , n = O(e, t);
                                -1 !== n && (e.splice(n, 1),
                                this.touchAction.update())
                            }
                            return this
                        },
                        on: function(t, e) {
                            if (t !== a && e !== a) {
                                var n = this.handlers;
                                return g(D(t), (function(t) {
                                    n[t] = n[t] || [],
                                    n[t].push(e)
                                }
                                )),
                                this
                            }
                        },
                        off: function(t, e) {
                            if (t !== a) {
                                var n = this.handlers;
                                return g(D(t), (function(t) {
                                    e ? n[t] && n[t].splice(O(n[t], e), 1) : delete n[t]
                                }
                                )),
                                this
                            }
                        },
                        emit: function(t, e) {
                            this.options.domEvents && function(t, e) {
                                var n = s.createEvent("Event");
                                n.initEvent(t, !0, !0),
                                n.gesture = e,
                                e.target.dispatchEvent(n)
                            }(t, e);
                            var n = this.handlers[t] && this.handlers[t].slice();
                            if (n && n.length) {
                                e.type = t,
                                e.preventDefault = function() {
                                    e.srcEvent.preventDefault()
                                }
                                ;
                                for (var i = 0; i < n.length; )
                                    n[i](e),
                                    i++
                            }
                        },
                        destroy: function() {
                            this.element && ae(this, !1),
                            this.handlers = {},
                            this.session = {},
                            this.input.destroy(),
                            this.element = null
                        }
                    },
                    u(se, {
                        INPUT_START: k,
                        INPUT_MOVE: L,
                        INPUT_END: H,
                        INPUT_CANCEL: U,
                        STATE_POSSIBLE: jt,
                        STATE_BEGAN: kt,
                        STATE_CHANGED: Lt,
                        STATE_ENDED: Ht,
                        STATE_RECOGNIZED: Ut,
                        STATE_CANCELLED: Vt,
                        STATE_FAILED: Gt,
                        DIRECTION_NONE: V,
                        DIRECTION_LEFT: G,
                        DIRECTION_RIGHT: Z,
                        DIRECTION_UP: B,
                        DIRECTION_DOWN: $,
                        DIRECTION_HORIZONTAL: J,
                        DIRECTION_VERTICAL: K,
                        DIRECTION_ALL: Q,
                        Manager: oe,
                        Input: nt,
                        TouchAction: qt,
                        TouchInput: St,
                        MouseInput: ft,
                        PointerEventInput: yt,
                        TouchMouseInput: xt,
                        SingleTouchInput: Et,
                        Recognizer: Zt,
                        AttrRecognizer: Kt,
                        Tap: re,
                        Pan: Qt,
                        Swipe: ie,
                        Pinch: te,
                        Rotate: ne,
                        Press: ee,
                        on: _,
                        off: P,
                        each: g,
                        merge: E,
                        extend: T,
                        assign: u,
                        inherit: b,
                        bindFn: I,
                        prefixed: R
                    }),
                    (void 0 !== r ? r : "undefined" != typeof self ? self : {}).Hammer = se,
                    (i = function() {
                        return se
                    }
                    .call(e, n, e, t)) === a || (t.exports = i)
                }(window, document)
            }
        }
          , e = {};
        function n(i) {
            var r = e[i];
            if (void 0 !== r)
                return r.exports;
            var s = e[i] = {
                exports: {}
            };
            return t[i](s, s.exports, n),
            s.exports
        }
        n.n = function(t) {
            var e = t && t.__esModule ? function() {
                return t.default
            }
            : function() {
                return t
            }
            ;
            return n.d(e, {
                a: e
            }),
            e
        }
        ,
        n.d = function(t, e) {
            for (var i in e)
                n.o(e, i) && !n.o(t, i) && Object.defineProperty(t, i, {
                    enumerable: !0,
                    get: e[i]
                })
        }
        ,
        n.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        }
        ,
        n.r = function(t) {
            "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(t, Symbol.toStringTag, {
                value: "Module"
            }),
            Object.defineProperty(t, "__esModule", {
                value: !0
            })
        }
        ;
        var i = {};
        return function() {
            "use strict";
            n.r(i);
            n(50840)
        }(),
        i
    }()
}
));

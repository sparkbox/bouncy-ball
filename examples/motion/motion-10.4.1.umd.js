(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.Motion = {}));
}(this, (function (exports) { 'use strict';

    const data = new WeakMap();
    function getAnimationData(element) {
        if (!data.has(element)) {
            data.set(element, {
                transforms: [],
                animations: {},
                generators: {},
                prevGeneratorState: {},
            });
        }
        return data.get(element);
    }

    function addUniqueItem(array, item) {
        array.indexOf(item) === -1 && array.push(item);
    }
    function removeItem(arr, item) {
        const index = arr.indexOf(item);
        index > -1 && arr.splice(index, 1);
    }

    const noop = () => { };
    const noopReturn = (v) => v;

    /**
     * A list of all transformable axes. We'll use this list to generated a version
     * of each axes for each transform.
     */
    const axes = ["", "X", "Y", "Z"];
    /**
     * An ordered array of each transformable value. By default, transform values
     * will be sorted to this order.
     */
    const order = ["translate", "scale", "rotate", "skew"];
    const transformAlias = {
        x: "translateX",
        y: "translateY",
        z: "translateZ",
    };
    const rotation = {
        syntax: "<angle>",
        initialValue: "0deg",
        toDefaultUnit: (v) => v + "deg",
    };
    const baseTransformProperties = {
        translate: {
            syntax: "<length-percentage>",
            initialValue: "0px",
            toDefaultUnit: (v) => v + "px",
        },
        rotate: rotation,
        scale: {
            syntax: "<number>",
            initialValue: 1,
            toDefaultUnit: noopReturn,
        },
        skew: rotation,
    };
    const transformDefinitions = new Map();
    const asTransformCssVar = (name) => `--motion-${name}`;
    /**
     * Generate a list of every possible transform key
     */
    const transforms = ["x", "y", "z"];
    order.forEach((name) => {
        axes.forEach((axis) => {
            transforms.push(name + axis);
            transformDefinitions.set(asTransformCssVar(name + axis), baseTransformProperties[name]);
        });
    });
    /**
     * A function to use with Array.sort to sort transform keys by their default order.
     */
    const compareTransformOrder = (a, b) => transforms.indexOf(a) - transforms.indexOf(b);
    /**
     * Provide a quick way to check if a string is the name of a transform
     */
    const transformLookup = new Set(transforms);
    const isTransform = (name) => transformLookup.has(name);
    const addTransformToElement = (element, name) => {
        // Map x to translateX etc
        if (transformAlias[name])
            name = transformAlias[name];
        const { transforms } = getAnimationData(element);
        addUniqueItem(transforms, name);
        element.style.transform = buildTransformTemplate(transforms);
    };
    const buildTransformTemplate = (transforms) => transforms
        .sort(compareTransformOrder)
        .reduce(transformListToString, "")
        .trim();
    const transformListToString = (template, name) => `${template} ${name}(var(${asTransformCssVar(name)}))`;

    const isCssVar = (name) => name.startsWith("--");
    const registeredProperties = new Set();
    function registerCssVariable(name) {
        if (registeredProperties.has(name))
            return;
        registeredProperties.add(name);
        try {
            const { syntax, initialValue } = transformDefinitions.has(name)
                ? transformDefinitions.get(name)
                : {};
            CSS.registerProperty({
                name,
                inherits: false,
                syntax,
                initialValue,
            });
        }
        catch (e) { }
    }

    const ms = (seconds) => seconds * 1000;

    const isNumber = (value) => typeof value === "number";

    const isCubicBezier = (easing) => Array.isArray(easing) && isNumber(easing[0]);
    const isEasingList = (easing) => Array.isArray(easing) && !isNumber(easing[0]);
    const isCustomEasing = (easing) => typeof easing === "object" &&
        Boolean(easing.createAnimation);
    const convertEasing = (easing) => isCubicBezier(easing) ? cubicBezierAsString(easing) : easing;
    const cubicBezierAsString = ([a, b, c, d]) => `cubic-bezier(${a}, ${b}, ${c}, ${d})`;

    const testAnimation = (keyframes) => document.createElement("div").animate(keyframes, { duration: 0.001 });
    const featureTests = {
        cssRegisterProperty: () => typeof CSS !== "undefined" &&
            Object.hasOwnProperty.call(CSS, "registerProperty"),
        waapi: () => Object.hasOwnProperty.call(Element.prototype, "animate"),
        partialKeyframes: () => {
            try {
                testAnimation({ opacity: [1] });
            }
            catch (e) {
                return false;
            }
            return true;
        },
        finished: () => Boolean(testAnimation({ opacity: [0, 1] }).finished),
    };
    const results = {};
    const supports = {};
    for (const key in featureTests) {
        supports[key] = () => {
            if (results[key] === undefined)
                results[key] = featureTests[key]();
            return results[key];
        };
    }

    const cssVariableRenderer = (element, name) => (latest) => element.style.setProperty(name, latest);
    const styleRenderer = (element, name) => (latest) => (element.style[name] = latest);

    const defaults = {
        duration: 0.3,
        delay: 0,
        endDelay: 0,
        repeat: 0,
        easing: "ease",
    };

    /*
      Bezier function generator

      This has been modified from Gaëtan Renaudeau's BezierEasing
      https://github.com/gre/bezier-easing/blob/master/src/index.js
      https://github.com/gre/bezier-easing/blob/master/LICENSE
      
      I've removed the newtonRaphsonIterate algo because in benchmarking it
      wasn't noticiably faster than binarySubdivision, indeed removing it
      usually improved times, depending on the curve.

      I also removed the lookup table, as for the added bundle size and loop we're
      only cutting ~4 or so subdivision iterations. I bumped the max iterations up
      to 12 to compensate and this still tended to be faster for no perceivable
      loss in accuracy.

      Usage
        const easeOut = cubicBezier(.17,.67,.83,.67);
        const x = easeOut(0.5); // returns 0.627...
    */
    // Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
    const calcBezier = (t, a1, a2) => (((1.0 - 3.0 * a2 + 3.0 * a1) * t + (3.0 * a2 - 6.0 * a1)) * t + 3.0 * a1) * t;
    const subdivisionPrecision = 0.0000001;
    const subdivisionMaxIterations = 12;
    function binarySubdivide(x, lowerBound, upperBound, mX1, mX2) {
        let currentX;
        let currentT;
        let i = 0;
        do {
            currentT = lowerBound + (upperBound - lowerBound) / 2.0;
            currentX = calcBezier(currentT, mX1, mX2) - x;
            if (currentX > 0.0) {
                upperBound = currentT;
            }
            else {
                lowerBound = currentT;
            }
        } while (Math.abs(currentX) > subdivisionPrecision &&
            ++i < subdivisionMaxIterations);
        return currentT;
    }
    function cubicBezier(mX1, mY1, mX2, mY2) {
        // If this is a linear gradient, return linear easing
        if (mX1 === mY1 && mX2 === mY2)
            return noopReturn;
        const getTForX = (aX) => binarySubdivide(aX, 0, 1, mX1, mX2);
        // If animation is at start/end, return t without easing
        return (t) => t === 0 || t === 1 ? t : calcBezier(getTForX(t), mY1, mY2);
    }

    const clamp = (min, max, v) => Math.min(Math.max(v, min), max);

    const steps = (steps, direction = "end") => (progress) => {
        progress =
            direction === "end" ? Math.min(progress, 0.999) : Math.max(progress, 0.001);
        const expanded = progress * steps;
        const rounded = direction === "end" ? Math.floor(expanded) : Math.ceil(expanded);
        return clamp(0, 1, rounded / steps);
    };

    const namedEasings = {
        ease: cubicBezier(0.25, 0.1, 0.25, 1.0),
        "ease-in": cubicBezier(0.42, 0.0, 1.0, 1.0),
        "ease-in-out": cubicBezier(0.42, 0.0, 0.58, 1.0),
        "ease-out": cubicBezier(0.0, 0.0, 0.58, 1.0),
    };
    const functionArgsRegex = /\((.*?)\)/;
    function getEasingFunction(definition) {
        // If already an easing function, return
        if (typeof definition === "function")
            return definition;
        // If an easing curve definition, return bezier function
        if (Array.isArray(definition))
            return cubicBezier(...definition);
        // If we have a predefined easing function, return
        if (namedEasings[definition])
            return namedEasings[definition];
        // If this is a steps function, attempt to create easing curve
        if (definition.startsWith("steps")) {
            const args = functionArgsRegex.exec(definition);
            if (args) {
                const argsArray = args[1].split(",");
                return steps(parseFloat(argsArray[0]), argsArray[1].trim());
            }
        }
        return noopReturn;
    }

    /*
      Value in range from progress

      Given a lower limit and an upper limit, we return the value within
      that range as expressed by progress (usually a number from 0 to 1)

      So progress = 0.5 would change

      from -------- to

      to

      from ---- to

      E.g. from = 10, to = 20, progress = 0.5 => 15

      @param [number]: Lower limit of range
      @param [number]: Upper limit of range
      @param [number]: The progress between lower and upper limits expressed 0-1
      @return [number]: Value as calculated from progress within range (not limited within range)
    */
    const mix = (from, to, progress) => -progress * from + progress * to + from;

    /*
      Progress within given range

      Given a lower limit and an upper limit, we return the progress
      (expressed as a number 0-1) represented by the given value.

      @param [number]: Lower limit
      @param [number]: Upper limit
      @param [number]: Value to find progress within given range
      @return [number]: Progress of value within range as expressed 0-1
    */
    const progress = (from, to, value) => {
        return to - from === 0 ? 1 : (value - from) / (to - from);
    };

    const wrap = (min, max, v) => {
        const rangeSize = max - min;
        return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
    };

    function getEasingForSegment(easing, i) {
        return isEasingList(easing)
            ? easing[wrap(0, easing.length, i)]
            : easing;
    }

    function fillOffset(offset, remaining) {
        const min = offset[offset.length - 1];
        for (let i = 1; i <= remaining; i++) {
            const offsetProgress = progress(0, remaining, i);
            offset.push(mix(min, 1, offsetProgress));
        }
    }
    function defaultOffset(length) {
        const offset = [0];
        fillOffset(offset, length - 1);
        return offset;
    }

    const clampProgress = (p) => Math.min(1, Math.max(p, 0));
    function slowInterpolateNumbers(output, input = defaultOffset(output.length), easing = noopReturn) {
        const length = output.length;
        /**
         * If the input length is lower than the output we
         * fill the input to match. This currently assumes the input
         * is an animation progress value so is a good candidate for
         * moving outside the function.
         */
        const remainder = length - input.length;
        remainder > 0 && fillOffset(input, remainder);
        return (t) => {
            let i = 0;
            for (; i < length - 2; i++) {
                if (t < input[i + 1])
                    break;
            }
            let progressInRange = clampProgress(progress(input[i], input[i + 1], t));
            const segmentEasing = getEasingForSegment(easing, i);
            progressInRange = segmentEasing(progressInRange);
            return mix(output[i], output[i + 1], progressInRange);
        };
    }

    class NumberAnimation {
        constructor(output, keyframes = [0, 1], { easing = defaults.easing, duration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, offset, direction = "normal", } = {}) {
            this.startTime = 0;
            this.rate = 1;
            this.t = 0;
            this.cancelTimestamp = 0;
            this.playState = "idle";
            this.finished = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            const totalDuration = duration * (repeat + 1);
            /**
             * We don't currently support custom easing (spring, glide etc) in NumberAnimation
             * (although this is completely possible), so this will have been hydrated by
             * animateStyle.
             */
            if (isCustomEasing(easing))
                easing = "ease";
            const interpolate = slowInterpolateNumbers(keyframes, offset, isEasingList(easing)
                ? easing.map(getEasingFunction)
                : getEasingFunction(easing));
            this.tick = (timestamp) => {
                if (this.pauseTime)
                    timestamp = this.pauseTime;
                let t = (timestamp - this.startTime) * this.rate;
                this.t = t;
                // Convert to seconds
                t /= 1000;
                // Rebase on delay
                t = Math.max(t - delay, 0);
                /**
                 * If this animation has finished, set the current time
                 * to the total duration.
                 */
                if (this.playState === "finished")
                    t = totalDuration;
                /**
                 * Get the current progress (0-1) of the animation. If t is >
                 * than duration we'll get values like 2.5 (midway through the
                 * third iteration)
                 */
                const progress = t / duration;
                // TODO progress += iterationStart
                /**
                 * Get the current iteration (0 indexed). For instance the floor of
                 * 2.5 is 2.
                 */
                let currentIteration = Math.floor(progress);
                /**
                 * Get the current progress of the iteration by taking the remainder
                 * so 2.5 is 0.5 through iteration 2
                 */
                let iterationProgress = progress % 1.0;
                if (!iterationProgress && progress >= 1) {
                    iterationProgress = 1;
                }
                /**
                 * If iteration progress is 1 we count that as the end
                 * of the previous iteration.
                 */
                iterationProgress === 1 && currentIteration--;
                /**
                 * Reverse progress if we're not running in "normal" direction
                 */
                const iterationIsOdd = currentIteration % 2;
                if (direction === "reverse" ||
                    (direction === "alternate" && iterationIsOdd) ||
                    (direction === "alternate-reverse" && !iterationIsOdd)) {
                    iterationProgress = 1 - iterationProgress;
                }
                const latest = interpolate(t >= totalDuration ? 1 : Math.min(iterationProgress, 1));
                output(latest);
                const isAnimationFinished = this.playState === "finished" || t >= totalDuration + endDelay;
                if (isAnimationFinished) {
                    this.playState = "finished";
                    this.resolve(latest);
                }
                else if (this.playState !== "idle") {
                    requestAnimationFrame(this.tick);
                }
            };
            this.play();
        }
        play() {
            const now = performance.now();
            this.playState = "running";
            if (this.pauseTime) {
                this.startTime = now - (this.pauseTime - this.startTime);
            }
            else if (!this.startTime) {
                this.startTime = now;
            }
            this.pauseTime = undefined;
            requestAnimationFrame(this.tick);
        }
        pause() {
            this.playState = "paused";
            this.pauseTime = performance.now();
        }
        finish() {
            this.playState = "finished";
            this.tick(0);
        }
        cancel() {
            this.playState = "idle";
            this.tick(this.cancelTimestamp);
            this.reject(false);
        }
        reverse() {
            this.rate *= -1;
        }
        commitStyles() {
            this.cancelTimestamp = performance.now();
        }
        get currentTime() {
            return this.t;
        }
        set currentTime(t) {
            if (this.pauseTime || this.rate === 0) {
                this.pauseTime = t;
            }
            else {
                this.startTime = performance.now() - t / this.rate;
            }
        }
        get playbackRate() {
            return this.rate;
        }
        set playbackRate(rate) {
            this.rate = rate;
        }
    }

    function hydrateKeyframes(keyframes, readInitialValue) {
        for (let i = 0; i < keyframes.length; i++) {
            if (keyframes[i] === null) {
                keyframes[i] = i ? keyframes[i - 1] : readInitialValue();
            }
        }
        return keyframes;
    }
    const keyframesList = (keyframes) => Array.isArray(keyframes) ? keyframes : [keyframes];

    const style = {
        get: (element, name) => {
            let value = isCssVar(name)
                ? element.style.getPropertyValue(name)
                : getComputedStyle(element)[name];
            if (!value && value !== 0) {
                const definition = transformDefinitions.get(name);
                if (definition)
                    value = definition.initialValue;
            }
            return value;
        },
    };

    function getStyleName(key) {
        if (transformAlias[key])
            key = transformAlias[key];
        return isTransform(key) ? asTransformCssVar(key) : key;
    }

    function stopAnimation(animation) {
        if (!animation)
            return;
        // Suppress error thrown by WAAPI
        try {
            /**
             * commitStyles has overhead so we only want to commit and cancel
             */
            animation.playState !== "finished" && animation.commitStyles();
            animation.cancel();
        }
        catch (e) { }
    }

    function animateStyle(element, key, keyframesDefinition, options = {}) {
        let animation;
        let { duration = defaults.duration, delay = defaults.delay, endDelay = defaults.endDelay, repeat = defaults.repeat, easing = defaults.easing, direction, offset, allowWebkitAcceleration = false, } = options;
        const data = getAnimationData(element);
        let canAnimateNatively = supports.waapi();
        let render = noop;
        const valueIsTransform = isTransform(key);
        /**
         * If this is an individual transform, we need to map its
         * key to a CSS variable and update the element's transform style
         */
        valueIsTransform && addTransformToElement(element, key);
        const name = getStyleName(key);
        /**
         * Get definition of value, this will be used to convert numerical
         * keyframes into the default value type.
         */
        const definition = transformDefinitions.get(name);
        /**
         * Stop the current animation, if any. Because this will trigger
         * commitStyles (DOM writes) and we might later trigger DOM reads,
         * this is fired now and we return a factory function to create
         * the actual animation that can get called in batch,
         */
        stopAnimation(data.animations[name]);
        /**
         * Batchable factory function containing all DOM reads.
         */
        return () => {
            const readInitialValue = () => { var _a, _b; return (_b = (_a = style.get(element, name)) !== null && _a !== void 0 ? _a : definition === null || definition === void 0 ? void 0 : definition.initialValue) !== null && _b !== void 0 ? _b : 0; };
            /**
             * Replace null values with the previous keyframe value, or read
             * it from the DOM if it's the first keyframe.
             */
            let keyframes = hydrateKeyframes(keyframesList(keyframesDefinition), readInitialValue);
            if (isCustomEasing(easing)) {
                const custom = easing.createAnimation(keyframes, readInitialValue, valueIsTransform, name, data);
                easing = custom.easing;
                if (custom.keyframes !== undefined)
                    keyframes = custom.keyframes;
                if (custom.duration !== undefined)
                    duration = custom.duration;
            }
            /**
             * If this is a CSS variable we need to register it with the browser
             * before it can be animated natively. We also set it with setProperty
             * rather than directly onto the element.style object.
             */
            if (isCssVar(name)) {
                render = cssVariableRenderer(element, name);
                if (supports.cssRegisterProperty()) {
                    registerCssVariable(name);
                }
                else {
                    canAnimateNatively = false;
                }
            }
            else {
                render = styleRenderer(element, name);
            }
            /**
             * If we can animate this value with WAAPI, do so. Currently this only
             * feature detects CSS.registerProperty but could check WAAPI too.
             */
            if (canAnimateNatively) {
                /**
                 * Convert numbers to default value types. Currently this only supports
                 * transforms but it could also support other value types.
                 */
                if (definition) {
                    keyframes = keyframes.map((value) => isNumber(value) ? definition.toDefaultUnit(value) : value);
                }
                /**
                 * If this browser doesn't support partial/implicit keyframes we need to
                 * explicitly provide one.
                 */
                if (!supports.partialKeyframes() && keyframes.length === 1) {
                    keyframes.unshift(readInitialValue());
                }
                const animationOptions = {
                    delay: ms(delay),
                    duration: ms(duration),
                    endDelay: ms(endDelay),
                    easing: !isEasingList(easing) ? convertEasing(easing) : undefined,
                    direction,
                    iterations: repeat + 1,
                    fill: "both",
                };
                animation = element.animate({
                    [name]: keyframes,
                    offset,
                    easing: isEasingList(easing) ? easing.map(convertEasing) : undefined,
                }, animationOptions);
                /**
                 * Polyfill finished Promise in browsers that don't support it
                 */
                if (!animation.finished) {
                    animation.finished = new Promise((resolve, reject) => {
                        animation.onfinish = resolve;
                        animation.oncancel = reject;
                    });
                }
                const target = keyframes[keyframes.length - 1];
                animation.finished
                    .then(() => {
                    // Apply styles to target
                    render(target);
                    // Ensure fill modes don't persist
                    animation.cancel();
                })
                    .catch(noop);
                /**
                 * This forces Webkit to run animations on the main thread by exploiting
                 * this condition:
                 * https://trac.webkit.org/browser/webkit/trunk/Source/WebCore/platform/graphics/ca/GraphicsLayerCA.cpp?rev=281238#L1099
                 *
                 * This fixes Webkit's timing bugs, like accelerated animations falling
                 * out of sync with main thread animations and massive delays in starting
                 * accelerated animations in WKWebView.
                 */
                if (!allowWebkitAcceleration)
                    animation.playbackRate = 1.000001;
                /**
                 * If we can't animate the value natively then we can fallback to the numbers-only
                 * polyfill for transforms. All keyframes must be numerical.
                 */
            }
            else if (valueIsTransform && keyframes.every(isNumber)) {
                /**
                 * If we only have a single keyframe, we need to create an initial keyframe by reading
                 * the current value from the DOM.
                 */
                if (keyframes.length === 1) {
                    keyframes.unshift(parseFloat(readInitialValue()));
                }
                if (definition) {
                    const applyStyle = render;
                    render = (v) => applyStyle(definition.toDefaultUnit(v));
                }
                animation = new NumberAnimation(render, keyframes, Object.assign(Object.assign({}, options), { duration,
                    easing }));
            }
            else {
                const target = keyframes[keyframes.length - 1];
                render(definition && isNumber(target)
                    ? definition.toDefaultUnit(target)
                    : target);
            }
            data.animations[name] = animation;
            /**
             * When an animation finishes, delete the reference to the previous animation.
             */
            animation === null || animation === void 0 ? void 0 : animation.finished.then(() => {
                data.animations[name] = undefined;
                data.generators[name] = undefined;
                data.prevGeneratorState[name] = undefined;
            }).catch(noop);
            return animation;
        };
    }

    const getOptions = (options, key) => 
    /**
     * TODO: Make test for this
     * Always return a new object otherwise delay is overwritten by results of stagger
     * and this results in no stagger
     */
    options[key] ? Object.assign(Object.assign({}, options), options[key]) : Object.assign({}, options);

    function resolveElements(elements, selectorCache) {
        var _a;
        if (typeof elements === "string") {
            if (selectorCache) {
                (_a = selectorCache[elements]) !== null && _a !== void 0 ? _a : (selectorCache[elements] = document.querySelectorAll(elements));
                elements = selectorCache[elements];
            }
            else {
                elements = document.querySelectorAll(elements);
            }
        }
        else if (elements instanceof Element) {
            elements = [elements];
        }
        return Array.from(elements);
    }

    const createAnimation = (factory) => factory();
    const createAnimations = (animationFactory, duration) => new Proxy({
        animations: animationFactory.map(createAnimation).filter(Boolean),
        duration,
    }, controls);
    /**
     * TODO:
     * Currently this returns the first animation, ideally it would return
     * the first active animation.
     */
    const getActiveAnimation = (state) => state.animations[0];
    const controls = {
        get: (target, key) => {
            var _a, _b;
            switch (key) {
                case "duration":
                    return target.duration;
                case "currentTime":
                    let time = ((_a = getActiveAnimation(target)) === null || _a === void 0 ? void 0 : _a[key]) || 0;
                    return time ? time / 1000 : 0;
                case "playbackRate":
                    return (_b = getActiveAnimation(target)) === null || _b === void 0 ? void 0 : _b[key];
                case "finished":
                    if (!target.finished) {
                        target.finished = Promise.all(target.animations.map(selectFinished)).catch(noop);
                    }
                    return target.finished;
                case "stop":
                    return () => target.animations.forEach(stopAnimation);
                default:
                    return () => target.animations.forEach((animation) => animation[key]());
            }
        },
        set: (target, key, value) => {
            switch (key) {
                case "currentTime":
                    value = ms(value);
                case "currentTime":
                case "playbackRate":
                    for (let i = 0; i < target.animations.length; i++) {
                        target.animations[i][key] = value;
                    }
                    return true;
            }
            return false;
        },
    };
    const selectFinished = (animation) => animation.finished;

    function stagger(duration = 0.1, { start = 0, from = 0, easing } = {}) {
        return (i, total) => {
            const fromIndex = isNumber(from) ? from : getFromIndex(from, total);
            const distance = Math.abs(fromIndex - i);
            let delay = duration * distance;
            if (easing) {
                const maxDelay = total * i;
                const easingFunction = getEasingFunction(easing);
                delay = easingFunction(delay / maxDelay) * maxDelay;
            }
            return start + delay;
        };
    }
    function getFromIndex(from, total) {
        if (from === "first") {
            return 0;
        }
        else {
            const lastIndex = total - 1;
            return from === "last" ? lastIndex : lastIndex / 2;
        }
    }
    function resolveOption(option, i, total) {
        return typeof option === "function"
            ? option(i, total)
            : option;
    }

    function animate(elements, keyframes, options = {}) {
        var _a;
        elements = resolveElements(elements);
        const numElements = elements.length;
        /**
         * Create and start new animations
         */
        const animationFactories = [];
        for (let i = 0; i < numElements; i++) {
            const element = elements[i];
            for (const key in keyframes) {
                const valueOptions = getOptions(options, key);
                valueOptions.delay = resolveOption(valueOptions.delay, i, numElements);
                const animation = animateStyle(element, key, keyframes[key], valueOptions);
                animationFactories.push(animation);
            }
        }
        return createAnimations(animationFactories, 
        /**
         * TODO:
         * If easing is set to spring or glide, duration will be dynamically
         * generated. Ideally we would dynamically generate this from
         * animation.effect.getComputedTiming().duration but this isn't
         * supported in iOS13 or our number polyfill. Perhaps it's possible
         * to Proxy animations returned from animateStyle that has duration
         * as a getter.
         */
        (_a = options.duration) !== null && _a !== void 0 ? _a : defaults.duration);
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    var invariant = function () { };
    {
        invariant = function (check, message) {
            if (!check) {
                throw new Error(message);
            }
        };
    }

    function calcNextTime(current, next, prev, labels) {
        var _a;
        if (isNumber(next)) {
            return next;
        }
        else if (next.startsWith("-") || next.startsWith("+")) {
            return Math.max(0, current + parseFloat(next));
        }
        else if (next === "<") {
            return prev;
        }
        else {
            return (_a = labels.get(next)) !== null && _a !== void 0 ? _a : current;
        }
    }

    function eraseKeyframes(sequence, startTime, endTime) {
        for (let i = 0; i < sequence.length; i++) {
            const keyframe = sequence[i];
            if (keyframe.at > startTime && keyframe.at < endTime) {
                removeItem(sequence, keyframe);
                // If we remove this item we have to push the pointer back one
                i--;
            }
        }
    }
    function addKeyframes(sequence, keyframes, easing, offset, startTime, endTime) {
        /**
         * Erase every existing value between currentTime and targetTime,
         * this will essentially splice this timeline into any currently
         * defined ones.
         */
        eraseKeyframes(sequence, startTime, endTime);
        for (let i = 0; i < keyframes.length; i++) {
            sequence.push({
                value: keyframes[i],
                at: mix(startTime, endTime, offset[i]),
                easing: getEasingForSegment(easing, i),
            });
        }
    }

    function compareByTime(a, b) {
        if (a.at === b.at) {
            return a.value === null ? 1 : -1;
        }
        else {
            return a.at - b.at;
        }
    }

    function timeline(definition, options = {}) {
        var _a, _b;
        const animationDefinitions = createAnimationsFromTimeline(definition, options);
        /**
         * Create and start animations
         */
        const animationFactories = animationDefinitions
            .map((definition) => animateStyle(...definition))
            .filter(Boolean);
        return createAnimations(animationFactories, 
        // Get the duration from the first animation definition
        (_b = (_a = animationDefinitions[0]) === null || _a === void 0 ? void 0 : _a[3].duration) !== null && _b !== void 0 ? _b : defaults.duration);
    }
    function createAnimationsFromTimeline(definition, _a = {}) {
        var { defaultOptions = {} } = _a, timelineOptions = __rest(_a, ["defaultOptions"]);
        const animationDefinitions = [];
        const elementSequences = new Map();
        const elementCache = {};
        const timeLabels = new Map();
        let prevTime = 0;
        let currentTime = 0;
        let totalDuration = 0;
        /**
         * Build the timeline by mapping over the definition array and converting
         * the definitions into keyframes and offsets with absolute time values.
         * These will later get converted into relative offsets in a second pass.
         */
        for (let i = 0; i < definition.length; i++) {
            const [elementDefinition, keyframes, options = {}] = definition[i];
            /**
             * If a relative or absolute time value has been specified we need to resolve
             * it in relation to the currentTime.
             */
            if (options.at !== undefined) {
                currentTime = calcNextTime(currentTime, options.at, prevTime, timeLabels);
            }
            /**
             * Keep track of the maximum duration in this definition. This will be
             * applied to currentTime once the definition has been parsed.
             */
            let maxDuration = 0;
            /**
             * Find all the elements specified in the definition and parse value
             * keyframes from their timeline definitions.
             */
            const elements = resolveElements(elementDefinition, elementCache);
            const numElements = elements.length;
            for (let elementIndex = 0; elementIndex < numElements; elementIndex++) {
                const element = elements[elementIndex];
                const elementSequence = getElementSequence(element, elementSequences);
                for (const key in keyframes) {
                    const valueSequence = getValueSequence(key, elementSequence);
                    let valueKeyframes = keyframesList(keyframes[key]);
                    const valueOptions = getOptions(options, key);
                    let { duration = defaultOptions.duration || defaults.duration, easing = defaultOptions.easing || defaults.easing, } = valueOptions;
                    if (isCustomEasing(easing)) {
                        const valueIsTransform = isTransform(key);
                        invariant(valueKeyframes.length === 2 || !valueIsTransform, "spring must be provided 2 keyframes within timeline");
                        const custom = easing.createAnimation(valueKeyframes, 
                        // TODO We currently only support explicit keyframes
                        // so this doesn't currently read from the DOM
                        () => "0", valueIsTransform);
                        easing = custom.easing;
                        if (custom.keyframes !== undefined)
                            valueKeyframes = custom.keyframes;
                        if (custom.duration !== undefined)
                            duration = custom.duration;
                    }
                    const delay = resolveOption(options.delay, elementIndex, numElements) || 0;
                    const startTime = currentTime + delay;
                    const targetTime = startTime + duration;
                    /**
                     *
                     */
                    let { offset = defaultOffset(valueKeyframes.length) } = valueOptions;
                    /**
                     * If there's only one offset of 0, fill in a second with length 1
                     *
                     * TODO: Ensure there's a test that covers this removal
                     */
                    if (offset.length === 1 && offset[0] === 0) {
                        offset[1] = 1;
                    }
                    /**
                     * Fill out if offset if fewer offsets than keyframes
                     */
                    const remainder = length - valueKeyframes.length;
                    remainder > 0 && fillOffset(offset, remainder);
                    /**
                     * If only one value has been set, ie [1], push a null to the start of
                     * the keyframe array. This will let us mark a keyframe at this point
                     * that will later be hydrated with the previous value.
                     */
                    valueKeyframes.length === 1 && valueKeyframes.unshift(null);
                    /**
                     * Add keyframes, mapping offsets to absolute time.
                     */
                    addKeyframes(valueSequence, valueKeyframes, easing, offset, startTime, targetTime);
                    maxDuration = Math.max(delay + duration, maxDuration);
                    totalDuration = Math.max(targetTime, totalDuration);
                }
            }
            prevTime = currentTime;
            currentTime += maxDuration;
        }
        /**
         * For every element and value combination create a new animation.
         */
        elementSequences.forEach((valueSequences, element) => {
            for (const key in valueSequences) {
                const valueSequence = valueSequences[key];
                /**
                 * Arrange all the keyframes in ascending time order.
                 */
                valueSequence.sort(compareByTime);
                const keyframes = [];
                const valueOffset = [];
                const valueEasing = [];
                /**
                 * For each keyframe, translate absolute times into
                 * relative offsets based on the total duration of the timeline.
                 */
                for (let i = 0; i < valueSequence.length; i++) {
                    const { at, value, easing } = valueSequence[i];
                    keyframes.push(value);
                    valueOffset.push(progress(0, totalDuration, at));
                    valueEasing.push(easing || defaults.easing);
                }
                /**
                 * If the first keyframe doesn't land on offset: 0
                 * provide one by duplicating the initial keyframe. This ensures
                 * it snaps to the first keyframe when the animation starts.
                 */
                if (valueOffset[0] !== 0) {
                    valueOffset.unshift(0);
                    keyframes.unshift(keyframes[0]);
                    valueEasing.unshift("linear");
                }
                /**
                 * If the last keyframe doesn't land on offset: 1
                 * provide one with a null wildcard value. This will ensure it
                 * stays static until the end of the animation.
                 */
                if (valueOffset[valueOffset.length - 1] !== 1) {
                    valueOffset.push(1);
                    keyframes.push(null);
                }
                animationDefinitions.push([
                    element,
                    key,
                    keyframes,
                    Object.assign(Object.assign(Object.assign({}, defaultOptions), { duration: totalDuration, easing: valueEasing, offset: valueOffset }), timelineOptions),
                ]);
            }
        });
        return animationDefinitions;
    }
    function getElementSequence(element, sequences) {
        !sequences.has(element) && sequences.set(element, {});
        return sequences.get(element);
    }
    function getValueSequence(name, sequences) {
        if (!sequences[name])
            sequences[name] = [];
        return sequences[name];
    }

    /*
      Convert velocity into velocity per second

      @param [number]: Unit per frame
      @param [number]: Frame duration in ms
    */
    function velocityPerSecond(velocity, frameDuration) {
        return frameDuration ? velocity * (1000 / frameDuration) : 0;
    }

    function hasReachedTarget(origin, target, current) {
        return ((origin < target && current >= target) ||
            (origin > target && current <= target));
    }

    const defaultStiffness = 100.0;
    const defaultDamping = 10.0;
    const defaultMass = 1.0;
    const calcDampingRatio = (stiffness = defaultStiffness, damping = defaultDamping, mass = defaultMass) => damping / (2 * Math.sqrt(stiffness * mass));
    const calcAngularFreq = (undampedFreq, dampingRatio) => undampedFreq * Math.sqrt(1 - dampingRatio * dampingRatio);
    const createSpringGenerator = ({ stiffness = defaultStiffness, damping = defaultDamping, mass = defaultMass, from = 0, to = 1, velocity = 0.0, restSpeed = 2, restDistance = 0.5, } = {}) => {
        velocity = velocity ? velocity / 1000 : 0.0;
        const state = {
            done: false,
            value: from,
            target: to,
            velocity,
            hasReachedTarget: false,
        };
        const dampingRatio = calcDampingRatio(stiffness, damping, mass);
        const initialDelta = to - from;
        const undampedAngularFreq = Math.sqrt(stiffness / mass) / 1000;
        const angularFreq = calcAngularFreq(undampedAngularFreq, dampingRatio);
        let resolveSpring;
        if (dampingRatio < 1) {
            // Underdamped spring (bouncy)
            resolveSpring = (t) => to -
                Math.exp(-dampingRatio * undampedAngularFreq * t) *
                    (((-velocity + dampingRatio * undampedAngularFreq * initialDelta) /
                        angularFreq) *
                        Math.sin(angularFreq * t) +
                        initialDelta * Math.cos(angularFreq * t));
        }
        else {
            // Critically damped spring
            resolveSpring = (t) => to -
                Math.exp(-undampedAngularFreq * t) *
                    (initialDelta + (velocity + undampedAngularFreq * initialDelta) * t);
        }
        return {
            next: (t) => {
                state.value = resolveSpring(t);
                state.velocity =
                    t === 0 ? velocity : calcVelocity(resolveSpring, t, state.value);
                const isBelowVelocityThreshold = Math.abs(state.velocity) <= restSpeed;
                const isBelowDisplacementThreshold = Math.abs(to - state.value) <= restDistance;
                state.done = isBelowVelocityThreshold && isBelowDisplacementThreshold;
                state.hasReachedTarget = hasReachedTarget(from, to, state.value);
                return state;
            },
        };
    };
    const sampleT = 5; // ms
    function calcVelocity(resolveValue, t, current) {
        const prevT = Math.max(t - sampleT, 0);
        return velocityPerSecond(current - resolveValue(prevT), 5);
    }

    const timeStep = 10;
    const maxDuration = 10000;
    function pregenerateKeyframes(generator) {
        let overshootDuration = undefined;
        let timestamp = timeStep;
        let state = generator.next(0);
        const keyframes = [state.value];
        while (!state.done && timestamp < maxDuration) {
            state = generator.next(timestamp);
            keyframes.push(state.done ? state.target : state.value);
            if (overshootDuration === undefined && state.hasReachedTarget) {
                overshootDuration = timestamp;
            }
            timestamp += timeStep;
        }
        const duration = timestamp - timeStep;
        /**
         * If generating an animation that didn't actually move,
         * generate a second keyframe so we have an origin and target.
         */
        if (keyframes.length === 1)
            keyframes.push(state.value);
        return {
            keyframes,
            duration: duration / 1000,
            overshootDuration: (overshootDuration !== null && overshootDuration !== void 0 ? overshootDuration : duration) / 1000,
        };
    }

    function createGeneratorEasing(createGenerator) {
        const keyframesCache = new WeakMap();
        return (options = {}) => {
            const generatorCache = new Map();
            const getGenerator = (from = 0, to = 100, velocity = 0, isScale = false) => {
                const key = `${from}-${to}-${velocity}-${isScale}`;
                if (!generatorCache.has(key)) {
                    generatorCache.set(key, createGenerator(Object.assign({ from,
                        to,
                        velocity, restSpeed: isScale ? 0.05 : 2, restDistance: isScale ? 0.01 : 0.5 }, options)));
                }
                return generatorCache.get(key);
            };
            const getKeyframes = (generator) => {
                if (!keyframesCache.has(generator)) {
                    keyframesCache.set(generator, pregenerateKeyframes(generator));
                }
                return keyframesCache.get(generator);
            };
            return {
                createAnimation: (keyframes, getOrigin, canUseGenerator, name, data) => {
                    let settings;
                    let generator;
                    const numKeyframes = keyframes.length;
                    let shouldUseGenerator = canUseGenerator &&
                        numKeyframes <= 2 &&
                        keyframes.every(isNumberOrNull);
                    if (shouldUseGenerator) {
                        const prevAnimationState = name && data && data.prevGeneratorState[name];
                        const velocity = prevAnimationState &&
                            (numKeyframes === 1 ||
                                (numKeyframes === 2 && keyframes[0] === null))
                            ? prevAnimationState.velocity
                            : 0;
                        const target = keyframes[numKeyframes - 1];
                        const unresolvedOrigin = numKeyframes === 1 ? null : keyframes[0];
                        const origin = unresolvedOrigin === null
                            ? prevAnimationState
                                ? prevAnimationState.value
                                : parseFloat(getOrigin())
                            : unresolvedOrigin;
                        generator = getGenerator(origin, target, velocity, name === null || name === void 0 ? void 0 : name.includes("scale"));
                        const keyframesMetadata = getKeyframes(generator);
                        settings = Object.assign(Object.assign({}, keyframesMetadata), { easing: "linear" });
                    }
                    else {
                        generator = getGenerator(0, 100);
                        const keyframesMetadata = getKeyframes(generator);
                        settings = {
                            easing: "ease",
                            duration: keyframesMetadata.overshootDuration,
                        };
                    }
                    // TODO Add test for this
                    if (generator && data && name) {
                        data.generators[name] = generator;
                    }
                    return settings;
                },
            };
        };
    }
    const isNumberOrNull = (value) => typeof value !== "string";

    const spring = createGeneratorEasing(createSpringGenerator);

    const createGlideGenerator = ({ from = 0, velocity = 0.0, power = 0.8, decay = 0.325, bounceDamping, bounceStiffness, changeTarget, min, max, restDistance = 0.5, restSpeed, }) => {
        decay = ms(decay);
        const state = {
            value: from,
            target: from,
            velocity,
            hasReachedTarget: false,
            done: false,
        };
        const isOutOfBounds = (v) => (min !== undefined && v < min) || (max !== undefined && v > max);
        const nearestBoundary = (v) => {
            if (min === undefined)
                return max;
            if (max === undefined)
                return min;
            return Math.abs(min - v) < Math.abs(max - v) ? min : max;
        };
        let amplitude = power * velocity;
        const ideal = from + amplitude;
        const target = changeTarget === undefined ? ideal : changeTarget(ideal);
        state.target = target;
        /**
         * If the target has changed we need to re-calculate the amplitude, otherwise
         * the animation will start from the wrong position.
         */
        if (target !== ideal)
            amplitude = target - from;
        const calcDelta = (t) => -amplitude * Math.exp(-t / decay);
        const calcLatest = (t) => target + calcDelta(t);
        const applyFriction = (t) => {
            const delta = calcDelta(t);
            const latest = calcLatest(t);
            state.done = Math.abs(delta) <= restDistance;
            state.value = state.done ? target : latest;
            state.velocity =
                t === 0 ? velocity : calcVelocity(calcLatest, t, state.value);
        };
        /**
         * Ideally this would resolve for t in a stateless way, we could
         * do that by always precalculating the animation but as we know
         * this will be done anyway we can assume that spring will
         * be discovered during that.
         */
        let timeReachedBoundary;
        let spring;
        const checkCatchBoundary = (t) => {
            if (!isOutOfBounds(state.value))
                return;
            timeReachedBoundary = t;
            spring = createSpringGenerator({
                from: state.value,
                to: nearestBoundary(state.value),
                velocity: state.velocity,
                damping: bounceDamping,
                stiffness: bounceStiffness,
                restDistance,
                restSpeed,
            });
        };
        checkCatchBoundary(0);
        return {
            next: (t) => {
                /**
                 * We need to resolve the friction to figure out if we need a
                 * spring but we don't want to do this twice per frame. So here
                 * we flag if we updated for this frame and later if we did
                 * we can skip doing it again.
                 */
                let hasUpdatedFrame = false;
                if (!spring && timeReachedBoundary === undefined) {
                    hasUpdatedFrame = true;
                    applyFriction(t);
                    checkCatchBoundary(t);
                }
                /**
                 * If we have a spring and the provided t is beyond the moment the friction
                 * animation crossed the min/max boundary, use the spring.
                 */
                if (timeReachedBoundary !== undefined && t > timeReachedBoundary) {
                    state.hasReachedTarget = true;
                    return spring.next(t - timeReachedBoundary);
                }
                else {
                    state.hasReachedTarget = false;
                    !hasUpdatedFrame && applyFriction(t);
                    return state;
                }
            },
        };
    };

    const glide = createGeneratorEasing(createGlideGenerator);

    exports.animate = animate;
    exports.animateStyle = animateStyle;
    exports.glide = glide;
    exports.spring = spring;
    exports.stagger = stagger;
    exports.timeline = timeline;

    Object.defineProperty(exports, '__esModule', { value: true });

})));

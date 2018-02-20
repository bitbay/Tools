(function (exports) {
    'use strict';

    function getEnumFormString(enumerator, type, defaultType) {
        if (defaultType === void 0) { defaultType = -1; }
        if (typeof type === "number") {
            return type;
        }
        for (var k in enumerator) {
            if (typeof k === "string") {
                if (k.toLowerCase() === type.toLowerCase()) {
                    return enumerator[k];
                }
            }
        }
        return defaultType;
    }
    function copyFromObject(data, object, config) {
        var dataConfig = null;
        if (config !== null) {
            var index = config.indexOf(data.constructor);
            if (index >= 0 && index < config.length - 1) {
                dataConfig = config[index + 1];
            }
        }
        for (var k in data) {
            if (!(k in object)) {
                continue;
            }
            _copyFromObject(data, k, data[k], object[k], dataConfig ? dataConfig[k] : null, config);
        }
    }
    function _copyFromObject(parent, key, data, object, creater, config) {
        var dataType = typeof data;
        var objectType = typeof object;
        if (objectType === "function") {
            return;
        }
        if (object === null || object === undefined || objectType !== "object") {
            if (dataType === objectType) {
                parent[key] = object;
            }
            else if (dataType === "boolean") {
                // console.warn(`${key}: ${objectType} is not a boolean.`);
                switch (object) {
                    case "0":
                    case "NaN":
                    case "":
                    case "false":
                    case "null":
                    case "undefined":
                        parent[key] = false;
                        break;
                    default:
                        parent[key] = Boolean(object);
                        break;
                }
            }
            else if (dataType === "number") {
                // console.warn(`${key}: ${objectType} is not a number.`);
                if (object === "NaN" || object === null) {
                    parent[key] = NaN;
                }
                else {
                    parent[key] = Number(object);
                }
            }
            else if (dataType === "string") {
                // console.warn(`${key}: ${objectType} is not a string.`);
                if (object) {
                    parent[key] = String(object);
                }
                else {
                    parent[key] = "";
                }
            }
            else {
                parent[key] = object;
            }
        }
        else if (object instanceof Array) {
            if (!(data instanceof Array)) {
                // console.warn(`${key}: ${dataType} is not an array.`);
                parent[key] = data = [];
            }
            if (data instanceof Array) {
                data.length = object.length;
                for (var i = 0, l = data.length; i < l; ++i) {
                    _copyFromObject(data, i, data[i], object[i], creater, config);
                }
            }
        }
        else {
            if (data !== null && data !== undefined && dataType === "object") {
                if (creater instanceof Array) {
                    for (var k in object) {
                        _copyFromObject(data, k, data[k], object[k], creater[0], config);
                    }
                }
                else {
                    copyFromObject(data, object, config);
                }
            }
            else if (creater) {
                if (creater instanceof Array) {
                    if (creater[1] === Function) {
                        var clazz = creater[0](object);
                        parent[key] = data = new clazz();
                        copyFromObject(data, object, config);
                    }
                    else {
                        parent[key] = data = creater[1] === Array ? [] : {};
                        for (var k in object) {
                            _copyFromObject(data, k, data[k], object[k], creater[0], config);
                        }
                    }
                }
                else if (creater) {
                    parent[key] = data = new creater();
                    copyFromObject(data, object, config);
                }
                else {
                    // console.warn(`${key}: shallow copy.`);
                    parent[key] = object;
                }
            }
            else {
                // console.warn(`${key}: shallow copy.`);
                parent[key] = object;
            }
        }
    }

    var PI_D = Math.PI * 2.0;
    var PI_Q = Math.PI / 4.0;
    var RAD_DEG = 180.0 / Math.PI;
    var DEG_RAD = Math.PI / 180.0;
    function normalizeRadian(value) {
        value = (value + Math.PI) % (PI_D);
        value += value > 0.0 ? -Math.PI : Math.PI;
        return value;
    }
    function normalizeDegree(value) {
        value = (value + 180.0) % (180.0 * 2.0);
        value += value > 0.0 ? -180.0 : 180.0;
        return value;
    }
    var Matrix = /** @class */ (function () {
        function Matrix(a, b, c, d, tx, ty) {
            if (a === void 0) { a = 1.0; }
            if (b === void 0) { b = 0.0; }
            if (c === void 0) { c = 0.0; }
            if (d === void 0) { d = 1.0; }
            if (tx === void 0) { tx = 0.0; }
            if (ty === void 0) { ty = 0.0; }
            this.a = a;
            this.b = b;
            this.c = c;
            this.d = d;
            this.tx = tx;
            this.ty = ty;
        }
        Matrix.prototype.copyFrom = function (value) {
            this.a = value.a;
            this.b = value.b;
            this.c = value.c;
            this.d = value.d;
            this.tx = value.tx;
            this.ty = value.ty;
            return this;
        };
        Matrix.prototype.copyFromArray = function (value, offset) {
            if (offset === void 0) { offset = 0; }
            this.a = value[offset];
            this.b = value[offset + 1];
            this.c = value[offset + 2];
            this.d = value[offset + 3];
            this.tx = value[offset + 4];
            this.ty = value[offset + 5];
            return this;
        };
        Matrix.prototype.identity = function () {
            this.a = this.d = 1.0;
            this.b = this.c = 0.0;
            this.tx = this.ty = 0.0;
            return this;
        };
        Matrix.prototype.concat = function (value) {
            var aA = this.a * value.a;
            var bA = 0.0;
            var cA = 0.0;
            var dA = this.d * value.d;
            var txA = this.tx * value.a + value.tx;
            var tyA = this.ty * value.d + value.ty;
            if (this.b !== 0.0 || this.c !== 0.0) {
                aA += this.b * value.c;
                bA += this.b * value.d;
                cA += this.c * value.a;
                dA += this.c * value.b;
            }
            if (value.b !== 0.0 || value.c !== 0.0) {
                bA += this.a * value.b;
                cA += this.d * value.c;
                txA += this.ty * value.c;
                tyA += this.tx * value.b;
            }
            this.a = aA;
            this.b = bA;
            this.c = cA;
            this.d = dA;
            this.tx = txA;
            this.ty = tyA;
            return this;
        };
        Matrix.prototype.invert = function () {
            var aA = this.a;
            var bA = this.b;
            var cA = this.c;
            var dA = this.d;
            var txA = this.tx;
            var tyA = this.ty;
            if (bA === 0.0 && cA === 0.0) {
                this.b = this.c = 0.0;
                if (aA === 0.0 || dA === 0.0) {
                    this.a = this.b = this.tx = this.ty = 0.0;
                }
                else {
                    aA = this.a = 1.0 / aA;
                    dA = this.d = 1.0 / dA;
                    this.tx = -aA * txA;
                    this.ty = -dA * tyA;
                }
                return this;
            }
            var determinant = aA * dA - bA * cA;
            if (determinant === 0.0) {
                this.a = this.d = 1.0;
                this.b = this.c = 0.0;
                this.tx = this.ty = 0.0;
                return this;
            }
            determinant = 1.0 / determinant;
            var k = this.a = dA * determinant;
            bA = this.b = -bA * determinant;
            cA = this.c = -cA * determinant;
            dA = this.d = aA * determinant;
            this.tx = -(k * txA + cA * tyA);
            this.ty = -(bA * txA + dA * tyA);
            return this;
        };
        Matrix.prototype.transformPoint = function (x, y, result, delta) {
            if (delta === void 0) { delta = false; }
            result.x = this.a * x + this.c * y;
            result.y = this.b * x + this.d * y;
            if (!delta) {
                result.x += this.tx;
                result.y += this.ty;
            }
        };
        return Matrix;
    }());
    var Transform = /** @class */ (function () {
        function Transform(x, y, skX, skY, scX, scY, pX, // Deprecated.
        pY // Deprecated.
        ) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            if (skX === void 0) { skX = 0.0; }
            if (skY === void 0) { skY = 0.0; }
            if (scX === void 0) { scX = 1.0; }
            if (scY === void 0) { scY = 1.0; }
            if (pX === void 0) { pX = 0.0; }
            if (pY === void 0) { pY = 0.0; } // Deprecated.
            this.x = x;
            this.y = y;
            this.skX = skX;
            this.skY = skY;
            this.scX = scX;
            this.scY = scY;
            this.pX = pX;
            this.pY = pY; // Deprecated.
        }
        Transform.prototype.toString = function () {
            return this.x + "_" + this.y + "_" + this.skX + "_" + this.skY + "_" + this.scX + "_" + this.scY;
        };
        Transform.prototype.toFixed = function () {
            this.x = Number(this.x.toFixed(2));
            this.y = Number(this.y.toFixed(2));
            this.skX = Number(this.skX.toFixed(2));
            this.skY = Number(this.skY.toFixed(2));
            this.scX = Number(this.scX.toFixed(4));
            this.scY = Number(this.scY.toFixed(4));
        };
        Transform.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            this.skX = value.skX;
            this.skY = value.skY;
            this.scX = value.scX;
            this.scY = value.scY;
            return this;
        };
        Transform.prototype.equal = function (value) {
            return this.x === value.x && this.y === value.y &&
                this.skX === value.skY && this.skY === value.skY &&
                this.scX === value.scX && this.scY === value.scY;
        };
        Transform.prototype.identity = function () {
            this.x = this.y = this.skX = this.skY = 0.0;
            this.scX = this.scY = 1.0;
            return this;
        };
        Transform.prototype.fromMatrix = function (matrix) {
            this.x = matrix.tx;
            this.y = matrix.ty;
            var backupScaleX = this.scX, backupScaleY = this.scY;
            var skX = Math.atan(-matrix.c / matrix.d);
            var skY = Math.atan(matrix.b / matrix.a);
            this.scX = (skY > -PI_Q && skY < PI_Q) ? matrix.a / Math.cos(skY) : matrix.b / Math.sin(skY);
            this.scY = (skX > -PI_Q && skX < PI_Q) ? matrix.d / Math.cos(skX) : -matrix.c / Math.sin(skX);
            if (backupScaleX >= 0.0 && this.scX < 0.0) {
                this.scX = -this.scX;
                skY = normalizeRadian(skY - Math.PI);
            }
            if (backupScaleY >= 0.0 && this.scY < 0.0) {
                this.scY = -this.scY;
                skX = normalizeRadian(skX - Math.PI);
            }
            this.skX = skX * RAD_DEG;
            this.skY = skY * RAD_DEG;
            return this;
        };
        Transform.prototype.toMatrix = function (matrix) {
            var skX = this.skX * DEG_RAD;
            var skY = this.skY * DEG_RAD;
            matrix.a = Math.cos(skY) * this.scX;
            matrix.b = Math.sin(skY) * this.scX;
            matrix.c = -Math.sin(skX) * this.scY;
            matrix.d = Math.cos(skX) * this.scY;
            matrix.tx = this.x;
            matrix.ty = this.y;
            return this;
        };
        return Transform;
    }());
    var ColorTransform = /** @class */ (function () {
        function ColorTransform(aM, rM, gM, bM, aO, rO, gO, bO) {
            if (aM === void 0) { aM = 100; }
            if (rM === void 0) { rM = 100; }
            if (gM === void 0) { gM = 100; }
            if (bM === void 0) { bM = 100; }
            if (aO === void 0) { aO = 0; }
            if (rO === void 0) { rO = 0; }
            if (gO === void 0) { gO = 0; }
            if (bO === void 0) { bO = 0; }
            this.aM = aM;
            this.rM = rM;
            this.gM = gM;
            this.bM = bM;
            this.aO = aO;
            this.rO = rO;
            this.gO = gO;
            this.bO = bO;
        }
        ColorTransform.prototype.toString = function () {
            return this.aM + "_" + this.rM + "_" + this.gM + "_" + this.bM + "_" + this.aO + "_" + this.rO + "_" + this.gO + "_" + this.bO;
        };
        ColorTransform.prototype.toFixed = function () {
            this.aM = Math.round(this.aM);
            this.rM = Math.round(this.rM);
            this.gM = Math.round(this.gM);
            this.bM = Math.round(this.bM);
            this.aO = Math.round(this.aO);
            this.rO = Math.round(this.rO);
            this.gO = Math.round(this.gO);
            this.bO = Math.round(this.bO);
        };
        ColorTransform.prototype.copyFrom = function (value) {
            this.aM = value.aM;
            this.rM = value.rM;
            this.gM = value.gM;
            this.bM = value.bM;
            this.aO = value.aO;
            this.rO = value.rO;
            this.gO = value.gO;
            this.bO = value.bO;
        };
        ColorTransform.prototype.copyFromRGBA = function (value) {
            this.rM = Math.round(((0xFF000000 & value) >>> 24) / 255 * 100);
            this.gM = Math.round(((0x00FF0000 & value) >>> 16) / 255 * 100);
            this.bM = Math.round(((0x0000FF00 & value) >>> 8) / 255 * 100);
            this.aM = Math.round((0x000000FF & value) / 255 * 100);
        };
        ColorTransform.prototype.identity = function () {
            this.aM = this.rM = this.gM = this.bM = 100;
            this.aO = this.rO = this.gO = this.bO = 0;
        };
        ColorTransform.prototype.equal = function (value) {
            return this.aM === value.aM && this.rM === value.rM && this.gM === value.gM && this.bM === value.bM &&
                this.aO === value.aO && this.rO === value.rO && this.gO === value.gO && this.bO === value.bO;
        };
        return ColorTransform;
    }());
    var Point = /** @class */ (function () {
        function Point(x, y) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            this.x = x;
            this.y = y;
        }
        Point.prototype.toString = function () {
            return "[object Point x: " + this.x + " y: " + this.y + " ]";
        };
        Point.prototype.clear = function () {
            this.x = this.y = 0.0;
        };
        Point.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            return this;
        };
        Point.prototype.setTo = function (x, y) {
            this.x = x;
            this.y = y;
            return this;
        };
        Point.prototype.polar = function (length, radian) {
            this.x = length * Math.cos(radian);
            this.y = length * Math.sin(radian);
            return this;
        };
        return Point;
    }());
    var Rectangle = /** @class */ (function () {
        function Rectangle(x, y, width, height) {
            if (x === void 0) { x = 0.0; }
            if (y === void 0) { y = 0.0; }
            if (width === void 0) { width = 0.0; }
            if (height === void 0) { height = 0.0; }
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
        }
        Rectangle.prototype.toString = function () {
            return "[object Rectangle x: " + this.x + " y: " + this.y + " width: " + this.width + " height: " + this.height + " ]";
        };
        Rectangle.prototype.toFixed = function () {
            this.x = Number(this.x.toFixed(2));
            this.y = Number(this.y.toFixed(2));
            this.width = Number(this.width.toFixed(2));
            this.height = Number(this.height.toFixed(2));
        };
        Rectangle.prototype.clear = function () {
            this.x = this.y = this.width = this.height = 0.0;
        };
        Rectangle.prototype.copyFrom = function (value) {
            this.x = value.x;
            this.y = value.y;
            this.width = value.width;
            this.height = value.height;
            return this;
        };
        Rectangle.prototype.setTo = function (x, y, width, height) {
            this.x = x;
            this.y = y;
            this.width = width;
            this.height = height;
            return this;
        };
        return Rectangle;
    }());
    var helpMatrixA = new Matrix();
    var helpMatrixB = new Matrix();
    var helpTransformA = new Transform();
    var helpTransformB = new Transform();
    var helpPointA = new Point();
    var helpPointB = new Point();

    var __extends$1 = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /**
     * DragonBones format v23.
     */
    var DragonBones$1 = /** @class */ (function () {
        function DragonBones() {
            this.isGlobal = true;
            this.frameRate = 0;
            this.name = "";
            this.version = "";
            this.armature = [];
        }
        return DragonBones;
    }());
    var Armature$1 = /** @class */ (function () {
        function Armature() {
            this.name = "";
            this.bone = [];
            this.skin = [];
            this.animation = [];
        }
        Armature.prototype.getBone = function (name) {
            for (var _i = 0, _a = this.bone; _i < _a.length; _i++) {
                var bone = _a[_i];
                if (bone.name === name) {
                    return bone;
                }
            }
            return null;
        };
        return Armature;
    }());
    var Bone$1 = /** @class */ (function () {
        function Bone() {
            this.name = "";
            this.parent = "";
            this.transform = new Transform();
        }
        return Bone;
    }());
    var Skin$1 = /** @class */ (function () {
        function Skin() {
            this.name = "default";
            this.slot = [];
        }
        return Skin;
    }());
    var Slot$1 = /** @class */ (function () {
        function Slot() {
            this.blendMode = BlendMode[BlendMode.Normal].toLowerCase();
            this.z = 0;
            this.displayIndex = 0;
            this.name = "";
            this.parent = "";
            this.colorTransform = new ColorTransform();
            this.display = [];
        }
        return Slot;
    }());
    var Display$1 = /** @class */ (function () {
        function Display() {
            this.type = DisplayType[DisplayType.Image].toLowerCase();
            this.name = "";
            this.transform = new Transform();
        }
        return Display;
    }());
    var ImageDisplay$1 = /** @class */ (function (_super) {
        __extends$1(ImageDisplay, _super);
        function ImageDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Image].toLowerCase();
            }
            return _this;
        }
        return ImageDisplay;
    }(Display$1));
    var ArmatureDisplay$1 = /** @class */ (function (_super) {
        __extends$1(ArmatureDisplay, _super);
        function ArmatureDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Armature].toLowerCase();
            }
            return _this;
        }
        return ArmatureDisplay;
    }(Display$1));
    var Timeline$1 = /** @class */ (function () {
        function Timeline() {
            this.scale = 1.0;
            this.offset = 0.0;
            this.name = "";
            this.frame = [];
        }
        return Timeline;
    }());
    var Animation$1 = /** @class */ (function () {
        function Animation() {
            this.autoTween = true;
            this.tweenEasing = null;
            this.duration = 1;
            this.loop = 1;
            this.scale = 1.0;
            this.fadeInTime = 0.0;
            this.name = "default";
            this.frame = [];
            this.timeline = [];
        }
        return Animation;
    }());
    var AllTimeline = /** @class */ (function (_super) {
        __extends$1(AllTimeline, _super);
        function AllTimeline() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return AllTimeline;
    }(Timeline$1));
    var Frame$1 = /** @class */ (function () {
        function Frame() {
            this.duration = 1;
        }
        return Frame;
    }());
    var TweenFrame$1 = /** @class */ (function (_super) {
        __extends$1(TweenFrame, _super);
        function TweenFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tweenEasing = null;
            _this.curve = [];
            return _this;
        }
        return TweenFrame;
    }(Frame$1));
    var AnimationFrame$1 = /** @class */ (function (_super) {
        __extends$1(AnimationFrame, _super);
        function AnimationFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.action = "";
            _this.event = "";
            _this.sound = "";
            return _this;
        }
        return AnimationFrame;
    }(Frame$1));
    var AllFrame = /** @class */ (function (_super) {
        __extends$1(AllFrame, _super);
        function AllFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.hide = false;
            _this.tweenRotate = 0;
            _this.displayIndex = 0;
            _this.action = "";
            _this.event = "";
            _this.sound = "";
            _this.transform = new Transform();
            _this.colorTransform = new ColorTransform();
            return _this;
        }
        return AllFrame;
    }(TweenFrame$1));
    var copyConfig$1 = [
        DragonBones$1, {
            armature: Armature$1,
            textureAtlas: TextureAtlas
        },
        Armature$1, {
            bone: Bone$1,
            skin: Skin$1,
            animation: Animation$1
        },
        Bone$1, {
            transform: Transform
        },
        Slot$1, {
            display: [
                function (display) {
                    var type = display.type;
                    if (type !== undefined) {
                        if (typeof type === "string") {
                            type = getEnumFormString(DisplayType, type, DisplayType.Image);
                        }
                    }
                    else {
                        type = DisplayType.Image;
                    }
                    switch (type) {
                        case DisplayType.Image:
                            return ImageDisplay$1;
                        case DisplayType.Armature:
                            return ArmatureDisplay$1;
                    }
                    return null;
                },
                Function
            ]
        },
        Skin$1, {
            slot: Slot$1
        },
        Animation$1, {
            frame: AnimationFrame$1,
            timeline: AllTimeline
        },
        AllTimeline, {
            frame: AllFrame
        },
        AllFrame, {
            transform: Transform,
            colorTransform: ColorTransform
        },
        TextureAtlas, {
            SubTexture: Texture
        }
    ];

    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    /**
     * DragonBones format.
     */
    var DATA_VERSION_2_3 = "2.3";
    var DATA_VERSION_3_0 = "3.0";
    var DATA_VERSION_4_0 = "4.0";
    var DATA_VERSION_4_5 = "4.5";
    var DATA_VERSION_5_0 = "5.0";
    var DATA_VERSION_5_5 = "5.5";
    var DATA_VERSION_5_6 = "5.6";
    var DATA_VERSIONS = [
        DATA_VERSION_2_3,
        DATA_VERSION_3_0,
        DATA_VERSION_4_0,
        DATA_VERSION_4_5,
        DATA_VERSION_5_0,
        DATA_VERSION_5_5,
        DATA_VERSION_5_6
    ];
    var ArmatureType;
    (function (ArmatureType) {
        ArmatureType[ArmatureType["Armature"] = 0] = "Armature";
        ArmatureType[ArmatureType["MovieClip"] = 1] = "MovieClip";
        ArmatureType[ArmatureType["Stage"] = 2] = "Stage";
        ArmatureType[ArmatureType["ImageSequences"] = 3] = "ImageSequences";
    })(ArmatureType || (ArmatureType = {}));
    var BoneType;
    (function (BoneType) {
        BoneType[BoneType["Bone"] = 0] = "Bone";
        BoneType[BoneType["Surface"] = 1] = "Surface";
    })(BoneType || (BoneType = {}));
    var DisplayType;
    (function (DisplayType) {
        DisplayType[DisplayType["Image"] = 0] = "Image";
        DisplayType[DisplayType["Armature"] = 1] = "Armature";
        DisplayType[DisplayType["Mesh"] = 2] = "Mesh";
        DisplayType[DisplayType["BoundingBox"] = 3] = "BoundingBox";
        DisplayType[DisplayType["Path"] = 4] = "Path";
    })(DisplayType || (DisplayType = {}));
    var BoundingBoxType;
    (function (BoundingBoxType) {
        BoundingBoxType[BoundingBoxType["Rectangle"] = 0] = "Rectangle";
        BoundingBoxType[BoundingBoxType["Ellipse"] = 1] = "Ellipse";
        BoundingBoxType[BoundingBoxType["Polygon"] = 2] = "Polygon";
    })(BoundingBoxType || (BoundingBoxType = {}));
    var ActionType;
    (function (ActionType) {
        ActionType[ActionType["Play"] = 0] = "Play";
        ActionType[ActionType["Frame"] = 10] = "Frame";
        ActionType[ActionType["Sound"] = 11] = "Sound";
    })(ActionType || (ActionType = {}));
    var BlendMode;
    (function (BlendMode) {
        BlendMode[BlendMode["Normal"] = 0] = "Normal";
        BlendMode[BlendMode["Add"] = 1] = "Add";
        BlendMode[BlendMode["Alpha"] = 2] = "Alpha";
        BlendMode[BlendMode["Darken"] = 3] = "Darken";
        BlendMode[BlendMode["Difference"] = 4] = "Difference";
        BlendMode[BlendMode["Erase"] = 5] = "Erase";
        BlendMode[BlendMode["HardLight"] = 6] = "HardLight";
        BlendMode[BlendMode["Invert"] = 7] = "Invert";
        BlendMode[BlendMode["Layer"] = 8] = "Layer";
        BlendMode[BlendMode["Lighten"] = 9] = "Lighten";
        BlendMode[BlendMode["Multiply"] = 10] = "Multiply";
        BlendMode[BlendMode["Overlay"] = 11] = "Overlay";
        BlendMode[BlendMode["Screen"] = 12] = "Screen";
        BlendMode[BlendMode["Subtract"] = 13] = "Subtract";
    })(BlendMode || (BlendMode = {}));
    var TweenType;
    (function (TweenType) {
        TweenType[TweenType["None"] = 0] = "None";
        TweenType[TweenType["Line"] = 1] = "Line";
        TweenType[TweenType["Curve"] = 2] = "Curve";
        TweenType[TweenType["QuadIn"] = 3] = "QuadIn";
        TweenType[TweenType["QuadOut"] = 4] = "QuadOut";
        TweenType[TweenType["QuadInOut"] = 5] = "QuadInOut";
    })(TweenType || (TweenType = {}));
    function isDragonBonesString(string) {
        var testString = string.substr(0, Math.min(200, string.length));
        return testString.indexOf("armature") > 0 || testString.indexOf("textureAtlas") > 0;
    }
    function isDragonBonesObject(object) {
        return object.hasOwnProperty("armature") || object.hasOwnProperty("textureAtlas");
    }
    function getTextureFormTextureAtlases(name, textureAtlases) {
        for (var _i = 0, textureAtlases_1 = textureAtlases; _i < textureAtlases_1.length; _i++) {
            var textureAtlas = textureAtlases_1[_i];
            var texture = textureAtlas.getTexture(name);
            if (texture !== null) {
                return texture;
            }
        }
        return null;
    }
    function getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, t, result) {
        var l_t = 1 - t;
        var powA = l_t * l_t;
        var powB = t * t;
        var kA = l_t * powA;
        var kB = 3.0 * t * powA;
        var kC = 3.0 * l_t * powB;
        var kD = t * powB;
        result.x = kA * x1 + kB * x2 + kC * x3 + kD * x4;
        result.y = kA * y1 + kB * y2 + kC * y3 + kD * y4;
    }
    function getCurveEasingValue(t, curve) {
        var curveCount = curve.length;
        if (curveCount % 3 === 1) {
            var stepIndex = -2;
            while ((stepIndex + 6 < curveCount ? curve[stepIndex + 6] : 1) < t) {
                stepIndex += 6;
            }
            var isInCurve = stepIndex >= 0 && stepIndex + 6 < curveCount;
            var x1 = isInCurve ? curve[stepIndex] : 0.0;
            var y1 = isInCurve ? curve[stepIndex + 1] : 0.0;
            var x2 = curve[stepIndex + 2];
            var y2 = curve[stepIndex + 3];
            var x3 = curve[stepIndex + 4];
            var y3 = curve[stepIndex + 5];
            var x4 = isInCurve ? curve[stepIndex + 6] : 1.0;
            var y4 = isInCurve ? curve[stepIndex + 7] : 1.0;
            var lower = 0.0;
            var higher = 1.0;
            while (higher - lower > 0.01) {
                var percentage = (higher + lower) / 2.0;
                getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, percentage, helpPointA);
                if (t - helpPointA.x > 0.0) {
                    lower = percentage;
                }
                else {
                    higher = percentage;
                }
            }
            return helpPointA.y;
        }
        else {
            var stepIndex = 0;
            while (curve[stepIndex + 6] < t) {
                stepIndex += 6;
            }
            var x1 = curve[stepIndex];
            var y1 = curve[stepIndex + 1];
            var x2 = curve[stepIndex + 2];
            var y2 = curve[stepIndex + 3];
            var x3 = curve[stepIndex + 4];
            var y3 = curve[stepIndex + 5];
            var x4 = curve[stepIndex + 6];
            var y4 = curve[stepIndex + 7];
            var lower = 0.0;
            var higher = 1.0;
            while (higher - lower > 0.01) {
                var percentage = (higher + lower) / 2.0;
                getCurvePoint(x1, y1, x2, y2, x3, y3, x4, y4, percentage, helpPointA);
                if (t - helpPointA.x > 0.0) {
                    lower = percentage;
                }
                else {
                    higher = percentage;
                }
            }
            return helpPointA.y;
        }
    }
    function getEasingValue(tweenType, progress, easing) {
        var value = progress;
        switch (tweenType) {
            case TweenType.QuadIn:
                value = Math.pow(progress, 2.0);
                break;
            case TweenType.QuadOut:
                value = 1.0 - Math.pow(1.0 - progress, 2.0);
                break;
            case TweenType.QuadInOut:
                value = 0.5 * (1.0 - Math.cos(progress * Math.PI));
                break;
        }
        return (value - progress) * easing + progress;
    }
    function oldActionToNewAction(oldAction) {
        var newAction = new Action();
        newAction.type = ActionType.Play;
        newAction.name = oldAction.gotoAndPlay;
        return newAction;
    }
    function mergeActionToAnimation(animation, frame, framePosition, bone, slot, forRuntime) {
        var frames = animation.frame;
        var boneName = bone ? bone.name : "";
        var slotName = slot ? slot.name : "";
        if (frames.length === 0) {
            var beginFrame = new ActionFrame();
            beginFrame.duration = animation.duration;
            frames.push(beginFrame);
        }
        var position = 0;
        var frameIndex = 0;
        var insertFrame = null;
        var prevFrame = null;
        for (var i = 0, l = frames.length; i < l; ++i) {
            var eachFrame = frames[i];
            if (framePosition === position) {
                insertFrame = eachFrame;
                break;
            }
            else if (framePosition < position && prevFrame !== null) {
                prevFrame.duration = framePosition - (position - prevFrame.duration);
                insertFrame = new ActionFrame();
                insertFrame.duration = position - framePosition;
                frames.splice(i + 1, 0, insertFrame);
                break;
            }
            position += eachFrame.duration;
            prevFrame = eachFrame;
            frameIndex++;
        }
        if (insertFrame === null && prevFrame !== null) {
            prevFrame.duration = framePosition;
            insertFrame = new ActionFrame();
            insertFrame.duration = position - framePosition;
            frames.splice(frameIndex, 0, insertFrame);
        }
        if (insertFrame !== null) {
            if (frame instanceof AllFrame || frame instanceof BoneAllFrame) {
                if (frame.event) {
                    var action = new Action();
                    action.name = frame.event;
                    action.bone = boneName;
                    if (forRuntime) {
                        action.type = ActionType.Frame;
                        insertFrame.actions.push(action);
                    }
                    else {
                        insertFrame.events.push(action);
                    }
                }
                if (frame.sound) {
                    if (forRuntime) {
                        var action = new Action();
                        action.type = ActionType.Sound;
                        action.name = frame.sound;
                        action.bone = boneName;
                        insertFrame.actions.push(action);
                    }
                    else {
                        insertFrame.sound = frame.sound;
                    }
                }
                if (frame.action) {
                    if (forRuntime) {
                        var action = new Action();
                        action.type = ActionType.Play;
                        action.name = frame.action;
                        action.slot = slotName;
                        insertFrame.actions.push(action);
                    }
                }
            }
            else if (forRuntime) {
                for (var _i = 0, _a = frame.actions; _i < _a.length; _i++) {
                    var action = _a[_i];
                    if (action instanceof OldAction) {
                        var newAction = new Action();
                        newAction.type = ActionType.Play;
                        newAction.name = action.gotoAndPlay;
                        newAction.slot = slotName;
                        insertFrame.actions.push(newAction);
                    }
                    else {
                        action.slot = slotName;
                        insertFrame.actions.push(action);
                    }
                }
            }
        }
    }
    var DragonBones = /** @class */ (function () {
        function DragonBones() {
            this.frameRate = 0;
            this.name = "";
            this.stage = "";
            this.version = "";
            this.compatibleVersion = "";
            this.armature = [];
            this.offset = []; // Binary.
            this.tag = []; // Binary.
            this.textureAtlas = [];
            this.userData = null;
        }
        return DragonBones;
    }());
    var UserData = /** @class */ (function () {
        function UserData() {
            this.ints = [];
            this.floats = [];
            this.strings = [];
        }
        return UserData;
    }());
    var OldAction = /** @class */ (function () {
        function OldAction() {
            this.gotoAndPlay = "";
        }
        return OldAction;
    }());
    var Action = /** @class */ (function (_super) {
        __extends(Action, _super);
        function Action() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.type = ActionType.Play;
            _this.name = "";
            _this.bone = "";
            _this.slot = "";
            return _this;
        }
        return Action;
    }(UserData));
    var Canvas = /** @class */ (function () {
        function Canvas() {
            this.hasBackground = false;
            this.color = -1;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
        }
        return Canvas;
    }());
    var Armature = /** @class */ (function () {
        function Armature() {
            this.type = ArmatureType[ArmatureType.Armature].toLowerCase();
            this.frameRate = 0;
            this.name = "";
            this.aabb = new Rectangle();
            this.bone = [];
            this.slot = [];
            this.ik = [];
            this.path = [];
            this.skin = [];
            this.animation = []; // Binary.
            this.defaultActions = [];
            this.actions = [];
            this.canvas = null;
            this.userData = null;
        }
        Armature.prototype.sortBones = function () {
            var total = this.bone.length;
            if (total <= 0) {
                return;
            }
            var sortHelper = this.bone.concat();
            var index = 0;
            var count = 0;
            this.bone.length = 0;
            while (count < total) {
                var bone = sortHelper[index++];
                if (index >= total) {
                    index = 0;
                }
                if (this.bone.indexOf(bone) >= 0) {
                    continue;
                }
                // TODO constraint.
                if (bone.parent) {
                    var parent_1 = this.getBone(bone.parent);
                    if (!parent_1 || this.bone.indexOf(parent_1) < 0) {
                        continue;
                    }
                }
                this.bone.push(bone);
                count++;
            }
        };
        Armature.prototype.getBone = function (name) {
            for (var _i = 0, _a = this.bone; _i < _a.length; _i++) {
                var bone = _a[_i];
                if (bone.name === name) {
                    return bone;
                }
            }
            return null;
        };
        Armature.prototype.getSlot = function (name) {
            for (var _i = 0, _a = this.slot; _i < _a.length; _i++) {
                var slot = _a[_i];
                if (slot.name === name) {
                    return slot;
                }
            }
            return null;
        };
        Armature.prototype.getSkin = function (name) {
            for (var _i = 0, _a = this.skin; _i < _a.length; _i++) {
                var skin = _a[_i];
                if (skin.name === name) {
                    return skin;
                }
            }
            return null;
        };
        Armature.prototype.getMesh = function (skinName, slotName, displayName) {
            var skin = this.getSkin(skinName);
            if (skin) {
                var slot = skin.getSlot(slotName);
                if (slot) {
                    return slot.getDisplay(displayName);
                }
            }
            return null;
        };
        Armature.prototype.localToGlobal = function () {
            this.sortBones();
            var helpMatrixA = new Matrix();
            var helpMatrixB = new Matrix();
            for (var _i = 0, _a = this.bone; _i < _a.length; _i++) {
                var bone = _a[_i];
                if (!bone._global) {
                    bone._global = new Transform();
                }
                bone._global.copyFrom(bone.transform);
                if (bone.parent) {
                    var parent_2 = this.getBone(bone.parent);
                    if (parent_2 && parent_2._global) {
                        parent_2._global.toMatrix(helpMatrixA);
                        if (bone.inheritScale) {
                            if (!bone.inheritRotation) {
                                bone._global.skX -= parent_2._global.skY;
                                bone._global.skY -= parent_2._global.skY;
                            }
                            bone._global.toMatrix(helpMatrixB);
                            helpMatrixB.concat(helpMatrixA);
                            bone._global.fromMatrix(helpMatrixB);
                            if (!bone.inheritTranslation) {
                                bone._global.x = bone.transform.x;
                                bone._global.y = bone.transform.y;
                            }
                        }
                        else {
                            if (bone.inheritTranslation) {
                                helpMatrixA.transformPoint(bone._global.x, bone._global.y, bone._global, true);
                            }
                            if (bone.inheritRotation) {
                                var dR = parent_2._global.skY;
                                if (parent_2._global.scX < 0.0) {
                                    dR += Math.PI;
                                }
                                if (helpMatrixA.a * helpMatrixA.d - helpMatrixA.b * helpMatrixA.c < 0.0) {
                                    dR -= bone._global.skY * 2.0;
                                    if (bone.inheritReflection) {
                                        bone._global.skX += Math.PI;
                                    }
                                }
                                bone._global.skX += dR;
                                bone._global.skY += dR;
                            }
                        }
                    }
                }
            }
        };
        return Armature;
    }());
    var Bone = /** @class */ (function () {
        function Bone() {
            this.type = BoneType[BoneType.Bone].toLowerCase();
            this.inheritTranslation = true;
            this.inheritRotation = true;
            this.inheritScale = true;
            this.inheritReflection = true;
            this.length = 0.0;
            this.name = "";
            this.parent = "";
            this.transform = new Transform();
            this.userData = null;
            this._global = null;
        }
        return Bone;
    }());
    var Surface = /** @class */ (function (_super) {
        __extends(Surface, _super);
        function Surface() {
            var _this = _super.call(this) || this;
            _this.segmentX = 0;
            _this.segmentY = 0;
            _this.vertices = [];
            _this.type = BoneType[BoneType.Surface].toLowerCase();
            return _this;
        }
        return Surface;
    }(Bone));
    var Slot = /** @class */ (function () {
        function Slot() {
            this.blendMode = BlendMode[BlendMode.Normal].toLowerCase();
            this.displayIndex = 0;
            this.name = "";
            this.parent = "";
            this.color = new ColorTransform();
            this.actions = []; // Deprecated.
            this.userData = null;
        }
        return Slot;
    }());
    var IKConstraint = /** @class */ (function () {
        function IKConstraint() {
            this.bendPositive = true;
            this.chain = 0;
            this.weight = 1.00;
            this.name = "";
            this.bone = "";
            this.target = "";
        }
        return IKConstraint;
    }());
    var PathConstraint = /** @class */ (function () {
        function PathConstraint() {
            this.name = "";
            this.target = "";
            this.bones = [];
            this.positionMode = "percent";
            this.spacingMode = "length";
            this.rotateMode = "tangent";
            this.position = 0;
            this.spacing = 0;
            this.rotateOffset = 0;
            this.rotateMix = 0;
            this.translateMix = 0;
        }
        return PathConstraint;
    }());
    var Skin = /** @class */ (function () {
        function Skin() {
            this.name = "default";
            this.slot = [];
            this.userData = null;
        }
        Skin.prototype.getSlot = function (name) {
            for (var _i = 0, _a = this.slot; _i < _a.length; _i++) {
                var slot = _a[_i];
                if (slot.name === name) {
                    return slot;
                }
            }
            return null;
        };
        return Skin;
    }());
    var SkinSlot = /** @class */ (function () {
        function SkinSlot() {
            this.name = "";
            this.display = [];
            this.actions = []; // Deprecated.
        }
        SkinSlot.prototype.getDisplay = function (name) {
            for (var _i = 0, _a = this.display; _i < _a.length; _i++) {
                var display = _a[_i];
                if (display && display.name === name) {
                    return display;
                }
            }
            return null;
        };
        return SkinSlot;
    }());
    var Display = /** @class */ (function () {
        function Display() {
            this.type = DisplayType[DisplayType.Image].toLowerCase();
            this.name = "";
            this.transform = new Transform();
        }
        Display.prototype.clearToBinary = function () {
        };
        return Display;
    }());
    var BoundingBoxDisplay = /** @class */ (function (_super) {
        __extends(BoundingBoxDisplay, _super);
        function BoundingBoxDisplay() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.subType = BoundingBoxType[BoundingBoxType.Rectangle].toLowerCase();
            _this.color = 0x000000;
            return _this;
        }
        return BoundingBoxDisplay;
    }(Display));
    var ImageDisplay = /** @class */ (function (_super) {
        __extends(ImageDisplay, _super);
        function ImageDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.path = "";
            _this.pivot = new Point(0.5, 0.5);
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Image].toLowerCase();
            }
            return _this;
        }
        return ImageDisplay;
    }(Display));
    var ArmatureDisplay = /** @class */ (function (_super) {
        __extends(ArmatureDisplay, _super);
        function ArmatureDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.inheritAnimation = true;
            _this.path = "";
            _this.actions = [];
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Armature].toLowerCase();
            }
            return _this;
        }
        return ArmatureDisplay;
    }(Display));
    var MeshDisplay = /** @class */ (function (_super) {
        __extends(MeshDisplay, _super);
        function MeshDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.offset = -1; // Binary.
            _this.width = 0;
            _this.height = 0;
            _this.path = "";
            _this.vertices = [];
            _this.uvs = [];
            _this.triangles = [];
            _this.weights = [];
            _this.slotPose = [];
            _this.bonePose = [];
            _this.glueWeights = [];
            _this.glueMeshes = [];
            _this.edges = []; // Nonessential.
            _this.userEdges = []; // Nonessential.
            _this._boneCount = 0;
            _this._weightCount = 0;
            _this._userEdges = true; // TODO
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Mesh].toLowerCase();
            }
            return _this;
        }
        MeshDisplay.prototype.clearToBinary = function () {
            this.width = 0;
            this.height = 0;
            this.vertices.length = 0;
            this.uvs.length = 0;
            this.triangles.length = 0;
            this.weights.length = 0;
            this.slotPose.length = 0;
            this.bonePose.length = 0;
            this.edges.length = 0;
            this.userEdges.length = 0;
        };
        MeshDisplay.prototype.getBonePoseOffset = function (boneIndex) {
            for (var i = 0, l = this.bonePose.length; i < l; i += 7) {
                if (boneIndex === this.bonePose[i]) {
                    return i;
                }
            }
            // Impossible.
            return -1;
        };
        return MeshDisplay;
    }(Display));
    var SharedMeshDisplay = /** @class */ (function (_super) {
        __extends(SharedMeshDisplay, _super);
        function SharedMeshDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.inheritDeform = true;
            _this.path = "";
            _this.share = "";
            _this.skin = "default";
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Mesh].toLowerCase();
            }
            return _this;
        }
        return SharedMeshDisplay;
    }(Display));
    var PathDisplay = /** @class */ (function (_super) {
        __extends(PathDisplay, _super);
        function PathDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.offset = -1; // Binary.
            _this.closed = false;
            _this.constantSpeed = false;
            _this.vertexCount = 0;
            _this.vertices = [];
            _this.lengths = [];
            _this.weights = [];
            _this.bones = [];
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.Path].toLowerCase();
            }
            return _this;
        }
        PathDisplay.prototype.clearToBinary = function () {
            this.vertexCount = 0;
            this.vertices.length = 0;
            this.weights.length = 0;
            this.bones.length = 0;
        };
        return PathDisplay;
    }(Display));
    var RectangleBoundingBoxDisplay = /** @class */ (function (_super) {
        __extends(RectangleBoundingBoxDisplay, _super);
        function RectangleBoundingBoxDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.width = 0.00;
            _this.height = 0.00;
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.BoundingBox].toLowerCase();
                _this.subType = BoundingBoxType[BoundingBoxType.Rectangle].toLowerCase();
            }
            return _this;
        }
        return RectangleBoundingBoxDisplay;
    }(BoundingBoxDisplay));
    var EllipseBoundingBoxDisplay = /** @class */ (function (_super) {
        __extends(EllipseBoundingBoxDisplay, _super);
        function EllipseBoundingBoxDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.width = 0.00;
            _this.height = 0.00;
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.BoundingBox].toLowerCase();
                _this.subType = BoundingBoxType[BoundingBoxType.Ellipse].toLowerCase();
            }
            return _this;
        }
        return EllipseBoundingBoxDisplay;
    }(BoundingBoxDisplay));
    var PolygonBoundingBoxDisplay = /** @class */ (function (_super) {
        __extends(PolygonBoundingBoxDisplay, _super);
        function PolygonBoundingBoxDisplay(isDefault) {
            if (isDefault === void 0) { isDefault = false; }
            var _this = _super.call(this) || this;
            _this.offset = -1; // Binary.
            _this.vertexCount = 0;
            _this.vertices = [];
            _this.weights = [];
            _this.bones = [];
            if (!isDefault) {
                _this.type = DisplayType[DisplayType.BoundingBox].toLowerCase();
                _this.subType = BoundingBoxType[BoundingBoxType.Polygon].toLowerCase();
            }
            return _this;
        }
        PolygonBoundingBoxDisplay.prototype.clearToBinary = function () {
            this.vertexCount = 0;
            // this.vertices.length = 0;
            this.weights.length = 0;
            this.bones.length = 0;
        };
        return PolygonBoundingBoxDisplay;
    }(BoundingBoxDisplay));
    var Animation = /** @class */ (function () {
        function Animation() {
            this.duration = 1;
            this.playTimes = 1;
            this.scale = 1.0;
            this.fadeInTime = 0.0;
            this.name = "default";
            this.frame = [];
            this.bone = [];
            this.surface = [];
            this.slot = [];
            this.ffd = [];
            this.ik = [];
            this.animation = [];
            this.zOrder = null;
        }
        Animation.prototype.getSlotTimeline = function (name) {
            for (var _i = 0, _a = this.slot; _i < _a.length; _i++) {
                var timeline = _a[_i];
                if (timeline.name === name) {
                    return timeline;
                }
            }
            return null;
        };
        Animation.prototype.getBoneTimeline = function (name) {
            for (var _i = 0, _a = this.bone; _i < _a.length; _i++) {
                var timeline = _a[_i];
                if (timeline.name === name) {
                    return timeline;
                }
            }
            return null;
        };
        return Animation;
    }());
    var AnimationBinary = /** @class */ (function () {
        function AnimationBinary() {
            this.duration = 0;
            this.playTimes = 1;
            this.scale = 1.0;
            this.fadeInTime = 0.0;
            this.name = "";
            this.action = -1;
            this.zOrder = -1;
            this.offset = [];
            this.bone = {};
            this.surface = {};
            this.slot = {};
            this.constraint = {};
        }
        return AnimationBinary;
    }());
    var Timeline = /** @class */ (function () {
        function Timeline() {
            this.scale = 1.0;
            this.offset = 0.0;
            this.name = "";
        }
        return Timeline;
    }());
    var ZOrderTimeline = /** @class */ (function (_super) {
        __extends(ZOrderTimeline, _super);
        function ZOrderTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = [];
            return _this;
        }
        return ZOrderTimeline;
    }(Timeline));
    var BoneTimeline = /** @class */ (function (_super) {
        __extends(BoneTimeline, _super);
        function BoneTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = []; // Deprecated.
            _this.translateFrame = [];
            _this.rotateFrame = [];
            _this.scaleFrame = [];
            return _this;
        }
        BoneTimeline.prototype.insertFrame = function (frames, position) {
            var index = 0;
            var fromPosition = 0;
            var progress = 0.0;
            var from = null;
            var insert;
            var to = null;
            for (var _i = 0, frames_2 = frames; _i < frames_2.length; _i++) {
                var frame = frames_2[_i];
                if (fromPosition === position) {
                    return index;
                }
                else if (fromPosition < position && position <= fromPosition + frame.duration) {
                    if (index === frames.length - 1) {
                    }
                    else if (position === fromPosition + frame.duration) {
                        return index + 1;
                    }
                    else {
                        to = frames[index + 1];
                    }
                    progress = (position - fromPosition) / frame.duration;
                    from = frame;
                    index++;
                    break;
                }
                index++;
                fromPosition += frame.duration;
            }
            if (frames === this.frame) {
                if (!from) {
                    from = new BoneAllFrame();
                    frames.push(from);
                }
                insert = new BoneAllFrame();
            }
            else if (frames === this.translateFrame) {
                if (!from) {
                    from = new BoneTranslateFrame();
                    frames.push(from);
                }
                insert = new BoneTranslateFrame();
            }
            else if (frames === this.rotateFrame) {
                if (!from) {
                    from = new BoneRotateFrame();
                    frames.push(from);
                }
                insert = new BoneRotateFrame();
            }
            else if (frames === this.scaleFrame) {
                if (!from) {
                    from = new BoneScaleFrame();
                    frames.push(from);
                }
                insert = new BoneScaleFrame();
            }
            else {
                return -1;
            }
            insert.duration = from.duration - (position - fromPosition);
            from.duration -= insert.duration;
            frames.splice(index, 0, insert);
            if (from instanceof TweenFrame && insert instanceof TweenFrame) {
                // TODO
                insert.tweenEasing = from.tweenEasing;
                //to.curve; 
                progress = from.getTweenProgress(progress);
            }
            if (from instanceof BoneAllFrame && insert instanceof BoneAllFrame) {
                if (to instanceof BoneAllFrame) {
                    insert.transform.x = from.transform.x + (to.transform.x - from.transform.x) * progress;
                    insert.transform.y = from.transform.y + (to.transform.y - from.transform.y) * progress;
                    insert.transform.scX = from.transform.scX + (to.transform.scX - from.transform.scX) * progress;
                    insert.transform.scY = from.transform.scY + (to.transform.scY - from.transform.scY) * progress;
                    if (from.tweenRotate === 0) {
                        insert.tweenRotate = 0;
                        insert.transform.skX = from.transform.skX + normalizeDegree(to.transform.skX - from.transform.skX) * progress;
                        insert.transform.skY = from.transform.skY + normalizeDegree(to.transform.skY - from.transform.skY) * progress;
                    }
                    else {
                        var tweenRotate = from.tweenRotate;
                        if (tweenRotate > 0 && tweenRotate < 2) {
                            insert.tweenRotate = 1;
                        }
                        else if (tweenRotate < 0 && tweenRotate > -2) {
                            insert.tweenRotate = -1;
                        }
                        else {
                            insert.tweenRotate = Math.floor(tweenRotate * progress);
                        }
                        if (tweenRotate > 0 ? to.transform.skY >= from.transform.skY : to.transform.skY <= from.transform.skY) {
                            tweenRotate = tweenRotate > 0 ? tweenRotate - 1 : tweenRotate + 1;
                        }
                        insert.transform.skX = from.transform.skX + normalizeDegree(to.transform.skX - from.transform.skX + 360.0 * tweenRotate) * progress;
                        insert.transform.skY = from.transform.skY + normalizeDegree(to.transform.skY - from.transform.skY + 360.0 * tweenRotate) * progress;
                    }
                }
                else {
                    insert.transform.copyFrom(from.transform);
                }
            }
            else if (from instanceof BoneTranslateFrame && insert instanceof BoneTranslateFrame) {
                if (to instanceof BoneTranslateFrame) {
                    insert.x = from.x + (to.x - from.x) * progress;
                    insert.y = from.y + (to.y - from.y) * progress;
                }
                else {
                    insert.x = from.x;
                    insert.y = from.y;
                }
            }
            else if (from instanceof BoneRotateFrame && insert instanceof BoneRotateFrame && to instanceof BoneRotateFrame) {
                if (to instanceof BoneRotateFrame) {
                    if (from.clockwise === 0) {
                        insert.clockwise = 0;
                        insert.rotate = from.rotate + normalizeDegree(to.rotate - from.rotate) * progress;
                    }
                    else {
                        var clockwise = from.clockwise;
                        if (clockwise > 0 && clockwise < 2) {
                            insert.clockwise = 1;
                        }
                        else if (clockwise < 0 && clockwise > -2) {
                            insert.clockwise = -1;
                        }
                        else {
                            insert.clockwise = Math.floor(clockwise * progress);
                        }
                        if (clockwise > 0 ? to.rotate >= from.rotate : to.rotate <= from.rotate) {
                            clockwise = clockwise > 0 ? clockwise - 1 : clockwise + 1;
                        }
                        insert.rotate = from.rotate + (to.rotate - from.rotate + 360.0 * clockwise) * progress;
                    }
                    insert.skew = from.skew + (to.skew - from.skew) * progress;
                }
                else {
                    insert.rotate = from.rotate;
                    insert.skew = from.skew;
                }
            }
            else if (from instanceof BoneScaleFrame && insert instanceof BoneScaleFrame) {
                if (to instanceof BoneScaleFrame) {
                    insert.x = from.x + (to.x - from.x) * progress;
                    insert.y = from.y + (to.y - from.y) * progress;
                }
                else {
                    insert.x = from.x;
                    insert.y = from.y;
                }
            }
            else {
                return -1;
            }
            return index;
        };
        return BoneTimeline;
    }(Timeline));
    var SurfaceTimeline = /** @class */ (function (_super) {
        __extends(SurfaceTimeline, _super);
        function SurfaceTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = [];
            return _this;
        }
        return SurfaceTimeline;
    }(Timeline));
    var SlotTimeline = /** @class */ (function (_super) {
        __extends(SlotTimeline, _super);
        function SlotTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = []; // Deprecated.
            _this.displayFrame = [];
            _this.colorFrame = [];
            return _this;
        }
        SlotTimeline.prototype.insertFrame = function (frames, position) {
            var index = 0;
            var fromPosition = 0;
            var progress = 0.0;
            var from = null;
            var insert;
            var to = null;
            for (var _i = 0, frames_3 = frames; _i < frames_3.length; _i++) {
                var frame = frames_3[_i];
                if (fromPosition === position) {
                    return index;
                }
                else if (fromPosition < position && position <= fromPosition + frame.duration) {
                    if (index === frames.length - 1) {
                    }
                    else if (position === fromPosition + frame.duration) {
                        return index + 1;
                    }
                    else {
                        to = frames[index + 1];
                    }
                    progress = (position - fromPosition) / frame.duration;
                    from = frame;
                    index++;
                    break;
                }
                index++;
                fromPosition += frame.duration;
            }
            if (frames === this.frame) {
                if (!from) {
                    from = new SlotAllFrame();
                    frames.push(from);
                }
                insert = new SlotAllFrame();
            }
            else if (frames === this.displayFrame) {
                if (!from) {
                    from = new SlotDisplayFrame();
                    frames.push(from);
                }
                insert = new SlotDisplayFrame();
            }
            else if (frames === this.colorFrame) {
                if (!from) {
                    from = new SlotColorFrame();
                    frames.push(from);
                }
                insert = new SlotColorFrame();
            }
            else {
                return -1;
            }
            insert.duration = from.duration - (position - fromPosition);
            from.duration -= insert.duration;
            frames.splice(index, 0, insert);
            if (from instanceof TweenFrame && insert instanceof TweenFrame) {
                // TODO
                insert.tweenEasing = from.tweenEasing;
                //insert.curve; 
                progress = from.getTweenProgress(progress);
            }
            if (from instanceof SlotAllFrame && insert instanceof SlotAllFrame) {
                insert.displayIndex = from.displayIndex;
                if (to instanceof SlotAllFrame) {
                    insert.color.aM = from.color.aM + (to.color.aM - from.color.aM) * progress;
                    insert.color.rM = from.color.rM + (to.color.rM - from.color.rM) * progress;
                    insert.color.gM = from.color.gM + (to.color.gM - from.color.gM) * progress;
                    insert.color.bM = from.color.bM + (to.color.bM - from.color.bM) * progress;
                    insert.color.aO = from.color.aO + (to.color.aO - from.color.aO) * progress;
                    insert.color.rO = from.color.rO + (to.color.rO - from.color.rO) * progress;
                    insert.color.gO = from.color.gO + (to.color.gO - from.color.gO) * progress;
                    insert.color.bO = from.color.bO + (to.color.bO - from.color.bO) * progress;
                }
                else {
                    insert.color.copyFrom(insert.color);
                }
            }
            else if (from instanceof SlotDisplayFrame && insert instanceof SlotDisplayFrame) {
                insert.value = from.value;
            }
            else if (from instanceof SlotColorFrame && insert instanceof SlotColorFrame) {
                if (to instanceof SlotColorFrame) {
                    insert.value.aM = from.value.aM + (to.value.aM - from.value.aM) * progress;
                    insert.value.rM = from.value.rM + (to.value.rM - from.value.rM) * progress;
                    insert.value.gM = from.value.gM + (to.value.gM - from.value.gM) * progress;
                    insert.value.bM = from.value.bM + (to.value.bM - from.value.bM) * progress;
                    insert.value.aO = from.value.aO + (to.value.aO - from.value.aO) * progress;
                    insert.value.rO = from.value.rO + (to.value.rO - from.value.rO) * progress;
                    insert.value.gO = from.value.gO + (to.value.gO - from.value.gO) * progress;
                    insert.value.bO = from.value.bO + (to.value.bO - from.value.bO) * progress;
                }
                else {
                    insert.value.copyFrom(insert.value);
                }
            }
            else {
                return -1;
            }
            return index;
        };
        return SlotTimeline;
    }(Timeline));
    var MeshDeformTimeline = /** @class */ (function (_super) {
        __extends(MeshDeformTimeline, _super);
        function MeshDeformTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.skin = "default";
            _this.slot = "";
            _this.frame = [];
            return _this;
        }
        return MeshDeformTimeline;
    }(Timeline));
    var IKConstraintTimeline = /** @class */ (function (_super) {
        __extends(IKConstraintTimeline, _super);
        function IKConstraintTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = [];
            return _this;
        }
        return IKConstraintTimeline;
    }(Timeline));
    var AnimationTimeline = /** @class */ (function (_super) {
        __extends(AnimationTimeline, _super);
        function AnimationTimeline() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.frame = [];
            return _this;
        }
        return AnimationTimeline;
    }(Timeline));
    var Frame = /** @class */ (function () {
        function Frame() {
            this.duration = 1;
            this._position = -1;
        }
        return Frame;
    }());
    var TweenFrame = /** @class */ (function (_super) {
        __extends(TweenFrame, _super);
        function TweenFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tweenEasing = NaN;
            _this.curve = [];
            return _this;
        }
        TweenFrame.prototype.getTweenEnabled = function () {
            return this.curve.length > 0 || !isNaN(this.tweenEasing);
        };
        TweenFrame.prototype.removeTween = function () {
            this.tweenEasing = NaN;
            this.curve.length = 0;
        };
        TweenFrame.prototype.getTweenProgress = function (value) {
            if (this.getTweenEnabled()) {
                if (this.curve.length > 0) {
                    return getCurveEasingValue(value, this.curve);
                }
                else {
                    if (this.tweenEasing === 0.0) {
                    }
                    else if (this.tweenEasing <= 0.0) {
                        return getEasingValue(TweenType.QuadOut, value, this.tweenEasing);
                    }
                    else if (this.tweenEasing <= 1.0) {
                        return getEasingValue(TweenType.QuadIn, value, this.tweenEasing);
                    }
                    else if (this.tweenEasing <= 2.0) {
                        return getEasingValue(TweenType.QuadInOut, value, this.tweenEasing);
                    }
                    return value;
                }
            }
            return 0.0;
        };
        return TweenFrame;
    }(Frame));
    var ActionFrame = /** @class */ (function (_super) {
        __extends(ActionFrame, _super);
        function ActionFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.action = ""; // Deprecated.
            _this.event = ""; // Deprecated.
            _this.sound = ""; // Deprecated.
            _this.events = []; // Deprecated.
            _this.actions = [];
            return _this;
        }
        ActionFrame.prototype.equal = function (value) {
            // tslint:disable-next-line:no-unused-expression
            value;
            return !value;
        };
        return ActionFrame;
    }(Frame));
    var ZOrderFrame = /** @class */ (function (_super) {
        __extends(ZOrderFrame, _super);
        function ZOrderFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.zOrder = [];
            return _this;
        }
        ZOrderFrame.prototype.equal = function (value) {
            if (this.zOrder.length === value.zOrder.length) {
                for (var i = 0, l = this.zOrder.length; i < l; ++i) {
                    if (this.zOrder[i] !== value.zOrder[i]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        return ZOrderFrame;
    }(Frame));
    var BoneAllFrame = /** @class */ (function (_super) {
        __extends(BoneAllFrame, _super);
        function BoneAllFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.tweenRotate = 0;
            _this.action = ""; // Deprecated.
            _this.event = ""; // Deprecated.
            _this.sound = ""; // Deprecated.
            _this.transform = new Transform();
            return _this;
        }
        BoneAllFrame.prototype.equal = function (value) {
            return this.tweenRotate === 0 && !this.action && !this.event && !this.sound && this.transform.equal(value.transform);
        };
        return BoneAllFrame;
    }(TweenFrame));
    var BoneTranslateFrame = /** @class */ (function (_super) {
        __extends(BoneTranslateFrame, _super);
        function BoneTranslateFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.x = 0.0;
            _this.y = 0.0;
            return _this;
        }
        BoneTranslateFrame.prototype.equal = function (value) {
            return this.x === value.x && this.y === value.y;
        };
        return BoneTranslateFrame;
    }(TweenFrame));
    var BoneRotateFrame = /** @class */ (function (_super) {
        __extends(BoneRotateFrame, _super);
        function BoneRotateFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.clockwise = 0;
            _this.rotate = 0.0;
            _this.skew = 0.0;
            return _this;
        }
        BoneRotateFrame.prototype.equal = function (value) {
            return this.clockwise === 0 && this.rotate === value.rotate && this.skew === value.skew;
        };
        BoneRotateFrame.prototype.getTweenFrame = function (to, progress) {
            if (progress === 0.0 || this.getTweenEnabled()) {
                return this;
            }
            if (progress >= 1.0) {
                return to;
            }
            progress = this.getTweenProgress(progress);
            var frame = new BoneRotateFrame();
            if (this.clockwise === 0) {
                frame.rotate = this.rotate + normalizeDegree(to.rotate - this.rotate) * progress;
            }
            else {
                var clockwise = this.clockwise;
                if (clockwise > 0 ? to.rotate >= this.rotate : to.rotate <= this.rotate) {
                    clockwise = clockwise > 0 ? clockwise - 1 : clockwise + 1;
                }
                frame.rotate = this.rotate + (to.rotate - this.rotate + 360.0 * clockwise) * progress;
            }
            frame.skew = this.skew + (to.skew - this.skew) * progress;
            return frame;
        };
        return BoneRotateFrame;
    }(TweenFrame));
    var BoneScaleFrame = /** @class */ (function (_super) {
        __extends(BoneScaleFrame, _super);
        function BoneScaleFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.x = 1.0;
            _this.y = 1.0;
            return _this;
        }
        BoneScaleFrame.prototype.equal = function (value) {
            return this.x === value.x && this.y === value.y;
        };
        return BoneScaleFrame;
    }(TweenFrame));
    var DeformFrame = /** @class */ (function (_super) {
        __extends(DeformFrame, _super);
        function DeformFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.offset = 0;
            _this.vertices = [];
            return _this;
        }
        DeformFrame.prototype.equal = function (value) {
            if (this.offset === value.offset && this.vertices.length === value.vertices.length) {
                for (var i = 0, l = this.vertices.length; i < l; ++i) {
                    if (this.vertices[i] !== value.vertices[i]) {
                        return false;
                    }
                }
                return true;
            }
            return false;
        };
        return DeformFrame;
    }(TweenFrame));
    var SlotAllFrame = /** @class */ (function (_super) {
        __extends(SlotAllFrame, _super);
        function SlotAllFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.displayIndex = 0;
            _this.color = new ColorTransform();
            _this.actions = [];
            return _this;
        }
        SlotAllFrame.prototype.equal = function (value) {
            return this.actions.length === 0 && this.displayIndex === value.displayIndex && this.color.equal(value.color);
        };
        return SlotAllFrame;
    }(TweenFrame));
    var SlotDisplayFrame = /** @class */ (function (_super) {
        __extends(SlotDisplayFrame, _super);
        function SlotDisplayFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.value = 0;
            _this.actions = [];
            return _this;
        }
        SlotDisplayFrame.prototype.equal = function (value) {
            return this.actions.length === 0 && this.value === value.value;
        };
        return SlotDisplayFrame;
    }(Frame));
    var SlotColorFrame = /** @class */ (function (_super) {
        __extends(SlotColorFrame, _super);
        function SlotColorFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.value = new ColorTransform();
            _this.color = new ColorTransform(); // Deprecated.
            return _this;
        }
        SlotColorFrame.prototype.equal = function (value) {
            return this.value.equal(value.value);
        };
        return SlotColorFrame;
    }(TweenFrame));
    var IKConstraintFrame = /** @class */ (function (_super) {
        __extends(IKConstraintFrame, _super);
        function IKConstraintFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.bendPositive = true;
            _this.weight = 1.0;
            return _this;
        }
        IKConstraintFrame.prototype.equal = function (value) {
            return this.bendPositive === value.bendPositive && this.weight === value.weight;
        };
        return IKConstraintFrame;
    }(TweenFrame));
    var AnimationFrame = /** @class */ (function (_super) {
        __extends(AnimationFrame, _super);
        function AnimationFrame() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.value = -1;
            _this.weight = 1.0;
            return _this;
        }
        AnimationFrame.prototype.equal = function (value) {
            return this.value === value.value && this.weight === value.weight;
        };
        return AnimationFrame;
    }(TweenFrame));
    var TextureAtlas = /** @class */ (function () {
        function TextureAtlas() {
            this.width = 0;
            this.height = 0;
            this.scale = 1.00;
            this.name = "";
            this.imagePath = "";
            this.SubTexture = [];
        }
        TextureAtlas.prototype.getTexture = function (name) {
            for (var _i = 0, _a = this.SubTexture; _i < _a.length; _i++) {
                var texture = _a[_i];
                if (texture.name === name) {
                    return texture;
                }
            }
            return null;
        };
        return TextureAtlas;
    }());
    var Texture = /** @class */ (function () {
        function Texture() {
            this.rotated = false;
            this.x = 0;
            this.y = 0;
            this.width = 0;
            this.height = 0;
            this.frameX = 0;
            this.frameY = 0;
            this.frameWidth = 0;
            this.frameHeight = 0;
            this.name = "";
        }
        return Texture;
    }());
    var copyConfig = [
        DragonBones, {
            armature: Armature,
            textureAtlas: TextureAtlas,
            userData: UserData
        },
        Armature, {
            bone: [
                function (bone) {
                    var type = bone.type;
                    if (type !== undefined) {
                        if (typeof type === "string") {
                            type = getEnumFormString(BoneType, type, BoneType.Bone);
                        }
                    }
                    else {
                        type = BoneType.Bone;
                    }
                    switch (type) {
                        case BoneType.Bone:
                            return Bone;
                        case BoneType.Surface:
                            return Surface;
                    }
                    return null;
                },
                Function
            ],
            slot: Slot,
            ik: IKConstraint,
            path: PathConstraint,
            skin: Skin,
            animation: Animation,
            defaultActions: OldAction,
            canvas: Canvas,
            userData: UserData
        },
        Bone, {
            userData: UserData
        },
        Slot, {
            actions: OldAction,
            userData: UserData
        },
        Skin, {
            slot: SkinSlot,
            userData: UserData
        },
        SkinSlot, {
            display: [
                function (display) {
                    var type = display.type;
                    if (type !== undefined) {
                        if (typeof type === "string") {
                            type = getEnumFormString(DisplayType, type, DisplayType.Image);
                        }
                    }
                    else {
                        type = DisplayType.Image;
                    }
                    switch (type) {
                        case DisplayType.Image:
                            return ImageDisplay;
                        case DisplayType.Armature:
                            return ArmatureDisplay;
                        case DisplayType.Mesh:
                            if (display.share) {
                                return SharedMeshDisplay;
                            }
                            else {
                                return MeshDisplay;
                            }
                        case DisplayType.Path:
                            return PathDisplay;
                        case DisplayType.BoundingBox:
                            {
                                var subType = display.subType;
                                if (subType !== undefined) {
                                    if (typeof subType === "string") {
                                        subType = getEnumFormString(BoundingBoxType, subType, BoundingBoxType.Rectangle);
                                    }
                                }
                                else {
                                    subType = BoundingBoxType.Rectangle;
                                }
                                switch (subType) {
                                    case BoundingBoxType.Rectangle:
                                        return RectangleBoundingBoxDisplay;
                                    case BoundingBoxType.Ellipse:
                                        return EllipseBoundingBoxDisplay;
                                    case BoundingBoxType.Polygon:
                                        return PolygonBoundingBoxDisplay;
                                }
                            }
                            break;
                    }
                    return null;
                },
                Function
            ]
        },
        ArmatureDisplay, {
            actions: Action
        },
        Animation, {
            frame: ActionFrame,
            zOrder: ZOrderTimeline,
            bone: BoneTimeline,
            surface: SurfaceTimeline,
            slot: SlotTimeline,
            ffd: MeshDeformTimeline,
            ik: IKConstraintTimeline,
            animation: AnimationTimeline
        },
        ZOrderTimeline, {
            frame: ZOrderFrame
        },
        BoneTimeline, {
            frame: BoneAllFrame,
            translateFrame: BoneTranslateFrame,
            rotateFrame: BoneRotateFrame,
            scaleFrame: BoneScaleFrame,
        },
        SurfaceTimeline, {
            frame: DeformFrame,
        },
        SlotTimeline, {
            frame: SlotAllFrame,
            displayFrame: SlotDisplayFrame,
            colorFrame: SlotColorFrame,
        },
        MeshDeformTimeline, {
            frame: DeformFrame
        },
        IKConstraintTimeline, {
            frame: IKConstraintFrame
        },
        AnimationTimeline, {
            frame: AnimationFrame
        },
        ActionFrame, {
            actions: Action,
            events: Action
        },
        SlotAllFrame, {
            actions: OldAction
        },
        SlotDisplayFrame, {
            actions: OldAction
        },
        TextureAtlas, {
            SubTexture: Texture,
        }
    ];
    var compressConfig = [
        new Point(0.5, 0.5),
        new Rectangle(),
        new Transform(),
        new ColorTransform(),
        new DragonBones(),
        new UserData(),
        new OldAction(),
        new Action(),
        new Canvas(),
        new Armature(),
        new Bone(),
        new Surface(),
        new Slot(),
        new IKConstraint(),
        new PathConstraint(),
        new Skin(),
        new SkinSlot(),
        new ImageDisplay(true),
        new ArmatureDisplay(true),
        new MeshDisplay(true),
        new SharedMeshDisplay(true),
        new PathDisplay(true),
        new RectangleBoundingBoxDisplay(true),
        new EllipseBoundingBoxDisplay(true),
        new PolygonBoundingBoxDisplay(true),
        new Animation(),
        new AnimationBinary(),
        new ZOrderTimeline(),
        new BoneTimeline(),
        new SurfaceTimeline(),
        new SlotTimeline(),
        new MeshDeformTimeline(),
        new IKConstraintTimeline(),
        new AnimationTimeline(),
        new ActionFrame(),
        new ZOrderFrame(),
        new BoneAllFrame(),
        new BoneTranslateFrame(),
        new BoneRotateFrame(),
        new BoneScaleFrame(),
        new DeformFrame(),
        new SlotAllFrame(),
        new SlotDisplayFrame(),
        new SlotColorFrame(),
        new IKConstraintFrame(),
        new AnimationFrame(),
        new TextureAtlas(),
        new Texture()
    ];

    /**
     * Convert json string to DragonBones format.
     */
    function toFormat (data, getTextureAtlases) {
        if ((typeof data === 'string' && !isDragonBonesString(data)) || !isDragonBonesObject(data)) {
            return null;
        }
        try {
            var json = typeof data === 'string' ? JSON.parse(data) : data;
            var version = json["version"];
            if (DATA_VERSIONS.indexOf(version) < DATA_VERSIONS.indexOf(DATA_VERSION_4_0)) {
                textureAtlases = getTextureAtlases();
                var data_1 = new DragonBones$1();
                copyFromObject(data_1, json, copyConfig$1);
                return V23ToV45(data_1);
            }
            var result = new DragonBones();
            copyFromObject(result, json, copyConfig);
            return result;
        }
        catch (error) {
        }
        return null;
    }
    var textureAtlases;
    var helpMatrix = new Matrix();
    var helpTransform = new Transform();
    var helpPoint = new Point();
    /**
     * Convert v2 v3 to v4 v5.
     */
    function V23ToV45(data) {
        var result = new DragonBones();
        result.frameRate = result.frameRate;
        result.name = data.name;
        result.version = DATA_VERSION_4_5;
        result.compatibleVersion = DATA_VERSION_4_0;
        for (var _i = 0, _a = data.armature; _i < _a.length; _i++) {
            var armatureV23 = _a[_i];
            var armature = new Armature();
            armature.name = armatureV23.name;
            result.armature.push(armature);
            for (var _b = 0, _c = armatureV23.bone; _b < _c.length; _b++) {
                var boneV23 = _c[_b];
                var bone = new Bone();
                bone.inheritScale = false;
                // bone.inheritReflection = false;
                bone.name = boneV23.name;
                bone.parent = boneV23.parent;
                bone.transform.copyFrom(boneV23.transform);
                armature.bone.push(bone);
            }
            for (var _d = 0, _e = armatureV23.skin; _d < _e.length; _d++) {
                var skinV23 = _e[_d];
                var skin = new Skin();
                skin.name = skinV23.name;
                armature.skin.push(skin);
                skinV23.slot.sort(sortSkinSlot);
                for (var _f = 0, _g = skinV23.slot; _f < _g.length; _f++) {
                    var slotV23 = _g[_f];
                    var slot = armature.getSlot(slotV23.name);
                    if (!slot) {
                        slot = new Slot();
                        slot.blendMode = slotV23.blendMode || BlendMode[BlendMode.Normal].toLowerCase();
                        slot.displayIndex = slotV23.displayIndex;
                        slot.name = slotV23.name;
                        slot.parent = slotV23.parent;
                        slot.color.copyFrom(slotV23.colorTransform);
                        armature.slot.push(slot);
                    }
                    var skinSlot = new SkinSlot();
                    skinSlot.name = slotV23.name;
                    skin.slot.push(skinSlot);
                    for (var _h = 0, _j = slotV23.display; _h < _j.length; _h++) {
                        var displayV23 = _j[_h];
                        if (displayV23.type === DisplayType[DisplayType.Image].toLowerCase()) {
                            var display = new ImageDisplay();
                            display.name = displayV23.name;
                            display.transform.copyFrom(displayV23.transform);
                            display.transform.pX = 0.0;
                            display.transform.pY = 0.0;
                            var texture = getTextureFormTextureAtlases(display.name, textureAtlases);
                            if (texture) {
                                display.transform.x += 0.5 * texture.width - displayV23.transform.pX;
                                display.transform.y += 0.5 * texture.height - displayV23.transform.pY;
                            }
                            skinSlot.display.push(display);
                        }
                        else {
                            var display = new ArmatureDisplay();
                            display.name = displayV23.name;
                            display.transform.copyFrom(displayV23.transform);
                            skinSlot.display.push(display);
                        }
                    }
                }
            }
            for (var _k = 0, _l = armatureV23.animation; _k < _l.length; _k++) {
                var animationV23 = _l[_k];
                var animation = new Animation();
                animation.duration = animationV23.duration;
                animation.playTimes = animationV23.loop;
                animation.scale = animationV23.scale;
                animation.fadeInTime = animationV23.fadeInTime;
                animation.name = animationV23.name;
                armature.animation.push(animation);
                for (var _m = 0, _o = animationV23.frame; _m < _o.length; _m++) {
                    var frameV23 = _o[_m];
                    var frame = new ActionFrame();
                    frame.duration = frameV23.duration;
                    frame.action = frameV23.action;
                    frame.event = frameV23.event;
                    frame.sound = frameV23.sound;
                    animation.frame.push(frame);
                }
                for (var _p = 0, _q = animationV23.timeline; _p < _q.length; _p++) {
                    var timelineV23 = _q[_p];
                    var bone = armature.getBone(timelineV23.name);
                    var slot = armature.getSlot(timelineV23.name);
                    var boneAllTimeline = new BoneTimeline();
                    var slotAllTimeline = new SlotTimeline();
                    boneAllTimeline.scale = slotAllTimeline.scale = timelineV23.scale;
                    boneAllTimeline.offset = slotAllTimeline.offset = timelineV23.offset;
                    boneAllTimeline.name = slotAllTimeline.name = timelineV23.name;
                    animation.bone.push(boneAllTimeline);
                    animation.slot.push(slotAllTimeline);
                    var position = 0;
                    var prevBoneFrame = null;
                    var prevSlotFrame = null;
                    for (var _r = 0, _s = timelineV23.frame; _r < _s.length; _r++) {
                        var frameV23 = _s[_r];
                        var boneAllFrame = new BoneAllFrame();
                        var slotAllFrame = new SlotAllFrame();
                        boneAllFrame.duration = frameV23.duration;
                        if (frameV23.tweenEasing === null) {
                            if (animationV23.autoTween) {
                                if (animationV23.tweenEasing === null) {
                                    boneAllFrame.tweenEasing = 0;
                                    slotAllFrame.tweenEasing = 0;
                                }
                                else {
                                    boneAllFrame.tweenEasing = animationV23.tweenEasing;
                                    slotAllFrame.tweenEasing = animationV23.tweenEasing;
                                }
                            }
                            else {
                                boneAllFrame.tweenEasing = NaN;
                                slotAllFrame.tweenEasing = NaN;
                            }
                        }
                        else {
                            boneAllFrame.tweenEasing = frameV23.tweenEasing;
                            slotAllFrame.tweenEasing = frameV23.tweenEasing;
                        }
                        boneAllFrame.curve = frameV23.curve;
                        boneAllFrame.tweenRotate = frameV23.tweenRotate;
                        boneAllFrame.transform.copyFrom(frameV23.transform);
                        slotAllFrame.duration = frameV23.duration;
                        slotAllFrame.curve = frameV23.curve;
                        slotAllFrame.displayIndex = frameV23.displayIndex;
                        slotAllFrame.color.copyFrom(frameV23.colorTransform);
                        boneAllTimeline.frame.push(boneAllFrame);
                        slotAllTimeline.frame.push(slotAllFrame);
                        if (prevBoneFrame && prevSlotFrame && frameV23.displayIndex < 0) {
                            prevBoneFrame.removeTween();
                            prevSlotFrame.removeTween();
                        }
                        boneAllFrame.transform.toMatrix(helpMatrix);
                        helpMatrix.transformPoint(frameV23.transform.pX, frameV23.transform.pY, helpPoint, true);
                        boneAllFrame.transform.x += helpPoint.x;
                        boneAllFrame.transform.y += helpPoint.y;
                        if (frameV23.hide) {
                            slotAllFrame.displayIndex = -1;
                        }
                        if (frameV23.action) {
                            var action = new Action();
                            action.type = ActionType.Play;
                            action.name = frameV23.action;
                            slotAllFrame.actions.push(action);
                        }
                        if (frameV23.event || frameV23.sound) {
                            mergeActionToAnimation(animation, frameV23, position, bone, slot, true);
                        }
                        position += frameV23.duration;
                        prevBoneFrame = boneAllFrame;
                        prevSlotFrame = slotAllFrame;
                    }
                }
                for (var _t = 0, _u = armature.slot; _t < _u.length; _t++) {
                    var slot = _u[_t];
                    var timeline = animation.getSlotTimeline(slot.name);
                    if (timeline === null) {
                        var frame = new SlotAllFrame();
                        frame.displayIndex = -1;
                        timeline = new SlotTimeline();
                        timeline.name = slot.name;
                        timeline.frame.push(frame);
                        animation.slot.push(timeline);
                    }
                }
            }
            if (data.isGlobal) {
                globalToLocal(armature);
            }
        }
        return result;
    }
    function sortSkinSlot(a, b) {
        return a.z < b.z ? -1 : 1;
    }
    function globalToLocal(armature) {
        armature.sortBones();
        var bones = armature.bone.concat().reverse();
        for (var _i = 0, bones_1 = bones; _i < bones_1.length; _i++) {
            var bone = bones_1[_i];
            var parent_1 = armature.getBone(bone.parent);
            if (parent_1 !== null) {
                parent_1.transform.toMatrix(helpMatrix);
                helpMatrix.invert();
                helpMatrix.transformPoint(bone.transform.x, bone.transform.y, helpPoint);
                bone.transform.x = helpPoint.x;
                bone.transform.y = helpPoint.y;
                bone.transform.skX -= parent_1.transform.skY;
                bone.transform.skY -= parent_1.transform.skY;
            }
            else {
                bone.parent = "";
            }
            for (var _a = 0, _b = armature.animation; _a < _b.length; _a++) {
                var animation = _b[_a];
                var timeline = animation.getBoneTimeline(bone.name);
                if (timeline === null) {
                    continue;
                }
                var parentTimeline = parent_1 !== null ? animation.getBoneTimeline(parent_1.name) : null;
                var position = 0;
                for (var _c = 0, _d = timeline.frame; _c < _d.length; _c++) {
                    var frame = _d[_c];
                    if (parentTimeline !== null) {
                        getTimelineFrameMatrix(parentTimeline, position, helpTransform);
                        helpTransform.toMatrix(helpMatrix);
                        helpMatrix.invert();
                        helpMatrix.transformPoint(frame.transform.x, frame.transform.y, helpPoint);
                        frame.transform.x = helpPoint.x;
                        frame.transform.y = helpPoint.y;
                        frame.transform.skX -= helpTransform.skY;
                        frame.transform.skY -= helpTransform.skY;
                    }
                    frame.transform.x -= bone.transform.x;
                    frame.transform.y -= bone.transform.y;
                    frame.transform.skX = normalizeDegree(frame.transform.skX - bone.transform.skY);
                    frame.transform.skY = normalizeDegree(frame.transform.skY - bone.transform.skY);
                    frame.transform.scX /= bone.transform.scX;
                    frame.transform.scY /= bone.transform.scY;
                    position += frame.duration;
                }
            }
        }
    }
    function getTimelineFrameMatrix(timeline, framePosition, transform) {
        var position = 0;
        var currentFrame = null;
        var nextFrame = null;
        for (var _i = 0, _a = timeline.frame; _i < _a.length; _i++) {
            var frame = _a[_i];
            if (position <= framePosition && framePosition < position + frame.duration) {
                currentFrame = frame;
                break;
            }
            position += frame.duration;
        }
        if (currentFrame === null) {
            currentFrame = timeline.frame[timeline.frame.length - 1];
        }
        if ((!isNaN(currentFrame.tweenEasing) || currentFrame.curve.length > 0) && timeline.frame.length > 1) {
            var nextIndex = timeline.frame.indexOf(currentFrame) + 1;
            if (nextIndex >= timeline.frame.length) {
                nextIndex = 0;
            }
            nextFrame = timeline.frame[nextIndex];
        }
        if (nextFrame === null) {
            transform.copyFrom(currentFrame.transform);
        }
        else {
            var tweenProgress = currentFrame.getTweenProgress((framePosition - position) / currentFrame.duration);
            transform.x = nextFrame.transform.x - currentFrame.transform.x;
            transform.y = nextFrame.transform.y - currentFrame.transform.y;
            transform.skX = normalizeRadian(nextFrame.transform.skX - currentFrame.transform.skX);
            transform.skY = normalizeRadian(nextFrame.transform.skY - currentFrame.transform.skY);
            transform.scX = nextFrame.transform.scX - currentFrame.transform.scX;
            transform.scY = nextFrame.transform.scY - currentFrame.transform.scY;
            transform.x = currentFrame.transform.x + transform.x * tweenProgress;
            transform.y = currentFrame.transform.y + transform.y * tweenProgress;
            transform.skX = currentFrame.transform.skX + transform.skX * tweenProgress;
            transform.skY = currentFrame.transform.skY + transform.skY * tweenProgress;
            transform.scX = currentFrame.transform.scX + transform.scX * tweenProgress;
            transform.scY = currentFrame.transform.scY + transform.scY * tweenProgress;
        }
    }

    function toV45 (data) {
        data.version = DATA_VERSION_4_5;
        data.compatibleVersion = DATA_VERSION_4_0;
        for (var _i = 0, _a = data.armature; _i < _a.length; _i++) {
            var armature = _a[_i];
            if (armature.defaultActions.length > 0) {
                for (var i = 0, l = armature.defaultActions.length; i < l; ++i) {
                    var action = armature.defaultActions[i];
                    if (action instanceof Action) {
                        var oldAction = new OldAction();
                        oldAction.gotoAndPlay = action.name;
                        armature.defaultActions[i] = oldAction;
                    }
                }
            }
            // if (forRuntime) {
            //     for (const slot of armature.slot) {
            //         if (slot.actions.length > 0) {
            //             const defaultSkin = armature.getSkin("default");
            //             if (defaultSkin) {
            //                 const skinSlot = defaultSkin.getSlot(slot.name);
            //                 if (skinSlot !== null && skinSlot instanceof dbft.SkinSlot) {
            //                     for (const action of slot.actions) {
            //                         if (action instanceof dbft.OldAction) {
            //                             for (const display of skinSlot.display) {
            //                                 if (display instanceof dbft.ArmatureDisplay) {
            //                                     display.actions.push(dbft.oldActionToNewAction(action));
            //                                 }
            //                             }
            //                         }
            //                     }
            //                 }
            //             }
            //             slot.actions.length = 0;
            //         }
            //     }
            // }
            for (var _b = 0, _c = armature.animation; _b < _c.length; _b++) {
                var animation = _c[_b];
                for (var _d = 0, _e = animation.frame; _d < _e.length; _d++) {
                    var frame = _e[_d];
                    if (frame.events.length > 0) {
                        var events = [];
                        var i = frame.events.length;
                        while (i--) {
                            var action = frame.events[i];
                            switch (action.type) {
                                case ActionType.Play:
                                    frame.action = action.name;
                                    break;
                                case ActionType.Sound:
                                    frame.sound = action.name;
                                    break;
                                case ActionType.Frame:
                                    if (frame.event) {
                                        events.push(action);
                                    }
                                    else {
                                        frame.event = action.name;
                                    }
                                    break;
                            }
                        }
                        frame.events.length = 0;
                        if (events.length > 0) {
                            for (var _f = 0, events_1 = events; _f < events_1.length; _f++) {
                                var action = events_1[_f];
                                frame.events.push(action);
                            }
                        }
                    }
                    else {
                        var i = frame.actions.length;
                        while (i--) {
                            var action = frame.actions[i];
                            switch (action.type) {
                                case ActionType.Play:
                                    frame.action = action.name;
                                    break;
                                case ActionType.Sound:
                                    frame.sound = action.name;
                                    break;
                                case ActionType.Frame:
                                    if (frame.event) {
                                        frame.events.push(action);
                                    }
                                    else {
                                        frame.event = action.name;
                                    }
                                    break;
                            }
                        }
                        frame.actions.length = 0;
                    }
                }
                var position = 0;
                for (var _g = 0, _h = animation.bone; _g < _h.length; _g++) {
                    var timeline = _h[_g];
                    for (var _j = 0, _k = timeline.rotateFrame; _j < _k.length; _j++) {
                        var rotateFrame = _k[_j];
                        var frame = new BoneAllFrame();
                        frame.duration = rotateFrame.duration;
                        frame.tweenEasing = rotateFrame.tweenEasing;
                        frame.curve = rotateFrame.curve;
                        frame.tweenRotate = rotateFrame.clockwise;
                        frame.transform.skX = rotateFrame.rotate + rotateFrame.skew;
                        frame.transform.skY = rotateFrame.rotate;
                        timeline.frame.push(frame);
                    }
                    if (timeline.frame.length === 0) {
                        var frame = new BoneAllFrame();
                        frame.duration = animation.duration;
                        timeline.frame.push(frame);
                    }
                    position = 0;
                    for (var _l = 0, _m = timeline.translateFrame; _l < _m.length; _l++) {
                        var translateFrame = _m[_l];
                        var index = timeline.insertFrame(timeline.frame, position);
                        if (index >= 0) {
                            for (var i = index; i < timeline.frame.length; ++i) {
                                var frame = timeline.frame[i];
                                frame.transform.x = translateFrame.x;
                                frame.transform.y = translateFrame.y;
                            }
                            var insertFrame = timeline.frame[index];
                            if (translateFrame.getTweenEnabled() && !insertFrame.getTweenEnabled()) {
                                insertFrame.tweenEasing = translateFrame.tweenEasing;
                                insertFrame.curve = translateFrame.curve;
                            }
                        }
                        position += translateFrame.duration;
                    }
                    position = 0;
                    for (var _o = 0, _p = timeline.scaleFrame; _o < _p.length; _o++) {
                        var scaleFrame = _p[_o];
                        var index = timeline.insertFrame(timeline.frame, position);
                        if (index >= 0) {
                            for (var i = index; i < timeline.frame.length; ++i) {
                                var frame = timeline.frame[i];
                                frame.transform.scX = scaleFrame.x;
                                frame.transform.scY = scaleFrame.y;
                            }
                            var insertFrame = timeline.frame[index];
                            if (scaleFrame.getTweenEnabled() && !insertFrame.getTweenEnabled()) {
                                insertFrame.tweenEasing = scaleFrame.tweenEasing;
                                insertFrame.curve = scaleFrame.curve;
                            }
                        }
                        position += scaleFrame.duration;
                    }
                    timeline.translateFrame.length = 0;
                    timeline.rotateFrame.length = 0;
                    timeline.scaleFrame.length = 0;
                }
                for (var _q = 0, _r = animation.slot; _q < _r.length; _q++) {
                    var timeline = _r[_q];
                    var slot = armature.getSlot(timeline.name);
                    if (!slot) {
                        continue;
                    }
                    for (var _s = 0, _t = timeline.colorFrame; _s < _t.length; _s++) {
                        var colorFrame = _t[_s];
                        var frame = new SlotAllFrame();
                        frame.duration = colorFrame.duration;
                        frame.tweenEasing = colorFrame.tweenEasing;
                        frame.curve = colorFrame.curve;
                        frame.color.copyFrom(colorFrame.value);
                        timeline.frame.push(frame);
                    }
                    if (timeline.frame.length === 0) {
                        var frame = new SlotAllFrame();
                        frame.duration = animation.duration;
                        frame.displayIndex = slot.displayIndex;
                        frame.color.copyFrom(slot.color);
                        timeline.frame.push(frame);
                    }
                    position = 0;
                    for (var _u = 0, _v = timeline.displayFrame; _u < _v.length; _u++) {
                        var displayFrame = _v[_u];
                        var index = timeline.insertFrame(timeline.frame, position);
                        if (index >= 0) {
                            for (var i = index; i < timeline.frame.length; ++i) {
                                var frame = timeline.frame[i];
                                frame.displayIndex = displayFrame.value;
                            }
                        }
                        position += displayFrame.duration;
                    }
                    timeline.displayFrame.length = 0;
                    timeline.colorFrame.length = 0;
                }
            }
        }
        return data;
    }

    var normalColor = new ColorTransform();
    function toNew (data, forRuntime) {
        data.version = DATA_VERSION_5_5;
        data.compatibleVersion = DATA_VERSION_5_5;
        for (var _i = 0, _a = data.armature; _i < _a.length; _i++) {
            var armature = _a[_i];
            if (armature.type.toString().toLowerCase() === ArmatureType[ArmatureType.Stage]) {
                armature.type = ArmatureType[ArmatureType.MovieClip];
                armature.canvas = new Canvas();
                armature.canvas.x = armature.aabb.x;
                armature.canvas.y = armature.aabb.y;
                armature.canvas.width = armature.aabb.width;
                armature.canvas.height = armature.aabb.height;
            }
            for (var _b = 0, _c = armature.skin; _b < _c.length; _b++) {
                var skin = _c[_b];
                skin.name = skin.name || "default";
            }
            if (forRuntime) {
                if (armature.defaultActions.length > 0) {
                    for (var i = 0, l = armature.defaultActions.length; i < l; ++i) {
                        var action = armature.defaultActions[i];
                        if (action instanceof OldAction) {
                            armature.defaultActions[i] = oldActionToNewAction(action);
                        }
                    }
                }
            }
            if (forRuntime) {
                for (var _d = 0, _e = armature.slot; _d < _e.length; _d++) {
                    var slot = _e[_d];
                    if (slot.actions.length > 0) {
                        var defaultSkin = armature.getSkin("default");
                        if (defaultSkin) {
                            var skinSlot = defaultSkin.getSlot(slot.name);
                            if (skinSlot !== null && skinSlot instanceof SkinSlot) {
                                for (var _f = 0, _g = slot.actions; _f < _g.length; _f++) {
                                    var action = _g[_f];
                                    if (action instanceof OldAction) {
                                        var display = skinSlot.display[slot.displayIndex];
                                        if (display instanceof ArmatureDisplay) {
                                            display.actions.push(oldActionToNewAction(action));
                                        }
                                    }
                                }
                            }
                        }
                        slot.actions.length = 0;
                    }
                }
            }
            for (var _h = 0, _j = armature.animation; _h < _j.length; _h++) {
                var animation = _j[_h];
                if (forRuntime) {
                    for (var _k = 0, _l = animation.frame; _k < _l.length; _k++) {
                        var frame = _l[_k];
                        if (frame.event) {
                            var action = new Action();
                            action.type = ActionType.Frame;
                            action.name = frame.event;
                            frame.actions.push(action);
                            frame.event = "";
                        }
                        if (frame.sound) {
                            var action = new Action();
                            action.type = ActionType.Sound;
                            action.name = frame.sound;
                            frame.actions.push(action);
                            frame.sound = "";
                        }
                        if (frame.action) {
                            var action = new Action();
                            action.type = ActionType.Play;
                            action.name = frame.action;
                            frame.actions.push(action);
                            frame.action = "";
                        }
                        for (var _m = 0, _o = frame.events; _m < _o.length; _m++) {
                            var event_1 = _o[_m];
                            event_1.type = ActionType.Frame;
                            frame.actions.push(event_1);
                        }
                        frame.events.length = 0;
                    }
                }
                // Modify bone timelines.
                for (var _p = 0, _q = animation.bone; _p < _q.length; _p++) {
                    var timeline = _q[_p];
                    var bone = armature.getBone(timeline.name);
                    if (!bone) {
                        continue;
                    }
                    var position = 0;
                    var slot = armature.getSlot(timeline.name);
                    // Bone frame to transform frame.
                    for (var i = 0, l = timeline.frame.length; i < l; ++i) {
                        var frame = timeline.frame[i];
                        var translateFrame = new BoneTranslateFrame();
                        var rotateFrame = new BoneRotateFrame();
                        var scaleFrame = new BoneScaleFrame();
                        timeline.translateFrame.push(translateFrame);
                        timeline.rotateFrame.push(rotateFrame);
                        timeline.scaleFrame.push(scaleFrame);
                        translateFrame.duration = frame.duration;
                        rotateFrame.duration = frame.duration;
                        scaleFrame.duration = frame.duration;
                        translateFrame.tweenEasing = frame.tweenEasing;
                        translateFrame.curve = frame.curve.concat();
                        rotateFrame.tweenEasing = frame.tweenEasing;
                        rotateFrame.curve = frame.curve.concat();
                        scaleFrame.tweenEasing = frame.tweenEasing;
                        scaleFrame.curve = frame.curve.concat();
                        translateFrame.x = frame.transform.x;
                        translateFrame.y = frame.transform.y;
                        rotateFrame.clockwise = frame.tweenRotate;
                        rotateFrame.rotate = normalizeDegree(frame.transform.skY);
                        rotateFrame.skew = normalizeDegree(frame.transform.skX) - rotateFrame.rotate;
                        scaleFrame.x = frame.transform.scX;
                        scaleFrame.y = frame.transform.scY;
                        if (frame.action && !slot) {
                            frame.action = "";
                        }
                        if (frame.event || frame.sound || frame.action) {
                            mergeActionToAnimation(animation, frame, position, bone, slot, forRuntime);
                            frame.event = "";
                            frame.sound = "";
                            frame.action = "";
                        }
                        position += frame.duration;
                    }
                    timeline.frame.length = 0;
                }
                // Modify slot timelines.
                for (var _r = 0, _s = animation.slot; _r < _s.length; _r++) {
                    var timeline = _s[_r];
                    var slot = armature.getSlot(timeline.name);
                    if (!slot) {
                        continue;
                    }
                    var position = 0;
                    // Slot frame to display frame and color frame.
                    for (var i = 0, l = timeline.frame.length; i < l; ++i) {
                        var frame = timeline.frame[i];
                        var displayFrame = new SlotDisplayFrame();
                        var colorFrame = new SlotColorFrame();
                        timeline.displayFrame.push(displayFrame);
                        timeline.colorFrame.push(colorFrame);
                        displayFrame.duration = frame.duration;
                        colorFrame.duration = frame.duration;
                        colorFrame.tweenEasing = frame.tweenEasing;
                        colorFrame.curve = frame.curve.concat();
                        displayFrame.value = frame.displayIndex;
                        colorFrame.value.copyFrom(frame.color);
                        if (frame.actions.length > 0) {
                            if (forRuntime) {
                                mergeActionToAnimation(animation, frame, position, null, slot, true);
                            }
                            else {
                                for (var _t = 0, _u = frame.actions; _t < _u.length; _t++) {
                                    var action = _u[_t];
                                    displayFrame.actions.push(action);
                                }
                            }
                        }
                        position += frame.duration;
                    }
                    timeline.frame.length = 0;
                    // Merge slot action to action timeline.
                    if (forRuntime) {
                        position = 0;
                        for (var i = 0, l = timeline.displayFrame.length; i < l; ++i) {
                            var frame = timeline.displayFrame[i];
                            if (frame.actions.length > 0) {
                                mergeActionToAnimation(animation, frame, position, null, slot, true);
                                frame.actions.length = 0;
                                position += frame.duration;
                            }
                        }
                    }
                    // Color to value.
                    for (var _v = 0, _w = timeline.colorFrame; _v < _w.length; _v++) {
                        var colorFrame = _w[_v];
                        if (!colorFrame.color.equal(normalColor) && colorFrame.value.equal(normalColor)) {
                            colorFrame.value.copyFrom(colorFrame.color);
                        }
                        colorFrame.color.identity();
                    }
                }
            }
        }
        return data;
    }

    function format (data, textureAtlases) {
        if (textureAtlases === void 0) { textureAtlases = null; }
        if (data) {
            for (var _i = 0, _a = data.armature; _i < _a.length; _i++) {
                var armature = _a[_i];
                if (armature.canvas) {
                    if (armature.canvas.hasBackground) {
                        armature.canvas.hasBackground = false; // { color:0xxxxxxx }
                    }
                    else {
                        armature.canvas.color = -1; // { }
                    }
                }
                if (armature.bone.length === 0) {
                    armature.slot.length = 0;
                    armature.ik.length = 0;
                    armature.path.length = 0;
                    armature.skin.length = 0;
                    armature.animation.length = 0;
                    armature.defaultActions.length = 0;
                    armature.actions.length = 0;
                    return;
                }
                // if (typeof this.type === "string") { // LowerCase bug. (If fix the bug, some third-party plugins may go wrong)
                //     this.type = this.type.toLowerCase();
                // }
                armature.aabb.toFixed();
                for (var _b = 0, _c = armature.bone; _b < _c.length; _b++) {
                    var bone = _c[_b];
                    if (bone.parent && !armature.getBone(bone.parent)) {
                        bone.parent = "";
                    }
                    switch (bone.type) {
                        case BoneType.Bone:
                            bone.transform.skX = normalizeDegree(bone.transform.skX);
                            bone.transform.skY = normalizeDegree(bone.transform.skY);
                            if (bone.transform.scX === 0.0) {
                                bone.transform.scX = 0.0001;
                            }
                            if (bone.transform.scY === 0.0) {
                                bone.transform.scY = 0.0001;
                            }
                            bone.transform.toFixed();
                            break;
                        case BoneType.Surface:
                            var vertices = bone.vertices;
                            for (var i = 0, l = vertices.length; i < l; ++i) {
                                vertices[i] = Number(vertices[i].toFixed(2));
                            }
                            break;
                    }
                }
                for (var _d = 0, _e = armature.slot; _d < _e.length; _d++) {
                    var slot = _e[_d];
                    if (!slot.parent || !armature.getBone(slot.parent)) {
                        slot.parent = armature.bone[0].name;
                    }
                    slot.color.toFixed();
                }
                for (var _f = 0, _g = armature.ik; _f < _g.length; _f++) {
                    var ikConstraint = _g[_f];
                    if (!ikConstraint.target || !ikConstraint.bone) {
                        // TODO
                    }
                    // TODO check recurrence
                    ikConstraint.weight = Number(ikConstraint.weight.toFixed(2));
                }
                for (var _h = 0, _j = armature.path; _h < _j.length; _h++) {
                    var pathConstraint = _j[_h];
                    if (!pathConstraint.target || !pathConstraint.bones) {
                        // TODO
                    }
                    // TODO check recurrence
                    pathConstraint.position = Number(pathConstraint.position.toFixed(2));
                    pathConstraint.spacing = Number(pathConstraint.spacing.toFixed(2));
                    pathConstraint.rotateOffset = Number(pathConstraint.rotateOffset.toFixed(2));
                    pathConstraint.rotateMix = Number(pathConstraint.rotateMix.toFixed(2));
                    pathConstraint.translateMix = Number(pathConstraint.translateMix.toFixed(2));
                }
                armature.sortBones();
                var meshMatrices = {};
                for (var _k = 0, _l = armature.skin; _k < _l.length; _k++) {
                    var skin = _l[_k];
                    for (var _m = 0, _o = skin.slot; _m < _o.length; _m++) {
                        var skinSlot = _o[_m];
                        if (!armature.getSlot(skinSlot.name)) {
                            skinSlot.display.length = 0;
                            continue;
                        }
                        skinSlot.actions.length = 0; // Fix data bug.
                        for (var _p = 0, _q = skinSlot.display; _p < _q.length; _p++) {
                            var display = _q[_p];
                            if (!display) {
                                continue;
                            }
                            if (display instanceof ImageDisplay ||
                                display instanceof MeshDisplay ||
                                display instanceof SharedMeshDisplay ||
                                display instanceof ArmatureDisplay) {
                                if (display.path === display.name) {
                                    display.path = "";
                                }
                            }
                            if (display instanceof MeshDisplay) {
                                var matrix = new Matrix();
                                var meshName = skin.name + "_" + skinSlot.name + "_" + display.name;
                                meshMatrices[meshName] = matrix;
                                if (display.weights.length > 0) {
                                    for (var i = 0, l = display.uvs.length; i < l; ++i) {
                                        display.uvs[i] = Number(display.uvs[i].toFixed(6));
                                    }
                                    for (var i = 0, l = display.weights.length; i < l; ++i) {
                                        display.weights[i] = Number(display.weights[i].toFixed(6));
                                    }
                                    for (var i = 0, l = display.bonePose.length; i < l; ++i) {
                                        display.bonePose[i] = Number(display.bonePose[i].toFixed(6));
                                    }
                                    matrix.copyFromArray(display.slotPose, 0);
                                    display.transform.identity();
                                    display.slotPose[0] = 1.0;
                                    display.slotPose[1] = 0.0;
                                    display.slotPose[2] = 0.0;
                                    display.slotPose[3] = 1.0;
                                    display.slotPose[4] = 0.0;
                                    display.slotPose[5] = 0.0;
                                }
                                else {
                                    display.transform.toMatrix(matrix);
                                    display.transform.identity();
                                }
                                for (var i = 0, l = display.vertices.length; i < l; i += 2) {
                                    matrix.transformPoint(display.vertices[i], display.vertices[i + 1], helpPointA);
                                    display.vertices[i] = Number(helpPointA.x.toFixed(2));
                                    display.vertices[i + 1] = Number(helpPointA.y.toFixed(2));
                                }
                            }
                            if (display instanceof PathDisplay) {
                                //lengths
                                for (var i = 0, l = display.lengths.length; i < l; ++i) {
                                    display.lengths[i] = Number(display.lengths[i].toFixed(6));
                                }
                                //vertices
                                for (var i = 0, l = display.vertices.length; i < l; ++i) {
                                    display.vertices[i] = Number(display.vertices[i].toFixed(6));
                                }
                                //weights
                                for (var i = 0, l = display.weights.length; i < l; ++i) {
                                    display.weights[i] = Number(display.weights[i].toFixed(6));
                                }
                            }
                            if (display instanceof RectangleBoundingBoxDisplay ||
                                display instanceof EllipseBoundingBoxDisplay) {
                                display.width = Number(display.width.toFixed(2));
                                display.height = Number(display.height.toFixed(2));
                            }
                            if (display instanceof PolygonBoundingBoxDisplay) {
                                display.transform.toMatrix(helpMatrixA);
                                display.transform.identity();
                                for (var i = 0, l = display.vertices.length; i < l; i += 2) {
                                    helpMatrixA.transformPoint(display.vertices[i], display.vertices[i + 1], helpPointA);
                                    display.vertices[i] = Number(helpPointA.x.toFixed(2));
                                    display.vertices[i + 1] = Number(helpPointA.y.toFixed(2));
                                }
                            }
                            display.transform.skX = normalizeDegree(display.transform.skX);
                            display.transform.skY = normalizeDegree(display.transform.skY);
                            display.transform.toFixed();
                        }
                    }
                }
                for (var _r = 0, _s = armature.animation; _r < _s.length; _r++) {
                    var animation = _s[_r];
                    if (!(animation instanceof Animation)) {
                        continue;
                    }
                    if (animation.zOrder) {
                        cleanFrame(animation.zOrder.frame);
                        if (animation.zOrder.frame.length === 0) {
                            animation.zOrder = null;
                        }
                    }
                    for (var _t = 0, _u = animation.bone; _t < _u.length; _t++) {
                        var timeline = _u[_t];
                        for (var _v = 0, _w = timeline.frame; _v < _w.length; _v++) {
                            var frame = _w[_v];
                            frame.transform.skX = Number(normalizeDegree(frame.transform.skX).toFixed(2));
                            frame.transform.skY = Number(normalizeDegree(frame.transform.skY).toFixed(2));
                            frame.transform.toFixed();
                        }
                        for (var _x = 0, _y = timeline.translateFrame; _x < _y.length; _x++) {
                            var frame = _y[_x];
                            frame.x = Number(frame.x.toFixed(2));
                            frame.y = Number(frame.y.toFixed(2));
                        }
                        for (var _z = 0, _0 = timeline.rotateFrame; _z < _0.length; _z++) {
                            var frame = _0[_z];
                            frame.rotate = Number(normalizeDegree(frame.rotate).toFixed(2));
                            frame.skew = Number(normalizeDegree(frame.skew).toFixed(2));
                        }
                        for (var _1 = 0, _2 = timeline.scaleFrame; _1 < _2.length; _1++) {
                            var frame = _2[_1];
                            frame.x = Number(frame.x.toFixed(2));
                            frame.y = Number(frame.y.toFixed(2));
                        }
                    }
                    for (var _3 = 0, _4 = animation.surface; _3 < _4.length; _3++) {
                        var timeline = _4[_3];
                        for (var _5 = 0, _6 = timeline.frame; _5 < _6.length; _5++) {
                            var frame = _6[_5];
                            frame.offset += formatDeform(frame.vertices);
                        }
                    }
                    for (var _7 = 0, _8 = animation.slot; _7 < _8.length; _7++) {
                        var timeline = _8[_7];
                        for (var _9 = 0, _10 = timeline.frame; _9 < _10.length; _9++) {
                            var frame = _10[_9];
                            frame.color.toFixed();
                        }
                        for (var _11 = 0, _12 = timeline.colorFrame; _11 < _12.length; _11++) {
                            var frame = _12[_11];
                            frame.value.toFixed();
                        }
                    }
                    for (var _13 = 0, _14 = animation.ffd; _13 < _14.length; _13++) {
                        var timeline = _14[_13];
                        timeline.skin = timeline.skin || "default";
                        var meshName = timeline.skin + "_" + timeline.slot + "_" + timeline.name;
                        var mesh = armature.getMesh(timeline.skin, timeline.slot, timeline.name);
                        var matrix = meshMatrices[meshName];
                        for (var _15 = 0, _16 = timeline.frame; _15 < _16.length; _15++) {
                            var frame = _16[_15];
                            if (matrix) {
                                var inSide = 0;
                                var x = 0.0;
                                var y = 0.0;
                                for (var i = 0, l = mesh.vertices.length; i < l; i += 2) {
                                    inSide = 0;
                                    if (i < frame.offset || i - frame.offset >= frame.vertices.length) {
                                        x = 0.0;
                                    }
                                    else {
                                        inSide = 1;
                                        x = frame.vertices[i - frame.offset];
                                    }
                                    if (i + 1 < frame.offset || i + 1 - frame.offset >= frame.vertices.length) {
                                        y = 0.0;
                                    }
                                    else {
                                        if (inSide === 0) {
                                            inSide = -1;
                                        }
                                        y = frame.vertices[i + 1 - frame.offset];
                                    }
                                    if (inSide !== 0) {
                                        matrix.transformPoint(x, y, helpPointA, true);
                                        if (inSide === 1) {
                                            frame.vertices[i - frame.offset] = helpPointA.x;
                                        }
                                        frame.vertices[i + 1 - frame.offset] = helpPointA.y;
                                    }
                                }
                            }
                            frame.offset += formatDeform(frame.vertices);
                        }
                    }
                    for (var i = 0, l = animation.bone.length; i < l; ++i) {
                        var timeline = animation.bone[i];
                        var bone = armature.getBone(timeline.name);
                        if (bone) {
                            cleanFrame(timeline.frame);
                            cleanFrame(timeline.translateFrame);
                            cleanFrame(timeline.rotateFrame);
                            cleanFrame(timeline.scaleFrame);
                            if (timeline.frame.length === 1) {
                                var frame = timeline.frame[0];
                                if (frame.transform.x === 0.0 &&
                                    frame.transform.y === 0.0 &&
                                    frame.transform.skX === 0.0 &&
                                    frame.transform.skY === 0.0 &&
                                    frame.transform.scX === 1.0 &&
                                    frame.transform.scY === 1.0) {
                                    timeline.frame.length = 0;
                                }
                            }
                            if (timeline.translateFrame.length === 1) {
                                var frame = timeline.translateFrame[0];
                                if (frame.x === 0.0 && frame.y === 0.0) {
                                    timeline.translateFrame.length = 0;
                                }
                            }
                            if (timeline.rotateFrame.length === 1) {
                                var frame = timeline.rotateFrame[0];
                                if (frame.rotate === 0.0 && frame.skew === 0.0) {
                                    timeline.rotateFrame.length = 0;
                                }
                            }
                            if (timeline.scaleFrame.length === 1) {
                                var frame = timeline.scaleFrame[0];
                                if (frame.x === 1.0 && frame.y === 1.0) {
                                    timeline.scaleFrame.length = 0;
                                }
                            }
                            if (timeline.frame.length > 0 || timeline.translateFrame.length > 0 || timeline.rotateFrame.length > 0 || timeline.scaleFrame.length > 0) {
                                continue;
                            }
                        }
                        animation.bone.splice(i, 1);
                        i--;
                        l--;
                    }
                    for (var i = 0, l = animation.surface.length; i < l; ++i) {
                        var timeline = animation.surface[i];
                        var surface = armature.getBone(timeline.name);
                        if (surface) {
                            cleanFrame(timeline.frame);
                            if (timeline.frame.length === 1) {
                                var frame = timeline.frame[0];
                                if (frame.vertices.length === 0) {
                                    timeline.frame.length = 0;
                                }
                            }
                            if (timeline.frame.length > 0) {
                                continue;
                            }
                        }
                        animation.surface.splice(i, 1);
                        i--;
                        l--;
                    }
                    for (var i = 0, l = animation.slot.length; i < l; ++i) {
                        var timeline = animation.slot[i];
                        var slot = armature.getSlot(timeline.name);
                        if (slot) {
                            cleanFrame(timeline.frame);
                            cleanFrame(timeline.displayFrame);
                            cleanFrame(timeline.colorFrame);
                            if (timeline.frame.length === 1) {
                                var frame = timeline.frame[0];
                                if (frame.displayIndex === slot.displayIndex &&
                                    frame.color.equal(slot.color)) {
                                    timeline.frame.length = 0;
                                }
                            }
                            if (timeline.displayFrame.length === 1) {
                                var frame = timeline.displayFrame[0];
                                if (frame.actions.length === 0 && frame.value === slot.displayIndex) {
                                    timeline.displayFrame.length = 0;
                                }
                            }
                            if (timeline.colorFrame.length === 1) {
                                var frame = timeline.colorFrame[0];
                                if (frame.value.equal(slot.color)) {
                                    timeline.colorFrame.length = 0;
                                }
                            }
                            if (timeline.frame.length > 0 || timeline.displayFrame.length > 0 || timeline.colorFrame.length > 0) {
                                continue;
                            }
                        }
                        animation.slot.splice(i, 1);
                        i--;
                        l--;
                    }
                    for (var i = 0, l = animation.ffd.length; i < l; ++i) {
                        var timeline = animation.ffd[i];
                        var slot = armature.getSlot(timeline.slot);
                        var mesh = armature.getMesh(timeline.skin, timeline.slot, timeline.name);
                        if (slot && mesh) {
                            cleanFrame(timeline.frame);
                            if (timeline.frame.length === 1) {
                                var frame = timeline.frame[0];
                                if (frame.vertices.length === 0) {
                                    timeline.frame.length = 0;
                                }
                            }
                            if (timeline.frame.length > 0) {
                                continue;
                            }
                        }
                        animation.ffd.splice(i, 1);
                        i--;
                        l--;
                    }
                }
            }
            for (var _17 = 0, _18 = data.textureAtlas; _17 < _18.length; _17++) {
                var textureAtlas = _18[_17];
                formatTextureAtlas(textureAtlas);
            }
        }
        if (textureAtlases) {
            for (var _19 = 0, textureAtlases_1 = textureAtlases; _19 < textureAtlases_1.length; _19++) {
                var textureAtlas = textureAtlases_1[_19];
                formatTextureAtlas(textureAtlas);
            }
        }
    }
    function formatDeform(deform) {
        for (var i = 0, l = deform.length; i < l; ++i) {
            deform[i] = Number(deform[i].toFixed(2));
        }
        var begin = 0;
        while (deform[begin] === 0.0) {
            begin++;
            if (begin === deform.length - 1) {
                break;
            }
        }
        var end = deform.length - 1;
        while (end > begin && deform[end] === 0.0) {
            end--;
        }
        var index = 0;
        for (var i = begin; i < end + 1; ++i) {
            deform[index++] = deform[i];
        }
        deform.length = end - begin + 1;
        return begin;
    }
    function formatTextureAtlas(textureAtlas) {
        for (var _i = 0, _a = textureAtlas.SubTexture; _i < _a.length; _i++) {
            var subTexture = _a[_i];
            if (textureAtlas.width > 0 && subTexture.x + subTexture.width > textureAtlas.width) {
                subTexture.width = textureAtlas.width - subTexture.x;
            }
            if (textureAtlas.height > 0 && subTexture.y + subTexture.height > textureAtlas.height) {
                subTexture.height = textureAtlas.height - subTexture.x;
            }
            if (subTexture.x < 0) {
                subTexture.x = 0;
            }
            if (subTexture.y < 0) {
                subTexture.y = 0;
            }
            if (subTexture.width < 0) {
                subTexture.width = 0;
            }
            if (subTexture.height < 0) {
                subTexture.height = 0;
            }
            if ((subTexture.frameWidth === subTexture.width && subTexture.frameHeight === subTexture.height) ||
                (subTexture.frameWidth === subTexture.height && subTexture.frameHeight === subTexture.width)) {
                subTexture.frameWidth = 0;
                subTexture.frameHeight = 0;
            }
            if (subTexture.frameWidth < 0) {
                subTexture.frameWidth = 0;
            }
            if (subTexture.frameHeight < 0) {
                subTexture.frameHeight = 0;
            }
        }
    }
    function cleanFrame(frames) {
        var prevFrame = null;
        for (var i = 0, l = frames.length; i < l; ++i) {
            var frame = frames[i];
            if (prevFrame && prevFrame.equal(frame) &&
                (i === l - 1 || !(frame instanceof TweenFrame) || frame.equal(frames[i + 1]))) {
                prevFrame.duration += frame.duration;
                if (i === l - 1 && prevFrame instanceof TweenFrame) {
                    prevFrame.removeTween();
                }
                frames.splice(i, 1);
                i--;
                l--;
            }
            else {
                prevFrame = frame;
            }
        }
    }

    var Output = /** @class */ (function () {
        function Output(data, name, suffix, format) {
            if (name === void 0) { name = ""; }
            if (suffix === void 0) { suffix = ""; }
            if (format === void 0) { format = "string"; }
            this.data = data;
            this.format = format;
            this.name = name;
            this.suffix = suffix;
        }
        return Output;
    }());
    function compress(data, config) {
        if ((typeof data) !== "object") {
            return false;
        }
        if (data instanceof Array) {
            var array = data;
            for (var _i = 0, array_1 = array; _i < array_1.length; _i++) {
                var item = array_1[_i];
                compress(item, config);
            }
            if (array.length === 0) {
                return true;
            }
        }
        else {
            var defaultData = null;
            for (var _a = 0, config_1 = config; _a < config_1.length; _a++) {
                defaultData = config_1[_a];
                if (data.constructor === defaultData.constructor) {
                    break;
                }
                defaultData = null;
            }
            if (defaultData !== null || typeof data === "object") {
                var count = 0;
                for (var k in data) {
                    if (k.charAt(0) === "_") {
                        delete data[k];
                        continue;
                    }
                    var value = data[k];
                    var valueType = typeof value;
                    if (defaultData !== null && (value === null || valueType === "undefined" || valueType === "boolean" || valueType === "number" || valueType === "string")) {
                        var defaultValue = defaultData[k];
                        if (value === defaultValue || (valueType === "number" && isNaN(value) && isNaN(defaultValue))) {
                            delete data[k];
                            continue;
                        }
                    }
                    else if (valueType === "object") {
                        if (compress(value, config)) {
                            delete data[k];
                            continue;
                        }
                    }
                    else {
                        continue;
                    }
                    count++;
                }
                return count === 0;
            }
        }
        return false;
    }
    function db2(input) {
        var dragonBonesData = null;
        var textureAtlasFiles = null;
        var textureAtlasImages = null;
        var textureAtlases = new Array();
        try {
            dragonBonesData = toFormat(input.data, function () {
                var textureAtlas = new TextureAtlas();
                copyFromObject(textureAtlas, input.atlasData, copyConfig);
                textureAtlases.push(textureAtlas);
                return textureAtlases;
            });
        }
        catch (error) {
        }
        if (!dragonBonesData) {
            throw new Error("Code.DataError");
        }
        var toOutput = [];
        switch (input.to) {
            case "binary": {
                throw new Error("input.to:binary not yet implemented");
            }
            case "new": {
                toNew(dragonBonesData, false);
                format(dragonBonesData);
                if (input.compress !== false) {
                    compress(dragonBonesData, compressConfig);
                }
                var result = JSON.stringify(dragonBonesData);
                toOutput.push(new Output(result, dragonBonesData.name, "_ske.json", "string"));
                break;
            }
            case "v45": {
                toV45(dragonBonesData);
                format(dragonBonesData);
                if (input.compress !== false) {
                    compress(dragonBonesData, compressConfig);
                }
                var result = JSON.stringify(dragonBonesData);
                toOutput.push(new Output(result, dragonBonesData.name, "_ske.json", "string"));
                break;
            }
            case "player":
            case "spine":
            case "viewer": {
                throw new Error("input.to:[player|spine|viewer] not yet implemented");
            }
            default:
                throw new Error("Code.DataError");
        }
        return toOutput;
    }

    exports.db2 = db2;

}((this.dragonBones = this.dragonBones || {})));
/* provided dependency */ var $ = __webpack_require__(/*! jquery */ "./node_modules/jquery/dist/jquery.js");
function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() { }; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); Object.defineProperty(Constructor, "prototype", { writable: false }); return Constructor; }

var Metronome = /*#__PURE__*/function() {
    function Metronome(bpmTitles, withoutCacheBpm) {
        _classCallCheck(this, Metronome);

        this.bpmTitles = bpmTitles;
        this.withoutCacheBpm = withoutCacheBpm;
        this.init();
    }

    _createClass(Metronome, [{
        key: "init",
        value: function init() {
            var _this = this;

            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.managerEvents = new ManagerEvents();
            this.configs = new Configs();
            this.commonSound = this.createSound(440, 0.7);
            this.accentSound = this.createSound(880, 0.9);
            this.subdivisionSound = this.createSound(520, 0.3);
            this.stressFirstBeat = false;
            this.timer = new Timer(this.managerEvents, this.configs);
            this.$rangeSlider = null;
            this.$btnStart = null;
            this.tapDelta = 0;
            this.subdivisionPattern = null;
            this.activeSubdivision = 0;
            this.managerEvents.addEventHandler('finishTimer', function() {
                _this.stop();
            });
            var self = this;
            $(function() {
                self.$btnStart = $('.metronome .buttons .start');
                $('body').on('click', '.metronome .settings .box_input input', function(e) {
                    e.preventDefault();
                    $(this).select();
                }); // Проверка ввода на текст

                $('.metronome .settings .box_input input').keydown(function(e) {
                    if (!self.isNumberKey(e)) {
                        e.preventDefault();
                    }
                }); // Slider PBM

                self.$rangeSlider = $('[data-range="range-slider"]').ionRangeSlider({
                    postfix: '',
                    skin: "round",
                    onStart: function onStart(data) {
                        self.setCurrentBpm($(data.input).val());
                    },
                    onChange: function onChange(data) {
                        self.setCurrentBpm($(data.input).val());
                    }
                }).data("ionRangeSlider"); // Изменение PBM

                $('body').on('click', '.metronome .bar button.plus, .metronome .bar button.minus', function(e) {
                    e.preventDefault();
                    var value = self.$rangeSlider.old_from;

                    if ($(this).hasClass('plus')) {
                        if (value < self.$rangeSlider.options.max) {
                            value += 1;
                        }
                    } else {
                        if (value > self.$rangeSlider.options.min) {
                            value -= 1;
                        }
                    }

                    self.$rangeSlider.update({
                        from: value
                    });
                    self.setCurrentBpm(value);
                }); // Start/stop

                $('body').on('click', '.metronome .buttons .start', function(e) {
                    e.preventDefault();

                    if (self.isWorking()) {
                        self.stop();
                    } else {
                        self.start();
                    }
                }); // Измение кол-ва битов

                $('body').on('click', '.amount .minus, .amount .plus', function(e) {
                    e.preventDefault();
                    var parent = $(this).closest('.amount');
                    var input = parent.find('input');
                    var inputVal = parseFloat(input.val());
                    var step = parseFloat(input.data('step'));

                    if ($(this).hasClass('minus')) {
                        var minimum = parseFloat(input.data('minimum'));

                        if (inputVal > minimum) {
                            input.val(inputVal - step);

                            if (input.hasClass('beatsCount')) {
                                self.changeBeats(inputVal - step);
                            }
                        }
                    } else {
                        var maximum = parseFloat(input.data('maximum'));

                        if (inputVal < maximum) {
                            input.val(inputVal + step);

                            if (input.hasClass('beatsCount')) {
                                self.changeBeats(inputVal + step);
                            }
                        }
                    }
                });
                $('#btn-tap').click('click', function() {
                    var d = new Date();
                    var temp = d.getTime();
                    var tap_temp = Math.ceil(60000 / (temp - this.tapDelta));
                    this.tapDelta = temp;
                    tap_temp = Math.min(tap_temp, 240);

                    if (!isNaN(tap_temp)) {
                        self.$rangeSlider.update({
                            from: tap_temp
                        });
                        self.setCurrentBpm(tap_temp);
                    }
                });
                $('.js-subdivisions-change').change(function() {
                    self.setSubdivision($(this).val());
                }); // Open/close fullscreen

                $('body').on('click', '.metronome .fullscreen button', function(e) {
                    e.preventDefault();

                    if ($(this).hasClass('active')) {
                        $(this).removeClass('active');
                        $('.metronome .block').removeClass('fixed');
                        $('body').removeClass('lock');
                    } else {
                        $(this).addClass('active');
                        $('.metronome .block').addClass('fixed');
                        $('body').addClass('lock');
                    }
                });
                $('#stress_first_beat').click(function() {
                    self.setStressFirstBeat($(this).prop('checked'));
                }); // Первая инициализация

                self.setDefaultParams();
            });
        }
    }, {
        key: "createSound",
        value: function createSound(K, N) {
            var T = this.audioContext.sampleRate;
            var M = T * 0.1;
            var L = this.audioContext.createBuffer(1, M, T);
            var e = L.getChannelData(0);
            var S = 2 * Math.PI / T * K;
            var R = 100 / T;
            var P = 200 / T;
            var O = 500 / T;

            for (var Q = 0; Q < M; Q++) {
                e[Q] = N * (0.09 * Math.exp(-Q * R) * Math.sin(S * Q) + 0.34 * Math.exp(-Q * P) * Math.sin(2 * S * Q) + 0.57 * Math.exp(-Q * O) * Math.sin(6 * S * Q));
            }

            return L;
        }
        /**
         * Установить дефолтные значения
         */

    }, {
        key: "setDefaultParams",
        value: function setDefaultParams() {
            this.changeBeats(this.getTotalBeats());
            this.setStressFirstBeat($('#stress_first_beat').prop('checked'));
            this.setBpmName();
            this.setSubdivision($('.js-subdivisions-change:checked').val() || 1);
        }
        /**
         * Начать
         */

    }, {
        key: "start",
        value: function start() {
            this.$btnStart.addClass('active');

            if (this.timer.isEnabled()) {
                this.timer.start();
            }

            this.animationBeats();
            this.managerEvents.invokeEventHandler('startMetronome');
        }
        /**
         * Остановить
         */

    }, {
        key: "stop",
        value: function stop() {
            this.$btnStart.removeClass('active');
            this.managerEvents.invokeEventHandler('stopMetronome');
        }
        /**
         * В процессе
         */

    }, {
        key: "isWorking",
        value: function isWorking() {
            return this.$btnStart.hasClass('active');
        }
        /**
         * Проверка символа ни число
         *
         * @param evt
         * @returns {boolean}
         */

    }, {
        key: "isNumberKey",
        value: function isNumberKey(evt) {
            var charCode = evt.which ? evt.which : event.keyCode;

            if (charCode > 31 && (charCode < 48 || charCode > 57) && (charCode < 96 || charCode > 105)) {
                return false;
            }

            return true;
        } // Изменение кол-ва битов

    }, {
        key: "changeBeats",
        value: function changeBeats(beats) {
            this.configs.set('beats', beats);
            this.setTotalBeats(beats);
            var totalCircles = $('.metronome .beat .beats .circle').length;

            if (totalCircles < beats) {
                $('.metronome .beat .beats').append('<div class="circle"></div>');
                this.changeBeats(beats);
            } else if (totalCircles > beats) {
                $('.metronome .beat .beats .circle:last').remove();
                this.changeBeats(beats);
            } else {
                return true;
            }
        } // Анимация битов

    }, {
        key: "animationBeats",
        value: function animationBeats() {
            var _this2 = this;

            var speed = 60 / this.getCurrentBpm() * 1000 / this.getSubdivisionPattern().length;
            var $activeBeat = this.getActiveBeat();
            var $nextBeat = null;
            var totalBeats = this.getTotalBeats();
            var isLastBeat = $activeBeat.index() == totalBeats - 1;

            if (this.getSubdivisionPattern().length > 1 && this.getActiveSubdivision() > 0) {
                if (this.getSubdivisionPattern()[this.getActiveSubdivision()] == 1) {
                    this.playSound(this.subdivisionSound);
                }

                this.increaseActiveSubdivision();
                setTimeout(function() {
                    _this2.animationBeats();
                }, speed);
                return;
            } else {
                this.increaseActiveSubdivision();
            }

            if (this.isWorking()) {
                $activeBeat.removeClass('active');

                if ($activeBeat.length) {
                    if (isLastBeat) {
                        $nextBeat = $('.metronome .beat .beats .circle:eq(0)');
                    } else {
                        $nextBeat = $activeBeat.next();
                    }
                } else {
                    $nextBeat = $('.metronome .beat .beats .circle:eq(0)');
                }

                this.playSound(this.getStressFirstBeat() && (!$activeBeat.length || isLastBeat) ? this.accentSound : this.commonSound);
                $nextBeat.addClass('active');
                setTimeout(function() {
                    _this2.animationBeats();
                }, speed);
            }
        }
    }, {
        key: "setCurrentBpm",
        value: function setCurrentBpm(value) {
            $('.metronome .bpm .val').text(value);

            if (!this.withoutCacheBpm) {
                this.configs.set('bpm', value);
            }

            this.setBpmName();
        }
    }, {
        key: "setSubdivision",
        value: function setSubdivision(value) {
            var $input = $(".js-subdivisions-change[value=".concat(value, "]"));
            $input.prop('checked', true);
            this.configs.set('subdivision', value);
            this.subdivisionPattern = $input.data('pattern').toString().split('-').map(function(x) {
                return parseInt(x);
            });
        }
    }, {
        key: "getSubdivisionPattern",
        value: function getSubdivisionPattern() {
            return this.subdivisionPattern || [1];
        }
    }, {
        key: "getCurrentBpm",
        value: function getCurrentBpm() {
            return parseInt($('.metronome .bpm .val').text());
        }
    }, {
        key: "setBpmName",
        value: function setBpmName() {
            var currBpm = this.getCurrentBpm();
            var name;

            for (var _i = 0, _Object$keys = Object.keys(this.bpmTitles); _i < _Object$keys.length; _i++) {
                var max = _Object$keys[_i];

                if (currBpm < parseInt(max)) {
                    name = this.bpmTitles[max];
                }

                if (name !== undefined) {
                    break;
                }
            }

            $('.metronome .bpm .desc').text(name);
        }
    }, {
        key: "getTotalBeats",
        value: function getTotalBeats() {
            return $('#beatsCount').val();
        }
    }, {
        key: "setTotalBeats",
        value: function setTotalBeats(value) {
            $('#beatsCount').val(value);
        }
    }, {
        key: "getActiveBeat",
        value: function getActiveBeat() {
            return $('.metronome .beat .beats .circle.active');
        }
    }, {
        key: "getActiveSubdivision",
        value: function getActiveSubdivision() {
            return this.activeSubdivision;
        }
    }, {
        key: "increaseActiveSubdivision",
        value: function increaseActiveSubdivision() {
            if (this.activeSubdivision + 1 >= this.getSubdivisionPattern().length) {
                this.activeSubdivision = 0;
            } else {
                this.activeSubdivision++;
            }
        }
    }, {
        key: "playSound",
        value: function playSound(sound) {
            var note = this.audioContext.createBufferSource();
            note.buffer = sound;
            note.connect(this.audioContext.destination);
            var t = this.audioContext.currentTime;
            note.start(t);
            note.stop(t + 0.05);
        }
    }, {
        key: "setStressFirstBeat",
        value: function setStressFirstBeat(value) {
            this.configs.set('stressFirstBeat', value);
            this.stressFirstBeat = value;
        }
    }, {
        key: "getStressFirstBeat",
        value: function getStressFirstBeat() {
            return this.stressFirstBeat;
        }
    }]);

    return Metronome;
}();

var Timer = /*#__PURE__*/function() {
    function Timer(managerEvents, configs) {
        _classCallCheck(this, Timer);

        this.managerEvents = managerEvents;
        this.configs = configs;
        this.init();
    }

    _createClass(Timer, [{
        key: "init",
        value: function init() {
            var _this3 = this;

            this.$timer = null;
            this.timer = null;
            this.defaultValue = null;
            this.defaultValue = null;
            this.metronomeIsWorking = false;
            this.managerEvents.addEventHandler('startMetronome', function() {
                _this3.metronomeIsWorking = true;
            });
            this.managerEvents.addEventHandler('stopMetronome', function() {
                _this3.metronomeIsWorking = false;

                _this3.stop();
            });
            var self = this;
            this.rememberDefaultValue();
            $(function() {
                this.$timer = $('#timer');
                this.$timer.click(function() {
                    if (!self.isEnabled()) {
                        self.stop();
                    } else if (self.metronomeIsWorking) {
                        self.start();
                    }

                    self.configs.set('timer', self.isEnabled());
                });
            });
        }
    }, {
        key: "isEnabled",
        value: function isEnabled() {
            return $('#timer').prop('checked');
        }
    }, {
        key: "rememberDefaultValue",
        value: function rememberDefaultValue() {
            this.defaultValue = this.getCurrentValue();
            this.configs.set('timerDuration', this.getCurrentValue());
        }
    }, {
        key: "getDefaultValue",
        value: function getDefaultValue() {
            return this.defaultValue;
        }
    }, {
        key: "start",
        value: function start() {
            var _this4 = this;

            this.rememberDefaultValue();
            this.setEnabledInput(false);
            this.timer = setInterval(function() {
                _this4.setCurrentValue(_this4.getCurrentValue() - 1);

                if (_this4.getCurrentValue() == 0) {
                    _this4.stop();

                    _this4.managerEvents.invokeEventHandler('finishTimer');
                }
            }, 1000);
        }
    }, {
        key: "stop",
        value: function stop() {
            clearInterval(this.timer);
            this.setEnabledInput(true);
            this.setCurrentValue(this.getDefaultValue());
        }
    }, {
        key: "setEnabledInput",
        value: function setEnabledInput(value) {
            $('#minutes').prop('disabled', !value);
            $('#seconds').prop('disabled', !value);
        }
    }, {
        key: "getCurrentValue",
        value: function getCurrentValue() {
            return parseInt($('#minutes').val()) * 60 + parseInt($('#seconds').val());
        }
    }, {
        key: "setCurrentValue",
        value: function setCurrentValue(value) {
            $('#minutes').val(parseInt(value / 60));
            $('#seconds').val(parseInt(value % 60).toString().padStart(2, '0'));
        }
    }]);

    return Timer;
}();

var ManagerEvents = /*#__PURE__*/function() {
    function ManagerEvents() {
        _classCallCheck(this, ManagerEvents);

        this.eventHandlers = new Map();
    }

    _createClass(ManagerEvents, [{
        key: "addEventHandler",
        value: function addEventHandler(name, callback) {
            if (!this.eventHandlers.has(name)) {
                this.eventHandlers.set(name, []);
            }

            if (typeof callback == 'function') {
                this.eventHandlers.get(name).push(callback);
            }
        }
    }, {
        key: "invokeEventHandler",
        value: function invokeEventHandler(name) {
            if (this.eventHandlers.has(name)) {
                var _iterator = _createForOfIteratorHelper(this.eventHandlers.get(name)),
                    _step;

                try {
                    for (_iterator.s(); !(_step = _iterator.n()).done;) {
                        var callback = _step.value;
                        callback.apply();
                    }
                } catch (err) {
                    _iterator.e(err);
                } finally {
                    _iterator.f();
                }
            }
        }
    }]);

    return ManagerEvents;
}();

var Configs = /*#__PURE__*/function() {
    function Configs() {
        _classCallCheck(this, Configs);

        this.vars = new Map();
    }

    _createClass(Configs, [{
        key: "get",
        value: function get(name) {
            if (this.vars.has(name)) {
                return this.vars.get(name);
            }

            return null;
        }
    }, {
        key: "set",
        value: function set(name, value) {
            this.vars.set(name, value);
            this.setCookie(name, value);
        }
    }, {
        key: "setCookie",
        value: function setCookie(name, value, days) {
            var expires = "";

            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
                expires = "; expires=" + date.toUTCString();
            }

            document.cookie = name + "=" + (value || "") + expires + "; path=/";
        }
    }]);

    return Configs;
}();

var metronome = new Metronome(window.bpmTitles, window.withoutCacheBpm);

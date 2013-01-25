/**
 * AngularJS module code consumed by ChessClockCtrl
 * @author Mikhail Bosin (mishabosin@gmail.com)
 */
angular.module('chessclock', [])
/**
 * The actual clock that will keep a single player's time.  All time is measured in milliseconds.
 *
 * BASE_TICK_TIME is the constant that defines the accuracy of the clock.  This is the maximum
 * margin of error for the timer.  Increasing this value may make the clock more precise, but will
 * cause significant performance issues and possibly break it without substantial optimization or
 * refactoring.
 *
 * // TODO: add a timer destroy event?
 * // TODO: optimize for accuracy and performance
 */
    .factory('Timer', function ($timeout, $log) {
        'use strict';
        var BASE_TICK_TIME = 100; // .1 second

        var Timer = function (name, preset) {
            this.name = name;
            this.time = 0; // milliseconds currently on the clock
            this.increment = 0; // milliseconds to increment the clock by after every move
            this.isTicking = false;
            this.isOutOfTime = false;
            if (angular.isDefined(preset)) {
                this.setFromPreset(preset);
            }
        };

        Timer.prototype.setFromPreset = function (preset) {
            this.time = 0;
            this.time += preset.minutes * 60000;
            this.time += preset.seconds * 1000;
            this.increment = preset.increment * 1000;
        };

        /**
         * Start the timer. Triggered by user interaction.
         */
        Timer.prototype.start = function () {
            $log.log("Starting " + this.name + " with " + this.time + " remaining");
            this.isTicking = true;
            this.tick(BASE_TICK_TIME);
        };

        /**
         * //TODO: make this private
         * Advance the time forward and trigger the game over event when the time is right
         */
        Timer.prototype.tick = function (TICK_TIME) {
            var timer = this,
                actualTickTime;

            // Check to see if this timer is still ticking
            if (!timer.isTicking) {
                $timeout(function () {
                    // Calling $timeout strictly to have angular update the view
                    $log.log(timer.name + " stopped ticking with " + timer.time + " remaining");
                });
                return;
            }

            // See if there's any time left
            if (timer.time === 0) {
                // Set these booleans as quickly as possible to avoid possible misfire
                // of the controller's move() function
                timer.isTicking = false;
                timer.isOutOfTime = true;
                $timeout(function () {
                    // Calling $timeout strictly to have angular update the view
                    $log.log(timer.name + " ran out of time");
                });
                return;
            }

            // Tick off some time, but don't let the time drop below 0
            if (timer.time > TICK_TIME) {
                timer.time -= TICK_TIME;
                actualTickTime = TICK_TIME;
            } else {
                // out of time, but it's possible that the player will make a move and
                // cause an increment before the end of a tick...
                timer.time = 0;
                actualTickTime = TICK_TIME - timer.time;
                // adjust TICK_TIME here if optimization is needed
            }

            // Queue the view update and the next tick
            $timeout(function () {
                //TODO: How big of an issue is that I'm growing the stack 10 times a second until the timer stops?
                timer.tick(TICK_TIME);
            }, actualTickTime);
        };

        /**
         * Stop the clock from advancing and handle increment
         */
        Timer.prototype.stop = function (isIncrementAllowed) {
            this.isTicking = false;
            if (isIncrementAllowed) {
                this.time += this.increment;
            }
            $log.log("Stopping " + this.name + " with " + this.time + " remaining");
        };

        /**
         * Show the remaining time in pretty h:m:ss format
         */
        Timer.prototype.toString = function () {
            var t = this.time, h, m, s, decimal,
                output = "";

            // hours:
            h = Math.floor(t / 3600000);
            if (h > 0) {
                output += h + ":";
                t -= h * 3600000; // don't include this time in the minutes count
            }

            // minutes:
            m = Math.floor(t / 60000);
            if (!output) {
                // no hours to show
                if (m > 0) {
                    output += m;
                }
            } else {
                if (m < 10) {
                    // display the leading 0
                    output += "0";
                }
                output += m;
            }
            t -= m * 60000; // don't include this time into the seconds count

            // seconds:
            s = Math.floor(t / 1000);
            if (!output) {
                // It is down to just the seconds
                if (s < 10) {
                    // less than 10 seconds left: show the decimals
                    // capture the remaining time down to the tenth
                    decimal = Math.floor((t - (s * 1000)) / 100);
                    output += s + "." + decimal;
                } else {
                    output += ":" + s;
                }
            } else {
                // append to the minutes
                if (s < 10) {
                    output += ":0" + s;
                } else {
                    output += ":" + s;
                }
            }

            return output;
        };

        return Timer;
    })

/**
 * Default presets: http://en.wikipedia.org/wiki/Fast_chess
 */
    .factory('PRESETS', function () {
        'use strict';
        return [
            {
                name: "Blitz 10",
                minutes: 10,
                seconds: 0,
                increment: 0
            }, {
                name: "Blitz 5",
                minutes: 5,
                seconds: 0,
                increment: 0
            }, {
                name: "Blitz 3-2",
                minutes: 3,
                seconds: 0,
                increment: 2
            }, {
                name: "Bullet 2-1",
                minutes: 2,
                seconds: 0,
                increment: 1
            }, {
                name: "Bullet 1-2",
                minutes: 1,
                seconds: 0,
                increment: 2
            }, {
                name: "Clock test",
                minutes: 0,
                seconds: 5,
                increment: 1
            }
        ];

    });

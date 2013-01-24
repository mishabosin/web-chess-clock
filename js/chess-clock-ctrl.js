/**
 * AngularJS controller code injected into index.html
 * @author Mikhail Bosin (mishabosin@gmail.com)
 */
function ChessClockCtrl($scope, $log, Timer, PRESETS) {
    'use strict';
    var nextToMove,
        isSettingsOpen = false;

    // The two clocks:
    $scope.timer1 = new Timer("White");
    $scope.timer2 = new Timer("Black");
    nextToMove = $scope.timer1;

    // Assign the presets and initial clock settings:
    $scope.PRESETS = PRESETS;
    $scope.preset1 = PRESETS[0];
    $scope.preset2 = PRESETS[0];
    $scope.setting1 = $.extend({}, $scope.preset1);
    $scope.setting2 = $.extend({}, $scope.preset2);

    /**
     * Assign the selected settings to each timer
     */
    $scope.updateClockSettings = function () {
        $scope.timer1.setFromPreset($scope.setting1);
        $scope.timer2.setFromPreset($scope.setting2);
        $('#settingsModal').modal('hide');
    };
    $scope.updateClockSettings();

    /**
     * Triggered after each move.  Stop the active timer and start the waiting one.
     */
    $scope.move = function () {
        $log.log("Move made");
        if ($scope.timer1.isTicking) {
            $scope.timer1.stop();
            $scope.timer2.start();
        } else if ($scope.timer2.isTicking) {
            $scope.timer2.stop();
            $scope.timer1.start();
        } else if (!$scope.timer1.isOutOfTime && !$scope.timer2.isOutOfTime) {
            // Make the first move
            nextToMove.start();
            nextToMove = null;
        }
    };

    /**
     * Reset both clocks to the last used full time
     */
    $scope.reset = function () {
        $scope.timer1.stop();
        $scope.timer2.stop();
        $scope.timer1.isOutOfTime = false;
        $scope.timer2.isOutOfTime = false;
        $scope.updateClockSettings();
        nextToMove = $scope.timer1;
    };

    /**
     * Triggered in the settings to assign a preset to timer1
     */
    $scope.assignPreset1 = function () {
        $.extend($scope.setting1, $scope.preset1);
    };

    /**
     * Triggered in the settings to assign a preset to timer1
     */
    $scope.assignPreset2 = function () {
        $.extend($scope.setting2, $scope.preset2);
    };

    /**
     * Used by the form validator to make sure the provided timer setting is valid.
     * @param setting to validate
     * @return {Boolean} true if the setting is INVALID
     */
    $scope.invalidSetting = function (setting) {
        setting.minutes = $.isNumeric(setting.minutes) ? setting.minutes : 0;
        setting.seconds = $.isNumeric(setting.seconds) ? setting.seconds : 0;
        setting.increment = $.isNumeric(setting.increment) ? setting.increment : 0;
        return setting.minutes === 0 && setting.seconds === 0;
    };

    /**
     * If a clock is ticking, make it stop.
     * If no clock is ticking, make one start.
     */
    $scope.togglePause = function () {
        if ($scope.timer1.isTicking) {
            $log.log("Pausing " + $scope.timer1.name);
            $scope.timer1.stop();
            nextToMove = $scope.timer1;
        } else if ($scope.timer2.isTicking) {
            $log.log("Pausing " + $scope.timer2.name);
            $scope.timer2.stop();
            nextToMove = $scope.timer2;
        } else if ($scope.timer1.isOutOfTime || $scope.timer2.isOutOfTime) {
            $scope.reset();
        } else {
            nextToMove.start();
            nextToMove = null;
        }
    };

    /**
     * @return {String} to put on the action button (Pause, Reset, Start)
     */
    $scope.actionLabel = function () {
        if ($scope.timer1.isTicking || $scope.timer2.isTicking) {
            return "Pause";
        }
        if ($scope.timer1.isOutOfTime || $scope.timer2.isOutOfTime) {
            return "Reset";
        }
        return "Start";
    };

    /**
     * Highlight the timer with the appropriate class
     */
    $scope.getTimerClass = function (timer) {
        if (timer.isOutOfTime) {
            return "alert-danger";
        }
        if (timer.isTicking) {
            return "alert-info";
        }
        if (nextToMove === timer) {
            return "alert-info";
        }
        return "";
    };

    /**
     * Watch the modal dialog and keep track of when it is opened. Should not be
     * possible to start the game when it is.
     */
    function addModalListener() {
        $('#settingsModal')
            .on('show', function () {
                isSettingsOpen = true;
            })
            .on('hidden', function () {
                isSettingsOpen = false;
            });
    }
    addModalListener();

    /**
     * Allow the user to use the keyboard to switch timers and start the game
     */
    function addKeyboardListener() {
        document.onkeydown = function (key) {
            var pressedKey = key.keyCode || key.charCode;
            if (32 === pressedKey && !isSettingsOpen) {
                $scope.move();
            }
        };
    }
    addKeyboardListener();
}
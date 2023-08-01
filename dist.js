/**!
 * N0nSnackbar: an simple jQuery Snackbar api
 *
 * @author  N0nCreative
 * @version 1.1
 */
window.N0nSnackbar = (function () {
    var $NAMESPACE = '$_n0nSnackbar';

    var $defaultOptions = {
        text: {
            message: 'N0n Sample Snackbar',
            action: 'Close',
            actionAria: 'Action dismiss'
        },
        color: {
            text: '#FFFFFF',
            background: '#323232',
            actionText: '#FFFFFF'
        },
        template: {
            container: '<div></div>',
            text: '<p></p>',
            button: '<button></button>'
        },
        width: 'auto',
        autoShow: true,
        showAction: true,
        waitQueue: false,
        position: 'top-right',
        duration: 2000,
        customClass: '',
        onActionClick: function (event) {},
        onButtonClick: function (event) {},
        onShow: function (container) {},
        onClose: function (container) {}
    },
        $body = $('body'),
        $isShowing = false,
        $queueList = [],
        $_queueList = [];

    function processQueue() {
        if ($isShowing || 0 === $queueList.length) {
            return;
        }

        var opt = $queueList.shift(),
            bar;

        if (0 !== $_queueList.length && 0 === $queueList.length) {
            $queueList = $_queueList;
            $_queueList = [];
        }

        opt.autoShow = false;

        bar = N0nSnackbar.create(opt);
        bar._isInQueue = true;
        bar.show();
    }

    var N0nSnackbar = function (elem, options) {
        if (!(this instanceof N0nSnackbar)) {
            return new N0nSnackbar(elem, options);
        }

        this.container = $(elem);
        this.options = options;
        this.hasShowed = false;
        this.instance();

        if (options.autoShow) {
            this.show();
        }
    };

    N0nSnackbar.prototype.instance = function () {
        var i;

        if (i = this.container.data($NAMESPACE)) {
            return i;
        }

        this.container.data($NAMESPACE, i = this);
        return i;
    };

    N0nSnackbar.prototype.show = function () {
        if (this.hasShowed) {
            return this;
        }

        if (!this._isInQueue) {
            if (this.options.waitQueue) {
                if (-1 === $queueList.indexOf(this.options)) {
                    $queueList.push(this.options);
                    processQueue();
                }

                return this;
            }

            $queueList.unshift(this.options);
            processQueue();

            return this;
        }

        this.hasShowed = true;

        $body.append(this.container);

        try {
            if (false === this.options.onShow.bind(this)(this.container)) {
                return this;
            }
        } catch (err) {}

        setTimeout(function () {
            $isShowing = true;

            this.container.css('opacity', 1)
                .attr('data-n0n-sposition', this.options.position);

            if (0 >= this.options.duration) {
                return this;
            }

            setTimeout(function () {
                this.hide('lazy');
            }.bind(this), this.options.duration);
        }.bind(this), 10);

        return this;
    };

    N0nSnackbar.prototype.hide = function (force, isclosebutton) {
        if (true === force) {
            this.container.remove();
            return this;
        }

        var remove = true;

        try {
            if (false === this.options.onClose.bind(this)(this.container)) {
                remove = false;
            }
        } catch (err) {}

        var css = {
            opacity: 0
        };

        if ('lazy' === force) {
            css = {
                top: '-100px',
                bottom: '-100px'
            };
        }

        this.container.css(css);

        var closecallback = function () {
            $isShowing = false;

            if (!this._closedByButton) {
                processQueue();
            }

            if (isclosebutton) {
                this._closedByButton = true;
            }

            if (remove) {
                this.hide(true);
            }
        }.bind(this);

        if (!remove) {
            closecallback();
            return this;
        }

        setTimeout(closecallback, N0nSnackbar.timeout * 1000);
        return this;
    };

    N0nSnackbar.prototype.addButton = function (text, arialabel, color, callback, isclosebutton) {
        if ($.isFunction(arialabel)) {
            callback = arialabel;
            arialabel = color = null;
        }

        color = color || this.options.color.secondButtonText;
        arialabel = arialabel || this.options.text.secondButtonAria;

        if (!$.isFunction(callback)) {
            callback = function () {};
        }

        callback = callback.bind(this);

        var $btn = $(this.options.template.button)
            .addClass('n0n-btn-action')
            .css('color', color)
            .attr('aria-label', arialabel)
            .on('click', function (evt) {
                evt.preventDefault();

                if (isclosebutton) {
                    this.hide(false, true);
                }

                try {
                    this.options.onButtonClick.bind(this)(evt);
                } catch (err) {}

                callback(evt);
            }.bind(this));

        if ('string' === typeof text) {
            $btn.html(text);
        }

        if ($.isPlainObject(text)) {
            $btn.append(text);
        }

        this.container.append($btn);
        return this;
    };

    var $testbar = $('<div class="n0n-snackbar"></div>').css({
        visibility: 'hidden',
        width: 0,
        height: 0
    }).appendTo($body);

    N0nSnackbar.timeout = parseFloat($testbar.css('transition-duration'), 0.5);

    $testbar.remove();

    N0nSnackbar.create = function ($options, customclass, duration) {
        if ('string' === typeof $options) {
            $options = {
                text: {
                    message: $options
                },
                customClass: customclass,
                duration: duration
            };
        }

        var options = $.extend(true, {}, $defaultOptions, $options);

        var $alert = $(options.template.container)
            .addClass('n0n-snackbar ' + options.customClass)
            .css({
                width: options.width,
                background: options.color.background
            })
            .append(
                $(options.template.text)
                    .addClass('n0n-snackbar-text')
                    .css('color', options.color.text)
                    .html(options.text.message)
            );

        var autoshow = options.autoShow;
        options.autoShow = false; // Do not show before add all buttons
        var $snackbar = N0nSnackbar($alert, options);
        $snackbar.options.autoShow = options.autoShow = autoshow;

        if (options.showAction) {
            $snackbar.addButton(options.text.action, options.text.actionAria, options.color.actionText, options.onActionClick, true);
        }

        if (options.autoShow) {
            $snackbar.show();
        }

        return $snackbar;
    };

    N0nSnackbar.hideAll = function (force) {
        $('.n0n-snackbar').each(function (_i, el) {
            $(el).data($NAMESPACE).hide(force ? true : 'lazy');
        });
    };

    N0nSnackbar.configure = function (defaults, timeout) {
        $defaultOptions = $.extend(true, $defaultOptions, defaults);

        if ('number' === typeof timeout) {
            N0nSnackbar.timeout = timeout;
        }
    };

    N0nSnackbar.pushQueue = function () {
        var list = [].slice.call(arguments);

        if (0 === list.length) {
            return;
        }

        $.each(list, function (_i, options) {
            $queueList.push(options || {});
        });

        processQueue();
    };

    return N0nSnackbar;
})();

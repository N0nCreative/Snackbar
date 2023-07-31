/**!
 * N0nSnackbar: an simple jQuery Snackbar api 
 *
 * @author  N0nCreative
 * @version 1.0
 */
window.N0nSnackbar = (function () {
    var $NAMESPACE = '$_n0nSnackbar';

    var $defaults = {
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
        position: 'top-right',
        duration: 2000,
        customClass: '',
        onActionClick: function (isntance) {},
        onButtonClick: function (instance) {},
        onClose: function (instance) {}
    },
        $body = $('body');

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

        this.hasShowed = true;

        $body.append(this.container);

        setTimeout(function () {
            this.container.css('opacity', 1)
                .addClass('snackbar-pos ' + this.options.position);
        }.bind(this), 0);

        if (0 >= this.options.duration) {
            return this;
        }

        setTimeout(function () {
            this.hide('lazy');
        }.bind(this), this.options.duration);

        return this;
    };

    N0nSnackbar.prototype.hide = function (force) {
        if (true === force) {
            this.container.remove();
            return this;
        }

        try {
            this.options.onClose.bind(this)();
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

        setTimeout(function () {
            this.hide(true);
        }.bind(this), parseFloat(this.container.css('transition-duration'), 0.5) * 1000);
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
            .addClass('action')
            .css('color', color)
            .attr('aria-label', arialabel)
            .on('click', function (evt) {
                evt.preventDefault();

                if (isclosebutton) {
                    this.hide();
                }

                try {
                    this.options.onButtonClick(evt);
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

        var options = $.extend(true, $defaults, $options);

        var $alert = $(options.template.container)
            .addClass('snackbar-container ' + options.customClass)
            .css({
                width: options.width,
                background: options.color.background
            })
            .append(
                $(options.template.text)
                    .addClass('snackbar-text')
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

    N0nSnackbar.hideAll = function () {
        $('.snackbar-container').each(function (_i, el) {
            $(el).data($NAMESPACE).hide('lazy');
        });
    };

    N0nSnackbar.configure = function (defaults) {
        $defaults = $.extend(true, $defaults, defaults);
    };

    return N0nSnackbar;
})();

/*!
 * Distpicker v0.1.0
 * https://github.com/fengyuanchen/distpicker
 *
 * Copyright 2014 Fengyuan Chen
 * Released under the MIT license
 */

(function(fn, undefined) {
    if (typeof define === "function" && define.amd) {
        // AMD. Register as anonymous module.
        define(["jquery"], fn);
    } else {
        // Browser globals.
        fn(window.jQuery);
    }
}(function($) {

    "use strict";

    if (typeof ChineseDistricts === "undefined") {
        throw new Error("The file \"distpicker.data.js\" must be included first!");
    }

    function DistPicker(element, options) {
        options = $.isPlainObject(options) ? options : {};
        this.$element = $(element);
        this.defaults = $.extend({}, DistPicker.defaults, options);
        this.init();
    }

    DistPicker.defaults = {
        province: "—— 省 ——",
        city: "—— 市 ——",
        district: "—— 区 ——"
    };

    DistPicker.prototype = {
        constructor: DistPicker,

        data: ChineseDistricts,

        init: function() {
            var $select = this.$element.find("select"),
                length = $select.length,
                settings = {};

            $select.each(function() {
                $.extend(settings, $(this).data());
            });

            if (settings.province) {
                this.defaults.province = settings.province;
                this.$province = $select.filter("[data-province]");
            } else {
                this.$province = length > 0 ? $select.eq(0) : null;
            }

            if (settings.city) {
                this.defaults.city = settings.city;
                this.$city = $select.filter("[data-city]");
            } else {
                this.$city = length > 1 ? $select.eq(1) : null;
            }

            if (settings.district) {
                this.defaults.district = settings.district;
                this.$district = $select.filter("[data-district]");
            } else {
                this.$district = length >= 2 ? $select.eq(2) : null;
            }

            this.output("province");
            this.output("city");
            this.output("district");
            this.addListener();
        },

        addListener: function() {
            var that = this;

            if (this.$province) {
                this.$province.change(function() {
                    that.output("city");
                    that.output("district");
                });
            }

            if (this.$city) {
                this.$city.change(function() {
                    that.output("district");
                });
            }
        },

        output: function(type) {
            var zipcode = 1,
                data = {},
                options = [],
                value = "",
                $select = this["$" + type],
                that = this;

            if (!$select) {
                return;
            }

            value = this.defaults[type] || "";
            zipcode = type === "province" ? 1 :
                      type === "city"     ? this.$province.find("option:selected").data().zipcode :
                      type === "district" ? this.$city.find("option:selected").data().zipcode : zipcode;

            data = $.isNumeric(zipcode) ? this.data[zipcode] : {};

            $.each(data, function(zipcode, address) {
                var selected = address === value;

                if (selected) {
                    that.selected = true;
                }

                options.push(that.template({
                    zipcode: zipcode,
                    address: address,
                    selected: selected
                }));
            });

            if (!this.selected) {
                options.unshift(that.template({
                    zipcode: "",
                    address: value,
                    selected: false
                }));
            }

            $select.html(options.join(""));
        },

        template: function(options) {
            var defaults = {
                    zipcode: "",
                    address: "",
                    selected: false
                };

            $.extend(defaults, options);

            return [
                "<option value=\"" + (defaults.address && defaults.zipcode ? defaults.address : "") + "\"",
                " data-zipcode=\"" + (defaults.zipcode ? defaults.zipcode : "") + "\"",
                (defaults.selected ? " selected" : ""),
                ">" + (defaults.address ? defaults.address : "") + "</option>"
            ].join("");
        }
    };

    // Register as jQuery plugin
    $.fn.distpicker = function(options) {
        return this.each(function() {
            $(this).data("distpicker", new DistPicker(this, options));
        });
    };

    $.fn.distpicker.Constructor = DistPicker;

    $(function() {
        $("[distpicker]").distpicker();
    });
    
}));
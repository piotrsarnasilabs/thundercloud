"use strict";

var React = require("react");

var StackAccessorMixin = {
    propTypes: {
        label: React.PropTypes.func,
        values: React.PropTypes.func,
        x: React.PropTypes.func,
        y: React.PropTypes.func,
        y0: React.PropTypes.func
    },

    getDefaultProps: function getDefaultProps() {
        return {
            label: function (stack) {
                return stack.label;
            },
            values: function (stack) {
                if(!stack) return [];
                return stack.values;
            },
            x: function (e) {
                if(!e) return false;
                return e.x;
            },
            y: function (e) {
                if(!e) return false;
                return e.y;
            },
            y0: function (e) {
                if(!e) return false;
                return e.y0;
            }
        };
    }
};

module.exports = StackAccessorMixin;
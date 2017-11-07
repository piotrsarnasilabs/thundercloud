"use strict";

var React = require("react");
let TransitionGroup = require('react/lib/ReactCSSTransitionGroup');
var d3 = require("d3");

var Path = React.createClass({
    displayName: "Path",

    propTypes: {
        className: React.PropTypes.string,
        stroke: React.PropTypes.string.isRequired,
        strokeLinecap: React.PropTypes.string,
        strokeWidth: React.PropTypes.string,
        strokeDasharray: React.PropTypes.string,
        fill: React.PropTypes.string,
        d: React.PropTypes.string.isRequired,
        data: React.PropTypes.array.isRequired
    },

    getDefaultProps: function getDefaultProps() {
        return {
            className: "path",
            fill: "none",
            strokeWidth: "2",
            strokeLinecap: "butt",
            strokeDasharray: "none"
        };
    },

    render: function render() {
        var _props = this.props;
        var className = _props.className;
        var stroke = _props.stroke;
        var strokeWidth = _props.strokeWidth;
        var strokeLinecap = _props.strokeLinecap;
        var strokeDasharray = _props.strokeDasharray;
        var fill = _props.fill;
        var d = _props.d;
        var style = _props.style;
        var data = _props.data;
        var onMouseEnter = _props.onMouseEnter || function(){};
        var onMouseLeave = _props.onMouseLeave || function(){};
        return (    
            <TransitionGroup transitionName="animate" component="path" className={className}
                stroke={stroke} strokeWidth={strokeWidth} strokeLinecap={strokeLinecap} 
                strokeDasharray={strokeDasharray} fill={fill} d={d} style={style}>
            </TransitionGroup>
        );
    }
});

module.exports = Path;
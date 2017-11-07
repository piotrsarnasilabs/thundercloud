let React = require("react");
let d3 = require("d3");

let Chart = require("./react-d3-components/lib/Chart");
let DataSet = require("./custom-data-set");
let Axis = require("./react-d3-components/lib/Axis");
let Path = require("./react-d3-components/lib/Path");
let moment = require('moment');
let Duration = require("moment-duration-format");

let DefaultPropsMixin = require("./react-d3-components/lib/DefaultPropsMixin");
let HeightWidthMixin = require("./react-d3-components/lib/HeightWidthMixin");
let ArrayifyMixin = require("./react-d3-components/lib/ArrayifyMixin");
let StackAccessorMixin = require("./react-d3-components/lib/StackAccessorMixin");
let StackDataMixin = require("./react-d3-components/lib/StackDataMixin");
let CustomScaleMixin = require("../../mixins/custom-scale-mixin");
/*
	This is the custom implementation of the React D3 Components line chart.
	All of the charts used in the demos use this component.

	Props
	-----------------------------
  data : [{label:string, values: [x:xValue, y:yValue]}] - Data to be rendered on the chart
  title : String - Chart header text
  height : Int - Height of the chart
	width : Int - Width of the chart
	margin : {top:int, bottom:int, left:int, right:int} - Margins for all sides of the chart
	color : String - Color for some of the text and the line stroke
	interpolate : String - How the D3 line should be interpolated
	isOnOff : boolean - Overrides y-axis with on and off
	hallState: boolean - Overrides y-axis with three hall effect states: CLOSED, OPEN and TAMPER
	isStreaming : boolean - Tells component if it is streaming to toggle visibility of certain components
	transparentAxis : boolean - Allows rendering of axis without dashed lines
	renderAvgLine : boolean - Shows or hides the average line if avg is passed with the data
	unit : String - Unit of measurement for average line
	legend : React Component - Legend for chart
	dataKey : React Component - Shows current state at top of the chart
*/
let CustomLineChart = React.createClass({
	mixins: [DefaultPropsMixin,
			 HeightWidthMixin,
			 ArrayifyMixin,
			 StackAccessorMixin,
			 StackDataMixin,
			 CustomScaleMixin],

	getDefaultProps() {
		return {
			interpolate: 'linear',
			stroke: d3.scale.category20()
		};
	},
	renderOnOffLabels(color){
		if(!color){
			color="white";
		}
		var offY = this.props.height;
		if(this._innerHeight && this.props.margin){
			offY = this._innerHeight + 4;
		}
		return (
			<g>
			  <text className="medium" x={-30} y={4} fill={color}>ON</text>
			  <text className="medium" x={-30} y={offY} fill={color}>OFF</text>
			</g>);
	},
	renderHallStateLabels(color){
		if(!color){
			color="white";
		}

		let offY = this.props.height;
		if(this._innerHeight && this.props.margin){
			offY = this._innerHeight + 4;
		}
		let halfOffY = offY / 2;

		const yByText = {
			TAMPER: 4,
			OPEN: halfOffY,
			CLOSED: offY
		}

		const texts = Object.keys(yByText);

		return (
			<g>
				{texts.map(text =>
				  <text className="medium" x={-30} y={yByText[text]} fill={color} key={yByText[text]}>{text}</text>
				)}
			</g>);
	},
	renderAvgLine(data, unit){
		unit = unit || 'ft/s';
		if(data && data.length && data.avg){
			if(unit == 'ft/s' || unit == 'ft'){
				 data.avg *= 3.28;
			}
			if(unit == '°F'){
				data.avg = (data.avg * (9/5) + 32);
			}
			let y = this._yScale(data.avg);
			let textY = 10;
			if(y > this._innerHeight - 30) {
				textY = -10;
			}
			let avg = "Average " + (Math.round(data.avg * 100) / 100) + " " + unit;
			return(<g className={"avg axis"} style={{'shapeRendering':'crispEdges'}}>
							<line className={"line"}
									fill={"none"}
									x1="0" 
									y1={y}
									x2={this._innerWidth}
									y2={y}
									stroke={"rgba(255,255,255,0.2)"} 
									strokeDasharray={"5,5"}/>
			  		<text className="medium" textAnchor="middle" fill={"#c1c1c1"} x={this._innerWidth/2} y={y + textY} >{avg}</text>
					</g>);
		}
		return;
	},
	render() {
		let {height,
			 width,
			 margin,
			 interpolate,
			 values,
			 label,
			 x,
			 y,
			 xAxis,
			 yAxis,
			 title,
			 isOnOff,
			 hallState,
			 color,
			 isStreaming,
			 transparentAxis,
			 renderAvgLine,
			 unit,
			 legend,
			 dataKey} = this.props;
		let [data,
			 innerWidth,
			 innerHeight,
			 xScale,
			 yScale] = [this._data,
							this._innerWidth,
							this._innerHeight,
							this._xScale,
							this._yScale];
		let line = d3.svg.line()
				.x(function(e) { return xScale(x(e)); })
				.y(function(e) { return yScale(y(e)); })
				.interpolate(interpolate);
		let yTickValues, otherAxis,extraEl;

		if(renderAvgLine && data && data.avg){
			extraEl = this.renderAvgLine(data, unit);
		}
		let format;
		if(data){
			try{
				if(data[0].values.length > 2){
					format = d3.time.format.multi([
							  [".%L", function(d) { return d.getMilliseconds(); }],
							  [":%S", function(d) { return d.getSeconds(); }],
							  ["%I:%M", function(d) { return d.getMinutes();}],
							  ["%I %p", function(d) {return d.getHours(); }],
							  ["%a %d", function(d) { return d.getDay() && d.getDate() != 1; }],
							  ["%b %d", function(d) { return d.getDate() != 1; }],
							  ["%B", function(d) { return d.getMonth(); }],
							  ["%Y", function() { return true; }]
							]);
				}
			}catch(e){}
		}
		if(!color){
			color = "white";
		}
		if(isOnOff){
			yTickValues = [];
			extraEl = this.renderOnOffLabels(color);
			otherAxis = (
					<Axis
						className={"x axis"}
						orientation={"top"}
						scale={xScale}
						height={innerHeight}
						width={innerWidth}
	          tickValues={yTickValues}
						outerTickSize={0}
						transparent={transparentAxis}
						{...xAxis}/>);
		}
		else if (hallState) {
			yTickValues = [];
			extraEl = this.renderHallStateLabels(color);
			otherAxis = (
				<Axis
					className={"x axis"}
					orientation={"top"}
					scale={xScale}
					height={innerHeight}
					width={innerWidth}
					tickValues={yTickValues}
					outerTickSize={0}
					transparent={transparentAxis}
					{...xAxis}/>);
		}
		else{
			otherAxis = (
					<Axis
						className={"y axis"}
						orientation={"left"}
						scale={yScale}
						height={innerHeight}
						width={innerWidth}
						outerTickSize={0}
						tickValues={yTickValues}
						xTickOffset={-4}
						transparent={transparentAxis}
						{...yAxis}/>);
		}
		return (
			<div className="chart">
				<h2 className="header">{title}</h2>
				{dataKey}
				<Chart height={height} width={width} margin={margin}>

				<Axis
					className={"x axis"}
					orientation={"bottom"}
					scale={xScale}
					height={innerHeight}
					width={innerWidth}
					outerTickSize={0}
					yTickOffset={8}
					tickFormat={format}
					transparent={transparentAxis}
					{...xAxis} />

				{otherAxis}
				<DataSet
					data={data}
					line={line}
					color={color}
					values={values}/>
				{extraEl}
				</Chart>
				{legend}

			</div>
		);
	}
});


module.exports = CustomLineChart;
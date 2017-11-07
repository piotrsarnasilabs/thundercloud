let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Route = Router.Route;
let ReactFire = require('reactfire');
let Firebase = require('firebase');
let AppActions = require('../../actions/app-actions.js');
let Link = Router.Link;
let Navigation = require('react-router').Navigation;
let CustomLineChart = require('../subcomponents/custom-line-chart');
let FireBaseTools = require('../../utils/firebase-tools');
let d3 = require("d3");
let Tappable = require('react-tappable');
let Store = require('../../stores/streaming-store');
let moment = require('moment');
let HeaderTitle = require('../subcomponents/header-title');
let FluxyMixin = require('../../../../node_modules/alt/mixins/FluxyMixin');

// color definition
let gray = '#d4d4d4';
let dark_gray = '#333333';
let light_pink = '#fff4f1';
let medium_pink = '#ffe7cf';
let dark_pink = '#ffae9d';
let light_purple = '#e9e3ff';
let medium_purple = '#c3caf8';
let dark_purple = '#9196ff';
let lavendar = '#857cff';
let purple = '#8a4aff';
let yellow = '#ffcc00';
let yellow_orange = '#ffa200';
let bromine_orange = '#ff7100';
let grapefruit_orange = '#ff7469';
let red_orange = '#e65100';
let pure_red = '#fb2f3c';
let light_blue = '#78d6ff';
let blue = '#00aeff';
let bright_green = '#caf200';
let terbium_green = '#a1b92e';
let medium_green = '#87a10d';

/*
  This is the component for the Environment demo.

  When the component mounts, it creates a connection to the
  Firebase Environment url and binds that data to the key 'data'
  on the component state.

  It uses the Fluxy Mixin to setup listeners for changes to the 
  Streaming Store changes. This is for this component to 
  be notified when the device has stopped streaming data.
*/
let EnvDashboard = React.createClass({
  mixins: [Navigation, ReactFire, FluxyMixin],
  statics: {
    storeListeners: {
      _onChange: Store
    }
  },
  _onChange(state){
    if(state && typeof state.streaming !== 'undefined'){
      this.isStreaming = state.streaming;
      this.forceUpdate();
    }
  },
  componentWillMount() {
    if(this.props.params && this.props.params.session){
      let string = window.firebaseURL + 'sessions/'+this.props.params.session+'/environment';
      let ref = new Firebase( string );
      this.setState({'ref':ref});
      this.bindAsArray(ref, 'data');
      if(this.props.params.session){
        let unit = new Firebase( window.firebaseURL + 'sessions/'+this.props.params.session+'/temperatureUnits' );
        this.bindAsObject(unit, 'unit');
      }
    }
    this.isStreaming = false;
  },
  handleResize(e) {
    this.setState({'parentWidth':this.refs.chart.getDOMNode().offsetWidth});
  },
  componentDidMount() {
    this.setState({'parentWidth':this.refs.chart.getDOMNode().offsetWidth});
    window.addEventListener('resize', this.handleResize);
  },
  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
  },
  getInitialState() {
    return {
      ref:null,
      parentWidth:400,
      data:[],
      unit:{}
    };
  },
  convertToSI(temp){
    if(temp && temp.length){
      try{
        for(var t in temp[0].values){
          if(temp[0].values[t].hasOwnProperty('y')){
            temp[0].values[t].y = (temp[0].values[t].y  * (9/5)) + 32;
          }
        }
      }catch(e){}
    }
    return temp;
  },

  shouldComponentUpdate(nextProps, nextState){
    if(this.hasRenderedRecently && this.state.unit == nextState.unit){
      return false;
    }
    this.hasRenderedRecently = this.state.unit == nextState.unit && this.state.data === nextState.data;
    var throttle = 1;
    try{
      throttle = Object.keys(this.state.data[0]).length / 2 > 500 ? Object.keys(this.state.data[0]).length / 2 : 500;
    }catch(e){}
    setTimeout(()=>{
      this.hasRenderedRecently = false;
    },throttle);
    nextState = nextState || {};
    return this.state.unit == nextState.unit && this.state.data === nextState.data;
  },

  currentValue(data, unit){
    try{
      unit = unit || ' ';
      let value = Math.round(data[0].values[data[0].values.length -1].y * 10) / 10;
      return (
        <h3 className="last-point current">{value} {unit}</h3>
        );
    }
    catch(e){}
    return;
  },

  currentHallState(data){
    if (!Boolean(data[0] && data[0].values)) {
      return;
    }
    let value;
    let current = data[0].values[data[0].values.length - 1].y;
    switch(current) {
      case 0:
        value = 'CLOSED';
        break;
      case 1:
        value = 'OPEN';
        break;
      case 2:
        value = 'TAMPER';
    }
    return (
      <h3 className="last-point current">{value}</h3>
    )
  },

  hasValues(data) {
    return Boolean(data && data.length && data[0].values && data[0].values.length);
  },

  handleHallStateEdgeCase(data) {
    data.values.map(function(value) {
      value.y = [0, 1, 2].includes(value.y) ? value.y : 2;
    })
  },

  dynamicTempColor(value, metric){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    if(metric){
      value = value * (9/5) + 32;
    }
    var color = pure_red;
    if(value < 100){
      color = red_orange;
    }
    if(value < 90){
      color = grapefruit_orange;
    }
    if(value < 80){
      color = yellow_orange;
    }
    if(value < 70){
      color = yellow;
    }
    if(value < 60){
      color = bright_green;
    }
    if(value < 50){
      color = terbium_green;
    }
    if(value < 40){
      color = medium_green;
    }
    if(value < 30){
      color = light_blue;
    }
    if(value < 20){
      color = blue;
    }
    if(value < 10){
      color = purple;
    }
    if(value < 0){
      color = lavendar;
    }
    if(value < -10){
      color = gray;
    }
    if(value < -20){
      color = dark_gray;
    }
    return color;
  },
  dynamicHumidColor(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = red_orange;
    if(value < 65){
      color = bromine_orange;
    }
    if(value < 61){
      color = yellow_orange;
    }
    if(value < 51){
      color = yellow;
    }
    if(value < 50){
      color = terbium_green;
    }
    if(value < 45){
      color = blue;
    }
    return color;
  },

  dynamicLightColor(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = yellow_orange;
    if(value < 10000){
      color = bromine_orange;
    }
    if(value < 1000){
      color = grapefruit_orange;
    }
    if(value < 500){
      color = dark_pink;
    }
    if(value < 300){
      color = medium_pink;
    }
    if(value < 200){
      color = light_pink;
    }
    if(value < 160){
      color = light_purple;
    }
    if(value < 120){
      color = medium_purple;
    }
    if(value < 80){
      color = dark_purple;
    }
    if(value < 40){
      color = lavendar;
    }
    return color;
  },

  dynamicUVColor(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = lavendar;
    if(value < 11){
      color = red_orange;
    }
    if(value < 8){
      color = yellow_orange;
    }
    if(value < 6){
      color = yellow;
    }
    if(value < 3){
      color = terbium_green;
    }
    return color;
  },

  dynamicSoundColor(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = red_orange;
    if(value < 120){
      color = yellow_orange;
    }
    if(value < 90){
      color = yellow;
    }
    if(value < 60){
      color = terbium_green;
    }
    if(value < 30){
      color = blue;
    }
    return color;
  },

  dynamicVOCColor(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = red_orange;
    if(value < 1000){
      color = yellow;
    }
    if(value < 100){
      color = terbium_green;
    }
    return color;
  },

  dynamicPressureColor(value){
    return terbium_green;
  },

  dynamicCO2Color(value){
    try{
      value = value[0].values[value[0].values.length -1].y;
    }
    catch(e){}
    var color = dark_gray;
    if(value < 5000){
      color = red_orange;
    }
    if(value < 1200){
      color = yellow;
    }
    if(value < 1000){
      color = terbium_green;
    }
    return color;
  },

  dynamicHallStrengthColor(value){
    return terbium_green;
  },

  dynamicHallStateColor(value){
    return terbium_green;
  },

  render() {
    let limiter = this.isStreaming ? 30 : false;
    let temp = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('temperature',this.state.data), limiter);
    let humid = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('humidity',this.state.data), limiter);
    let ambientlight = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('ambientLight',this.state.data), limiter);
    let uv = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('uvIndex',this.state.data), limiter);

    let co2 = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('co2',this.state.data), limiter);
    let voc = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('voc',this.state.data), limiter);
    let sound = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('sound',this.state.data), limiter);
    let pressure = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('pressure',this.state.data), limiter);

    let testHallStrengthData = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('hallStrength',this.state.data), limiter);
    let prodHallStrengthData = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('hallEffectFieldStrength',this.state.data), limiter);
    let hallStrength;
    if (this.hasValues(prodHallStrengthData)) {
      hallStrength = prodHallStrengthData;
    } else {
      hallStrength = testHallStrengthData;
    }

    let testHallStateData = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('hallState',this.state.data), limiter);
    let prodHallStateData = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('hallEffectState',this.state.data), limiter);
    let hallState;
    if (this.hasValues(prodHallStateData)) {
      hallState = prodHallStateData;
    } else {
      hallState = testHallStateData;
    }

    // if hall effect State is not 0/1/2, set it to 2 (TAMPER)
    if (this.hasValues(hallState)) {
      this.handleHallStateEdgeCase(hallState[0]);
    }

    let header = (<HeaderTitle demoType="motion" title="ENVIRONMENT" color="#ffffff"/>);
    var skipsTime;
    if(temp && temp.skipsTime){
      skipsTime = (<h3 className="timeskip"><sup>*</sup>Results may include connection loss.</h3>);
    }
    var unit = 'C';
    var metric = true;
    if(this.state.unit && typeof this.state.unit[".value"] != 'undefined'){
      if(this.state.unit[".value"] == 1){
        unit = 'F';
        metric = false;
        temp = this.convertToSI(temp);
      }
    }
    return (
      <PageView className="dashboard"
                sessionId={this.props.params.session}
                deviceId={this.props.params.deviceId}
                dataFormatter={FireBaseTools.formatDataForCSV}
                data={this.state.data}
                nowStreamingData={temp}
                metric={metric}
                csvTitle={FireBaseTools.csvTitle('Environment Data',temp)}
                headerTitle={header}>
        <div className="sections env">
          <section className="side-by-side">
            {this.hasValues(temp) ?
              <CustomLineChart
                ref="chart"
                data={temp}
                title={"Temperature"}
                width={this.state.parentWidth}
                height={260}
                color={this.dynamicTempColor(temp, metric)}
                transparentAxis
                unit={'°' + unit}
                dataKey={this.currentValue(temp,'°' + unit)}
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(ambientlight) ?
              <CustomLineChart
                ref="chart"
                data={ambientlight}
                title={"Ambient Light"}
                width={this.state.parentWidth}
                height={260}
                color={this.dynamicLightColor(ambientlight)}
                unit={'lx'}
                dataKey={this.currentValue(ambientlight,'lx')}
                transparentAxis
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(humid) ?
              <CustomLineChart
                ref="chart"
                data={humid}
                title={"Humidity"}
                width={this.state.parentWidth}
                height={260}
                unit={'%'}
                color={this.dynamicHumidColor(humid)}
                transparentAxis
                dataKey={this.currentValue(humid,'%')}
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(uv) ?
              <CustomLineChart
                ref="chart"
                data={uv}
                color={this.dynamicUVColor(uv)}
                title={"UV Index"}
                unit={' '}
                width={this.state.parentWidth}
                height={260}
                dataKey={this.currentValue(uv,'')}
                transparentAxis
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(co2) ?
              <CustomLineChart
                ref="chart"
                data={co2}
                title={"CO2 Level"}
                unit={'ppm'}
                color={this.dynamicCO2Color(co2)}
                width={this.state.parentWidth}
                height={260}
                dataKey={this.currentValue(co2,'ppm')}
                transparentAxis
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(voc) ?
              <CustomLineChart
                ref="chart"
                data={voc}
                title={"TVOC Level"}
                unit={'ppb'}
                color={this.dynamicVOCColor(voc)}
                width={this.state.parentWidth}
                height={260}
                dataKey={this.currentValue(voc,'ppb')}
                transparentAxis
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(sound) ?
              <CustomLineChart
                ref="chart"
                data={sound}
                title={"Sound Level"}
                width={this.state.parentWidth}
                height={260}
                unit={'dB'}
                color={this.dynamicSoundColor(sound)}
                transparentAxis
                dataKey={this.currentValue(sound,'dB')}
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(pressure) ?
              <CustomLineChart
                ref="chart"
                data={pressure}
                title={"Pressure"}
                width={this.state.parentWidth}
                height={260}
                unit={'mbar'}
                color={this.dynamicPressureColor(pressure)}
                transparentAxis
                dataKey={this.currentValue(pressure,'mbar')}
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(hallStrength) ?
              <CustomLineChart
                ref="chart"
                data={hallStrength}
                title={"Hall Effect Field Strength"}
                width={this.state.parentWidth}
                height={260}
                unit={'µT'}
                color={this.dynamicHallStrengthColor(hallStrength)}
                transparentAxis
                dataKey={this.currentValue(hallStrength,'µT')}
                renderAvgLine
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"basis"}/>:false}
            {this.hasValues(hallState) ?
              <CustomLineChart
                ref="chart"
                data={hallState}
                title={"Hall Effect State"}
                width={this.state.parentWidth}
                height={260}
                color={this.dynamicHallStateColor(hallState)}
                dataKey={this.currentHallState(hallState)}
                isStreaming={this.isStreaming}
                hallState
                margin={{top: 10, bottom: 50, left: 35, right: 0}}
                interpolate={"step-after"}/>:false}
            <div className="chart no-content" ref="chart"/>
          </section>
          {skipsTime}
        </div>
      </PageView>
    );
  }
});
module.exports = EnvDashboard;
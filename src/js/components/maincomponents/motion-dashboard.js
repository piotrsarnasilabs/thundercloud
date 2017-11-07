let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Route = Router.Route;
let Tappable = require('react-tappable');
let ReactFire = require('reactfire');
let HeaderTitle = require('../subcomponents/header-title');
let Firebase = require('firebase');
let moment = require('moment');
let AppActions = require('../../actions/app-actions.js');
let Navigation = require('react-router').Navigation;
let CustomLineChart = require('../subcomponents/custom-line-chart');
let Legend = require('../subcomponents/legend');
let FireBaseTools = require('../../utils/firebase-tools');
let MainStore = require('../../stores/main-store');
let Store = require('../../stores/streaming-store');
let FluxyMixin = require('../../../../node_modules/alt/mixins/FluxyMixin');
/*
  This is the component for the Motion demo.

  When the component mounts, it creates a connection to the
  Firebase Motion url and binds that data to the key 'data'
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
      let string = window.firebaseURL+ 'sessions/'+this.props.params.session + '/motion';
      let ref = new Firebase( string );
      this.setState({'ref':ref});
      this.bindAsArray(ref, 'data');
      if(this.props.params.session){
        let unit = new Firebase( window.firebaseURL + 'sessions/'+this.props.params.session+'/measurementUnits' );
        this.bindAsObject(unit, 'unit');
      }
    }
    this.isStreaming = Store.state.streaming;
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
      parentWidth:400,
      data:{}
    };
  },
  renderCurrentUnit(data, val, unit){
    unit = unit || '';
    if(data && data.currentValues && data.currentValues.hasOwnProperty(val)){
      try{
        let value = data.currentValues[val];
        if(unit =='ft' || unit == 'ft/s'){
          value *= 3.28;
        }
        let renderVal = (Math.round(value * 10) / 10) + unit;
        return (<h3 className="last-point" style={{color:'#a1b92e'}}>{renderVal}</h3>);
      }
      catch(e){
        return;
      }
    }
    return;
  },
  convertToSI(data){
    var newData = data;
    if(newData){
      if(newData.hasOwnProperty('speed') && newData.speed.length){
        try{
          for(var s in newData.speed[0].values){
            if(newData.speed[0].values[s].hasOwnProperty('y')){
              newData.speed[0].values[s].y *= 3.28;
            }
          }
        }catch(e){}
      }
      if(newData.hasOwnProperty('distance') && newData.speed.length){
        try{
          for(var d in newData.distance[0].values){
            if(newData.distance[0].values[d].hasOwnProperty('y')){
              newData.distance[0].values[d].y *= 3.28;
            }
          }
        }catch(e){}
      }
    }
    return newData;
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
  render() {
    let motionData = FireBaseTools.formatMotionData(this.state.data);
    let limiter = this.isStreaming ? 30 : false;
    let header = (<HeaderTitle demoType="motion" title="MOTION" color="#ffffff"/>);
    var skipsTime;
    if(motionData && motionData.skipsTime){
      skipsTime = (<h3 className="timeskip"><sup>*</sup>Results may include connection loss.</h3>);
    }
    var unit = 'm',
        metric = true;
    if(this.state.unit && typeof this.state.unit[".value"] != 'undefined' && this.state.unit[".value"] == 1){
      unit = 'ft';
      metric = false;
      motionData = this.convertToSI(motionData);
    }
    let orientationLegend = (<Legend data={motionData} streaming={this.isStreaming} keys={['ox','oy','oz']} colors={['#0B8000','#87a10d','#caf200']} unit={'°'} alternateTitles={['x','y','z']}/>);
    let accLegend = (<Legend data={motionData} streaming={this.isStreaming} keys={['ax','ay','az']} colors={['#0B8000','#87a10d','#caf200']} unit={'g'} alternateTitles={['x','y','z']}/>);
    return (
      <PageView className="dashboard" 
                sessionId={this.props.params.session} 
                deviceId={this.props.params.deviceId} 
                data={this.state.data}
                nowStreamingData={motionData.speed}
                csvTitle={FireBaseTools.csvTitle('Motion Data',motionData)}
                dataFormatter={FireBaseTools.formatDataForCSV}
                metric={metric}
                headerTitle={header}>
        <div className="sections">
          <section className="top-and-bottom">
            <CustomLineChart ref="chart"
                    data={FireBaseTools.limitArray(motionData.speed,limiter)}
                    title={"Speed"}
                    width={this.state.parentWidth}
                    height={260}
                    color={"#a1b92e"}
                    renderAvgLine={true}
                    unit={unit+'/s'}
                    transparentAxis={true}
                    legend={this.renderCurrentUnit(motionData,'speed', unit + '/s')}
                    margin={{top: 10, bottom: 50, left: 35, right: 0}}
                    interpolate={"basis"}/>
            <CustomLineChart ref="chart"
                    data={FireBaseTools.limitArray(motionData.distance,limiter)}
                    title={"Distance"}
                    width={this.state.parentWidth}
                    height={260}
                    unit={unit}
                    legend={this.renderCurrentUnit(motionData, 'distance', unit)}
                    color={"#a1b92e"}
                    transparentAxis={true}
                    margin={{top: 10, bottom: 50, left: 35, right: 0}}
                    interpolate={"basis"}/>
          </section>
          <section className="top-and-bottom">
            <CustomLineChart ref="chart"
                    data={FireBaseTools.limitArray(motionData.orientation,limiter)}
                    title={"Orientation"}
                    width={this.state.parentWidth}
                    height={260}
                    groupedBars={true}
                    transparentAxis={true}
                    color={['#0B8000','#87a10d','#caf200']}
                    legend={orientationLegend}
                    margin={{top: 10, bottom: 50, left: 35, right: 0}}
                    interpolate={"basis"}/>
            <CustomLineChart ref="chart"
                    data={FireBaseTools.limitArray(motionData.acceleration,limiter)}
                    title={"Acceleration"}
                    width={this.state.parentWidth}
                    transparentAxis={true}
                    height={260}
                    groupedBars={true}
                    legend={accLegend}
                    color={['#0B8000','#87a10d','#caf200']}
                    margin={{top: 10, bottom: 50, left: 35, right: 0}}
                    interpolate={"basis"}/>
          </section>
          {skipsTime}
        </div>
      </PageView>
    );
  }
});
module.exports = EnvDashboard;
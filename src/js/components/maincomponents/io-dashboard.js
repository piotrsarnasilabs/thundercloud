let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Route = Router.Route;
let ReactFire = require('reactfire');
let Firebase = require('firebase');
let AppActions = require('../../actions/app-actions.js');
let moment = require('moment');
let Tappable = require('react-tappable');
let Navigation = require('react-router').Navigation;
let CustomLineChart = require('../subcomponents/custom-line-chart');
let HeaderTitle = require('../subcomponents/header-title');
let FireBaseTools = require('../../utils/firebase-tools');
let Store = require('../../stores/streaming-store');
let FluxyMixin = require('../../../../node_modules/alt/mixins/FluxyMixin');

/*
  This is the component for the I/O demo.

  When the component mounts, it creates a connection to the
  Firebase I/O url and binds that data to the key 'data'
  on the component state.

  It uses the Fluxy Mixin to setup listeners for changes to the 
  Streaming Store changes. This is for this component to 
  be notified when the device has stopped streaming data.
*/

let IODashboard = React.createClass({
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
      let string = window.firebaseURL + '/sessions/'+this.props.params.session+'/io';
      let ref = new Firebase( string );
      this.setState({'ref':ref});
      this.bindAsArray(ref, 'data');
    }
    this.isStreaming = false;
  },
  getInitialState() {
    return {
      parentWidth:400,
      ref:null,
      data:[]
    };
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
  renderTimestampKey(data, color){
    if(!data || data && !data.length || data &&  !data.earliestTimeAtCurrentPosition){
      return;
    }
    color = color || "white";
    let diff = data.latestTime - data.earliestTimeAtCurrentPosition;
    let displayTime = this.formatTimeFromDiff(diff);
    
    var top = 25;
    if(typeof data.currentPosition !== undefined){
      top = data.currentPosition == 1 ? 25 : 225;
    }
    var margin = 35;
    if(this.isStreaming){
      return (<h3 className="last-point" style={{color:color, left:this.state.parentWidth - 15,top:top}}>{displayTime}</h3>);
    }
    else{
      var timeIn0 = 0,timeIn1 = 0,timestampOfLastChange, lastY;
      try{
        timestampOfLastChange = data[0].values[0].x.getTime();
        lastY = data[0].values[0].y;
        for(let n in data[0].values){
          if(data[0].values[n].y != lastY){
            lastY === 0 ? (timeIn0 +=  data[0].values[n].x.getTime() - timestampOfLastChange) : (timeIn1 += data[0].values[n].x.getTime() - timestampOfLastChange);
            timestampOfLastChange = data[0].values[n].x.getTime();
          }
          lastY = data[0].values[n].y;
        }
        var idx = data[0].values.length - 1;
        if(timestampOfLastChange != data[0].values[idx].x.getTime()){
          lastY === 0 ? (timeIn0 +=  data[0].values[idx].x.getTime() - timestampOfLastChange) : (timeIn1 += data[0].values[idx].x.getTime() - timestampOfLastChange);
        }
      }
      catch(e){}
      timeIn0 = this.formatTimeFromDiff(timeIn0);
      timeIn1 = this.formatTimeFromDiff(timeIn1);
      return (<div>
        <h3 className="last-point" style={{color:color, left:this.state.parentWidth - 15,top:25}}>{timeIn1}</h3>
        <h3 className="last-point" style={{color:color, left:this.state.parentWidth - 15,top:225}}>{timeIn0}</h3>
        </div>);
    }
  },
  formatTimeFromDiff(diff){
    var displayTime = moment.duration(diff, "milliseconds").format("m:ss");switch(displayTime.length){
      case 1:
        displayTime = ":0" + displayTime;
      break;
      case 2:
      displayTime = ":" + displayTime;
      break;
      case 5:
      // displayTime = ":00";
      break;
      default:
      break;
    }
    return displayTime;
  },
  render() {
    let limiter = this.isStreaming ? 30 : false;
    let sw0 = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('sw0',this.state.data), limiter);
    let sw1 = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('sw1',this.state.data), limiter);
    let ledb = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('ledb',this.state.data), limiter);
    let ledg = FireBaseTools.limitArray(FireBaseTools.findKeyFromArray('ledg',this.state.data), limiter);

    let header = (<HeaderTitle demoType="io" title="I/O" color="#ffcc00"/>);
    var skipsTime;
    if(sw0 && sw0.skipsTime){
      skipsTime = (<h3 className="timeskip"><sup>*</sup>Results may include connection loss.</h3>);
    }
    return (
      <PageView className="dashboard"
                streamingKey="sw0"
                sessionId={this.props.params.session} 
                deviceId={this.props.params.deviceId} 
                data={this.state.data}
                csvTitle={FireBaseTools.csvTitle('I/O Data',sw0)}
                dataFormatter={FireBaseTools.formatDataForCSV} 
                headerTitle={header}>
        <div className="sections">
          <section className="side-by-side">
            <h1 className="section-header">Switches</h1>
            <CustomLineChart ref="chart"
                      color={"#ffcc00"}
                      dataKey={this.renderTimestampKey(sw0, '#ffcc00')}
                      data={sw0}
                      width={this.state.parentWidth}
                      isStreaming={this.isStreaming}
                      title={"SW-0"}
                      height={260}
                      isOnOff={true}
                      margin={{top: 20, bottom: 40, left: 30, right: 20}}
                      interpolate={"step-after"}/>
            <CustomLineChart ref="chart"
                      color={"#ffa200"}
                      dataKey={this.renderTimestampKey(sw1, '#ffa200')}
                      data={sw1}
                      width={this.state.parentWidth}
                      isStreaming={this.isStreaming}
                      title={"SW-1"}
                      height={260}
                      isOnOff={true}
                      margin={{top: 20, bottom: 40, left: 30, right: 20}}
                      interpolate={"step-after"}/>
          </section>
          <section className="side-by-side">
            <h1 className="section-header">Lights</h1>
            <CustomLineChart ref="chart"
                      color={"#00aeff"}
                      data={ledb}
                      title={"LED-B"}
                      width={this.state.parentWidth}
                      isStreaming={this.isStreaming}
                      dataKey={this.renderTimestampKey(ledb, '#00aeff')}
                      height={260}
                      isOnOff={true}
                      margin={{top: 20, bottom: 40, left: 30, right: 20}}
                      interpolate={"step-after"}/>
            <CustomLineChart ref="chart"
                      data={ledg}
                      color={"#caf200"}
                      title={"LED-G"}
                      dataKey={this.renderTimestampKey(ledg, '#caf200')}
                      width={this.state.parentWidth}
                      isStreaming={this.isStreaming}
                      height={260}
                      isOnOff={true}
                      margin={{top: 20, bottom: 40, left: 30, right: 20}}
                      interpolate={"step-after"}/>
            </section>
            {skipsTime}
        </div>
      </PageView>
    );
  }
});
module.exports = IODashboard;
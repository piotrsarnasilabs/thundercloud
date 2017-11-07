let React = require('react');
let moment = require('moment');
let FireBaseTools = require('../../utils/firebase-tools');
let Duration = require("moment-duration-format");
let AppActions = require('../../actions/app-actions.js');

let NowStreaming = React.createClass({
  componentWillMount() {
    if(this.props.data && this.props.data.length){
      this.updateState(this.props.data);
    }
  },
  componentWillUnmount() {
    clearInterval(this.state.checkInterval);
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) { 
    if(nextProps && nextProps.data && nextProps.data.length){
      this.updateState(nextProps.data);
    }
  },
  updateState(data){
    clearInterval(this.state.checkInterval);
    if(data && data.length && data.hasOwnProperty('earliestTime') && data.hasOwnProperty('latestTime')){
      this.setState({
        checkInterval:setInterval(function(){
          this.updateStream();
        }.bind(this),100)
      });
      this.updateStream();
    }
  },
  updateStream(){
    if(this.props.data){
      var skipsTime = this.props.data.skipsTime || false;
      var displayTime = Math.floor(new Date().getTime()) - this.props.data.earliestTime;
      if(FireBaseTools.isStreamingData(this.props.data)){
        this.setState({
          streaming:true,
          streamingCount:displayTime,
          skipsTime:skipsTime
        });
        AppActions.updateStreaming(true);
      }
      else{
        displayTime = this.props.data.latestTime - this.props.data.earliestTime;
        this.setState({
          streaming:false,
          streamingCount:displayTime,
          skipsTime:skipsTime
        });
        AppActions.updateStreaming(false);
        clearInterval(this.state.checkInterval);
      }
    }
  },
  getInitialState() {
    return {
      skipsTime:false,
      streaming:false,
      earliestTime:Math.floor(new Date().getTime()),
      checkInterval:setInterval(function(){},100000)
    };
  },
  renderStreamingData(){
    var format = window.innerWidth > 600 ? 'h [hrs], m [min], s [sec]': 'h[h] m[min] s[sec]';
    window.innerWidth < 370 && (format =  'h[h] m[m] s[s]');
    var momentTime = moment.duration(this.state.streamingCount, "milliseconds").format(format);
    if(this.state.streaming){
      momentTime = moment.duration(this.state.streamingCount, "milliseconds").format("h:mm:ss");
      switch(momentTime.length){
        case 1:
        momentTime = ":0" + momentTime;
        break;
        case 2:
        momentTime = ":" + momentTime;
        break;
        default:
        break;
      }
    }
    return (<h3>{momentTime}</h3>);
  },
  render() {
    var streaming = "Streaming Now";
    if(!this.state.streaming && this.props.data && this.props.data[0] && this.props.data.earliestTime){
      let format =  window.innerWidth > 600 ? 'MMMM Do YYYY [at] HH:mm':'MM/DD/YYYY [at] HH:mm';
      window.innerWidth < 370 && (format =  'MM/DD/YY HH:mm');
      streaming = moment(this.props.data.earliestTime).format(format);
    }
    return (
      <div className="now-streaming">
        <h1>{streaming}</h1>
        {this.renderStreamingData()}
      </div>
    );
  }
});
module.exports = NowStreaming;
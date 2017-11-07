let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Tappable = require('react-tappable');
let Route = Router.Route;
let AppActions = require('../../actions/app-actions.js');
let HeaderTitle = require('../subcomponents/header-title');
let PreviousSession = require('../subcomponents/previous-session');
let ReactFire = require('reactfire');
let moment = require('moment');
let Navigation = require('react-router').Navigation;

let PreviousSessions = React.createClass({
  mixins: [Navigation,ReactFire],
  componentWillMount() {
    if(this.props.params && this.props.params.deviceId){
      let string =  window.firebaseURL +'thunderboard/'+ this.props.params.deviceId + '/sessions/';
      let ref = new Firebase( string ).limitToLast(10);
      this.bindAsArray(ref, 'sessions');
    }
    setTimeout(function(){
      if(this.isMounted && this.isMounted() && !this.state.hasFetched){
        this.setState({hasFetched:true});
      }
    }.bind(this),8000);
  },
  getInitialState() {
    return {
      sessions:[],
      hasFetched: false
    };
  },
  render() {
    var renderedSessions,loading;
    var contactInfoGUID = false;
    if(this.state.sessions && this.state.sessions.length){
      var sess = this.state.sessions.sort(function(a,b){
        try{
          let response = parseInt(a[".key"],10) < parseInt(b[".key"],10);
          return response ? 1 : -1;
        }
        catch(e){}
        return 0;
      });
      renderedSessions = sess.map(function(session, index){
        var guid, timestamp;
        if(session.hasOwnProperty('.key')){
          timestamp = session['.key'];
        }
        if(session.hasOwnProperty('.value')){
          guid = session['.value'];
          if(!contactInfoGUID){
            contactInfoGUID = guid;
          }
        }
        return (<PreviousSession deviceId={this.props.params.deviceId} timestamp={timestamp} guid={guid} key={'session'+guid}/>);
      }.bind(this));
    }
    else{
      if(this.state.sessions && !this.state.sessions.length){
        loading = (<h1 className="loading"></h1>);
      }
      if(this.state.hasFetched && (!this.state.sessions || this.state.sessions && !this.state.sessions.legnth)){
        loading = (<h1 className="no-data">Unable to find any sessions for this device.</h1>);
      }
    }
    let header = (<HeaderTitle h1={'Past Sessions'} 
                title={this.props.params.deviceId} 
                sessionId={contactInfoGUID} 
                deviceId={this.props.params.deviceId} 
                color="#efefef"/>);
    return (
      <PageView className="previous-sessions" 
                headerTitle={header}
                sessionId={contactInfoGUID} 
                deviceId={this.props.params.deviceId} 
                hideFooterElements={true}>
        <div className="sections">
          {renderedSessions}
          {loading}
        </div>
      </PageView>
    );
  }
});
module.exports = PreviousSessions;
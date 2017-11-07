let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Tappable = require('react-tappable');
let Route = Router.Route;
let AppActions = require('../../actions/app-actions.js');
let Link = Router.Link;
let HeaderTitle = require('../subcomponents/header-title');
let ReactFire = require('reactfire');
let moment = require('moment');
let Navigation = require('react-router').Navigation;

let PreviousSession = React.createClass({
  mixins: [Navigation,ReactFire],
  componentWillMount() {
    if(this.props && this.props.guid){
      let string =  window.firebaseURL +'sessions/'+this.props.guid;
      let ref = new Firebase( string );
      this.bindAsObject(ref, 'session');
    }
  },
  getInitialState() {
    return {
      session:{}
    };
  },
  getType(){
    if(!this.state.session || this.state.session && !this.state.session.hasOwnProperty('.key')){
      return {
        type:'',
        title:''
      };
    }
    var type = '', title:'';
    if(this.state.session.hasOwnProperty('environment')){
      title = "Environment";
      type = "environment";
    }
    else if(this.state.session.hasOwnProperty('io')){
      title = "I/O";
      type = "io";
    }
    else if(this.state.session.hasOwnProperty('motion')){
      title = "Motion";
      type = "motion";
    }
    return {
      type:type,
      title:title
    };
  },
  render() {
    var session = this.getType();
    if(session.type == ''){
      return false;
    }
    let url = '/'+ this.props.deviceId + '/'+ this.props.guid +'/'+ session.type;
    var d;
    if(!isNaN(this.props.timestamp)){
      d = moment(parseInt(this.props.timestamp,10));
    }
    return (
      <Tappable component="div" className="session">
        <Link to={url}>
          <div className="icon" data-type={session.type}></div>
          <div className="data">
            <h1 className="session-type">{session.title}</h1>
            <h2 className="subtext">{d.format('MMMM Do YYYY')}</h2>
            <h3 className="subtext">{d.format('HH:mm')}</h3>
          </div>
        </Link>
      </Tappable>
    );
  }
});
module.exports = PreviousSession;
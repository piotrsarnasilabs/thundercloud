let React = require('react');
let ReactFire = require('reactfire');
let Firebase = require('firebase');
let FireBaseTools = require('../../utils/firebase-tools');

let HeaderTitle = React.createClass({
  mixins: [ReactFire],

  componentWillMount() {
    this.currentId = this.props.sessionId || '';
    if(this.props.sessionId){
      let string = window.firebaseURL+'/sessions/'+this.props.sessionId+'/contactInfo';
      this.bindAsArray(new Firebase( string ), 'contactInfo');
      this.setState({hasSetFirebaseRef:true});
    }
  },
  componentWillReceiveProps(nextProps) {
    if(nextProps.sessionId && nextProps.sessionId != this.currentId){
      this.currentId = this.props.sessionId || '';
      if(this.state.hasSetFirebaseRef){
        this.unbind('contactInfo');
      }
      let string = window.firebaseURL + '/sessions/'+nextProps.sessionId+'/contactInfo';
      this.bindAsArray(new Firebase( string ), 'contactInfo');
      this.setState({hasSetFirebaseRef:true});
    }
  },
  getInitialState() {
    return {
      contactInfo:false,
      hasSetFirebaseRef:false
    };
  },
  render() {
    let color = this.props.color || "white";
    let cx = React.addons.classSet;
    let prop = this.props.demoType || '';
    let classes = cx('title', prop);
    let name = this.props.h1 || 'Cloud View';
    var title = this.props.title;
    if(this.state.contactInfo){
      let d = FireBaseTools.getValueFromKey('deviceName',this.state.contactInfo);
      if(d && d !== ''){
        title = d;
      }
    }
    return (
      <div className={classes}>
        <h1>{name}</h1>
        <h2 style={{color:color}}>{title}</h2>
      </div>
    );
  }
});
module.exports = HeaderTitle;
let React = require('react');
let Router = require('react-router');
let Route = Router.Route;
let ReactFire = require('reactfire');
let Firebase = require('firebase');
let AppActions = require('../../actions/app-actions.js');
let Link = Router.Link;
let Tappable = require('react-tappable');
let Navigation = require('react-router').Navigation;
let FireBaseTools = require('../../utils/firebase-tools');

  /*
    Optional props:
      data : object - Data to be downloaded
      hideFooterElements : boolean - Pass true to hide the footer on a page
      csvTitle : string - What the "Download CSV" file will be called
      dataFormatter : function - A function to format the data passed when downloading the CSV
      sessionId : string - the session ID used in the footer to get the sessions contact info
      deviceId : string - the device ID used in the footer to get the sessions contact info
      headerTitle : React component - The HeaderTitle component for each page
    */
let Footer = React.createClass({
  mixins: [Navigation,ReactFire],
  componentWillMount() {
    this.currentId = this.props.sessionId || '';
    if(this.props.sessionId && this.props.deviceId){
      let string = window.firebaseURL + 'sessions/'+this.props.sessionId+'/contactInfo';
      this.bindAsArray(new Firebase( string ), 'contactInfo');
      this.setState({hasSetFirebaseRef:true});
    }
  },
  componentWillReceiveProps(nextProps) {
    if(nextProps.sessionId && nextProps.sessionId != this.currentId){
      if(this.state.hasSetFirebaseRef){
        this.unbind('contactInfo');
      }
      this.currentId = this.props.sessionId;
      let string = window.firebaseURL + '/sessions/'+nextProps.sessionId+'/contactInfo';
      this.bindAsArray(new Firebase( string ), 'contactInfo');
      this.setState({hasSetFirebaseRef:true});
    }
  },
  onTapPast(e){
    var link = "/" + this.props.deviceId + "/sessions";
    this.transitionTo(link);
  },
  onTapDownload(){
    AppActions.downloadCSV({data:this.props.data, formatter:this.props.dataFormatter, filename:this.props.csvTitle||'data', metric:true});
  },

  getInitialState() {
    return {
      contactInfo:false,
      hasSetFirebaseRef:false
    };
  },
  render() {
    var fullName, title, links, deviceName = '';
    if(this.state.contactInfo){
      fullName = FireBaseTools.getValueFromKey('fullName',this.state.contactInfo);
      title = FireBaseTools.getValueFromKey('title',this.state.contactInfo);
      let d = FireBaseTools.getValueFromKey('deviceName',this.state.contactInfo);
      if(d && d !== ''){
        deviceName = d;
      }
    }
    if(!this.props.hideFooterElements){
      links = (
            <div className="links">
              <Tappable component="button" className="button" onTap={this.onTapPast}><a>Past Sessions</a></Tappable>
              <Tappable component="button" className="button" onTap={this.onTapDownload}><a>View The Raw Data</a></Tappable>
              <Tappable component="button" className="button" ><a href="http://www.silabs.com/thunderboard">More About Thunderboard</a></Tappable>
            </div>);
    }
    return (
      <footer>
        <div className="padding-container">
          <div className="wrap clearfix">
            {links}
            <div className="user">
              <div className="info">
                <h1>{deviceName}</h1>
              </div>
              {this.state.user}
            </div>
          </div>
        </div>
        <span className="copyright">ⓒ Silicon Labs 2015</span>
      </footer>
    );
  }
});
module.exports = Footer;
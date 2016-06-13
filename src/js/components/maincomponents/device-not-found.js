let React = require('react');
let PageView = require('../pageview');
let Router = require('react-router');
let Route = Router.Route;
let AppActions = require('../../actions/app-actions.js');
let Link = Router.Link;
let Navigation = require('react-router').Navigation;

/*
  This is a basic 404 page. Typically only hit when there is no session or device passed with the URL.
*/

let DeviceNotFound = React.createClass({
  mixins: [Navigation],
  render() {
    return (
      <PageView className="not-found" 
                hideFooterElements={true}>
        <div className="sections">
          <span>Unable to find a session or device ID. <br/>Check the URL to make sure you are pointing to the correct session and device.</span>
        </div>
      </PageView>
    );
  }
});
module.exports = DeviceNotFound;
let React = require('react');
let Router = require('react-router');
let Route = Router.Route;
let NotFoundRoute = Router.NotFoundRoute;
let DefaultRoute = Router.DefaultRoute;
let APP = require('./components/app').APP;
let IODashboard = require('./components/maincomponents/io-dashboard');
let MotionDashboard = require('./components/maincomponents/motion-dashboard');
let EnvDashboard = require('./components/maincomponents/env-dashboard');
let DeviceNotFound = require('./components/maincomponents/device-not-found');
let PreviousSessions = require('./components/maincomponents/previous-sessions');


window.firebaseURL = 'https://' --- INSERT FIREBASE DATABASE NAME HERE ---'.firebaseio.com/';

  /*
    Here are all the Routes available in the app. If you want a new page,
    add the route here and the component in the handler property.

    NOTE: Routes are doubled up to capture issue with react router not including '/' at the end of a route
  */
let routes = (
  <Route handler={APP}>
    <DefaultRoute handler={DeviceNotFound} />
    <Route path="/:deviceId/:session/io/" handler={IODashboard}/>
    <Route path="/:deviceId/:session/io" handler={IODashboard}/>
    <Route path="/:deviceId/:session/motion/" handler={MotionDashboard}/>
    <Route path="/:deviceId/:session/motion" handler={MotionDashboard}/>
    <Route path="/:deviceId/:session/environment/" handler={EnvDashboard}/>
    <Route path="/:deviceId/:session/env/" handler={EnvDashboard}/>
    <Route path="/:deviceId/:session/environment" handler={EnvDashboard}/>
    <Route path="/:deviceId/:session/env" handler={EnvDashboard}/>
    <Route path="/:deviceId/:session/" handler={PreviousSessions}/>
    <Route path="/:deviceId/:session" handler={PreviousSessions}/>
    <Route path="/:deviceId/" handler={PreviousSessions}/>
    <Route path="/:deviceId" handler={PreviousSessions}/>
    <NotFoundRoute handler={DeviceNotFound}/>
  </Route>
);

React.initializeTouchEvents(true);
Router.run(routes, function (Handler, state) {
  React.render(<Handler/>, document.getElementById('view-root'));
});
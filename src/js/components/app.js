let React = require('react');
let RouteHandler = require('react-router').RouteHandler;
let Navigation = require('react-router').Navigation;
let $ = require('jquery');

let APP = React.createClass({
  mixins: [Navigation],
  render () {
    return (
      <RouteHandler key={name}/>
    );
  }
});


exports.APP = APP;




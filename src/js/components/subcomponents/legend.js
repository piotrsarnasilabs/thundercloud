let React = require('react');

let Legend = React.createClass({
  render() {
    let unit = this.props.unit || '';
    let {data, keys, colors, alternateTitles} = this.props;
    var keysToRender;
    let streaming = this.props.streaming;
    if(data && data.currentValues && keys && colors){
      keysToRender = keys.map(function (item, index) {
        if(!data.currentValues.hasOwnProperty(item) || isNaN(data.currentValues[item])){
          return;
        }
        var key = (Math.round(data.currentValues[item] * 10) / 10 ) + unit, color;
        try{
          color = colors[index];
        }
        catch(e){
          color = 'white';
        }
        try{
          if(streaming){
            key = alternateTitles[index] + ' = ' + key;
          }else{
            key = alternateTitles[index];
          }
        }
        catch(e){
          key = item + ' ' + key;
        }
        return (<div className="legend"><span className="dot" style={{backgroundColor:color}}/><span className="copy">{key}</span></div>);
      });
    }
    return (
      <div className="keys">
        {keysToRender}
      </div>
    );
  }
});
module.exports = Legend;
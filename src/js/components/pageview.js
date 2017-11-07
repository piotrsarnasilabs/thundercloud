let React = require('react/addons');
let Tappable = require('react-tappable');
let Footer = require('./subcomponents/footer');
let NowStreaming = require('./subcomponents/now-streaming');
let FireBaseTools = require('../utils/firebase-tools');
  /*
    This is the base component that all pages use. 
    It adds the header and footer along with the 'Now Streaming' 
    data based on data passed to the component.

    Optional props:
      data : object - Data to be rendered in NowStreaming and Footer
      hideFooterElements : boolean - Pass true to hide the footer on a page
      csvTitle : string - What the "Download CSV" file will be called
      dataFormatter : function - A function to format the data passed when downloading the CSV
      sessionId : string - the session ID used in the footer to get the sessions contact info
      deviceId : string - the device ID used in the footer to get the sessions contact info
      headerTitle : React component - The HeaderTitle component for each page
  */
let PageView = React.createClass({
      render(){
        var cx = React.addons.classSet;
        var prop = this.props.className || '';
        var classes = cx('view', prop);
        var streaming;
        if(this.props.data && this.props.streamingKey){
          let data = FireBaseTools.findKeyFromArray(this.props.streamingKey,this.props.data);
          streaming = data ? (<NowStreaming data={data}/>): undefined;
        }
        else if(this.props.nowStreamingData){
          var data = this.props.nowStreamingData;
          streaming = (<NowStreaming data={data}/>); 
        }
        else if(this.props.data){
          var data = this.props.data;
          streaming = (<NowStreaming data={data}/>); 
        }
        return (
          <div className={classes}>
            <div className="view-interior">
              <header className="main-header">
                <div className="wrap">
                  <a href="http://www.silabs.com/Pages/default.aspx"><div className="logo"></div></a>
                  {this.props.headerTitle}
                  {streaming}
                </div>
              </header>
              {this.props.children}
            </div>
            <Footer hideFooterElements={this.props.hideFooterElements} 
                    data={this.props.data} 
                    csvTitle={this.props.csvTitle} 
                    dataFormatter={this.props.dataFormatter} 
                    metric={this.props.metric} 
                    sessionId={this.props.sessionId} 
                    deviceId={this.props.deviceId}/>
          </div>
        );
      }
  });



module.exports = PageView;

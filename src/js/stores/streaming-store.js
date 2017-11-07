let alt = require('../alt');
let AppActions = require('../actions/app-actions');

let StreamingStore = alt.createStore(class StreamingStore {
  constructor() {
    this.bindAction(AppActions.updateStreaming, this.onUpdateStreaming);
    this.state = {streaming:false};
  }

  onUpdateStreaming(bool){
    if(this.state.streaming !== bool){
      setTimeout(() => {
        this.setState({streaming:bool});
      }, 10);
    }
    this.preventDefault();
  }
});

module.exports = StreamingStore;
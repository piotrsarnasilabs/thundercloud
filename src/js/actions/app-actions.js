let alt = require('../alt');

class AppActions {
  constructor() {
    this.generateActions(
      'downloadCSV',
      'updateStreaming'
    );
  }
}

module.exports = alt.createActions(AppActions);
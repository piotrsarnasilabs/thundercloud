let alt = require('../alt');
let AppActions = require('../actions/app-actions');

let MainStore = alt.createStore(class MainStore {
  constructor() {
    this.bindAction(AppActions.downloadCSV, this.onDownloadCSV);
  }

  onDownloadCSV(obj) {
    var formatter = obj.formatter,
        filename = obj.filename,
        metric = obj.metric;
    this.download(obj.data, filename,formatter,metric);
  }
  isIE(){
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)){
      return true;
    } else {
      return false;
    }
  }
  download(JSONData,fileName,formatter,metric){
    metric = !!metric;
    let arrData = typeof JSONData != 'object' ? JSON.parse(JSONData) : JSONData;
    let CSV = typeof formatter == 'function' ? formatter(arrData, metric) : arrData;
    fileName = fileName || 'Result';
    if(this.isIE()){
        let IEwindow = window.open();
        IEwindow.document.write('sep=,\r\n' + CSV);
        IEwindow.document.close();
        IEwindow.document.execCommand('SaveAs', true, fileName + '.csv');
        IEwindow.close();
    } else {
        let uri = 'data:text/csv;charset=utf-8,' + escape(CSV);
        let link = document.createElement('a');
        link.href = uri;
        if(link.style && typeof link.style.visibility !='undefined'){
          link.style.visibility = 'hidden';
        }
        link.download = fileName + '.csv';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  }
});

module.exports = MainStore;
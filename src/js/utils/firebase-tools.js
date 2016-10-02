let moment = require('moment');
let FireBaseTools = {
  /*
    Parameters:
    key : string - the key from the firebase data you want to use as your datasource
    obj : [object] - The data from the bound Firebase reference
    
    This loops through all the data in the object and reformats the data
    to better match what is needed for viewing in a D3 chart.
  */
  findKeyFromArray(key, obj){
    var newObj = obj[0];
    try{
      obj.forEach(function(e,i){
        try{
          if(newObj){
            var k = key;
            switch(k){
              case 'ledb':
                k = 'led-b';
                break;
              case 'ledg':
                k = 'led-g';
              break;
              default:
              break;
            }
            var array = [{label:k,values:[]}];
            array.skipsTime = false;
            var previousTime;
            var total = 0;
            for(let val in newObj){
              if(!isNaN(val)){
                if(newObj[val] && newObj[val].hasOwnProperty(key)){
                  var parsedVal = parseInt(val,10);
                  if(!isNaN(newObj[val][key])){
                    total += parseInt(newObj[val][key],10);
                  }
                  if(array.earliestTime){
                    if(parsedVal < array.earliestTime){
                      array.earliestTime = parsedVal;
                    }
                    if(parsedVal > array.latestTime){
                      array.latestTime = parsedVal;
                    }
                    if(newObj[val][key] !== array.currentPosition){
                      array.earliestTimeAtCurrentPosition = parsedVal;
                    }
                    array.currentPosition = newObj[val][key];
                    if(parsedVal - previousTime > 10000){
                      array.skipsTime = true;
                    }
                    previousTime = parsedVal;
                  }else{
                    previousTime = parsedVal;
                    array.earliestTime = parsedVal;
                    array.latestTime = parsedVal;
                    array.earliestTimeAtCurrentPosition = parsedVal;
                    array.currentPosition = newObj[val][key];
                  }
                  array[0].values.push({"x":this.formatTime(parsedVal), "y":newObj[val][key]});
                }
              }
            }
            newObj = array;
            newObj.avg = total && array.length && array[0].values ? total / array[0].values.length : 0;
          }
        }catch(er){
          console.error(er);
        }
      }.bind(this));
    }
    catch(e){}
    return newObj;
  },
  /*
    Parameters:
    obj : [object] - The data from the bound Firebase reference
    
    This loops through all the data specifically for motion
    and reformats the data to better match what is needed for 
    viewing in a D3 chart.
  */
  formatMotionData(obj){
    var orientationX = {label:'orientationX',values:[]},
        orientationY = {label:'orientationY',values:[]},
        orientationZ = {label:'orientationZ',values:[]},
        accelerationX = {label:'accelerationX',values:[]},
        accelerationY = {label:'accelerationY',values:[]},
        accelerationZ = {label:'accelerationZ',values:[]},
        speed = {label:'speed',values:[]},
        distance = {label:'distance',values:[]}, earliestTime, skipsTime, latestTime;

    var totals = {
      s:0, d:0
    };
    var curVals = {};
    try{
      var newObj = obj[0];
      if(newObj){
        var previousTime;
        var avg = 0;
        for(let val in newObj){
          if(!isNaN(val)){
            var curVal = newObj[val];
            if(curVal){
              curVals = curVal;
              curVal.hasOwnProperty('speed') && speed.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['speed']}) && !isNaN(curVal['speed']) && (totals.s += curVal['speed']);
              curVal.hasOwnProperty('ox') && orientationX.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['ox']});
              curVal.hasOwnProperty('oy') && orientationY.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['oy']});
              curVal.hasOwnProperty('oz') && orientationZ.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['oz']});
              curVal.hasOwnProperty('ax') && accelerationX.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['ax']});
              curVal.hasOwnProperty('ay') && accelerationY.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['ay']});
              curVal.hasOwnProperty('az') && accelerationZ.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['az']});
              curVal.hasOwnProperty('distance') && distance.values.push({"x":this.formatTime(parseInt(val,10)), "y":curVal['distance']}) && !isNaN(curVal['distance']) && (totals.d += curVal['distance']);
              if(parseInt(val,10) < earliestTime || !earliestTime){
                earliestTime = parseInt(val,10);
              }
              if(parseInt(val,10) > latestTime || !latestTime){
                latestTime = parseInt(val,10);
              }
              if(parseInt(val,10) - previousTime > 10000){
                skipsTime = true;
              }
              previousTime = parseInt(val,10);
            }
          }
        }
      }
    }
    catch(e){
      console.error(e);
    }
    var data = {
      skipsTime:skipsTime,
      acceleration:[accelerationX,accelerationY,accelerationZ],
      speed:[speed],
      distance:[distance],
      orientation:[orientationX,orientationY,orientationZ],
      currentValues:curVals
    };
    data['acceleration'].earliestTime = earliestTime;
    data['acceleration'].latestTime = latestTime;
    data['acceleration'].skipsTime = skipsTime;
    data['speed'].earliestTime = earliestTime;
    data['speed'].latestTime = latestTime;
    data['speed'].skipsTime = skipsTime;
    data['speed'].avg = totals.s ? totals.s / speed.values.length : 0;
    data['distance'].earliestTime = earliestTime;
    data['distance'].latestTime = latestTime;
    data['distance'].skipsTime = skipsTime;
    data['distance'].avg = totals.d ? totals.d / speed.values.length : 0;
    data['orientation'].earliestTime = earliestTime;
    data['orientation'].latestTime = latestTime;
    data['orientation'].skipsTime = skipsTime;
    return data;
  },
  /*
    Parameters:
    key : string - the key whose value you want to retrun
    obj : array - The data from the bound Firebase reference
    
    When binding a Firebase reference to an array, this helper will quickly get the 
    value from that object based on the key name you specify
  */
  getValueFromKey(key,obj){
    var value;
    try{
      if(obj[".key"] && obj[".key"] == key && obj[".value"]){
        value = obj[key];
      }
      else{
        for(let val in obj){
          if(obj[val][".key"] && obj[val][".key"] == key && obj[val][".value"]){
            value = obj[val][".value"];
          }
        }
      }
    }
    catch(e){}
    return value;
  },
  /*
    Parameters:
    data : [object] - The data from the bound Firebase reference
    
    A helper to determine if the data passed is currently streaming data.
    Allows for a 6000 ms buffer for slow connections
  */
  isStreamingData(data){
    var isStreaming = false;
    var currTime = Math.floor(new Date().getTime());
    if(data && data.length && data.hasOwnProperty('latestTime') && data.latestTime > currTime - 30000){
      isStreaming = true;
    }
    return isStreaming;
  },
  /*
    Parameters:
    obj : [object] - The data from the bound Firebase reference
    
    Renames 0 to Off and 1 to On for use in the I/O charts
  */
  formatToOnOff(obj){
    try{
      var newObj = obj[0];
      if(newObj.values){
        for(let x in newObj.values){
          if(newObj.values[x].y && newObj.values[x].y == 1){
            newObj.values[x].y = "On";
          }
          else{
            newObj.values[x].y = "Off";
          }
        }
        obj[0] = newObj;
      }
    }
    catch(e){}
    return obj;
  },
  /*
    Parameters:
    obj : [object] - The data from the bound Firebase reference
    
    Renames 0 to Off and 1 to On for use in the I/O charts
  */
  getKeyFromArray(obj){
    let arr = obj[0];
    let key = "";
    try{
      if(typeof obj['.key'] != 'undefined'){
        key = obj['.key'];
      }
    }
    catch(e){}
    return key;
  },
  /*
    Parameters:
    timestamp : int - A timestamp in milliseconds
    
    A helper to return a javascript Date based on a timestamp
  */
  formatTime(timestamp){
    var a = new Date(timestamp);
    return a;
  },
  /*
    Parameters:
    arr : array - The data you want to limit
    limitTimeframeInSeconds : int - The number of seconds you want to limit the data to
    
    A helper to reformat the data to a given timeframe. This is used when streaming data
    to limit it to 30 seconds. This number can be changed to any value from the components 
    that call it. 

    This loops through the array and injects extra data points if there is not at least 
    the limitTimeframeInSeconds value of seconds in the data passed. If there are more
    than the limitTimeframeInSeconds, it will splice the last values to match the timeframe

    i.e. If you pass 30 seconds as the limit with an array 15 seconds, it will inject
    15 seconds into the data. If it has more than 30 seconds, it will remove data until 
    it gets to 30 seconds.
  */
  limitArray(arr, limitTimeframeInSeconds){
    if(typeof limitTimeframeInSeconds && !limitTimeframeInSeconds){
      return arr;
    }
    limitTimeframeInSeconds = limitTimeframeInSeconds || 120;
    let timeInMS = limitTimeframeInSeconds * 1000;
    try{
      if(arr && arr.hasOwnProperty('earliestTime')){
        for(var idx = arr.length - 1; idx >= 0; idx--){
          var y = 0;
          var newArr = arr[idx].values;
          var diff = 0;
          
          if(arr.earliestTime){
            diff = (arr.latestTime - arr.earliestTime);
          }
          var earliestUsableTime;
          var timestamp = new Date();
          var lastY = 0;
          if(newArr.length){
            if(newArr[newArr.length - 1].x && newArr[newArr.length - 1].x.getTime){
              var latestTime = newArr[newArr.length - 1].x.getTime();
              for(var x = newArr.length - 1; x >= 0; x--){
                if(newArr[x].x && newArr[x].x.getTime){
                  if((newArr[x].x.getTime()) < latestTime - timeInMS){
                    lastY = newArr[x].y;
                    timestamp = newArr[x].x.getTime();
                    newArr.splice(x,1);
                  }
                  else if(!earliestUsableTime){
                    earliestUsableTime = newArr[x].x.getTime();
                  }
                  else if (newArr[x].x.getTime() < earliestUsableTime){
                    earliestUsableTime = newArr[x].x.getTime();
                  }
                  diff = (arr.latestTime - earliestUsableTime);
                }
                y = newArr[x].y;
              }
            }
          }
          if(earliestUsableTime){
            while(diff < timeInMS){
              if(newArr && newArr.length){
                timestamp = newArr[0].x;
                lastY = newArr[0].y;
              }
              timestamp = new Date(timestamp.getTime() - 1000);
              newArr.unshift({x:timestamp,y:lastY});
              diff += 1000;
            }
          }
          arr[idx].values = newArr;
        }
      }
    }
    catch(e){
      console.error(e);
    }
    return arr;
  },
  /*
    data : [object] - The data from the bound Firebase reference

    Converts data to a CSV format.
  */
  formatDataForCSV(data, metric){
    var CSV = '';
    metric = !!metric;
    for (let i = 0; i < data.length; i++) {
        let row = '';
        for (let index in data[i]) {
          if(index != '.key'){
            var arrValue = data[i][index] == null ? '' : '="' + data[i][index] + '"';
            if(typeof data[i][index] == 'object'){
              var arrValue = '';
              for(let val in data[i][index]){
                if(arrValue.length){
                  arrValue += ',';
                }
                arrValue += data[i][index][val];
              }
            }
            let idx = index +"";
            row += idx + ',' + arrValue + '\r\n';
          }
        }
        row.slice(0, row.length - 1);
        CSV += row + '\r\n';
    }
    if (CSV == '') {
        console.error('Invalid data');
        return;
    }
    else{
      var titles = '';
      for (let i = 0; i < 1; i++) {
        for (let index in data[i]) {
          if(index != '.key'){
            if(typeof data[i][index] == 'object'){
              var arrValue = '';
              for(let val in data[i][index]){
                if(arrValue.length){
                  arrValue += ',';
                }
                val = _formatVal(val, metric)
                arrValue += val;
              }
            }
            titles = 'Timestamp,' + arrValue + '\r\n';
          }
        }
      }
      CSV = titles + '\r\n' + CSV;
    }
    return CSV;
  },
  /*
    title : string - What you want the CSV to be called
    dataForEarliestTime : data  - Data to grab the earliest time from

    If the data passed has an earliest time value, it will format it and append it
    to the downloaded CSV title.
  */
  csvTitle(title, dataForEarliestTime){
    try{
      var date = moment(dataForEarliestTime.earliestTime).format('MMMM Do YYYY [at] h:mm:ss a');
      title += ' - ' + date;
    }
    catch(e){}
    return title;
  }
};
function _formatVal(val, metric){
  switch(val){
    case 'ledb':
      return 'led-b';
    case 'ledg':
      return 'led-g';
    case 'sw0':
      return 'sw-0';
    case 'sw1':
      return 'sw-1';
    case 'ax':
      return val +='(g)'
    case 'ay':
      return val +='(g)'
    case 'az':
      return val +='(g)'
    case 'ox':
      return val +='(degree)'
    case 'oy':
      return val +='(degree)'
    case 'oz':
      return val +='(degree)'
    case 'speed':
      var perS = metric ? '(m/s)' : '(ft/s)';
      return val += perS
    case 'distance':
      var dist = metric ? '(m)' : '(ft)';
      return val += dist
    case 'ambientLight':
      return val +='(lx)';
    case 'humidity':
      return val +='(%)';
    case 'temperature':
      var temp = metric ? '(C)' : '(F)';
      return val += temp;
    default:
      return val;
    break;
  }
};

module.exports = FireBaseTools;
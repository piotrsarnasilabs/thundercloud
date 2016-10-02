let React = require("react");
let d3 = require("d3");
let Path = require("./react-d3-components/lib/Path");

var CustomDataSet = React.createClass({
    displayName: "DataSet",

    propTypes: {
        data: React.PropTypes.array.isRequired,
        line: React.PropTypes.func.isRequired
    },

    render: function render() {
        var _props = this.props;
        var data = _props.data;
        var line = _props.line;
        var color = _props.color || "white";
        var values = _props.values;
        var lines = data.map(function (stack, index) {
            var c = color;
            if(typeof color == 'object'){
                try{
                    c = color[index];
                }
                catch(e){
                    c = "white";
                }
            }
            return (<Path key={"path"+index} className="line" d={line(values(stack))} stroke={c}/>);
        });
        return (<g>{lines}</g>);
    }
});


module.exports = CustomDataSet;
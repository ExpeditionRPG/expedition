import React from 'react';
import ReactNodeGraph from 'react-node-graph';
import FloatingActionButton from 'material-ui/FloatingActionButton';
import ContentAdd from 'material-ui/svg-icons/content/add';

var styles = {
  fab: {
    position: "fixed",
    bottom: "20pt",
    right: "20pt",
    zIndex: 100000
  }
};

export default class GraphView extends React.Component {
  constructor(props) {
    super(props);

    this.state = {data: {
      nodes: [],
      connections: []
    }};
  }

  componentDidMount() {
    $.get(this.props.url, function(result) {
      this.setState({data: result});
    }.bind(this)).fail(function(err) {
      console.log(err);
    });
  }

  onNodeMove(nid, pos) {

  }
  onNodeStartMove(nid) {

  }
  onNewConnector(n1,o,n2,i) {

  }

  render() {
    if (this.state.data.nodes.length) {
      return (
        <div className="graphcontainer">
          <ReactNodeGraph data={this.state.data}
            onNodeMove={(nid, pos)=>this.onNodeMove(nid, pos)}
            onNodeStartMove={(nid)=>this.onNodeStartMove(nid)}
            onNewConnector={(n1,o,n2,i)=>this.onNewConnector(n1,o,n2,i)}
          />
          <FloatingActionButton style={styles.fab}>
            <ContentAdd />
          </FloatingActionButton>
        </div>
      );
    } else {
      return (<div>Loading</div>);
    }
  }
}
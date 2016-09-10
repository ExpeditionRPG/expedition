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

// TODO: Implement
export default class GraphView extends React.Component {

  onNodeMove(nid, pos) {

  }
  onNodeStartMove(nid) {

  }
  onNewConnector(n1,o,n2,i) {

  }

  render() {
    return (
      <div className="graphcontainer">
        <ReactNodeGraph data={this.props.data}
          onNodeMove={(nid, pos)=>this.onNodeMove(nid, pos)}
          onNodeStartMove={(nid)=>this.onNodeStartMove(nid)}
          onNewConnector={(n1,o,n2,i)=>this.onNewConnector(n1,o,n2,i)}
        />
        <FloatingActionButton style={styles.fab}>
          <ContentAdd />
        </FloatingActionButton>
      </div>
    );
  }
}
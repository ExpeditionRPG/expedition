import React from 'react';

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  comingsoon: {
    color: "#FFC107"
  }
}

// TODO: The app is in polymer... so iframe it?
// TODO: Refactor this
export default class AdventurerView extends React.Component {

  render() {
    return (
      <div style={styles.container}>
        <h1 style={styles.comingsoon}>Adventurer view (Coming soon)</h1>
      </div>
    );
  }
}
import React, { Component } from "react";
import { Menu, Icon } from "semantic-ui-react";
import { connect } from "react-redux";

import { setCurrentChannel, setPrivateChannel } from "../../actions";
import firebase from "../../firebase";

class Starred extends Component {
  state = {
    starredChannels: [],
    activeChannel: "",
    user: this.props.currentUser,
    usersRef: firebase.database().ref("users"),
  };

  componentDidMount() {
    const { user } = this.state;
    if (user) {
      this.addListeners(user.uid);
    }
  }

  addListeners = (userId) => {
    const { usersRef } = this.state;
    usersRef
      .child(userId)
      .child("starred")
      .on("child_added", (snap) => {
        const starredChannel = { id: snap.key, ...snap.val() };
        const { starredChannels } = this.state;

        this.setState({
          starredChannels: [...starredChannels, starredChannel],
        });
      });

    usersRef
      .child(userId)
      .child("starred")
      .on("child_removed", (snap) => {
        const { starredChannels } = this.state;
        const channelToRemove = { id: snap.key, ...snap.val() };
        const filteredChannels = starredChannels.filter((channel) => {
          return channel.id !== channelToRemove.id;
        });

        this.setState({ starredChannels: filteredChannels });
      });
  };

  changeChannel = (channel) => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    this.setActiveChannel(channel);
    setCurrentChannel(channel);
    setPrivateChannel(false);
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  displayChannels = (starredChannels) =>
    starredChannels.length > 0 &&
    starredChannels.map((starredChannel) => (
      <Menu.Item
        key={starredChannel.id}
        onClick={() => this.changeChannel(starredChannel)}
        name={starredChannel.name}
        style={{ opacity: 0.7 }}
        active={starredChannel.id === this.state.activeChannel}
      >
        # {starredChannel.name}
      </Menu.Item>
    ));

  render() {
    const { starredChannels } = this.state;
    return (
      <Menu.Menu className="menu">
        <Menu.Item>
          <span>
            <Icon name="star" /> STARRED
          </span>{" "}
          ({starredChannels.length})
        </Menu.Item>
        {this.displayChannels(starredChannels)}
      </Menu.Menu>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(Starred);

import React, { Component } from "react";

import {
  Menu,
  Icon,
  Modal,
  Form,
  Input,
  ModalActions,
  Button,
  Label,
} from "semantic-ui-react";
import firebase from "../../firebase";
import { connect } from "react-redux";
import { setCurrentChannel, setPrivateChannel } from "../../actions";

class Channels extends Component {
  state = {
    activeChannel: "",
    typingRef: firebase.database().ref("typing"),
    channels: [],
    user: this.props.currentUser,
    channel: null,
    isModal: false,
    channelName: "",
    channelDetails: "",
    channelRef: firebase.database().ref("channels"),
    messagesRef: firebase.database().ref("messages"),
    notifications: [],
    firstLoad: true,
  };

  componentDidMount() {
    this.addListener();
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    this.state.channelRef.off();
  };

  addListener = () => {
    let loadedChannels = [];
    const { channelRef } = this.state;
    channelRef.on("child_added", (snap) => {
      loadedChannels.push(snap.val());
      this.setState({ channels: loadedChannels }, () => this.setFirstChannel());
      this.addNotificationListener(snap.key);
    });
  };

  addNotificationListener = (channelId) => {
    const { messagesRef } = this.state;
    messagesRef.child(channelId).on("value", (snap) => {
      const { channel, notifications } = this.state;
      if (channel) {
        this.handleNotifications(channelId, channel.id, notifications, snap);
      }
    });
  };

  handleNotifications = (channelId, currentChannelId, notifications, snap) => {
    let lastTotal = 0;

    let index = notifications.findIndex(
      (notification) => notification.id === channelId
    );

    if (index !== -1) {
      if (channelId !== currentChannelId) {
        lastTotal = notifications[index].total;

        if (snap.numChildren() - lastTotal > 0) {
          notifications[index].count = snap.numChildren() - lastTotal;
        }
      }
      notifications[index].lastKnownTotal = snap.numChildren();
    } else {
      notifications.push({
        id: channelId,
        total: snap.numChildren(),
        lastKnownTotal: snap.numChildren(),
        count: 0,
      });
    }

    this.setState({ notifications });
  };

  setFirstChannel = () => {
    const { firstLoad, channels } = this.state;
    const { setCurrentChannel } = this.props;
    const firstChannel = channels[0];
    if (firstLoad && channels.length > 0) {
      setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
      this.setState({ channel: firstChannel });
    }

    this.setState({ firstLoad: false });
  };

  closeModal = () => this.setState({ isModal: !this.state.isModal });

  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  addChannel = () => {
    const { channelRef, channelName, channelDetails, user } = this.state;

    const key = channelRef.push().key;

    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    channelRef
      .child(key)
      .update(newChannel)
      .then(() => {
        this.setState({ channelName: "", channelDetails: "" });
        this.closeModal();
      })
      .catch((error) => console.error(error));
  };

  handleSubmit = (event) => {
    event.preventDefault();

    if (this.isFormValid(this.state)) {
      this.addChannel();
    }
  };

  isFormValid = ({ channelDetails, channelName }) =>
    channelName && channelDetails;

  openModal = () => this.setState({ isModal: !this.state.isModal });

  getNotificationCount = (channel) => {
    let count = 0;

    const { notifications } = this.state;

    notifications.forEach((notification) => {
      if (notification.id === channel.id) {
        count = notification.count;
      }
    });

    if (count > 0) return count;
  };

  displayChannels = (channels) =>
    channels.length > 0 &&
    channels.map((channel) => (
      <Menu.Item
        key={channel.id}
        onClick={() => this.changeChannel(channel)}
        name={channel.name}
        style={{ opacity: 0.7 }}
        active={channel.id === this.state.activeChannel}
      >
        {this.getNotificationCount(channel) && (
          <Label color="red">{this.getNotificationCount(channel)}</Label>
        )}
        # {channel.name}
      </Menu.Item>
    ));

  changeChannel = (channel) => {
    const { setCurrentChannel, setPrivateChannel } = this.props;
    const { typingRef, user } = this.state;
    this.setActiveChannel(channel);
    typingRef.child(this.state.channel.id).child(user.uid).remove();
    this.clearNotifications();
    setCurrentChannel(channel);
    setPrivateChannel(false);
    this.setState({ channel });
  };

  clearNotifications = () => {
    const { notifications, channel } = this.state;
    let index = notifications.findIndex(
      (notification) => notification.id === channel.id
    );

    if (index !== -1) {
      const { notifications } = this.state;
      let updateNotifications = [...notifications];
      updateNotifications[index].total = notifications[index].lastKnownTotal;
      updateNotifications[index].count = 0;

      this.setState({ notifications: updateNotifications });
    }
  };

  setActiveChannel = (channel) => {
    this.setState({ activeChannel: channel.id });
  };

  render() {
    const { channels, isModal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" /> CHANNELS
            </span>{" "}
            ({channels.length}) <Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>
        <Modal basic open={isModal} onClose={this.closeModal}>
          <Modal.Header>Add a channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>

          <ModalActions>
            <Button color="green" inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> add
            </Button>
            <Button color="red" inverted>
              <Icon name="remove" /> Cancel
            </Button>
          </ModalActions>
        </Modal>
      </React.Fragment>
    );
  }
}

export default connect(null, { setCurrentChannel, setPrivateChannel })(
  Channels
);

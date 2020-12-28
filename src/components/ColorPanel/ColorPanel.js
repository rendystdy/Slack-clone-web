import React, { Component } from "react";
import {
  Sidebar,
  Menu,
  Divider,
  Button,
  Modal,
  Icon,
  Label,
  Segment,
} from "semantic-ui-react";
import { SliderPicker } from "react-color";
import { connect } from "react-redux";

import { setColors } from "../../actions";
import firebase from "../../firebase";

class ColorPanel extends Component {
  state = {
    modal: false,
    primary: "",
    secondary: "",
    usersRef: firebase.database().ref("users"),
    user: this.props.currentUser,
    userColors: [],
  };

  componentDidMount() {
    const { user } = this.state;

    if (user) {
      this.addListener(user.uid);
    }
  }

  componentWillUnmount() {
    this.removeListener();
  }

  removeListener = () => {
    const { usersRef, user } = this.state;

    usersRef.child(`${user.uid}/colors`).off();
  };

  addListener = (userId) => {
    let userColors = [];
    const { usersRef } = this.state;

    usersRef.child(`${userId}/colors`).on("child_added", (snap) => {
      userColors.unshift(snap.val());

      this.setState({ userColors });
    });
  };

  openModal = () => this.setState({ modal: !this.state.modal });

  closeModal = () => this.setState({ modal: !this.state.modal });

  handleChangePrimary = (color) => this.setState({ primary: color.hex });

  handleChangeSecondary = (color) => this.setState({ secondary: color.hex });

  handleSaveColor = () => {
    const { primary, secondary } = this.state;

    if (primary && secondary) {
      this.saveColors(primary, secondary);
    }
  };

  saveColors = (primary, secondary) => {
    const { usersRef, user } = this.state;

    usersRef
      .child(`${user.uid}/colors`)
      .push()
      .update({
        primary,
        secondary,
      })
      .then(() => {
        console.log("color added");
        this.closeModal();
      })
      .catch((err) => console.error(err));
  };

  displayUserColors = (colors) =>
    colors.length > 0 &&
    colors.map((color, i) => (
      <React.Fragment key={i}>
        <Divider />
        <div
          className="color__container"
          onClick={() => this.props.setColors(color.primary, color.secondary)}
        >
          <div
            className="color__square"
            style={{ backgroundColor: color.primary }}
          >
            <div
              className="color__overlay"
              style={{ backgroundColor: color.secondary }}
            ></div>
          </div>
        </div>
      </React.Fragment>
    ));

  render() {
    const { modal, primary, secondary, userColors } = this.state;
    return (
      <Sidebar
        as={Menu}
        icon="labeled"
        inverted
        vertical
        visible
        width="very thin"
      >
        <Divider />
        <Button icon="add" size="small" color="blue" onClick={this.openModal} />
        {this.displayUserColors(userColors)}

        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Choose App colors</Modal.Header>
          <Modal.Content>
            <Segment inverted>
              <Label content="Primary color" />
              <SliderPicker
                color={primary}
                onChange={this.handleChangePrimary}
              />
            </Segment>

            <Segment inverted>
              <Label content="Secondary color" />
              <SliderPicker
                color={secondary}
                onChange={this.handleChangeSecondary}
              />
            </Segment>
          </Modal.Content>
          <Modal.Actions>
            <Button onClick={this.handleSaveColor} color="green" inverted>
              <Icon name="checkmark" /> Save color
            </Button>
            <Button onClick={this.closeModal} color="red" inverted>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </Sidebar>
    );
  }
}

export default connect(null, { setColors })(ColorPanel);

import React, { Component } from "react";
import {
  Grid,
  Header,
  Icon,
  Dropdown,
  Image,
  Modal,
  Input,
  Button,
} from "semantic-ui-react";
import AvatarEditor from "react-avatar-editor";
import firebase from "../../firebase";

class UserPanel extends Component {
  state = {
    user: this.props.currentUser,
    modal: false,
    previewImage: "",
    croppedImage: "",
    blob: "",
    updloadCroppedImage: "",
    storageRef: firebase.storage().ref(),
    userRef: firebase.auth().currentUser,
    usersRef: firebase.database().ref("users"),
    metadata: {
      contentType: "image/jpeg",
    },
  };

  openModal = () => this.setState({ modal: !this.state.modal });

  closeModal = () => this.setState({ modal: !this.state.modal });

  dropDownOtions = () => [
    {
      key: "user",
      text: (
        <span>
          Signed in as <strong>{this.state.user.displayName}</strong>
        </span>
      ),
      disabled: true,
    },
    {
      key: "avatar",
      text: <span onClick={this.openModal}>Change Avatar</span>,
    },
    {
      key: "signout",
      text: <span onClick={this.handleSignOut}>Sign Out</span>,
    },
  ];

  handleSignOut = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        console.log("SIGNOUT SUCCESS");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  handleChange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    if (file) {
      reader.readAsDataURL(file);
      reader.addEventListener("load", () => {
        this.setState({ previewImage: reader.result });
      });
    }
  };

  handleCropImage = () => {
    if (this.avatarEditor) {
      this.avatarEditor.getImageScaledToCanvas().toBlob((blob) => {
        let imageUrl = URL.createObjectURL(blob);

        this.setState({
          croppedImage: imageUrl,
          blob,
        });
      });
    }
  };

  updloadCroppedImage = () => {
    const { storageRef, userRef, blob, metadata } = this.state;
    storageRef
      .child(`avatars/user-${userRef.uid}`)
      .put(blob, metadata)
      .then((snap) => {
        snap.ref.getDownloadURL().then((downloadUrl) => {
          this.setState({ updloadCroppedImage: downloadUrl }, () =>
            this.changeAvatar()
          );
        });
      });
  };

  changeAvatar = () => {
    const { userRef, updloadCroppedImage, usersRef, user } = this.state;

    userRef
      .updateProfile({
        photoURL: updloadCroppedImage,
      })
      .then(() => {
        console.log("Photo updated");
        this.closeModal();
      })
      .catch((err) => console.error(err));

    usersRef
      .child(user.uid)
      .update({
        avatar: this.state.updloadCroppedImage,
      })
      .then(() => {
        console.log("User avatar updated");
      })
      .catch((err) => console.error(err));
  };

  render() {
    const { user, modal, previewImage, croppedImage } = this.state;
    const { primaryColor } = this.props;
    return (
      <Grid style={{ background: primaryColor }}>
        <Grid.Column>
          <Grid.Row style={{ padding: "1.2em", margin: 0 }}>
            {/* App Header */}
            <Header inverted floated="left" as="h2">
              <Icon name="code" />
              <Header.Content>DevChat</Header.Content>
            </Header>
            {/* User Dropdown */}
            <Header
              floated="left"
              as="h4"
              style={{ padding: "0.25em" }}
              inverted
            >
              <Dropdown
                trigger={
                  <span>
                    <Image src={user.photoURL} spaced="right" avatar />
                    {user.displayName}
                  </span>
                }
                options={this.dropDownOtions()}
              />
            </Header>
          </Grid.Row>

          <Modal basic open={modal} onClose={this.closeModal}>
            <Modal.Header>Change Avatar</Modal.Header>
            <Modal.Content>
              <Input
                onChange={this.handleChange}
                fluid
                type="file"
                label="New Avatar"
                name="previewImage"
              />
              <Grid centered stackable columns={2}>
                <Grid.Row centered>
                  <Grid.Column className="ui center aligned grid">
                    {previewImage && (
                      <AvatarEditor
                        ref={(node) => (this.avatarEditor = node)}
                        image={previewImage}
                        width={120}
                        height={120}
                        border={50}
                        scale={1.2}
                      />
                    )}
                  </Grid.Column>
                  <Grid.Column>
                    {croppedImage && (
                      <Image
                        style={{ margin: "3.5em auto" }}
                        width={100}
                        height={100}
                        src={croppedImage}
                      />
                    )}
                  </Grid.Column>
                </Grid.Row>
              </Grid>
            </Modal.Content>
            <Modal.Actions>
              {croppedImage && (
                <Button
                  color="green"
                  inverted
                  onClick={this.updloadCroppedImage}
                >
                  <Icon name="save" /> Change Avatar
                </Button>
              )}
              <Button color="green" inverted onClick={this.handleCropImage}>
                <Icon name="image" /> Preview
              </Button>
              <Button color="red" inverted onClick={this.closeModal}>
                <Icon name="remove" /> Cancel
              </Button>
            </Modal.Actions>
          </Modal>
        </Grid.Column>
      </Grid>
    );
  }
}

export default UserPanel;

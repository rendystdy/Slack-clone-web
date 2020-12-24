import React, { Component } from "react";
import { Segment, Button, Input } from "semantic-ui-react";
import { v4 as uuidv4 } from "uuid";

import firebase from "../../firebase";
import FileModal from "./FileModal";
import ProgressBar from "./ProgressBar";

export class MessagesForm extends Component {
  state = {
    storageRef: firebase.storage().ref(),
    uploadTask: null,
    uploadState: "",
    message: "",
    loading: false,
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    errors: [],
    modal: false,
    percentUploaded: 0,
  };

  openModal = () => this.setState({ modal: !this.state.modal });

  closeModal = () => this.setState({ modal: !this.state.modal });

  handleOnChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  createMessage = (fileUrl = null) => {
    const { user } = this.state;
    const message = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL,
      },
    };

    if (fileUrl !== null) {
      message["image"] = fileUrl;
    } else {
      message["content"] = this.state.message;
    }

    return message;
  };

  sendMessage = () => {
    const { messagesRef, getMessagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      getMessagesRef()
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({ loading: false, message: "", errors: [] });
        })
        .catch((err) => {
          const { errors } = this.state;
          console.error(err);
          this.setState({
            loading: false,
            errors: errors.concat(err),
          });
        });
    } else {
      const { errors } = this.state;
      this.setState({
        errors: errors.concat({ message: "Add a message" }),
      });
    }
  };

  getPath = () => {
    const { isPrivateChannel } = this.props;
    const { channel } = this.state;
    if (isPrivateChannel) {
      return `chat/private-${channel.id}`;
    } else {
      return `chat/public`;
    }
  };

  updloadFile = (file, metadata) => {
    const { channel, storageRef } = this.state;
    const { messagesRef, getMessagesRef } = this.props;
    const pathToUpload = channel.id;
    const ref = getMessagesRef();
    const filePath = `${this.getPath()}/${uuidv4()}.jpg`;

    this.setState(
      {
        uploadState: "uploading",
        uploadTask: storageRef.child(filePath).put(file, metadata),
      },
      () => {
        const { uploadTask } = this.state;
        uploadTask.on(
          "state_changed",
          (snap) => {
            const { isProgressBarVisible } = this.props;
            const percentUploaded = Math.round(
              (snap.bytesTransferred / snap.totalBytes) * 100
            );
            isProgressBarVisible(percentUploaded);
            this.setState({
              percentUploaded,
            });
          },
          (err) => {
            console.error(err);
            const { errors } = this.state;
            this.setState({
              errors: errors.concat(err),
              uploadState: "error",
              uploadTask: null,
            });
          },
          () => {
            const { uploadTask } = this.state;
            uploadTask.snapshot.ref
              .getDownloadURL()
              .then((downloadURL) => {
                this.sendFileMessage(downloadURL, ref, pathToUpload);
              })
              .catch((err) => {
                console.error(err);
                const { errors } = this.state;
                this.setState({
                  errors: errors.concat(err),
                  uploadState: "error",
                  uploadTask: null,
                });
              });
          }
        );
      }
    );
  };

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref
      .child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({
          uploadState: "done",
        });
      })
      .catch((err) => {
        const { errors } = this.state;
        console.error(err);
        this.setState({
          errors: errors.concat(err),
        });
      });
  };

  render() {
    const {
      errors,
      message,
      loading,
      modal,
      uploadState,
      percentUploaded,
    } = this.state;
    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          style={{ marginBottom: "0.7em" }}
          label={<Button icon="add" />}
          labelPosition="left"
          className={
            errors.some((error) => error.message.includes("message"))
              ? "error"
              : ""
          }
          onChange={this.handleOnChange}
          placeholder="write your message"
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            disabled={loading}
            onClick={this.sendMessage}
            content="Add Reply"
            labelPosition="left"
            icon="edit"
          />
          <Button
            color="teal"
            disabled={uploadState === "uploading"}
            onClick={this.openModal}
            content="Upload Media"
            labelPosition="right"
            icon="cloud upload"
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          updloadFile={this.updloadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessagesForm;

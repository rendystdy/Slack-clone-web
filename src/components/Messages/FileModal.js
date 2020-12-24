import React, { Component } from "react";
import mime from "mime-types";
import { Modal, Input, Icon, Button } from "semantic-ui-react";

class FileModal extends Component {
  state = {
    file: null,
    authorized: ["image/jpeg", "image/png"],
  };

  addFile = (event) => {
    const file = event.target.files[0];
    if (file) {
      this.setState({ file: file });
    }
  };

  sendFile = () => {
    const { file } = this.state;
    const { updloadFile, closeModal } = this.props;

    if (file !== null) {
      if (this.isAuthirized(file.name)) {
        // send file
        const metadata = { contentType: mime.lookup(file.name) };
        updloadFile(file, metadata);
        closeModal();
        this.clearFile();
      }
    }
  };

  clearFile = () => this.setState({ file: null });

  isAuthirized = (fileName) =>
    this.state.authorized.includes(mime.lookup(fileName));

  render() {
    const { modal, closeModal } = this.props;
    return (
      <Modal basic open={modal} onClose={closeModal}>
        <Modal.Header>Select an Image File</Modal.Header>
        <Modal.Content>
          <Input
            onChange={this.addFile}
            fluid
            label="File types: jpg, png"
            name="file"
            type="file"
          />
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.sendFile} color="green" inverted>
            <Icon name="checkmark" /> Send
          </Button>
          <Button onClick={closeModal} color="red" inverted>
            <Icon name="remove" /> Cancel
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default FileModal;

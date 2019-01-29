import React, { Component } from "react";
import {
  Input, Form, Button, Modal, Message
} from 'semantic-ui-react';
import autoBind from 'react-autobind';
import { toggleLoader, toggleLogin, fetchProjects, toggleLoginError, 
  updateUser, updateLocale, updateRegion,
} from '../reducers/action-index';
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    showLogin: state.ui.showLogin,
    showLoader: state.ui.showLoader,
    showLoginError: state.ui.showLoginError,
    projects: state.data.projects
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleLogin: showOrHide => dispatch(toggleLogin(showOrHide)),
    toggleLoader: showOrHide => dispatch(toggleLoader(showOrHide)),
    fetchProjects: projects => dispatch(fetchProjects(projects)),
    toggleLoginError: showOrHide => dispatch(toggleLoginError(showOrHide)),
    updateUser: username => dispatch(updateUser(username)),
    updateLocale: locale => dispatch(updateLocale(locale)),
    updateRegion: locale => dispatch(updateRegion(locale)),
  };
};

class Login extends Component {
  constructor() {
    super();
    this.state = {
      username: '',
      password: '',
    }
    autoBind(this);
  }

  login = (e) => {
    e.preventDefault();
    fetch("/api/auth", {
      method: 'POST',
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      }),
      headers: {
        Accept: 'application/json',
        "content-type": "application/json"
      }
    }).then(res => {
      if (res.ok) {
        this.setState({ password: "" });
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    }).then(json => {
      // console.log(json);
      if (json.username) {
        this.props.updateUser(json.username);
      }
      if (json.locale) {
        this.props.updateLocale(json.locale);
      }
      if (json.region) {
        this.props.updateRegion(json.region);
      }

      if (json.message === 'live') {
        this.props.toggleLogin(false);
        /* CRUD -> S */
        fetch("/api/projects", {
          method: 'POST',
          body: JSON.stringify({
            username: this.state.username,
            startDate: undefined,
            endDate: undefined
          }),
          headers: {
            Accept: 'application/json',
            "content-type": "application/json"
          }
        }).then(res => {
          if (res.ok) {
            return res.json();
          } else {
            throw new Error(res.statusText);
          }
        }).then(json => {
          this.props.fetchProjects(json);
        }).catch((err) => {
          // console.log(err);
        });
      } else if (json.message === "dead") {
        this.props.toggleLoginError(true);
        // console.log(json);
      }
    }).catch((err) => {
      // console.log(err);
    });
  }

  handlePswChange = (e) => {
    this.setState({ password: e.target.value });
  }

  handleUserChange = (e) => {
    this.setState({ username: e.target.value });
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  render() {
    return (
      <Modal open={this.props.showLogin}>
        <Modal.Header>Login</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Username</label>
              <input placeholder='Username' name='user' value={this.state.username} onChange={this.handleUserChange} />
            </Form.Field>
            <Form.Field>
              <label>Password</label>
              <Input type='password' name='psw' value={this.state.password} onChange={this.handlePswChange} />
            </Form.Field>
            <Button type='submit' onClick={this.login} >Submit</Button>
          </Form>
          <Message negative hidden={!this.props.showLoginError}>
            <Message.Header>The username or the password is incorrect.</Message.Header>
            <p>Please try it again.</p>
          </Message>
        </Modal.Content>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Login);
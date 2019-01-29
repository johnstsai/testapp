import React, { Component } from 'react';
import { Modal, Form, TextArea, Button } from 'semantic-ui-react';
import autoBind from 'react-autobind';
import { toggleAdmin } from '../reducers/action-index';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        showAdmin: state.ui.showAdmin
    };
};

const mapDispatchToProps = dispatch => {
    return {
        toggleAdmin: showOrHide => dispatch(toggleAdmin(showOrHide))
    };
};

class Admin extends Component {

    constructor() {
        super();
        this.state = {
            projectString: '',
            domainString: ''
        };
        autoBind(this);
    }

    componentDidMount() {
        fetch('/api/settings', {
            method: 'GET'
        }).then(res => {
            return res.json();
        }).then(json => {
            const projects = json.find(setting => {
                return setting.key === 'projects';
            });
            const domains = json.find(setting => {
                return setting.key === 'domains';
            });
            this.setState({
                projectString: projects.value.join('\n'),
                domainString: domains.value.join('\n')
            });
        }).catch((err) => {
            console.error(err);
        });
    }

    changeProjectValue(event) {
        this.setState({ projectString: event.target.value });
    }

    changeDomainValue(event) {
        this.setState({ domainString: event.target.value });
    }

    close() {
        this.props.toggleAdmin(false);
    }

    submit() {
        fetch('/api/settings', {
            method: 'POST',
            body: JSON.stringify({
                'projects': this.state.projectString.split('\n'),
                'domains': this.state.domainString.split('\n')
            }),
            headers: {
                Accept: 'application/json',
                'content-type': 'application/json'
            }
        }).then(res => {
            if (res.ok) {
                return res.json();
            } else {
                throw new Error(res.statusText);
            }
        }).then(json => {
            this.props.toggleAdmin(false);
            // console.log(json);
        }).catch((err) => {
            console.error(err);
        });
    }
    render() {
        return (<Modal open={this.props.showAdmin}>
            <Modal.Header>Admin</Modal.Header>
            <Modal.Content>
                <Form>
                    <Form.Field
                        control={TextArea}
                        label='Project Setting'
                        row={10}
                        placeholder='Set the project...'
                        value={this.state.projectString}
                        onChange={this.changeProjectValue}
                    />
                    <Form.Field
                        control={TextArea}
                        label='Domain Setting'
                        row={10}
                        placeholder='Set the domain...'
                        value={this.state.domainString}
                        onChange={this.changeDomainValue}
                    />
                    <Button
                        onClick={this.close}
                        negative
                        content='Cancel'
                    />
                    <Button
                        onClick={this.submit}
                        positive
                        content='Submit'
                    />
                </Form>
            </Modal.Content>
        </Modal>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Admin);
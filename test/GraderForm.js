import React, { Component } from 'react';
import {
    Form, Button
} from 'semantic-ui-react';

// Not used
export default class Login extends Component {

    render() {
        return (
            <Form>
                <Form.Group>
                    <Form.Input label='First name' placeholder='First Name' width={6} />
                    <Form.Input label='Middle Name' placeholder='Middle Name' width={4} />
                    <Form.Input label='Last Name' placeholder='Last Name' width={6} />
                </Form.Group>
                <Form.Group>
                    <Form.Input placeholder='2 Wide' width={2} />
                    <Form.Input placeholder='12 Wide' width={12} />
                    <Form.Input placeholder='2 Wide' width={2} />
                </Form.Group>
                <Form.Group>
                    <Form.Input placeholder='8 Wide' width={8} />
                    <Form.Input placeholder='6 Wide' width={6} />
                    <Form.Input placeholder='2 Wide' width={2} />
                </Form.Group>
                <Form.Field control={Button}>Submit</Form.Field>
            </Form>);
    }
}
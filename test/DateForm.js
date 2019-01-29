import {
  // DateInput,
  // TimeInput,
  // DateTimeInput,
  DatesRangeInput
} from 'semantic-ui-calendar-react';
import React, { Component } from "react";
import {
  Form
} from 'semantic-ui-react';
import { fetchProjects } from '../reducers/action-index';
import { connect } from "react-redux";
import autoBind from 'react-autobind';

const mapStateToProps = state => {
  return {
    projects: state.data.projects,
    username: state.data.username
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchProjects: projects => dispatch(fetchProjects(projects)),
  };
};

class DateForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      datesRange: '',
    };
    autoBind(this);
  }

  handleChange = (event, { name, value }) => {
    if (this.state.hasOwnProperty(name)) {
      this.setState({ [name]: value });
    }
    const pattern = /(\d\d-\d\d-\d\d\d\d) - (\d\d-\d\d-\d\d\d\d)/g;
    let queryDates = pattern.exec(value);
    if (queryDates !== null) {
      const from = queryDates[1];
      const to = queryDates[2];

      fetch("/api/projects", {
        method: 'POST',
        body: JSON.stringify({
          username: this.props.username,
          startDate: from,
          endDate: to
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
        // console.log(json); 
        this.props.fetchProjects(json);
      }).catch((err) => {
        // console.log(err);
      });
      console.log('from' + from);
      console.log('to' + to);
    }
  }

  render() {
    return (
      <Form>
        <DatesRangeInput
          name="datesRange"
          placeholder="From - To"
          value={this.state.datesRange}
          iconPosition="left"
          onChange={this.handleChange} />
      </Form>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DateForm);
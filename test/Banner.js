import React, { Component } from 'react';
import { Message } from 'semantic-ui-react';
import { toggleBanner } from '../reducers/action-index';
import { connect } from 'react-redux';

const mapStateToProps = state => {
    return {
        showBanner: state.ui.showBanner,
        bannerMsg: state.ui.bannerMsg
    };
};
  
const mapDispatchToProps = dispatch => {
    return {
        toggleBanner: showOrHide => dispatch(toggleBanner(showOrHide))
    };
};

class Banner extends Component {

    render() {
        return (
            <Message negative hidden={!this.props.showBanner}>
                <Message.Header>{this.props.bannerMsg}</Message.Header>
            </Message>);
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Banner);
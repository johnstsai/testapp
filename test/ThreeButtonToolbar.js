
import { Toolbar } from 'react-data-grid-addons';
import React from 'react';

export default class ThreeButtonToolbar extends Toolbar {
    onDeleteRow(e) {
        if (this.props.onDeleteRow !== null && this.props.onDeleteRow instanceof Function) {
            this.props.onDeleteRow(e);
        }
    }

    renderDeleteRowButton() {
        if (this.props.onDeleteRow) {
            return (<button type="button" className="btn" onClick={this.onDeleteRow.bind(this)}>
                {this.props.deleteRowButtonText}
            </button>);
        }
    }

    render() {
        return (
            <div className="react-grid-Toolbar">
                <div className="tools">
                    {this.renderAddRowButton()}
                    {this.renderDeleteRowButton()}
                    {this.renderToggleFilterButton()}
                </div>
            </div>);
    }
}
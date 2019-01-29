import React from "react";
import ReactDOM from "react-dom";
import ReactDataGrid from "react-data-grid";
import * as serviceWorker from './serviceWorker';
import { Toolbar } from 'react-data-grid-addons';
import ThreeButtonToolbar from './ThreeButtonToolbar';

const columns = [
  { key: "id", name: "ID", editable: true },
  { key: "title", name: "Title", editable: true },
  { key: "complete", name: "Complete", editable: true }
];

const rows = [
  { id: 0, title: "Task 1", complete: 20 },
  { id: 1, title: "Task 2", complete: 40 },
  { id: 2, title: "Task 3", complete: 60 }
];

class Example extends React.Component {
  state = { rows };

  onGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    this.setState(state => {
      const rows = state.rows.slice();
      for (let i = fromRow; i <= toRow; i++) {
        rows[i] = { ...rows[i], ...updated };
      }
      return { rows };
    });
  };

  handleAddRow = ({ newRowIndex }) => {
    this.addNewRow();
  };

  handleDeleteRow(e) {
    const originalRows = this.getRows();
    this.props.fetchProjects(originalRows.filter((_, i) => !this.state.selectedIndexes.includes(i)));
    const removeIds = originalRows.filter((_, i) => this.state.selectedIndexes.includes(i)).map(row => row._id);
    fetch("/api/remove-project", {
      method: 'DELETE',
      body: JSON.stringify({
        ids: removeIds
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
    }).catch((err) => {
      this.props.fetchProjects(originalRows);
    });

  }


  getRows = () => {
    return this.props.projects;
  };

  getSize = () => {
    return this.getRows().length;
  };

  rowGetter = (rowIdx) => {
    const rows = this.getRows();
    return rows[rowIdx];
  };

  render() {
    return (
      <ReactDataGrid
        columns={columns}
        rowGetter={i => this.state.rows[i]}
        rowsCount={3}
        onGridRowsUpdated={this.onGridRowsUpdated}
        enableCellSelect={true}
        cellRangeSelection={{
            onStart: args => console.log(rows),
            onUpdate: args => console.log(rows),
            onComplete: args => console.log(rows)
          }}
        toolbar={<ThreeButtonToolbar
        onAddRow={this.handleAddRow.bind(this)}
        onDeleteRow={this.handleDeleteRow.bind(this)}
        deleteRowButtonText="Delete">
        </ThreeButtonToolbar>}
      />
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<Example />, rootElement);

serviceWorker.unregister();

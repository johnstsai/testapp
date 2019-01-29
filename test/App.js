import React, { Component } from 'react';
import '../styles/App.css';
import 'semantic-ui-css/semantic.min.css';
import {
  Icon, Menu, Checkbox, Grid, Dropdown, Rail, Segment
} from 'semantic-ui-react';
import ReactDataGrid from 'react-data-grid';
import autoBind from 'react-autobind';
import update from 'immutability-helper';
import { Editors, Formatters } from 'react-data-grid-addons';
import ThreeButtonToolbar from './ThreeButtonToolbar';
import Banner from './Banner';
import Admin from './Admin';
import {
  toggleLoader, toggleLogin, fetchProjects,
  toggleLoginError, updateLocale, toggleBanner,
  updateBannerMSG, updateRegion, toggleAdmin
} from '../reducers/action-index';
import { connect } from 'react-redux';
import Login from './Login';
import moment from 'moment';
import DateForm from './DateForm';
import { locales, regions } from '../constants';
import { stat } from 'fs';
const { AutoComplete: AutoCompleteEditor, DropDownEditor } = Editors;

const commonDuration = [
  { id: 0, title: '1:00' }, { id: 1, title: '1:30' },
  { id: 2, title: '2:00' }, { id: 3, title: '2:30' },
  { id: 4, title: '3:00' }, { id: 5, title: '3:30' },
  { id: 6, title: '4:00' }, { id: 7, title: '4:30' },
  { id: 8, title: '5:00' }, { id: 9, title: '5:30' },
  { id: 10, title: '6:00' }, { id: 11, title: '6:30' },
  { id: 12, title: '7:00' }, { id: 13, title: '7:30' },
  { id: 14, title: '8:00' }
];
const DurationEditor = <AutoCompleteEditor options={commonDuration} />;

const mapStateToProps = state => {
  return {
    showLogin: state.ui.showLogin,
    showLoader: state.ui.showLoader,
    projects: state.data.projects,
    username: state.data.username,
    locale: state.data.locale,
    region: state.data.region,
    showAdmin: state.ui.showAdmin,
    totalHours: state.data.totalHours,
    totalUtterances: state.data.totalUtterances,
    shouldShowWarningColor: state.data.shouldShowWarningColor
  };
};

const mapDispatchToProps = dispatch => {
  return {
    toggleLogin: showOrHide => dispatch(toggleLogin(showOrHide)),
    toggleLoader: showOrHide => dispatch(toggleLoader(showOrHide)),
    fetchProjects: projects => dispatch(fetchProjects(projects)),
    toggleLoginError: showOrHide => dispatch(toggleLoginError(showOrHide)),
    toggleBanner: showOrHide => dispatch(toggleBanner(showOrHide)),
    updateLocale: locale => dispatch(updateLocale(locale)),
    updateRegion: region => dispatch(updateRegion(region)),
    updateBannerMSG: msg => dispatch(updateBannerMSG(msg)),
    toggleAdmin: showOrHide => dispatch(toggleAdmin(showOrHide))
  };
};

class DateTimeFormatter extends React.Component {
  render() {
    return (
      <div>
        {moment(this.props.value).format('L')}
      </div>);
  }
}

class LinkFormatter extends React.Component {
  render() {
    return (
      <div style={{ "float": "right" }}>
        <a href={this.props.value}>{this.props.value}</a>
      </div>
    );
  }
}

class UtteranceFormatter extends React.Component {
  render() {
    const color = !isNaN(this.props.value) && this.props.value === 0 ? "Tomato" : null;
    return (
      <div style={{ "backgroundColor": color }}>{this.props.value}</div>
    );
  }
}

class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      localeOptions: locales.map(locale => { return { "key": locale, "value": locale, "text": locale } }),
      regionOptions: regions.map(locale => { return { "key": locale, "value": locale, "text": locale } }),
      rows: [],
      filters: {},
      selectedIndexes: [],
      content: '',
      checked: true,
      columns: [],
      shouldShowStats: false,
      insertIndex: 0
    };
    autoBind(this);
  };

  componentDidMount() {

    fetch('/api/settings', {
      method: 'GET'
    }).then(res => {
      return res.json();
    }).then(json => {
      
      const domains = json.find(setting => {
        return setting.key === 'domains';
      });
      const projects = json.find(setting => {
        return setting.key === 'projects';
      });
      const columns = [
        {
          key: 'date',
          name: 'Date',
          filterable: true,
          editable: true,
          // formatter: <DateTimeFormatter />,
          width: 100
        },
        {
          key: 'project',
          name: 'Project',
          editable: true,
          editor: <DropDownEditor options={projects.value} />,
          width: 200
        },
        {
          key: 'domain',
          name: 'Domain',
          editable: true,
          editor: <DropDownEditor options={domains.value} />,
          width: 100
        },
        {
          key: 'duration',
          name: 'Duration',
          editor: DurationEditor,
          width: 80
        },
        {
          key: 'utts',
          name: 'Utterance',
          editable: true,
          width: 80,
          formatter: <UtteranceFormatter />
        },
        {
          key: 'link',
          name: 'Link',
          editable: true,
          formatter: <LinkFormatter />
        },
        {
          key: 'comment',
          name: 'Comments',
          editable: true,
        }
      ];
      this.setState({ columns: columns });

    }).catch((err) => {
      console.error(err);
    });
  }

  handleLocaleDropdown = (e, { value }) => {
    this.props.updateLocale(value);
    /* CRUD -> U */
    fetch("/api/update-locale", {
      method: 'POST',
      body: JSON.stringify({
        username: this.props.username,
        locale: value,
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
      console.error(err);
    });
  };

  handleRegionDropdown = (e, { value }) => {
    this.props.updateRegion(value);
    fetch("/api/update-region", {
      method: 'POST',
      body: JSON.stringify({
        username: this.props.username,
        region: value
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
      console.error(err);
    });
  };

  handleGridSort = (sortColumn, sortDirection) => {
    this.setState({ sortColumn: sortColumn, sortDirection: sortDirection });
  };

  onClearFilters = () => {
    this.setState({ filters: {} });
  };

  logout = () => {
    fetch("/api/logout", {
      method: 'GET'
    }).then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error(res.statusText);
      }
    }).then(json => {
      if (json.message === 'logout') {
        this.setState({ selectedIndexes: [] });
        this.props.toggleLogin(true);
        this.props.toggleLoginError(false);
        this.props.updateLocale('');
        this.props.updateRegion('');
        this.props.fetchProjects([]);
      } else {
        // console.log(json);
      }
    }).catch((err) => {
      console.error(err);
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

  showMessage = (msg) => {
    this.props.toggleBanner(true);
    this.props.updateBannerMSG(msg);
    setTimeout(() => this.props.toggleBanner(false), 2000);
  }

  handleGridRowsUpdated = ({ fromRow, toRow, updated }) => {
    let rows = this.props.projects.slice();

    for (let property in updated) {
      const value = updated[property];
      if (property === "date") {
        if (!moment(value, "MM/DD/YYYY", true).isValid()) {
          this.showMessage("Invalid date format!! The accepted date format is MM/DD/YYYY");
          this.props.fetchProjects(rows);
          return;
        }
      } else if (property === "duration") {
        const re = new RegExp('^([0-9]|0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$');
        if (!re.test(value)) {
          this.showMessage("Invalid time format!! The accepted time format is HH:MM");
          this.props.fetchProjects(rows);
          return;
        }
      } else if (property === 'utts') {
        if (isNaN(Number(value))) {
          this.showMessage("Invalid input!! Please enter an number");
          this.props.fetchProjects(rows);
          return;
        }
      }
    }

    for (let i = fromRow; i <= toRow; i++) {
      let rowToUpdate = rows[i];
      let updatedRow = update(rowToUpdate, { $merge: updated });

      fetch("/api/update-project", {
        method: 'POST',
        body: JSON.stringify({
          username: this.props.username,
          data: updatedRow,
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
        // console.log(err);
        this.props.fetchProjects(rows);
      });
      rows[i] = updatedRow;
    }
    this.props.fetchProjects(rows);
  };
  // Not used
  handleFilterChange = (filter) => {
    let newFilters = Object.assign({}, this.state.filters);

    if (filter.filterTerm) {
      newFilters[filter.column.key] = filter;
    } else {
      delete newFilters[filter.column.key];
    }

    this.setState({ filters: newFilters });
  };

  onClearFilters = () => {
    this.setState({ filters: {} });
  };

  handleCellSelect = (e) => {
    this.setState({ "insertIndex": e.rowIdx })
  }

  addNewRow = () => {
    let rows = this.getRows().slice();
    /* CRUD -> C */
    fetch("/api/create-project", {
      method: 'POST',
      body: JSON.stringify({
        username: this.props.username,
        locale: this.props.locale
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
      json["value"] = rows.length;
      rows = update(rows, { $push: [json] });

      // add a new element
      // let rowsWithNewElement = update(rows, {$splice: [[1, 0, json]]});
      // for (var i = 0; i < rowsWithNewElement.length; i++) {
      //   rowsWithNewElement["value"] = i;
      // }
      // console.log(rowsWithNewElement);
      this.props.fetchProjects(rows);
      this.showMessage("The project name cannot be empty");
    }).catch((err) => {
      console.error(err);
    });
  }

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

  onRowsSelected = (rows) => {
    this.setState({ selectedIndexes: this.state.selectedIndexes.concat(rows.map(r => r.rowIdx)) });
  };

  onRowsDeselected = (rows) => {
    let rowIndexes = rows.map(r => r.rowIdx);
    this.setState({ selectedIndexes: this.state.selectedIndexes.filter(i => rowIndexes.indexOf(i) === -1) });
  };

  showSetting = () => {
    if (['dmurphy1', 'navneet_bhatia', 'john_appleseed', 'lucialu'].includes(this.props.username)) {
      this.props.toggleAdmin(true);
    }
  };

  handleKeyPress = (event) => {
    if (event.altKey) {
      if (event.charCode == 229) {
        event.preventDefault();
        this.addNewRow();
      }
    }
  }

  render() {

    return (
      <div onKeyPress={this.handleKeyPress}>
        <Menu size='massive'>
          <Menu.Item>
            <Icon size='large' name='coffee' />Breakfast
          </Menu.Item>
          <Menu.Menu position='right'>
            <Menu.Item>
              <Checkbox
                toggle
                checked={this.state.checked}
                onChange={this.logout}
                label='Logout'>
              </Checkbox>
            </Menu.Item>
            <Menu.Item
              onClick={this.showSetting}
              onMouseEnter={() => this.setState({ "shouldShowStats": true })}
              onMouseLeave={() => this.setState({ "shouldShowStats": false })}
            >
              <Icon name='user'
              />{this.props.username}
            </Menu.Item>
            <Menu.Item>
              <Dropdown
                compact
                placeholder='Locale'
                search
                selection
                options={this.state.localeOptions}
                value={this.props.locale}
                onChange={this.handleLocaleDropdown} />
            </Menu.Item>
            <Menu.Item>
              <Dropdown
                compact
                placeholder='Region'
                search
                selection
                options={this.state.regionOptions}
                value={this.props.region}
                onChange={this.handleRegionDropdown} />
            </Menu.Item>
          </Menu.Menu>
        </Menu>

        <Grid>
          <Grid.Column width={1}>
            <Login />
            <Admin />
          </Grid.Column>

          <Grid.Column width={14}>
            <Rail internal position='left' hidden={!this.state.shouldShowStats}>
              <Segment>Utterances: {this.props.totalUtterances}
                <div style={{ "backgroundColor": this.props.shouldShowWarningColor ? "Tomato" : null }}>
                  Hours: {this.props.totalHours}
                </div>
              </Segment>
            </Rail>
            <Banner />
            <ReactDataGrid
              enableCellSelect={true}
              columns={this.state.columns}
              rowGetter={this.rowGetter}
              rowsCount={this.props.projects.length}
              onCellSelected={this.handleCellSelect}
              minHeight={500}
              onGridRowsUpdated={this.handleGridRowsUpdated}
              rowSelection={{
                showCheckbox: true,
                enableShiftSelect: true,
                onRowsSelected: this.onRowsSelected,
                onRowsDeselected: this.onRowsDeselected,
                selectBy: {
                  indexes: this.state.selectedIndexes
                }
              }}
              toolbar={<ThreeButtonToolbar
                onAddRow={this.handleAddRow.bind(this)}
                onDeleteRow={this.handleDeleteRow.bind(this)}
                // enableFilter={true}
                deleteRowButtonText="Delete">
              </ThreeButtonToolbar>}
              onAddFilter={this.handleFilterChange}
              onClearFilters={this.onClearFilters}
            />
            <DateForm />
          </Grid.Column>
          <Grid.Column width={1}>
          </Grid.Column>
        </Grid>
      </div >
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
/**
 * Created by kay on 23/6/17.
 */

import React, {Component} from 'react';
import './css/App.css';
import {SAMPLE1, SAMPLE2} from './constants'
import OwnTable from './components/ownTable/index';
import axios from 'axios';
import PapaParse from 'papaparse';
import {URL, config, body} from './constants';

import defaultFile from './pivotCSVs/report-1497933424.csv';
// import defaultFile from './pivotCSVs/report-1497934353.csv';

class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            convertedJson: [],
            fromApi: [],
            loading: false
        };
    }

    componentDidMount() {
        // this.loadFromApi();
        let request = new XMLHttpRequest();
        request.open("GET", defaultFile, false);
        request.send(null);
        PapaParse.parse( request.response, {
            header: true,
            dynamicTyping: true,
            complete: (parsed) => {
                this.setState( {
                    convertedJson: parsed.data,
                    loading:false
                })
            }
        })
    }

    fileSelection = (e) => {
        this.setState({loading: true, convertedJson: 'empty'});
        PapaParse.parse( e.target.files[0], {
            header: true,
            dynamicTyping: true,
            complete: (parsed) => {
                this.setState( {
                    convertedJson: parsed.data,
                    loading:false
                })
            }
        })
    }

    loadFromApi = () => {
        this.setState({loading: true});
        axios.get('http://localhost:3005/table')
            .then( (response) => {
                this.setState({
                    fromApi: JSON.stringify(response.data),
                    loading: false
                });
            })
            .catch( (error) => {
                console.log("The error is : ", error);
            });
    }


    render() {
        return (
            <div>
                {/*<div className="App">*/}
                    {/*{*/}
                        {/*this.state.loading && <div className="loading">Processing please wait...</div>*/}

                    {/*}*/}
                    {/*<label htmlFor="csvToJson">Select a CSV file</label>*/}
                    {/*<input type="file" onChange={this.fileSelection} />*/}
                {/*</div>*/}
                    {/*<hr/>*/}
                <div className="App">
                    {
                        this.state.convertedJson.length ?
                            <OwnTable pivotData={this.state.convertedJson} /> : <OwnTable pivotData={SAMPLE1} />
                    }
                </div>
            </div>
        );
    }
}

export default App;

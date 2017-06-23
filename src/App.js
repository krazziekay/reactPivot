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


class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            convertedJson: [],
            loading: false
        };
    }

    componentDidMount() {
        // this.loadFromApi();
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
        axios.post( URL, body, config)
            .then( (response) => {
                console.log("reponse received" , response.data);
                this.setState({
                    convertedJson: response.data,
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
                <div className="App">
                    {
                        this.state.loading && <div className="loading">Processing please wait...</div>

                    }
                    <label htmlFor="csvToJson">Select a CSV file</label>
                    <input type="file" onChange={this.fileSelection} />
                </div>
                    <hr/>
                <div className="App">
                    <OwnTable pivotData={this.state.convertedJson.length > 0 ? this.state.convertedJson : SAMPLE1}/>
                    {/*<OwnTable pivotData={SAMPLE1}/>*/}
                </div>
            </div>
        );
    }
}

export default App;

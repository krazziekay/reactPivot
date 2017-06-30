/**
 * Created by kay on 23/6/17.
 */

import React, { Component } from 'react';
import ownPivot from './../../utils/pivot';
import axios from 'axios';
import columnWiseSort from '../../utils/columnWiseSort';

class OwnTable extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedField: '',
            data: [],
            optionFields: [],
            rowFields: [],
            columnFields: [],
            tableData: [],
            sortOrder: 1,
            selectedSortIndex: '',
            loading: false
        };
    }

    componentDidMount() {
        this.setState({
            data: this.props.pivotData,
            //Getting the properties of each object in the array
            optionFields: Object.keys(this.props.pivotData[0])
        }, () => {
            //Defining drag events
           this.handleDragEvents();
        });


    }

    componentWillReceiveProps(props) {
        if(props.pivotData === 'empty') {
            this.setState({
                data: [],
                optionFields: [],
                rowFields: [],
                columnFields: [],
                tableData: []
            });
            return;
        }
        this.setState({
            data: props.pivotData,
            //Getting the properties of each object in the array
            optionFields: Object.keys(props.pivotData[0])
        }, () => this.handleDragEvents() );
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    //These functions handle the drag and drop events of the fields
    handleDragEvents = () => {
        for( let i= 0; i < document.getElementsByClassName('field-items').length; i++) {
            document.getElementsByClassName('field-items')[i].addEventListener('drag', this.onDragEnter);
        }
        document.getElementById('optionFields').addEventListener('dragover', (e) => e.preventDefault() );
        document.getElementById('optionFields').addEventListener('drop', this.onDragLeave);
        document.getElementById('rowFields').addEventListener('dragover', (e) => e.preventDefault() );
        document.getElementById('rowFields').addEventListener('drop', this.onDragLeave);
        document.getElementById('columnFields').addEventListener('dragover', (e) => e.preventDefault());
        document.getElementById('columnFields').addEventListener('drop', this.onDragLeave);
    }

    onDragEnter = (e) => {
        e.dataTransfer.dropEffect = "copy";
        this.setState({
            selectedField: e.srcElement.innerHTML,
            selectedFieldId: e.srcElement.offsetParent.id
        });
    }

    onDragLeave = (e) => {
        if(e.toElement.id) {
            if(this.state.selectedFieldId === e.toElement.id) {
                return;
            }

            this.setState({
                [this.state.selectedFieldId]: [].concat( this.state[this.state.selectedFieldId].filter( field => field !== this.state.selectedField)),
                [e.toElement.id]: [].concat(this.state[e.toElement.id]).concat(this.state.selectedField)
            }, () => {
                for( let i= 0; i < document.getElementsByClassName('field-items').length; i++) {
                    document.getElementsByClassName('field-items')[i].addEventListener('drag', this.onDragEnter);
                }
            });
            this.setState({loading: true});
            this.updateTable();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1


    sortColumn = (index) => {
        this.setState({loading: true});
        let sortedData = columnWiseSort(this.state.tableData, index, this.state.sortOrder);
        this.setState({
            tableData: sortedData.data,
            sortOrder: sortedData.sortOrder,
            selectedSortIndex: index
        }, () => this.setState({loading: false}));
    }
    
    // This function pivots the actual unmanaged data
    updateTable = () => {
        axios.post('http://localhost:8080/api/pivot', {rowFields: this.state.rowFields, colFields: this.state.columnFields})
            .then( (result) => {
                this.setState({
                    tableData: result.data,
                    sortOrder: 0,
                    selectedSortIndex: ''
                } , () => this.setState({loading: false}) );
            })
            .catch( (error) => {
                this.setState({loading: false});
                console.log("Network connection error!");
            })
        //
        // let result = ownPivot(this.state.data, this.state.rowFields, this.state.columnFields, {});
        // this.setState({
        //     tableData: result//saving the pivoted table data here
        // }, () => console.log("Here", this.state.tableData));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1

    render() {
        return (
            <div>
                <div className="header">
                    <h3>Sample Pivot Table</h3>
                    {
                        this.state.loading && <div className="loading">Processing please wait...</div>
                    }
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <td>Fields</td>
                                <td id="optionFields" className="option-fields">
                                    {
                                        this.state.optionFields &&
                                        this.state.optionFields.map( (field, index) =>
                                            <span key={index} className="field-items" draggable="true" >{field}</span>
                                        )
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td>Count</td>
                                <td id="columnFields" className="column-fields">
                                    {
                                        this.state.columnFields &&
                                        this.state.columnFields.map( (field, index) =>
                                            <span key={index} className="field-items" draggable="true" >{field}</span>
                                        )
                                    }
                                </td>
                            </tr>

                            <tr>
                                <td id="rowFields" className="row-fields">
                                    {
                                        this.state.rowFields &&
                                        this.state.rowFields.map( (field, index) =>
                                            <span key={index} className="field-items" draggable="true" >{field}</span>
                                        )
                                    }
                                </td>

                                <td>
                                    {
                                        this.state.tableData.result ?
                                            <table className="table table-bordered med-font-size">
                                                <tbody>
                                                {//For the multiple rows in the column field
                                                    this.state.columnFields.map( (_, index) =>
                                                        <tr>
                                                            {
                                                                //The number of gaps in the column fields
                                                                this.state.rowFields && this.state.rowFields.map( (col, colIndex) =>
                                                                    <td className="colored-bg"></td>
                                                                )
                                                            }
                                                            {
                                                                //The multi-layer row-wise viewing of the column fields
                                                                this.state.tableData.columnHeaders && this.state.tableData.columnHeaders.map( (col, colIndex) =>
                                                                    <td className="pointer colored-bg" onClick={() => this.sortColumn(colIndex)}>
                                                                        {col[index]}
                                                                        { this.state.selectedSortIndex && this.state.selectedSortIndex === colIndex ?
                                                                            this.state.sortOrder === 0 ? <span className="order-indicator">ASC</span> : <span className="order-indicator">DES</span>
                                                                            : null }
                                                                        </td>
                                                                )
                                                            }
                                                        </tr>
                                                    )
                                                }

                                                {
                                                    this.state.tableData.rowHeaders ?
                                                        this.state.tableData.rowHeaders.map( (row, rowIndex) =>
                                                            <tr key={rowIndex}>
                                                                {
                                                                    //For the multiple columns in the row field
                                                                    this.state.rowFields && this.state.rowFields.map( (_, index) =>
                                                                        <td className="colored-bg">{row[index]}</td>
                                                                    )
                                                                }

                                                                {
                                                                    this.state.tableData.columnHeaders ?
                                                                        this.state.tableData.columnHeaders.map( (col, colIndex) =>
                                                                            <td>
                                                                                {
                                                                                    this.state.tableData.result[rowIndex][colIndex] ?
                                                                                        this.state.tableData.result[rowIndex][colIndex].length : ''
                                                                                }
                                                                                </td>
                                                                        ) : null
                                                                }
                                                            </tr>
                                                        ) : null
                                                }
                                                </tbody>
                                            </table>
                                            : <span>No Data selected yet</span>
                                    }
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default OwnTable;

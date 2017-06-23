/**
 * Created by kay on 23/6/17.
 */

import React, { Component } from 'react';
import ownPivot from './../../utils/pivot';

class OwnTable extends Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedField: '',
            data: [],
            optionFields: [],
            rowFields: [],
            columnFields: [],
            tableData: []
        };
    }

    componentDidMount() {
        console.log("Here is the data", this.props.pivotData);
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
            this.updateTable();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1

    // This function pivots the actual unmanaged data
    updateTable = () => {
        let result = ownPivot(this.state.data, this.state.rowFields, this.state.columnFields, {});
        this.setState({
            tableData: result//saving the pivoted table data here
        }, () => console.log("Here", this.state.tableData));
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////1

    render() {
        return (
            <div>
                <div className="header">
                    <h3>Sample Pivot Table</h3>

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
                                        this.state.tableData.length > 0 ?
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
                                                                this.state.tableData.columnHeaders && this.state.tableData.columnHeaders.map( (col) =>
                                                                    <td className="colored-bg">{col[index]}</td>
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
                                                                                    this.state.tableData[rowIndex][colIndex] ?
                                                                                        this.state.tableData[rowIndex][colIndex].length : ''
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

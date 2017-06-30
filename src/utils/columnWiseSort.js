/*
 * Created by kAy on 6/30/17.
 */

/*
    This function performs columnwise sorting of the pivot table
    @Params
    pivotData = the complete dataset of the pivot table
    index = the column index according to which sorting needs to be performed
    sortOrder = sorting order, ascending or descending, for toggling on each click
 */
let columnWiseSort = (pivotData, index, sortOrder) => {
    let tempArr = [];
    this.dynamicSort = (property) => {
        let sortOrder = 1;
        if(property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return (a,b) => {
            let result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
            return result * sortOrder;
        }
    };

    // Pulling the data i.e. count of the selected column of 'index'
    this.sort = () => {
        pivotData.rowHeaders.map( (row, rowIndex) => {
        tempArr.push(pivotData.result[rowIndex][index] ?
            {
                rows: row,
                count:pivotData.result[rowIndex][index].length,
                data: pivotData.result[rowIndex]
            }
            :
            {
                rows: row,
                count: 0,
                data: pivotData.result[rowIndex]
            });
        });

        if(sortOrder) {
            tempArr.sort( this.dynamicSort('count'));
            sortOrder = 0;
        }
        else {
            tempArr.sort( this.dynamicSort('-count'));
            sortOrder = 1;
        }
        this.sortedArray = {
            result: tempArr.map( (sortedData) => sortedData.data),
            rowHeaders: tempArr.map( (sortedRows) => sortedRows.rows),
            columnHeaders: pivotData.columnHeaders
        }
        return {
            data: this.sortedArray,
            sortOrder: sortOrder
        };
    }

    return this.sort();
}

export default columnWiseSort;
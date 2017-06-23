/**
 * Created by kay on 23/6/17.
 * This pivoting algorithm was used from json.pivot
 * https://github.com/z5h/json.pivot/blob/master/src/jp.js
 */

let jsonPivot = (function() {

    let SortedSet = (function () {

        function find(val, array, comparator) {
            let l = 0;
            let r = array.length - 1;
            let i;
            let compare;
            while (l <= r) {
                i = ((l + r) / 2) | 0;
                compare = comparator(array[i], val);
                if (compare < 0) {
                    l = i + 1;
                    continue;
                }
                if (compare > 0) {
                    r = i - 1;
                    continue;
                }
                return i;
            }
            return null;
        }

        let concat = (function(){
            let a = [];
            let c = a.concat;
            function concat(){
                return c.apply(a, arguments);
            }
            return concat;
        }());


        function insert(value, comparator, values) {
            let r = values.length - 1;
            if (r === -1) {
                return [value];
            }
            let l = 0;
            let i, compare;
            while (l <= r) {
                i = ((l + r) / 2) | 0;
                compare = comparator(values[i], value);
                if (compare < 0) {
                    //array[i] is less than our value
                    l = i + 1;

                } else if (compare > 0) {
                    r = i - 1;
                } else {
                    //already here
                    return values;
                }
            }
            if (comparator(values[i], value) < 0) {
                //insert after i
                return concat(values.slice(0, i + 1), [value], values.slice(i + 1));
            } else {
                //insert before i

                return concat(values.slice(0, i), [value], values.slice(i));
            }
        }

        function SortedSet(comparator) {
            this.comparator = comparator;
            this.values = [];
        }

        SortedSet.prototype.insert = function(value) {
            this.values = insert(value, this.comparator, this.values);
        };

        SortedSet.prototype.indexOf = function(value) {
            return find(value, this.values, this.comparator);
        };

        SortedSet.prototype.size = function() {
            return this.values.length;
        };

        return SortedSet;
    }());

    let Utils = {
        copyProperties : function(source, dest) {
            for (let k in source) {
                if (source.hasOwnProperty(k)) {
                    dest[k] = source[k];
                }
            }
        },
        isArray : function(testObject) {
            return testObject && !(testObject.propertyIsEnumerable('length'))
                && typeof testObject === 'object' && typeof testObject.length === 'number';
        },
        stringComparator : function(a, b) {
            if(!a || !b) {
                return null;
            }
            return a.localeCompare(b);
        },
        numberComparator : function(a, b) {
            if (a > b) {
                return 1;
            } else if (b > a) {
                return -1;
            } else {
                return 0;
            }
        },
        defaultComparator : function() {
            return 0;
        },
        makeComparator : function(fields, data, comparators) {
            let len = fields.length;
            let i;
            let c = [];
            for (i = 0; i < len; i++) {
                let entry = data[0][fields[i]];
                let entryType = typeof entry;
                if (typeof comparators[fields[i]] === 'function'){
                    c[i] = comparators[fields[i]];
                } else if (entryType === 'number') {
                    c[i] = this.numberComparator;
                } else if (entryType === 'string') {
                    c[i] = this.stringComparator;
                } else if (Utils.isArray(entry)) {
                    c[i] = this.defaultComparator;
                } else {
                    c[i] = this.defaultComparator;
                }
            }
            return function(a, b) {
                let v = 0;
                for (i = 0; i < len; i++) {
                    let field = fields[i];
                    v = c[i](a[field], b[field]);
                    if (v !== 0) {
                        return v;
                    }
                }
                return 0;
            }
        }
    };

    let pivot = (function() {

        let defaultOptions = {
            extractor : null,
            comparators : {}
        };

        function extractData(data, options) {
            let extractor = options.extractor;
            if (typeof extractor === 'function') {
                let extracted = [];
                let length = data.length;
                for (let i = 0; i < length; i++) {
                    extracted = extracted.concat(extractor(data[i]));
                }
                return extracted;
            } else {
                return data;
            }
        }

        function buildPivotResult(data, leftSet, topSet) {
            let len = data.length;
            let dat;
            let i;
            for (i = 0; i < len; i++) {
                dat = data[i];
                leftSet.insert(dat);
                topSet.insert(dat);
            }

            let result = [];
            result.length = leftSet.size();

            for (i = 0; i < len; i++) {
                dat = data[i];
                let rowIndex = leftSet.indexOf(dat);
                let colIndex = topSet.indexOf(dat);
                let row = result[rowIndex];
                if (row === undefined) {
                    row = [];
                    row.length = topSet.size();
                    result[rowIndex] = row;
                }
                let entry = row[colIndex];
                if (entry === undefined) {
                    row[colIndex] = [dat];
                } else {
                    entry.push(dat);
                }
            }
            return result;
        }

        function makeHeaders(data, fieldNames){
            let result = [];
            let dataLength = data.length;
            let namesLength = fieldNames.length;
            let i,j;
            for (i=0; i<dataLength; i++){
                let datum = data[i];
                let entry = [];
                for (j=0; j<namesLength; j++){
                    entry[j] = datum[fieldNames[j]];
                }
                result[i] = entry;
            }
            return result;
        }

        function pivotData(data, rowNames, columnNames, userOptions) {
            if (userOptions === undefined){
                userOptions = {};
            }
            let options = {};
            Utils.copyProperties(defaultOptions, options);
            if (userOptions) {
                Utils.copyProperties(userOptions, options);
            }

            let leftSet = new SortedSet(Utils.makeComparator(rowNames, data, options));
            let topSet = new SortedSet(Utils.makeComparator(columnNames, data, options));

            data = extractData(data, options);

            let result = buildPivotResult(data, leftSet, topSet);
            result.rowHeaders = makeHeaders(leftSet.values, rowNames);
            result.columnHeaders = makeHeaders(topSet.values, columnNames);
            return result;
        }

        return pivotData;
    }());

    return pivot;
})();

export default jsonPivot ;
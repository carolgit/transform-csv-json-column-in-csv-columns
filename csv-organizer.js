function isJson(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        console.log(e,str);
        return false;
    }
    return true;
}

class Organizer {
    static lines = 0;

    constructor() {

    }

    static readCSV(files) {
        Papa.parse(files[0], {
            worker: true,
            step: function (row) {
                console.log("Row:", row.data);
                AlgasFormatter.formatIrregularJsonColumn(row.data[2], row.data[0], row.data[1]);
                Organizer.lines = Organizer.lines + 1;
            },
            complete: function () {
                saveFile(jsonComplete);
                console.log("All done!");
            }
        });
    }
}

class AlgasFormatter{
    constructor(){

    }

    /**
     * 
     * @param {json string} jsoncolumnCurrentLineValue 
     */
    static formatIrregularJsonColumn(jsoncolumnCurrentLineValue, name, data) {
        if (isJson(jsoncolumnCurrentLineValue)) {
            let json = JSON.parse(jsoncolumnCurrentLineValue);
            json["name"]=name;
            json["date"]=data;
            valueExtractor(json);
        }
    }
}

var jsonComplete = [];
function valueExtractor(json){
    var flatJSON = jsonflatten(json, {}, '');
    jsonComplete.push(flatJSON);
}

function saveFile(json){
    var csv = Papa.unparse(json);
    var blob = new Blob([csv],{ type: "text/plain;charset=utf-8" });
    console.log("salvando...");
    saveAs(blob, "organized.csv");
}

function jsonflatten(object, jsonComplete, prefix) {
    Object.keys(object).map(key => {
        if (object[key] === null) {
            jsonComplete[prefix + key] = "";
        } else
        if (object[key] instanceof Array) {
            // addToList[prefix + key] = listToFlatString(object[key]);
            for (i in object[key]) {
                jsonflatten(object[key][i], jsonComplete, prefix + key + "." + i)
            }
        } else if (typeof object[key] == 'object' && !object[key].toLocaleDateString) {
            jsonflatten(object[key], jsonComplete, prefix + key + '.');
        } else {
            jsonComplete[prefix + key] = object[key];
        }
    });
    return jsonComplete;
}

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
                // console.log("Row:", row.data);
                AlgasFormatter.formatIrregularJsonColumn(row.data[2], Organizer.lines);
                Organizer.lines = Organizer.lines + 1;
            },
            complete: function () {
                addNulls();
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
    static formatIrregularJsonColumn(jsoncolumnCurrentLineValue, lines) {
        if (isJson(jsoncolumnCurrentLineValue)) {
            let json = JSON.parse(jsoncolumnCurrentLineValue);
            valueExtractor(json, lines);
        }
    }
}

var tempJson = {};
function valueExtractor(json, lines){
    let keys = Object.keys(json);
    for(var x=0; x< keys.length; x++){
        key = keys[x];
        if(json[key]["value"] != undefined){
            if(tempJson[key]!=undefined){
                tempJson[key].values.push(json[key]["value"]);
            }else{
                tempJson[key] = {line: lines,values:[json[key]["value"]]};
            }
        }else{
            valueExtractor(json[key], lines);  
        }
    }
}

function addNullAfter(key, qtde, json){
    var copy = Object.assign({}, json);
    if(qtde>0){
        var emptyArray = new Array(qtde);
        var concatedArray = copy[key].values.concat(emptyArray);
        copy[key].values = concatedArray;
    }
    return copy;
    
}

function addNullBefore(key, qtde, json){   
    var copy = Object.assign({}, json);
    if(qtde>0){
        var emptyArray = new Array(qtde);
        var concatedArray = emptyArray.concat(copy[key].values);
        copy[key].values = concatedArray;
    }
    return copy;
}

function addNulls(){
    var beforeJson = {};
    var afterJson = {};
    Object.keys(tempJson).forEach(function(key) {
        let size = tempJson[key].values.length -1;
        if(size!=Organizer.lines){
            current_line = tempJson[key].line;
            // let qtde_before = Math.abs(Organizer.lines - current_line);
            let qtde_before = current_line;
            let qtde_after = Math.abs(Organizer.lines -(qtde_before + size));
            // console.log(qtde_after,qtde_before, size ,Organizer.lines, (qtde_after+qtde_before+size));
            beforeJson = addNullBefore(key, qtde_before, tempJson);
            afterJson = addNullAfter(key, qtde_after, beforeJson);
            if((qtde_after+qtde_before+size)!=Organizer.lines){
                console.log("Não ISSO!", key);
            }
        }
    });

    saveFile(afterJson);
}


function saveFile(json){
    var keys = Object.keys(json);
    var values=[];
    var objvalues = Object.values(json).map(objval=>objval.values);
    var jsonFormated = {
        "fields": keys,
        "data": transpose(objvalues)
    };
    var csv = Papa.unparse(jsonFormated);
    var blob = new Blob([csv],{ type: "text/plain;charset=utf-8" });
    console.log("salvando...");
    saveAs(blob, "organized.csv");
}

function transpose(a) {
    return Object.keys(a[0]).map(function(c) {
        return a.map(function(r) { return r[c]; });
    });
}
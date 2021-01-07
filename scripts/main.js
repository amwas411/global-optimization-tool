/*function DefaultFunc(x1,x2) {
    return 18 * x1 * x1 - 18 * x1 - 12 * x1 * x2 + 8 * x2 * x2 - 12 * x2;
}
function BillsFunc(x1,x2) {
    let c=[1.5,2.25,2.625];
    let sum=0.;
    for (let i = 0 ; i < 3; i++) {
        sum+=(c[i]-x1*(1-Math.pow(x2,i)))*(c[i]-x1*(1-Math.pow(x2,i)));
    }
    return sum;
}
function VittesFunc(x1,x2) {
    let e = Math.exp(20*(x2-x1));
    let o = Math.pow(10,-4)*(x1-3)*(x1-3)-(x2-x1);
    return o+e;
}
function RosenbrockFunc(x1,x2){
    return 100*(x2 - x1^2)^2 + (1 - x1)^2;
}*/
function IntitializeStartPoint(startPoint){
    var x = {x1:0,x2:0,x3:0,x4:0,x5:0,x6:0,x7:0,x8:0,x9:0};
    let i = 0;
    for (const property in x) {
        x[property] = startPoint[i];
        i++;
        if (i >= DIM){
            break;
        }
    }
    return x;
}
function HookeJeeves (x,maxIter,f) {
    var checkedPoints = [];
    checkedPoints.push(Object.values(x).slice(0,DIM));
    var y = f.evaluate(x);
    var functionIterations = 1;
    var methodIterations = 0;
    var d = 1;
    var eps = 1e-2;

    while ((d > eps) && (methodIterations < maxIter)) {
        let fl=false;
        let i = 0;
        for (const property in x) {
            let xi = x[property];
            
            let sign = 1;
            //j<2 to check left and right 
            for (let j = 0; j<2;j++) {   
                if (j!==0) {
                    sign=-1;
                }
                xi=xi+sign*d;
                x[property] = xi;
                let fX=f.evaluate(x);
                functionIterations++;
                if (fX < y){
                    y=fX;
                    fl=true;
                    checkedPoints.push(Object.values(x).slice(0,DIM));
                }
                else{
                    xi=xi-sign*d;
                    x[property] = xi;
                }
            }           
            i++;
            if (i >= DIM){
                break;
            }
        }

        if (fl===false){
            d=d/2;
        }
        methodIterations++;
    }
    return [checkedPoints,methodIterations,functionIterations,y];
}
function GetProbability(E,T){
    return Math.exp(-E/T);
}
function MakeChange(probability){
    let val = Math.random();
    let a=false;
    if (val < probability + 1e-8){
        a=true;
    }
    return a;
}
function DecreaseTemperature(T,i){
    return T*0.1/i;
}
function GetRandomBetween(min, max) {
    return Math.random() * (max - min) + min;
}
function SimulatedAnnealing(initialTemperature,endT,maxIter,x,f,lowerBound,upperBound){
    var checkedPoints = [];
    checkedPoints.push(Object.values(x).slice(0,DIM));
    let functionIterations = 1;
    let candidateEnergy, p;
    let T=initialTemperature, currentEnergy=f.evaluate(x);
    for (var methodIterations = 0; methodIterations<maxIter;methodIterations++) {  
        let i = 0;
        for (const property in x) {
            x[property]=GetRandomBetween(lowerBound, upperBound);
            i++;
            if (i >= DIM){
                break;
            }
        }
        candidateEnergy = f.evaluate(x);
        functionIterations++;
        if (candidateEnergy<currentEnergy-1e-8){
            currentEnergy=candidateEnergy;
            checkedPoints.push(Object.values(x).slice(0,DIM));
        }
        else {
            p=GetProbability(candidateEnergy-currentEnergy,T);
            if (MakeChange(p)===true){
                currentEnergy=candidateEnergy;
                checkedPoints.push(Object.values(x).slice(0,DIM));
            }
        }
        T=DecreaseTemperature(initialTemperature,methodIterations);
        if (T < endT+1e-8){
            break;
        }
    }
    return [checkedPoints,methodIterations,functionIterations,currentEnergy];
}
/*function GetAxisBounds(x0,y0,x1,y1){
    let eps=1e-8;
    let shiftingValue = 3;
    let lowerX,upperX,lowerY,upperY;
    if (x1 < x0 + eps){
        lowerX = x1-shiftingValue;
        upperX = x0+shiftingValue;
    }
    else{
        lowerX =x0-shiftingValue;
        upperX = x1+shiftingValue;
    }
    if (y1 < y0+eps){ 
        lowerY = y1-shiftingValue;
        upperY = y0+shiftingValue;
    }
    else{
        lowerY = y0-shiftingValue;
        upperY = y1+shiftingValue;
    }
    return [lowerX,upperX,lowerY,upperY];
}*/
function GetNumbersBetween(lowerBound,upperBound,N){
    var range = new Array(N);
    var step = Math.abs((upperBound-lowerBound))/N;
    var idx = 0;
    for (let i = lowerBound; i < upperBound - 1e-8; i+=step) {
        range[idx] = i;
        idx++;
    }
    return range;
}
function CoordsForContour(lowerBound,upperBound,objectiveFunction,checkedPoints){
    var N = 200; //quantity
    var X = [];
    for (let i = 0; i < DIM; i++) {
        let Xi = GetNumbersBetween(lowerBound, upperBound, N);
        X.push(Xi);
    }
    
    for (const point of checkedPoints) {
        for (let j = 0; j < DIM; j++) {
            X[j].push(point[j]);
        }
    }
    for (let i = 0; i < DIM; i++) {
        X[i].sort(function(a,b){
            return a-b;
        });
    }
    N+=checkedPoints.length;
    if (DIM == 2){
        var Z = new Array(N);
        for (let i = 0; i < N; i++) {
            Z[i]=new Array(N);
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                var x = {x1:X[0][i], x2: X[1][j]};
                Z[j][i]=objectiveFunction.evaluate(x);//rows - Yaxis, cols - Xaxis in plotly contour
            }
        }
    }
    else{
        var Z = [];
        for (let i = 0; i < N; i++) {
            var x = {x1:X[0][i]};
            Z.push(objectiveFunction.evaluate(x));//rows - Yaxis, cols - Xaxis in plotly contour
        }
    }
    return [X,Z];
}

function GetValuesForPlot(objectiveFunction,lowerBound,upperBound,checkedPoints){
    var X,Z,labelsList;
    if (DIM <= 2){
        returned=CoordsForContour(lowerBound,upperBound,objectiveFunction,checkedPoints);
        X=returned[0];
        Z=returned[1];
        labelsList = [];
        for (let i = 0; i < checkedPoints.length; i++) {
            labelsList.push(i+1);
        }
    }
    //checkedPoints transposed
    var checkedPointsT=[];
    for(let i = 0; i < DIM; i++) {
        checkedPointsT[i] = new Array(checkedPoints.length);
    }

    for (let i = 0; i < checkedPoints.length; i++) {
        let point = checkedPoints[i];
        for (let j = 0; j < DIM; j++) {
            checkedPointsT[j][i] = point[j];
        }
    }
    //compute function values on the search line
    if (DIM == 1){
        checkedPointsT[1] = new Array(checkedPointsT[0].length);
        for (let i = 0; i < checkedPointsT[0].length; i++) {
            let x = {x1: checkedPointsT[0][i],x2:0};
            checkedPointsT[1][i] = objectiveFunction.evaluate(x);
        }
    }
    return [X,Z,checkedPointsT,labelsList];   
}
//difference = set - subset
function SetSubtraction(setA,setB){
    let difference = new Set(setA);
    for (let elem of setB){
        if (difference.has(elem)){
            difference.delete(elem);
        }
    }
    return difference;
}
function SetUnion(setA, setB) {
    let union = new Set(setA)
    for (let elem of setB) {
        union.add(elem)
    }
    return union
}
function ParseProduction(symbols){
    let minStringLength = 99;

    for (elem of symbols) {
        let s = elem.length;
        if (s < minStringLength) {
            minStringLength = s;
        }
    }
    let alphabet = new Set();
    for (elem of symbols) {
        if (elem.length == minStringLength) {
            alphabet.add(elem);
        }
    }
    let concatenated_symbols=SetSubtraction(symbols,alphabet);
    let dict=new Map();
    for (elem of concatenated_symbols){
        let elem_old = elem;
        let nletters = elem.length / minStringLength - 1;
        let idx = 0;
        for (let i = 0; i < nletters; i++) {
            idx += minStringLength;
            let slc = elem.slice(0,idx);
            elem = elem.replace(slc,slc+'*');
            idx+=1;
        }
        dict.set(elem_old,elem);
    }
    return dict;
}
function CreateTree(functionString) {
    var node = math.parse(functionString);
    var constants = new Set(['pi','e','E','i','PI']);
    var functions = new Set(['sin','cos','tan','cot','exp','abs','sqrt','sign','log',
        'log10','log2','nthRoot','acos','acot','asin','atan','sec']);
    var symbols = new Set();
    node.traverse(function (node) {
        if (node.isSymbolNode) {
            symbols.add(node.name);
        }
        else if (node.isFunctionNode && functions.has(node.name)) {
            functions.add(node.name);
        }
    });
    return [node,symbols,functions,constants];
}
function isAlphaNumeric(char){
    let code = char.charCodeAt(0);
    if (!(code > 47 && code < 58) && // numeric (0-9)
        !(code > 64 && code < 91) && // upper alpha (A-Z)
        !(code > 96 && code < 123)) {
        return false;
    }
    else{
        return true;
    }
}
function ParseFunction(functionString,DIM) {
    try {
        //create tree
        let returned = CreateTree(functionString);
        let node = returned[0];
        let symbols = returned[1];
        let functions = returned[2];
        let constants = returned[3];
        //get variables
        symbols = SetSubtraction(symbols,SetUnion(constants,functions));
        //Open brackets mapping. If string contains open bracket then do mapping
        if (functionString.indexOf('(') != -1){
            let indexStart = 0;
            if (functionString.charAt(0) == '('){
                indexStart += 1;
            }
            let indexEnd = functionString.indexOf('(', indexStart);
            while (indexEnd != -1){
                let subst = functionString.substring(indexStart,indexEnd);
                let isFunction = false;
                for (const item of functions) {
                    if (subst.includes(item)){
                        isFunction = true;
                        break;
                    }
                }
                if (!isFunction && isAlphaNumeric(subst.charAt(subst.length - 1))){
                    functionString = functionString.replace(subst,subst+'*');
                    indexEnd += 1;
                }
                indexStart = indexEnd + 1;
                indexEnd = functionString.indexOf('(', indexStart);
            }
            returned = CreateTree(functionString);
            node = returned[0];
            symbols = returned[1];
            functions = returned[2];
            constants = returned[3];
            symbols = SetSubtraction(symbols,SetUnion(constants,functions));
        }
        //mapping and recreating the tree considering that 'xy' -> 'x*y'
        if (symbols.size > DIM) {
            var prodDict = ParseProduction(symbols);
            for (const key of prodDict.keys()) {
                let regex = new RegExp(key,'g');
                functionString = functionString.replace(regex,prodDict.get(key));
            }
            returned = CreateTree(functionString);
            node = returned[0];
            symbols = returned[1];
            functions = returned[2];
            constants = returned[3];
            symbols = SetSubtraction(symbols,SetUnion(constants,functions));
        }
        //renaming the variables to the hardcoded names 'x1','x2'
        let symbols_sorted=Array.from(symbols).sort();
        let symbols_new=['x1','x2','x3','x4','x5','x6','x7','x8','x9'];
        if (symbols_sorted != symbols_new){
            let dict=new Map();
            for (let i = 0; i < symbols_sorted.length; i++) {
                dict.set(symbols_sorted[i],symbols_new[i]);
            }
            node = node.transform(function (node) {
                if (node.isSymbolNode && symbols.has(node.name)) {
                    return new math.SymbolNode(dict.get(node.name));
                }
                else {
                    return node;
                }
            });
        }
        console.log(node.toString());
        node.traverse(function (node) {
            chck = node.isFunctionNode;
            console.log(node.type, node.op, node.value,node.name,chck);
        });
        let compiled_node=node.compile();
        return compiled_node;
    }
    catch (error) {
        alert("ParseFunction error");
        return 0;
    }
}
function StartOptimization(selectedMethodString,objectiveFunctionString,startPoint,maxIter,lowerBound,upperBound){
    //A start point must be inside a pair of square brackets. Allowed split symbols are ',' or ';'

    if (startPoint.charAt(0) == '[' && startPoint.charAt(startPoint.length-1) == ']'){
        startPoint = startPoint.slice(1,startPoint.length-1);
        let splitSymbol='';
        if (startPoint.indexOf(',') != -1){
            splitSymbol = ',';
        }
        //if string contains ',' and ';' symbols then splitSymbol is ';'
        if(startPoint.indexOf(';') != -1){
            splitSymbol = ';';
        }
        if (splitSymbol!=''){
            startPoint = startPoint.split(splitSymbol);
        }
        else{
            let point = parseFloat(startPoint);
            startPoint = [];
            startPoint.push(point);
        }
    }
    else{
        alert("[ and ] is not found");
    }
    DIM = startPoint.length; 
    for (let i = 0; i < DIM; i++) {
        startPoint[i] = parseFloat(startPoint[i]);
    }
    
    objectiveFunctionString=objectiveFunctionString.replace(/,/g,'.');
    objectiveFunction = ParseFunction(objectiveFunctionString,DIM);
    maxIter=parseInt(maxIter);
    
    
    switch (DIM) {
        case 1:
            if(lowerBound==''){
                lowerBound=startPoint[0] - 4;
            }
            else{
                lowerBound=parseFloat(lowerBound.replace(',','.'));
            }
            if(upperBound==''){
                upperBound=startPoint[0] + 4;
            }
            else{
                upperBound=parseFloat(upperBound.replace(',','.'));
            }
            break;
        case 2:
            let bound;
            if (startPoint[0]>startPoint[1]){
                bound = startPoint[0];
            }
            else{
                bound = startPoint[1];
            }
            if(lowerBound==''){
                lowerBound=bound - 4;
            }
            else{
                lowerBound=parseFloat(lowerBound.replace(',','.'));
            }
            if(upperBound==''){
                upperBound=bound + 4;
            }
            else{
                upperBound=parseFloat(upperBound.replace(',','.'));
            }
            break;
        default:
            break;
    }
    if(isNaN(maxIter)){
        maxIter=100;
    }
    var x = IntitializeStartPoint(startPoint);
    if (selectedMethodString === "hj"){
        var returned = HookeJeeves(x,maxIter,objectiveFunction);
    }
    else {
        if (selectedMethodString === "sa"){
            let startT=100.0;
            let endT=0.001;
            var returned=SimulatedAnnealing(startT,endT,maxIter,x,objectiveFunction,lowerBound,upperBound);
        }
    }
    {//send back
        if (DIM <= 2) {
            let checkedPoints,methodIterations, functionIterations, fMin;
            checkedPoints = returned[0];
            methodIterations = returned[1]; 
            functionIterations = returned[2];
            fMin = returned[3];
            let xMin = checkedPoints[checkedPoints.length-1];
            returned = GetValuesForPlot(objectiveFunction,lowerBound,upperBound,checkedPoints);
            returned.push(methodIterations);
            returned.push(functionIterations);
            returned.push(fMin);
            returned.push(xMin);
            returned.push(DIM);
        }
        else{
            let checkedPoints,methodIterations, functionIterations, fMin;
            checkedPoints = returned[0];
            methodIterations = returned[1]; 
            functionIterations = returned[2];
            fMin = returned[3];
            let xMin = checkedPoints[checkedPoints.length-1];
            returned.push(xMin);
            returned.push(DIM);
        }
        return returned;
    }
}

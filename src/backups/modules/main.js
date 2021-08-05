import {create,all} from "mathjs";
const math = create({
    all
});
var DIM;
const EPS=1e-8;
function intitializeStartPoint(startPoint){
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
function isEqualitiesSatisfied(x,Aeqs,Beqs){
    for (let i=0;i<Aeqs.length;i++) {
        let e = Aeqs[i].evaluate(x);
        if (math.abs(e-Beqs[i])<EPS){ // e<=beqs[i]
            return true;
        }
        else{
            return false;
        }
    }
}
function isBoundariesSatisfied(xi,lb,ub) {
    if (xi < lb-EPS || xi> ub+EPS){return false;}
    else{return true;}
}
function hookeJeeves (x,maxIter,f,lowerBound,upperBound,Aeqs,Beqs) {
    let checkedPoints = [Object.values(x).slice(0,DIM)];
    let y = f.evaluate(x);
    let functionIterations = 1;
    let methodIterations = 0;
    let d = 1;
    const eps = 1e-2;

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
                if(!isBoundariesSatisfied(xi,lowerBound[i],upperBound[i])){
                    xi=xi-sign*d;continue;
                }
                x[property] = xi;
                if(Aeqs != undefined && Beqs != undefined){
                    if (!isEqualitiesSatisfied(x,Aeqs,Beqs)){
                        x[property] = xi-sign*d;
                        continue;
                    }
                }
                let fX=f.evaluate(x);
                functionIterations++;
                if (fX < y){
                    y=fX;
                    fl=true;
                    checkedPoints.push(Object.values(x).slice(0,DIM));
                }
                else{
                    xi=xi-sign*d;
                    if(!isBoundariesSatisfied(lowerBound[i],upperBound[i])){
                        xi=xi+sign*d;continue;
                    }
                    x[property] = xi;
                    if(Aeqs != undefined && Beqs !=undefined){
                        if (!isEqualitiesSatisfied(x,Aeqs,Beqs)){
                            x[property] = xi-sign*d;
                            continue;
                        }
                    }
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

function simulatedAnnealing(initialTemperature,endT,maxIter,x,f,lowerBound,upperBound,Aeqs,Beqs){
    function getProbability(E,T) { return Math.exp(-E/T); }
    function tossCoin(p){
        if (Math.random() < p + 1e-8) { return true; }
        else { return false; } 
    }
    function decreaseTemperature(T,i) { return T*0.1/i; }
    function getRandomBetween(min, max) { return Math.random() * (max - min) + min; }
    var checkedPoints = [];
    checkedPoints.push(Object.values(x).slice(0,DIM));
    let functionIterations = 1;
    let candidateEnergy, p;
    let T=initialTemperature, currentEnergy=f.evaluate(x);
    for (var methodIterations = 0; methodIterations<maxIter;methodIterations++) {  
        let i = 0;
        for (const property in x) {
            if(Aeqs != undefined && Beqs !=undefined){
                do {
                    x[property]=getRandomBetween(lowerBound[i], upperBound[i]);
                } while (!isEqualitiesSatisfied(x,Aeqs,Beqs) && Aeqs != undefined && Beqs !=undefined);
            }
            else{
                x[property]=getRandomBetween(lowerBound[i], upperBound[i]);
            }
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
            p=getProbability(candidateEnergy-currentEnergy,T);
            if (tossCoin(p)===true){
                currentEnergy=candidateEnergy;
                checkedPoints.push(Object.values(x).slice(0,DIM));
            }
        }
        T=decreaseTemperature(initialTemperature,methodIterations);
        if (T < endT+1e-8){
            break;
        }
    }
    return [checkedPoints,methodIterations,functionIterations,currentEnergy];
}

function coordsForContour(lowerBound,upperBound,objectiveFunction,checkedPoints){
    function getNumbersBetween(lowerBound,upperBound,N){
        var range = new Array(N);
        var step = Math.abs((upperBound-lowerBound))/N;
        var idx = 0;
        for (let i = lowerBound; i < upperBound - 1e-8; i+=step) {
            range[idx] = i;
            idx++;
        }
        return range;
    }
    var N = 200; //quantity
    var X = [];
    var Z;
    for (let i = 0; i < DIM; i++) {
        let Xi = getNumbersBetween(lowerBound[i], upperBound[i], N);
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
    if (DIM === 2){
        Z = new Array(N);
        for (let i = 0; i < N; i++) {
            Z[i]=new Array(N);
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                let x = {x1:X[0][i], x2: X[1][j]};
                Z[j][i]=objectiveFunction.evaluate(x);//rows - Yaxis, cols - Xaxis in plotly contour
            }
        }
    }
    else{
        Z = [];
        for (let i = 0; i < N; i++) {
            let x = {x1:X[0][i]};
            Z.push(objectiveFunction.evaluate(x));//rows - Yaxis, cols - Xaxis in plotly contour
        }
    }
    return [X,Z];
}

function getValuesForPlot(objectiveFunction,lowerBound,upperBound,checkedPoints){
    var X,Z,labelsList;
    if (DIM <= 2){
        let returned=coordsForContour(lowerBound,upperBound,objectiveFunction,checkedPoints);
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
    if (DIM === 1){
        checkedPointsT[1] = new Array(checkedPointsT[0].length);
        for (let i = 0; i < checkedPointsT[0].length; i++) {
            let x = {x1: checkedPointsT[0][i],x2:0};
            checkedPointsT[1][i] = objectiveFunction.evaluate(x);
        }
    }
    return [X,Z,checkedPointsT,labelsList];   
}
//difference = set - subset
function difference(setA,setB){
    let difference = new Set(setA);
    for (let elem of setB){
        if (difference.has(elem)){
            difference.delete(elem);
        }
    }
    return difference;
}
function union(setA, setB) {
    let union = new Set(setA)
    for (let elem of setB) {
        union.add(elem)
    }
    return union
}

function createTree(objectiveFunctionString) {
    var node = math.parse(objectiveFunctionString);
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
    symbols = difference(symbols,union(constants,functions));
    return [node,symbols];
}

function parseFunction(objectiveFunctionString,DIM) {
    let c = new Set(['pi','e','E','i','PI','sin','cos','tan','cot','exp','abs','sqrt','sign','log',
    'log10','log2','nthRoot','acos','acot','asin','atan','sec']);
    try {
        //mapping "(" -> "*("
        let re=/[\w.]+(?=\()/g;
        let r=objectiveFunctionString.match(re);
        if (r !== null){
            r=r.filter(item => !c.has(item));
            r.forEach(t => {
                objectiveFunctionString=objectiveFunctionString.replace(t,t+'*');
            });
        }
        let returned = createTree(objectiveFunctionString);
        let node = returned[0];
        let symbols = returned[1];
        if (symbols.size !== DIM) { throw "Несоответствие размерностей целевой функции и стартовой точки.";}
        //renaming variables to the hardcoded names
        let symbols_sorted=Array.from(symbols).sort();
        let symbols_new=['x1','x2','x3','x4','x5','x6','x7','x8','x9'];
        if (symbols_sorted !== symbols_new){
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
        /*node.traverse(function (node) {
            var chck = node.isFunctionNode;
            console.log(node.type, node.op, node.value,node.name,chck);
        });*/
        let compiled_node=node.compile();
        return compiled_node;
    }
    catch (error) {
        alert("Ошибка парсинга функции.");
        return -1;
    }
}

function startOptimization(selectedMethodString,params){
    var objectiveFunctionString=params.objectiveFunction;
    var startPoint=params.startPoint;
    var maxIter=parseInt(params.maxIterations);
    var lowerBound=params.lowerBound;
    var upperBound=params.upperBound;
    if (params.Aeq !== undefined || params.Beq !== undefined){
        var Aeq=params.Aeq;
        var Beq=params.Beq;
    }
    let re=/[\w.-]+/g;
    lowerBound=lowerBound.match(re);
    upperBound=upperBound.match(re);
    startPoint=startPoint.match(re);
    DIM = startPoint.length; 
    for (let i = 0; i < DIM; i++) {
        startPoint[i] = parseFloat(startPoint[i]);
        lowerBound[i] = parseFloat(lowerBound[i]);
        upperBound[i] = parseFloat(upperBound[i]);
        if (isNaN(lowerBound[i])){
            lowerBound[i]=Number.MIN_SAFE_INTEGER;
        }
        if (isNaN(upperBound[i])){
            upperBound[i]=Number.MAX_SAFE_INTEGER;
        }
    }
    for (let i = 0; i < DIM; i++) {
        if (isFinite(upperBound[i]) && startPoint[i] > upperBound[i]){
            return -1;
        }
        if (isFinite(lowerBound[i]) && startPoint[i] < lowerBound[i]){
            return -1;
        }
    }
    if (params.Aeq !== undefined || params.Beq !== undefined){
        let xKeys=["x1","x2","x3","x4","x5","x6","x7","x8","x9"];
        Aeq=Aeq.substring(1,Aeq.length-1).split(';');
        Beq=Beq.substring(1,Beq.length-1).split(';');
        if (Aeq.length !== Beq.length){return -1;}
        var Aeqs=[];
        for (let i=0;i<Aeq.length;i++){
            let t = Aeq[i].match(/-?\d+\.\d+|-?\d+/g);
            let s="";
            for (let idx=0;idx<t.length;idx++) { 
                if (t[idx].charAt(0)!=='-'){s = s+'+'+t[idx]+'*'+xKeys[idx];}
                else {s = s+t[idx]+'*'+xKeys[idx];}
            }
            if (s.charAt(0)==='+'){
                s=s.substring(1,s.length);
            }
            let e = math.parse(s).toString();
            Aeqs.push(math.compile(s));
        }
        var Beqs=[];
        for (let i = 0; i < Beq.length; i++) {
            Beqs.push(parseFloat(Beq[i]));
        }
    }
    var objectiveFunction = parseFunction(objectiveFunctionString,DIM);
    if (objectiveFunction === -1){ return -1;}
    
    var x = intitializeStartPoint(startPoint);
    if (selectedMethodString === "hj"){
        var returned = hookeJeeves(x,maxIter,objectiveFunction,lowerBound,upperBound,Aeqs,Beqs);
    }
    else {
        if (selectedMethodString === "sa"){
            let startT=parseFloat(params.initialTemperature);
            let endT=parseFloat(params.maxTemperature);
            returned=simulatedAnnealing(startT,endT,maxIter,x,objectiveFunction,lowerBound,upperBound,Aeqs,Beqs);
        }
    }
    if (DIM <= 2) {
        let checkedPoints,methodIterations, functionIterations, fMin;
        checkedPoints = returned[0];
        methodIterations = returned[1]; 
        functionIterations = returned[2];
        fMin = returned[3];
        let xMin = checkedPoints[checkedPoints.length-1];
        returned = getValuesForPlot(objectiveFunction,lowerBound,upperBound,checkedPoints);
        returned.push(methodIterations);
        returned.push(functionIterations);
        returned.push(fMin);
        returned.push(xMin);
        returned.push(DIM);
    }
    else{
        let checkedPoints = returned[0];
        let xMin = checkedPoints[checkedPoints.length-1];
        returned.push(xMin);
        returned.push(DIM);
    }
    return returned;
}
export default startOptimization;
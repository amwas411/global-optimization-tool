functionDimension = 2;
function DefaultFunc(x1,x2) {
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
    return 100*(x2 - x1**2)**2 + (1 - x1)**2;
}
function HookeJeeves (x1,x2,mx,f) {
    let minX=[];
    let minY=[];
    minX.push(x1);
    minY.push(x2);
    let n=2;
    let functionIter = 0;
    let x = {x1:x1, x2: x2};
    let y=f.evaluate(x);
    functionIter++;
    let methodIter = 0;
    let d=1;
    let eps=1e-2;

    while ((d > eps) && (methodIter < mx)) {
        let fl=false;
        let sign = 1;
        for (let i = 0; i<n;i++) {   
            if (i!==0) {
                sign=-1;
            }
            x1=x1+sign*d;
            x = {x1:x1, x2: x2};
            let fX=f.evaluate(x);
            functionIter++;
            if (fX < y){
                y=fX;
                fl=true;
                minX.push(x1);
                minY.push(x2);
            }
            else{
                x1=x1-sign*d;
            }
        }
        sign = 1;
        for (let i = 0; i<n;i++) {   
            if (i!==0){
                sign=-1;
            }
            x2=x2+sign*d;
            x = {x1:x1, x2: x2};
            let fX=f.evaluate(x);
            functionIter++;
            if (fX < y){
                y=fX;
                fl=true;
                minX.push(x1);
                minY.push(x2);
            }
            else{
                x2=x2-sign*d;
            }
        }
        if (fl===false){
            d=d/2;
        }
        methodIter++;
    }
    return [x1,x2,minX,minY,methodIter,functionIter];
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
function SimulatedAnnealing(initialTemperature,endT,kMax,x0,y0,f,lowerBound,upperBound){
    let functionIter = 0;
    let T, currentEnergy;
    let x = {x1:x0, x2: y0};
    let initialEnergy = f.evaluate(x);
    functionIter++;
    let minX=[];
    let minY=[];
    let candidateEnergy, p;
    //searching square 3x3 with center in (x0,y0)
    /*let lowerX = x0 - 1.5;
    let upperX = x0 + 1.5;
    let lowerY = y0 - 1.5;
    let upperY = y0 + 1.5;*/
    let lowerX = lowerY = lowerBound;
    let upperX = upperY = upperBound;
    
    T=initialTemperature;
    currentEnergy=initialEnergy;
    minX=[];
    minY=[];
    minX.push(x0);
    minY.push(y0);
    for (var i = 0; i<kMax;i++) {  
        x1 = GetRandomBetween(lowerX, upperX);
        y1 = GetRandomBetween(lowerY, upperY);
        x = {x1:x1, x2: y1};
        candidateEnergy = f.evaluate(x);
        functionIter++;
        if (candidateEnergy<currentEnergy-1e-8){
            currentEnergy=candidateEnergy;
            minX.push(x1);
            minY.push(y1);
        }
        else {
            p=GetProbability(candidateEnergy-currentEnergy,T);
            if (MakeChange(p)===true){
                currentEnergy=candidateEnergy;
                minX.push(x1);
                minY.push(y1);
            }
        }
        T=DecreaseTemperature(initialTemperature,i);
        if (T < endT+1e-8){
            break;
        }
    }
    x1 = minX[minX.length - 1];
    y1 = minY[minY.length - 1];
    return [x1,y1,minX,minY,i,functionIter];
}
function GetAxisBounds(x0,y0,x1,y1){
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
}
function GetNumbersBetween(lowerBound,upperBound,quantity){
    let range = new Array(quantity);
    let step = Math.abs((upperBound-lowerBound))/quantity;
    idx=0;
    for (let i = lowerBound; i < upperBound - 1e-8; i+=step) {
        range[idx] = i;
        idx++;
    }
    return range;
}
function CoordsForContour(lowerX,upperX,lowerY,upperY,f,minX,minY){
    let quantity = 200;
    let X = GetNumbersBetween(lowerX, upperX, quantity);
    let Y = GetNumbersBetween(lowerY, upperY, quantity);
    X.push(...minX);
    Y.push(...minY);
    quantity = X.length;
    X.sort(function(a,b){
        return a-b;
    });
    Y.sort(function(a,b){
        return a-b;
    });
    let Z = new Array(quantity);
    for (let i = 0; i < quantity; i++) {
        Z[i]=new Array(quantity);
        
    }
    let x={};
    for (let i = 0; i < quantity; i++) {
        for (let j = 0; j < quantity; j++) {
            x = {x1:X[i], x2: Y[j]};
            Z[j][i]=f.evaluate(x);//rows - Yaxis, cols - Xaxis in plotly contour
        }
    }
    return [X,Y,Z];
}

function StartHJ(targetFunction,x0,y0,mx,lowerBound,upperBound){
    let x1,y1,minX,minY;
    let returned = HookeJeeves(x0,y0,mx,targetFunction);
    x1=returned[0];
    y1=returned[1];
    minX=returned[2];
    minY=returned[3];
    methodIter=returned[4];
    functionIter=returned[5];
    let x = {x1:x1, x2: y1};
    let fMin=targetFunction.evaluate(x); // точка глобального минимума
    lowerX = lowerY = lowerBound;
    upperX = upperY = upperBound;
    let X,Y,Z;
    returned=CoordsForContour(lowerX,upperX,lowerY,upperY,targetFunction,minX,minY);
    X=returned[0];
    Y=returned[1];
    Z=returned[2];
    let labelsList = [];
    for (let i = 0; i < minX.length; i++) {
        labelsList.push(i+1);
    }
    x = {x1:x0, x2: y0};
    let f0=targetFunction.evaluate(x); 
    return [X,Y,Z,minX,minY,x1,y1,fMin,labelsList,methodIter,functionIter,f0];
}
function StartSA(targetFunction,x0,y0,startT,endT,maxIter,lowerBound,upperBound){
    returned=SimulatedAnnealing(startT,endT,maxIter,x0,y0,targetFunction,lowerBound,upperBound);
    x1=returned[0];
    y1=returned[1];
    minX=returned[2];
    minY=returned[3];
    methodIter=returned[4];
    functionIter=returned[5];
    x = {x1:x1, x2: y1};
    fMin = targetFunction.evaluate(x);

    lowerX = lowerY = lowerBound;
    upperX = upperY = upperBound;
    returned=CoordsForContour(lowerX,upperX,lowerY,upperY,targetFunction,minX,minY);
    X=returned[0];
    Y=returned[1];
    Z=returned[2];
    labelsList = [];
    for (let i = 0; i < minX.length; i++) {
        labelsList.push(i+1);
    }
    x = {x1:x0, x2: y0};
    f0 = targetFunction.evaluate(x);
    return [X,Y,Z,minX,minY,x1,y1,fMin,labelsList,methodIter,functionIter,f0];   
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
    let node=math.parse(functionString);
    let constants = new Set(['pi','e','i']);
    let functions=new Set(['sin','cos','tan','cot','exp','abs','sqrt','sign','log']);
    let symbols=new Set();
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
function ParseFunction(functionString) {
    try {
        //create tree
        let returned = CreateTree(functionString);
        let node = returned[0];
        let symbols = returned[1];
        let functions = returned[2];
        let constants = returned[3];
        //get names of variables
        symbols = SetSubtraction(symbols,SetUnion(constants,functions));
        //mapping open brackets
        //if string contains open bracket then do mapping
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
        if (symbols.size > functionDimension) {
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
        let symbols_new=['x1','x2'];
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
function StartOptimization(selectedMethodString,selectedFunctionString,x0,y0,maxIter,lowerBound,upperBound){
    selectedFunctionString=selectedFunctionString.replace(/,/g,'.');
    targetFunction = ParseFunction(selectedFunctionString);
    maxIter=parseInt(maxIter);
    x0=parseFloat(x0.replace(',','.'));
    y0=parseFloat(y0.replace(',','.'));
    lowerBound=parseFloat(lowerBound.replace(',','.'));
    upperBound=parseFloat(upperBound.replace(',','.'));
    if(isNaN(lowerBound)){
        lowerBound=-4;
    }
    if(isNaN(upperBound)){
        upperBound=4;
    }
    if(isNaN(maxIter)){
        maxIter=100;
    }
    if(isNaN(x0)){
        x0=GetRandomBetween(lowerBound, upperBound);
    }
    if(isNaN(y0)){
        y0=GetRandomBetween(lowerBound, upperBound);
    }
    if (selectedMethodString === "hj"){
        returned = StartHJ(targetFunction,x0,y0,maxIter,lowerBound,upperBound);
    }
    else {
        let startT=100.0;
        let endT=0.001;
        returned = StartSA(targetFunction,x0,y0,startT,endT,maxIter,lowerBound,upperBound);
    }
    return returned;
}
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
    let o =Math.pow(10,-4)*(x1-3)*(x1-3)-(x2-x1);
    return o+e;
}

function HookeJeeves (x1,x2,mx,f) {
    let minX=[];
    let minY=[];
    minX.push(x1);
    minY.push(x2);
    let n=2;
    let y=f(x1,x2);
    let k=0;
    let d=1;
    let eps=1e-4;

    while ((d > eps) && (k < mx)) {
        let fl=false;
        let sign = 1;
        for (let i = 0; i<n;i++) {   
            if (i!==0) {
                sign=-1;
            }
            x1=x1+sign*d;
            let fX=f(x1,x2);
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
            fX=f(x1,x2);
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
        k++;
    }
    return [x1,x2,minX,minY];
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
function SimulatedAnnealing(initialTemperature,endT,kMax,x0,y0,f){
    let T, currentEnergy;
    let initialEnergy = f(x0,y0);
    let minX=[];
    let minY=[];
    let minXBest=[];
    let minYBest=[];
    let x1Best,x2Best,fMinBest;
    let candidateEnergy, p;
    let lowerX = x0 - 1.5;
    let upperX = x0 + 1.5;
    let lowerY = y0 - 1.5;
    let upperY = y0 + 1.5;
    for (let j = 1; j<=10;j++) {  
        T=initialTemperature;
        currentEnergy=initialEnergy;
        minX=[];
        minY=[];
        minX.push(x0);
        minY.push(y0);
        for (let i = 1; i<=kMax;i++) {  
            x1 = GetRandomBetween(lowerX, upperX);
            y1 = GetRandomBetween(lowerY, upperY);
            candidateEnergy=f(x1,y1);
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
        fMin = f(x1,y1);
        if ((fMin < fMinBest - 1e-8) || (j === 1) ){
            fMinBest = fMin;
            minXBest = minX;
            minYBest = minY;
        }
    }
    x1Best = minXBest[minXBest.length - 1];
    x2Best = minYBest[minYBest.length - 1];
    return [x1Best,x2Best,minXBest,minYBest];
}
function GetAxisBounds(x0,y0,x1,y1){
    let eps=1e-8;
    let shiftingValue = 10;
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
    for (let i = 0; i < quantity; i++) {
        for (let j = 0; j < quantity; j++) {
            Z[j][i]=f(X[i],Y[j]); //rows - Yaxis, cols - Xaxis in plotly contour
        }
    }
    return [X,Y,Z];
}
function GetTargetFunction(selectedFunctionString){
    let targetFunction;
    if (selectedFunctionString === "default"){
        targetFunction=DefaultFunc;
    }
    else {
        if (selectedFunctionString === "bill"){
            targetFunction=BillsFunc;
        }
        else{
            targetFunction=VittesFunc;
        }
    }
    return targetFunction;
}
function StartHJ(selectedFunctionString){
    let log = document.getElementById("for-debug");
    log.innerHTML = "HJ, "+selectedFunctionString;
    let targetFunction = GetTargetFunction(selectedFunctionString);
    let lowerBound=-4;
    let upperBound=4;
    let mx,x0,y0;
    try{
        mx=int(entryMx.get());
    }
    catch(error){
        mx=50;
    }
    try{
        x0=float(entryX0.get());
    }
    catch(error){
        x0=GetRandomBetween(lowerBound, upperBound);
    }
    try{
        y0=float(entryY0.get());
    }
    catch(error){
        y0=GetRandomBetween(lowerBound, upperBound);
    }
    let x1,y1,minX,minY;
    let returned = HookeJeeves(x0,y0,mx,targetFunction);
    x1=returned[0];
    y1=returned[1];
    minX=returned[2];
    minY=returned[3];
    let fMin=targetFunction(x1,y1); // точка глобального минимума
    let lowerX,upperX,lowerY,upperY;
    returned=GetAxisBounds(x0,y0,x1,y1);
    lowerX=returned[0];
    upperX=returned[1];
    lowerY=returned[2];
    upperY=returned[3];
    let X,Y,Z;
    returned=CoordsForContour(lowerX,upperX,lowerY,upperY,targetFunction,minX,minY);
    X=returned[0];
    Y=returned[1];
    Z=returned[2];
    let labelsList = [];
    let minZ=[];
    for (let i = 0; i < minX.length; i++) {
        labelsList.push(i+1);
        minZ.push(targetFunction(minX[i],minY[i]));
    }
    /*X.push(...minX);
    Y.push(...minY);
    Z.push(...minZ);*/
    return [X,Y,Z,minX,minY,x1,y1,fMin,labelsList];
}
function StartSA(selectedFunctionString){
    let log = document.getElementById("for-debug");
    log.innerHTML = "SA, "+selectedFunctionString;
    let targetFunction = GetTargetFunction(selectedFunctionString);
    let startT,endT,mx,x0,y0;
    let lowerBound=-4;
    let upperBound=4;
    try{
        startT=float(entryStartT.get());
    }
    catch(error){
        startT=100.0;
    }
    try{
        endT=float(entryEndT.get());
    }
    catch(error){
        endT=0.0001;
    }
    try{
        mx=int(entryMx.get());
    }
    catch(error){
        mx=50;
    }
    try{
        x0=float(entryX0.get());
    }
    catch(error){
        x0=GetRandomBetween(lowerBound, upperBound);
    }
    try{
        y0=float(entryY0.get());
    }
    catch(error){
        y0=GetRandomBetween(lowerBound, upperBound);
    }
    let x1,y1,minX,minY;
    let returned=SimulatedAnnealing(startT,endT,mx,x0,y0,targetFunction);
    x1=returned[0];
    y1=returned[1];
    minX=returned[2];
    minY=returned[3];
    let fMin=targetFunction(x1,y1);
    let lowerX,upperX,lowerY,upperY;
    returned=GetAxisBounds(x0,y0,x1,y1);
    lowerX=returned[0];
    upperX=returned[1];
    lowerY=returned[2];
    upperY=returned[3];
    let X,Y,Z;
    returned=CoordsForContour(lowerX,upperX,lowerY,upperY,targetFunction,minX,minY);
    X=returned[0];
    Y=returned[1];
    Z=returned[2];
    let labelsList = [];
    for (let i = 0; i < minX.length; i++) {
        labelsList.push(i+1);
    }
    /*X.push(...minX);
    Y.push(...minY);
    Z.push(...minZ);*/
    return [X,Y,Z,minX,minY,x1,y1,fMin,labelsList];   
}
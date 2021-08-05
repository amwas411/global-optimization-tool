function somemethod(f,intervalsList,maxIter,lowerBound,upperBound,N) {
    function createGrid(intervalsList,N) {
        let newIntervalsList=new Array(DIM);
        //newIntervalsList: 0 - [a11=a1,a12,...,a1N=b1], ...
        //intervalsList: 0 - [a1,b1], 1 - [a2,b2], ...
        for (let i = 0; i < DIM; i++) {
            newIntervalsList[i]=new Array(N+1);
            let a = intervalsList[i][0],b = intervalsList[i][1];
            let step = (b - a)/N;
            let j=0;
            while (j < N + 1){
                newIntervalsList[i][j++]=a;
                a+=step;
            }
        }
        //grid = transposed newIntervalsList
        //grid: 0: [a11,a21,a31,...,aDIM1], 1: [a12,a22,a32,...]
        let grid=new Array(N+1);
        for (let i = 0; i < N+1; i++) {
            grid[i]=new Array(DIM);
            for (let j = 0; j < DIM; j++) {
                grid[i][j]=newIntervalsList[j][i];
            }
        }
        return grid;
    }
    let functionIterations=0;
    let grid = createGrid(intervalsList,N);
    let xMin,fMin=Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < grid.length; i++) {
        let startPoint=intitializePoint(grid[i]);
        var returnedFromMethod = hookeJeeves(startPoint,maxIter,f,lowerBound,upperBound);
        functionIterations+=returnedFromMethod[1];
        let xMinCanditate=returnedFromMethod[2],fMinCanditate=returnedFromMethod[3];
        if (fMinCanditate < fMin){
            fMin = fMinCanditate;
            xMin = xMinCanditate;
            var checkedPoints=returnedFromMethod[0];
        }
    }
    return [checkedPoints,functionIterations,xMin,fMin];
}

function tunnel(x,f,eps,deltaVector,lambda,alpha) {
    function createStartPoints(xRecord) {
        let X=[];
        let x=Object.assign({},xRecord);
        let i=1;
        for (const property in xRecord) {
            x[property]=xRecord[property]+gamma;
            X.push(Object.assign({},x));
            x[property]=xRecord[property]-gamma;
            X.push(Object.assign({},x));
            x[property]=xRecord[property]+gamma/2;
            X.push(Object.assign({},x));
            x[property]=xRecord[property]-gamma/2;
            X.push(Object.assign({},x));
            if (i===DIM){
                break;
            }
            i++;
        }
        return X;
    }
    let gamma=1;
    let [functionIterations,xRecord,fxRecord] = hookeJeeves(x,f,eps,deltaVector,lambda,alpha);
    let X=createStartPoints(xRecord);
    let checkedPoints=[];
    checkedPoints.push(Object.values(x).slice(0,DIM));
    checkedPoints.push(Object.values(xRecord).slice(0,DIM));
    if (fxRecord < 0){
        var r=2*Math.abs(fxRecord);
    }
    else{
        var r=fxRecord;
    }
    let b=1;
    let k=1,K=100;
    mainLoop: for(;;){
        //туннельная фаза
        step3: for(;;){
            let s = `[${Object.values(xRecord).toString()}]`;
            let tunnelFunctionString = `1/(${r}+${fxRecord})*exp(-norm(subtract([x1,x2,x3,x4,x5,x6,x7,x8,x9],${s}))/${b})`;
            let tunnelFunction=math.compile(tunnelFunctionString);
            for (const item of X) {
                let mI,fI;
                var z,fz;
                [fI,z,fz]=hookeJeeves(item,tunnelFunction,eps,deltaVector,lambda,alpha);
                functionIterations+=fI;
                functionIterations++;
                if (f.evaluate(z) < fxRecord + EPS){
                    break step3;
                }
            }
            //step 8
            r/=1.2;
            k++;
            if (k> K){
                var xMin=xRecord;
                var fMin=fxRecord;
                break mainLoop;
            }
        }
        //step 4: фаза минимизации
        checkedPoints.push(Object.values(z).slice(0,DIM));
        let [fI,zRecord,fzRecord]=hookeJeeves(z,f,eps,deltaVector,lambda,alpha);
        functionIterations+=fI;
        if (fzRecord < fxRecord + EPS){
            xRecord=Object.assign({},zRecord);
            fxRecord=fzRecord;
            X=createStartPoints(xRecord);
            checkedPoints.push(Object.values(xRecord).slice(0,DIM));
            continue mainLoop;
        }
        else{
            if(k < K){
                r*=1.8;
                b*=1.1;
                let delta=1;
                let zR=Object.values(zRecord);
                let xR=Object.values(xRecord);
                let subt = math.subtract(zR,xR);
                let tx0=xR+delta*subt/norm(subt);
                let x0=Object.assign(xRecord);
                let i=0;
                for (const property in x0) {
                    x0[property]=tx0[i++];
                }
                X=[x0];
                checkedPoints.push(Object.values(x0).slice(0,DIM));
                continue mainLoop;
            }
            else{
                var xMin=xRecord;
                var fMin=fxRecord;
                break mainLoop;
            }
        }
    }
    return [checkedPoints,functionIterations,xMin,fMin];
}

function isEqualitiesSatisfied(x,Aeqs,Beqs){
    for (let i=0;i<Aeqs.length;i++) {
        let e = Aeqs[i].evaluate(x);
        if (Math.abs(e-Beqs[i])<EPS){ // e<=beqs[i]
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
    /*if (params.Aeq !== undefined || params.Beq !== undefined){
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
    }*/
            /*case "Tunnel":{
            let startPoint,deltaVector,lambda,alpha,eps;
            startPoint = intitializePoint(parseStartPoint(params.startPoint));
            if (!isStartPointCorrect(startPoint,lowerBound,upperBound)){
                return -2;
            }
            lambda=parseFloat(params.lambda);
            alpha=parseFloat(params.alpha);
            eps=parseFloat(params.eps);
            let re=/[\w.-]+/g;
            deltaVector=params.deltaVector.match(re);
            for (let i = 0; i < DIM; i++) {
                deltaVector[i] = parseFloat(deltaVector[i]);
                if (isNaN(deltaVector[i])){
                    deltaVector[i]=Number.MIN_SAFE_INTEGER;
                }
            }
            var returnedFromMethod = tunnel(startPoint,objectiveFunction,eps,deltaVector,lambda,alpha);
            break;
        }*/
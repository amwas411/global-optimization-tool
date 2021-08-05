import { create, all } from "mathjs";
const math = create({
    all
});
var DIM;
const EPS = 1e-8;
//[checkedPoints, functionIterations, xMin, fMin, functionValues];
class MethodOutput{
    constructor(checkedPoints, functionIterations, xMin, fMin, functionValues){
        this.checkedPoints=checkedPoints;
        this.functionIterations=functionIterations;
        this.xMin=xMin; 
        this.fMin=fMin; 
        this.functionValues=functionValues;
    }
}
function CheckStringVector(stringVector) {
    try {
      let re = /[\w.]+/g;
      let r = stringVector.match(re);
      if (r === null) { throw "Пустая строка"; }
      re = /^\d+$|^\d+\.\d+$/;
      r.forEach(element => {
        if (element.match(re) === null) { throw "Слишком много точек"; }
      });
    }
    catch (error) {
      return error;
    }
    return 0;
  }
function parseStartPoint(startPointString,lb,ub) {
    let re = /[\w.-]+/g;
    let startPoint = startPointString.match(re);
    if (startPoint.length !== DIM) {
        return -2;
    }
    for (let i = 0; i < DIM; i++) {
        startPoint[i] = parseFloat(startPoint[i]);
        if (startPoint[i] < lb[i]){
            startPoint[i]=lb[i];
        }
        else {
            if (startPoint[i] > ub[i]){
            startPoint[i]=ub[i];
            }
        }
    }

    return startPoint;
}
function initializePoint(arr) {
    let x = { x1: 0, x2: 0, x3: 0, x4: 0, x5: 0, x6: 0, x7: 0, x8: 0, x9: 0 };
    let i = 0;
    for (const property in x) {
        x[property] = arr[i++];
        if (i === DIM) {
            break;
        }
    }
    return x;
}


function simulatedAnnealing(T, N, x, f, C, beta, lb, ub) {
    function getProbability(df, C, T) { return Math.exp(-df / C / T); }
    function tossCoin(p) { return Math.random() < p; }

    function myRand(T) {
        function density(x, T) {
            let nx = math.norm(x);
            return Math.exp(-(nx ** 2 / 2 / T)) / (Math.sqrt(2 * Math.PI * T)) ** DIM;
        }
        let a = -10, b = 10;
        let N = 1000;
        let c = density(0, T);
        let X = new Array(2), Z = new Array(2);
        for (let i = 0; i < N; i++) {
            X[0] = Math.random();
            X[1] = Math.random();
            Z[0] = a + X[0] * (b - a);
            Z[1] = X[1] * c;
            if (Z[1] < density(Z[0])) {
                return Z[0];
            }
        }
        return Z[0];
    }
    x = initializePoint(x);
    let checkedPoints = [Object.values(x).slice(0, DIM)];
    let functionValues = [f.evaluate(x)];
    let dx = new Array(DIM);
    let functionIterations = 0;
    for (let k = 0; k < N - 1; k++) {
        for (let i = 0; i < DIM; i++) {
            dx[i] = myRand(T);
        }
        let dx_ = initializePoint(dx);
        let y = addition(x, dx_);
        let i = 0;
        for (const key in y) {
            if (y[key] > ub[i]) {
                y[key] = ub[i];
            }
            else {
                if (y[key] < lb[i]) {
                    y[key] = lb[i];
                }
            }
        }
        let df = f.evaluate(y) - f.evaluate(x);
        functionIterations += 2;
        if (df < 0) {
            x = Object.assign({}, y);
            checkedPoints.push(Object.values(x).slice(0, DIM));
            functionValues.push(f.evaluate(x));
        }
        else {
            let p = getProbability(df, C, T);
            if (tossCoin(p) === true) {
                x = Object.assign({}, y);
                checkedPoints.push(Object.values(x).slice(0, DIM));
                functionValues.push(f.evaluate(x));
            }
        }
        T *= beta;
    }
    let xMin = Object.assign({}, x);
    let fMin = f.evaluate(xMin);
    let methodOutput= new MethodOutput(checkedPoints, functionIterations, xMin, fMin, functionValues)
    return methodOutput;
}

function coordsForContour(lowerBound, upperBound, objectiveFunction, checkedPoints) {
    function getNumbersBetween(lowerBound, upperBound, N) {
        var range = new Array(N);
        var step = Math.abs((upperBound - lowerBound)) / N;
        var idx = 0;
        for (let i = lowerBound; i < upperBound - EPS; i += step) {
            range[idx] = i;
            idx++;
        }
        return range;
    }
    var N = 100; //quantity
    var X = [];
    var Y;
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
        X[i].sort(function (a, b) {
            return a - b;
        });
    }
    N += checkedPoints.length;
    if (DIM === 2) {
        Y = new Array(N);
        for (let i = 0; i < N; i++) {
            Y[i] = new Array(N);
        }
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                let x = { x1: X[0][i], x2: X[1][j] };
                Y[j][i] = objectiveFunction.evaluate(x);//rows - Yaxis, cols - Xaxis in plotly contour
            }
        }
    }
    else {
        Y = [];
        for (let i = 0; i < N; i++) {
            let x = { x1: X[0][i] };
            Y.push(objectiveFunction.evaluate(x));//rows - Yaxis, cols - Xaxis in plotly contour
        }
    }
    return [X, Y];
}

function getValuesForPlot(objectiveFunction, lowerBound, upperBound, checkedPoints) {
    let [X, Y] = coordsForContour(lowerBound, upperBound, objectiveFunction, checkedPoints);
    let labelsList = [];
    for (let i = 0; i <= checkedPoints.length; i++) {
        labelsList.push(i);
    }
    //checkedPoints transposed
    var checkedPointsT = [];
    for (let i = 0; i < DIM; i++) {
        checkedPointsT[i] = new Array(checkedPoints.length);
    }

    for (let i = 0; i < checkedPoints.length; i++) {
        let point = checkedPoints[i];
        for (let j = 0; j < DIM; j++) {
            checkedPointsT[j][i] = point[j];
        }
    }
    //compute function values on the search line
    if (DIM === 1) {
        checkedPointsT[1] = new Array(checkedPointsT[0].length);
        for (let i = 0; i < checkedPointsT[0].length; i++) {
            checkedPointsT[1][i] = objectiveFunction.evaluate({ x1: checkedPointsT[0][i] });
        }
    }
    return [X, Y, checkedPointsT, labelsList];
}
//difference = set - subset
function difference(setA, setB) {
    let difference = new Set(setA);
    for (let elem of setB) {
        if (difference.has(elem)) {
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
    var constants = new Set(['pi', 'e', 'E', 'i', 'PI']);
    var functions = new Set(['sin', 'cos', 'tan', 'cot', 'exp', 'abs', 'sqrt', 'sign', 'log',
        'log10', 'log2', 'nthRoot', 'acos', 'acot', 'asin', 'atan', 'sec', 'norm']);
    var symbols = new Set();
    node.traverse(function (node) {
        if (node.isSymbolNode) {
            symbols.add(node.name);
        }
        else if (node.isFunctionNode && functions.has(node.name)) {
            functions.add(node.name);
        }
    });
    symbols = difference(symbols, union(constants, functions));
    return [node, symbols];
}

function parseFunction(objectiveFunctionString, DIM) {
    let c = new Set(['pi', 'e', 'E', 'i', 'PI', 'sin', 'cos', 'tan', 'cot', 'exp', 'abs', 'sqrt', 'sign', 'log',
        'log10', 'log2', 'nthRoot', 'acos', 'acot', 'asin', 'atan', 'sec', 'norm']);
    try {
        //mapping "(" -> "*("
        let re = /[\w.]+(?=\()/g;
        let r = objectiveFunctionString.match(re);
        if (r !== null) {
            r = r.filter(item => !c.has(item));
            r.forEach(t => {
                objectiveFunctionString = objectiveFunctionString.replace(t, t + '*');
            });
        }
        let returned = createTree(objectiveFunctionString);
        let node = returned[0];
        let symbols = returned[1];
        if (symbols.size !== DIM) { throw "Несоответствие размерностей целевой функции и стартовой точки."; }
        //renaming variables to the hardcoded names
        let symbols_sorted = Array.from(symbols).sort();
        let symbols_new = ['x1', 'x2', 'x3', 'x4', 'x5', 'x6', 'x7', 'x8', 'x9'];
        if (symbols_sorted !== symbols_new) {
            let dict = new Map();
            for (let i = 0; i < symbols_sorted.length; i++) {
                dict.set(symbols_sorted[i], symbols_new[i]);
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
        let compiled_node = node.compile();
        return compiled_node;
    }
    catch (error) {
        return -1;
    }
}
/*function isStartPointCorrect(startPoint, lb, ub) {
    for (let i = 0; i < DIM; i++) {
        if (startPoint[i] > ub[i] || startPoint[i] < lb[i]) {
            return false;
        }
    }
    return true;
}*/

function subtraction(a, b) {
    let r = Object.create(a);
    for (const property in a) {
        r[property] = a[property] - b[property];
    }
    return r;
}
function addition(a, b) {
    let r = Object.create(a);
    for (const property in a) {
        r[property] = a[property] + b[property];
    }
    return r;
}
function multiplication(a, b) {
    let r = Object.create(b);
    if (typeof a === "number") {
        for (const property in b) {
            r[property] = a * b[property];
        }
    }
    else {
        for (const property in a) {
            r[property] = a[property] * b[property];
        }
    }
    return r;
}
function division(a, b) {
    let r = Object.create(a);
    for (const property in a) {
        r[property] = a[property] / b[property];
    }
    return r;
}

function hookeJeeves(x, f, eps, deltaVector, lambda, alpha, lb, ub) {
    x = initializePoint(x);
    let y = x, i = 1, yNext, xNext;
    let functionIterations = 0;
    let checkedPoints = [(Object.values(y).slice(0, DIM))];
    let functionValues = [f.evaluate(y)];
    yNext = Object.assign({}, y);
    loop1: for (; ;) {
        loop2: for (const key in y) {
            //step 2a
            yNext[key] += deltaVector[i - 1];
            if (yNext[key] > ub[i - 1]) {
                yNext[key] = ub[i - 1];
            }
            functionIterations += 2;
            if (f.evaluate(yNext) < f.evaluate(y) - EPS) {
                y = Object.assign({}, yNext);
                checkedPoints.push((Object.values(y).slice(0, DIM)));
                functionValues.push(f.evaluate(y));
            }
            else {//step 2b
                yNext[key] = yNext[key] - 2 * deltaVector[i - 1];//cancel addition on the step2a and then subtraction
                if (yNext[key] < lb[i - 1]) {
                    yNext[key] = lb[i - 1];
                }
                functionIterations += 2;
                if (f.evaluate(yNext) < f.evaluate(y) - EPS) {
                    y = Object.assign({}, yNext);
                    checkedPoints.push((Object.values(y).slice(0, DIM)));
                    functionValues.push(f.evaluate(y));
                }
                else {
                    yNext = Object.assign({}, y);
                }
            }
            //step 3a
            if (i < DIM) {
                i++;
                continue loop2;
            }
            //step 3b
            if (i === DIM) {
                //step 4
                functionIterations += 2;
                if (f.evaluate(yNext) < f.evaluate(x) - EPS) {
                    xNext = Object.assign({}, yNext);
                    y = addition(xNext, multiplication(lambda, (subtraction(xNext, x))));
                    for (const key in y) {
                        if (y[key] > ub[i - 1]) {
                            y[key] = ub[i - 1];
                        }
                        else {
                            if (y[key] < lb[i - 1]) {
                                y[key] = lb[i - 1];
                            }
                        }
                    }
                    x = Object.assign({}, xNext);
                    yNext = Object.assign({}, y);
                    checkedPoints.push((Object.values(yNext).slice(0, DIM)));
                    functionValues.push(f.evaluate(yNext));
                    i = 1;
                    break loop2;
                }
                else {//step 5a
                    let r = deltaVector.filter(item => item < eps + EPS);
                    if (r.length === deltaVector.length) {
                        var xMin = Object.assign({}, x);
                        functionIterations++;
                        var fMin = f.evaluate(x);
                        break loop1;
                    }
                    else {//step 5b
                        for (let i = 0; i < deltaVector.length; i++) {
                            if (deltaVector[i] > eps + EPS) {
                                deltaVector[i] /= alpha;
                            }
                        }
                        y = Object.assign({}, x);
                        yNext = Object.assign({}, x);
                        //x = Object.assign({},xNext);
                        i = 1;
                        break loop2;
                    }
                }
            }
        }
    }
    let methodOutput= new MethodOutput(checkedPoints, functionIterations, xMin, fMin, functionValues)
    return methodOutput;
}


class DoubleSidedMap {
    constructor(keys, values) {
        this.keys = keys;
        this.values = values;
    }
    getByKey(key) {
        const index = this.keys.findIndex(it => it === key);
        return this.values[index];
    }
    getByValue(value) {
        const index = this.values.findIndex(it => it === value);
        return this.keys[index];
    }
}
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function getMinimum(population) {
    let minValue = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < population.length; i++) {
        let v = population[i].value;
        if (v < minValue - EPS) {
            var idxMin = i;
            minValue = v;
        }
    }
    return idxMin;
}
function getMaximum(population) {
    let maxValue = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < population.length; i++) {
        let v = population[i].value;
        if (v - EPS > maxValue) {
            var idxMax = i;
            maxValue = v;
        }
    }
    return idxMax;
}
function arrayContainsIn(mainArr, arr) {
    for (const it of mainArr) {
        let count = 0;
        for (let i = 0; i < it.length; i++) {
            if (Math.abs(it[i] - arr[i]) < EPS) {
                count++;
            }
        }
        if (count === arr.length) {
            return true;
        }
    }
    return false;
}

function geneticBinary(tMax, m, f, lb, ub, li) {
    function buildGrey(li) {
        let grey = new Array(2 ** li);
        grey[0] = "0";
        grey[1] = "1";
        let p = 2;
        for (let i = 2; i <= li; i++) {
            let t = p - 1;
            p *= 2;
            for (let k = Math.floor(p / 2); k < p; k++) {
                grey[k] = grey[t];
                grey[t] = "0" + grey[t];
                grey[k] = "1" + grey[k];
                t--;
            }
        }
        return grey;
    }
    let numbers = new Array(2 ** li);
    for (let i = 0; i < 2 ** li; i++) {
        numbers[i] = i;
    }
    let greys = buildGrey(li);
    let mapGrey = new DoubleSidedMap(numbers, greys);
    let k = 2 ** li - 1;
    class Creature {
        constructor(genotype) {
            this.genotype = genotype;
            this.value = getValue(decode(genotype));
        }
        static crossover(parents) { //одноточечное скрещивание
            let parentA = parents[0].genotype, parentB = parents[1].genotype;
            //parentA=["1110","1000","1010"], B=["0001","0100","0101"] 1..DIM
            //"111010001010"->"111.010001010"->"111101000101"->"1111,0100,0101"
            //"000101000101"->"000.101000101"->"000010001010"->"0000,1000,1010"
            let pA = "", pB = "";
            for (let i = 0; i < DIM; i++) {
                pA += parentA[i];
                pB += parentB[i];
            }
            let len = pA.length;
            let idx = getRandomInt(1, len);
            let pA1 = pA.slice(0, idx), pA2 = pA.slice(idx, len);
            let pB1 = pB.slice(0, idx), pB2 = pB.slice(idx, len);
            let gsch1 = pA1 + pB2;
            let gsch2 = pB1 + pA2;
            let re = new RegExp(`\\d{${li}}`, `g`);
            gsch1 = gsch1.match(re);
            gsch2 = gsch2.match(re);
            let sch1 = new Creature(gsch1), sch2 = new Creature(gsch2);
            return [sch1, sch2];
        }
        mutate() { //инверсия
            let g = this.genotype;
            let gString = "";
            for (let i = 0; i < DIM; i++) {
                gString += g[i];
            }
            let len = gString.length;
            let idx = getRandomInt(1, len);
            let gS1 = gString.slice(0, idx), gS2 = gString.slice(idx, len);
            let gString_ = gS2 + gS1;
            let re = new RegExp(`\\d{${li}}`, `g`);
            this.genotype = gString_.match(re);
            this.value = getValue(decode(this.genotype));
        }
        containsIn(arr) {
            for (const i of arr) {
                if (i.genotype === this.genotype) {
                    return true;
                }
            }
            return false;
        }
    }
    function code(fenotype) {
        let genotype = new Array(DIM);
        //fenotype=[p1,p2,..,pn] -> genotype=["1010","1111",...,"1100"]
        //priznak=pi
        //chromosom="abcd"
        for (let i = 0; i < DIM; i++) {
            let chromosom, beta;
            let priznak = fenotype[i];
            if (Math.abs(priznak - lb[i]) < EPS) {
                beta = 0;
            }
            else {
                let h = (ub[i] - lb[i]) / (k - 1);
                beta = Math.floor((priznak - lb[i]) / h) + 1;//номер признака
                chromosom = mapGrey.getByKey(beta);
            }
            genotype[i] = chromosom;
        }
        return genotype;
    }
    function decode(genotype) {
        let genotypeDecoded = new Array(DIM);
        for (let i = 0; i < DIM; i++) {
            let priznak;
            let gamma = mapGrey.getByValue(genotype[i]);
            if (gamma === 0) {
                priznak = lb[i];
            }
            else {
                if (gamma === k) {
                    priznak = ub[i];
                }
                else {
                    let h = (ub[i] - lb[i]) / (k - 1);
                    priznak = ((lb[i] + (gamma - 1) * h) + (lb[i] + gamma * h)) / 2;
                }
            }
            genotypeDecoded[i] = priznak;
        }
        return genotypeDecoded;
    }
    function getValue(g) {
        let x = initializePoint(g);
        let fx = f.evaluate(x);
        return fx;
    }
    let t = 0, M = 1;
    //шаг 1 начальная популяция
    let P = new Array(m);
    let population = new Array(m);
    //let sumOfValues=0;
    let functionIterations = m, checkedPoints = [], functionValues = [];
    for (let i = 0; i < m; i++) {
        P[i] = new Array(DIM);
        for (let j = 0; j < DIM; j++) {
            P[i][j] = (ub[j] - lb[j]) * Math.random() + lb[j];
        }
        let fenotype = P[i];
        let genotype = code(fenotype);
        let c = new Creature(genotype);
        //sumOfValues+=c.value;
        population[i] = c;
    }
    let idxMin = getMinimum(population);
    let xk = decode(population[idxMin].genotype);
    let xMin = initializePoint(xk);
    let fMin = f.evaluate(xMin);
    if (!arrayContainsIn(checkedPoints, xk)) {
        checkedPoints.push(xk);
        functionValues.push(fMin);
    }
    /*let probabilities=new Array(m+1);
    probabilities[0]=0;
    for (let i = 1; i < m+1; i++) {
        probabilities[i]=probabilities[i-1]+population[i-1].value/sumOfValues;
    }*/
    //шаг 2. селекция
    step2: for (; ;) {
        let probabilityInterval = new Array(m + 1);
        let parents = [];
        probabilityInterval[0] = 0;
        for (let i = 1; i < m + 1; i++) {
            probabilityInterval[i] = probabilityInterval[i - 1] + 1 / m; //панмиксия
        }
        masterLoop: for (; ;) {
            let coin = Math.random();
            slaveLoop: for (let i = 1; i < m + 1; i++) {
                if (probabilityInterval[i - 1] < coin && coin < probabilityInterval[i]) {
                    let childCandidate = population[i - 1];
                    if (!childCandidate.containsIn(parents)) {
                        parents.push(childCandidate);
                        if (parents.length === 2) {
                            break masterLoop;
                        }
                        else {
                            continue masterLoop;
                        }
                    }
                    else {
                        continue masterLoop;
                    }
                }
            }
        }
        //шаг 3 скрещивание
        let [sch1, sch2] = Creature.crossover(parents);
        //шаг 4 мутация
        sch1.mutate();
        sch2.mutate();
        functionIterations += 2;
        let idxMax = getMaximum(population);
        let coin = Math.random();
        if (coin - EPS > 0.5) {
            population[idxMax] = sch1;
        }
        else {
            population[idxMax] = sch2;
        }
        let idxMin = getMinimum(population);
        let xk = decode(population[idxMin].genotype);
        xMin = initializePoint(xk);
        fMin = f.evaluate(xMin);
        if (!arrayContainsIn(checkedPoints, xk)) {
            checkedPoints.push(xk);
            functionValues.push(fMin);
        }
        if (M < m) {
            M++;
            continue step2;
        }
        if (M === m) {
            t++;
        }
        if (t === tMax) {
            let idxMin = getMinimum(population);
            let xk = decode(population[idxMin].genotype);
            xMin = initializePoint(xk);
            fMin = f.evaluate(xMin);
            if (!arrayContainsIn(checkedPoints, xk)) {
                checkedPoints.push(xk);
                functionValues.push(fMin);
            }
            break step2;
        }
        else {
            M = 1;
            continue step2;
        }
    }
    let methodOutput= new MethodOutput(checkedPoints, functionIterations, xMin, fMin, functionValues)
    return methodOutput;
}
function particleSwarm(f, lb, ub, K, np, niVector, omega, alpha, beta) {
    let NImin = niVector[0], NImax = niVector[1];
    class Creature {
        constructor(position) {
            this.position = position;
            this.bestPosition = position;
            this.value = f.evaluate(initializePoint(position));
            this.speed = new Array(DIM);
            for (let i = 0; i < DIM; i++) {
                this.speed[i] = 0;
            }
        }
        changePosition(bestPositionOfNeighbors) {
            let first, second, third;
            first = math.multiply(omega, this.speed);
            masterLoop: for (let i = 0; i < 20; i++) {
                let r1 = Math.random(), r2 = Math.random();
                second = math.multiply((alpha * r1), math.subtract(this.bestPosition, this.position));
                third = math.multiply((omega * beta * r2), math.subtract(bestPositionOfNeighbors, this.position));
                this.speed = math.add(first, second, third);
                this.position = math.add(this.position, this.speed);
                slaveLoop: for (let i = 0; i < DIM; i++) {
                    if (this.position[i] - EPS > ub[i] || this.position[i] < lb[i] - EPS) {
                        continue masterLoop;
                    }
                    else {
                        break masterLoop;
                    }
                }
            }
            for (let i = 0; i < DIM; i++) {
                if (this.position[i] - EPS > ub[i]) {
                    this.position[i] = ub[i];
                }
                else {
                    if (this.position[i] < lb[i] - EPS) {
                        this.position[i] = lb[i];
                    }
                }
            }
            let posValue = f.evaluate(initializePoint(this.position));
            this.value = posValue;
            if (posValue < f.evaluate(initializePoint(this.bestPosition)) - EPS) {
                this.bestPosition = this.position;
            }
        }
    }
    //step 2
    let P = new Array(np);
    let population = new Array(np);
    let functionIterations = 0, checkedPoints = [], functionValues = [];
    for (let i = 0; i < np; i++) {
        P[i] = new Array(DIM);
        for (let j = 0; j < DIM; j++) {
            P[i][j] = (ub[j] - lb[j]) * Math.random() + lb[j];
        }
        let creaturePosition = P[i];
        let c = new Creature(creaturePosition);
        population[i] = c;
    }
    let idxMin = getMinimum(population);
    let xArr = population[idxMin].position;
    let xMin = initializePoint(xArr);
    let fMin = f.evaluate(xMin);
    if (!arrayContainsIn(checkedPoints, xArr)) {
        checkedPoints.push(xArr);
        functionValues.push(fMin);
    }
    //step 3
    for (let k = 0; k < K; k++) {
        for (let j = 0; j < np; j++) {
            let ni = getRandomInt(NImin, NImax + 1);//+1 because NImax should present.
            let neighbors = new Set();
            while (neighbors.size < ni) {
                let idx = getRandomInt(0, np);
                neighbors.add(population[idx]);
            }
            let minValueOfNeighbors = Number.MAX_SAFE_INTEGER;
            let bestPositionOfNeighbors;
            for (const c of neighbors) {
                if (c.value < minValueOfNeighbors - EPS) {
                    minValueOfNeighbors = c.value;
                    bestPositionOfNeighbors = c.position;
                }
            }
            //step 4
            let c = population[j];
            functionIterations += 2;
            c.changePosition(bestPositionOfNeighbors);
            let idxMin = getMinimum(population);
            let xArr = population[idxMin].position;
            let xMin = initializePoint(xArr);
            let fMin = f.evaluate(xMin);
            if (!arrayContainsIn(checkedPoints, xArr)) {
                checkedPoints.push(xArr);
                functionValues.push(fMin);
            }
        }
    }
    idxMin = getMinimum(population);
    xArr = population[idxMin].position;
    xMin = initializePoint(xArr);
    fMin = f.evaluate(xMin);
    if (!arrayContainsIn(checkedPoints, xArr)) {
        checkedPoints.push(xArr);
        functionValues.push(fMin);
    }
    let methodOutput= new MethodOutput(checkedPoints, functionIterations, xMin, fMin, functionValues)
    return methodOutput;
}
function tabuSearch(f, lb, ub, M, N, L,allowModification) {
    let functionIterations = 0;
    let maxEdge = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < DIM; i++) {
        let edge = ub[i] - lb[i];
        if (edge - EPS > maxEdge) {
            maxEdge = edge;
        }
    }
    const delta = maxEdge;
    const Rtr = delta / 100, Rstr = delta / 50;
    const p = delta / 5;
    const gamma = 0.25;
    const L_ = 2 * DIM;
    const Nmax = 1, Nmin = 1 / L;
    const Mmax = 1, Mmin = 1 / L;
    class TabuList {
        constructor(arr) {
            this.points = arr;
            this.length = arr.length;
        }
        push(item) {
            for (let i = 0; i < this.points.length; i++) {
                this.points[i].Ir++;
            }
            this.points.push(item);
            this.length++;
            this.points.sort((a, b) => { return a.value - b.value });
            for (let i = 1; i <= this.points.length; i++) {
                this.points[i - 1].If = i;
            }

            for (let i = 0; i < this.points.length; i++) {
                let item = this.points[i];
                let Mr = Nmin + (Nmax - Nmin) * (L - item.Ir) / (L - 1);
                if (item.If <= L_) {
                    var Mf = Mmin + (Mmax - Mmin) * (L_ - item.If) / (L_ - 1);
                }
                else {
                    var Mf = Mmin;
                }
                this.points[i].mValue = Math.max(Mr, Mf);
            }
        }
        index(i) {
            return this.points[i];
        }
        remove(index) {
            let Ir_ = this.points[index].Ir; //8 out of 10
            for (let i = 0; i < this.points.length; i++) {
                if (this.points[i].Ir > Ir_) {
                    this.points[i].Ir--;
                }
            }
            this.points.splice(index, 1); //removing
            this.length--;
        }
    }
    class TabuPoint {
        constructor(coordinate) {
            this.coordinate = coordinate;
            this.value = f.evaluate(initializePoint(coordinate));
            this.Ir = 1;
            this.If = 1;
            this.mValue = 0;
        }
    }
    class Region {
        constructor(coordinate) {
            this.coordinate = coordinate;
            this.p = p;
            this.phi = 1;
        }
    }

    function getCentersOfTouchedSemiTabuRegions(tabuList, x, Rstr) {
        let centers = [];
        for (let i = 0; i < tabuList.length; i++) {
            let t = tabuList.index(i).coordinate;
            let lp = 0;
            for (let j = 0; j < DIM; j++) {
                lp += (x[j] - t[j]) ** 2;
            }
            if (lp < Rstr ** 2 - EPS) {
                centers.push(t);
            }
        }
        return centers;
    }
    function getMaxDistance(x, t) {
        let Dmax = Number.MIN_SAFE_INTEGER;
        for (let i = 0; i < t.length; i++) {
            let r = math.norm(math.subtract(x, t[i]));
            if (r > Dmax) {
                Dmax = r;
            }
        }
        return Dmax;
    }
    function getDirection(x, t_) {
        let d = new Array(DIM);
        for (let i = 0; i < DIM; i++) {
            d[i] = Math.sign(x[i] - t_[i]);
        }
        return d;
    }
    function getStep(delta, Dmax, Rtr) {
        let delta_ = new Array(DIM);
        for (let i = 0; i < DIM; i++) {
            let r = Math.random();
            if (r === 0) {
                r = EPS;
            }
            delta_[i] = delta * (1 + r) / 10;
            if (delta_[i] < Dmax + Rtr) {
                delta_[i] += Rtr;
                if (delta_[i] < Dmax + Rtr) {
                    delta_[i] += Dmax;
                }
            }
        }
        return delta_;
    }
    function adaptiveSearch(x, y, delta) {
        let sumOfDeltaF = 0;
        let fx = f.evaluate(initializePoint(x));
        let w = new Array(DIM), u = new Array(DIM), v = new Array(DIM);
        for (let i = 0; i < DIM; i++) {
            v[i] = 0;
        }
        for (let i = 0; i < DIM; i++) {
            let df = f.evaluate(initializePoint(y[i])) - fx;
            functionIterations++;
            w[i] = df;
            sumOfDeltaF += df;
        }
        for (let i = 0; i < DIM; i++) {
            w[i] /= sumOfDeltaF;
            let a = math.subtract(y[i], x);
            let zer = math.zeros(DIM);
            let uNum = math.subtract(zer, a);
            let uDen = math.norm(a);
            u[i] = math.divide(uNum, uDen);
            v = math.add(v, math.multiply(w[i], u[i]));
        }
        for (let i = 0; i < 2; i++) {
            let sigma = Math.random() + i;
            if (sigma === i) { sigma = EPS; }
            let alpha = sigma * delta / 10;
            let rp = math.multiply(alpha, math.divide(v, math.norm(v)));
            let newPoint = math.add(x, rp);
            for (let i = 0; i < DIM; i++) {
                if (newPoint._data[i] > ub[i]) {
                    newPoint._data[i] = ub[i];
                }
                else {
                    if (newPoint._data[i] < lb[i]) {
                        newPoint._data[i] = lb[i];
                    }
                }
            }
            y.push(newPoint._data);
        }
        let fMin = Number.MAX_SAFE_INTEGER;
        for (let i = 0; i < y.length; i++) {
            functionIterations++;
            let fy = f.evaluate(initializePoint(y[i]));
            if (fy < fMin) {
                fMin = fy;
                var xNext = y[i];
            }
        }
        return xNext;
    }
    function updateTabuList(xNext, tabuList, L) {
        let tabuPoint = new TabuPoint(xNext);
        functionIterations++;
        if (tabuList.length < L) {
            tabuList.push(tabuPoint);
        }
        else {
            let minValue = Number.MAX_SAFE_INTEGER;
            let idxMin;
            for (let i = 0; i < tabuList.length; i++) {
                if (tabuList.index(i).mValue < minValue) {
                    minValue = tabuList.index(i).mValue;
                    idxMin = i;
                }
            }
            tabuList.remove(idxMin);
            tabuList.push(tabuPoint);
        }
    }
    function updateVisitedRegionList(xNext, visitedRegionList) {
        let isRegionTouched = false;
        for (let i = 0; i < visitedRegionList.length; i++) {
            let t = visitedRegionList[i].coordinate;
            let lp = 0;
            for (let j = 0; j < DIM; j++) {
                lp += (xNext[j] - t[j]) ** 2;
            }
            if (lp < visitedRegionList[i].p ** 2 - EPS) {
                visitedRegionList[i].phi++;
                isRegionTouched = true;
            }
        }
        if (!isRegionTouched) {
            let newRegion = new Region(xNext);
            visitedRegionList.push(newRegion);
        }
    }
    let tabuList = new TabuList([]);
    let visitedRegionList = [], checkedPoints = [], functionValues = [];
    let x = new Array(DIM);
    for (let i = 0; i < DIM; i++) {
        x[i] = Math.random() * (ub[i] - lb[i]) + lb[i];
    }
    for (let j = 0; j < N; j++) {
        //step 2.1 исследовательский поиск
        for (let k = 0; k < M; k++) {
            //step 2.1.1
            checkedPoints.push(x);
            functionValues.push(f.evaluate(initializePoint(x)));
            let t = getCentersOfTouchedSemiTabuRegions(tabuList, x, Rstr);
            let v = t.length;
            if (v !== 0) {
                let sum = new Array(DIM), t_ = new Array(DIM);
                for (let i = 0; i < DIM; i++) {
                    sum[i] = 0;
                    t_[i] = 0;
                }
                for (let i = 0; i < t.length; i++) {
                    sum = math.add(sum, t[i]);
                }
                t_ = math.divide(sum, v);
                var Dmax = getMaxDistance(x, t);
                var directionVector = getDirection(x, t_);
            }
            else {
                var directionVector = new Array(DIM);
                for (let i = 0; i < DIM; i++) {
                    let coin = Math.random();
                    if (coin > 0.5) {
                        directionVector[i] = 1;
                    }
                    else {
                        directionVector[i] = -1;
                    }
                }
                var Dmax = 0;
            }
            //step 2.1.2
            let delta_ = getStep(delta, Dmax, Rtr);
            //step 2.1.3
            var y = new Array(DIM);
            let fxNext = Number.MAX_SAFE_INTEGER;
            var xNext = Object.values(x).slice(0, DIM);
            for (let i = 0; i < DIM; i++) {
                y[i] = new Array(DIM);
                for (let j = 0; j < DIM; j++) {
                    y[i][j] = x[j];
                }
                y[i][i] += delta_[i] * directionVector[i];
                if (y[i][i] > ub[i]) {
                    y[i][i] = ub[i];
                }
                else {
                    if (y[i][i] < lb[i]) {
                        y[i][i] = lb[i];
                    }
                }
                functionIterations++;
                let fy = f.evaluate(initializePoint(y[i]));
                if (fy < fxNext) {
                    fxNext = fy;
                    xNext = y[i];
                }
            }
            //step 2.1.4
            functionIterations++;
            if (!(fxNext < f.evaluate(initializePoint(x)))) {
                if (allowModification===true){
                    //t0,iters,c,beta
                    let returned=simulatedAnnealing(5,50,x,f,0.85,0.96,lb,ub);
                    functionIterations+=returned.functionIterations;
                    xNext=Object.values(returned.xMin).slice(0, DIM);
                }
                else{
                    xNext = adaptiveSearch(x, y, delta);
                }
            }
            //step 2.1.5
            updateTabuList(x, tabuList, L);
            updateVisitedRegionList(x, visitedRegionList);
            x = Object.assign([],xNext);
        }
        //step 2.2 перераспределительный поиск
        masterLoop: for (; ;) {
            var z = new Array(DIM);
            for (let i = 0; i < DIM; i++) {
                z[i] = Math.random() * (ub[i] - lb[i]) + lb[i];
            }
            for (let i = 0; i < visitedRegionList.length; i++) {
                let r = visitedRegionList[i];
                let Phi = gamma * (1 - Math.exp(-gamma * (r.phi - 1)));
                let s = (1 + Phi) * math.norm(math.subtract(r.coordinate, z));
                if (s / p < 1) {
                    continue masterLoop;
                }
            }
            break masterLoop;
        }
        x = Object.assign([],z);
    }
    //step 3 интенсивно-уточняющий поиск
    let eps = 0.2, deltaVector = [1, 1], lambda = 1, alpha = 1.2;
    let fMin = Number.MAX_SAFE_INTEGER;
    for (let i = 0; i < L_; i++) {
        let startPoint = tabuList.index(i).coordinate;
        let returnedFromMethod = hookeJeeves(startPoint, f, eps, deltaVector, lambda, alpha, lb, ub);
        functionIterations += returnedFromMethod.functionIterations;
        let returnedfMin = returnedFromMethod.fMin;
        if (returnedfMin < fMin) {
            fMin = returnedfMin;
            var xMin = returnedFromMethod.xMin;
            checkedPoints.push(Object.values(xMin).slice(0, DIM));
            functionValues.push(fMin);
        }
    }
    let methodOutput= new MethodOutput(checkedPoints, functionIterations, xMin, fMin, functionValues)
    return methodOutput;
}
function startOptimization(selectedMethodString, params) {
    let objectiveFunctionString = params.objectiveFunction;
    /*if (params.Aeq !== undefined || params.Beq !== undefined){
        var Aeq=params.Aeq;
        var Beq=params.Beq;
    }*/
    let re = /[\w.-]+/g;
    let lowerBound = params.lowerBound.match(re);
    let upperBound = params.upperBound.match(re);
    
    DIM = lowerBound.length;
    for (let i = 0; i < DIM; i++) {
        lowerBound[i] = parseFloat(lowerBound[i]);
        upperBound[i] = parseFloat(upperBound[i]);
        if (isNaN(lowerBound[i])) {
            lowerBound[i] = Number.MIN_SAFE_INTEGER;
        }
        if (isNaN(upperBound[i])) {
            upperBound[i] = Number.MAX_SAFE_INTEGER;
        }
    }

    let objectiveFunction = parseFunction(objectiveFunctionString, DIM);
    if (objectiveFunction === -1) {
        return -1;
    }
    
    switch (selectedMethodString) {
        case "HJ": {
            if (CheckStringVector(params.startPoint)!==0){
                return -2;
            }
            let allowModification=params.mod;
            if (allowModification===undefined){
                allowModification=false;
            }
            
            let eps = parseFloat(params.eps);
            let alpha = parseFloat(params.alpha);
            let lambda = parseFloat(params.lambda);
            let deltaVector = params.deltaVector.match(/[\d.]+/g);
            for (let i = 0; i < deltaVector.length; i++) {
                deltaVector[i] = parseFloat(deltaVector[i]);
            }

            
            if (allowModification===true){
                let pointsList=[],point;
                let n=100;
                for (let i = 0; i < n; i++) {
                    point=[getRandomInt(lowerBound[0],upperBound[0]),getRandomInt(lowerBound[1],upperBound[1])];
                    pointsList.push(point);
                }
                //[checkedPoints, functionIterations, xMin, fMin, functionValues];
                let minF=Number.MAX_SAFE_INTEGER;
                let bestResult, totalFunctionIterations=0;
                var start=Date.now();
                for (let i = 0; i < n; i++) {
                    let startPoint=pointsList[i];
                    let returned = hookeJeeves(startPoint, objectiveFunction, eps, deltaVector, lambda, alpha, lowerBound, upperBound);
                    let curF=returned.fMin;
                    totalFunctionIterations+=returned.functionIterations;
                    if (curF < minF){
                        minF=curF;
                        bestResult = Object.assign([],returned);
                    }
                }
                var methodTime=Date.now()-start;
                bestResult.functionIterations=totalFunctionIterations;
                var returnedFromMethod = Object.assign([],bestResult);
            }
            else{
                let startPoint = parseStartPoint(params.startPoint,lowerBound,upperBound);
                if (startPoint === -2) {
                    return -2;
                }
                var start=Date.now();
                var returnedFromMethod = hookeJeeves(startPoint, objectiveFunction, eps, deltaVector, lambda, alpha, lowerBound, upperBound);
                var methodTime=Date.now()-start;
            }
            break;
        }
        case "SA": {
            if (CheckStringVector(params.startPoint)!==0){
                return -2;
            }
            let startPoint = parseStartPoint(params.startPoint,lowerBound,upperBound);
            if (startPoint === -2) {
                return -2;
            }
            let maxIter = parseInt(params.maxIterations);
            let startT = parseFloat(params.initialTemperature);
            let c = parseFloat(params.c);
            let beta = parseFloat(params.beta);
            
            
            var start=Date.now();
            var returnedFromMethod = simulatedAnnealing(startT, maxIter, startPoint, objectiveFunction, c, beta, lowerBound, upperBound);
            var methodTime=Date.now()-start;
            break;
        }
        case "Genetic": {
            let tMax = parseInt(params.maxIterations), m = parseInt(params.m), li = parseInt(params.li);
            var start=Date.now();
            var returnedFromMethod = geneticBinary(tMax, m, objectiveFunction, lowerBound, upperBound, li);
            var methodTime=Date.now()-start;
            break;
        }
        case "Swarm": {
            let maxIter = parseInt(params.maxIterations);
            let np = parseInt(params.np);
            let ni = params.ni.match(/[\d.]+/g);
            for (let i = 0; i < ni.length; i++) {
                ni[i] = parseInt(ni[i]);
            }
            let omega = parseFloat(params.omega);
            let alpha = parseFloat(params.alpha);
            let beta = parseFloat(params.beta);
            var start=Date.now();
            var returnedFromMethod = particleSwarm(objectiveFunction, lowerBound, upperBound,
                maxIter, np, ni, omega, alpha, beta);
            var methodTime=Date.now()-start;
            break;
        }
        case "Tabu": {
            let M = parseInt(params.M), N = parseInt(params.N), L = parseInt(params.L);
            let allowModification=params.mod;
            if (allowModification === undefined){
                allowModification=false;
            }
            var start=Date.now();
            var returnedFromMethod = tabuSearch(objectiveFunction, lowerBound, upperBound,
                M, N, L,allowModification);
            var methodTime=Date.now()-start;
            break;
        }
        // no default
    }
    let checkedPoints, functionIterations, xMin, fMin, functionValues;
    checkedPoints = returnedFromMethod.checkedPoints;
    functionIterations = returnedFromMethod.functionIterations;
    xMin = returnedFromMethod.xMin;
    fMin = returnedFromMethod.fMin;
    functionValues = returnedFromMethod.functionValues;
    let data={
        checkedPoints:checkedPoints,
        functionIterations:functionIterations,
        xMin:xMin,
        fMin: fMin,
        DIM: DIM,
        functionValues:functionValues,
        methodTime : methodTime
    }
    if (DIM <= 2) {
        let [X, Y, checkedPointsT, labelsList] = getValuesForPlot(objectiveFunction, lowerBound, upperBound, checkedPoints);
        data.X=X;
        data.Y=Y;
        data.checkedPointsT=checkedPointsT;
        data.labelsList=labelsList;
    }
    return data;
}
export { startOptimization, CheckStringVector };
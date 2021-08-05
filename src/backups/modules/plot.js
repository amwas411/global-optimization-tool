var DIM;
function GetPlot(X, Z, labelsList, checkedPoints, fMin) {
    console.log(checkedPoints);
    let scatterData = {
        x: checkedPoints[0],
        y: checkedPoints[1],
        type: "scatter",
        line: { color: "red" },
        marker: { width: 5 },
        text: labelsList,
        textposition: "top center",
        mode: "lines+markers+text",
        textfont: { color: "black" },
        hoverinfo: "x+y+z",
        name: "Search trace"
    };
    switch (DIM) {
        case 1:
            var contourData = {
                x: X[0],
                y: Z,
                type: "scatter",
                line: { color: "black" },
                marker: { width: 5 },
                hoverinfo: "x+y",
                name: "Objective function"
            };
            break;
        case 2:
            var contourData = {
                x: X[0],
                y: X[1],
                z: Z,
                type: "contour",
                contours: { start: fMin - 20, end: fMin + 100, size: 10 },
                name: "Contour plot"
            };

            break;
        default:
            break;
    }
    let data = [scatterData, contourData];

    let layout = {
        margin: { t: 10 },
        hovermode: "closest"
    };
    return [data,layout];
}

function GetResults(returned) {
    let methodIterations, functionIterations, fMin, xMin,checkedPoints;
    if (returned.length === 9) {
        let X, Z, labelsList;
        X = returned[0];
        Z = returned[1];
        let checkedPointsT = returned[2];
        checkedPoints = returned[2];
        labelsList = returned[3];
        methodIterations = returned[4];
        functionIterations = returned[5];
        fMin = returned[6];
        xMin = returned[7];
        DIM = returned[8];
        var plotReturned = GetPlot(X, Z, labelsList, checkedPointsT, fMin);
        plotReturned.push(checkedPointsT[0].length);
    }
    else {
        checkedPoints = returned[0];
        methodIterations = returned[1];
        functionIterations = returned[2];
        fMin = returned[3];
        xMin = returned[4];
        DIM = returned[5];
        var plotReturned = [[],{}];
        plotReturned.push(checkedPoints.length);
    }
    plotReturned.push(methodIterations, functionIterations, fMin, xMin,checkedPoints);
    return plotReturned;    
}
export default GetResults;
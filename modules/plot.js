function getPlot(X, Z, labelsList, checkedPoints, xMin,fMin,DIM) {
    let scatterData = {
        x: checkedPoints[0],
        y: checkedPoints[1],
        type: "scatter",
        line: { color: "red" },
        text: labelsList,
        textposition: "top center",
        mode: "lines+markers+text",
        textfont: { color: "white" },
        hoverinfo: "x+y+z",
        name: "Линия поиска"
    };
    
    switch (DIM) {
        case 1:
            var contourData = {
                x: X[0],
                y: Z,
                type: "scatter",
                line: { color: "black" },
                hoverinfo: "x+y",
                name: "Целевая функция"
            };
            var scatterMinData = {
                x: [xMin.x1],
                y: [fMin],
                type: "scatter",
                line: { color: "Green" },
                marker: { symbol:"diamond",size:10 },
                hoverinfo: "x+y+z",
                name: "x*"
            };
            break;
        case 2:
            var contourData = {
                x: X[0],
                y: X[1],
                z: Z,
                type: "contour",
                contours: { start: -900, end: 600, size: 20 },
                name: "Линии уровня"
            };
            var scatterMinData = {
                x: [xMin.x1],
                y: [xMin.x2],
                type: "scatter",
                line: { color: "Green" },
                marker: { symbol:"diamond",size:10 },
                hoverinfo: "x+y+z",
                name: "x*"
            };
            break;
        default:
            break;
    }
    let data = [scatterData,scatterMinData, contourData];

    let layout = {
        margin: { t: 10 },
        hovermode: "closest",
        showlegend: false
    };
    return [data,layout];
}

export default getPlot;
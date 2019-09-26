// https://observablehq.com/@tushn/d3-com-crossfilter-e-dc-js@489
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# D3 com Crossfilter e DC.js`
)});
  main.variable(observer("dataset")).define("dataset", ["d3"], function(d3){return(
d3.csv("https://gist.githubusercontent.com/emanueles/d8df8d875edda71aa2e2365fae2ce225/raw/1e949d3da02ed6caa21fe3a7a12a4e5a611a4bab/stocks.csv").then(function(data){
  // formatando nossos dados
  let parseDate = d3.timeParse("%Y/%m/%d")
  data.forEach(function(d,i){
       d.date = parseDate(d.date)
       d.google = +d.google
       d.facebook = +d.facebook
   })
  return data
})
)});
  main.variable(observer("facts")).define("facts", ["crossfilter","dataset"], function(crossfilter,dataset){return(
crossfilter(dataset)
)});
  main.variable(observer("dateDim")).define("dateDim", ["facts"], function(facts){return(
facts.dimension( d => d.date)
)});
  main.variable(observer()).define(["dateDim"], function(dateDim){return(
dateDim
)});
  main.variable(observer("googleDim")).define("googleDim", ["facts"], function(facts){return(
facts.dimension( d => d.google)
)});
  main.variable(observer("googleDimGroup")).define("googleDimGroup", ["googleDim"], function(googleDim){return(
googleDim.group()
)});
  main.variable(observer("topTenGoogle")).define("topTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.top(10)
)});
  main.variable(observer("bottomTenGoogle")).define("bottomTenGoogle", ["googleDim"], function(googleDim){return(
googleDim.bottom(10)
)});
  main.variable(observer("googleByDayGroup")).define("googleByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.google)
)});
  main.variable(observer()).define(["dataset"], function(dataset){return(
dataset[0]['google']
)});
  main.variable(observer("fbByDayGroup")).define("fbByDayGroup", ["dateDim"], function(dateDim){return(
dateDim.group().reduceSum(d => d.facebook)
)});
  main.variable(observer("container")).define("container", function(){return(
function container(id, title) { 
  return `
<div class='container'>
<div class='content'>
<div class='container'>
<div class='row'>
    <div class='span12' id='${id}'>
      <h4>${title}</h4>
    </div>
  </div>
</div>
</div>
</div>`
}
)});
  main.variable(observer("buildvis")).define("buildvis", ["md","container","dc","d3","dateDim","googleByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup)
{
  let view = md`${container('chart','Valores das ações do Google')}`
  let lineChart = dc.lineChart(view.querySelector("#chart"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  lineChart.width(800)
           .height(400)
           .dimension(dateDim)
           .margins({top: 30, right: 50, bottom: 25, left: 40})
           .renderArea(false)
           .x(xScale)
           .xUnits(d3.timeDays)
           .renderHorizontalGridLines(true)
           .legend(dc.legend().x(680).y(10).itemHeight(13).gap(5))
           .brushOn(false)
           .group(googleByDayGroup, 'Google')
  dc.renderAll()
  return view      
}
);
  main.variable(observer("buildcomposite")).define("buildcomposite", ["md","container","dc","d3","dateDim","googleByDayGroup","fbByDayGroup"], function(md,container,dc,d3,dateDim,googleByDayGroup,fbByDayGroup)
{
  let view = md`${container('chart2', 'Valores das ações do Google e do Facebook')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart2"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleByDayGroup, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(fbByDayGroup, 'Facebook')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("acoes")).define("acoes", ["md","container","dc","d3","dateDim","dataset"], function(md,container,dc,d3,dateDim,dataset)
{
  let view = md`${container('chart3', 'Valores das ações do Google e do Facebook em relação ao primeiro valor de cada em percentual')}`
  let compositeChart = dc.compositeChart(view.querySelector("#chart3"))
  let xScale = d3.scaleTime()
                  .domain([dateDim.bottom(1)[0].date, dateDim.top(1)[0].date])
  
  let googleByDayGroupPerMean = dateDim.group().reduceSum(d => 100*(d.google/dataset[0]['google']-1))
  let fbByDayGroupPerMean = dateDim.group().reduceSum(d => 100*(d.facebook/dataset[0]['facebook']-1))
  
  compositeChart.width(800)
              .height(400)
              .margins({top: 50, right: 50, bottom: 25, left: 40})
              .dimension(dateDim)
              .x(xScale)
              .xUnits(d3.timeDays)
              .renderHorizontalGridLines(true)
              .legend(dc.legend().x(700).y(5).itemHeight(13).gap(5))
              .brushOn(false)    
              .compose([
                  dc.lineChart(compositeChart)
                    .group(googleByDayGroupPerMean, 'Google')
                    .ordinalColors(['steelblue']),
                  dc.lineChart(compositeChart)
                    .group(fbByDayGroupPerMean, 'Facebook')
                    .ordinalColors(['darkorange'])])
  dc.renderAll()
  return view      
}
);
  main.variable(observer("dataset_movies")).define("dataset_movies", ["d3"], function(d3){return(
d3.json("https://raw.githubusercontent.com/emanueles/datavis-course/master/assets/files/observable/movies.json").then(function(data){
  /*
  let year = {}
  
  data.forEach(function(d,i){
    //year[d['Year']] += +d['Worldwide_Gross_M']
      if(year[d['Year']]==undefined){
        year[d['Year']] = +d['Worldwide_Gross_M']
      }else{
        year[d['Year']] += +d['Worldwide_Gross_M']
      }
   })
  let values = Object.values(year)
  let keys = Object.keys(year)
  let years = []
  for(var i=0;i<keys.length;i++){
    years.push(Object({year:keys[i], gross:values[i]}))
  }
  return years*/
  data.forEach(function(d,i){
    d.genre = d['Genre']
    d.gross = +d['Worldwide_Gross_M']
    d.budget = +d['Budget_M'] 
    d.year = Number(d['Year'])
  })
  return data
})
)});
  main.variable(observer("facts_movies")).define("facts_movies", ["crossfilter","dataset_movies"], function(crossfilter,dataset_movies){return(
crossfilter(dataset_movies)
)});
  main.variable(observer("genre_dim")).define("genre_dim", ["facts_movies"], function(facts_movies){return(
facts_movies.dimension(d => d.genre)
)});
  main.variable(observer("year_dim")).define("year_dim", ["facts_movies"], function(facts_movies){return(
facts_movies.dimension(d => +d.year)
)});
  main.variable(observer("gross_dim")).define("gross_dim", ["facts_movies"], function(facts_movies){return(
facts_movies.dimension(d => d.gross)
)});
  main.variable(observer("grossByYearGroup")).define("grossByYearGroup", ["year_dim"], function(year_dim){return(
year_dim.group().reduceSum(d => d.gross)
)});
  main.variable(observer("grossByGenreGroup")).define("grossByGenreGroup", ["genre_dim"], function(genre_dim){return(
genre_dim.group().reduceSum(d => d.gross)
)});
  main.variable(observer("by_year")).define("by_year", ["md","container","dc","year_dim","d3","grossByYearGroup"], function(md,container,dc,year_dim,d3,grossByYearGroup)
{
  /*const margin = {top: 40, right: 40, bottom: 40, left: 40}
  // Depois definimos width e height como as dimensões internas
  // da área do gráfico (área útil)
  const width = 500 - margin.left - margin.right
  const height = 400 - margin.top - margin.bottom

  let yScale = d3.scaleLinear()
                  .domain([0, d3.max(dataset_movies, d => d['gross'])])
                  .range([0,height])
  let xScale = d3.scaleTime().range([0, 180]) //d3.scaleLinear().domain([0, d3.max(dataset_movies, d => d['year'])]).range([0,width])
  
  const outersvg = d3.select(DOM.svg(width + margin.left + margin.right, height + margin.top + margin.bottom))
  const svg = outersvg.append('g').attr("transform", "translate(" + margin.left + "," + margin.top + ")")
  
  //const svg = d3.select(DOM.svg(width, height))
  let view = md`${container('by_year','Valores das ações do Google')}`
  svg.selectAll('by_year')
    .data(dataset_movies)
    .enter()
      .append('rect')
      .attr('x', (d, i) => i * width/10)
      .attr('y', (d) => height-yScale(d['gross']))
      //.attr('y', (d) => 80)
      .attr('width', 30)
      .attr('height', (d) => yScale(d['gross'])) // Configura a altura de cada barra
      .attr("fill", "#1e77b4");
  
  let xAxis = d3.axisBottom()
                .scale(xScale)
                .ticks(5)
                //.tickValues( (d) => d['year'] )

  //let x.domain(d3.extent(data, function(d) { return d.date; }));
  let yAxis = d3.axisLeft()
                .scale(yScale)
                .ticks(6)
  svg.append("g")
     .call(yAxis)
  
  svg.append("g")
     .attr("transform", "translate(0, "+ height + ")" )
     .call(xAxis)  
  
  svg.append("text")
      .attr("transform", "translate(" + (width/4) + "," + (height+margin.bottom) + ")")//(height + margin.bottom) + ")")
      .style("text-anchor", "middle")
      .attr("font-family", "sans-serif")
      .attr("font-size", "12px")
      .text("Eixo X");

  return outersvg.node()*/
  
  let view = md`${container('chart_by_year', 'Total Arrecadado nas Bilheterias por ano em Milhões de Dólares')}`
  let barChart = dc.barChart(view.querySelector("#chart_by_year"))
  
  barChart.width(500)
          .height(400)
          .margins({top: 40, right: 40, bottom: 40, left: 40})
          .dimension(year_dim)
          .x(d3.scaleBand())
          .xUnits(dc.units.ordinal)
          .brushOn(true)
          .gap(30)
          .group(grossByYearGroup)
  
  barChart.render()
    
  return view
}
);
  main.variable(observer("by_genre")).define("by_genre", ["md","container","dc","genre_dim","d3","grossByGenreGroup"], function(md,container,dc,genre_dim,d3,grossByGenreGroup)
{

  let view = md`${container('chart_by_genre', 'Total Arrecadado nas Bilheterias por Gênero de 2007 a 2011 (em Milhões de Dólares)')}`
  let barChart = dc.barChart(view.querySelector("#chart_by_genre"))
  
  barChart.width(500)
          .height(400)
          .margins({top: 40, right: 40, bottom: 40, left: 40})
          .dimension(genre_dim)
          .x(d3.scaleBand())
          .xUnits(dc.units.ordinal)
          .brushOn(true)
          .gap(10)
          .group(grossByGenreGroup)
  
  barChart.render()
    
  return view
}
);
  main.variable(observer()).define(["html"], function(html){return(
html`Esta célula inclui o css do dc.
<style>
.dc-chart path.dc-symbol, .dc-legend g.dc-legend-item.fadeout {
  fill-opacity: 0.5;
  stroke-opacity: 0.5; }

.dc-chart rect.bar {
  stroke: none;
  cursor: pointer; }
  .dc-chart rect.bar:hover {
    fill-opacity: .5; }

.dc-chart rect.deselected {
  stroke: none;
  fill: #ccc; }

.dc-chart .pie-slice {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }
  .dc-chart .pie-slice.external {
    fill: #000; }
  .dc-chart .pie-slice :hover, .dc-chart .pie-slice.highlight {
    fill-opacity: .8; }

.dc-chart .pie-path {
  fill: none;
  stroke-width: 2px;
  stroke: #000;
  opacity: 0.4; }

.dc-chart .selected path, .dc-chart .selected circle {
  stroke-width: 3;
  stroke: #ccc;
  fill-opacity: 1; }

.dc-chart .deselected path, .dc-chart .deselected circle {
  stroke: none;
  fill-opacity: .5;
  fill: #ccc; }

.dc-chart .axis path, .dc-chart .axis line {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges; }

.dc-chart .axis text {
  font: 10px sans-serif; }

.dc-chart .grid-line, .dc-chart .axis .grid-line, .dc-chart .grid-line line, .dc-chart .axis .grid-line line {
  fill: none;
  stroke: #ccc;
  shape-rendering: crispEdges; }

.dc-chart .brush rect.selection {
  fill: #4682b4;
  fill-opacity: .125; }

.dc-chart .brush .custom-brush-handle {
  fill: #eee;
  stroke: #666;
  cursor: ew-resize; }

.dc-chart path.line {
  fill: none;
  stroke-width: 1.5px; }

.dc-chart path.area {
  fill-opacity: .3;
  stroke: none; }

.dc-chart path.highlight {
  stroke-width: 3;
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart g.state {
  cursor: pointer; }
  .dc-chart g.state :hover {
    fill-opacity: .8; }
  .dc-chart g.state path {
    stroke: #fff; }

.dc-chart g.deselected path {
  fill: #808080; }

.dc-chart g.deselected text {
  display: none; }

.dc-chart g.row rect {
  fill-opacity: 0.8;
  cursor: pointer; }
  .dc-chart g.row rect:hover {
    fill-opacity: 0.6; }

.dc-chart g.row text {
  fill: #fff;
  font-size: 12px;
  cursor: pointer; }

.dc-chart g.dc-tooltip path {
  fill: none;
  stroke: #808080;
  stroke-opacity: .8; }

.dc-chart g.county path {
  stroke: #fff;
  fill: none; }

.dc-chart g.debug rect {
  fill: #00f;
  fill-opacity: .2; }

.dc-chart g.axis text {
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .node {
  font-size: 0.7em;
  cursor: pointer; }
  .dc-chart .node :hover {
    fill-opacity: .8; }

.dc-chart .bubble {
  stroke: none;
  fill-opacity: 0.6; }

.dc-chart .highlight {
  fill-opacity: 1;
  stroke-opacity: 1; }

.dc-chart .fadeout {
  fill-opacity: 0.2;
  stroke-opacity: 0.2; }

.dc-chart .box text {
  font: 10px sans-serif;
  -webkit-touch-callout: none;
  -webkit-user-select: none;
  -khtml-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  pointer-events: none; }

.dc-chart .box line {
  fill: #fff; }

.dc-chart .box rect, .dc-chart .box line, .dc-chart .box circle {
  stroke: #000;
  stroke-width: 1.5px; }

.dc-chart .box .center {
  stroke-dasharray: 3, 3; }

.dc-chart .box .data {
  stroke: none;
  stroke-width: 0px; }

.dc-chart .box .outlier {
  fill: none;
  stroke: #ccc; }

.dc-chart .box .outlierBold {
  fill: red;
  stroke: none; }

.dc-chart .box.deselected {
  opacity: 0.5; }
  .dc-chart .box.deselected .box {
    fill: #ccc; }

.dc-chart .symbol {
  stroke: none; }

.dc-chart .heatmap .box-group.deselected rect {
  stroke: none;
  fill-opacity: 0.5;
  fill: #ccc; }

.dc-chart .heatmap g.axis text {
  pointer-events: all;
  cursor: pointer; }

.dc-chart .empty-chart .pie-slice {
  cursor: default; }
  .dc-chart .empty-chart .pie-slice path {
    fill: #fee;
    cursor: default; }

.dc-data-count {
  float: right;
  margin-top: 15px;
  margin-right: 15px; }
  .dc-data-count .filter-count, .dc-data-count .total-count {
    color: #3182bd;
    font-weight: bold; }

.dc-legend {
  font-size: 11px; }
  .dc-legend .dc-legend-item {
    cursor: pointer; }

.dc-hard .number-display {
  float: none; }

div.dc-html-legend {
  overflow-y: auto;
  overflow-x: hidden;
  height: inherit;
  float: right;
  padding-right: 2px; }
  div.dc-html-legend .dc-legend-item-horizontal {
    display: inline-block;
    margin-left: 5px;
    margin-right: 5px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-horizontal.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-vertical {
    display: block;
    margin-top: 5px;
    padding-top: 1px;
    padding-bottom: 1px;
    cursor: pointer; }
    div.dc-html-legend .dc-legend-item-vertical.selected {
      background-color: #3182bd;
      color: white; }
  div.dc-html-legend .dc-legend-item-color {
    display: table-cell;
    width: 12px;
    height: 12px; }
  div.dc-html-legend .dc-legend-item-label {
    line-height: 12px;
    display: table-cell;
    vertical-align: middle;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 0.75em; }

.dc-html-legend-container {
  height: inherit; }
</style>`
)});
  main.variable(observer("dc")).define("dc", ["require"], function(require){return(
require("dc")
)});
  main.variable(observer("crossfilter")).define("crossfilter", ["require"], function(require){return(
require("crossfilter2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3")
)});
  return main;
}

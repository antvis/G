import weatherDataset from '../../integration/data/weather.json';
import * as d3 from 'd3';

export async function scatterchart(context) {
  const { canvas } = context;
  await canvas.ready;

  const drawScatter = () => {
    // 1. Access data
    const dataset = weatherDataset;
    const xAccessor = (d) => d.dewPoint;
    const yAccessor = (d) => d.humidity;
    const colorAccessor = (d) => d.cloudCover;

    // 2. Create chart dimensions
    const width = 600;
    let dimensions: any = {
      width: width,
      height: width,
      margin: {
        top: 10,
        right: 10,
        bottom: 50,
        left: 50,
      },
    };
    dimensions.boundedWidth =
      dimensions.width - dimensions.margin.left - dimensions.margin.right;
    dimensions.boundedHeight =
      dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

    // 3. Draw canvas
    const bounds = d3
      .select(
        canvas.document.documentElement, // use GCanvas' document element instead of a real DOM
      )
      .append('g')
      .attr('x', dimensions.margin.left)
      .attr('y', dimensions.margin.top);

    // 4. Create scales

    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, xAccessor))
      .range([0, dimensions.boundedWidth])
      .nice();

    const yScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice();

    const colorScale = d3
      .scaleLinear()
      .domain(d3.extent(dataset, colorAccessor))
      .range(['skyblue', 'darkslategrey']);

    // 5. Draw data

    const dots = bounds.selectAll('circle').data(dataset);

    dots
      .join('circle')
      .attr('cx', (d) => xScale(xAccessor(d)))
      .attr('cy', (d) => yScale(yAccessor(d)))
      .attr('r', 5)
      .attr('fill', (d) => colorScale(colorAccessor(d)));

    // 6. Draw Preipherals - x axis and y axis

    //create a variable for xaxis and define it
    const xAxisGenerator = d3.axisBottom().scale(xScale);

    //add to the bounds
    const xAxis = bounds
      .append('g')
      .call(xAxisGenerator)
      //move to the bottom of the screen
      .style('transform', `translateY(${dimensions.boundedHeight}px)`);

    const xAxisLabel = xAxis
      .append('text')
      .attr('x', dimensions.boundedWidth / 2)
      .attr('y', dimensions.margin.bottom - 10)
      .attr('fill', 'black')
      .style('font-size', '1.4em')
      .html('Dew point (&deg;F)');

    //same thing with the y axis
    const yAxisGenerator = d3
      .axisLeft()
      .scale(yScale)
      //define the number of ticks that you want
      .ticks(4);

    const yAxis = bounds.append('g').call(yAxisGenerator);

    const yAxisLabel = yAxis
      .append('text')
      //using negative dimensions so we can rotate below with transform
      .attr('x', -dimensions.boundedHeight / 2)
      .attr('y', -dimensions.margin.left + 10)
      .style('fill', 'black')
      .text('Relative Humidity')
      .style('transform', 'rotate(-90deg)')
      .style('font-size', '1.4em')
      .style('text-anchor', 'middle');
  };

  drawScatter();
}

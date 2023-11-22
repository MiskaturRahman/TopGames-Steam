let x_pos1 = 0
let x_pos2 = 0
let x_pos3 = 80
let svg_x = 1500
let svg_y = 1500

function General_Numerical_Overview(){
    // page1
  // reading csc and import data
d3.csv('steam_data.csv')
  .then((_data) => {
    const data = _data.filter(d => !!d.type).map(d => ({...d,
      ['All-Time Peak']: Number(d['All-Time Peak'].replace(/,/ig, '')) || 0,
      ['24h Peak']: Number(d['24h Peak'].replace(/,/ig, '')) || 0,
      downloads: Number(d.downloads) || 0,
      index: Number(d.index) || 0,
      publishedYear: Number(d.published.split('/')[0])
    }));


    const tooltip = d3
    .select('body')
    .append('div')
    .attr('class', 'tooltip')
    .style('opacity', 0);

    const color = d3.scaleOrdinal(data.map(d => d.type), d3.schemeCategory10);


    // Draw the Bubble Groups
    function drawBubble (g, size, data, key, max, radialAlpha = 3) {
      const height = size;
      const width = size;

      function pack (data) {
        const root = d3
        .hierarchy({ children: Array.from(d3.group(data, d => d.type), ([, children]) => ({ children })) })
        .sum(d => d.downloads || 0)
        .sort((a, b) => b.value - a.value);

        const scale = d3
        .scaleSqrt()
        .domain([0, max])
        .range([1, 50]);

        return d3
        .pack()
        .radius(d => scale(d.data[key]))
        .size([width, height])
        .padding(3)(root);
      }

      //draw bubble
      const root = pack(data);
      const nodes = root.leaves();
      const leaf = g.selectAll('g')
      .data(nodes)
      .join('g');
      const node = leaf.append('circle')
      .attr('data-name', d => d.data.Name)
      .attr('r', d => d.r)
      .attr('fill', d => color(d.data.type))
      .attr('fill-opacity', 0.9)
      .attr('stroke', d => color(d.data.type))
      //showing info of game (on the selected pic)
      .on('mouseover', function (event, d) {
        d3.selectAll(`circle[data-name="${d.data.Name}"]`)
        .raise()
        .transition()
        .attr('r', d => d.r * 2)
        .attr('fill-opacity', 0.8);
        tooltip.transition()
        .style('opacity', 0.9);
        tooltip.html(`<div>
          <div>Game name: ${d.data.Name}</div>
          <div>Game type: ${d.data.type}</div>
          <div>Launched time: ${d.data.published}</div>
          <div>Number of downloads: ${d.data.downloads}</div>
          <div>All-Time Peak player: ${d.data['All-Time Peak']}</div>
        </div>`)
          .style('left', (event.pageX) + 'px')
          .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function (event, d) {
        d3.selectAll(`circle[data-name="${d.data.Name}"]`)
        .transition()
        .attr('r', d => d.r);
        tooltip.transition()
        .style('opacity', 0);
      });

      const maxR = Math.max.apply(null, nodes.map(v => v.r));

      d3.forceSimulation(nodes)
      .force('position', d3.forceRadial(d => (maxR - d.r) * radialAlpha, (width / 2), height / 2))
      .force('collision', d3.forceCollide(d => d.r + 1).strength(0.5))
      .on('tick', () => {
        node.attr('cx', d => d.x).attr('cy', d => d.y);
      });
    }// end of func drawBubbles


    // Measuring Scales of Bubbles
    function drawPlottingScale (g, min, max) {
      const percent = (max - min) / 100;
      const size = d3.scaleSqrt()
      .domain([min, max])
      .range([1, 50]);

      const valuesToShow = [min + percent * 10, min + percent * 50, max];
      const xCircle = 100;
      const yCircle = 250;
      const xLabel = 170;

      g.selectAll('legend')
      .data(valuesToShow)
      .enter()
      .append('circle')
      .attr('cx', xCircle)
      .attr('cy', d => yCircle - size(d))
      .attr('r', d => size(d))
      .style('fill', 'none')
      .attr('stroke', 'black');

      g.selectAll('legend')
      .data(valuesToShow)
      .enter()
      .append('line')
      .attr('x1', d => xCircle + size(d))
      .attr('x2', xLabel)
      .attr('y1', d => yCircle - size(d))
      .attr('y2', d => yCircle - size(d))
      .attr('stroke', 'black')
      .style('stroke-dasharray', ('2,2'));

      g.selectAll('legend')
      .data(valuesToShow)
      .enter()
      .append('text')
      .attr('x', xLabel)
      .attr('y', d => yCircle - size(d))
      .text(d => d3.format('0.2s')(d))
      .style('font-size', 10)
      .attr('alignment-baseline', 'middle');
    } //end of drawing the measuring scales of bubbles

    // Measuring scales of game types(color)
    function drawTextLabel (g, types, x, y) {
      const labelG = g.append('g')
      .attr('transform', `translate(${50 + x_pos1},260)`);
      const label = labelG.selectAll('g')
      .data(types)
      .enter()
      .append('g')
      .attr('transform', (d, i) => `translate(${x_pos1}, ${i * 25})`);

      label.append('circle')
      .attr('r', 10)
          .attr('cx', x)
          .attr('cy', y)
      .attr('fill', d => color(d))
      .attr('fill-opacity', 1.2);


      label.append('text')
      .text(d => d || 'unknown')
      .attr('x', 20 + x)
      .attr('y', 5 + y)
      .attr('fill', d => color(d));
    }// end of drawing the measuring scales of game types(color)

    // Pic Titles
    function drawTitle (g, title, width) {
      g.append('rect')
      .attr('x', 50)
      .attr('y', 50)
      .attr('width', width)
      .attr('height', 30);

      g.append('text')
      .attr('x', 65)
      .attr('y', 70)
      .text(title)
      .attr('fill', 'white');
    }//end of drawing the pic title

      function drawDescription (g, text, x, y, width) {
        appendMultiText(g, text, x, y, width, 13, "Helvetica")

      }
    // DRAWINGS pic1 & pic2
    const svg = d3.select('svg')
    .attr('width', svg_x)
    .attr('height', svg_y);


    const g1 = svg.append('g').attr('transform', `translate(${x_pos1}, 0)`);
    drawTitle(g1, "Top Games on Steam Overview", 230);
    drawDescription(g1,
        "Include the Top 900 download  games on Steam", 50, 90,  350)
    drawDescription(g1,
        "Touch the circle for more information:)", 50, 110,  350)
    drawDescription(g1,
        "Circles are sized according to the total downloads calculated from the release date", 50, 300,  230)
    drawDescription(g1,
        "Colors show the types of game.", 800, 120,  220)
    drawBubble(g1.append('g').attr(`transform`, `translate(${x_pos1 + 200},0)`), 600, data, 'downloads', Math.max.apply(null, data.map(d => d.downloads)));
    drawPlottingScale(g1, 0, Math.max.apply(null, data.map(d => d.downloads)));
    drawTextLabel(g1, Array.from(d3.group(data, d => d.type).keys()), 800, -100);



    const g2 = svg.append('g').attr('transform', `translate(${x_pos1},550)`);
    drawTitle(g2, "All-Time Peak Players",180);
    drawDescription(g2,
        "Circles are sized according to the max daily peak players   since the game is released"
        , 50, 100,  200)
    drawPlottingScale(g2, 0, Math.max.apply(null, data.map(d => d['All-Time Peak'])));
    drawTextLabel(g2, Array.from(d3.group(data, d => d.type).keys()), 0, 0);



    const years = d3.group(data.slice(0).sort((a, b) => a.publishedYear - b.publishedYear), d => {
        const year = d.publishedYear;
        if (year <= 2000) {
          return '<=2000';
        } else if (year > 2000 && year <= 2010) {
          return '2001-2010';
        } else {
          return year.toString();
        }
      });

    const keys = Array.from(years.keys());
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 4; ++j) {
          const index = j + i * 4;
          const g = g2.append('g').attr(`transform`, `translate(${(j + 1) * 200 + 100 + x_pos1},${i * 200})`);
          const _data = years.get(keys[i * 4 + j]);
          let alpha;
          if (index < 5) {
            alpha = 1.3;
          } else if (index == 8) {
            alpha = 1.25;
          }
          drawBubble(g, 150, _data, 'All-Time Peak', Math.max.apply(null, data.map(d => d['All-Time Peak'])), alpha);
          g.append('text')
          .text(keys[index])
          .attr('x', 75)
          .attr('y', 170)
          .attr('text-anchor', 'middle');
        }
      }


    }).catch(console.error)
}



document.getElementById("overview").onclick = function (){
    d3.select('svg').selectAll("*").remove()
    document.getElementById('slider').hidden = true
    General_Numerical_Overview()
}



General_Numerical_Overview()


export interface BenchmarkResult {
  [key: string]: string | number;
}

export class BenchmarkPanel {
  private container: HTMLDivElement;
  private title: string;
  private configInfo: string | null = null;

  constructor(title: string) {
    this.title = title;

    // Create result container on page
    this.container = document.createElement('div');
    this.container.style.position = 'absolute';
    this.container.style.bottom = '10px';
    this.container.style.left = '10px';
    this.container.style.backgroundColor = 'rgba(0,0,0,0.8)';
    this.container.style.color = 'white';
    this.container.style.padding = '10px';
    this.container.style.borderRadius = '4px';
    this.container.style.fontFamily = 'monospace';
    this.container.style.fontSize = '12px';
    this.container.style.zIndex = '1000';
    this.container.style.maxWidth = '500px';
    this.container.id = 'benchmark-results-panel';

    document.body.appendChild(this.container);

    // Show initial status
    this.showRunningStatus();
  }

  showRunningStatus(configInfo?: string) {
    // Store config info for later use in updateResultsDisplay
    this.configInfo = configInfo || null;

    this.container.innerHTML = `
      <h3>${this.title}</h3>
      ${configInfo ? `<div>${configInfo}</div><hr />` : ''}
      <div>Running benchmark tests... Please wait.</div>
    `;
  }

  updateResultsDisplay(results: BenchmarkResult[]) {
    // Debug: log the actual structure of results
    console.log('Benchmark results structure:', results);

    // Generate table dynamically based on the keys in the first result
    let tableHtml =
      '<table style="width:100%; border-collapse: collapse; margin: 10px 0;">';
    tableHtml += '<thead><tr style="background-color: #333;">';

    if (results && results.length > 0) {
      const firstResult = results[0];
      Object.keys(firstResult).forEach((key) => {
        tableHtml += `<th style="border: 1px solid #666; padding: 4px; text-align: left;">${key}</th>`;
      });
    }

    tableHtml += '</tr></thead><tbody>';

    if (results && results.length > 0) {
      // Create table rows for each result
      results.forEach((result, index) => {
        // Alternate row colors
        const bgColor =
          index % 2 === 0 ? 'rgba(50, 50, 50, 0.3)' : 'rgba(70, 70, 70, 0.3)';
        tableHtml += `<tr style="background-color: ${bgColor};">`;

        Object.keys(result).forEach((key) => {
          const value = result[key];
          tableHtml += `<td style="border: 1px solid #666; padding: 4px;">${value}</td>`;
        });

        tableHtml += '</tr>';
      });
    } else {
      tableHtml += '<tr><td colspan="3">No results available</td></tr>';
    }

    tableHtml += '</tbody></table>';

    this.container.innerHTML = `
      <h3>${this.title}</h3>
      ${this.configInfo ? `<div>${this.configInfo}</div><hr />` : ''}
      ${tableHtml}
    `;
  }
}

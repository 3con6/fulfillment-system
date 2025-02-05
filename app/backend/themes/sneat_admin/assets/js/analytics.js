/**
 * Dashboard Analytics
 */

let cardColor, headingColor, labelColor, shadeColor, borderColor, heatMap1, heatMap2, heatMap3, heatMap4;

cardColor = config.colors.cardColor;
headingColor = config.colors.headingColor;
labelColor = config.colors.textMuted;
borderColor = config.colors.borderColor;
shadeColor = '';
heatMap1 = '#e1e2ff';
heatMap2 = '#c3c4ff';
heatMap3 = '#a5a7ff';
heatMap4 = '#696cff';

// Total Sale - Area Chart
// --------------------------------------------------------------------
function createChart(date, data, chartId) {
    const chartEl = document.querySelector(`#${chartId}`),
        chartConfig = {
            chart: {
                height: 250,
                type: 'area',
                toolbar: false,
                dropShadow: {
                    enabled: true,
                    top: 14,
                    left: 2,
                    blur: 3,
                    color: config.colors.primary,
                    opacity: 0.15
                }
            },
            series: [
                {
                    data: data
                }
            ],
            dataLabels: {
                enabled: false
            },
            stroke: {
                width: 3,
                curve: 'straight'
            },
            colors: [config.colors.primary],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: shadeColor,
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.25,
                    stops: [0, 95, 100]
                }
            },
            grid: {
                show: true,
                borderColor: borderColor,
                padding: {
                    top: -15,
                    bottom: -10,
                    left: 0,
                    right: 0
                }
            },
            xaxis: {
                categories: date,
                labels: {
                    offsetX: 0,
                    style: {
                        colors: labelColor,
                        fontSize: '11px'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                lines: {
                    show: false
                }
            }
        };
    if (typeof chartEl !== undefined && chartEl !== null) {
        const chart = new ApexCharts(chartEl, chartConfig);
        chart.render();
    }
}


// Product type - Pie Chart
// --------------------------------------------------------------------

function createBarChart(date, data, chartId) {
    const salesActivityChartEl = document.querySelector(`#${chartId}`),
        salesActivityChartConfig = {
            chart: {
                type: 'bar',
                height: 290,
                stacked: true,
                toolbar: {
                    show: false
                }
            },
            series: [
                {
                    name: 'Total',
                    data: data
                }
            ],
            plotOptions: {
                bar: {
                    columnWidth: '40%',
                    endingShape: 'rounded'
                }
            },
            dataLabels: {
                enabled: false
            },
            stroke: {
                curve: 'smooth',
                width: 6,
                lineCap: 'round'
            },
            colors: [config.colors.danger, '#435971'],
            fill: {
                type: 'gradient',
                gradient: {
                    shade: shadeColor,
                    shadeIntensity: 0.8,
                    opacityFrom: 0.7,
                    opacityTo: 0.25,
                    stops: [0, 95, 100]
                }
            },
            grid: {
                show: false,
                strokeDashArray: 7,
                padding: {
                    top: -10,
                    bottom: -12,
                    left: 0,
                    right: 0
                }
            },
            xaxis: {
                categories: date,
                labels: {
                    offsetX: 0,
                    style: {
                        colors: labelColor,
                        fontSize: '11px'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                lines: {
                    show: false
                }
            }
        };
    if (typeof salesActivityChartEl !== undefined && salesActivityChartEl !== null) {
        const salesActivityChart = new ApexCharts(salesActivityChartEl, salesActivityChartConfig);
        salesActivityChart.render();
    }
}

import React, { useEffect } from 'react';
import { fetchChartData } from '../../lib/coingecko';

interface Props {
    id?: string;
}

// Credits to https://www.tradingview.com for the charting library

const Chart: React.FC<Props> = (props: Props): React.ReactElement => {
    useEffect(() => {
        if (props.id) {
            // @ts-ignore
            import('lightweight-charts').then((lc) => {
                console.log(lc);
                const elem = document.getElementById('chart')!;
                const chart = lc.createChart(elem, {
                    width: elem.clientWidth,
                    height: elem.clientHeight,
                    grid: {
                        horzLines: {
                            color: '#ffffff',
                        },
                        vertLines: {
                            color: '#ffffff',
                        },
                    },
                    rightPriceScale: {
                        borderVisible: false,
                    },
                    timeScale: {
                        borderVisible: false,
                    },
                    localization: {
                        priceFormatter: (price: number) => '$' + price.toFixed(2),
                    },
                });

                const areaSeries = chart.addAreaSeries({
                    bottomColor: '#ffffff',
                    topColor: '#e69583',
                    lineColor: '#E7694C',
                    lineWidth: 2,
                });

                fetchChartData(props.id!, 7).then((data) => {
                    console.log(data);
                    const parsedData = data.prices.map((price: any) => {
                        console.log(new Date(price[0]));
                        return {
                            time: price[0] / 1000,
                            value: price[1],
                        };
                    });

                    areaSeries.setData(parsedData);
                });
            });
        }
    }, [props.id]);

    return <div style={{ width: '100%', height: '100%' }} id="chart" />;
};

export default Chart;

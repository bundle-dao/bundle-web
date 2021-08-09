const request = async (url: string) => {
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = await fetch(url, options);

    if (response.status !== 200) {
        return response.status;
    }

    const result = await response.json();
    return result;
};

export const fetchChartData = async (id: string, days: number = 1) => {
    return request(
        `https://api.coingecko.com/api/v3/coins/${id.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`
    );
};

export const fetchPrice = async (id: string) => {
    return request(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`);
};

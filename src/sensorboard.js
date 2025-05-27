import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register all required Chart.js components here once
ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

const Sensorboard = () => {
  const channelID = '2972454';
  const apiKey = 'CSI9TQECFXYFBE2S';
  const url = `https://api.thingspeak.com/channels/${channelID}/feeds.json?results=20${apiKey ? '&api_key=' + apiKey : ''}`;

  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [oxygenData, setOxygenData] = useState([]);
  const [lightData, setLightData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(url);
        const json = await response.json();
        const feeds = json.feeds;

        setLabels(feeds.map(entry => new Date(entry.created_at).toLocaleTimeString()));
        setTemperatureData(feeds.map(entry => parseFloat(entry.field1)));
        setHumidityData(feeds.map(entry => parseFloat(entry.field2)));
        setOxygenData(feeds.map(entry => parseFloat(entry.field3)));
        setLightData(feeds.map(entry => parseFloat(entry.field4)));
      } catch (error) {
        console.error('Error fetching ThingSpeak data:', error);
      }
    };

    fetchData();
  }, [url]);

  const createChartData = (data, label, color) => ({
    labels,
    datasets: [
      {
        label,
        data,
        borderColor: color,
        fill: false,
        tension: 0.3,
      },
    ],
  });

  const chartOptions = (label) => ({
    responsive: true,
    scales: {
      x: {
        title: { display: true, text: 'Time' },
      },
      y: {
        title: { display: true, text: label },
      },
    },
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Sensor Dashboard (ThingSpeak)</h1>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {[1, 2, 3, 4].map(field => (
          <iframe
            key={field}
            width="450"
            height="260"
            style={{ border: '1px solid #ccc' }}
            src={`https://thingspeak.com/channels/${channelID}/charts/${field}?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15`}
            title={`Chart ${field}`}
          ></iframe>
        ))}
      </div>

      <h2>Temperature (°C)</h2>
      <Line data={createChartData(temperatureData, 'Temperature (°C)', 'red')} options={chartOptions('Temperature (°C)')} />

      <h2>Humidity (%)</h2>
      <Line data={createChartData(humidityData, 'Humidity (%)', 'blue')} options={chartOptions('Humidity (%)')} />

      <h2>Oxygen (%)</h2>
      <Line data={createChartData(oxygenData, 'Oxygen (%)', 'green')} options={chartOptions('Oxygen (%)')} />

      <h2>Light Intensity (Lux)</h2>
      <Line data={createChartData(lightData, 'Light Intensity (Lux)', 'orange')} options={chartOptions('Light Intensity (Lux)')} />
    </div>
  );
};

export default Sensorboard;

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

// Register Chart.js components
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

  const [labels, setLabels] = useState([]);
  const [temperatureData, setTemperatureData] = useState([]);
  const [humidityData, setHumidityData] = useState([]);
  const [oxygenData, setOxygenData] = useState([]);
  const [lightData, setLightData] = useState([]);

  // 🟢 Fetch from your Node.js backend
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/fetch-data');
      const json = await response.json();
      const feeds = json.insertedData || [];

      if (feeds.length === 0) {
        console.warn('No new data returned from backend');
        return;
      }

      setLabels(feeds.map(entry => new Date(entry.timestamp).toLocaleTimeString()));
      setTemperatureData(feeds.map(entry => entry.temperature));
      setHumidityData(feeds.map(entry => entry.turbidity));
      setOxygenData(feeds.map(entry => entry.tds));
      setLightData(feeds.map(entry => entry.ph));
    } catch (error) {
      console.error('Error fetching backend data:', error);
    }
  };

  // Call fetchData when component mounts and refresh every 15 seconds
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 15000);
    return () => clearInterval(interval);
  }, []);

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
      <h1>Sensor Dashboard (ThingSpeak + Backend)</h1>

      {/* 🔵 ThingSpeak Live Charts via iframe */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {[1, 2, 3, 4].map(field => (
          <iframe
            key={field}
            width="450"
            height="260"
            style={{ border: '1px solid #ccc' }}
            src={`https://thingspeak.com/channels/${channelID}/charts/${field}?bgcolor=%23ffffff&color=%23d62020&dynamic=true&results=60&type=line&update=15${apiKey ? '&api_key=' + apiKey : ''}`}
            title={`Chart ${field}`}
          ></iframe>
        ))}
      </div>

      {/* 🟢 Charts from MongoDB via Backend */}
      <h2>Temperature (°C)</h2>
      <Line data={createChartData(temperatureData, 'Temperature (°C)', 'red')} options={chartOptions('Temperature (°C)')} />

      <h2>Turbidity (NTU)</h2>
      <Line data={createChartData(humidityData, 'Turbidity (NTU)', 'blue')} options={chartOptions('Turbidity (NTU)')} />

      <h2>Total Dissolved Solids (TDS)</h2>
      <Line data={createChartData(oxygenData, 'TDS (ppm)', 'green')} options={chartOptions('TDS (ppm)')} />

      <h2>pH Level</h2>
      <Line data={createChartData(lightData, 'pH', 'orange')} options={chartOptions('pH')} />
    </div>
  );
};

export default Sensorboard;

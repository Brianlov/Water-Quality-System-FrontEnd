const express = require('express');
const axios = require('axios');
const Approuter = express.Router();
module.exports = Approuter;
const { ObjectId } = require('mongodb');
const client = require(`./database`);

let db=client.db("water_db");

Approuter.post('/data',async (req, res) => {
    const { turbidity, tds } = req.body;

    if(turbidity&&tds)
    {
    const sucess=await db.collection('date').insertOne({
        turbidity: turbidity,
        tds: tds
    })
    if(sucess)
    {
        console.log(`Received: Turbidity = ${turbidity}, TDS = ${tds}`);
        res.status(200).json(sucess);
    }
    else{
        res.status(400).send({ status: 'Error', message: 'Failed to insert Data' });
    }
    }
    else
    {
        res.status(400).send({ status: 'Error', message: 'Invalid data' });
    }
    
  });

  const fetchThingSpeakData = async () => {
  const apiKey = 'CSI9TQECFXYFBE2S';
  const channelId = 2972454;
  const url = `https://api.thingspeak.com/channels/${channelId}/feeds.json?api_key=${apiKey}&results=4`;

  try {
    const response = await axios.get(url);
const feeds = response.data.feeds;

console.log('Raw feeds from ThingSpeak:', feeds);

if (feeds && feeds.length > 0) {
  const dataToInsert = feeds.map(feed => ({
    turbidity: parseFloat(feed.field1) || null,
    tds: parseFloat(feed.field2) || null,
    timestamp: new Date(feed.created_at),
    channel_id: channelId,
  }));

  console.log('Mapped dataToInsert:', dataToInsert);

  // Filter out entries with null values
  const validData = dataToInsert.filter(
    entry => entry.turbidity !== null
  );

  console.log('Filtered validData:', validData);

      if (validData.length > 0) {
        // Check for duplicates based on timestamp
        const collection = db.collection('date');
        for (const entry of validData) {
          const existing = await collection.findOne({
            timestamp: entry.timestamp,
            channel_id: entry.channel_id,
          });

          if (!existing) {
            await collection.insertOne(entry);
            console.log(`Stored: Turbidity = ${entry.turbidity}, TDS = ${entry.tds}, Timestamp = ${entry.timestamp}`);
          } else {
            console.log(`Skipped duplicate: Timestamp = ${entry.timestamp}`);
          }
        }
      } else {
        console.log('No valid data to insert from ThingSpeak');
      }
    } else {
      console.log('No data received from ThingSpeak');
    }
  } catch (error) {
    console.error('Error fetching data from ThingSpeak:', error.message);
  }
};

// Schedule data fetching every 15 seconds
setInterval(fetchThingSpeakData, 15 * 1000);

// Initial fetch to avoid waiting for the first interval
fetchThingSpeakData();



  



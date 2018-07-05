'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const axios = require('axios');
const PORT = process.env.PORT || 3001;

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

const app = express();

app.post('/webhook', line.middleware(config), (req, res) => {
  console.log(req.body.events);
  Promise
    .all(req.body.events.map(handleEvent))
    .then((result) => res.json(result));
});

const client = new line.Client(config);

function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  let repMes = '';
  let sendMes = event.message.text;

  if (/おはよ/.test(sendMes)) {
    let date = getDate();
    repMes = `おはよ\u{1F493}\n` +
      `今日は ${date} だよ\n` +
      `今日も研究頑張ってな！`;
  } else if (/明日の天気/.test(sendMes)) {
    repMes = '明日の天気はこんな感じみたいやで〜'
    getWeather(event.source.userId, 1)
  } else {
    repMes = sendMes;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: repMes //実際に返信の言葉を入れる箇所
  });
}

app.listen(PORT);
console.log('-----nanase LINE bot start-----')
console.log(`Server running at ${PORT}`);

// 現在の日付取得
const getDate = () => {
  let today = new Date();

  let month = today.getMonth() + 1;
  let day = today.getDate();
  let week = today.getDay();

  let weekDay = new Array("日", "月", "火", "水", "木", "金", "土");

  let formatDate = `${month}/${day} ${weekDay[week]}曜日`;

  return formatDate;
}

// 天気取得
const getWeather = async (userId, dayId) => {
  const res = await axios.get('http://weather.livedoor.com/forecast/webservice/json/v1?city=017010');
  const item = res.data;

  // 日付と地域名と天気を取得
  const city = item.location.city;
  const dayLabel = item.forecasts[dayId].dateLabel;
  const weather = item.forecasts[dayId].telop;
  const date = item.forecasts[dayId].date;

  await client.pushMessage(userId, {
    type: 'text',
    text: `${dayLabel}(${date})の${city}の天気は${weather}です。\nby livedoor天気情報`
  });
}

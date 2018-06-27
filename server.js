'use strict';

const express = require('express');
const line = require('@line/bot-sdk');
const PORT = process.env.PORT || 3001;

const config = {
  channelAccessToken: "1Jm0jNA9ovgwCyD9MMEQT1P8R+nsaf+uzPiZKF0NcHbGlS6qOQWC7Xzszy4d1q2MpaDqoMoYKzJ4hSNk7V0qXxmxCQNpHqJ6Ouro+0hmJR4pvFp6fqnPEpIW4zfMclRFHeVK/WHE1bja+XVrxIq+RAdB04t89/1O/w1cDnyilFU=",
  channelSecret: "fe5a2cbeb9c5cfa20434ff6691ddc642"
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

    repMes = `おはよう！\n` +
      `今日は ${date} だよ！\n` +
      `今日は何するの？`;
  }

  return client.replyMessage(event.replyToken, {
    type: 'text',
    text: repMes //実際に返信の言葉を入れる箇所
  });
}

app.listen(PORT);
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

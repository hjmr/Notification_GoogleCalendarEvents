function _notifyEventsDailyByMail() {
    const calendar = CalendarApp.getCalendarById('<Google Calendar ID>');
    const events = calendar.getEventsForDay(new Date());

    // 時間の整形
    function makeTime(Date) {
        function addZero(num) {
            return (num <= 9 ? '0' : '') + num;
        }
        return addZero(Date.getHours()) + '時' + addZero(Date.getMinutes()) + '分';
    }

    // メッセージの生成
    var body = events.reduce(function(tmp, event) {
        return tmp + makeTime(event.getStartTime()) + ' - ' + makeTime(event.getEndTime()) + ' : ' + event.getTitle() + '\n';
    }, '');

    // メール送信
    MailApp.sendEmail({
        to: '<Mail Address>',
        subject: '今日の予定',
        body: body
    });
}

function _notifyEventsDailyByWebhook() {
    const calendar = CalendarApp.getCalendarById('<Google Calendar ID>');
    const today = new Date();
    const events = calendar.getEventsForDay(today);

    // 月日の整形
    function makeDate(Date) {
        return Date.getYear() + "年" + (Date.getMonth() + 1) + "月" + Date.getDate() + "日";
    }

    // 時間の整形
    function makeTime(Date) {
        function addZero(num) {
            return (num <= 9 ? '0' : '') + num;
        }
        return addZero(Date.getHours()) + '時' + addZero(Date.getMinutes()) + '分';
    }

    // メッセージの生成
    var body = events.map(function(event) {
        var block = {
            "type": "TextBlock",
            "spacing": "none",
            "isSubtle": true,
            "wrap": true,
            "text": "* " + makeTime(event.getStartTime()) + ' - ' + makeTime(event.getEndTime()) + ' : ' + event.getTitle()
        }
        return block;
    });

    // ペイロード
    var payload = {
        "@context": "https://schema.org/extensions",
        "@type": "MessageCard",
        "summary": makeDate(today) + "：今日の予定は" + body.length + "件です。",
        "title": makeDate(today) + "：今日の予定",
    }
    if( body.length == 0 ) {
        payload["text"] = "今日は予定がありません。";
    } else {
        payload["sections"] = body;
    }

    // メソッド
    var options = {
        "method": "POST",
        "payload": JSON.stringify(payload)
    }

    // Webhook URLにポスト
    const url = '<Incoming Webhook URL>';
    var response = UrlFetchApp.fetch(url, options);
    var content = response.getContentText("UTF-8");
}

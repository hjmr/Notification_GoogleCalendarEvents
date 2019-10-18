function getEventsForWeek(calendar, fromDate) {
    var toDate = new Date(Date.parse(fromDate) + (7 * 60 * 60 * 24 * 1000));
    var events = calendar.getEvents(fromDate, toDate);
    return events;
}

function _notifyEventsWeeklyByWebhook() {
    const calendar = CalendarApp.getCalendarById('<Google Calendar ID>');
    const today = new Date();
    const events = getEventsForWeek(calendar, today);

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
    var body = [];
    var currDate = "";
    events.map(function(ev){
        var date = makeDate(ev.getStartTime());
        if( currDate == "" || currDate != date ) {
            currDate = date;
            body.push({
                "type": "TextBlock",
                "spacing": "none",
                "isSubtle": true,
                "wrap": true,
                "text": "##" + date + "の予定"
            });
        }
        body.push({
            "type": "TextBlock",
            "spacing": "none",
            "isSubtle": true,
            "wrap": true,
            "text": "* " + makeTime(ev.getStartTime()) + ' - ' + makeTime(ev.getEndTime()) + ' : ' + ev.getTitle()
        });
    });
    
    // ペイロード
    var payload = {
        "@context": "https://schema.org/extensions",
        "@type": "MessageCard",
        "summary": "今週の予定は" + events.length + "件です。",
        "title": "今週の予定",
    }
    if( events.length == 0 ) {
        payload["text"] = "今週は予定がありません。";
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

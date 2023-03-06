loc_tweets = {}
event_tweets = {}
document.addEventListener('DOMContentLoaded', function () {
    Promise.all([d3.csv('data/final_tweets_list.csv')])
        .then(function (values) {
            for (let i = 0; i < values[0].length; i++) {
                let loc = values[0][i].location
                let tweets = values[0][i].tweets
                let event_id = values[0][i].event_id
                if (!(loc in loc_tweets)) {
                    loc_tweets[loc] = []
                }
                if (!(event_id in event_tweets)) {
                    event_tweets[event_id] = []
                }
                loc_tweets[loc].push(tweets)
                event_tweets[event_id].push(tweets)
            }
            let data = []
            for (const [key, value] of Object.entries(loc_tweets)) {
                data.push(...value)
            }
            draw_panel_e_loc('all')
        })
})

function draw_panel_e_loc(loc) {
    let data = []
    if (loc === 'all') {
        for (const [key, value] of Object.entries(loc_tweets)) {
            data.push(...value)
        }
    } else {
        data = loc_tweets[loc]
    }


    let panelE = document.getElementById('panelE');
    panelE.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        let tweet = data[i]
        tweet = tweet.replace(/[\n\r]/g, ' ');
        let words = tweet.split(' ')
        const para = document.createElement("p");
        para.className = "tweet"
        for (let i = 0; i < words.length; i++) {
            if (i !== 0) {
                para.appendChild(document.createTextNode(" "))
            }
            if (words[i].startsWith("https")) {
                let a = document.createElement('a')
                const node = document.createTextNode(words[i]);
                a.href = words[i]
                a.appendChild(node)
                para.appendChild(a)
                continue
            }
            if (words[i].startsWith("@")) {
                let span = document.createElement('span')
                const node = document.createTextNode(words[i]);
                span.appendChild(node)
                para.appendChild(span)
                span.style.color = "red"
                continue
            }
            if (words[i].startsWith("#")) {
                let span = document.createElement('span')
                span.className = 'hashtag'
                const node = document.createTextNode(words[i]);
                span.appendChild(node)
                para.appendChild(span)
                span.style.color = "#0084b4"
                span.style.font = "bold"
                continue
            }
            const node = document.createTextNode(words[i]);
            para.appendChild(node)

        }
        panelE.appendChild(para);
    }
}

function draw_panel_e_event(event) {
    let data = []
    if (event === 'all') {
        for (const [key, value] of Object.entries(event_tweets)) {
            data.push(...value)
        }
    } else {
        data = event_tweets[event]
    }
    let panelE = document.getElementById('panelE');
    panelE.innerHTML = '';
    for (let i = 0; i < data.length; i++) {
        let tweet = data[i]
        tweet = tweet.replace(/[\n\r]/g, ' ');
        let words = tweet.split(' ')
        const para = document.createElement("p");
        para.className = "tweet"
        for (let i = 0; i < words.length; i++) {
            if (i !== 0) {
                para.appendChild(document.createTextNode(" "))
            }
            if (words[i].startsWith("https")) {
                let a = document.createElement('a')
                const node = document.createTextNode(words[i]);
                a.href = words[i]
                a.appendChild(node)
                para.appendChild(a)
                continue
            }
            if (words[i].startsWith("@")) {
                let span = document.createElement('span')
                const node = document.createTextNode(words[i]);
                span.appendChild(node)
                para.appendChild(span)
                span.style.color = "red"
                continue
            }
            if (words[i].startsWith("#")) {
                let span = document.createElement('span')
                span.className = 'hashtag'
                const node = document.createTextNode(words[i]);
                span.appendChild(node)
                para.appendChild(span)
                span.style.color = "#0084b4"
                span.style.font = "bold"
                continue
            }
            const node = document.createTextNode(words[i]);
            para.appendChild(node)

        }
        panelE.appendChild(para);
    }
}
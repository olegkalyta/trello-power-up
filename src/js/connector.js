import { cardButtonsHandler, delay } from './common'
import calculateActionInList from './timeCounter'

const appKey = 'd26f90d692b09eaa03aec3c2373d4dd8'

let token = null
let lists = {}

let counter = 1

function getToken(t) {
  if (token) {
    return Promise.resolve(token)
  } else {
    return t.getRestApi().getToken().then(t => {
      token = t;

      return Promise.resolve(t)
    })
  }
}

function countTimeInStatus(token, card) {
    if (!token) {
      return []
    }

    return fetch(`https://api.trello.com/1/cards/${card.id}/actions?key=${appKey}&token=${token}`)
      .then(r => r.json())
      .then(actions => calculateActionInList(actions, card, lists))
      .catch(console.log)
}


function fetchLists(t, boardId) {
  return getToken(t).then(() => {
    return fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${appKey}&token=${token}`)
      .then(r => r.json())
      .catch(console.log)
})
}

function badgesHandler(t) {
  return t
    .card("all")
    .then(function (card) {
      return delay(500).then(() => {
        return getToken(t).then(tt => {
          return countTimeInStatus(tt, card).then(res => {
            if (res) {
              return res.map(r => ({ text: r, color: 'yellow' }))
            }
            return [];
          })
        });
      });
    });
}

window.TrelloPowerUp.initialize({
  'board-buttons': function(t, options) {
    t.board('id')
      .then(function (board) {
        return fetchLists(t, board.id).then(l => {
          l.map(item => {
            lists[item.id] = { name: item.name }
          })
          return []
        })
      })
  },
  "card-buttons": cardButtonsHandler,
  "card-badges": function (t) {
    counter++

    const delaySuffix = Math.round(counter / 10) * 1000
    // console.log(delaySuffix)

    return t
      .card("all")
      .then(function (card) {
        return delay(1300 + delaySuffix).then(() => {
          return getToken(t).then(tt => {
            return countTimeInStatus(tt, card).then(res => {
              if (res) {
                return res.map(r => ({ text: r, color: 'yellow' }))
              }
              return [];
            })
          });
        });
      });
  },
  "card-detail-badges": badgesHandler
}, {
  appKey: appKey,
  appName: 'Better Time in Status'
});

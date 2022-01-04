import { cardButtonsHandler } from './common'
import calculateActionInList from './timeCounter'

const appKey = 'd26f90d692b09eaa03aec3c2373d4dd8'

let token = null


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

    // console.log(card.name, card.id)

    return fetch(`https://api.trello.com/1/cards/${card.id}/actions?key=${appKey}&token=${token}`)
      .then(r => r.json())
      .then(actions => calculateActionInList(actions, card))
      .catch(console.log)
}


window.TrelloPowerUp.initialize({
  "card-buttons": cardButtonsHandler,
  "card-badges": function (t, opts) {

    return t
      .card("all")
      .then(function (card) {
        return getToken(t).then(tt => {
          return countTimeInStatus(tt, card).then(res => {
            if (res) {
              return [{
                text: res,
                color: null,
              }]

            }
            return [];
          })
        });
      });
  },

}, {
  appKey: appKey,
  appName: 'Better Time in Status'
});

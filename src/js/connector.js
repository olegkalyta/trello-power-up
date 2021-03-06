import { cardButtonsHandler } from './common'
import fetcher from './fetcher'
import { appKey } from './constants'

const f = new fetcher()

window.TrelloPowerUp.initialize({

  "card-buttons": cardButtonsHandler,
  "card-badges": function (t) {

    return t
      .card("all")
      .then(function (card) {
        return t.board('id')
          .then(function (board) {

            f.addTasks(card, board.id, t)
            return f.getCard(card.id).then(texts => {
              return texts.map(t => ({ text: t, color: null }))
            })
              .catch(() => [])
          });
      })
  },
}, {
  appKey: appKey,
  appName: 'Better Time in Status'
});



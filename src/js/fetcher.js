import { delay } from './common'
import calculateActionInList from "./timeCounter"
import { chunk } from './common'
import { appKey } from './constants'

const Promise = window.TrelloPowerUp.Promise;

let token = null

let t = null
let withTimeInstatus = []

let lists = {}

function ensureToken() {
  if (token) {
    return Promise.resolve(token)
  } else {
    return t.getRestApi().getToken().then(newToken => {
      token = newToken;

      return Promise.resolve(t)
    })
  }
}


function fetchLists(boardId) {
    return fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${appKey}&token=${token}`)
      .then(r => r.json())
      .catch(console.log)
}

export default () => {

  const tasks = []

  const cardToBatchUrl = cards => {
    let batchUrl = 'https://api.trello.com/1/batch?urls='

    cards.map(card => {
      batchUrl += `/cards/${card.id}/actions,`
    })

    batchUrl = batchUrl.slice(0, -1)

    batchUrl += `&key=${appKey}&token=${token}`
    return batchUrl
  }

  const addTasks = (card, boardId, tvar) => {
    if (!t) {
      t = tvar
    }

    tasks.push({ id: card.id, idList: card.idList })

    if (tasks.length > 1) {
      return
    }

    return ensureToken().then(() => {
      return fetchLists(boardId).then(l => {
        l.map(item => {
          lists[item.id] = { name: item.name }
        })


        delay(500).then(() => {

          const batchedCards = chunk(tasks, 10)
          const batchedUrls = batchedCards.map(cardToBatchUrl)

          const promises = batchedUrls.map(u => fetch(u).then(r => r.json()))
          Promise.all(promises).then(batchedResults => {
            let res = batchedCards.map((bc, index) => {

              return bc.map((c, ind) => {
                return {
                  ...c, actions: batchedResults[index][ind][200] || []
                }
              })
            })

            const concatted = [].concat(...res)

            withTimeInstatus = concatted.map(data => ({
              ...data,
              timeInStatus: calculateActionInList(data.actions, { id: data.id, idList: data.idList }, lists)
            }))

            console.log(withTimeInstatus)

            // const promises = tasks.map(card => countTimeInStatus(card))


          })
        })
      })
    })
  }


  const getCard = id => {
   return new Promise((resolve, reject) => {
     const interval = setInterval(() => {
       if (withTimeInstatus.length > 0) {
         const res = withTimeInstatus.find(obj => obj.id === id)?.timeInStatus

         if (res) {
           resolve(res)
           clearInterval(interval)
         } else {
           console.log('no', id, withTimeInstatus.length)
         }
       }
     }, 300)
   })
  }

  return {
    addTasks,
    getCard,
  }

}

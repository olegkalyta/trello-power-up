import { delay } from './common'
import calculateActionInList from "./timeCounter"

import { appKey } from './constants'

const Promise = window.TrelloPowerUp.Promise;

// dublicate token in another file
let token = null

let t = null

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

//  id, idBoard, idList, actions, timeInStatus
//



function fetchLists(boardId) {
    return fetch(`https://api.trello.com/1/boards/${boardId}/lists?key=${appKey}&token=${token}`)
      .then(r => r.json())
      .catch(console.log)
}


function countTimeInStatus(card) {
  if (!token) {
    return []
  }

  return fetch(`https://api.trello.com/1/cards/${card.id}/actions?key=${appKey}&token=${token}`)
    .then(r => r.json())
    .then(actions => calculateActionInList(actions, card, lists))
    .catch(console.log)
}

export default () => {

  const tasks = []
  let completed = false

  function chunk(arr, chunkSize) {
    if (chunkSize <= 0) throw "Invalid chunk size";
    let R = [];
    for (let i=0,len=arr.length; i<len; i+=chunkSize)
      R.push(arr.slice(i,i+chunkSize));
    return R;
  }

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

    if (tasks.length !== 1) {
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

            const withTimeInstatus = concatted.map(data => ({
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

  return {
    addTasks
  }

  const getCard = async id => {

  }
}

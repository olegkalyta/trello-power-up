import moment from "moment";


function daysFromNow(strDate) {
  const startDate = moment(strDate)
  const now = moment()
  return now.diff(startDate, 'days')
}

function daysBetweenDates(startDateStr, endDateStr) {
  const startDate = moment(startDateStr)
  const endDate = moment(endDateStr)
  return endDate.diff(startDate, 'days')
}

export default (actions, card, lists) => {
  const { idList, name, id } = card

  const startDate = new Date(1000*parseInt(card.id.substring(0,8),16))

  if (actions.length === 0) {
    return [`${lists[idList].name} - ${daysFromNow(startDate)}`]
  }

  const sortedByDate = actions.sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)

    return dateA >= dateB
  })


  // if (id !== '5e9e582c120fb42345f9a7ac') {
  //   return
  // }

  // console.log(name, id)

  const listsAndTime = { ...lists }

  sortedByDate.map((action, index) => {
    if (index === 0) {
      listsAndTime[action.data.listBefore.id] = { ...listsAndTime[action.data.listBefore.id], duration: daysBetweenDates(startDate, action.date) }
    } else {

      const prevActionDate = sortedByDate[index - 1].date
      listsAndTime[action.data.listBefore.id] = { ...listsAndTime[action.data.listBefore.id], duration: daysBetweenDates(prevActionDate, action.date) }

    }

    // count how much time since last update card is in current (last) status
    if (index + 1 === sortedByDate.length) {
      const lastAction = sortedByDate[index]

      listsAndTime[lastAction.data.listAfter.id] = { ...listsAndTime[lastAction.data.listAfter.id],
        duration: (listsAndTime[lastAction.data.listAfter.id].duration || 0) + daysFromNow(lastAction.date) }
    }
  })

  let res = []
  Object.keys(listsAndTime)
    .filter(k => Object.keys(lists).includes(k))
    .map(key => {
      if (listsAndTime[key].duration) {

        res.push(`${listsAndTime[key].name} - ${listsAndTime[key].duration}`)
      }
  })

  return res

}

import moment from "moment";


function daysFromNow(strDate) {
  const startDate = moment(strDate)
  const now = moment()
  return now.diff(startDate, 'days') + ' days'
}

export default (actions, card) => {
  const { idList, dateLastActivity, name } = card

  const filteredActions = actions?.filter(a => (a?.data?.listBefore?.id === idList || a?.data?.listAfter?.id === idList)) || []

  if (filteredActions.length === 0) {
    return daysFromNow(dateLastActivity)
  }

  // if (filteredActions.length === 1) {
  //   return daysFromNow(filteredActions[0].date)
  // }
  //else return 'count'
  const startDates = actions.filter(a => a.data?.listBefore?.id === idList)
  const endDates = actions.filter(a => a.data?.listAfter?.id === idList)

  if (startDates.length === 0 && endDates.length > 0) {
    console.log('here')
    return daysFromNow(endDates[0].date)
  }

  console.log(name)
  console.log('startDates', startDates.map(dates => {
    return {
      date: moment(dates.date).format('DD-MM-YYYY'),
      action: `${dates.data.listBefore.name} -> ${dates.data.listAfter.name}`,
    }
  }))

  console.log('endDates', endDates.map(dates => {
    return {
      date: moment(dates.date).format('DD-MM-YYYY'),
      action: `${dates.data.listAfter.name} <- ${dates.data.listBefore.name}`,
    }
  }))

}

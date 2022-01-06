import moment from "moment";


export function daysFromNow(strDate) {
  const startDate = moment(strDate)
  const now = moment()
  return now.diff(startDate, 'days')
}

export function daysBetweenDates(startDateStr, endDateStr) {
  const startDate = moment(startDateStr)
  const endDate = moment(endDateStr)
  return endDate.diff(startDate, 'days')
}

const showIframe = t => {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  });
}

const showMenu = t => {
  return t.popup({
    title: 'token',
    items: [
      // …
    ]
  });
}

export const delay = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}


export const cardButtonsHandler = t => {
  return t.getRestApi()
    .isAuthorized()
    .then(function(isAuthorized) {
      if (isAuthorized) {
        return [{
          text: 'Authorized',
          callback: showMenu
        }];
      } else {
        return [{
          text: 'Please Authorize',
          callback: showIframe
        }];
      }
    })
    .catch(TrelloPowerUp.restApiError.AuthDeniedError, function() {
      alert('Cancelled!');
    });
}

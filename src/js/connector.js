function showIframe(t) {
  return t.popup({
    title: 'Authorize to continue',
    url: './authorize.html'
  });
}

function showMenu(t) {
  return t.popup({
    title: 'Do something cool',
    items: [
      // …
    ]
  });
}

window.TrelloPowerUp.initialize({
  "card-buttons": function(t) {
    return t.getRestApi()
      .isAuthorized()
      .then(function(isAuthorized) {
        if (isAuthorized) {
          return [{
            text: 'David\'s Power-Up',
            callback: showMenu
          }];
        } else {
          return [{
            text: 'David\'s Power-Up',
            callback: showIframe
          }];
        }
      })
      .catch(TrelloPowerUp.restApiError.AuthDeniedError, function() {
        alert('Cancelled!');
      });
  },
  "card-badges": function (t, opts) {
    let cardAttachments = opts.attachments; // Trello passes you the attachments on the card

    // t.card("all").then(function (card) {
    //   console.log(JSON.stringify(card, null, 2));
    // });

    return t
      .card("name")
      .get("name")
      .then(function (cardName) {
        console.log("We just loaded the card name for fun: " + cardName);
        return [
          {
            dynamic: function () {
              return {
                text: "Dynamic " + (Math.random() * 100).toFixed(0).toString(),
                color: "green",
                refresh: 10, // in seconds
              };
            },
          },
          {
            text: "Static",
            color: null,
          },
        ];
      });
  },
});

require('request')
const request = require('request-promise')

const rc = {
  // ReCharge API Token
  rechargeApiToken: process.env.RECHARGE_API_TOKEN,

  createWebhook(address: any, topic: any) {
    return request({
      method: 'POST',
      uri: 'https://api.rechargeapps.com/webhooks',
      headers: {
        'X-ReCharge-Access-Token': rc.rechargeApiToken,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        address,
        topic
      })
    })
  }
}

function main() {
  const addTagAddress = `https://${process.env.API_ADDRESS}/api/v1/webhooks/addTag`
  const removeTagAddress = `https://${process.env.API_ADDRESS}/api/v1/webhooks/removeTag`

  rc.createWebhook(addTagAddress, 'subscription/created')
    .then(rc.createWebhook(addTagAddress, 'subscription/activated'))
    .then(rc.createWebhook(removeTagAddress, 'subscription/cancelled'))
    .then(rc.createWebhook(removeTagAddress, 'subscription/deleted'))
}

main()

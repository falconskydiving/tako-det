const axios = require('axios').default

async function sendGetRequest() {
  try {
    const resp = await axios.get('https://jsonplaceholder.typicode.com/posts')
    console.log(resp.data)
  } catch (err) {
    // Handle Error Here
    console.error(err)
  }
}

sendGetRequest()

import axios from 'axios'

export default axios.create({
    baseURL: "http://10.0.0.11:8080/adscrito",
    headers:{
        "Content-type": "application/json"
    }
})
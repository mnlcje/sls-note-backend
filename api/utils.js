const getUserId = (headers) => {

    return headers.user_id;

}

const getUserName = (headers) => {

    return headers.user_name;

}

const getResponseHeaders = () => {
    return {
        'Access-Control-Allow-Origin': "*"
    }
}

module.exports = {
    getResponseHeaders,
    getUserId,
    getUserName
}

auth = ['admin','admin']

exports.authRequest = (user, pass) => {
    if(user == auth[0]){
        if(pass == auth[1]){
            return true;
        }
    }

    return false

}
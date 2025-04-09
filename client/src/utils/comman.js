export const checkEmail = (email) => {
    const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

    if (!email || email.length === 0){
        return false;
    }

    if (!validRegex.test(email)){
        return false;
    }
    return true;
}

export const checkUsername = (username) => {
    const validRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[a-zA-Z0-9\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u;

    if (!username || username.length === 0) {
        return false;
    }

    if (!validRegex.test(username)) {
        return false;
    }
    
    return true;
};


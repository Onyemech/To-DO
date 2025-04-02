import axios from 'axios';

const SERVER_URL = "http://localhost:5000/api";

const registerUser = async (dto) => {
    try {
        const response = await axios.post(`${SERVER_URL}/register`, dto);
        return response.data;
    } catch (err) {
        throw err;
    }
};

const loginUser = (data)=>{
    return axios.post(SERVER_URL+ '/login',data);
}

const AuthServices = {
    registerUser,
    loginUser
}

export default AuthServices;
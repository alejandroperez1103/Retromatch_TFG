const API_URL = "http://localhost:8080/api/auth";

const login = async (email, password, codigoAdmin) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, codigoAdmin }),
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg);
    }
    
    const data = await response.json();
    
    // ¡NUEVO!: Si el backend nos da el token, lo guardamos en el navegador
    if (data.token) {
        localStorage.setItem('user', JSON.stringify(data));
    }
    
    return data; 
};

const registro = async (email, password) => {
    const response = await fetch(`${API_URL}/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
        const errorMsg = await response.text();
        throw new Error(errorMsg);
    }
    return response.text(); 
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) return JSON.parse(userStr);
    return null;
};

const authService = {
    login,
    registro,
    logout,
    getCurrentUser,
};

export default authService;
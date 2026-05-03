const API_URL = 'http://localhost:5000/api';

//Helper function to get auth token for protected routes
function getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
}
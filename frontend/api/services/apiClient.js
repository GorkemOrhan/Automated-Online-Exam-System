const apiClient = {
    get: (url) => {
        console.log(`GET request to ${url}`);
        return Promise.resolve({ data: "Fake Data" }); // Geçici sahte veri
    },
    post: (url, body) => {
        console.log(`POST request to ${url} with body:`, body);
        return Promise.resolve({ data: "Post Success" });
    }
};

export default apiClient;

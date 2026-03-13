// Cliente simples para chamar a API Flask

async function apiRequest(method, path, body) {
    const auth = getStoredAuth();
    if (!auth || !auth.access_token) {
        throw new Error("Usuário não autenticado.");
    }

    const baseUrl = window.API_BASE_URL || "http://localhost:5000/api";
    const url = baseUrl.replace(/\/$/, "") + path;

    const options = {
        method: method.toUpperCase(),
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.access_token,
        },
    };

    if (body !== undefined) {
        options.body = JSON.stringify(body);
    }

    const resp = await fetch(url, options);
    const data = await resp.json().catch(() => ({}));

    if (!resp.ok) {
        if (resp.status === 401) {
            // Sessão expirada
            window.localStorage.removeItem("gml_auth");
            window.location.href = "login.html";
        }
        const message = data.error || "Erro ao chamar a API.";
        throw new Error(message);
    }

    return data;
}

function apiGet(path) {
    return apiRequest("GET", path);
}

function apiPost(path, body) {
    return apiRequest("POST", path, body);
}


export async function queryChroma(query) {
    const response = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
    });
    if (!response.ok) {
        throw new Error(`Chroma query failed: ${response.status}`);
    }
    return response.json();
}
//# sourceMappingURL=chromaClient.js.map
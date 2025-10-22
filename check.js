export default async function handler(req, res) {
  // Permitir GET y POST (POST recomendado)
  const MAX_ITEMS = 20;

  // Obtener lista de valores: POST JSON { values: [...] } o GET ?values=a,b,c
  let values = [];
  if (req.method === "POST") {
    try {
      const body = await new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => (data += chunk));
        req.on("end", () => {
          try { resolve(JSON.parse(data || "{}")); }
          catch(e){ reject(e); }
        });
        req.on("error", reject);
      });
      if (body && Array.isArray(body.values)) values = body.values;
    } catch (err) {
      // si falla parseo, continuar para ver si hay GET
      values = [];
    }
  }
  if (!values || values.length === 0) {
    // intentar con GET ?values=a,b,c
    const q = (req.query && (req.query.values || req.query.value)) || "";
    if (typeof q === "string" && q.trim() !== "") {
      values = q.split(",").map(s => s.trim()).filter(Boolean);
    }
  }

  if (!Array.isArray(values) || values.length === 0) {
    return res.status(400).json({ ok: false, msg: "Envía un array 'values' (POST JSON) o ?values=a,b,c (GET)." });
  }

  if (values.length > MAX_ITEMS) {

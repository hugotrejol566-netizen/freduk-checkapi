export default async function handler(req, res) {
  let valores = [];
  if (req.method === "POST") {
    try {
      const body = await req.body;
      valores = body.values || [];
    } catch {
      return res.status(400).json({ ok: false, msg: "Error al leer cuerpo JSON" });
    }
  } else if (req.method === "GET") {
    const { value, valor } = req.query;
    const input = value || valor;
    if (!input) return res.status(400).json({ ok: false, msg: "Falta el parámetro 'value' o 'valor'" });
    valores = input.split(",");
  } else {
    return res.status(405).json({ ok: false, msg: "Método no permitido" });
  }

  if (valores.length === 0)
    return res.status(400).json({ ok: false, msg: "No se proporcionaron valores" });

  valores = valores.slice(0, 20);

  const resultados = valores.map((num) => {
    const limpio = num.replace(/\s+/g, "");
    const valido = /^[0-9]{13,19}$/.test(limpio);
    const luhn = valido && validarLuhn(limpio);
    return {
      input: limpio,
      luhn,
      resultado: luhn
        ? "✅ Tarjeta válida según Luhn"
        : "❌ Tarjeta inválida o formato incorrecto",
    };
  });

  return res.status(200).json({
    ok: true,
    total: resultados.length,
    resultados,
  });
}

function validarLuhn(num) {
  let suma = 0;
  let alternar = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = parseInt(num[i]);
    if (alternar) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    suma += n;
    alternar = !alternar;
  }
  return suma % 10 === 0;
}

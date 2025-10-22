export default function handler(req, res) {
  const { value } = req.query;

  // Si no hay parámetro 'value'
  if (!value) {
    return res.status(400).json({ ok: false, msg: "Falta el parámetro 'value'" });
  }

  // Si 'value' es una lista separada por comas (hasta 20 elementos)
  const values = value.split(",").slice(0, 20); // máximo 20

  // Función Luhn
  function luhnCheck(num) {
    const arr = (num + '')
      .split('')
      .reverse()
      .map(x => parseInt(x));
    const lastDigit = arr.shift();
    let sum = arr.reduce(
      (acc, val, i) => acc + (i % 2 === 0 ? ((val *= 2) > 9 ? val - 9 : val) : val),
      0
    );
    sum += lastDigit;
    return sum % 10 === 0;
  }

  // Procesar cada valor
  const resultados = values.map(input => {
    const limpio = input.trim();
    if (!/^\d{12,19}$/.test(limpio)) {
      return { input: limpio, valido: false, resultado: "❌ Formato no válido" };
    }

    const valido = luhnCheck(limpio);
    return {
      input: limpio,
      valido,
      resultado: valido ? "✅ Tarjeta válida según Luhn" : "❌ Tarjeta inválida",
    };
  });

  res.status(200).json({ ok: true, total: resultados.length, resultados });
}

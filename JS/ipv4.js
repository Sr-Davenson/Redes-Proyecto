function calcular() {
  const ip = document.getElementById("ip").value.trim();
  const cidrInput = document.getElementById("cidr").value.trim();
  let cidr = parseInt(cidrInput);

  if (!validarIP(ip)) {
    document.getElementById("resultados").innerHTML = "<p>⚠️ IP inválida.</p>";
    return;
  }

  // Si el campo está vacío o no es un número válido, asignar según clase
  if (cidrInput === "" || isNaN(cidr)) {
    const claseDetectada = obtenerClase(ip);
    if (claseDetectada === "A") cidr = 8;
    else if (claseDetectada === "B") cidr = 16;
    else if (claseDetectada === "C") cidr = 24;
    else cidr = 24; // por defecto para clases D/E
    document.getElementById("cidr").value = cidr; // actualizar visualmente
  }

  if (cidr < 1 || cidr > 32) {
    document.getElementById("resultados").innerHTML = "<p>⚠️ Máscara inválida.</p>";
    return;
  }

  const ipBin = ipToBin(ip);
  const maskBin = "1".repeat(cidr).padEnd(32, "0");
  const networkBin = ipBin.slice(0, cidr).padEnd(32, "0");
  const broadcastBin = ipBin.slice(0, cidr).padEnd(32, "1");

  const network = binToIp(networkBin);
  const broadcast = binToIp(broadcastBin);
  const totalHosts = Math.pow(2, 32 - cidr) - 2;
  const firstHost = binToIp(incrementBin(networkBin));
  const lastHost = binToIp(decrementBin(broadcastBin));
  const clase = obtenerClase(ip);
  const tipo = esPrivada(ip) ? "Privada" : "Pública";

  resultados.innerHTML = `
  <h3>Resultados</h3>
  <table>
    <tr><td><strong>Dirección IPv4:</strong></td><td>${ip}</td></tr>
    <tr><td><strong>Máscara de red:</strong></td><td>${cidrToDecimal(cidr)}</td></tr>
    <tr><td><strong>Máscara Wildcard:</strong></td><td>${cidrToWildcard(cidr)}</td></tr>
    <tr><td><strong>Dirección de red:</strong></td><td>${network}</td></tr>
    <tr><td><strong>Dirección del primer host:</strong></td><td>${firstHost}</td></tr>
    <tr><td><strong>Dirección del último host:</strong></td><td>${lastHost}</td></tr>
    <tr><td><strong>Dirección de difusión:</strong></td><td>${broadcast}</td></tr>
    <tr><td><strong>Número de direcciones asignables:</strong></td><td>${totalHosts}</td></tr>
    <tr><td><strong>Tipo de dirección IPv4:</strong></td><td>${tipo}, Clase ${clase}</td></tr>
  </table>
  ${visualizarBinario(ipBin, cidr, "IP en Binario")}
  ${visualizarBinario(maskBin, cidr, "Máscara en Binario")}
`;
}

function validarIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

function ipToBin(ip) {
  return ip.split('.').map(oct => parseInt(oct).toString(2).padStart(8, '0')).join('');
}

function binToIp(bin) {
  return [0,8,16,24].map(i => parseInt(bin.slice(i, i+8), 2)).join('.');
}

function incrementBin(bin) {
  return (BigInt('0b' + bin) + 1n).toString(2).padStart(32, '0');
}

function decrementBin(bin) {
  return (BigInt('0b' + bin) - 1n).toString(2).padStart(32, '0');
}

function obtenerClase(ip) {
  const primerOcteto = parseInt(ip.split('.')[0]);
  if (primerOcteto < 128) return "A";
  if (primerOcteto < 192) return "B";
  if (primerOcteto < 224) return "C";
  if (primerOcteto < 240) return "D";
  return "E";
}

function esPrivada(ip) {
  const [a,b] = ip.split('.').map(Number);
  return (
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168)
  );
}

function visualizarBinario(binStr, cidr, titulo) {
  let html = `<h3>${titulo}</h3><div>`;
  for (let i = 0; i < 32; i++) {
    const clase = i < cidr ? "red" : "host";
    html += `<span class="bit ${clase}">${binStr[i]}</span>`;
    if ((i + 1) % 8 === 0) html += " ";
  }
  html += "</div>";
  return html;
}

function cidrToDecimal(cidr) {
  const bin = "1".repeat(cidr).padEnd(32, "0");
  return [0,8,16,24].map(i => parseInt(bin.slice(i, i+8), 2)).join('.');
}

function cidrToWildcard(cidr) {
  const bin = "1".repeat(cidr).padEnd(32, "0");
  const wildcardBin = bin.split('').map(b => b === '1' ? '0' : '1').join('');
  return [0,8,16,24].map(i => parseInt(wildcardBin.slice(i, i+8), 2)).join('.');
}

document.addEventListener("DOMContentLoaded", () => {
  const ipInput = document.getElementById("ip");
  const cidrInput = document.getElementById("cidr");

  ipInput.addEventListener("blur", () => {
    const ip = ipInput.value.trim();
    const cidrActual = cidrInput.value.trim();

    if (!validarIP(ip)) return;

    // Solo autocompletar si el campo está vacío
    if (cidrActual === "") {
      const clase = obtenerClase(ip);
      let cidrPorDefecto = 24;
      if (clase === "A") cidrPorDefecto = 8;
      else if (clase === "B") cidrPorDefecto = 16;
      else if (clase === "C") cidrPorDefecto = 24;

      cidrInput.value = cidrPorDefecto;
    }
  });
});
document.addEventListener("DOMContentLoaded", () => {
  const ipInput = document.getElementById("ip");
  const cidrInput = document.getElementById("cidr");

  ipInput.addEventListener("input", () => {
    const ip = ipInput.value.trim();

    if (!validarIP(ip)) return;

    // Solo actualizar si el campo de máscara está vacío o fue autocompletado
    const cidrActual = cidrInput.value.trim();
    const claseDetectada = obtenerClase(ip);

    let cidrPorDefecto = 24;
    if (claseDetectada === "A") cidrPorDefecto = 8;
    else if (claseDetectada === "B") cidrPorDefecto = 16;
    else if (claseDetectada === "C") cidrPorDefecto = 24;

    // Si el campo está vacío o coincide con el valor anterior, actualiza
    if (cidrActual === "" || cidrActual === "8" || cidrActual === "16" || cidrActual === "24") {
      cidrInput.value = cidrPorDefecto;
    }
  });
});
// app.js
function calcular() {
  const ip = document.getElementById("ip").value.trim();
  const cidr = parseInt(document.getElementById("cidr").value);
  const resultados = document.getElementById("resultados");

  if (!validarIP(ip) || cidr < 1 || cidr > 32) {
    resultados.innerHTML = "<p>⚠️ IP o máscara inválida.</p>";
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

  resultados.innerHTML = `
  <h3>Resultados</h3>
  <p><strong>IP:</strong> ${ip}/${cidr}</p>
  <p><strong>Dirección de red:</strong> ${network}</p>
  <p><strong>Broadcast:</strong> ${broadcast}</p>
  <p><strong>Rango de hosts:</strong> ${firstHost} - ${lastHost}</p>
  <p><strong>Total de hosts:</strong> ${totalHosts}</p>
  ${visualizarBinario(ip, cidr)}
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

function visualizarBinario(ip, cidr) {
  const ipBin = ipToBin(ip);
  let html = "<h3>Visualización Binaria</h3><div style='font-family: monospace;'>";

  for (let i = 0; i < 32; i++) {
    const bit = ipBin[i];
    const color = i < cidr ? "#4CAF50" : "#F44336"; // verde para red, rojo para host
    html += `<span style="color:${color}; font-weight:bold;">${bit}</span>`;
    if ((i + 1) % 8 === 0) html += " "; // espacio entre octetos
  }

  html += "</div>";
  return html;
}
document.addEventListener("DOMContentLoaded", () => {
  const ipInput = document.getElementById("ip");
  const prefijoInput = document.getElementById("prefijo");
  const cantidadInput = document.getElementById("cantidad");
  const tablaSubredes = document.getElementById("tablaSubredes");

  ipInput.addEventListener("input", () => {
    const ip = ipInput.value.trim();
    if (!validarIP(ip)) return;

    const clase = obtenerClase(ip);
    let cidr = 24;
    if (clase === "A") cidr = 8;
    else if (clase === "B") cidr = 16;
    else if (clase === "C") cidr = 24;

    prefijoInput.value = cidr;
  });

  cantidadInput.addEventListener("input", () => {
    const cantidad = parseInt(cantidadInput.value);
    tablaSubredes.innerHTML = "";

    if (isNaN(cantidad) || cantidad < 1) return;

    let html = "<h3>Subredes</h3><table><tr><th>Subred</th><th>Número de Hosts</th></tr>";
    for (let i = 1; i <= cantidad; i++) {
      html += `<tr>
        <td>Subred ${i}</td>
        <td><input type="number" min="1" id="hosts${i}" placeholder="Ej: 50"></td>
      </tr>`;
    }
    html += "</table>";
    tablaSubredes.innerHTML = html;
  });
});

function validarIP(ip) {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(ip);
}

function obtenerClase(ip) {
  const primerOcteto = parseInt(ip.split('.')[0]);
  if (primerOcteto < 128) return "A";
  if (primerOcteto < 192) return "B";
  if (primerOcteto < 224) return "C";
  if (primerOcteto < 240) return "D";
  return "E";
}

function ipToBin(ip) {
  return ip.split('.').map(oct => parseInt(oct).toString(2).padStart(8, '0')).join('');
}

function binToIp(bin) {
  return [0,8,16,24].map(i => parseInt(bin.slice(i, i+8), 2)).join('.');
}

function cidrToDecimal(cidr) {
  const bin = "1".repeat(cidr).padEnd(32, "0");
  return bin.match(/.{1,8}/g).map(oct => parseInt(oct, 2)).join('.');
}

function calcularVLSM() {
  const ip = document.getElementById("ip").value.trim();
  const cidrBase = parseInt(document.getElementById("prefijo").value.trim());
  const cantidad = parseInt(document.getElementById("cantidad").value.trim());

  if (!validarIP(ip) || isNaN(cidrBase) || cidrBase < 1 || cidrBase > 32 || isNaN(cantidad) || cantidad < 1) {
    alert("⚠️ Verifica que la IP, prefijo y cantidad de subredes sean válidos.");
    return;
  }

  const baseBin = ipToBin(ip).slice(0, cidrBase);
  let cursor = BigInt("0b" + baseBin.padEnd(32, '0'));

  const necesidades = [];
  for (let i = 1; i <= cantidad; i++) {
    const valor = parseInt(document.getElementById(`hosts${i}`).value.trim());
    if (!isNaN(valor) && valor > 0) {
      necesidades.push({ id: i, hosts: valor });
    }
  }
  

  necesidades.sort((a, b) => b.hosts - a.hosts);

  const totalHostsSolicitados = necesidades.reduce((sum, s) => sum + s.hosts, 0);
  const totalDireccionesRequeridas = totalHostsSolicitados + (2 * necesidades.length);
  const bitsDisponibles = 32 - cidrBase;
  const totalDireccionesDisponibles = Math.pow(2, bitsDisponibles);

  const ipBaseDecimal = ip;
  const ipBaseBin = ipToBin(ip);
  const redDecimal = binToIp(ipBaseBin.slice(0, cidrBase).padEnd(32, '0'));
  const broadcastDecimal = binToIp(ipBaseBin.slice(0, cidrBase).padEnd(32, '1'));
  const mascaraDecimal = cidrToDecimal(cidrBase);

  let resumen = `
    <h3>Resumen de la red</h3>
    <ul>
      <li><strong>Número total de hosts solicitados:</strong> ${totalHostsSolicitados}</li>
      <li><strong>Número de direcciones requeridas:</strong> ${totalDireccionesRequeridas}</li>
      <li><strong>Número de bits disponibles:</strong> ${bitsDisponibles}</li>
      <li><strong>Número total de direcciones disponibles:</strong> ${totalDireccionesDisponibles}</li>
      <li><strong>Dirección IP base:</strong> ${ipBaseDecimal}</li>
      <li><strong>Dirección en red:</strong> ${redDecimal}</li>
      <li><strong>Máscara de red:</strong> ${mascaraDecimal}</li>
      <li><strong>Dirección de Broadcast:</strong> ${broadcastDecimal}</li>
    </ul>
  `;

  let resultados = "<h3>Subredes calculadas</h3><table><tr><th>Subred</th><th>Nº de Hosts</th><th>IP de red</th><th>Máscara</th><th>Primer Host</th><th>Último Host</th><th>Broadcast</th></tr>";

  necesidades.forEach((subred) => {
    const bitsHost = Math.ceil(Math.log2(subred.hosts + 2));
    const cidr = 32 - bitsHost;
    const networkBin = cursor.toString(2).padStart(32, '0');
    const broadcastBin = cursor + BigInt(2 ** bitsHost - 1);
    const network = binToIp(networkBin);
    const broadcast = binToIp(broadcastBin.toString(2).padStart(32, '0'));
    const firstHost = binToIp((cursor + 1n).toString(2).padStart(32, '0'));
    const lastHost = binToIp((broadcastBin - 1n).toString(2).padStart(32, '0'));

    resultados += `<tr>
  <td>Subred ${subred.id}</td>
  <td>${subred.hosts}</td>
  <td>${network}</td>
  <td>${cidrToDecimal(cidr)}</td>
  <td>${firstHost}</td>
  <td>${lastHost}</td>
  <td>${broadcast}</td>
</tr>`;

    cursor = broadcastBin + 1n;
  });

  resultados += "</table>";
  document.getElementById("vlsmResultados").innerHTML = resumen + resultados;
}
function verExplicacion() {
  const ip = document.getElementById("ip").value.trim();
  const cidrBase = parseInt(document.getElementById("prefijo").value.trim());
  const cantidad = parseInt(document.getElementById("cantidad").value.trim());

  if (!validarIP(ip) || isNaN(cidrBase) || cidrBase < 1 || cidrBase > 32 || isNaN(cantidad) || cantidad < 1) {
    alert("⚠️ Primero completa los datos de red.");
    return;
  }

  const necesidades = [];
  for (let i = 1; i <= cantidad; i++) {
    const valor = parseInt(document.getElementById(`hosts${i}`).value.trim());
    if (!isNaN(valor) && valor > 0) {
      necesidades.push({ id: i, hosts: valor });
    }
  }

  localStorage.setItem("vlsmData", JSON.stringify({
    ip,
    cidrBase,
    necesidades
  }));

  window.location.href = "explicacionVLSM.html";
}
async function exportarPDF() {
  const { jsPDF } = window.jspdf;

  // Seleccionamos la tabla de resultados
  const resultados = document.getElementById("vlsmResultados");

  if (!resultados || resultados.innerHTML.trim() === "") {
    alert("Primero genera las subredes con el botón CALCULAR.");
    return;
  }

  // Convertimos la tabla en imagen usando html2canvas
  const canvas = await html2canvas(resultados);
  const imgData = canvas.toDataURL("image/png");

  // Creamos el PDF
  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();

  const imgWidth = pageWidth - 20;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);

  pdf.save("subredes_vlsm.pdf");
}

